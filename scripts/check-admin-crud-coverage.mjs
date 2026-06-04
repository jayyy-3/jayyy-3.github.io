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
    tables: [
      'media_assets',
      'stone_groups',
      'projects',
      'project_facts',
      'products',
      'articles',
      'enquiries',
      'sample_requests',
    ],
    requiredText: [
      'Content health queue',
      'Start here',
      'Choose the next editing job',
      '/admin/stone-library',
      'Stone families',
      'Published media missing alt or usage notes',
      'Published projects with proof still under review',
      'Project facts still under review',
      'Published products missing hero media',
      'Published articles missing cover media',
      'Stone families still marked Needs confirmation',
      'Stale new leads older than 48 hours',
      'Before handing to an editor',
      'Open public page link',
      'Open editor',
      'handoffLabel',
      'Where each editing job lives',
      'Live on website',
      'What the website can show now',
      'Published items can appear on the website. Draft is still your safe workspace.',
      'No review tasks are visible yet.',
      'customer enquiries exist',
      'New contact and sample request submissions will appear here',
    ],
    forbiddenText: [
      'Published rows',
      'live Supabase content',
      'lead rows exist',
      'server-side service-role verification',
    ],
    mutates: false,
  },
  {
    label: 'Settings and CMS team access',
    file: 'src/pages/admin/AdminSettingsPage.tsx',
    tables: ['site_settings', 'admin_profiles'],
    actions: [
      'site_settings.create',
      'site_settings.update',
      'admin_profile.create',
      'admin_profile.update',
    ],
    requiredText: [
      'Only a website owner can assign the Website owner role.',
      'At least one active website owner must remain.',
      'Do not remove your own active CMS manager access from this screen.',
      'This login account already has CMS access.',
      'This email is already assigned to another CMS user.',
      'Access setup checklist',
      'Login setup code',
      'Email alone cannot grant CMS access.',
      'Copy the full login setup code',
      'Invite and grant access',
      'Grant existing login',
      'Invite new CMS users, manage existing access',
      'Login setup code copied.',
      '/api/admin/invite-user',
      'Invite and grant access sends the login email from the secure server endpoint',
      'Role guide',
      'CMS manager only',
      'Global contact and search defaults',
      'Search defaults',
      'People and access',
      'CMS team access is restricted to CMS managers and website owners.',
      'Active access',
    ],
    forbiddenText: [
      'Owner/Admin',
      'Supabase Auth users',
      'Admin profile management is restricted',
      'No admin profile rows',
      'does not create the login account',
      'Admin profile email is already assigned',
      'Only an owner can assign the owner role.',
      'At least one active owner profile must remain.',
      'Do not remove your own active admin access from this screen.',
      'default SEO',
      'public-ready default row',
      'Copy ID',
      'Copied ID',
      'Existing login account ID',
      'Copy the full login account ID',
      'login account ID copied',
    ],
  },
  {
    label: 'Media library',
    file: 'src/pages/admin/AdminMediaPage.tsx',
    lifecycle: true,
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
      'Publish checklist',
      'Public website library',
      'Complete the media publish checklist before publishing this asset.',
      'Search description, source, location, type',
      'Media export was blocked because change history could not be recorded',
      'Change history recorded.',
      'Current role is read-only for Media',
      'File or link type',
      'Website visibility location',
      'Uploaded file location',
      'Upload destination',
      'Publishing rules',
      'Hosted file link',
      'Hosted video link',
    ],
    forbiddenText: ['Storage file path', 'Upload bucket', 'Cloudflare R2', 'Cloudflare Stream'],
    exportGate: 'media_assets.export_manifest',
  },
  {
    label: 'Stone Library',
    file: 'src/pages/admin/AdminStoneLibraryPage.tsx',
    lifecycle: true,
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
      'Needs confirmation is counted with Draft because it is not public-ready.',
      'Stone Library publish checklist',
      'Variant publish checklist',
      'Complete the Stone Library publish checklist before publishing this stone family.',
      'Complete the variant publish checklist before publishing this variant.',
      'Website URL key',
      'CmsPublicPageLink',
      'Available',
      'Stone families',
      'No stone families yet',
      'Media from library',
      'Media library item',
      'Media library items available for finish images.',
      'Published finish images require a selected finish and a Media library item that is Published in Media.',
      'Publish is locked. Open Media and publish the selected Media library item before publishing this finish image.',
      'Viewers can inspect the Stone Library but cannot save changes.',
      'Stone type proof note',
      'Pricing note',
      'Use Archive to remove a stone from the website while keeping its editing history.',
      'Needs confirmation stays visible in the CMS, but is treated like Draft for public pages.',
      'Published Stone Library content can appear in public stone listings and product material links.',
    ],
    forbiddenText: [
      'TBC records stay explicit',
      'Source type note',
      'Price source',
      'canonical finish definitions loaded from Supabase',
      'Publication guardrails',
      'Physical deletes remain hidden',
      'Published finish images require a published media record',
      'Admin/Editor',
      'Library records',
      'No stone records yet',
      'approved media records',
      'media records available for linking',
      'selected media record',
      'media record that is Published in Media',
      'mutate Stone Library records',
      'Media record',
      'Media #',
      '/ #',
      'Published Stone Library records can appear',
    ],
  },
  {
    label: 'Projects',
    file: 'src/pages/admin/AdminProjectsPage.tsx',
    lifecycle: true,
    tables: [
      'projects',
      'project_facts',
      'project_materials',
      'project_media',
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
      'project_media.create',
      'project_media.update',
      'project_media.publish',
      'project_media.archive',
      'project_material_map.create',
      'project_material_map.update',
      'project_material_map.publish',
      'project_material_map.archive',
      'project_hotspot.create',
      'project_hotspot.update',
      'project_hotspot.publish',
      'project_hotspot.archive',
    ],
    requiredText: [
      'Current role is read-only for Projects',
      'Use Archive to remove a project from the website while keeping its editing history.',
      'Media blocks',
      'Drag point placement',
      'CmsPublicPageLink',
      'Project proof review',
      'Proof review',
      'Website URL key',
      'Search project, URL key, location, client',
      'Structured detail',
      'Optional advanced detail for structured project facts',
      'Media from library',
      'Project case studies',
      'No project case studies yet',
      'Create a project, then add facts, materials, a material map, and hotspots.',
      'Media library items available for project images and video blocks.',
      'Editing access',
      'Nothing added yet.',
      'YouTube link',
      'in Media',
      'Publish is locked for now',
      'Start with the highlighted checklist item',
      'Start here',
      'highlightedPublishBlockerId',
      'Published is allowed only after the Publish checklist is clear. Use Draft while editing.',
      'Publishing rules',
      'Deferred / keep private',
    ],
    forbiddenText: [
      'Claims checked',
      'Claim status',
      'Cannot publish yet.',
      'Project claim review',
      'Search projects, slug, location, client',
      'label="Slug"',
      'Location TBC',
      'JSON value',
      'Project slug must be lowercase kebab-case.',
      'Fact JSON value is not valid JSON.',
      'ID linking',
      'YouTube URL or ID',
      'media records available for ID linking',
      'Stone group ID',
      'Finish definition ID',
      'Hotspot map ID',
      'Project material ID',
      'valid YouTube URL or video ID',
      'Media asset',
      'Project records',
      'No project records yet',
      'Create a project record',
      'Media library records available for project images and video blocks.',
      'Ask an editor/admin to update project records.',
      'Create or select a project record',
      '${facts.length} rows',
      '${materials.length} rows',
    ],
    requiredPatterns: [
      { pattern: /data-hotspot-stage/, label: 'hotspot placement stage marker' },
      { pattern: /data-hotspot-marker/, label: 'hotspot placement marker control' },
      { pattern: /onPointerDown=\{/, label: 'hotspot pointer-down placement handler' },
      { pattern: /onPointerMove=\{/, label: 'hotspot pointer-move drag handler' },
      { pattern: /onPositionChange=\{\(nextPosition\)/, label: 'hotspot coordinate update callback' },
    ],
  },
  {
    label: 'Products',
    file: 'src/pages/admin/AdminProductsPage.tsx',
    lifecycle: true,
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
    requiredText: [
      'Current role is read-only for Products',
      'Publish checklist',
      'CmsPublicPageLink',
      'Search preview',
      'Complete the publish checklist before publishing this product.',
      'Website URL key',
      'Model website key',
      'Search product, URL key, description',
      'Material reference',
      'Media library items available for product images.',
      'model website key, label, and selected Media library image',
      'This Media library item can support a public product image.',
      'Nothing added yet.',
      'Publishing rules',
      'Use Archive to remove a product from the website while keeping its editing history.',
      'Published in Media',
      'Draft is safe to edit and will not appear on the public website.',
    ],
    forbiddenText: [
      'Publication guardrails',
      'Physical deletes remain hidden',
      'ID linking',
      'Cannot publish model yet',
      'Model key',
      'Search product, slug, description',
      'Product slug must be lowercase kebab-case.',
      'Material slug',
      'material slug',
      'clean key',
      'model rows on the selected product',
      'media records available for image selection',
      'Media #',
      '/ #',
      'This media record can support a public product image.',
      'review the asset',
      'No records yet.',
    ],
  },
  {
    label: 'Articles',
    file: 'src/pages/admin/AdminArticlesPage.tsx',
    lifecycle: true,
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
    requiredText: [
      'Current role is read-only for Articles',
      'CmsPublicPageLink',
      'Article publish checklist',
      'Publish is locked. Complete the Article publish checklist before publishing this article.',
      'getArticlePublishChecklist',
      'Website URL key',
      'Migration note',
      'Migration source link',
      'Article sections',
      'Pair a selected Media library item with caption and placement notes.',
      'Media library items available for article images.',
      'This Media library item can support a public article image.',
      'Nothing added yet.',
      'Publishing rules',
      'Published in Media',
      'Draft is safe to edit and will not appear on the public website.',
      'Use Archive to remove an article from the website while keeping its editing history.',
    ],
    forbiddenText: [
      'Legacy source path',
      'Legacy source URL',
      'Publication guardrails',
      'Physical deletes remain hidden',
      'Article slug must be lowercase kebab-case.',
      'No source path recorded.',
      'Raw newsletter HTML',
      'migration provenance',
      'Original import note',
      'Original import link',
      'Date needs review',
      'Linked project ID',
      'Linked stone group ID',
      'selected media record',
      'media records available for image selection',
      'Media #',
      '/ #',
      'This media record can support a public article image.',
      'review the asset',
      'No records yet.',
    ],
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
      'Export is locked because the change history could not be recorded',
      'Current role is read-only for Leads',
      'CSV export is recorded in change history',
      'currently visible filtered queue',
      'Export uses the current search and filters',
      'totalLoadedRows',
      'Recommended next step',
      'Export visible queue',
      'Spam check passed',
      'Email sent',
      'Workflow rules',
      'Lead managers can update workflow status',
      'Email delivery failed',
      'Lead type',
      'Reference',
      'formatLeadReference',
      'Website page',
      'Spam check',
      'Stone not selected',
      'Finish not selected',
    ],
    forbiddenText: [
      'Lead guardrails',
      'Owner/admin CSV exports are activity-logged',
      'Physical deletes stay hidden',
      'failed notification state',
      'Unknown admin',
      'Unknown stone',
      'Unknown finish',
      'Stone TBC',
      'Finish TBC',
      'Lead export was blocked because the activity log could not be recorded',
      'Export is locked because the activity log could not be recorded',
      'Lead ID',
    ],
    exportGate: 'leads.export_csv',
  },
  {
    label: 'Change history',
    file: 'src/pages/admin/AdminAuditPage.tsx',
    tables: ['admin_audit_events', 'admin_profiles'],
    requiredText: [
      'canViewAudit',
      'Change history visibility is restricted',
      'Change history is visible only to Website owner and CMS manager roles.',
      'friendlyActionLabels',
      'friendlyEntityLabels',
      'CMS team access',
      'Published project',
      'formatActionLabel',
      'formatEntityType',
      'readOnly',
    ],
    forbiddenText: [
      'Owner/Admin review',
      'Owner/Admin only',
      'owner/admin roles',
      'Activity log entries are visible only to owner/admin roles',
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

const forbiddenAdminDestructivePatterns = [
  {
    pattern: /\.delete\s*\(/,
    label: 'Supabase/PostgREST delete mutation',
  },
  {
    pattern: /\bmethod\s*:\s*['"`]DELETE['"`]/,
    label: 'HTTP DELETE request',
  },
  {
    pattern: /\.rpc\(\s*['"`][^'"`]*(?:delete|remove|purge|destroy|truncate)[^'"`]*['"`]/i,
    label: 'destructive RPC call',
  },
  {
    pattern: />\s*Delete(?:\s|<)/,
    label: 'visible Delete control',
  },
  {
    pattern: />\s*Remove(?:\s|<)/,
    label: 'visible Remove control',
  },
  {
    pattern: /\baria-label\s*=\s*['"`]Delete\b/,
    label: 'Delete aria-label',
  },
  {
    pattern: /\baria-label\s*=\s*['"`]Remove\b/,
    label: 'Remove aria-label',
  },
  {
    pattern: /\btitle\s*=\s*['"`]Delete\b/,
    label: 'Delete title',
  },
  {
    pattern: /\btitle\s*=\s*['"`]Remove\b/,
    label: 'Remove title',
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
  const adminAuthBrowser = readRequired('scripts/check-admin-auth-browser.mjs');
  const firstAdminBootstrap = readRequired('scripts/bootstrap-first-admin.mjs');
  const adminLiveReadiness = readRequired('scripts/check-admin-live-readiness.mjs');
  const adminInviteFunction = readRequired('functions/_lib/admin-invite.js');
  const adminInviteRoute = readRequired('functions/api/admin/invite-user.js');
  const adminProfileEmailMigration = readRequired(
    'supabase/migrations/202605290002_admin_profile_email_uniqueness.sql',
  );

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
  requireIncludes(adminInviteRoute, 'handleAdminInviteUserRequest', 'functions/api/admin/invite-user.js');
  requireIncludes(adminInviteFunction, 'inviteUserByEmail', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'getBearerToken', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'requireManagingAdmin', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'assertNoExistingCmsAccess', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'existing_cms_access', 'functions/_lib/admin-invite.js');
  requireIncludes(
    adminInviteFunction,
    'Edit the existing person instead of sending another invite.',
    'functions/_lib/admin-invite.js',
  );
  requireIncludes(adminInviteFunction, ".from('admin_profiles')", 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, ".from('admin_audit_events')", 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'Only a Website owner can invite another Website owner.', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'SUPABASE_SERVICE_ROLE_KEY', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, "source: 'functions/api/admin/invite-user.js'", 'functions/_lib/admin-invite.js');
  requireIncludes(adminInviteFunction, 'persistSession: false', 'functions/_lib/admin-invite.js');

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
  requireIncludes(audit, 'Change history was not recorded', 'src/lib/adminAudit.ts');
  requireIncludes(audit, 'Website owner or CMS manager', 'src/lib/adminAudit.ts');
  requireIncludes(adminAuthBrowser, '--expect-unauthorized', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(adminAuthBrowser, 'URBLO_UNPROFILED_EMAIL', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(adminAuthBrowser, 'URBLO_UNPROFILED_PASSWORD', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(adminAuthBrowser, 'waitForUnauthorizedRoute', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(adminAuthBrowser, 'unauthorizedRouteProbes', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(
    adminAuthBrowser,
    'const unauthorizedRouteProbes = routeChecks.map',
    'scripts/check-admin-auth-browser.mjs',
  );
  for (const path of [
    '/admin',
    '/admin/leads',
    '/admin/media',
    '/admin/settings',
    '/admin/stone-library',
    '/admin/projects',
    '/admin/products',
    '/admin/articles',
    '/admin/audit',
  ]) {
    requireIncludes(adminAuthBrowser, `path: '${path}'`, 'scripts/check-admin-auth-browser.mjs');
  }
  requireIncludes(adminAuthBrowser, 'assertNoPrivateAdminText', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(adminAuthBrowser, "getByRole('button', { name: /sign out/i })", 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(adminAuthBrowser, 'waitForSignedOutRoute', 'scripts/check-admin-auth-browser.mjs');
  requireIncludes(firstAdminBootstrap, ".from('admin_audit_events')", 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'admin_profile.bootstrap', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'actor_user_id: null', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, "entity_type: 'admin_profiles'", 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'Expected profile role:', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'profiles[0].role !== config.role', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'profiles[0].user_id !== user.id', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(firstAdminBootstrap, 'Profile linked to Auth user:', 'scripts/bootstrap-first-admin.mjs');
  requireIncludes(
    firstAdminBootstrap,
    'assertProfileEmailIsUnambiguous(existingProfiles, user, config)',
    'scripts/bootstrap-first-admin.mjs',
  );
  requireIncludes(
    firstAdminBootstrap,
    'already linked to a different Supabase Auth user',
    'scripts/bootstrap-first-admin.mjs',
  );
  requireIncludes(
    firstAdminBootstrap,
    "normalizeEmail(profile.email || '') === email",
    'scripts/bootstrap-first-admin.mjs',
  );
  requireNotIncludes(
    firstAdminBootstrap,
    ".eq('email', email)",
    'scripts/bootstrap-first-admin.mjs case-insensitive email matching',
  );
  requireIncludes(adminLiveReadiness, 'findAuthUserByEmail', 'scripts/check-admin-live-readiness.mjs');
  requireIncludes(adminLiveReadiness, 'profile.user_id', 'scripts/check-admin-live-readiness.mjs');
  requireIncludes(adminLiveReadiness, 'authUser.id', 'scripts/check-admin-live-readiness.mjs');
  requireIncludes(
    adminLiveReadiness,
    "normalizeEmail(profile.email || '') === email",
    'scripts/check-admin-live-readiness.mjs',
  );
  requireNotIncludes(
    adminLiveReadiness,
    "{ email: config.adminEmail }",
    'scripts/check-admin-live-readiness.mjs case-insensitive email matching',
  );
  requireIncludes(
    firstAdminBootstrap,
    'Bootstrap audit event recorded: admin_profile.bootstrap.',
    'scripts/bootstrap-first-admin.mjs',
  );
  requireIncludes(
    adminProfileEmailMigration,
    'admin_profiles_email_ci_unique_idx',
    'supabase/migrations/202605290002_admin_profile_email_uniqueness.sql',
  );
  requireIncludes(
    adminProfileEmailMigration,
    'lower(btrim(email))',
    'supabase/migrations/202605290002_admin_profile_email_uniqueness.sql',
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

function checkAdminDestructiveBoundaries() {
  const adminSourceRoot = join(root, 'src/pages/admin');
  const liveVerifierPath = join(root, 'scripts/check-admin-crud-live.mjs');
  const filesToScan = [];

  if (existsSync(adminSourceRoot) && statSync(adminSourceRoot).isDirectory()) {
    filesToScan.push(...collectSourceFiles(adminSourceRoot));
  } else {
    failures.push('src/pages/admin: admin source directory is missing');
  }

  if (existsSync(liveVerifierPath)) {
    filesToScan.push(liveVerifierPath);
  } else {
    failures.push('scripts/check-admin-crud-live.mjs: admin live verifier is missing');
  }

  for (const fullPath of filesToScan) {
    const text = readFileSync(fullPath, 'utf8');
    const repoPath = toRepoPath(fullPath);

    for (const forbidden of forbiddenAdminDestructivePatterns) {
      if (forbidden.pattern.test(text)) {
        failures.push(`${repoPath}: unexpected ${forbidden.label}; launch admin removal must use archive flows`);
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
    requireRegex(text, /validationFailure|validate[A-Z][A-Za-z]+Form|setError\([^)]*(?:required|not valid)/i, page.file, 'validation feedback path');
    requireRegex(text, /Save [A-Za-z ]+|save[A-Z][A-Za-z]+\(/, page.file, 'save action path');
  } else if (text.includes('recordAdminAuditEvent')) {
    failures.push(`${page.file}: read-only page unexpectedly imports recordAdminAuditEvent`);
  }

  if (page.lifecycle) {
    requireRegex(text, /save[A-Z][A-Za-z]+\('published'\)/, page.file, 'publish lifecycle save path');
    requireRegex(text, /save[A-Z][A-Za-z]+\('archived'\)/, page.file, 'archive lifecycle save path');
    requireRegex(text, /status === 'published'|value="published"|\['published'/, page.file, 'published state control');
    requireRegex(text, /status === 'archived'|value="archived"|\['archived'/, page.file, 'archived state control');
  }

  for (const action of page.actions ?? []) {
    requireIncludes(text, action, page.file);
  }

  for (const needle of page.requiredText ?? []) {
    requireIncludes(text, needle, page.file);
  }

  for (const needle of page.forbiddenText ?? []) {
    requireNotIncludes(text, needle, page.file);
  }

  for (const { pattern, label } of page.requiredPatterns ?? []) {
    requireRegex(text, pattern, page.file, label);
  }

  if (page.exportGate) {
    const actionIndex = text.indexOf(page.exportGate);
    const blockedIndex = Math.max(
      text.indexOf('blocked because change history could not be recorded'),
      text.indexOf('change history could not be recorded'),
    );
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

  requireIncludes(text, 'BlockContentEditor', 'src/pages/admin/AdminArticlesPage.tsx');
  requireIncludes(text, 'Published ${formatBlockTypeLabel(form.blockType)} sections need editor content', 'src/pages/admin/AdminArticlesPage.tsx');
  requireIncludes(text, 'Publish at least one article section so the article body can appear', 'src/pages/admin/AdminArticlesPage.tsx');
  requireIncludes(text, 'Use Article sections for the public article body.', 'src/pages/admin/AdminArticlesPage.tsx');
  requireNotIncludes(text, 'do not paste newsletter HTML as normal authoring', 'src/pages/admin/AdminArticlesPage.tsx structured article authoring');
}

function checkProductEditorAuthoring() {
  const text = readRequired('src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'Search title', 'src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'Search description', 'src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'getProductPublishChecklist', 'src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'getProductModelPublishChecklist', 'src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'Complete the publish checklist before publishing this product.', 'src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'Model publish checklist', 'src/pages/admin/AdminProductsPage.tsx');
  requireIncludes(text, 'Complete the Model publish checklist before publishing this model.', 'src/pages/admin/AdminProductsPage.tsx');
  requireNotIncludes(text, 'SEO JSON', 'src/pages/admin/AdminProductsPage.tsx product editor authoring');
  requireNotIncludes(text, 'seoJson', 'src/pages/admin/AdminProductsPage.tsx product editor authoring');
}

function checkDashboardEditorLanguage() {
  const content = readRequired('src/pages/admin/adminContent.ts');
  const dashboard = readRequired('src/pages/admin/AdminDashboardPage.tsx');
  const shell = readRequired('src/pages/admin/AdminShell.tsx');
  const primitives = readRequired('src/pages/admin/AdminCmsPrimitives.tsx');
  const media = readRequired('src/pages/admin/AdminMediaPage.tsx');

  requireIncludes(content, 'handoffLabel', 'src/pages/admin/adminContent.ts');
  requireIncludes(content, 'Private CMS access', 'src/pages/admin/adminContent.ts');
  requireIncludes(content, 'Customer inbox', 'src/pages/admin/adminContent.ts');
  requireIncludes(content, 'Article sections', 'src/pages/admin/adminContent.ts');
  requireIncludes(content, 'Website owner / CMS manager', 'src/pages/admin/adminContent.ts');
  requireIncludes(content, 'Change history', 'src/pages/admin/adminContent.ts');
  requireIncludes(content, 'Read-only record', 'src/pages/admin/adminContent.ts');
  requireNotIncludes(content, 'Owner/admin only', 'src/pages/admin/adminContent.ts operations labels');
  requireNotIncludes(content, 'Structured story content', 'src/pages/admin/adminContent.ts article labels');
  requireNotIncludes(content, 'Activity history', 'src/pages/admin/adminContent.ts audit labels');
  requireIncludes(media, 'Change history recorded.', 'src/pages/admin/AdminMediaPage.tsx');
  requireNotIncludes(media, 'Activity log recorded.', 'src/pages/admin/AdminMediaPage.tsx');
  requireIncludes(dashboard, 'handoffLabel', 'src/pages/admin/AdminDashboardPage.tsx');
  requireNotIncludes(content, 'dependency:', 'src/pages/admin/adminContent.ts editor module cards');
  requireIncludes(shell, 'Published content can appear on the website. Draft and Archived stay hidden.', 'src/pages/admin/AdminShell.tsx');
  requireIncludes(primitives, 'Draft content is safe to edit. Archived content stays hidden.', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireIncludes(primitives, 'Can appear on website', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireIncludes(primitives, 'Safe to edit', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireIncludes(primitives, 'Hidden but kept', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireIncludes(primitives, 'Change copy, media, facts, and page sections without affecting the website.', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireNotIncludes(shell, 'Published content can go live', 'src/pages/admin/AdminShell.tsx');
  requireNotIncludes(primitives, 'Draft rows are safe to edit', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireNotIncludes(primitives, 'published CMS rows', 'src/pages/admin/AdminCmsPrimitives.tsx');
  requireNotIncludes(primitives, 'structured rows', 'src/pages/admin/AdminCmsPrimitives.tsx');

  for (const technicalPhrase of [
    'Supabase Auth',
    'admin_profiles',
    'media_assets RLS',
    'Stone Library tables',
    'Admin mutation helpers',
    'Article block migration',
    'Storage-backed',
    'claim-safe',
  ]) {
    requireNotIncludes(content, technicalPhrase, 'src/pages/admin/adminContent.ts editor module cards');
  }
}

function checkAdminLiveVerifierBoundaries() {
  const text = readRequired('scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertNotPubliclyVisible', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertNotAnonymousReadable', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertStorageObjectReadableByAdmin', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertStorageObjectNotAnonymousReadable', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'BROWSER_KEY_NAMES', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'ADMIN_TOKEN_NAMES', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(
    text,
    "const ADMIN_EMAIL_NAMES = ['URBLO_ADMIN_EMAIL'];",
    'scripts/check-admin-crud-live.mjs',
  );
  requireNotIncludes(
    text,
    'URBLO_FIRST_ADMIN_EMAIL',
    'scripts/check-admin-crud-live.mjs live admin login credentials',
  );
  requireIncludes(text, 'auth/v1/token?grant_type=password', 'scripts/check-admin-crud-live.mjs');
  requireNotIncludes(text, 'SUPABASE_SERVICE_ROLE_KEY', 'scripts/check-admin-crud-live.mjs RLS verifier');
  requireNotIncludes(text, 'SUPABASE_SERVICE_KEY', 'scripts/check-admin-crud-live.mjs RLS verifier');
  requireNotIncludes(text, 'SERVICE_KEY_NAMES', 'scripts/check-admin-crud-live.mjs RLS verifier');
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
    'project_media.publish',
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
  requireIncludes(
    text,
    'When --include-storage is used, verify the signed-in admin can read back the private Storage object and anonymous reads are denied.',
    'scripts/check-admin-crud-live.mjs',
  );
  requireIncludes(
    text,
    'Signed-in admin readback for the tagged private Storage object passed.',
    'scripts/check-admin-crud-live.mjs',
  );
  requireIncludes(
    text,
    'Anonymous reads for the tagged private Storage object were denied.',
    'scripts/check-admin-crud-live.mjs',
  );
  requireIncludes(text, 'EXPECTED_AUDIT_ACTIONS', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertAuditActionCoverage', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertPrePublishDashboardHealth', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(text, 'assertPublishedDashboardHealth', 'scripts/check-admin-crud-live.mjs');
  requireIncludes(
    text,
    'Read back dashboard health predicates against tagged QA rows before archiving them.',
    'scripts/check-admin-crud-live.mjs',
  );
  requireIncludes(
    text,
    'Dashboard health predicates matched tagged QA rows before archive cleanup.',
    'scripts/check-admin-crud-live.mjs',
  );
  requireIncludes(
    text,
    'Expected exactly ${EXPECTED_AUDIT_ROW_COUNT} tagged audit rows',
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
checkAdminDestructiveBoundaries();
pageChecks.forEach(checkPage);
checkArticleStructuredAuthoring();
checkProductEditorAuthoring();
checkDashboardEditorLanguage();
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
