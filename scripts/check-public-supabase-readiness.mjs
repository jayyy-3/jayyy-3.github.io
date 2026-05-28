#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
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

function getContentImportApplySql() {
  const tmpRoot = join(root, '.tmp');
  mkdirSync(tmpRoot, { recursive: true });

  const tmpDir = mkdtempSync(join(tmpRoot, 'public-supabase-readiness-'));
  const relativeTmpDir = relative(root, tmpDir);
  const applySqlPath = join(relativeTmpDir, 'content-import-apply.sql');

  try {
    execFileSync(
      process.execPath,
      [
        'scripts/check-content-import-readiness.mjs',
        '--out',
        join(relativeTmpDir, 'content-import-preview.json'),
        '--plan-out',
        join(relativeTmpDir, 'content-import-plan.md'),
        '--preflight-sql-out',
        join(relativeTmpDir, 'content-import-preflight.sql'),
        '--apply-sql-out',
        applySqlPath,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      },
    );

    return readFileSync(join(root, applySqlPath), 'utf8');
  } finally {
    rmSync(tmpDir, { force: true, recursive: true });
  }
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

function checkDraftImportSqlArtifact(applySql, payload) {
  for (const fragment of [
    '-- Urblo guarded draft content import',
    '-- It imports rows as draft/private review data only; it does not publish content or delete data.',
    "-- set local urblo.import_approved = 'true';",
    "current_setting('urblo.import_approved', true)",
    "raise exception 'Urblo draft import is not approved.",
    'begin;',
    'commit;',
  ]) {
    requireIncludes(applySql, fragment, 'guarded draft content import SQL');
  }

  if (/^\s*set\s+local\s+urblo\.import_approved\s*=\s*'true';/im.test(applySql)) {
    failures.push('guarded draft content import SQL: approval gate must remain commented by default');
  }

  const destructiveStatements = [
    /^\s*delete\s+from\b/im,
    /^\s*truncate\b/im,
    /^\s*drop\s+(table|schema|policy|function|view)\b/im,
    /^\s*alter\s+table\b.*\bdisable\s+row\s+level\s+security\b/im,
  ];
  for (const pattern of destructiveStatements) {
    if (pattern.test(applySql)) {
      failures.push(`guarded draft content import SQL: destructive statement matched ${pattern}`);
    }
  }

  const publicationPatterns = [
    /\bstatus\s*=\s*'published'\b/i,
    /\bselect\s+'published'\b/i,
    /\bpublished_at\s*=/i,
  ];
  for (const pattern of publicationPatterns) {
    if (pattern.test(applySql)) {
      failures.push(`guarded draft content import SQL: publication statement matched ${pattern}`);
    }
  }

  const importedStatusPatterns = [
    /\bstatus\s*=\s*excluded\.status\b/i,
    /\bstatus\s*=\s*r\.status\b/i,
    /\binsert\s+into\s+public\.\w+\s*\([^)]*\bstatus\b[^)]*\)\s*select[^;]*\br\.status\b/is,
  ];
  for (const pattern of importedStatusPatterns) {
    if (pattern.test(applySql)) {
      failures.push(`guarded draft content import SQL: status must be forced to draft, matched ${pattern}`);
    }
  }

  for (const item of payload.importPlan.applyOrder) {
    requireIncludes(
      applySql,
      `('${item.table}', ${item.count}::bigint)`,
      'guarded draft content import SQL summary',
    );
  }
}

function blockText(block) {
  const content = block.content ?? {};
  return [content.body, content.title, content.label, content.alt].filter(Boolean).join(' ');
}

function checkArticleBlockPayload(payload) {
  const articleRows = Array.isArray(payload.rows.articles) ? payload.rows.articles : [];
  const articleBlocks = Array.isArray(payload.rows.article_blocks) ? payload.rows.article_blocks : [];
  const mediaSourceUrls = new Set((payload.rows.media_assets ?? []).map((row) => row.source_url).filter(Boolean));

  if (articleBlocks.length <= articleRows.length) {
    failures.push('article_blocks: expected structured draft blocks, not one placeholder block per article');
  }

  if (articleBlocks.some((block) => block.content?.migrationStatus === 'legacy_newsletter_requires_structured_review')) {
    failures.push('article_blocks: legacy placeholder migration status remains in import payload');
  }

  const imageBlocks = articleBlocks.filter((block) => block.block_type === 'image');
  if (imageBlocks.length === 0) {
    failures.push('article_blocks: expected at least one image block extracted from legacy article HTML');
  }

  for (const [index, block] of imageBlocks.entries()) {
    if (!block.media_source_url) {
      failures.push(`article_blocks image[${index}]: missing media_source_url`);
      continue;
    }
    if (!mediaSourceUrls.has(block.media_source_url)) {
      failures.push(`article_blocks image[${index}]: media_source_url is not present in media_assets candidates`);
    }
    if (block.media_source_url.includes('/media/launch/articles/shared/')) {
      failures.push(`article_blocks image[${index}]: newsletter shared/social image should not be imported`);
    }
  }

  const forbiddenNewsletterText = [
    /^ready to (transform|experiment)/i,
    /^call:\s*1300/i,
    /^urblo,\s*5 hamilton/i,
    /^5 hamilton street/i,
    /explore solutions: urblo\.com\.au/i,
    /unsubscribe|campaign preferences/i,
  ];

  for (const [index, block] of articleBlocks.entries()) {
    const text = blockText(block);
    if (forbiddenNewsletterText.some((pattern) => pattern.test(text))) {
      failures.push(`article_blocks[${index}]: newsletter footer/contact artifact leaked into structured import`);
    }

    if (block.block_type === 'rich_text' && !block.content?.claimReviewStatus) {
      failures.push(`article_blocks[${index}]: rich_text block missing claimReviewStatus`);
    }

    if ((block.content?.reviewFlags ?? []).length > 0 && block.content?.claimReviewStatus !== 'needs_review') {
      failures.push(`article_blocks[${index}]: reviewFlags must set claimReviewStatus to needs_review`);
    }
  }
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
const applySql = getContentImportApplySql();

checkContentImportPayload(payload);
checkDraftImportSqlArtifact(applySql, payload);
checkArticleBlockPayload(payload);
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
    `Verified ${payload.summary.article_blocks} draft article blocks use structured extraction instead of placeholder HTML imports.`,
    'Verified guarded draft import SQL keeps the approval gate manual, avoids destructive/publish statements, and forces imported content status to draft.',
    'Verified published-only public RLS policy source, read-only anon grants, static public runtime boundary, Cloudflare SPA/API routing scope, and cutover docs.',
  ].join('\n'),
);
