#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const BROWSER_KEY_NAMES = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
const ADMIN_TOKEN_NAMES = ['URBLO_ADMIN_ACCESS_TOKEN'];
const ADMIN_EMAIL_NAMES = ['URBLO_ADMIN_EMAIL', 'URBLO_FIRST_ADMIN_EMAIL'];
const ADMIN_PASSWORD_NAMES = ['URBLO_ADMIN_PASSWORD'];
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

const livePlan = [
  'Verify the signed-in admin profile is active owner/admin by reading through RLS.',
  'Create and archive a tagged draft site_settings row without touching the default settings row.',
  'Create and archive a tagged media_assets row; optionally upload a tiny private Storage object.',
  'Create tagged Stone Library group, variant, and finish capability records.',
  'Create tagged Product, model, material-default, and spec records.',
  'Create tagged Project, facts, material schedule, material map, and hotspot records.',
  'Create tagged Article metadata and structured block records.',
  'Create tagged private enquiry/sample-request QA rows, then update workflow fields.',
  'Record admin_audit_events for primary writes and export-gate actions.',
  'Leave tagged QA rows archived or private for auditability; no physical deletes are attempted.',
];

function parseArgs(argv) {
  const options = {
    accessToken: '',
    adminEmail: '',
    adminPassword: '',
    allowWrites: false,
    envFiles: [...DEFAULT_ENV_FILES],
    includeStorage: false,
    requiredRoles: ['owner', 'admin'],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--allow-writes') {
      options.allowWrites = true;
      continue;
    }

    if (arg === '--include-storage') {
      options.includeStorage = true;
      continue;
    }

    if (arg === '--admin-access-token') {
      options.accessToken = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--admin-access-token=')) {
      options.accessToken = arg.slice('--admin-access-token='.length);
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

function firstEnv(env, names) {
  const key = names.find((name) => env[name]);
  return key ? { key, value: env[key] } : { key: '', value: '' };
}

function loadConfig(env, options) {
  const browserKey = firstEnv(env, BROWSER_KEY_NAMES);
  const envAccessToken = firstEnv(env, ADMIN_TOKEN_NAMES);
  const envAdminEmail = firstEnv(env, ADMIN_EMAIL_NAMES);
  const envAdminPassword = firstEnv(env, ADMIN_PASSWORD_NAMES);

  return {
    accessToken: options.accessToken || envAccessToken.value,
    adminEmail: (options.adminEmail || envAdminEmail.value || '').trim().toLowerCase(),
    adminPassword: options.adminPassword || envAdminPassword.value,
    browserKey: browserKey.value,
    browserKeyName: browserKey.key,
    requiredRoles: options.requiredRoles,
    supabaseUrl: (env.VITE_SUPABASE_URL || env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(
      /\/$/,
      '',
    ),
  };
}

function assertWriteConfig(config) {
  const missing = [];
  if (!config.browserKey) {
    missing.push('VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY');
  }
  if (!config.accessToken && (!config.adminEmail || !config.adminPassword)) {
    missing.push('URBLO_ADMIN_ACCESS_TOKEN or URBLO_ADMIN_EMAIL + URBLO_ADMIN_PASSWORD');
  }

  if (missing.length > 0) {
    throw new Error(`Missing admin CRUD live inputs: ${missing.join(', ')}.`);
  }
}

function printPlan(config, options) {
  console.log('Admin CRUD live verification plan only.');
  console.log('No Supabase writes, Storage uploads, or deletes were attempted.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Browser key configured: ${config.browserKey ? config.browserKeyName : 'no'}`);
  console.log(`Admin token configured: ${config.accessToken ? 'yes' : 'no'}`);
  console.log(`Admin email configured: ${config.adminEmail ? 'yes' : 'no'}`);
  console.log(`Storage upload included when live: ${options.includeStorage ? 'yes' : 'no'}`);
  console.log('Live write mode requires --allow-writes plus either an admin access token or admin email/password.');
  console.log('Planned checks:');
  livePlan.forEach((item) => console.log(`- ${item}`));
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
    const detail = typeof json === 'string' ? json : JSON.stringify(json);
    throw new Error(`${context} failed with HTTP ${response.status}: ${detail.slice(0, 320)}`);
  }

  return json;
}

async function signIn(config) {
  if (config.accessToken) return config.accessToken;

  const body = JSON.stringify({
    email: config.adminEmail,
    password: config.adminPassword,
  });

  const json = await fetchJson(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: config.browserKey,
        'content-type': 'application/json',
      },
      body,
    },
    'Supabase Auth password sign-in',
  );

  assert.ok(json?.access_token, 'Supabase Auth did not return an access token.');
  return json.access_token;
}

async function getAuthUser(config, accessToken) {
  return fetchJson(
    `${config.supabaseUrl}/auth/v1/user`,
    {
      headers: authHeaders(config, accessToken),
    },
    'Supabase Auth user lookup',
  );
}

function buildQuery(select, filters = {}, extras = {}) {
  const query = new URLSearchParams({ select });
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, `eq.${value}`);
  }
  for (const [key, value] of Object.entries(extras)) {
    query.set(key, String(value));
  }
  return query.toString();
}

async function postgrest(config, accessToken, table, query = '', init = {}) {
  const suffix = query ? `?${query}` : '';
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}${suffix}`, {
    ...init,
    headers: {
      ...authHeaders(config, accessToken),
      'content-type': 'application/json',
      ...(init.method && init.method !== 'GET' ? { prefer: 'return=representation' } : {}),
      ...init.headers,
    },
  });

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
    const detail = typeof json === 'string' ? json : JSON.stringify(json);
    throw new Error(`PostgREST ${init.method || 'GET'} ${table} failed with HTTP ${response.status}: ${detail.slice(0, 320)}`);
  }

  return json;
}

async function selectRows(config, accessToken, table, filters = {}, select = '*', extras = {}) {
  return postgrest(config, accessToken, table, buildQuery(select, filters, extras));
}

async function selectAuditRowsByMarker(config, accessToken, marker) {
  const query = new URLSearchParams({ select: 'id,action,metadata' });
  query.set('metadata', `cs.${JSON.stringify({ marker })}`);
  return postgrest(config, accessToken, 'admin_audit_events', query.toString());
}

async function insertRow(config, accessToken, table, payload) {
  const rows = await postgrest(config, accessToken, table, '', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  assert.equal(rows.length, 1, `Expected ${table} insert to return one row.`);
  return rows[0];
}

async function updateById(config, accessToken, table, id, payload) {
  const rows = await postgrest(
    config,
    accessToken,
    table,
    buildQuery('*', { id }),
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  assert.equal(rows.length, 1, `Expected ${table} update for #${id} to return one row.`);
  return rows[0];
}

async function recordAudit(config, accessToken, userId, action, entityType, entityId, metadata) {
  return insertRow(config, accessToken, 'admin_audit_events', {
    actor_user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata,
  });
}

async function uploadStorageObject(config, accessToken, marker) {
  const objectPath = `live-check/${marker}.png`;
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/urblo-admin-media/${objectPath}`,
    {
      method: 'POST',
      headers: authHeaders(config, accessToken, {
        'cache-control': '3600',
        'content-type': 'image/png',
        'x-upsert': 'false',
      }),
      body: PNG_1X1,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Storage upload failed with HTTP ${response.status}: ${text.slice(0, 320)}`);
  }

  return {
    bucket: 'urblo-admin-media',
    objectPath,
  };
}

function markerSlug(marker) {
  return marker.replaceAll('_', '-').toLowerCase();
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const env = loadEnv(options.envFiles);
  const config = loadConfig(env, options);

  if (!options.allowWrites) {
    printPlan(config, options);
    return;
  }

  assertWriteConfig(config);

  const accessToken = await signIn(config);
  const authUser = await getAuthUser(config, accessToken);
  assert.ok(authUser?.id, 'Supabase Auth user lookup did not return a user id.');

  const profileRows = await selectRows(
    config,
    accessToken,
    'admin_profiles',
    { user_id: authUser.id, is_active: true },
    'user_id,email,display_name,role,is_active',
  );
  assert.equal(profileRows.length, 1, 'Expected one active admin_profiles row for the signed-in user.');

  const profile = profileRows[0];
  assert.ok(
    config.requiredRoles.includes(profile.role),
    `Signed-in admin role is ${profile.role}; expected ${config.requiredRoles.join(' or ')} for full live CRUD verification.`,
  );

  const finishRows = await selectRows(
    config,
    accessToken,
    'finish_definitions',
    { status: 'published' },
    'id,finish_key,display_name',
    { limit: 1, order: 'sort_order.asc' },
  );
  assert.equal(finishRows.length, 1, 'Expected at least one published finish definition.');
  const finish = finishRows[0];

  const marker = `admin-live-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const slug = markerSlug(marker);
  const metadata = { marker, source: 'scripts/check-admin-crud-live.mjs' };
  const created = [];

  console.log('Admin CRUD live verification starting.');
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Browser key source: ${config.browserKeyName}`);
  console.log(`Signed-in admin: ${profile.email} (${profile.role})`);
  console.log(`Marker: ${marker}`);

  const settings = await insertRow(config, accessToken, 'site_settings', {
    settings_key: marker,
    status: 'draft',
    company_name: `Urblo QA ${marker}`,
    social_links: {},
    footer_columns: [],
    seo: { title: `Urblo QA ${marker}` },
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`site_settings#${settings.id}`);
  await recordAudit(config, accessToken, authUser.id, 'site_settings.create', 'site_settings', settings.id, metadata);
  await updateById(config, accessToken, 'site_settings', settings.id, {
    status: 'archived',
    company_name: `Urblo QA archived ${marker}`,
    updated_by: authUser.id,
  });
  await recordAudit(config, accessToken, authUser.id, 'site_settings.update', 'site_settings', settings.id, metadata);

  const storageRef = options.includeStorage ? await uploadStorageObject(config, accessToken, marker) : null;
  const media = await insertRow(config, accessToken, 'media_assets', {
    status: 'draft',
    bucket: storageRef?.bucket ?? null,
    object_path: storageRef?.objectPath ?? null,
    source_url: storageRef ? null : `https://example.invalid/urblo/${slug}.jpg`,
    source_kind: storageRef ? 'storage' : 'external_legacy',
    media_type: 'image',
    mime_type: storageRef ? 'image/png' : 'image/jpeg',
    width_px: storageRef ? 1 : 1600,
    height_px: storageRef ? 1 : 900,
    size_bytes: storageRef ? PNG_1X1.length : null,
    alt: `Admin live QA ${marker}`,
    caption: 'Tagged admin live verification asset.',
    usage_notes: marker,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`media_assets#${media.id}`);
  await recordAudit(config, accessToken, authUser.id, 'media_asset.create', 'media_assets', media.id, metadata);
  await updateById(config, accessToken, 'media_assets', media.id, {
    status: 'archived',
    updated_by: authUser.id,
  });
  await recordAudit(config, accessToken, authUser.id, 'media_asset.archive', 'media_assets', media.id, metadata);

  const stoneGroup = await insertRow(config, accessToken, 'stone_groups', {
    stone_group_key: slug,
    display_name: `Admin Live Stone ${marker}`,
    status: 'draft',
    stone_type_display: 'Granite',
    summary: 'Tagged admin live verification row.',
    notes: marker,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`stone_groups#${stoneGroup.id}`);
  await recordAudit(config, accessToken, authUser.id, 'stone_group.create', 'stone_groups', stoneGroup.id, metadata);

  const stoneVariant = await insertRow(config, accessToken, 'stone_variants', {
    stone_group_id: stoneGroup.id,
    variant_key: 'default',
    display_name: 'Default QA variant',
    variant_type: 'none',
    status: 'draft',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`stone_variants#${stoneVariant.id}`);
  await recordAudit(config, accessToken, authUser.id, 'stone_variant.create', 'stone_variants', stoneVariant.id, metadata);

  const capability = await insertRow(config, accessToken, 'stone_finish_capabilities', {
    stone_variant_id: stoneVariant.id,
    finish_definition_id: finish.id,
    capability: 'tbc',
    sources: ['admin-live-check'],
    behavior_note: marker,
    admin_note: marker,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`stone_finish_capabilities#${capability.id}`);
  await recordAudit(
    config,
    accessToken,
    authUser.id,
    'stone_finish_capability.create',
    'stone_finish_capabilities',
    capability.id,
    metadata,
  );

  const product = await insertRow(config, accessToken, 'products', {
    slug,
    name: `Admin Live Product ${marker}`,
    status: 'draft',
    short_description: 'Tagged admin live verification product.',
    sort_order: 9999,
    seo: {},
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`products#${product.id}`);
  await recordAudit(config, accessToken, authUser.id, 'product.create', 'products', product.id, metadata);

  const productModel = await insertRow(config, accessToken, 'product_models', {
    product_id: product.id,
    model_key: 'qa-model',
    label: 'QA Model',
    status: 'draft',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`product_models#${productModel.id}`);
  await recordAudit(config, accessToken, authUser.id, 'product_model.create', 'product_models', productModel.id, metadata);

  const productDefault = await insertRow(config, accessToken, 'product_material_defaults', {
    product_id: product.id,
    material_category: 'body',
    stone_group_id: stoneGroup.id,
    display_label: `QA stone ${marker}`,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`product_material_defaults#${productDefault.id}`);
  await recordAudit(
    config,
    accessToken,
    authUser.id,
    'product_material_default.create',
    'product_material_defaults',
    productDefault.id,
    metadata,
  );

  const productSpec = await insertRow(config, accessToken, 'product_specs', {
    product_id: product.id,
    spec_label: 'QA marker',
    spec_value: marker,
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`product_specs#${productSpec.id}`);
  await recordAudit(config, accessToken, authUser.id, 'product_spec.create', 'product_specs', productSpec.id, metadata);

  const project = await insertRow(config, accessToken, 'projects', {
    slug,
    title: `Admin Live Project ${marker}`,
    status: 'draft',
    location: 'QA',
    summary: 'Tagged admin live verification project.',
    claim_review_status: 'needs_review',
    sort_order: 9999,
    seo: {},
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`projects#${project.id}`);
  await recordAudit(config, accessToken, authUser.id, 'project.create', 'projects', project.id, metadata);

  const projectFact = await insertRow(config, accessToken, 'project_facts', {
    project_id: project.id,
    fact_label: 'QA marker',
    fact_value: marker,
    claim_status: 'needs_review',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`project_facts#${projectFact.id}`);
  await recordAudit(config, accessToken, authUser.id, 'project_fact.create', 'project_facts', projectFact.id, metadata);

  const projectMaterial = await insertRow(config, accessToken, 'project_materials', {
    project_id: project.id,
    stone_group_id: stoneGroup.id,
    finish_definition_id: finish.id,
    application: 'QA application',
    note: marker,
    claim_status: 'needs_review',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`project_materials#${projectMaterial.id}`);
  await recordAudit(
    config,
    accessToken,
    authUser.id,
    'project_material.create',
    'project_materials',
    projectMaterial.id,
    metadata,
  );

  const materialMap = await insertRow(config, accessToken, 'project_material_maps', {
    project_id: project.id,
    media_asset_id: media.id,
    title: 'QA material map',
    intro: marker,
    status: 'draft',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`project_material_maps#${materialMap.id}`);
  await recordAudit(
    config,
    accessToken,
    authUser.id,
    'project_material_map.create',
    'project_material_maps',
    materialMap.id,
    metadata,
  );

  const hotspot = await insertRow(config, accessToken, 'project_hotspots', {
    project_material_map_id: materialMap.id,
    project_material_id: projectMaterial.id,
    hotspot_key: 'qa-hotspot',
    x_percent: 50,
    y_percent: 50,
    label: 'QA hotspot',
    application: 'QA application',
    note: marker,
    status: 'draft',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`project_hotspots#${hotspot.id}`);
  await recordAudit(config, accessToken, authUser.id, 'project_hotspot.create', 'project_hotspots', hotspot.id, metadata);

  const article = await insertRow(config, accessToken, 'articles', {
    slug,
    title: `Admin Live Article ${marker}`,
    status: 'draft',
    author: 'Urblo QA',
    excerpt: 'Tagged admin live verification article.',
    tags: ['qa'],
    seo: {},
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`articles#${article.id}`);
  await recordAudit(config, accessToken, authUser.id, 'article.create', 'articles', article.id, metadata);

  const articleBlock = await insertRow(config, accessToken, 'article_blocks', {
    article_id: article.id,
    block_type: 'rich_text',
    content: { markdown: `QA block ${marker}` },
    linked_project_id: project.id,
    linked_stone_group_id: stoneGroup.id,
    status: 'draft',
    sort_order: 0,
    created_by: authUser.id,
    updated_by: authUser.id,
  });
  created.push(`article_blocks#${articleBlock.id}`);
  await recordAudit(config, accessToken, authUser.id, 'article_block.create', 'article_blocks', articleBlock.id, metadata);

  const enquiry = await insertRow(config, accessToken, 'enquiries', {
    status: 'new',
    name: `Admin Live ${marker}`,
    email: `${slug}@example.invalid`,
    phone: '+61000000000',
    company: 'Urblo QA',
    project_type: 'admin-live-check',
    message: marker,
    source_route: '/admin-live-check',
    turnstile_success: null,
    notification_status: 'not_required',
  });
  created.push(`enquiries#${enquiry.id}`);

  const sampleRequest = await insertRow(config, accessToken, 'sample_requests', {
    status: 'new',
    name: `Admin Live ${marker}`,
    email: `${slug}@example.invalid`,
    phone: '+61000000000',
    company: 'Urblo QA',
    shipping_address: 'Admin live check only',
    project_name: marker,
    message: marker,
    source_route: '/admin-live-check',
    turnstile_success: null,
    notification_status: 'not_required',
  });
  created.push(`sample_requests#${sampleRequest.id}`);

  const sampleItem = await insertRow(config, accessToken, 'sample_request_items', {
    sample_request_id: sampleRequest.id,
    stone_group_id: stoneGroup.id,
    finish_definition_id: finish.id,
    quantity: 1,
    notes: marker,
  });
  created.push(`sample_request_items#${sampleItem.id}`);

  await updateById(config, accessToken, 'enquiries', enquiry.id, {
    status: 'contacted',
    assigned_to: authUser.id,
    internal_notes: marker,
  });
  await recordAudit(config, accessToken, authUser.id, 'enquiry.workflow_update', 'enquiries', enquiry.id, metadata);

  await updateById(config, accessToken, 'sample_requests', sampleRequest.id, {
    status: 'confirmed',
    assigned_to: authUser.id,
    internal_notes: marker,
  });
  await recordAudit(
    config,
    accessToken,
    authUser.id,
    'sample_request.workflow_update',
    'sample_requests',
    sampleRequest.id,
    metadata,
  );

  for (const [table, id, action, entityType] of [
    ['project_hotspots', hotspot.id, 'project_hotspot.archive', 'project_hotspots'],
    ['project_material_maps', materialMap.id, 'project_material_map.archive', 'project_material_maps'],
    ['projects', project.id, 'project.archive', 'projects'],
    ['article_blocks', articleBlock.id, 'article_block.archive', 'article_blocks'],
    ['articles', article.id, 'article.archive', 'articles'],
    ['product_models', productModel.id, 'product_model.archive', 'product_models'],
    ['products', product.id, 'product.archive', 'products'],
    ['stone_variants', stoneVariant.id, 'stone_variant.archive', 'stone_variants'],
    ['stone_groups', stoneGroup.id, 'stone_group.archive', 'stone_groups'],
  ]) {
    await updateById(config, accessToken, table, id, {
      status: 'archived',
      updated_by: authUser.id,
    });
    await recordAudit(config, accessToken, authUser.id, action, entityType, id, metadata);
  }

  await recordAudit(config, accessToken, authUser.id, 'media_assets.export_manifest', 'media_assets', null, {
    ...metadata,
    checked_ids: [media.id],
  });
  await recordAudit(config, accessToken, authUser.id, 'leads.export_csv', 'leads', null, {
    ...metadata,
    checked_ids: { enquiries: [enquiry.id], sample_requests: [sampleRequest.id] },
  });

  const auditRows = await selectAuditRowsByMarker(config, accessToken, marker);
  assert.ok(auditRows.length >= 24, `Expected at least 24 tagged audit rows, found ${auditRows.length}.`);

  console.log('Admin CRUD live verification passed.');
  console.log(`Created tagged QA rows: ${created.join(', ')}`);
  if (storageRef) {
    console.log(`Uploaded tagged private Storage object: ${storageRef.bucket}/${storageRef.objectPath}`);
  }
  console.log(`Audit rows recorded: ${auditRows.length}`);
  console.log('Tagged rows are retained for auditability; cleanup is intentionally not destructive.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
