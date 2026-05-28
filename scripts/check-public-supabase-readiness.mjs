#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, exit } from 'node:process';

const root = cwd();
const failures = [];

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

const publicSelectPolicies = [
  'media_assets_public_select',
  'site_settings_public_select',
  'finish_definitions_public_select',
  'stone_groups_public_select',
  'stone_variants_public_select',
  'stone_finish_capabilities_public_select',
  'stone_finish_images_public_select',
  'products_public_select',
  'product_models_public_select',
  'product_material_defaults_public_select',
  'product_specs_public_select',
  'projects_public_select',
  'project_facts_public_select',
  'project_media_public_select',
  'project_materials_public_select',
  'project_material_maps_public_select',
  'project_hotspots_public_select',
  'articles_public_select',
  'article_blocks_public_select',
];

const privateTables = [
  'admin_profiles',
  'admin_audit_events',
  'enquiries',
  'sample_requests',
  'sample_request_items',
];

const publicRoutes = [
  '/',
  '/stone-library',
  '/stone-library/:stoneGroupId',
  '/products',
  '/products/:slug',
  '/projects',
  '/projects/:slug',
  '/articles',
  '/articles/:slug',
  '/contact',
];

function readRequired(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`Missing file: ${relativePath}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
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

function walkFiles(relativeDir) {
  const absoluteDir = join(root, relativeDir);
  const results = [];

  for (const entry of readdirSync(absoluteDir)) {
    const relativePath = join(relativeDir, entry);
    const absolutePath = join(root, relativePath);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      results.push(...walkFiles(relativePath));
    } else {
      results.push(relativePath);
    }
  }

  return results;
}

function getContentImportPayload() {
  const stdout = execFileSync(process.execPath, ['scripts/check-content-import-readiness.mjs', '--json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  return JSON.parse(stdout);
}

function checkContentImportPayload(payload) {
  if (payload.summary.blockers !== 0) {
    failures.push(`content import dry run has ${payload.summary.blockers} blockers`);
  }
  if (payload.summary.warnings !== 0) {
    failures.push(`content import dry run has ${payload.summary.warnings} warnings`);
  }

  for (const [table, rows] of Object.entries(payload.rows)) {
    if (!Array.isArray(rows)) continue;

    const planEntry = payload.importPlan.applyOrder.find((entry) => entry.table === table);
    if (planEntry && planEntry.count !== rows.length) {
      failures.push(`${table}: import plan count ${planEntry.count} does not match row count ${rows.length}`);
    }

    for (const [index, row] of rows.entries()) {
      if ('status' in row && row.status !== 'draft') {
        failures.push(`${table}[${index}]: import status must be draft, got ${row.status}`);
      }
      if ('local_file_exists' in row && row.local_file_exists !== true) {
        failures.push(`${table}[${index}]: media candidate does not have a controlled local file`);
      }
    }
  }

  requireIncludes(
    payload.importPolicy.note,
    'Do not apply as published client-approved content without review',
    'content import policy',
  );
  requireIncludes(
    payload.importPlan.verification.join('\n'),
    'Run public route smoke tests before switching any public read path from static files to Supabase',
    'content import plan verification',
  );
}

function checkSupabasePolicySource() {
  const foundation = readRequired('supabase/migrations/202605270001_foundation_schema.sql');
  const hardening = readRequired('supabase/migrations/202605270002_foundation_hardening.sql');
  const anonReadOnly = readRequired('supabase/migrations/202605270003_anon_read_only.sql');

  for (const table of publicContentTables) {
    requireIncludes(foundation, `alter table public.${table} enable row level security`, 'foundation_schema');
    requireIncludes(anonReadOnly, `public.${table}`, 'anon_read_only');
  }

  for (const policy of publicSelectPolicies) {
    requireIncludes(foundation, `create policy ${policy}`, 'foundation_schema');
  }

  for (const fragment of [
    "using (status = 'published')",
    "status = 'published'",
    "claim_status = 'approved'",
    "fd.status = 'published'",
    "ma.status = 'published'",
  ]) {
    requireIncludes(foundation, fragment, 'foundation_schema public read policies');
  }

  requireIncludes(
    anonReadOnly,
    'revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon',
    'anon_read_only',
  );
  requireIncludes(anonReadOnly, 'to anon', 'anon_read_only');

  for (const table of privateTables) {
    requireIncludes(hardening, `revoke all on table public.${table} from anon`, 'foundation_hardening');
  }
}

function checkPublicRuntimeBoundary() {
  const app = readRequired('src/App.tsx');

  for (const route of publicRoutes) {
    requireIncludes(app, route, 'src/App.tsx');
  }
  requireIncludes(app, '/admin/*', 'src/App.tsx');

  const scannedFiles = walkFiles('src').filter((file) => {
    if (!/\.(tsx?|jsx?)$/.test(file)) return false;
    if (file === 'src/vite-env.d.ts') return false;
    if (file.startsWith('src/pages/admin/')) return false;
    if (file.startsWith('src/lib/admin')) return false;
    if (file === 'src/lib/supabaseClient.ts') return false;
    return true;
  });

  for (const file of scannedFiles) {
    const text = readRequired(file);
    for (const forbidden of ['@supabase/supabase-js', 'supabaseClient', 'VITE_SUPABASE_', "from('stone_groups')"]) {
      if (text.includes(forbidden)) {
        failures.push(`${file}: public runtime must stay static/file-backed until approved cutover; found ${forbidden}`);
      }
    }
  }
}

function checkCloudflareStaticBoundary() {
  const redirects = readRequired('public/_redirects');
  const routes = JSON.parse(readRequired('public/_routes.json'));

  requireRegex(redirects, /\/\* \/index\.html 200\s*$/m, 'public/_redirects', 'Cloudflare SPA fallback');

  if (routes.version !== 1) {
    failures.push('public/_routes.json: version must be 1');
  }
  if (!Array.isArray(routes.include) || routes.include.length !== 1 || routes.include[0] !== '/api/*') {
    failures.push('public/_routes.json: include must remain exactly ["/api/*"]');
  }
  if (!Array.isArray(routes.exclude) || routes.exclude.length !== 0) {
    failures.push('public/_routes.json: exclude must remain an empty array');
  }
}

function checkDocsContracts() {
  const architecture = readRequired('docs/ARCHITECTURE.md');
  const schema = readRequired('docs/SUPABASE_SCHEMA.md');
  const handoff = readRequired('docs/HANDOFF.md');

  for (const fragment of [
    'Public Stone Library routes remain static/file-backed',
    'Public Project routes remain static/file-backed',
    'Public Product routes remain static/file-backed',
    'Public Article routes remain static/file-backed',
  ]) {
    requireIncludes(schema, fragment, 'docs/SUPABASE_SCHEMA.md');
  }

  for (const fragment of [
    'Public routes continue exposing only published content',
    'Static-file fallback remains available until each content type is fully migrated',
    'public read path',
  ]) {
    requireIncludes(schema, fragment, 'docs/SUPABASE_SCHEMA.md');
  }

  requireIncludes(architecture, 'public page components are lazy-loaded', 'docs/ARCHITECTURE.md');
  requireIncludes(architecture, 'Public Projects, Stone Library, Products, and Articles remain file-backed', 'docs/ARCHITECTURE.md');
  requireIncludes(handoff, 'content import/public-read preparation', 'docs/HANDOFF.md');
}

const payload = getContentImportPayload();

checkContentImportPayload(payload);
checkSupabasePolicySource();
checkPublicRuntimeBoundary();
checkCloudflareStaticBoundary();
checkDocsContracts();

if (failures.length) {
  console.error('Public Supabase readiness checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log('Public Supabase readiness checks passed.');
console.log(
  [
    `Verified ${payload.summary.stone_groups} stone groups, ${payload.summary.products} products, ${payload.summary.projects} projects, and ${payload.summary.articles} articles remain draft in the import dry run.`,
    'Verified published-only public RLS policy source, read-only anon grants, static public runtime boundary, Cloudflare SPA/API routing scope, and cutover docs.',
  ].join('\n'),
);
