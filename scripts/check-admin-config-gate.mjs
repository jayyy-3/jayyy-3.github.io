#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { cwd, env, exit } from 'node:process';
import { join } from 'node:path';
import { normalizeBaseUrlOrigin } from './_lib/live-input-validation.mjs';

const root = cwd();
const host = env.ADMIN_CONFIG_GATE_HOST ?? '127.0.0.1';
const port = env.ADMIN_CONFIG_GATE_PORT ?? '4192';
const defaultScreenshotsDir = '.tmp/admin-config-gate/screenshots';

const adminRoutes = [
  { path: '/admin', slug: 'admin' },
  { path: '/admin/login', slug: 'admin-login' },
  { path: '/admin/unauthorized', slug: 'admin-unauthorized' },
  { path: '/admin/leads', slug: 'admin-leads' },
  { path: '/admin/media', slug: 'admin-media' },
  { path: '/admin/settings', slug: 'admin-settings' },
  { path: '/admin/stone-library', slug: 'admin-stone-library' },
  { path: '/admin/projects', slug: 'admin-projects' },
  { path: '/admin/products', slug: 'admin-products' },
  { path: '/admin/articles', slug: 'admin-articles' },
  { path: '/admin/audit', slug: 'admin-audit' },
];

const forbiddenPrivateText = [
  'Protected operating console',
  'This account is not an active Urblo admin',
  'Content health queue',
  'Recent lead signal',
  'Lead inbox',
  'Export CSV',
  'Export manifest',
  'Media export',
  'Stone Library',
  'Project editor',
  'Product editor',
  'Article editor',
  'Audit events',
  'Admin profile',
  'Site settings saved',
];

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
}
let serverProcess = null;
let serverStartupError = null;
let serverReady = false;
let expectedEntryAsset = null;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
});

async function main() {
  const screenshotsDir = args.screenshotsDir ?? defaultScreenshotsDir;
  const baseUrl = args.baseUrl ?? `http://${host}:${port}`;
  const gateRoot = join(root, '.tmp/admin-config-gate');
  const isolatedDistDir = join(gateRoot, 'dist');

  let result = 1;

  try {
    await rm(gateRoot, { recursive: true, force: true });
    await mkdir(gateRoot, { recursive: true });
    await mkdir(join(root, screenshotsDir), { recursive: true });

    if (!args.baseUrl) {
      const buildResult = await runCommand(
        'npx',
        ['vite', 'build', '--outDir', isolatedDistDir, '--emptyOutDir'],
        {
          VITE_SUPABASE_URL: '',
          VITE_SUPABASE_PUBLISHABLE_KEY: '',
          VITE_SUPABASE_ANON_KEY: '',
        },
      );
      if (buildResult !== 0) {
        throw new Error(`Admin config gate isolated build failed with exit code ${buildResult}.`);
      }
      expectedEntryAsset = readEntryAsset(await readFile(join(isolatedDistDir, 'index.html'), 'utf8'));
      serverProcess = startPreview(isolatedDistDir);
      await waitForServer(baseUrl);
    } else {
      await waitForServer(baseUrl);
    }

    const specPath = join(gateRoot, 'admin-config-gate.spec.js');
    const configPath = join(gateRoot, 'playwright.config.js');
    await writeFile(specPath, buildSpec(), 'utf8');
    await writeFile(configPath, buildConfig(), 'utf8');

    result = await runCommand(
      'npx',
      [
        'playwright',
        'test',
        '--config',
        configPath,
        '--workers=1',
      ],
      {
        ADMIN_CONFIG_GATE_BASE_URL: baseUrl,
        ADMIN_CONFIG_GATE_ROUTES_JSON: JSON.stringify(adminRoutes),
        ADMIN_CONFIG_GATE_FORBIDDEN_JSON: JSON.stringify(forbiddenPrivateText),
        ADMIN_CONFIG_GATE_SCREENSHOTS_DIR: join(root, screenshotsDir),
      },
    );
  } finally {
    await stopPreview();
  }

  if (result !== 0) {
    throw new Error(`Admin config gate failed with exit code ${result}.`);
  }

  console.log(`Admin config gate passed for ${adminRoutes.length} routes.`);
  console.log(`Screenshots written to ${screenshotsDir}.`);
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
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
    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function startPreview(outDir) {
  console.log(`Starting Vite preview on http://${host}:${port}`);
  const child = spawn(
    'npx',
    ['vite', 'preview', '--host', host, '--port', port, '--strictPort', '--outDir', outDir],
    {
      cwd: root,
      env,
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

function readEntryAsset(html) {
  const entryMatch = /<script[^>]+src="\/(assets\/index-[^"]+\.js)"/.exec(html);
  if (!entryMatch) {
    throw new Error('Isolated admin build did not expose the expected hashed entry script.');
  }
  return entryMatch[1];
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
      env: { ...env, ...extraEnv },
      stdio: 'inherit',
    });
    child.once('error', () => finish(1));
    child.once('exit', (code) => finish(code ?? 1));
  });
}

function buildSpec() {
  return `
import { test, expect } from 'playwright/test';

const baseUrl = process.env.ADMIN_CONFIG_GATE_BASE_URL;
const routes = JSON.parse(process.env.ADMIN_CONFIG_GATE_ROUTES_JSON ?? '[]');
const forbiddenText = JSON.parse(process.env.ADMIN_CONFIG_GATE_FORBIDDEN_JSON ?? '[]');
const screenshotsDir = process.env.ADMIN_CONFIG_GATE_SCREENSHOTS_DIR;

test.describe('admin no-config gate', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of routes) {
    test(route.path, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });
      page.on('pageerror', (error) => {
        consoleErrors.push(error.message);
      });

      await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'networkidle' });
      await expect(page.getByText('Configuration required')).toBeVisible();
      await expect(page.getByText('CMS access is not connected yet')).toBeVisible();
      await expect(page.getByText('finish the login connection')).toBeVisible();
      await expect(page.getByText('Admin auth is not connected yet')).toHaveCount(0);
      await expect(page.getByText('browser-safe Supabase key')).toHaveCount(0);
      await expect(page.getByTestId('admin-login-form')).toHaveCount(0);

      for (const text of forbiddenText) {
        await expect(page.getByText(text, { exact: false })).toHaveCount(0);
      }

      if (consoleErrors.length > 0) {
        throw new Error('Console/page errors detected: ' + consoleErrors.join(' | '));
      }

      await page.screenshot({
        path: screenshotsDir + '/' + route.slug + '.png',
        fullPage: true,
      });
    });
  }
});
`;
}

function buildConfig() {
  return `
export default {
  testDir: '.',
  testMatch: /admin-config-gate\\.spec\\.js/,
  reporter: 'line',
  outputDir: './test-results',
  projects: [
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
};
`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
