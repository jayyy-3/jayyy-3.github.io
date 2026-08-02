#!/usr/bin/env node
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from './_lib/live-input-validation.mjs';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const BROWSER_KEY_NAMES = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
const ADMIN_EMAIL_NAMES = ['URBLO_ADMIN_EMAIL'];
const ADMIN_PASSWORD_NAMES = ['URBLO_ADMIN_PASSWORD'];

const livePlan = [
  'Load the reviewed .tmp/content-import-preview.json draft payload.',
  'Sign in as an active Urblo owner/admin through the browser-safe Supabase key.',
  'Upsert media, Stone Library, Products, Articles, and dependent rows as draft/import content.',
  'Refuse payloads containing Project rows: Projects must be imported through the protected aggregate endpoint, never direct browser-key table writes.',
  'Keep every imported public-content row in draft status; no rows are published or deleted.',
  'Read back imported row counts and verify anonymous public reads still expose zero imported draft rows.',
];

function parseArgs(argv) {
  const options = {
    allowWrites: false,
    adminEmail: '',
    adminPassword: '',
    envFiles: [...DEFAULT_ENV_FILES],
    input: '.tmp/content-import-preview.json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-writes') {
      options.allowWrites = true;
      continue;
    }
    if (arg === '--input') {
      options.input = argv[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg.startsWith('--input=')) {
      options.input = arg.slice('--input='.length);
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
    if (arg === '--admin-password') {
      options.adminPassword = argv[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg.startsWith('--admin-password=')) {
      options.adminPassword = arg.slice('--admin-password='.length);
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value) parsed[match[1]] = value;
  }
  return parsed;
}

function resolveEnv(options) {
  const fileEnv = options.envFiles.reduce((env, file) => ({ ...env, ...parseEnvFile(file) }), {});
  const env = { ...fileEnv, ...process.env };
  const browserKeyName = BROWSER_KEY_NAMES.find((name) => env[name]);
  return {
    supabaseUrl: env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    browserKey: browserKeyName ? env[browserKeyName] : '',
    browserKeyName,
    adminEmail: options.adminEmail || ADMIN_EMAIL_NAMES.map((name) => env[name]).find(Boolean) || '',
    adminPassword: options.adminPassword || ADMIN_PASSWORD_NAMES.map((name) => env[name]).find(Boolean) || '',
  };
}

function assertDraftRows(payload) {
  for (const [table, rows] of Object.entries(payload.rows ?? {})) {
    if (!Array.isArray(rows)) continue;
    for (const [index, row] of rows.entries()) {
      if ('status' in row && row.status !== 'draft') {
        throw new Error(`${table}[${index}] is ${row.status}; live import only accepts draft rows`);
      }
    }
  }
}

function rows(payload, table) {
  return Array.isArray(payload.rows?.[table]) ? payload.rows[table] : [];
}

const PROJECT_IMPORT_TABLES = [
  'projects',
  'project_facts',
  'project_materials',
  'project_material_maps',
  'project_media',
  'project_hotspots',
];

function assertNoDirectProjectImport(payload) {
  const populated = PROJECT_IMPORT_TABLES.filter((table) => rows(payload, table).length > 0);
  if (populated.length) {
    throw new Error(
      `Project import requires the protected aggregate endpoint; direct browser-key import is disabled for: ${populated.join(', ')}`,
    );
  }
}

function byKey(rowsToIndex, key) {
  return new Map(rowsToIndex.map((row) => [row[key], row]));
}

function byComposite(rowsToIndex, keys) {
  return new Map(rowsToIndex.map((row) => [keys.map((key) => row[key] ?? '').join('\u0000'), row]));
}

async function selectOne(supabase, table, filters, columns = '*') {
  let query = supabase.from(table).select(columns).limit(1);
  for (const [column, value] of Object.entries(filters)) {
    query = value === null ? query.is(column, null) : query.eq(column, value);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`${table} select failed: ${error.message}`);
  return data;
}

async function insertRow(supabase, table, row) {
  const { data, error } = await supabase.from(table).insert(row).select('*').single();
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return data;
}

async function updateRow(supabase, table, id, row) {
  const { data, error } = await supabase.from(table).update(row).eq('id', id).select('*').single();
  if (error) throw new Error(`${table} update failed: ${error.message}`);
  return data;
}

async function putRow(supabase, table, filters, row) {
  const existing = await selectOne(supabase, table, filters, 'id');
  return existing ? updateRow(supabase, table, existing.id, row) : insertRow(supabase, table, row);
}

async function countImported(supabase, table, column, values) {
  if (!values.length) return 0;
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .in(column, values);
  if (error) throw new Error(`${table} count failed: ${error.message}`);
  return count ?? 0;
}

function mediaSource(row, sourceKey = 'media_source_url') {
  return row[sourceKey] ? String(row[sourceKey]) : null;
}

async function runImport(supabase, payload) {
  const imported = {};
  const mediaBySource = new Map();
  const finishByKey = new Map();
  const stoneGroupByKey = new Map();
  const stoneVariantByKey = new Map();
  const productBySlug = new Map();
  const articleBySlug = new Map();

  for (const row of rows(payload, 'media_assets')) {
    const saved = await putRow(
      supabase,
      'media_assets',
      { source_url: row.source_url },
      {
        status: 'draft',
        source_url: row.source_url,
        source_kind: row.source_kind,
        media_type: row.media_type,
        alt: row.alt,
        usage_notes: Array.isArray(row.usage) ? row.usage.join('\n') : null,
      },
    );
    mediaBySource.set(row.source_url, saved);
  }
  imported.media_assets = mediaBySource.size;

  const { data: finishes, error: finishesError } = await supabase
    .from('finish_definitions')
    .select('id, finish_key')
    .in('finish_key', [...new Set(rows(payload, 'stone_finish_capabilities').map((row) => row.finish_key))]);
  if (finishesError) throw new Error(`finish_definitions select failed: ${finishesError.message}`);
  for (const finish of finishes ?? []) finishByKey.set(finish.finish_key, finish);

  for (const row of rows(payload, 'stone_groups')) {
    const saved = await putRow(
      supabase,
      'stone_groups',
      { stone_group_key: row.stone_group_key },
      { ...row, status: 'draft' },
    );
    stoneGroupByKey.set(row.stone_group_key, saved);
  }
  imported.stone_groups = stoneGroupByKey.size;

  for (const row of rows(payload, 'stone_variants')) {
    const stoneGroup = stoneGroupByKey.get(row.stone_group_key);
    if (!stoneGroup) throw new Error(`Missing stone group for variant ${row.variant_key}`);
    const saved = await putRow(
      supabase,
      'stone_variants',
      { stone_group_id: stoneGroup.id, variant_key: row.variant_key },
      {
        stone_group_id: stoneGroup.id,
        variant_key: row.variant_key,
        display_name: row.display_name,
        source_variant: row.source_variant,
        variant_type: row.variant_type,
        status: 'draft',
        sort_order: row.sort_order,
      },
    );
    stoneVariantByKey.set(row.variant_key, saved);
  }
  imported.stone_variants = stoneVariantByKey.size;

  for (const row of rows(payload, 'stone_finish_capabilities')) {
    const variant = stoneVariantByKey.get(row.stone_variant_key);
    const finish = finishByKey.get(row.finish_key);
    if (!variant || !finish) throw new Error(`Missing variant/finish for ${row.stone_variant_key}/${row.finish_key}`);
    await putRow(
      supabase,
      'stone_finish_capabilities',
      { stone_variant_id: variant.id, finish_definition_id: finish.id },
      {
        stone_variant_id: variant.id,
        finish_definition_id: finish.id,
        capability: row.capability,
        sources: row.sources ?? [],
      },
    );
  }
  imported.stone_finish_capabilities = rows(payload, 'stone_finish_capabilities').length;

  for (const row of rows(payload, 'stone_finish_images')) {
    const group = stoneGroupByKey.get(row.stone_group_key);
    const variant = stoneVariantByKey.get(row.stone_variant_key);
    const finish = finishByKey.get(row.finish_key);
    const media = mediaBySource.get(mediaSource(row));
    if (!media) throw new Error(`Missing media for stone finish image ${mediaSource(row)}`);
    await putRow(
      supabase,
      'stone_finish_images',
      {
        stone_variant_id: variant?.id ?? null,
        finish_definition_id: finish?.id ?? null,
        media_asset_id: media.id,
      },
      {
        stone_group_id: group?.id ?? null,
        stone_variant_id: variant?.id ?? null,
        finish_definition_id: finish?.id ?? null,
        media_asset_id: media.id,
        image_role: row.image_role,
        sort_order: row.sort_order,
        status: 'draft',
      },
    );
  }
  imported.stone_finish_images = rows(payload, 'stone_finish_images').length;

  for (const row of rows(payload, 'products')) {
    const saved = await putRow(
      supabase,
      'products',
      { slug: row.slug },
      {
        slug: row.slug,
        name: row.name,
        status: 'draft',
        short_description: row.short_description,
        sort_order: row.sort_order,
      },
    );
    productBySlug.set(row.slug, saved);
  }
  imported.products = productBySlug.size;

  for (const row of rows(payload, 'product_models')) {
    const product = productBySlug.get(row.product_slug);
    const media = mediaBySource.get(mediaSource(row, 'image_source_url'));
    if (!product) throw new Error(`Missing product for model ${row.product_slug}/${row.model_key}`);
    await putRow(
      supabase,
      'product_models',
      { product_id: product.id, model_key: row.model_key },
      {
        product_id: product.id,
        model_key: row.model_key,
        label: row.label,
        image_media_id: media?.id ?? null,
        status: 'draft',
        sort_order: row.sort_order,
      },
    );
  }
  imported.product_models = rows(payload, 'product_models').length;

  for (const row of rows(payload, 'product_material_defaults')) {
    const product = productBySlug.get(row.product_slug);
    if (!product) throw new Error(`Missing product for material default ${row.product_slug}`);
    await putRow(
      supabase,
      'product_material_defaults',
      { product_id: product.id, material_category: row.material_category },
      {
        product_id: product.id,
        material_category: row.material_category,
        stone_group_id: stoneGroupByKey.get(row.stone_group_key)?.id ?? null,
        material_slug: row.material_slug,
        display_label: row.display_label,
      },
    );
  }
  imported.product_material_defaults = rows(payload, 'product_material_defaults').length;

  for (const row of rows(payload, 'product_specs')) {
    const product = productBySlug.get(row.product_slug);
    if (!product) throw new Error(`Missing product for spec ${row.product_slug}`);
    await putRow(
      supabase,
      'product_specs',
      { product_id: product.id, spec_label: row.spec_label },
      {
        product_id: product.id,
        spec_label: row.spec_label,
        spec_value: row.spec_value,
        sort_order: row.sort_order,
      },
    );
  }
  imported.product_specs = rows(payload, 'product_specs').length;

  for (const row of rows(payload, 'articles')) {
    const cover = mediaBySource.get(mediaSource(row, 'cover_source_url'));
    const saved = await putRow(
      supabase,
      'articles',
      { slug: row.slug },
      {
        slug: row.slug,
        title: row.title,
        status: 'draft',
        published_on: row.published_on,
        author: row.author,
        excerpt: row.excerpt,
        cover_media_id: cover?.id ?? null,
        tags: row.tags ?? [],
        legacy_source_path: row.legacy_source_path,
        sort_order: row.sort_order,
      },
    );
    articleBySlug.set(row.slug, saved);
  }
  imported.articles = articleBySlug.size;

  for (const row of rows(payload, 'article_blocks')) {
    const article = articleBySlug.get(row.article_slug);
    const media = mediaBySource.get(mediaSource(row));
    if (!article) throw new Error(`Missing article for block ${row.article_slug}`);
    await putRow(
      supabase,
      'article_blocks',
      { article_id: article.id, sort_order: row.sort_order },
      {
        article_id: article.id,
        block_type: row.block_type,
        content: row.content ?? {},
        media_asset_id: media?.id ?? null,
        sort_order: row.sort_order,
        status: 'draft',
      },
    );
  }
  imported.article_blocks = rows(payload, 'article_blocks').length;

  return imported;
}

async function verifyAnonymousBoundary(supabaseUrl, browserKey, payload) {
  const anon = createClient(supabaseUrl, browserKey, { auth: { persistSession: false } });
  const checks = [
    ['stone_groups', 'stone_group_key', rows(payload, 'stone_groups').map((row) => row.stone_group_key)],
    ['products', 'slug', rows(payload, 'products').map((row) => row.slug)],
    ['articles', 'slug', rows(payload, 'articles').map((row) => row.slug)],
  ];

  for (const [table, column, values] of checks) {
    const { count, error } = await anon
      .from(table)
      .select('id', { count: 'exact', head: true })
      .in(column, values);
    if (error) throw new Error(`${table} anonymous boundary check failed: ${error.message}`);
    if ((count ?? 0) !== 0) {
      throw new Error(`${table} anonymous boundary exposed ${count} imported draft rows`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(options.input)) {
    throw new Error(`Missing input payload: ${options.input}. Run npm run agent:content-import -- --out ${options.input} first.`);
  }

  const payload = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  assertDraftRows(payload);
  const env = resolveEnv(options);

  console.log('Content import live runner.');
  console.log('Secrets are never printed; only variable names and plan status are reported.');
  console.log(`Input payload: ${options.input}`);
  console.log(`Tables in payload: ${Object.keys(payload.rows ?? {}).filter((key) => Array.isArray(payload.rows[key])).length}`);

  if (!options.allowWrites) {
    console.log('Plan-only mode. No Supabase login was attempted and no rows were changed.');
    livePlan.forEach((step, index) => console.log(`${index + 1}. ${step}`));
    console.log('Required for live writes: --allow-writes, browser key, URBLO_ADMIN_EMAIL, URBLO_ADMIN_PASSWORD.');
    return;
  }

  assertNoDirectProjectImport(payload);

  const missing = [];
  if (!env.browserKey) missing.push(BROWSER_KEY_NAMES.join(' or '));
  if (!isValidEmail(env.adminEmail)) missing.push('valid URBLO_ADMIN_EMAIL');
  if (!env.adminPassword) missing.push('URBLO_ADMIN_PASSWORD');
  if (missing.length) {
    throw new Error(`Content import is not runnable; missing: ${missing.join('; ')}`);
  }

  const supabase = createClient(env.supabaseUrl, env.browserKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: env.adminEmail,
    password: env.adminPassword,
  });
  if (authError || !authData.user) {
    throw new Error(`Admin sign-in failed: ${authError?.message ?? 'missing user'}`);
  }

  const profile = await selectOne(
    supabase,
    'admin_profiles',
    { user_id: authData.user.id, is_active: true },
    'user_id, role, email, is_active',
  );
  if (!profile || !['owner', 'admin'].includes(profile.role)) {
    throw new Error('Signed-in user is not an active owner/admin profile.');
  }

  const imported = await runImport(supabase, payload);

  const storedCounts = {
    stone_groups: await countImported(supabase, 'stone_groups', 'stone_group_key', rows(payload, 'stone_groups').map((row) => row.stone_group_key)),
    products: await countImported(supabase, 'products', 'slug', rows(payload, 'products').map((row) => row.slug)),
    articles: await countImported(supabase, 'articles', 'slug', rows(payload, 'articles').map((row) => row.slug)),
  };

  await verifyAnonymousBoundary(env.supabaseUrl, env.browserKey, payload);

  console.log('Content import live runner passed.');
  console.log(`Browser key source: ${env.browserKeyName}`);
  console.log(`Signed-in profile role: ${profile.role}`);
  console.log(`Imported draft rows: ${JSON.stringify(imported)}`);
  console.log(`Stored parent counts: ${JSON.stringify(storedCounts)}`);
  console.log('Verified anonymous browser-key reads expose zero imported draft parent rows.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
