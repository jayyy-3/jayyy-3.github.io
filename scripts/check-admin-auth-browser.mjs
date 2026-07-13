#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { cwd, env as processEnv, exit } from 'node:process';
import { join } from 'node:path';
import { firefox } from 'playwright';
import { isValidEmail, normalizeBaseUrlOrigin } from './_lib/live-input-validation.mjs';

const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const root = cwd();
const defaultScreenshotsDir = '.tmp/admin-auth-browser/screenshots';

const routeChecks = [
  { path: '/admin', slug: 'admin', expectedHeading: 'Dashboard' },
  { path: '/admin/leads', slug: 'admin-leads', expectedHeading: 'Leads' },
  { path: '/admin/media', slug: 'admin-media', expectedHeading: 'Media Library' },
  { path: '/admin/settings', slug: 'admin-settings', expectedHeading: 'Site Settings' },
  { path: '/admin/stone-library', slug: 'admin-stone-library', expectedHeading: 'Stone Library' },
  { path: '/admin/projects', slug: 'admin-projects', expectedHeading: 'Projects' },
  { path: '/admin/products', slug: 'admin-products', expectedHeading: 'Products' },
  { path: '/admin/articles', slug: 'admin-articles', expectedHeading: 'Articles' },
  { path: '/admin/audit', slug: 'admin-audit', expectedHeading: 'Change history' },
];

const forbiddenAuthenticatedText = [
  'Configuration required',
  'CMS access is not connected yet',
  'This account is not an active Urblo admin',
];

const forbiddenUnauthorizedText = [
  'Dashboard',
  'Leads',
  'Media Library',
  'Site Settings',
  'Stone Library',
  'Projects',
  'Products',
  'Articles',
  'Change history',
];

const unauthorizedRouteProbes = routeChecks.map((route) => {
  const shortSlug = route.slug.replace(/^admin-?/, '') || 'admin';
  return { path: route.path, slug: `unauthorized-${shortSlug}` };
});

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
}
const loadedEnvironment = loadEnv(args.envFiles);
const runtimeEnv = loadedEnvironment.env;
const host = runtimeEnv.ADMIN_AUTH_BROWSER_HOST ?? '127.0.0.1';
const port = runtimeEnv.ADMIN_AUTH_BROWSER_PORT ?? '4193';
let serverProcess = null;
let serverStartupError = null;
let serverReady = false;
let expectedEntryAsset = null;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
});

async function main() {
  const readiness = getReadiness(runtimeEnv, loadedEnvironment.sources);

  if (!args.allowLogin || readiness.missing.length > 0) {
    printPlan(readiness, loadedEnvironment.scannedFiles);
    if (args.strict) {
      throw new Error('Admin auth browser check is not runnable in strict mode.');
    }
    return;
  }

  const screenshotsDir = args.screenshotsDir ?? defaultScreenshotsDir;
  const baseUrl = args.baseUrl ?? `http://${host}:${port}`;
  const gateRoot = join(root, '.tmp/admin-auth-browser');
  const isolatedDistDir = join(gateRoot, 'dist');

  try {
    await rm(gateRoot, { recursive: true, force: true });
    await mkdir(gateRoot, { recursive: true });
    await mkdir(join(root, screenshotsDir), { recursive: true });

    if (!args.baseUrl) {
      const buildResult = await runCommand(
        'npx',
        ['vite', 'build', '--outDir', isolatedDistDir, '--emptyOutDir'],
        {
          VITE_SUPABASE_URL: runtimeEnv.VITE_SUPABASE_URL ?? '',
          VITE_SUPABASE_PUBLISHABLE_KEY: runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
          VITE_SUPABASE_ANON_KEY: runtimeEnv.VITE_SUPABASE_ANON_KEY ?? '',
        },
      );
      if (buildResult !== 0) {
        throw new Error(`Admin auth browser isolated build failed with exit code ${buildResult}.`);
      }
      expectedEntryAsset = assertConfiguredBundleBoundary(isolatedDistDir);
      serverProcess = startPreview(isolatedDistDir);
      await waitForServer(baseUrl);
    } else {
      await waitForServer(baseUrl);
    }

    await runBrowserCheck({
      baseUrl,
      expectUnauthorized: args.expectUnauthorized,
      screenshotsDir: join(root, screenshotsDir),
      email: readiness.email,
      password: readiness.password,
    });
  } finally {
    await stopPreview();
  }

  console.log(
    args.expectUnauthorized
      ? 'Admin auth browser unauthorized-profile check passed.'
      : `Admin auth browser check passed for ${routeChecks.length} authenticated routes.`,
  );
  console.log(`Screenshots written to ${screenshotsDir}.`);
}

function parseArgs(rawArgs) {
  const parsed = {
    allowLogin: false,
    envFiles: [...DEFAULT_ENV_FILES],
    strict: false,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === '--allow-login') {
      parsed.allowLogin = true;
      continue;
    }
    if (arg === '--strict') {
      parsed.strict = true;
      continue;
    }
    if (arg === '--expect-unauthorized') {
      parsed.expectUnauthorized = true;
      continue;
    }
    if (arg === '--base-url') {
      parsed.baseUrl = normalizeBaseUrlOrigin(rawArgs[index + 1] || '', '--base-url');
      index += 1;
      continue;
    }
    if (arg === '--screenshots-dir') {
      parsed.screenshotsDir = rawArgs[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--env-file') {
      parsed.envFiles.push(rawArgs[index + 1] || '');
      index += 1;
      continue;
    }
    if (arg.startsWith('--env-file=')) {
      parsed.envFiles.push(arg.slice('--env-file='.length));
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  parsed.envFiles = [...new Set(parsed.envFiles.filter(Boolean))];
  return parsed;
}

function parseEnvFile(path) {
  if (!existsSync(path)) return {};

  const parsed = {};
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value) parsed[match[1]] = value;
  }

  return parsed;
}

function loadEnv(envFiles) {
  const loadedEnv = {};
  const sources = {};
  const scannedFiles = [];

  for (const file of envFiles) {
    if (!existsSync(file)) continue;
    scannedFiles.push(file);
    for (const [key, value] of Object.entries(parseEnvFile(file))) {
      loadedEnv[key] = value;
      sources[key] = file;
    }
  }

  for (const [key, value] of Object.entries(processEnv)) {
    if (typeof value !== 'string' || !value) continue;
    loadedEnv[key] = value;
    sources[key] = 'shell';
  }

  return { env: loadedEnv, scannedFiles, sources };
}

function describeSource(name, sources) {
  return name ? `${name} (${sources[name] || 'unknown source'})` : '';
}

function getReadiness(currentEnv, sources) {
  const browserKeyName = currentEnv.VITE_SUPABASE_PUBLISHABLE_KEY
    ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
    : currentEnv.VITE_SUPABASE_ANON_KEY
      ? 'VITE_SUPABASE_ANON_KEY'
      : '';
  const emailName = args.expectUnauthorized ? 'URBLO_UNPROFILED_EMAIL' : 'URBLO_ADMIN_EMAIL';
  const passwordName = args.expectUnauthorized ? 'URBLO_UNPROFILED_PASSWORD' : 'URBLO_ADMIN_PASSWORD';
  const email = currentEnv[emailName] ?? '';

  const missing = [
    browserKeyName ? '' : 'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
    isValidEmail(email) ? '' : `valid ${emailName}`,
    currentEnv[passwordName] ? '' : passwordName,
  ].filter(Boolean);

  return {
    browserKeyName,
    email,
    emailName,
    missing,
    password: currentEnv[passwordName] ?? '',
    passwordName,
    present: [
      describeSource(currentEnv.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL' : '', sources),
      describeSource(browserKeyName, sources),
      describeSource(currentEnv[emailName] ? emailName : '', sources),
      describeSource(currentEnv[passwordName] ? passwordName : '', sources),
    ].filter(Boolean),
  };
}

function printPlan(readiness, scannedFiles) {
  console.log('Admin auth browser check is plan-only.');
  console.log('No Supabase login was attempted and no live content/admin rows were changed.');
  console.log(`Environment files scanned: ${scannedFiles.length > 0 ? scannedFiles.join(', ') : 'none found'}`);
  console.log('Secrets are never printed; only variable names and sources are reported.');
  console.log('');
  console.log(
    args.expectUnauthorized
      ? 'To run the no-write unauthorized-profile browser check:'
      : 'To run the no-write browser login check:',
  );
  console.log(
    args.expectUnauthorized
      ? '  npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict'
      : '  npm run agent:admin-auth-browser -- --allow-login --strict',
  );
  console.log('');
  console.log('Required shell or local env values:');
  console.log('- VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY');
  console.log(`- ${readiness.emailName}`);
  console.log(`- ${readiness.passwordName}`);
  console.log('');
  console.log('Optional: VITE_SUPABASE_URL can override the default Urblo Supabase project URL.');
  if (args.expectUnauthorized) {
    console.log('The supplied account must have a valid Supabase Auth session but no active admin_profiles row.');
  }
  console.log('');
  if (!args.allowLogin) {
    console.log('manual: --allow-login is required before the script signs in to Supabase Auth.');
  }
  if (readiness.missing.length > 0) {
    console.log(`missing: ${readiness.missing.join('; ')}`);
  }
  if (readiness.present.length > 0) {
    console.log(`present: ${readiness.present.join(', ')}`);
  }
}

function startPreview(outDir) {
  console.log(`Starting Vite preview on http://${host}:${port}`);
  const child = spawn(
    'npx',
    ['vite', 'preview', '--host', host, '--port', port, '--strictPort', '--outDir', outDir],
    {
      cwd: root,
      env: runtimeEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    if (text.includes('Local:')) serverReady = true;
    process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  child.once('error', (error) => {
    serverStartupError = error;
  });
  child.once('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      serverStartupError = new Error(`Vite preview exited with code ${code}.`);
    } else if (signal && signal !== 'SIGTERM') {
      serverStartupError = new Error(`Vite preview exited from signal ${signal}.`);
    }
  });

  return child;
}

async function stopPreview() {
  if (!serverProcess) return;
  const child = serverProcess;
  child.kill('SIGTERM');
  await new Promise((resolve) => {
    child.once('exit', resolve);
    setTimeout(resolve, 500);
  });
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
    await new Promise((resolve) => {
      child.once('exit', resolve);
      setTimeout(resolve, 500);
    });
  }
  serverProcess = null;
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (serverStartupError) {
      throw new Error(`Preview failed to start: ${serverStartupError.message}`);
    }
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok && (!serverProcess || serverReady)) {
        if (!expectedEntryAsset) return;
        const html = await response.text();
        if (html.includes(`src="/${expectedEntryAsset}"`)) return;
      }
    } catch {
      // Retry until the preview process reports readiness or the attempt budget expires.
    }
    await sleep(250);
  }
  throw new Error(`Preview did not respond at ${baseUrl}.`);
}

async function runCommand(command, commandArgs, extraEnv) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (code) => {
      if (settled) return;
      settled = true;
      resolve(code);
    };
    const child = spawn(command, commandArgs, {
      cwd: root,
      env: { ...processEnv, ...extraEnv },
      stdio: 'inherit',
    });
    child.once('error', () => finish(1));
    child.once('exit', (code) => finish(code ?? 1));
  });
}

function assertConfiguredBundleBoundary(outDir) {
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  const entryMatch = /<script[^>]+src="\/(assets\/index-[^"]+\.js)"/.exec(html);
  if (!entryMatch) {
    throw new Error('Configured admin build did not expose the expected hashed entry script.');
  }

  const entryBytes = statSync(join(outDir, entryMatch[1])).size;
  if (entryBytes > 500_000) {
    throw new Error(`Configured entry bundle exceeds 500000 bytes: ${entryBytes}.`);
  }

  if (/rel="modulepreload"[^>]+supabase-|supabase-[^>]+rel="modulepreload"/.test(html)) {
    throw new Error('Configured build eagerly module-preloads the Supabase vendor chunk.');
  }

  console.log(`Configured entry bundle boundary passed (${entryBytes} bytes; Supabase is not module-preloaded).`);
  return entryMatch[1];
}

async function runBrowserCheck({ baseUrl, expectUnauthorized, screenshotsDir, email, password }) {
  const browser = await firefox.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  try {
    await verifyStaticFallbackWithoutSupabase(browser, baseUrl, screenshotsDir);

    await page.goto(new URL('/admin/media', baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await waitForTestId(page, 'admin-login-form', 'unauthenticated admin login screen');
    assertAdminLoginUrl(page.url(), '/admin/media');
    await assertNoText(page, 'Configuration required');
    await assertNoText(page, 'Media Library');
    await page.screenshot({ path: `${screenshotsDir}/login.png`, fullPage: true });

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    if (expectUnauthorized) {
      await waitForUnauthorizedRoute(page);
      await assertNoPrivateAdminText(page);
      await page.screenshot({ path: `${screenshotsDir}/unauthorized-profile.png`, fullPage: true });
      for (const route of unauthorizedRouteProbes) {
        await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
        await waitForUnauthorizedRoute(page);
        await assertNoPrivateAdminText(page);
        await page.screenshot({ path: `${screenshotsDir}/${route.slug}.png`, fullPage: true });
      }
      if (consoleErrors.length > 0) {
        throw new Error(`Console/page errors detected: ${consoleErrors.join(' | ')}`);
      }
      return;
    }

    await waitForAuthenticatedRoute(page, 'Media Library');

    for (const route of routeChecks) {
      await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
      await waitForHeading(page, route.expectedHeading, route.path);
      for (const text of forbiddenAuthenticatedText) {
        await assertNoText(page, text);
      }
      await assertNoTestId(page, 'admin-login-form');
      await page.screenshot({ path: `${screenshotsDir}/${route.slug}.png`, fullPage: true });
    }

    await page.getByRole('button', { name: /sign out/i }).click();
    await waitForSignedOutRoute(page, '/admin/audit');
    await assertNoText(page, 'Change history');
    await page.screenshot({ path: `${screenshotsDir}/signed-out.png`, fullPage: true });

    await page.goto(new URL('/admin/media', baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await waitForSignedOutRoute(page, '/admin/media');
    await assertNoText(page, 'Media Library');
    await page.screenshot({ path: `${screenshotsDir}/signed-out-protected-route.png`, fullPage: true });

    if (consoleErrors.length > 0) {
      throw new Error(`Console/page errors detected: ${consoleErrors.join(' | ')}`);
    }
  } finally {
    await browser.close();
  }
}

async function verifyStaticFallbackWithoutSupabase(browser, baseUrl, screenshotsDir) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  let blockedSupabaseChunks = 0;

  await page.route('**/assets/supabase-*.js', async (route) => {
    blockedSupabaseChunks += 1;
    await route.abort();
  });

  try {
    const fallbackChecks = [
      { path: '/products', text: 'Prime Block', slug: 'fallback-products' },
      { path: '/projects', text: 'Australian Catholic University', slug: 'fallback-projects' },
      {
        path: '/articles',
        text: 'Curving the Future: Greening the Pipeline’s Sustainable Legacy',
        slug: 'fallback-articles',
      },
    ];

    for (const check of fallbackChecks) {
      await page.goto(new URL(check.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
      await waitForText(page, check.text, `${check.path} static fallback`, 30000);
      await page.screenshot({ path: `${screenshotsDir}/${check.slug}.png`, fullPage: true });
    }

    if (blockedSupabaseChunks < fallbackChecks.length) {
      throw new Error(
        `Expected a blocked Supabase chunk request for each public fallback route; observed ${blockedSupabaseChunks}.`,
      );
    }
    console.log(`Static public fallback passed with ${blockedSupabaseChunks} blocked Supabase chunk requests.`);
  } finally {
    await context.close();
  }
}

async function waitForUnauthorizedRoute(page) {
  try {
    await waitForText(page, 'This account is not an active Urblo admin', 'unauthorized admin route', 30000);
  } catch (error) {
    const visibleFailure = await firstVisibleText(page, [
      'Invalid login credentials',
      'Configuration required',
      'CMS access is not connected yet',
      'Admin access could not be verified',
      'Media Library',
      'Dashboard',
    ]);
    throw new Error(
      visibleFailure
        ? `Unprofiled admin login did not reach the unauthorized shell: ${visibleFailure}`
        : error instanceof Error
          ? error.message
          : 'Unprofiled admin login did not reach the unauthorized shell.',
    );
  }

  const parsed = new URL(page.url());
  if (parsed.pathname !== '/admin/unauthorized') {
    throw new Error(`Expected unprofiled account to land on /admin/unauthorized, got ${parsed.pathname}.`);
  }
}

function assertAdminLoginUrl(url, expectedNext) {
  const parsed = new URL(url);
  if (parsed.pathname !== '/admin/login') {
    throw new Error(`Expected unauthenticated admin route to redirect to /admin/login, got ${parsed.pathname}.`);
  }
  if (parsed.searchParams.get('next') !== expectedNext) {
    throw new Error(`Expected login next target ${expectedNext}, got ${parsed.searchParams.get('next') ?? 'none'}.`);
  }
}

async function waitForAuthenticatedRoute(page, expectedText) {
  try {
    await waitForHeading(page, expectedText, 'authenticated admin route', 30000);
  } catch (error) {
    const visibleFailure = await firstVisibleText(page, [
      'This account is not an active Urblo admin',
      'Invalid login credentials',
      'Configuration required',
      'CMS access is not connected yet',
      'Admin access could not be verified',
    ]);
    throw new Error(
      visibleFailure
        ? `Admin login did not reach the authenticated shell: ${visibleFailure}`
        : error instanceof Error
          ? error.message
          : 'Admin login did not reach the authenticated shell.',
    );
  }
}

async function waitForSignedOutRoute(page, expectedNext) {
  try {
    await waitForTestId(page, 'admin-login-form', 'signed-out admin login screen', 30000);
  } catch (error) {
    const visibleFailure = await firstVisibleText(page, [
      'Configuration required',
      'This account is not an active Urblo admin',
      'Admin access could not be verified',
      'Change history',
      'Dashboard',
    ]);
    throw new Error(
      visibleFailure
        ? `Admin sign-out did not return to the login shell: ${visibleFailure}`
        : error instanceof Error
          ? error.message
          : 'Admin sign-out did not return to the login shell.',
    );
  }

  assertAdminLoginUrl(page.url(), expectedNext);
}

async function waitForText(page, text, label, timeout = 15000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout }).catch(() => {
    throw new Error(`Expected visible text "${text}" for ${label}.`);
  });
}

async function waitForHeading(page, text, label, timeout = 15000) {
  await page.getByRole('heading', { name: text, exact: true }).first().waitFor({ state: 'visible', timeout }).catch(() => {
    throw new Error(`Expected visible heading "${text}" for ${label}.`);
  });
}

async function waitForTestId(page, testId, label, timeout = 15000) {
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout }).catch(() => {
    throw new Error(`Expected visible test id "${testId}" for ${label}.`);
  });
}

async function assertNoText(page, text) {
  const count = await page.getByText(text, { exact: false }).count();
  if (count > 0) {
    throw new Error(`Unexpected text is visible in the admin browser check: ${text}`);
  }
}

async function assertNoTestId(page, testId) {
  const count = await page.getByTestId(testId).count();
  if (count > 0) {
    throw new Error(`Unexpected admin browser element is present: ${testId}`);
  }
}

async function assertNoPrivateAdminText(page) {
  for (const text of forbiddenUnauthorizedText) {
    await assertNoText(page, text);
  }
}

async function firstVisibleText(page, candidates) {
  for (const text of candidates) {
    if (await page.getByText(text, { exact: false }).first().isVisible().catch(() => false)) {
      return text;
    }
  }
  return '';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
