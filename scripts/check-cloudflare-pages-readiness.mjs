#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, exit } from 'node:process';

const root = cwd();
const failures = [];

const requiredEnvNames = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_TURNSTILE_SITE_KEY',
  'CLOUDFLARE_PAGES_PREVIEW_URL',
  'PAGES_PREVIEW_URL',
  'URBLO_FIRST_ADMIN_EMAIL',
  'URBLO_ADMIN_EMAIL',
  'URBLO_ADMIN_PASSWORD',
  'URBLO_ADMIN_ACCESS_TOKEN',
  'URBLO_UNPROFILED_EMAIL',
  'URBLO_UNPROFILED_PASSWORD',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'TURNSTILE_SECRET_KEY',
  'CF_TURNSTILE_SECRET_KEY',
  'SMTP2GO_API_KEY',
  'RESEND_API_KEY',
  'LEAD_NOTIFICATION_FROM',
  'RESEND_FROM_EMAIL',
  'LEAD_NOTIFICATION_TO',
  'ENQUIRY_NOTIFICATION_TO',
  'SAMPLE_REQUEST_NOTIFICATION_TO',
];

const previewRoutes = [
  '/',
  '/projects',
  '/projects/moon-gate-woolley-street',
  '/products',
  '/products/prime-block',
  '/stone-library',
  '/stone-library/alpine-white',
  '/articles',
  '/articles/modular-mastery-how-primeblock-core-transformed-aitken-college',
  '/capabilities',
  '/contact',
  '/admin',
  '/admin/login',
  '/admin/leads',
  '/admin/media',
  '/admin/settings',
  '/admin/stone-library',
  '/admin/projects',
  '/admin/products',
  '/admin/articles',
  '/admin/audit',
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

function requireRegex(text, pattern, context, label) {
  if (!pattern.test(text)) {
    failures.push(`${context}: missing ${label}`);
  }
}

function nonCommentLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function checkBuildContract() {
  const pkg = JSON.parse(readRequired('package.json'));
  const vite = readRequired('vite.config.ts');

  if (pkg.scripts?.build !== 'tsc -b && vite build') {
    failures.push('package.json: build script must remain "tsc -b && vite build" for Cloudflare Pages');
  }

  requireRegex(vite, /base:\s*['"]\/['"]/, 'vite.config.ts', 'root base "/"');
}

function checkRouting() {
  const redirects = readRequired('public/_redirects');
  const redirectLines = nonCommentLines(redirects);
  const fallbackLine = redirectLines.at(-1);

  if (fallbackLine !== '/* /index.html 200') {
    failures.push('public/_redirects: final rule must be SPA fallback "/* /index.html 200"');
  }

  for (const redirect of [
    '/products/primeBlock /products/prime-block 301',
    '/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College /articles/modular-mastery-how-primeblock-core-transformed-aitken-college 301',
  ]) {
    requireIncludes(redirects, redirect, 'public/_redirects');
  }

  const routes = JSON.parse(readRequired('public/_routes.json'));
  if (routes.version !== 1) {
    failures.push('public/_routes.json: version must be 1');
  }
  if (!Array.isArray(routes.include) || routes.include.length !== 1 || routes.include[0] !== '/api/*') {
    failures.push('public/_routes.json: include must be exactly ["/api/*"] so static routes avoid Functions');
  }
  if (!Array.isArray(routes.exclude) || routes.exclude.length !== 0) {
    failures.push('public/_routes.json: exclude must remain an empty array');
  }
}

function checkHeaders() {
  const headers = readRequired('public/_headers');

  for (const header of [
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '/assets/*',
    'Cache-Control: public, max-age=31536000, immutable',
    '/fonts/*',
    '/media/*',
    'Cache-Control: public, max-age=86400',
  ]) {
    requireIncludes(headers, header, 'public/_headers');
  }
}

function checkFunctions() {
  const enquiries = readRequired('functions/api/enquiries.js');
  const samples = readRequired('functions/api/sample-requests.js');
  const forms = readRequired('functions/_lib/forms.js');
  const adminInviteRoute = readRequired('functions/api/admin/invite-user.js');
  const adminInvite = readRequired('functions/_lib/admin-invite.js');

  for (const [label, text, handler] of [
    ['functions/api/enquiries.js', enquiries, 'handleEnquiryRequest'],
    ['functions/api/sample-requests.js', samples, 'handleSampleRequest'],
  ]) {
    requireIncludes(text, 'export async function onRequest(context)', label);
    requireIncludes(text, "context.request.method === 'OPTIONS'", label);
    requireIncludes(text, "context.request.method !== 'POST'", label);
    requireIncludes(text, handler, label);
    requireIncludes(text, 'context.env', label);
  }

  for (const serverEnv of [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'TURNSTILE_SECRET_KEY',
    'CF_TURNSTILE_SECRET_KEY',
    'SMTP2GO_API_KEY',
    'RESEND_API_KEY',
  ]) {
    requireIncludes(forms, serverEnv, 'functions/_lib/forms.js');
  }

  requireIncludes(adminInviteRoute, 'export async function onRequest(context)', 'functions/api/admin/invite-user.js');
  requireIncludes(adminInviteRoute, "context.request.method === 'OPTIONS'", 'functions/api/admin/invite-user.js');
  requireIncludes(adminInviteRoute, "context.request.method !== 'POST'", 'functions/api/admin/invite-user.js');
  requireIncludes(adminInviteRoute, 'handleAdminInviteUserRequest', 'functions/api/admin/invite-user.js');
  requireIncludes(adminInviteRoute, 'context.env', 'functions/api/admin/invite-user.js');
  requireIncludes(adminInvite, 'SUPABASE_SERVICE_ROLE_KEY', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, 'inviteUserByEmail', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, 'getBearerToken', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, 'requireManagingAdmin', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, 'assertNoExistingCmsAccess', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, 'existing_cms_access', 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, "['owner', 'admin'].includes(profile.role)", 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, ".from('admin_profiles')", 'functions/_lib/admin-invite.js');
  requireIncludes(adminInvite, ".from('admin_audit_events')", 'functions/_lib/admin-invite.js');

  if (/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY/.test(forms)) {
    failures.push('functions/_lib/forms.js: server Functions must not use browser Supabase keys');
  }

  if (/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY/.test(adminInvite)) {
    failures.push('functions/_lib/admin-invite.js: admin invite Function must not use browser Supabase keys');
  }
}

function checkEnvAndDocs() {
  const envExample = readRequired('.env.example');
  const runbook = readRequired('docs/CLOUDFLARE_DEPLOYMENT.md');

  for (const name of requiredEnvNames) {
    requireRegex(envExample, new RegExp(`^${name}=`, 'm'), '.env.example', `${name} placeholder`);
    requireIncludes(runbook, name, 'docs/CLOUDFLARE_DEPLOYMENT.md');
  }

  for (const command of [
    'npm run build',
    'npm run lint',
    'npx tsc -b',
    'npm run agent:smoke',
    'npm run agent:check',
    'npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev',
    'npm run agent:forms-live -- --allow-writes',
    'npm run agent:forms-live -- --allow-writes --require-browser-boundary',
    'npm run agent:forms-live -- --allow-writes --allow-email --require-email',
    'npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>',
    'npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>',
    'npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>',
    'npm run agent:admin-live-readiness -- --admin-email <first-admin-email>',
    'npm run agent:admin-crud-live -- --allow-writes --include-storage',
  ]) {
    requireIncludes(runbook, command, 'docs/CLOUDFLARE_DEPLOYMENT.md');
  }

  for (const approvalGate of [
    '--form-writes-approved',
    'Jay approves tagged form QA writes',
    '--first-admin-writes-approved',
    'Jay approves creating/upserting the first profile or sending an invite',
    '--admin-writes-approved',
    'Jay approves tagged live admin QA writes',
    '--turnstile-token-provided',
  ]) {
    requireIncludes(runbook, approvalGate, 'docs/CLOUDFLARE_DEPLOYMENT.md');
  }

  for (const route of previewRoutes) {
    requireIncludes(runbook, route, 'docs/CLOUDFLARE_DEPLOYMENT.md');
  }
}

checkBuildContract();
checkRouting();
checkHeaders();
checkFunctions();
checkEnvAndDocs();

if (failures.length) {
  console.error('Cloudflare Pages readiness checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log('Cloudflare Pages readiness checks passed.');
console.log('Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.');
