#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, exit } from 'node:process';

const root = cwd();
const failures = [];
const notes = [];

const requiredAdminRoutes = [
  { path: 'index', component: 'AdminDashboardPage' },
  { path: 'login', component: 'AdminLoginPage' },
  { path: 'unauthorized', component: 'AdminUnauthorizedPage' },
  { path: 'leads', component: 'AdminLeadsPage' },
  { path: 'media', component: 'AdminMediaPage' },
  { path: 'stone-library', component: 'AdminStoneLibraryPage' },
  { path: 'projects', component: 'AdminProjectsPage' },
  { path: 'products', component: 'AdminProductsPage' },
  { path: 'articles', component: 'AdminArticlesPage' },
  { path: 'settings', component: 'AdminSettingsPage' },
  { path: 'audit', component: 'AdminAuditPage' },
];

const requiredModules = [
  'dashboard',
  'leads',
  'media',
  'stone-library',
  'projects',
  'products',
  'articles',
  'settings',
  'audit',
];

const pageChecks = [
  {
    label: 'Dashboard',
    file: 'src/pages/admin/AdminDashboardPage.tsx',
    tables: ['stone_groups', 'projects', 'products', 'articles', 'enquiries', 'sample_requests'],
    requiredText: ['Verify live admin save, upload, and export audit rows', 'admin_profiles', 'Source ready'],
    mutates: false,
  },
  {
    label: 'Settings and admin profiles',
    file: 'src/pages/admin/AdminSettingsPage.tsx',
    tables: ['site_settings', 'admin_profiles'],
    actions: [
      'site_settings.create',
      'site_settings.update',
      'admin_profile.create',
      'admin_profile.update',
    ],
    requiredText: [
      'Only an owner can assign the owner role.',
      'At least one active owner profile must remain.',
      'Do not remove your own active admin access from this screen.',
    ],
  },
  {
    label: 'Media library',
    file: 'src/pages/admin/AdminMediaPage.tsx',
    tables: ['media_assets'],
    actions: [
      'media_asset.upload',
      'media_asset.create',
      'media_asset.update',
      'media_asset.publish',
      'media_asset.archive',
      'media_assets.export_manifest',
    ],
    requiredText: [
      'supabase.storage.from(uploadBucket).upload',
      'urblo-admin-media',
      'urblo-public-media',
      'Media export was blocked because the audit event could not be recorded',
      'Current role is read-only for Media',
    ],
    exportGate: 'media_assets.export_manifest',
  },
  {
    label: 'Stone Library',
    file: 'src/pages/admin/AdminStoneLibraryPage.tsx',
    tables: [
      'stone_groups',
      'stone_variants',
      'finish_definitions',
      'stone_finish_capabilities',
      'stone_finish_images',
      'media_assets',
    ],
    actions: [
      'stone_group.create',
      'stone_group.update',
      'stone_group.publish',
      'stone_group.archive',
      'stone_variant.create',
      'stone_variant.update',
      'stone_variant.publish',
      'stone_variant.archive',
      'stone_finish_capability.create',
      'stone_finish_capability.update',
      'stone_finish_image.create',
      'stone_finish_image.update',
      'stone_finish_image.publish',
      'stone_finish_image.archive',
    ],
    requiredText: [
      'Current role is read-only for Stone Library',
      'TBC records stay explicit',
      'Published finish images require a published media record',
      'Physical deletes remain hidden',
    ],
  },
  {
    label: 'Projects',
    file: 'src/pages/admin/AdminProjectsPage.tsx',
    tables: [
      'projects',
      'project_facts',
      'project_materials',
      'project_material_maps',
      'project_hotspots',
      'stone_groups',
      'finish_definitions',
      'media_assets',
    ],
    actions: [
      'project.create',
      'project.update',
      'project.publish',
      'project.archive',
      'project_fact.create',
      'project_fact.update',
      'project_material.create',
      'project_material.update',
      'project_material_map.create',
      'project_material_map.update',
      'project_material_map.publish',
      'project_material_map.archive',
      'project_hotspot.create',
      'project_hotspot.update',
      'project_hotspot.publish',
      'project_hotspot.archive',
    ],
    requiredText: ['Current role is read-only for Projects', 'Physical deletes remain hidden'],
  },
  {
    label: 'Products',
    file: 'src/pages/admin/AdminProductsPage.tsx',
    tables: [
      'products',
      'product_models',
      'product_material_defaults',
      'product_specs',
      'stone_groups',
      'media_assets',
    ],
    actions: [
      'product.create',
      'product.update',
      'product.publish',
      'product.archive',
      'product_model.create',
      'product_model.update',
      'product_model.publish',
      'product_model.archive',
      'product_material_default.create',
      'product_material_default.update',
      'product_spec.create',
      'product_spec.update',
    ],
    requiredText: ['Current role is read-only for Products', 'Physical deletes remain hidden'],
  },
  {
    label: 'Articles',
    file: 'src/pages/admin/AdminArticlesPage.tsx',
    tables: ['articles', 'article_blocks', 'media_assets', 'projects', 'stone_groups'],
    actions: [
      'article.create',
      'article.update',
      'article.publish',
      'article.archive',
      'article_block.create',
      'article_block.update',
      'article_block.publish',
      'article_block.archive',
    ],
    requiredText: ['Current role is read-only for Articles', 'legacy', 'Physical deletes remain hidden'],
  },
  {
    label: 'Leads',
    file: 'src/pages/admin/AdminLeadsPage.tsx',
    tables: [
      'enquiries',
      'sample_requests',
      'sample_request_items',
      'admin_profiles',
      'stone_groups',
      'finish_definitions',
    ],
    actions: ['enquiry.workflow_update', 'sample_request.workflow_update', 'leads.export_csv'],
    requiredText: [
      'Lead export was blocked because the audit event could not be recorded',
      'Current role is read-only for Leads',
      'Owner/admin CSV exports are audit-gated',
    ],
    exportGate: 'leads.export_csv',
  },
  {
    label: 'Audit',
    file: 'src/pages/admin/AdminAuditPage.tsx',
    tables: ['admin_audit_events', 'admin_profiles'],
    requiredText: [
      'canViewAudit',
      'Mutation history can expose private operational details',
      'Audit events are visible only to owner/admin roles',
      'readOnly',
    ],
    mutates: false,
  },
];

const browserSourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const forbiddenBrowserSecretPatterns = [
  {
    pattern: /import\.meta\.env\.(?:VITE_)?SUPABASE_SERVICE(?:_ROLE)?_KEY/,
    label: 'browser import.meta service-role env access',
  },
  {
    pattern: /process\.env\.(?:VITE_)?SUPABASE_SERVICE(?:_ROLE)?_KEY/,
    label: 'browser process.env service-role env access',
  },
  {
    pattern: /(?:import\.meta\.env|process\.env)\[['"`](?:VITE_)?SUPABASE_SERVICE(?:_ROLE)?_KEY['"`]\]/,
    label: 'browser bracket service-role env access',
  },
  {
    pattern: /createClient\([\s\S]{0,400}(?:serviceRole|service_role|serviceKey|service_key)/,
    label: 'browser Supabase client creation with service-role-like key',
  },
];

function readRequired(path) {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) {
    failures.push(`Missing file: ${path}`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

function requireIncludes(text, needle, context) {
  if (!text.includes(needle)) {
    failures.push(`${context}: missing ${needle}`);
  }
}

function requireNotIncludes(text, needle, context) {
  if (text.includes(needle)) {
    failures.push(`${context}: unexpected ${needle}`);
  }
}

function requireRegex(text, pattern, context, label) {
  if (!pattern.test(text)) {
    failures.push(`${context}: missing ${label}`);
  }
}

function collectSourceFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = entry.name.match(/\.[^.]+$/)?.[0] ?? '';
    if (browserSourceExtensions.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRepoPath(fullPath) {
  return fullPath.replace(`${root}/`, '');
}

function checkRoutes() {
  const app = readRequired('src/App.tsx');
  const adminApp = readRequired('src/pages/admin/AdminApp.tsx');
  const content = readRequired('src/pages/admin/adminContent.ts');
  const requireAdmin = readRequired('src/pages/admin/RequireAdmin.tsx');
  const login = readRequired('src/pages/admin/AdminLoginPage.tsx');
  const auth = readRequired('src/lib/adminAuth.tsx');
  const client = readRequired('src/lib/supabaseClient.ts');
  const audit = readRequired('src/lib/adminAudit.ts');
  const firstAdminBootstrap = readRequired('scripts/bootstrap-first-admin.mjs');

  if (existsSync(join(root, 'src/pages/admin/AdminModulePage.tsx'))) {
    failures.push('src/pages/admin/AdminModulePage.tsx: retired scaffold component should not remain after all launch modules are active');
  }

  requireIncludes(app, 'path="/admin/*"', 'src/App.tsx');
  requireIncludes(app, 'location.pathname.startsWith(\'/admin\')', 'src/App.tsx');

  for (const route of requiredAdminRoutes) {
    if (route.path === 'index') {
      requireRegex(
        adminApp,
        /<Route\s+index\s+element=\{<AdminDashboardPage\s*\/>\}/,
        'src/pages/admin/AdminApp.tsx',
        'dashboard index route',
      );
    } else {
      requireIncludes(
        adminApp,
        `path="${route.path}" element={<${route.component} />}`,
        'src/pages/admin/AdminApp.tsx',
      );
    }
  }

  for (const module of requiredModules) {
    const marker = `key: '${module}'`;
    requireIncludes(content, marker, 'src/pages/admin/adminContent.ts');
  }

  requireNotIncludes(content, "state: 'scaffold'", 'src/pages/admin/adminContent.ts');
  requireNotIncludes(content, "state: 'locked'", 'src/pages/admin/adminContent.ts');

  for (const state of ['loading', 'config-missing', 'error', 'unauthenticated', 'unauthorized']) {
    requireIncludes(requireAdmin, `auth.status === '${state}'`, 'src/pages/admin/RequireAdmin.tsx');
  }
  requireIncludes(
    requireAdmin,
    "to={`/admin/login?next=${encodeURIComponent(next)}`}",
    'src/pages/admin/RequireAdmin.tsx',
  );
  requireIncludes(login, 'resolveAdminNextPath', 'src/pages/admin/AdminLoginPage.tsx');
  requireIncludes(login, "next === '/admin'", 'src/pages/admin/AdminLoginPage.tsx');
  requireIncludes(login, "next.startsWith('/admin/')", 'src/pages/admin/AdminLoginPage.tsx');
  requireIncludes(login, "next.startsWith('/admin?')", 'src/pages/admin/AdminLoginPage.tsx');
  requireIncludes(login, "next.startsWith('/admin/login')", 'src/pages/admin/AdminLoginPage.tsx');
  requireIncludes(login, "next.startsWith('/admin/unauthorized')", 'src/pages/admin/AdminLoginPage.tsx');
  requireNotIncludes(
    login,
    "next.startsWith('/admin') &&",
    'src/pages/admin/AdminLoginPage.tsx next-route guard',
  );

  requireIncludes(auth, ".from('admin_profiles')", 'src/lib/adminAuth.tsx');
  requireIncludes(auth, 'supabase.auth.getUser()', 'src/lib/adminAuth.tsx');
  requireIncludes(auth, ".eq('user_id', verifiedUser.id)", 'src/lib/adminAuth.tsx');
  requireIncludes(auth, ".eq('is_active', true)", 'src/lib/adminAuth.tsx');
  requireIncludes(client, 'VITE_SUPABASE_PUBLISHABLE_KEY', 'src/lib/supabaseClient.ts');
  requireIncludes(client, 'VITE_SUPABASE_ANON_KEY', 'src/lib/supabaseClient.ts');

  if (/SERVICE_ROLE|SUPABASE_SERVICE|service_role/.test(client)) {
    failures.push('src/lib/supabaseClient.ts: browser client must not reference service-role keys');
  }

  requireIncludes(app, 'function WelcomePopupGate()', 'src/App.tsx');
  requireIncludes(app, "location.pathname.startsWith('/admin')", 'src/App.tsx');
  requireIncludes(app, 'return null;', 'src/App.tsx WelcomePopupGate');
  requireIncludes(app, '<WelcomePopup />', 'src/App.tsx WelcomePopupGate');

  const adminState = readRequired('src/pages/admin/AdminState.tsx');
  requireIncludes(adminState, 'AdminConfigMissingState', 'src/pages/admin/AdminState.tsx');
  requireIncludes(adminState, 'Configuration required', 'src/pages/admin/AdminState.tsx');
  requireIncludes(adminState, 'browser-safe Supabase key', 'src/pages/admin/AdminState.tsx');
  requireIncludes(adminState, 'Return to site', 'src/pages/admin/AdminState.tsx');
  requireIncludes(adminState, 'getAdminConfigStatus', 'src/pages/admin/AdminState.tsx');
  requireIncludes(login, 'AdminConfigMissingState', 'src/pages/admin/AdminLoginPage.tsx');
  requireIncludes(login, "auth.status === 'config-missing'", 'src/pages/admin/AdminLoginPage.tsx');

  const unauthorized = readRequired('src/pages/admin/AdminUnauthorizedPage.tsx');
  requireIncludes(unauthorized, 'AdminConfigMissingState', 'src/pages/admin/AdminUnauthorizedPage.tsx');
  requireIncludes(unauthorized, "auth.status === 'config-missing'", 'src/pages/admin/AdminUnauthorizedPage.tsx');

  requireIncludes(audit, ".from('admin_audit_events')", 'src/lib/adminAudit.ts');
  requireIncludes(firstAdminBootstrap, ".from('admin_audit_events')", 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'admin_profile.bootstrap', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'actor_user_id: null', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, "entity_type: 'admin_profiles'", 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(
    firstAdminBootstrap,
    'Bootstrap audit event recorded: admin_profile.bootstrap.',
    'scripts/bootstrap-first-admin.mjs',
  );
}

function checkBrowserSecretBoundaries() {
  const sourceRoot = join(root, 'src');

  if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
    failures.push('src: browser source directory is missing');
    return;
  }

  for (const fullPath of collectSourceFiles(sourceRoot)) {
    const text = readFileSync(fullPath, 'utf8');
    const repoPath = toRepoPath(fullPath);

    for (const forbidden of forbiddenBrowserSecretPatterns) {
      if (forbidden.pattern.test(text)) {
        failures.push(`${repoPath}: unexpected ${forbidden.label}`);
      }
    }
  }
}

function checkPage(page) {
  const text = readRequired(page.file);
  if (!text) return;

  requireIncludes(text, '<RequireAdmin>', page.file);
  requireIncludes(text, '<AdminShell', page.file);

  for (const table of page.tables) {
    requireRegex(
      text,
      new RegExp(`(?:\\.from\\('${table}'\\)|table:\\s*'${table}')`),
      page.file,
      `Supabase table reference ${table}`,
    );
  }

  if (page.mutates !== false) {
    requireIncludes(text, 'recordAdminAuditEvent', page.file);
    requireIncludes(text, 'withAuditNotice', page.file);
    requireRegex(text, /\.insert\(|\.update\(/, page.file, 'insert/update mutation path');
    requireRegex(text, /disabled=\{![a-zA-Z]+/, page.file, 'role-gated disabled controls');
  } else if (text.includes('recordAdminAuditEvent')) {
    failures.push(`${page.file}: read-only page unexpectedly imports recordAdminAuditEvent`);
  }

  for (const action of page.actions ?? []) {
    requireIncludes(text, action, page.file);
  }

  for (const needle of page.requiredText ?? []) {
    requireIncludes(text, needle, page.file);
  }

  if (page.exportGate) {
    const actionIndex = text.indexOf(page.exportGate);
    const blockedIndex = text.indexOf('blocked because the audit event could not be recorded');
    const downloadIndex = text.indexOf('downloadTextFile');

    if (actionIndex === -1 || blockedIndex === -1 || downloadIndex === -1) {
      failures.push(`${page.file}: export audit gate is incomplete`);
    } else if (!(actionIndex < blockedIndex && blockedIndex < downloadIndex)) {
      failures.push(`${page.file}: export must record audit and block failure before download`);
    }
  }

  requireRegex(text, /isLoading|AdminLoadingState|Array\.from\(\{ length:/, page.file, 'loading state');
  requireRegex(text, /setError|AdminErrorState|error/i, page.file, 'error state');
  requireRegex(text, /No .* yet|No .* found|empty|0 /i, page.file, 'empty state');

  notes.push(`- ${page.label}: ${page.tables.join(', ')}`);
}

function checkArticleStructuredAuthoring() {
  const schema = readRequired('docs/SUPABASE_SCHEMA.md');
  const text = readRequired('src/pages/admin/AdminArticlesPage.tsx');
  const approvedBlockTypes = [
    'rich_text',
    'image',
    'gallery',
    'quote',
    'faq',
    'cta',
    'project_spotlight',
    'stone_reference',
    'comparison_table',
    'proof_metric',
    'video_embed',
    'callout',
  ];

  for (const blockType of approvedBlockTypes) {
    requireIncludes(schema, blockType, 'docs/SUPABASE_SCHEMA.md article block contract');
    requireRegex(
      text,
      new RegExp(`\\['${blockType}',\\s*'[^']+'\\]`),
      'src/pages/admin/AdminArticlesPage.tsx',
      `block type option ${blockType}`,
    );
  }

  for (const forbidden of ['dangerouslySetInnerHTML', 'rawHtml', 'raw_html', 'newsletterHtml', 'newsletter_html']) {
    requireNotIncludes(text, forbidden, 'src/pages/admin/AdminArticlesPage.tsx structured article authoring');
  }

  requireIncludes(text, 'Published blocks require structured content.', 'src/pages/admin/AdminArticlesPage.tsx');
  requireIncludes(text, 'Block content JSON is not valid JSON.', 'src/pages/admin/AdminArticlesPage.tsx');
  requireIncludes(text, 'do not paste newsletter HTML as normal authoring', 'src/pages/admin/AdminArticlesPage.tsx');
}

function checkAdminLiveVerifierBoundaries() {
  const text = readRequired('scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertNotPubliclyVisible', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertNotAnonymousReadable', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(
    text,
    'Publish then archive public-facing tagged QA rows before the final anonymous visibility check.',
    'scripts/check-admin-crud-live.mjs',
  );

  for (const action of [
    'media_asset.publish',
    'stone_group.publish',
    'stone_variant.publish',
    'stone_finish_image.publish',
    'product.publish',
    'product_model.publish',
    'project.publish',
    'project_material_map.publish',
    'project_hotspot.publish',
    'article.publish',
    'article_block.publish',
  ]) {
    requireIncludes(text, action, 'scripts/check-admin-crud-live.mjs');
  }

  for (const table of ['enquiries', 'sample_requests', 'sample_request_items']) {
    requireRegex(
      text,
      new RegExp(`assertNotAnonymousReadable\\(config, '${table}'`),
      'scripts/check-admin-crud-live.mjs',
      `anonymous private ${table} boundary check`,
    );
  }

  requireIncludes(
    text,
    'Anonymous browser-key reads returned zero tagged QA content rows and no private lead rows.',
    'scripts/check-admin-crud-live.mjs',
  );
}

function checkAdminRemovalContract() {
  const tasks = readRequired('docs/agent/tasks.json');
  const adminIa = readRequired('docs/ADMIN_IA_ACCESS.md');
  const schema = readRequired('docs/SUPABASE_SCHEMA.md');
  const liveVerifier = readRequired('scripts/check-admin-crud-live.mjs');

  requireNotIncludes(
    tasks,
    'create, read, update, delete, draft',
    'docs/agent/tasks.json admin CMS acceptance',
  );
  requireNotIncludes(
    tasks,
    'archive, and delete Projects',
    'docs/agent/tasks.json admin content acceptance',
  );

  requireIncludes(
    tasks,
    'Physical delete controls remain out of the launch-critical CMS path',
    'docs/agent/tasks.json admin CMS acceptance',
  );
  requireIncludes(
    tasks,
    'Physical deletes for content records remain hidden and approval-gated',
    'docs/agent/tasks.json admin content acceptance',
  );
  requireIncludes(adminIa, 'Current launch removal model', 'docs/ADMIN_IA_ACCESS.md');
  requireIncludes(
    adminIa,
    'Live admin verification should prove publish/archive behavior, public invisibility, and auditability',
    'docs/ADMIN_IA_ACCESS.md',
  );
  requireIncludes(
    schema,
    'Launch admin removal uses non-destructive archive flows',
    'docs/SUPABASE_SCHEMA.md',
  );
  requireIncludes(liveVerifier, 'no physical deletes are attempted.', 'scripts/check-admin-crud-live.mjs');
}

checkRoutes();
checkBrowserSecretBoundaries();
pageChecks.forEach(checkPage);
checkArticleStructuredAuthoring();
checkAdminLiveVerifierBoundaries();
checkAdminRemovalContract();

if (failures.length) {
  console.error('Admin CRUD coverage checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log('Admin CRUD coverage checks passed.');
console.log('Covered modules and tables:');
notes.forEach((note) => console.log(note));
