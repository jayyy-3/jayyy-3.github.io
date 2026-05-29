#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { cwd, env, exit } from 'node:process';
import { join } from 'node:path';
import { firefox } from 'playwright';

const root = cwd();
const host = env.ADMIN_AUTH_BROWSER_HOST ?? '127.0.0.1';
const port = env.ADMIN_AUTH_BROWSER_PORT ?? '4193';
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

const args = parseArgs(process.argv.slice(2));
let serverProcess = null;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
});

async function main() {
  const readiness = getReadiness();

  if (!args.allowLogin || readiness.missing.length > 0) {
    printPlan(readiness);
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
      screenshotsDir: join(root, screenshotsDir),
      email: readiness.email,
      password: readiness.password,
    });
  } finally {
    await stopPreview();
  }

  console.log(`Admin auth browser check passed for ${routeChecks.length} authenticated routes.`);
  console.log(`Screenshots written to ${screenshotsDir}.`);
}

function parseArgs(rawArgs) {
  const parsed = {
    allowLogin: false,
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
    if (arg === '--base-url') {
      parsed.baseUrl = stripTrailingSlash(rawArgs[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--screenshots-dir') {
      parsed.screenshotsDir = rawArgs[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function getReadiness() {
  const browserKeyName = env.VITE_SUPABASE_PUBLISHABLE_KEY
    ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
    : env.VITE_SUPABASE_ANON_KEY
      ? 'VITE_SUPABASE_ANON_KEY'
      : '';

  const missing = [
    env.VITE_SUPABASE_URL ? '' : 'VITE_SUPABASE_URL',
    browserKeyName ? '' : 'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
    env.URBLO_ADMIN_EMAIL ? '' : 'URBLO_ADMIN_EMAIL',
    env.URBLO_ADMIN_PASSWORD ? '' : 'URBLO_ADMIN_PASSWORD',
  ].filter(Boolean);

  return {
    browserKeyName,
    email: env.URBLO_ADMIN_EMAIL ?? '',
    missing,
    password: env.URBLO_ADMIN_PASSWORD ?? '',
  };
}

function printPlan(readiness) {
  console.log('Admin auth browser check is plan-only.');
  console.log('No Supabase login was attempted and no live content/admin rows were changed.');
  console.log('');
  console.log('To run the no-write browser login check:');
  console.log('  npm run agent:admin-auth-browser -- --allow-login --strict');
  console.log('');
  console.log('Required shell or local env values:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY');
  console.log('- URBLO_ADMIN_EMAIL');
  console.log('- URBLO_ADMIN_PASSWORD');
  console.log('');
  if (!args.allowLogin) {
    console.log('manual: --allow-login is required before the script signs in to Supabase Auth.');
  }
  if (readiness.missing.length > 0) {
    console.log(`missing: ${readiness.missing.join('; ')}`);
  }
  if (readiness.browserKeyName) {
    console.log(`present: ${readiness.browserKeyName}`);
  }
}

function startPreview() {
  console.log(`Starting Vite preview on http://${host}:${port}`);
  const child = spawn(
    'npx',
    ['vite', 'preview', '--host', host, '--port', port, '--strictPort'],
    {
      cwd: root,
      env,
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

async function runBrowserCheck({ baseUrl, screenshotsDir, email, password }) {
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

    await waitForAuthenticatedRoute(page, 'Media Library');

    for (const route of routeChecks) {
      await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
      await waitForHeading(page, route.expectedHeading, route.path);
      for (const text of forbiddenAuthenticatedText) {
        await assertNoText(page, text);
      }
      await page.screenshot({ path: `${screenshotsDir}/${route.slug}.png`, fullPage: true });
    }

    if (consoleErrors.length > 0) {
      throw new Error(`Console/page errors detected: ${consoleErrors.join(' | ')}`);
    }
  } finally {
    await browser.close();
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

async function firstVisibleText(page, candidates) {
  for (const text of candidates) {
    if (await page.getByText(text, { exact: false }).first().isVisible().catch(() => false)) {
      return text;
    }
  }
  return '';
}

function stripTrailingSlash(value) {
  if (!value) {
    throw new Error('--base-url requires a value');
  }
  return value.replace(/\/$/, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
