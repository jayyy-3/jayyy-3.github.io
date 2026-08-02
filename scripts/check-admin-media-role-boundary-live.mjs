#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {
  isPlaceholderValue,
  isValidEmail,
  normalizeBaseUrlOrigin,
} from './_lib/live-input-validation.mjs';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const BROWSER_KEY_NAMES = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
const EDITOR_EMAIL_NAME = 'URBLO_EDITOR_EMAIL';
const EDITOR_PASSWORD_NAME = 'URBLO_EDITOR_PASSWORD';
const ADMIN_EMAIL_NAME = 'URBLO_ADMIN_EMAIL';
const ADMIN_PASSWORD_NAME = 'URBLO_ADMIN_PASSWORD';
const PRIVATE_BUCKET = 'urblo-admin-media';
const PUBLIC_BUCKET = 'urblo-public-media';
const OBJECT_ROOT = 'live-role-boundary';
const PNG_V1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);
const PNG_V2 = Buffer.concat([PNG_V1, Buffer.from('urblo-role-boundary-update')]);

const livePlan = [
  'Sign in with one active Editor and one active Website owner/CMS manager account.',
  'Read each signed-in user\'s own active admin_profiles row through browser-key RLS.',
  'Verify the two credentials resolve to different users with roles editor and owner/admin.',
  'Verify Editor insert and update both succeed in urblo-admin-media.',
  'Verify Editor insert into urblo-public-media is denied and creates no object.',
  'Create a tagged public object as owner/admin, then verify Editor update is denied and leaves the bytes unchanged.',
  'Verify owner/admin insert and update both succeed in urblo-public-media.',
  'Use the owner/admin session to best-effort remove every tagged object and fail with exact paths if cleanup is incomplete.',
];

function parseArgs(argv) {
  const options = {
    allowWrites: false,
    envFiles: [...DEFAULT_ENV_FILES],
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--allow-writes') {
      options.allowWrites = true;
      continue;
    }

    if (arg === '--strict') {
      options.strict = true;
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

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.envFiles = [...new Set(options.envFiles.filter(Boolean))];
  return options;
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
    ...envFiles.reduce((loaded, path) => ({ ...loaded, ...parseEnvFile(path) }), {}),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => typeof value === 'string' && value),
    ),
  };
}

function firstEnv(env, names) {
  const key = names.find((name) => env[name]);
  return key ? { key, value: env[key] } : { key: '', value: '' };
}

function loadConfig(env) {
  const browserKey = firstEnv(env, BROWSER_KEY_NAMES);
  return {
    adminEmail: (env[ADMIN_EMAIL_NAME] || '').trim().toLowerCase(),
    adminPassword: env[ADMIN_PASSWORD_NAME] || '',
    browserKey: browserKey.value,
    browserKeyName: browserKey.key,
    editorEmail: (env[EDITOR_EMAIL_NAME] || '').trim().toLowerCase(),
    editorPassword: env[EDITOR_PASSWORD_NAME] || '',
    supabaseUrl: (env.VITE_SUPABASE_URL || env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(
      /\/$/,
      '',
    ),
  };
}

function legacyBrowserKeyRole(value) {
  const parts = value.split('.');
  if (parts.length !== 3) return '';

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload?.role === 'string' ? payload.role : '';
  } catch {
    return '';
  }
}

function browserKeyIssue(value) {
  if (!value) return `missing ${BROWSER_KEY_NAMES.join(' or ')}`;
  if (isPlaceholderValue(value)) return 'browser key is still a placeholder';
  if (value.startsWith('sb_publishable_')) return '';
  if (legacyBrowserKeyRole(value) === 'anon') return '';
  return 'browser key must be a publishable key or legacy anon JWT; secret/service-role keys are forbidden';
}

function passwordReady(value) {
  return Boolean(value && !isPlaceholderValue(value));
}

function configIssues(config) {
  const issues = [];
  const keyIssue = browserKeyIssue(config.browserKey);
  if (keyIssue) issues.push(keyIssue);

  if (!isValidEmail(config.editorEmail)) issues.push(`missing or invalid ${EDITOR_EMAIL_NAME}`);
  if (!passwordReady(config.editorPassword)) issues.push(`missing or invalid ${EDITOR_PASSWORD_NAME}`);
  if (!isValidEmail(config.adminEmail)) issues.push(`missing or invalid ${ADMIN_EMAIL_NAME}`);
  if (!passwordReady(config.adminPassword)) issues.push(`missing or invalid ${ADMIN_PASSWORD_NAME}`);
  if (
    isValidEmail(config.editorEmail) &&
    isValidEmail(config.adminEmail) &&
    config.editorEmail.trim().toLowerCase() === config.adminEmail.trim().toLowerCase()
  ) {
    issues.push(`${EDITOR_EMAIL_NAME} and ${ADMIN_EMAIL_NAME} must identify different users`);
  }

  try {
    normalizeBaseUrlOrigin(config.supabaseUrl, 'Supabase URL');
  } catch (error) {
    issues.push(error instanceof Error ? error.message : 'Supabase URL is invalid');
  }

  return issues;
}

function printPlan(config, issues) {
  console.log('Admin Media Storage role-boundary live verification plan only.');
  console.log('No login, Supabase writes, Storage uploads, updates, or deletes were attempted.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Browser-safe key configured: ${config.browserKey ? config.browserKeyName || 'yes' : 'no'}`);
  console.log(`Editor credentials configured: ${config.editorEmail && config.editorPassword ? 'yes' : 'no'}`);
  console.log(`Owner/admin credentials configured: ${config.adminEmail && config.adminPassword ? 'yes' : 'no'}`);
  console.log('Required environment inputs:');
  console.log(`- ${BROWSER_KEY_NAMES.join(' or ')}`);
  console.log(`- ${EDITOR_EMAIL_NAME} and ${EDITOR_PASSWORD_NAME}`);
  console.log(`- ${ADMIN_EMAIL_NAME} and ${ADMIN_PASSWORD_NAME}`);
  console.log('- Optional VITE_SUPABASE_URL or SUPABASE_URL override.');
  console.log('Live mode requires explicit --allow-writes.');
  console.log('Planned checks:');
  livePlan.forEach((item) => console.log(`- ${item}`));
  if (issues.length > 0) {
    console.log('Inputs still needed or invalid:');
    issues.forEach((issue) => console.log(`- ${issue}`));
  } else {
    console.log('All live inputs are present. Plan-only mode still made no network calls.');
  }
}

function authHeaders(config, accessToken, extra = {}) {
  return {
    apikey: config.browserKey,
    authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}

async function fetchJson(url, init, context) {
  const response = await fetch(url, init);
  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!response.ok) {
    throw new Error(`${context} failed with HTTP ${response.status}.`);
  }

  return json;
}

async function signIn(config, email, password, label) {
  const json = await fetchJson(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: config.browserKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    },
    `${label} Supabase Auth sign-in`,
  );

  assert.ok(json?.access_token, `${label} sign-in did not return an access token.`);
  return json.access_token;
}

async function getAuthUser(config, accessToken, label) {
  const user = await fetchJson(
    `${config.supabaseUrl}/auth/v1/user`,
    { headers: authHeaders(config, accessToken) },
    `${label} Auth user lookup`,
  );
  assert.ok(user?.id, `${label} Auth user lookup did not return a user id.`);
  return user;
}

async function getOwnActiveProfile(config, accessToken, userId, label) {
  const query = new URLSearchParams({
    select: 'user_id,email,role,is_active',
    user_id: `eq.${userId}`,
    is_active: 'eq.true',
  });
  const rows = await fetchJson(
    `${config.supabaseUrl}/rest/v1/admin_profiles?${query.toString()}`,
    { headers: authHeaders(config, accessToken) },
    `${label} active profile read through RLS`,
  );
  assert.ok(Array.isArray(rows), `${label} active profile lookup did not return rows.`);
  assert.equal(rows.length, 1, `${label} must have exactly one active admin profile.`);
  return rows[0];
}

function encodeObjectPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function writeStorageObject(config, accessToken, bucket, path, method, bytes) {
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
    {
      method,
      headers: authHeaders(config, accessToken, {
        'cache-control': '60',
        'content-type': 'image/png',
        ...(method === 'POST' ? { 'x-upsert': 'false' } : {}),
      }),
      body: bytes,
    },
  );
  return { ok: response.ok, status: response.status };
}

function assertStorageWriteSucceeded(result, label) {
  assert.ok(result.ok, `${label} failed with HTTP ${result.status}.`);
}

function assertStorageWriteDenied(result, label) {
  assert.equal(result.ok, false, `${label} unexpectedly succeeded; the Storage role boundary is open.`);
  assert.ok(
    [400, 401, 403].includes(result.status),
    `${label} failed with HTTP ${result.status}, which does not prove an authorization denial.`,
  );
}

async function readStorageObject(config, accessToken, bucket, path) {
  const url = new URL(
    `${config.supabaseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
  );
  // Supabase Smart CDN invalidation can take up to 60 seconds after an update or delete.
  // A unique cacheNonce forces this verifier's readback to fetch the current origin state.
  url.searchParams.set('cacheNonce', `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`);
  const response = await fetch(
    url,
    { headers: authHeaders(config, accessToken, { 'cache-control': 'no-cache' }) },
  );
  const diagnostics = {
    age: response.headers.get('age') || 'none',
    cacheStatus: response.headers.get('cf-cache-status') || 'none',
    etag: response.headers.get('etag') || 'none',
  };
  if (!response.ok) {
    return { bytes: null, ok: false, status: response.status, ...diagnostics };
  }
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    ok: true,
    status: response.status,
    ...diagnostics,
  };
}

function readbackDiagnostics(result) {
  return `cf-cache-status=${result.cacheStatus}; age=${result.age}; etag=${result.etag}`;
}

async function assertObjectBytes(config, accessToken, bucket, path, expected, label) {
  const result = await readStorageObject(config, accessToken, bucket, path);
  assert.ok(result.ok, `${label} readback failed with HTTP ${result.status}.`);
  assert.ok(
    result.bytes.equals(expected),
    `${label} readback bytes did not match the expected version (${readbackDiagnostics(result)}).`,
  );
}

async function assertObjectMissing(config, accessToken, bucket, path, label) {
  const result = await readStorageObject(config, accessToken, bucket, path);
  assert.equal(result.ok, false, `${label} unexpectedly exists.`);
  assert.ok(
    [400, 404].includes(result.status),
    `${label} absence check returned HTTP ${result.status}, so absence was not proven.`,
  );
}

async function cleanupObject(config, accessToken, reference) {
  let deleteStatus = 'not attempted';
  try {
    const response = await fetch(`${config.supabaseUrl}/storage/v1/object/${reference.bucket}`, {
      method: 'DELETE',
      headers: authHeaders(config, accessToken, { 'content-type': 'application/json' }),
      body: JSON.stringify({ prefixes: [reference.path] }),
    });
    deleteStatus = `HTTP ${response.status}`;
  } catch (error) {
    deleteStatus = error instanceof Error ? error.message : 'network error';
  }

  try {
    const readback = await readStorageObject(
      config,
      accessToken,
      reference.bucket,
      reference.path,
    );
    if (!readback.ok && [400, 404].includes(readback.status)) return null;
    if (readback.ok) {
      return `${reference.bucket}/${reference.path} remains readable after cleanup (${deleteStatus}; ${readbackDiagnostics(readback)})`;
    }
    return `${reference.bucket}/${reference.path} cleanup could not be verified (${deleteStatus}; read HTTP ${readback.status})`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown readback error';
    return `${reference.bucket}/${reference.path} cleanup failed (${deleteStatus}; ${message})`;
  }
}

async function cleanupAll(config, accessToken, references) {
  const results = await Promise.all(
    references.map((reference) => cleanupObject(config, accessToken, reference)),
  );
  return results.filter(Boolean);
}

async function runLive(config) {
  const marker = `media-role-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const references = [
    { bucket: PRIVATE_BUCKET, path: `${OBJECT_ROOT}/${marker}/editor-private.png` },
    { bucket: PUBLIC_BUCKET, path: `${OBJECT_ROOT}/${marker}/editor-public-denied.png` },
    { bucket: PUBLIC_BUCKET, path: `${OBJECT_ROOT}/${marker}/admin-public.png` },
  ];
  const [privateRef, deniedPublicRef, adminPublicRef] = references;
  let adminAccessToken = '';
  let writesStarted = false;
  let primaryError = null;
  let cleanupFailures = [];

  try {
    const [editorAccessToken, nextAdminAccessToken] = await Promise.all([
      signIn(config, config.editorEmail, config.editorPassword, 'Editor'),
      signIn(config, config.adminEmail, config.adminPassword, 'Owner/admin'),
    ]);
    adminAccessToken = nextAdminAccessToken;

    const [editorUser, adminUser] = await Promise.all([
      getAuthUser(config, editorAccessToken, 'Editor'),
      getAuthUser(config, adminAccessToken, 'Owner/admin'),
    ]);
    assert.notEqual(editorUser.id, adminUser.id, 'Editor and owner/admin credentials resolved to the same user.');

    const [editorProfile, adminProfile] = await Promise.all([
      getOwnActiveProfile(config, editorAccessToken, editorUser.id, 'Editor'),
      getOwnActiveProfile(config, adminAccessToken, adminUser.id, 'Owner/admin'),
    ]);
    assert.equal(editorProfile.role, 'editor', `Editor credential has role ${editorProfile.role}.`);
    assert.ok(
      ['owner', 'admin'].includes(adminProfile.role),
      `Owner/admin credential has role ${adminProfile.role}.`,
    );

    console.log('Admin Media Storage role-boundary live verification starting.');
    console.log(`Supabase URL: ${config.supabaseUrl}`);
    console.log(`Browser key source: ${config.browserKeyName}`);
    console.log(`Verified active roles: ${editorProfile.role} and ${adminProfile.role}.`);
    console.log(`Marker: ${marker}`);

    writesStarted = true;
    const editorPrivateInsert = await writeStorageObject(
      config,
      editorAccessToken,
      privateRef.bucket,
      privateRef.path,
      'POST',
      PNG_V1,
    );
    assertStorageWriteSucceeded(editorPrivateInsert, 'Editor private-bucket insert');

    const editorPrivateUpdate = await writeStorageObject(
      config,
      editorAccessToken,
      privateRef.bucket,
      privateRef.path,
      'PUT',
      PNG_V2,
    );
    assertStorageWriteSucceeded(editorPrivateUpdate, 'Editor private-bucket update');
    await assertObjectBytes(
      config,
      editorAccessToken,
      privateRef.bucket,
      privateRef.path,
      PNG_V2,
      'Editor private-bucket update',
    );

    const editorPublicInsert = await writeStorageObject(
      config,
      editorAccessToken,
      deniedPublicRef.bucket,
      deniedPublicRef.path,
      'POST',
      PNG_V1,
    );
    assertStorageWriteDenied(editorPublicInsert, 'Editor public-bucket insert');
    await assertObjectMissing(
      config,
      adminAccessToken,
      deniedPublicRef.bucket,
      deniedPublicRef.path,
      'Editor-denied public object',
    );

    const adminPublicInsert = await writeStorageObject(
      config,
      adminAccessToken,
      adminPublicRef.bucket,
      adminPublicRef.path,
      'POST',
      PNG_V1,
    );
    assertStorageWriteSucceeded(adminPublicInsert, 'Owner/admin public-bucket insert');
    await assertObjectBytes(
      config,
      adminAccessToken,
      adminPublicRef.bucket,
      adminPublicRef.path,
      PNG_V1,
      'Owner/admin public-bucket insert',
    );

    const editorPublicUpdate = await writeStorageObject(
      config,
      editorAccessToken,
      adminPublicRef.bucket,
      adminPublicRef.path,
      'PUT',
      PNG_V2,
    );
    assertStorageWriteDenied(editorPublicUpdate, 'Editor public-bucket update');
    await assertObjectBytes(
      config,
      adminAccessToken,
      adminPublicRef.bucket,
      adminPublicRef.path,
      PNG_V1,
      'Editor-denied public-bucket update',
    );

    const adminPublicUpdate = await writeStorageObject(
      config,
      adminAccessToken,
      adminPublicRef.bucket,
      adminPublicRef.path,
      'PUT',
      PNG_V2,
    );
    assertStorageWriteSucceeded(adminPublicUpdate, 'Owner/admin public-bucket update');
    await assertObjectBytes(
      config,
      adminAccessToken,
      adminPublicRef.bucket,
      adminPublicRef.path,
      PNG_V2,
      'Owner/admin public-bucket update',
    );
  } catch (error) {
    primaryError = error instanceof Error ? error : new Error(String(error));
  } finally {
    if (writesStarted && adminAccessToken) {
      cleanupFailures = await cleanupAll(config, adminAccessToken, references);
    }
  }

  if (primaryError || cleanupFailures.length > 0) {
    const messages = [];
    if (primaryError) messages.push(primaryError.message);
    if (cleanupFailures.length > 0) {
      messages.push(`Tagged Storage cleanup failed:\n- ${cleanupFailures.join('\n- ')}`);
    }
    throw new Error(messages.join('\n'));
  }

  console.log('Admin Media Storage role-boundary live verification passed.');
  console.log('Editor private insert/update succeeded.');
  console.log('Editor public insert/update were denied without changing public objects.');
  console.log('Owner/admin public insert/update succeeded.');
  console.log('All tagged Storage objects were removed and absence was read back.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig(loadEnv(options.envFiles));
  const issues = configIssues(config);

  if (!options.allowWrites) {
    printPlan(config, issues);
    if (options.strict && issues.length > 0) {
      throw new Error(`Missing or invalid live inputs:\n- ${issues.join('\n- ')}`);
    }
    return;
  }

  if (issues.length > 0) {
    throw new Error(`Missing or invalid live inputs:\n- ${issues.join('\n- ')}`);
  }

  await runLive(config);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
