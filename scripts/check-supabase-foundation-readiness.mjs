#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, exit } from 'node:process';

const root = cwd();
const failures = [];

const expectedMigrations = [
  '202605270001_foundation_schema.sql',
  '202605270002_foundation_hardening.sql',
  '202605270003_anon_read_only.sql',
  '202605270004_baseline_seed.sql',
  '202605280001_admin_settings_role_hardening.sql',
  '202605280002_media_storage_foundation.sql',
  '202605280003_media_storage_listing_hardening.sql',
  '202605280004_admin_profile_owner_hardening.sql',
  '202605280005_security_definer_function_grants.sql',
  '202605290001_security_definer_private_helpers.sql',
  '202605290002_admin_profile_email_uniqueness.sql',
  '202605290003_sample_request_atomic_insert.sql',
];

const publicContentTables = [
  'media_assets',
  'site_settings',
  'finish_definitions',
  'stone_groups',
  'stone_variants',
  'stone_finish_capabilities',
  'stone_finish_images',
  'products',
  'product_models',
  'product_material_defaults',
  'product_specs',
  'projects',
  'project_facts',
  'project_media',
  'project_materials',
  'project_material_maps',
  'project_hotspots',
  'articles',
  'article_blocks',
];

const privateTables = [
  'admin_profiles',
  'admin_audit_events',
  'enquiries',
  'sample_requests',
  'sample_request_items',
];

const launchTables = [...privateTables.slice(0, 2), ...publicContentTables, ...privateTables.slice(2)];

function readRequired(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`Missing file: ${relativePath}`);
    return '';
  }

  return readFileSync(absolutePath, 'utf8');
}

function sqlSource(...relativePaths) {
  return relativePaths.map((relativePath) => readRequired(relativePath)).join('\n\n');
}

function normalizeSql(text) {
  return text
    .toLowerCase()
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function requireIncludes(text, needle, context) {
  if (!text.includes(needle)) {
    failures.push(`${context}: missing ${needle}`);
  }
}

function requireRegex(text, pattern, context, label) {
  if (!pattern.test(text)) {
    failures.push(`${context}: missing ${label}`);
  }
}

function checkMigrationFiles() {
  const migrationDir = join(root, 'supabase/migrations');
  const migrationFiles = existsSync(migrationDir)
    ? readdirSync(migrationDir).filter((entry) => entry.endsWith('.sql')).sort()
    : [];

  for (const expectedMigration of expectedMigrations) {
    if (!migrationFiles.includes(expectedMigration)) {
      failures.push(`supabase/migrations: missing expected migration ${expectedMigration}`);
    }
  }
}

function checkFoundationSchema(foundationSchema, combinedSql) {
  const normalizedFoundation = normalizeSql(foundationSchema);
  const normalizedCombined = normalizeSql(combinedSql);

  for (const table of launchTables) {
    requireRegex(
      normalizedFoundation,
      new RegExp(`create table public\\.${table}\\b`),
      'foundation schema tables',
      `create table public.${table}`,
    );
    requireIncludes(
      normalizedFoundation,
      `alter table public.${table} enable row level security;`,
      `foundation schema RLS for ${table}`,
    );
  }

  if (normalizedFoundation.includes('article_tags')) {
    failures.push('foundation schema: article_tags must not be part of the 24-table launch schema');
  }
  if (!normalizedFoundation.includes('create table public.project_media')) {
    failures.push('foundation schema: project_media must remain the expected project media table');
  }

  const createdTables = [...normalizedFoundation.matchAll(/create table public\.([a-z0-9_]+)/g)].map(
    ([, table]) => table,
  );
  const missingFromExpected = createdTables.filter((table) => !launchTables.includes(table));
  if (createdTables.length !== launchTables.length || missingFromExpected.length > 0) {
    failures.push(
      `foundation schema: expected ${launchTables.length} launch tables, found ${createdTables.length}` +
        (missingFromExpected.length ? ` including unexpected ${missingFromExpected.join(', ')}` : ''),
    );
  }

  for (const table of publicContentTables) {
    requireIncludes(
      normalizedFoundation,
      `create policy ${table}_public_select on public.${table}`,
      `public select policy for ${table}`,
    );
  }

  for (const table of privateTables) {
    requireIncludes(
      normalizedCombined,
      `revoke all on table public.${table} from anon;`,
      `private anon revoke for ${table}`,
    );
  }

  requireIncludes(
    normalizedCombined,
    'revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon;',
    'anon read-only grant posture',
  );
  requireIncludes(normalizedCombined, 'grant select on public.media_assets', 'anon public-content grant');
}

function checkBaselineSeed(seedSql) {
  const normalizedSeed = normalizeSql(seedSql);
  const finishRows = [...seedSql.matchAll(/\(\s*'([a-z0-9_]+)'\s*,\s*'[^']+'\s*,/g)]
    .map(([, finishKey]) => finishKey)
    .filter((finishKey) => finishKey !== 'default');
  const distinctFinishes = new Set(finishRows);

  if (distinctFinishes.size !== 12) {
    failures.push(`baseline seed: expected 12 distinct finish definitions, found ${distinctFinishes.size}`);
  }

  for (const finishKey of [
    'flamed',
    'sawn',
    'honed',
    'polished',
    'bush_hammered',
    'combed',
    'rippling',
    'rippling__fine',
    'rippling__rough',
    'rock_face',
    'sparrow_peck',
    'sandblasted',
  ]) {
    if (!distinctFinishes.has(finishKey)) {
      failures.push(`baseline seed: missing finish definition ${finishKey}`);
    }
  }

  for (const fragment of [
    'insert into public.finish_definitions',
    'on conflict (finish_key) do update',
    'insert into public.site_settings',
    "'default'",
    "'published'",
    'on conflict (settings_key) do update',
  ]) {
    requireIncludes(normalizedSeed, fragment, 'baseline seed idempotency/default row');
  }
}

function checkSampleRequestRpc(rpcSql) {
  const normalizedRpc = normalizeSql(rpcSql);

  for (const fragment of [
    'create or replace function public.submit_sample_request_with_item',
    'returns table',
    'security invoker',
    'set search_path = public, pg_temp',
    'insert into public.sample_requests',
    'insert into public.sample_request_items',
    'revoke all on function public.submit_sample_request_with_item(jsonb, jsonb) from public;',
    'revoke execute on function public.submit_sample_request_with_item(jsonb, jsonb) from anon;',
    'revoke execute on function public.submit_sample_request_with_item(jsonb, jsonb) from authenticated;',
    'grant execute on function public.submit_sample_request_with_item(jsonb, jsonb) to service_role;',
    "notify pgrst, 'reload schema';",
  ]) {
    requireIncludes(normalizedRpc, fragment, 'sample request atomic RPC migration');
  }
}

function checkStorage(storageSql, storageHardeningSql) {
  const normalizedStorage = normalizeSql(storageSql);
  const normalizedHardening = normalizeSql(storageHardeningSql);

  for (const fragment of [
    "'urblo-public-media'",
    "'urblo-admin-media'",
    'true, 26214400',
    'false, 52428800',
    'grant select on storage.buckets to anon, authenticated;',
    'grant select on storage.objects to anon, authenticated;',
    'grant insert, update, delete on storage.objects to authenticated;',
    'create policy urblo_storage_buckets_public_select',
    'create policy urblo_storage_buckets_admin_select',
    'create policy urblo_storage_admin_object_select',
    'create policy urblo_storage_admin_object_insert',
    'create policy urblo_storage_admin_object_update',
    'create policy urblo_storage_admin_object_delete',
  ]) {
    requireIncludes(normalizedStorage, fragment, 'media Storage foundation');
  }

  requireIncludes(
    normalizedHardening,
    'drop policy if exists urblo_storage_public_object_select on storage.objects;',
    'media Storage public listing hardening',
  );

  if (/create\s+policy\s+urblo_storage_public_object_select\b/i.test(storageHardeningSql)) {
    failures.push('media Storage public listing hardening: must not recreate broad public object listing');
  }
}

function checkSecurityHelpers(privateHelperSql, publicGrantSql) {
  const normalizedPrivate = normalizeSql(privateHelperSql);
  const normalizedPublicGrant = normalizeSql(publicGrantSql);

  for (const fragment of [
    'create schema if not exists private;',
    'revoke all on schema private from public;',
    'revoke all on schema private from anon;',
    'grant usage on schema private to authenticated;',
    'create or replace function private.current_admin_role()',
    'create or replace function private.has_admin_role',
    'security definer',
    "set search_path = ''",
    'private.has_admin_role(',
    'revoke all on function public.current_admin_role() from authenticated;',
    'revoke all on function public.has_admin_role(text[]) from authenticated;',
  ]) {
    requireIncludes(normalizedPrivate, fragment, 'private SECURITY DEFINER helper migration');
  }

  for (const fragment of [
    'revoke all on function public.rls_auto_enable() from public;',
    'revoke all on function public.rls_auto_enable() from anon;',
    'revoke all on function public.rls_auto_enable() from authenticated;',
  ]) {
    requireIncludes(normalizedPublicGrant, fragment, 'public helper grant hardening');
  }
}

function checkAdminProfileEmailUniqueness(emailSql) {
  const normalizedEmail = normalizeSql(emailSql);

  for (const fragment of [
    'create unique index if not exists admin_profiles_email_ci_unique_idx',
    'on public.admin_profiles (lower(btrim(email)));',
  ]) {
    requireIncludes(normalizedEmail, fragment, 'admin profile email uniqueness migration');
  }
}

checkMigrationFiles();

const foundationSchema = readRequired('supabase/migrations/202605270001_foundation_schema.sql');
const baselineSeed = readRequired('supabase/migrations/202605270004_baseline_seed.sql');
const storageFoundation = readRequired('supabase/migrations/202605280002_media_storage_foundation.sql');
const storageHardening = readRequired('supabase/migrations/202605280003_media_storage_listing_hardening.sql');
const publicHelperGrants = readRequired('supabase/migrations/202605280005_security_definer_function_grants.sql');
const privateHelpers = readRequired('supabase/migrations/202605290001_security_definer_private_helpers.sql');
const emailUniqueness = readRequired('supabase/migrations/202605290002_admin_profile_email_uniqueness.sql');
const sampleRequestRpc = readRequired('supabase/migrations/202605290003_sample_request_atomic_insert.sql');
const combinedSql = sqlSource(
  'supabase/migrations/202605270001_foundation_schema.sql',
  'supabase/migrations/202605270002_foundation_hardening.sql',
  'supabase/migrations/202605270003_anon_read_only.sql',
  'supabase/migrations/202605280001_admin_settings_role_hardening.sql',
  'supabase/migrations/202605280004_admin_profile_owner_hardening.sql',
  'supabase/migrations/202605280005_security_definer_function_grants.sql',
  'supabase/migrations/202605290001_security_definer_private_helpers.sql',
);

checkFoundationSchema(foundationSchema, combinedSql);
checkBaselineSeed(baselineSeed);
checkSampleRequestRpc(sampleRequestRpc);
checkStorage(storageFoundation, storageHardening);
checkSecurityHelpers(privateHelpers, publicHelperGrants);
checkAdminProfileEmailUniqueness(emailUniqueness);

if (failures.length) {
  console.error('Supabase foundation readiness checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log('Supabase foundation readiness checks passed.');
console.log(
  'Verified migration files, 24 launch tables, RLS source, anon read-only posture, baseline seeds, atomic sample RPC, Storage buckets/listing hardening, private helper hardening, and admin email uniqueness.',
);
