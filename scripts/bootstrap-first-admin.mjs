import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const SERVICE_KEY_NAMES = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
const VALID_ROLES = ['owner', 'admin'];

function parseArgs(argv) {
  const options = {
    adminEmail: '',
    allowExistingOwner: false,
    allowWrites: false,
    confirmEmail: '',
    displayName: '',
    envFiles: [...DEFAULT_ENV_FILES],
    invite: false,
    redirectTo: '',
    role: 'owner',
    verifyOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--allow-existing-owner') {
      options.allowExistingOwner = true;
      continue;
    }

    if (arg === '--allow-writes') {
      options.allowWrites = true;
      continue;
    }

    if (arg === '--invite') {
      options.invite = true;
      continue;
    }

    if (arg === '--verify-only') {
      options.verifyOnly = true;
      continue;
    }

    if (arg === '--admin-email') {
      options.adminEmail = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--admin-email=')) {
      options.adminEmail = arg.slice('--admin-email='.length);
      continue;
    }

    if (arg === '--confirm-email') {
      options.confirmEmail = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--confirm-email=')) {
      options.confirmEmail = arg.slice('--confirm-email='.length);
      continue;
    }

    if (arg === '--display-name') {
      options.displayName = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--display-name=')) {
      options.displayName = arg.slice('--display-name='.length);
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

    if (arg === '--redirect-to') {
      options.redirectTo = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--redirect-to=')) {
      options.redirectTo = arg.slice('--redirect-to='.length);
      continue;
    }

    if (arg === '--role') {
      options.role = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--role=')) {
      options.role = arg.slice('--role='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.envFiles = [...new Set(options.envFiles.filter(Boolean))];
  options.role = options.role.trim().toLowerCase();

  if (!VALID_ROLES.includes(options.role)) {
    throw new Error(`Unsupported bootstrap role: ${options.role}. Use owner or admin.`);
  }

  if (options.allowWrites && options.verifyOnly) {
    throw new Error('Use either --verify-only or --allow-writes, not both.');
  }

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
    ...envFiles.reduce((env, path) => ({ ...env, ...parseEnvFile(path) }), {}),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => typeof value === 'string' && value),
    ),
  };
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function assertEmail(value, label) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`${label} must be a valid email address.`);
  }
}

function getConfig(env, options) {
  const serviceKeyName = SERVICE_KEY_NAMES.find((key) => env[key]);
  const adminEmail = normalizeEmail(options.adminEmail || env.URBLO_FIRST_ADMIN_EMAIL || '');
  const confirmEmail = normalizeEmail(options.confirmEmail);

  return {
    adminEmail,
    confirmEmail,
    displayName: options.displayName.trim(),
    role: options.role,
    serviceKey: serviceKeyName ? env[serviceKeyName] : '',
    serviceKeyName,
    supabaseUrl: (env.SUPABASE_URL || env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(
      /\/$/,
      '',
    ),
  };
}

function printPlan(config, options) {
  console.log('First admin bootstrap plan.');
  console.log('No Supabase calls, invites, profile writes, or deletes were attempted.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Admin email configured: ${config.adminEmail ? 'yes' : 'no'}`);
  console.log(`Service-role key configured: ${config.serviceKeyName ? 'yes' : 'no'}`);
  console.log(`Planned role: ${config.role}`);
  console.log('');
  console.log('Read-only verification command:');
  console.log('  npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>');
  console.log('');
  console.log('Approved bootstrap command for an existing Supabase Auth user:');
  console.log(
    '  npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>',
  );
  console.log('');
  console.log('Approved bootstrap command when the Auth user still needs an invite:');
  console.log(
    '  npm run agent:first-admin-bootstrap -- --allow-writes --invite --admin-email <first-admin-email> --confirm-email <first-admin-email>',
  );
  console.log('');
  console.log('Guards: writes require --allow-writes and a matching --confirm-email.');
  console.log('Existing active owners block a new first-admin bootstrap unless --allow-existing-owner is intentional.');
  if (options.invite) {
    console.log('Note: --invite sends a Supabase Auth invitation email only in --allow-writes mode.');
  }
}

function requireServiceConfig(config) {
  const missing = [];
  if (!config.adminEmail) missing.push('URBLO_FIRST_ADMIN_EMAIL or --admin-email');
  if (!config.serviceKeyName) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');

  if (missing.length > 0) {
    throw new Error(`Missing first admin bootstrap inputs: ${missing.join(', ')}.`);
  }

  assertEmail(config.adminEmail, 'Admin email');
}

function requireWriteConfirmation(config) {
  if (!config.confirmEmail) {
    throw new Error('--allow-writes requires --confirm-email <first-admin-email>.');
  }
  assertEmail(config.confirmEmail, 'Confirm email');
  if (config.confirmEmail !== config.adminEmail) {
    throw new Error('--confirm-email must exactly match --admin-email after normalization.');
  }
}

function createServiceClient(config) {
  return createClient(config.supabaseUrl, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findAuthUserByEmail(supabase, email) {
  const perPage = 1000;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    const match = users.find((user) => normalizeEmail(user.email || '') === email);
    if (match) return match;
    if (users.length < perPage) return null;
  }

  throw new Error('Could not find user within the first 10000 Auth users; narrow the bootstrap manually.');
}

async function inviteAuthUser(supabase, config, options) {
  const inviteOptions = {};
  if (config.displayName) inviteOptions.data = { display_name: config.displayName };
  if (options.redirectTo) inviteOptions.redirectTo = options.redirectTo;

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    config.adminEmail,
    inviteOptions,
  );
  if (error) throw error;

  const invitedUser = data?.user;
  if (invitedUser?.id) return invitedUser;

  const foundUser = await findAuthUserByEmail(supabase, config.adminEmail);
  if (!foundUser) throw new Error('Invite succeeded, but the invited Auth user could not be read back.');
  return foundUser;
}

async function readProfileByEmail(supabase, email) {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id,email,display_name,role,is_active,created_at,updated_at')
    .eq('email', email);

  if (error) throw error;
  return data || [];
}

async function readActiveOwners(supabase) {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id,email,role,is_active')
    .eq('role', 'owner')
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
}

async function verifySeeds(supabase) {
  const { data: settingsRows, error: settingsError } = await supabase
    .from('site_settings')
    .select('id')
    .eq('settings_key', 'default')
    .eq('status', 'published');
  if (settingsError) throw settingsError;

  const { data: finishRows, error: finishError } = await supabase
    .from('finish_definitions')
    .select('id')
    .eq('status', 'published');
  if (finishError) throw finishError;

  assert.equal(settingsRows.length, 1, 'Expected one published default site_settings row.');
  assert.ok(
    finishRows.length >= 12,
    `Expected at least 12 published finish definitions, found ${finishRows.length}.`,
  );
}

function assertOwnerBootstrapAllowed(activeOwners, targetUserId, options) {
  if (activeOwners.length === 0) return;
  if (activeOwners.some((owner) => owner.user_id === targetUserId)) return;
  if (options.allowExistingOwner) return;

  throw new Error(
    'An active owner profile already exists. Refusing first-admin bootstrap for another user unless --allow-existing-owner is explicitly supplied.',
  );
}

async function upsertAdminProfile(supabase, user, config) {
  const payload = {
    display_name: config.displayName || user.user_metadata?.display_name || user.email,
    email: config.adminEmail,
    is_active: true,
    role: config.role,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('admin_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('user_id,email,display_name,role,is_active')
    .single();

  if (error) throw error;
  return data;
}

async function recordBootstrapAuditEvent(supabase, user, config, options) {
  const { error } = await supabase.from('admin_audit_events').insert({
    actor_user_id: null,
    action: 'admin_profile.bootstrap',
    entity_type: 'admin_profiles',
    entity_id: null,
    metadata: {
      source: 'scripts/bootstrap-first-admin.mjs',
      target_user_id: user.id,
      email: config.adminEmail,
      role: config.role,
      invited: options.invite,
      allow_existing_owner: options.allowExistingOwner,
    },
  });

  if (error) {
    throw new Error(`First admin profile was upserted, but bootstrap audit event failed: ${error.message}`);
  }
}

async function verifyOnly(supabase, config) {
  const [user, profiles] = await Promise.all([
    findAuthUserByEmail(supabase, config.adminEmail),
    readProfileByEmail(supabase, config.adminEmail),
    verifySeeds(supabase),
  ]);

  console.log('First admin bootstrap read-only verification.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Service key source: ${config.serviceKeyName}`);
  console.log(`Admin email: ${config.adminEmail}`);
  console.log(`Expected profile role: ${config.role}`);
  console.log(`Auth user: ${user ? 'found' : 'missing'}`);
  console.log(`Admin profile rows: ${profiles.length}`);
  for (const profile of profiles) {
    console.log(`- ${profile.email}: ${profile.role}, active=${profile.is_active}`);
  }
  console.log('Baseline seed rows ready: site_settings default and finish_definitions.');

  if (!user || profiles.length !== 1 || !profiles[0].is_active || profiles[0].role !== config.role) {
    process.exitCode = 1;
  }
}

async function writeBootstrap(supabase, config, options) {
  let user = await findAuthUserByEmail(supabase, config.adminEmail);
  const activeOwners = await readActiveOwners(supabase);
  if (!user && activeOwners.length > 0 && !options.allowExistingOwner) {
    throw new Error(
      'An active owner profile already exists. Refusing to invite a new first-admin user unless --allow-existing-owner is explicitly supplied.',
    );
  }

  if (!user) {
    if (!options.invite) {
      throw new Error('No Supabase Auth user exists for this email. Add --invite only after Jay approves sending the Auth invitation.');
    }
    user = await inviteAuthUser(supabase, config, options);
  }

  assertOwnerBootstrapAllowed(activeOwners, user.id, options);
  const profile = await upsertAdminProfile(supabase, user, config);
  await recordBootstrapAuditEvent(supabase, user, config, options);
  await verifySeeds(supabase);

  console.log('First admin bootstrap write completed.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Admin profile ready: ${profile.email} (${profile.role}, active=${profile.is_active}).`);
  console.log('Bootstrap audit event recorded: admin_profile.bootstrap.');
  console.log('Baseline seed rows ready: site_settings default and finish_definitions.');
  console.log('Next: run npm run agent:admin-live-readiness -- --admin-email <first-admin-email>.');
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const env = loadEnv(options.envFiles);
  const config = getConfig(env, options);

  if (!options.verifyOnly && !options.allowWrites) {
    printPlan(config, options);
    return;
  }

  requireServiceConfig(config);
  const supabase = createServiceClient(config);

  if (options.verifyOnly) {
    await verifyOnly(supabase, config);
    return;
  }

  requireWriteConfirmation(config);
  await writeBootstrap(supabase, config, options);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
