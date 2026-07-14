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

function getContentImportSqlArtifacts() {
    const tmpRoot = join(root, '.tmp');
    mkdirSync(tmpRoot, { recursive: true });

    const tmpDir = mkdtempSync(join(tmpRoot, 'public-supabase-readiness-'));
    const relativeTmpDir = relative(root, tmpDir);
    const preflightSqlPath = join(relativeTmpDir, 'content-import-preflight.sql');
    const applySqlPath = join(relativeTmpDir, 'content-import-apply.sql');
    const rollbackSqlPath = join(relativeTmpDir, 'content-import-rollback.sql');

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
                preflightSqlPath,
                '--apply-sql-out',
                applySqlPath,
                '--rollback-sql-out',
                rollbackSqlPath,
            ],
            {
                cwd: root,
                encoding: 'utf8',
                maxBuffer: 64 * 1024 * 1024,
            },
        );

        return {
            preflightSql: readFileSync(join(root, preflightSqlPath), 'utf8'),
            applySql: readFileSync(join(root, applySqlPath), 'utf8'),
            rollbackSql: readFileSync(join(root, rollbackSqlPath), 'utf8'),
        };
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

function checkPreflightSqlArtifact(preflightSql) {
  for (const fragment of [
    '-- Data API role grants for seed and import target tables.',
    'Supabase Data API access requires table grants in addition to RLS policies.',
    "has_table_privilege('anon'",
    "has_table_privilege('authenticated'",
    "has_table_privilege('service_role'",
    'anon_insert',
    'authenticated_insert',
    'service_role_insert',
    '-- Data API sequence grants for generated identity rows.',
    "has_sequence_privilege('authenticated'",
    "has_sequence_privilege('service_role'",
  ]) {
    requireIncludes(preflightSql, fragment, 'content import preflight SQL');
  }
}

function checkDraftImportSqlArtifact(applySql, payload) {
  for (const fragment of [
    '-- Urblo guarded draft content import',
    '-- It imports rows as draft/private review data only; it does not publish content or delete data.',
    "-- set local urblo.import_approved = 'true';",
    "-- set local urblo.import_merge_approved = 'true';",
    "current_setting('urblo.import_approved', true)",
    "current_setting('urblo.import_merge_approved', true)",
    "raise exception 'Urblo draft import is not approved.",
    'Urblo draft import found % existing target natural-key matches.',
    '-- Existing target natural-key conflict guard.',
    'begin;',
    'commit;',
  ]) {
    requireIncludes(applySql, fragment, 'guarded draft content import SQL');
  }

  if (/^\s*set\s+local\s+urblo\.import_approved\s*=\s*'true';/im.test(applySql)) {
    failures.push('guarded draft content import SQL: approval gate must remain commented by default');
  }
  if (/^\s*set\s+local\s+urblo\.import_merge_approved\s*=\s*'true';/im.test(applySql)) {
    failures.push('guarded draft content import SQL: merge approval gate must remain commented by default');
  }

  for (const table of ['media_assets', 'stone_groups', 'products', 'projects', 'articles']) {
    requireIncludes(
      applySql,
      `'${table}' as table_name, count(*)::bigint as matching_rows`,
      'guarded draft content import SQL natural-key conflict guard',
    );
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

function checkDraftRollbackSqlArtifact(rollbackSql, payload) {
  for (const fragment of [
    '-- Urblo guarded draft content import rollback',
    '-- This script is intentionally destructive and guarded.',
    '-- It removes matching draft/import rows in reverse dependency order; it does not touch published content.',
    "-- set local urblo.rollback_approved = 'true';",
    "current_setting('urblo.rollback_approved', true)",
    "raise exception 'Urblo draft import rollback is not approved.",
    'begin;',
    'commit;',
    'delete from public.article_blocks',
    'delete from public.media_assets',
    "target.status = 'draft'",
  ]) {
    requireIncludes(rollbackSql, fragment, 'guarded draft content import rollback SQL');
  }

  if (/^\s*set\s+local\s+urblo\.rollback_approved\s*=\s*'true';/im.test(rollbackSql)) {
    failures.push('guarded draft content import rollback SQL: approval gate must remain commented by default');
  }

  const forbiddenStatements = [
    /^\s*truncate\b/im,
    /^\s*drop\s+(table|schema|policy|function|view)\b/im,
    /^\s*alter\s+table\b.*\bdisable\s+row\s+level\s+security\b/im,
    /\bstatus\s*=\s*'published'\b/i,
    /\bpublished_at\s*=/i,
  ];
  for (const pattern of forbiddenStatements) {
    if (pattern.test(rollbackSql)) {
      failures.push(`guarded draft content import rollback SQL: forbidden statement matched ${pattern}`);
    }
  }

  let previousIndex = -1;
  for (const item of payload.importPlan.rollbackOrder) {
    const marker = `-- Rollback ${item.table}.`;
    const index = rollbackSql.indexOf(marker);
    if (index === -1) {
      failures.push(`guarded draft content import rollback SQL: missing rollback section for ${item.table}`);
      continue;
    }
    if (index < previousIndex) {
      failures.push(`guarded draft content import rollback SQL: ${item.table} is out of rollback order`);
    }
    previousIndex = index;

    const count = payload.importPlan.applyOrder.find((entry) => entry.table === item.table)?.count ?? 0;
    requireIncludes(
      rollbackSql,
      `('${item.table}', ${count}::bigint)`,
      'guarded draft content import rollback SQL summary',
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
  const publicClient = readRequired('src/lib/publicContentClient.ts');

  for (const route of publicRoutes) {
    requireIncludes(app, route, 'src/App.tsx');
  }
  requireIncludes(app, '/admin/*', 'src/App.tsx');
  requireIncludes(publicClient, '@supabase/supabase-js', 'src/lib/publicContentClient.ts');
  requireIncludes(publicClient, "import('@supabase/supabase-js')", 'src/lib/publicContentClient.ts on-demand SDK load');
  requireIncludes(publicClient, 'VITE_SUPABASE_PUBLISHABLE_KEY', 'src/lib/publicContentClient.ts');
  requireIncludes(publicClient, 'VITE_SUPABASE_ANON_KEY', 'src/lib/publicContentClient.ts');
  requireIncludes(publicClient, 'persistSession: false', 'src/lib/publicContentClient.ts');
  requireIncludes(
    publicClient,
    ".catch(() => {\n        publicContentClientPromise = null;\n        return null;\n      });",
    'src/lib/publicContentClient.ts static-fallback-safe lazy-load failure',
  );
  if (/import\s*\{[^}]*\bcreateClient\b[^}]*\}\s*from\s*['\"]@supabase\/supabase-js['\"]/.test(publicClient)) {
    failures.push('src/lib/publicContentClient.ts: createClient must remain dynamically imported so the public entry does not eagerly load Supabase');
  }

  const scannedFiles = walkFiles('src').filter((file) => {
    if (!/\.(tsx?|jsx?)$/.test(file)) return false;
    if (file === 'src/vite-env.d.ts') return false;
    if (file.startsWith('src/pages/admin/')) return false;
    if (file.startsWith('src/lib/admin')) return false;
    if (file === 'src/lib/supabaseClient.ts') return false;
    if (file === 'src/lib/publicContentClient.ts') return false;
    return true;
  });

  for (const file of scannedFiles) {
    const text = readRequired(file);
    const runtimeText = text.replace(/(^|\n)\s*import\s+type\b[\s\S]*?;\s*(?=\n|$)/g, '\n');
    for (const forbidden of ['@supabase/supabase-js', 'supabaseClient', 'VITE_SUPABASE_', 'service_role', 'SUPABASE_SERVICE_ROLE']) {
      if (runtimeText.includes(forbidden)) {
        failures.push(`${file}: public runtime must use publicContentClient and must not expose admin/service-role boundaries; found ${forbidden}`);
      }
    }
  }

  const cutoverServices = [
    'src/service/StoneLibraryService.ts',
    'src/service/ProductService.ts',
    'src/service/ProjectService.ts',
    'src/service/ArticleService.ts',
  ];

  for (const file of cutoverServices) {
    const text = readRequired(file);
    requireIncludes(text, 'getPublicContentClient', file);
    requireIncludes(text, ".eq('status', 'published')", file);
  }

  const overlayHelper = readRequired('src/service/publicContentOverlay.ts');
  requireIncludes(overlayHelper, 'publishedByKey.get(key) ?? item', 'Published overlay replaces matching canonical fallback records');
  requireIncludes(overlayHelper, 'if (!fallbackKeys.has(key))', 'Published overlay appends new CMS records without removing unmatched fallback records');

  const productService = readRequired('src/service/ProductService.ts');
  requireIncludes(productService, 'mergeProductsWithPublishedOverlay', 'ProductService per-record Published overlay');
  requireIncludes(productService, 'await ProductService.getAll()', 'ProductService detail reads the merged public collection');

  const projectService = readRequired('src/service/ProjectService.ts');
  requireIncludes(projectService, 'mergeProjectsWithPublishedOverlay', 'ProjectService per-record Published overlay');
  requireIncludes(projectService, 'sector: fallback.listing.sector', 'ProjectService static taxonomy preservation');
  requireRegex(
    projectService,
    /factsResult\.error\s*\|\|\s*mediaResult\.error\s*\|\|\s*materialsResult\.error\s*\|\|\s*materialMapsResult\.error/,
    'src/service/ProjectService.ts',
    'ProjectService dependent-read failure fallback',
  );
  requireIncludes(projectService, 'const projects = await ProjectService.getAll()', 'ProjectService detail reads the merged public collection');

  const publicSettings = readRequired('src/lib/publicSiteSettings.ts');
  const settingsContract = readRequired('src/lib/siteSettingsPublicContract.ts');
  const footerContract = readRequired('src/lib/siteSettingsFooterContract.ts');
  const adminSettings = readRequired('src/pages/admin/AdminSettingsPage.tsx');
  requireIncludes(app, '<PublicSiteSettingsProvider>', 'Public settings provider public-route boundary');
  requireIncludes(app, "location.pathname.startsWith('/admin')", 'Public settings provider admin exclusion');
  requireIncludes(publicSettings, 'createRefreshablePublicSiteSettingsLoader', 'Public settings refreshable request loader');
  requireIncludes(publicSettings, 'activeRequest = null', 'Public settings settled-request invalidation');
  requireIncludes(settingsContract, 'validatePublishedSiteSettingsFields', 'Shared Published settings validation');
  requireIncludes(adminSettings, "form.status === 'published'", 'Admin Published-only settings validation');
  requireIncludes(adminSettings, 'normalizePublishedSiteSettingsFields', 'Admin shared public settings validation and payload normalization');
  requireIncludes(footerContract, 'toSafeInternalFooterDestination', 'Same-origin internal footer destination resolver');
  requireIncludes(footerContract, 'hasUnsafeInternalDestinationCharacter', 'Internal footer control/backslash rejection');

  const stoneService = readRequired('src/service/StoneLibraryService.ts');
  const stoneDetailPage = readRequired('src/pages/StoneLibraryDetailPage.tsx');
  requireIncludes(stoneService, 'getPublicStoneCards', 'StoneLibraryService merged public listing adapter');
  requireIncludes(stoneService, '(card) => card.stoneGroupId', 'StoneLibraryService stoneGroupId Published overlay');
  requireIncludes(stoneService, 'getPublishedStoneDetail', 'StoneLibraryService public detail adapter');
  requireIncludes(stoneService, ".from('stone_finish_capabilities')", 'StoneLibraryService public detail adapter');
  requireIncludes(stoneService, ".from('stone_finish_images')", 'StoneLibraryService public detail adapter');
  requireIncludes(stoneService, ".eq('status', 'published')", 'StoneLibraryService published-only public detail reads');
  requireIncludes(stoneDetailPage, 'StoneLibraryService.getPublishedStoneDetail', 'StoneLibraryDetailPage published-first adapter');
  requireIncludes(stoneDetailPage, 'StoneLibraryService.getStoneDetail', 'StoneLibraryDetailPage static fallback');
  const articleService = readRequired('src/service/ArticleService.ts');
  const articlePage = readRequired('src/pages/ArticlePage.tsx');
  requireIncludes(articleService, 'mergeArticlesWithPublishedOverlay', 'ArticleService per-record Published overlay');
  requireIncludes(articleService, 'static async getBySlug', 'ArticleService merged detail lookup');
  requireIncludes(articleService, ".from('article_blocks')", 'ArticleService structured block public read');
  requireIncludes(articleService, ".eq('status', 'published')", 'ArticleService structured block public read');
  requireIncludes(articleService, 'getBody(meta', 'ArticleService structured body adapter');
  requireIncludes(articlePage, 'ArticleService.getBody(meta)', 'ArticlePage structured body adapter');
  requireIncludes(articlePage, 'StructuredArticleBody', 'ArticlePage structured block renderer');
  requireIncludes(articlePage, "body?.kind === 'structured'", 'ArticlePage structured-vs-legacy rendering');
  const stoneLibraryPage = readRequired('src/pages/StoneLibraryPage.tsx');
  requireIncludes(stoneLibraryPage, 'StoneLibraryService.getPublicStoneCards()', 'Stone Library merged listing read');
  requireIncludes(stoneLibraryPage, 'getFilterFacets(publicCards)', 'Stone Library facets use the merged listing collection');
  requireIncludes(stoneLibraryPage, 'filterStoneCards(publicCards', 'Stone Library result count uses the merged listing collection');
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
    'Public Stone Library routes use Supabase published reads with static fallback',
    'Public Product routes use Supabase published reads with static fallback',
    'Public Article routes use Supabase published reads with static fallback',
  ]) {
    requireIncludes(schema, fragment, 'docs/SUPABASE_SCHEMA.md');
  }
  requireIncludes(
    schema,
    'Public Project source now reads approved facts/materials plus published media/maps/hotspots',
    'docs/SUPABASE_SCHEMA.md Project published aggregate reads',
  );
  requireIncludes(
    schema,
    'Tombstone failure remains availability-first and preserves static fallback',
    'docs/SUPABASE_SCHEMA.md Project static fallback boundary',
  );

  for (const fragment of [
    'Public routes continue exposing only published content',
    'Static-file fallback remains available until each content type is fully migrated',
    'public read path',
  ]) {
    requireIncludes(schema, fragment, 'docs/SUPABASE_SCHEMA.md');
  }

  requireIncludes(architecture, 'public page components are lazy-loaded', 'docs/ARCHITECTURE.md');
  requireIncludes(
    architecture,
    'Published Projects, Products, and Articles overlay the matching static item by canonical slug',
    'docs/ARCHITECTURE.md per-record public overlay contract',
  );
  requireIncludes(
    architecture,
    'Published Stone Library cards overlay matching static cards by `stoneGroupId`',
    'docs/ARCHITECTURE.md Stone Library public overlay contract',
  );
  requireIncludes(handoff, 'content import/public-read cutover', 'docs/HANDOFF.md');
}

const payload = getContentImportPayload();
const { preflightSql, applySql, rollbackSql } = getContentImportSqlArtifacts();

checkContentImportPayload(payload);
checkPreflightSqlArtifact(preflightSql);
checkDraftImportSqlArtifact(applySql, payload);
checkDraftRollbackSqlArtifact(rollbackSql, payload);
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
    'Verified content import preflight SQL includes Data API role/sequence grant inspection for anon, authenticated, and service_role.',
    'Verified guarded draft import SQL keeps the approval and merge gates manual, avoids destructive/publish statements, and forces imported content status to draft.',
    'Verified guarded draft rollback SQL keeps its destructive gate manual, follows reverse dependency order, and targets draft/import rows only.',
    'Verified published-only public RLS policy source, read-only anon grants, public Supabase read boundary with static fallback, Cloudflare SPA/API routing scope, and cutover docs.',
  ].join('\n'),
);
