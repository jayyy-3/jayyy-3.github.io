import assert from 'node:assert/strict';
import fs from 'node:fs';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const SERVICE_KEY_NAMES = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
const BROWSER_KEY_NAMES = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];

function parseArgs(argv) {
  const options = {
    adminEmail: '',
    envFiles: [...DEFAULT_ENV_FILES],
    requiredRoles: ['owner'],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--admin-email') {
      options.adminEmail = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--admin-email=')) {
      options.adminEmail = arg.slice('--admin-email='.length);
      continue;
    }

    if (arg === '--env-file') {
      options.envFiles.push(argv[index + 1] || '');
      index += 1;
      continue;
    }

    if (arg.startsWith('--env-file=')) {
      options.envFiles.push(arg.slice('--env-file='.length));
      continue;
    }

    if (arg === '--required-role') {
      options.requiredRoles = parseRoleList(argv[index + 1] || '');
      index += 1;
      continue;
    }

    if (arg.startsWith('--required-role=')) {
      options.requiredRoles = parseRoleList(arg.slice('--required-role='.length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.envFiles = [...new Set(options.envFiles.filter(Boolean))];
  return options;
}

function parseRoleList(value) {
  const roles = value
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

  if (roles.length === 0) {
    throw new Error('--required-role needs at least one role, for example --required-role owner,admin');
  }

  for (const role of roles) {
    if (!['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      throw new Error(`Unsupported admin role: ${role}`);
    }
  }

  return roles;
}

function parseEnvFile(path) {
  if (!fs.existsSync(path)) return {};

  const parsed = {};
  const text = fs.readFileSync(path, 'utf8');
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
  return {
    ...envFiles.reduce((env, path) => ({ ...env, ...parseEnvFile(path) }), {}),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => typeof value === 'string' && value),
    ),
  };
}

function requireConfig(env, options) {
  const browserKeyName = BROWSER_KEY_NAMES.find((key) => env[key]);
  const serviceKeyName = SERVICE_KEY_NAMES.find((key) => env[key]);
  const adminEmail = (options.adminEmail || env.URBLO_FIRST_ADMIN_EMAIL || '').trim().toLowerCase();

  const missing = [];
  if (!browserKeyName) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY');
  if (!serviceKeyName) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
  if (!adminEmail) missing.push('URBLO_FIRST_ADMIN_EMAIL or --admin-email');

  if (missing.length > 0) {
    throw new Error(`Missing admin live readiness inputs: ${missing.join(', ')}.`);
  }

  return {
    adminEmail,
    browserKey: env[browserKeyName],
    browserKeyName,
    requiredRoles: options.requiredRoles,
    serviceKey: env[serviceKeyName],
    serviceKeyName,
    supabaseUrl: (env.SUPABASE_URL || env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(
      /\/$/,
      '',
    ),
  };
}

function restHeaders(config) {
  return {
    apikey: config.serviceKey,
    authorization: `Bearer ${config.serviceKey}`,
    'content-type': 'application/json',
  };
}

function browserKeyHeaders(config) {
  const headers = {
    apikey: config.browserKey,
    'content-type': 'application/json',
  };

  if (!config.browserKey.startsWith('sb_publishable_')) {
    headers.authorization = `Bearer ${config.browserKey}`;
  }

  return headers;
}

async function supabaseRest(config, path) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    headers: restHeaders(config),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase REST ${response.status} for ${path}: ${body.slice(0, 240)}`);
  }

  return response.json();
}

async function supabaseBrowserKeyRest(config, path) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    headers: browserKeyHeaders(config),
  });
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    body,
    ok: response.ok,
    status: response.status,
    text,
  };
}

async function selectRows(config, table, filters, select = '*') {
  const query = new URLSearchParams({ select });
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, `eq.${value}`);
  }

  return supabaseRest(config, `/rest/v1/${table}?${query.toString()}`);
}

async function countRows(config, table, filters = {}) {
  const rows = await selectRows(config, table, filters, 'id');
  return rows.length;
}

function assertBrowserKeyRows(result, label) {
  if (!result.ok) {
    const detail =
      typeof result.body === 'string' ? result.body : JSON.stringify(result.body ?? result.text);
    throw new Error(`${label} failed with HTTP ${result.status}: ${detail.slice(0, 240)}`);
  }

  assert.ok(Array.isArray(result.body), `${label} did not return an array.`);
  return result.body;
}

async function verifyBrowserKeyBoundary(config) {
  const publicSettings = assertBrowserKeyRows(
    await supabaseBrowserKeyRest(
      config,
      '/rest/v1/site_settings?select=id,settings_key,status&settings_key=eq.default&status=eq.published',
    ),
    'Browser-key published site_settings read',
  );
  assert.equal(publicSettings.length, 1, 'Browser key should read one published default site_settings row.');

  const publishedFinishes = assertBrowserKeyRows(
    await supabaseBrowserKeyRest(
      config,
      '/rest/v1/finish_definitions?select=id,finish_key&status=eq.published',
    ),
    'Browser-key published finish_definitions read',
  );
  assert.ok(
    publishedFinishes.length >= 12,
    `Browser key should read at least 12 published finish definitions, found ${publishedFinishes.length}.`,
  );

  const privateProfiles = await supabaseBrowserKeyRest(
    config,
    '/rest/v1/admin_profiles?select=user_id,email&limit=1',
  );
  if (privateProfiles.ok) {
    assert.ok(
      Array.isArray(privateProfiles.body),
      'Browser-key admin_profiles private-boundary check did not return an array.',
    );
    assert.equal(
      privateProfiles.body.length,
      0,
      'Browser key unexpectedly read admin_profiles rows without an authenticated admin session.',
    );
    return 'admin_profiles returned zero rows';
  }

  if (![401, 403].includes(privateProfiles.status)) {
    const detail =
      typeof privateProfiles.body === 'string'
        ? privateProfiles.body
        : JSON.stringify(privateProfiles.body ?? privateProfiles.text);
    throw new Error(
      `Browser-key admin_profiles private-boundary check failed with unexpected HTTP ${privateProfiles.status}: ${detail.slice(0, 240)}`,
    );
  }

  return `admin_profiles denied with HTTP ${privateProfiles.status}`;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const env = loadEnv(options.envFiles);
  const config = requireConfig(env, options);

  console.log('Admin live readiness check starting.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Browser key source: ${config.browserKeyName}`);
  console.log(`Service key source: ${config.serviceKeyName}`);
  console.log(`Admin email: ${config.adminEmail}`);
  console.log(`Required role: ${config.requiredRoles.join(' or ')}`);

  const profiles = await selectRows(
    config,
    'admin_profiles',
    { email: config.adminEmail },
    'user_id,email,display_name,role,is_active',
  );
  assert.equal(profiles.length, 1, `Expected one admin_profiles row for ${config.adminEmail}.`);

  const profile = profiles[0];
  assert.equal(profile.is_active, true, `Admin profile for ${config.adminEmail} is not active.`);
  assert.ok(
    config.requiredRoles.includes(profile.role),
    `Admin profile role is ${profile.role}, expected ${config.requiredRoles.join(' or ')}.`,
  );

  const settingsCount = await countRows(config, 'site_settings', {
    settings_key: 'default',
    status: 'published',
  });
  assert.equal(settingsCount, 1, 'Expected one published default site_settings row.');

  const finishCount = await countRows(config, 'finish_definitions', { status: 'published' });
  assert.ok(finishCount >= 12, `Expected at least 12 published finish definitions, found ${finishCount}.`);

  const browserBoundary = await verifyBrowserKeyBoundary(config);

  console.log(`Admin profile ready: ${profile.email} (${profile.role}).`);
  console.log('Baseline seed rows ready: site_settings default and finish_definitions.');
  console.log(`Browser-key public/private boundary ready: ${browserBoundary}.`);
  console.log('Admin live readiness check passed.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
