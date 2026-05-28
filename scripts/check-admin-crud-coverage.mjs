#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
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

function checkRoutes() {
  const app = readRequired('src/App.tsx');
  const adminApp = readRequired('src/pages/admin/AdminApp.tsx');
  const content = readRequired('src/pages/admin/adminContent.ts');
  const requireAdmin = readRequired('src/pages/admin/RequireAdmin.tsx');
  const auth = readRequired('src/lib/adminAuth.tsx');
  const client = readRequired('src/lib/supabaseClient.ts');
  const audit = readRequired('src/lib/adminAudit.ts');

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

  requireIncludes(auth, ".from('admin_profiles')", 'src/lib/adminAuth.tsx');
  requireIncludes(client, 'VITE_SUPABASE_PUBLISHABLE_KEY', 'src/lib/supabaseClient.ts');
  requireIncludes(client, 'VITE_SUPABASE_ANON_KEY', 'src/lib/supabaseClient.ts');

  if (/SERVICE_ROLE|SUPABASE_SERVICE|service_role/.test(client)) {
    failures.push('src/lib/supabaseClient.ts: browser client must not reference service-role keys');
  }

  requireIncludes(audit, ".from('admin_audit_events')", 'src/lib/adminAudit.ts');
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

checkRoutes();
pageChecks.forEach(checkPage);

if (failures.length) {
  console.error('Admin CRUD coverage checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log('Admin CRUD coverage checks passed.');
console.log('Covered modules and tables:');
notes.forEach((note) => console.log(note));
