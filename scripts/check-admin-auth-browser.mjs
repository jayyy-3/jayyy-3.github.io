#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
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
  { path: '/admin/audit', slug: 'admin-audit', expectedHeading: 'Audit' },
];

const forbiddenAuthenticatedText = [
  'Configuration required',
  'Admin auth is not connected yet',
  'This account is not an active Urblo admin',
  'Admin login',
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
  'Audit',
];

const unauthorizedRouteProbes = [
  { path: '/admin', slug: 'unauthorized-admin' },
  { path: '/admin/leads', slug: 'unauthorized-leads' },
  { path: '/admin/settings', slug: 'unauthorized-settings' },
];

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

  try {
    if (!args.baseUrl) {
      if (!existsSync(join(root, 'dist'))) {
        throw new Error('dist/ not found. Run npm run build before npm run agent:admin-auth-browser -- --allow-login.');
      }
      serverProcess = startPreview();
      await waitForServer(baseUrl);
    } else {
      await waitForServer(baseUrl);
    }

    await rm(join(root, '.tmp/admin-auth-browser'), { recursive: true, force: true });
    await mkdir(join(root, screenshotsDir), { recursive: true });

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

function startPreview() {
  console.log(`Starting Vite preview on http://${host}:${port}`);
  const child = spawn(
    'npx',
    ['vite', 'preview', '--host', host, '--port', port, '--strictPort'],
    {
      cwd: root,
      env: runtimeEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  return child;
}

async function stopPreview() {
  if (!serverProcess) return;
  serverProcess.kill('SIGTERM');
  await new Promise((resolve) => {
    serverProcess.once('exit', resolve);
    setTimeout(resolve, 500);
  });
  serverProcess = null;
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error(`Preview did not respond at ${baseUrl}.`);
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
    await page.goto(new URL('/admin/media', baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await waitForText(page, 'Admin login', 'unauthenticated admin login screen');
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
      await page.screenshot({ path: `${screenshotsDir}/${route.slug}.png`, fullPage: true });
    }

    await page.getByRole('button', { name: /sign out/i }).click();
    await waitForSignedOutRoute(page, '/admin/audit');
    await assertNoText(page, 'Audit events');
    await page.screenshot({ path: `${screenshotsDir}/signed-out.png`, fullPage: true });

    if (consoleErrors.length > 0) {
      throw new Error(`Console/page errors detected: ${consoleErrors.join(' | ')}`);
    }
  } finally {
    await browser.close();
  }
}

async function waitForUnauthorizedRoute(page) {
  try {
    await waitForText(page, 'This account is not an active Urblo admin', 'unauthorized admin route', 30000);
  } catch (error) {
    const visibleFailure = await firstVisibleText(page, [
      'Invalid login credentials',
      'Configuration required',
      'Admin auth is not connected yet',
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
      'Admin auth is not connected yet',
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
    await waitForText(page, 'Admin login', 'signed-out admin login screen', 30000);
  } catch (error) {
    const visibleFailure = await firstVisibleText(page, [
      'Configuration required',
      'This account is not an active Urblo admin',
      'Admin access could not be verified',
      'Audit',
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

async function assertNoText(page, text) {
  const count = await page.getByText(text, { exact: false }).count();
  if (count > 0) {
    throw new Error(`Unexpected text is visible in the admin browser check: ${text}`);
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
