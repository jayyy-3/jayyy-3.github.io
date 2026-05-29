import fs from 'node:fs';

const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const SERVICE_KEY_NAMES = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
const BROWSER_KEY_NAMES = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
const ADMIN_EMAIL_NAMES = ['URBLO_FIRST_ADMIN_EMAIL'];
const ADMIN_SESSION_TOKEN_NAMES = ['URBLO_ADMIN_ACCESS_TOKEN'];
const ADMIN_SESSION_PASSWORD_NAMES = ['URBLO_ADMIN_EMAIL', 'URBLO_ADMIN_PASSWORD'];
const PREVIEW_URL_NAMES = ['CLOUDFLARE_PAGES_PREVIEW_URL', 'PAGES_PREVIEW_URL'];
const TURNSTILE_NAMES = ['TURNSTILE_SECRET_KEY', 'CF_TURNSTILE_SECRET_KEY'];
const TURNSTILE_SITE_KEY_NAMES = ['VITE_TURNSTILE_SITE_KEY'];
const EMAIL_NAMES = [
  'RESEND_API_KEY',
  'LEAD_NOTIFICATION_FROM',
  'RESEND_FROM_EMAIL',
  'LEAD_NOTIFICATION_TO',
  'ENQUIRY_NOTIFICATION_TO',
  'SAMPLE_REQUEST_NOTIFICATION_TO',
];

function parseArgs(argv) {
  const options = {
    adminEmail: '',
    adminWritesApproved: false,
    baseUrl: '',
    contentImportApproved: false,
    contentMergeApproved: false,
    contentPublicCutoverApproved: false,
    envFiles: [...DEFAULT_ENV_FILES],
    firstAdminWritesApproved: false,
    formWritesApproved: false,
    json: false,
    strict: false,
    turnstileTokenProvided: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--strict') {
      options.strict = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
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

    if (arg === '--admin-writes-approved') {
      options.adminWritesApproved = true;
      continue;
    }

    if (arg === '--content-import-approved') {
      options.contentImportApproved = true;
      continue;
    }

    if (arg === '--content-merge-approved') {
      options.contentMergeApproved = true;
      continue;
    }

    if (arg === '--content-public-cutover-approved') {
      options.contentPublicCutoverApproved = true;
      continue;
    }

    if (arg === '--form-writes-approved') {
      options.formWritesApproved = true;
      continue;
    }

    if (arg === '--first-admin-writes-approved') {
      options.firstAdminWritesApproved = true;
      continue;
    }

    if (arg === '--turnstile-token-provided') {
      options.turnstileTokenProvided = true;
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
  const env = {};
  const sources = {};
  const scannedFiles = [];

  for (const file of envFiles) {
    if (!fs.existsSync(file)) continue;
    scannedFiles.push(file);
    for (const [key, value] of Object.entries(parseEnvFile(file))) {
      env[key] = value;
      sources[key] = file;
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value !== 'string' || !value) continue;
    env[key] = value;
    sources[key] = 'shell';
  }

  return { env, scannedFiles, sources };
}

function firstPresent(env, names) {
  return names.find((name) => Boolean(env[name])) || '';
}

function allPresent(env, names) {
  return names.every((name) => Boolean(env[name]));
}

function describeSource(name, sources) {
  return name ? `${name} (${sources[name] || 'unknown source'})` : '';
}

function presentSource(name, sources, cliDescription) {
  return cliDescription || describeSource(name, sources);
}

function makeCheck({ id, label, command, present = [], missing = [], manual = [], optional = [] }) {
  return {
    id,
    label,
    command,
    manual,
    missing,
    optional,
    present,
    ready: missing.length === 0 && manual.length === 0,
  };
}

function buildChecks(env, sources, options) {
  const serviceKey = firstPresent(env, SERVICE_KEY_NAMES);
  const browserKey = firstPresent(env, BROWSER_KEY_NAMES);
  const firstAdminEmailEnv = firstPresent(env, ADMIN_EMAIL_NAMES);
  const firstAdminEmail = options.adminEmail || firstAdminEmailEnv;
  const firstAdminEmailSource = options.adminEmail ? '--admin-email argument' : describeSource(firstAdminEmailEnv, sources);
  const previewUrlEnv = firstPresent(env, PREVIEW_URL_NAMES);
  const previewUrl = options.baseUrl || previewUrlEnv;
  const previewUrlSource = options.baseUrl ? '--base-url argument' : describeSource(previewUrlEnv, sources);
  const adminToken = firstPresent(env, ADMIN_SESSION_TOKEN_NAMES);
  const adminPasswordSession = allPresent(env, ADMIN_SESSION_PASSWORD_NAMES);
  const turnstile = firstPresent(env, TURNSTILE_NAMES);
  const turnstileSiteKey = firstPresent(env, TURNSTILE_SITE_KEY_NAMES);
  const emailSenderReady = Boolean(env.RESEND_API_KEY) && Boolean(env.LEAD_NOTIFICATION_FROM || env.RESEND_FROM_EMAIL);
  const enquiryEmailReady = emailSenderReady && Boolean(env.ENQUIRY_NOTIFICATION_TO || env.LEAD_NOTIFICATION_TO);
  const sampleEmailReady = emailSenderReady && Boolean(env.SAMPLE_REQUEST_NOTIFICATION_TO || env.LEAD_NOTIFICATION_TO);

  return [
    makeCheck({
      id: 'forms-live-local',
      label: 'Local/direct live form persistence',
      command: 'npm run agent:forms-live -- --allow-writes',
      present: [
        describeSource(serviceKey, sources),
        options.formWritesApproved ? 'Jay approval flag supplied for tagged live form QA writes' : '',
      ].filter(Boolean),
      missing: serviceKey ? [] : ['SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY'],
      manual: options.formWritesApproved
        ? []
        : ['Jay approval for tagged live form QA writes is required before running forms-live --allow-writes'],
      optional: [
        turnstile
          ? `Turnstile configured via ${describeSource(turnstile, sources)}`
          : 'Turnstile not configured; handler-mode verifier suppresses Turnstile unless --turnstile-token is supplied',
        enquiryEmailReady && sampleEmailReady
          ? 'Email notification inputs appear configured'
          : 'Email notification inputs incomplete; handler-mode verifier suppresses email unless --allow-email is supplied',
      ],
    }),
    makeCheck({
      id: 'forms-live-preview',
      label: 'Deployed Cloudflare form persistence',
      command: 'npm run agent:forms-live -- --allow-writes --base-url <preview-or-production-origin>',
      present: [
        describeSource(serviceKey, sources),
        presentSource(previewUrlEnv, sources, previewUrlSource),
        options.formWritesApproved ? 'Jay approval flag supplied for tagged live form QA writes' : '',
      ].filter(Boolean),
      missing: [
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        previewUrl ? '' : 'CLOUDFLARE_PAGES_PREVIEW_URL or PAGES_PREVIEW_URL, or pass --base-url manually',
      ].filter(Boolean),
      manual: options.formWritesApproved
        ? []
        : ['Jay approval for tagged live form QA writes is required before running forms-live --allow-writes'],
    }),
    makeCheck({
      id: 'forms-private-boundary',
      label: 'Live form private-row browser-key boundary',
      command: 'npm run agent:forms-live -- --allow-writes --require-browser-boundary',
      present: [
        describeSource(serviceKey, sources),
        describeSource(browserKey, sources),
        options.formWritesApproved ? 'Jay approval flag supplied for tagged live form QA writes' : '',
      ].filter(Boolean),
      missing: [
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        browserKey ? '' : 'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
      ].filter(Boolean),
      manual: options.formWritesApproved
        ? []
        : ['Jay approval for tagged live form QA writes is required before running forms-live --allow-writes'],
      optional: [
        'Runs the live form persistence check and additionally verifies created private lead rows are not anonymously readable through the browser key.',
      ],
    }),
    makeCheck({
      id: 'forms-email-proof',
      label: 'Live form email notification proof',
      command: 'npm run agent:forms-live -- --allow-writes --allow-email --require-email',
      present: [
        describeSource(serviceKey, sources),
        env.RESEND_API_KEY ? `RESEND_API_KEY (${sources.RESEND_API_KEY || 'unknown source'})` : '',
        env.LEAD_NOTIFICATION_FROM || env.RESEND_FROM_EMAIL
          ? `${env.LEAD_NOTIFICATION_FROM ? 'LEAD_NOTIFICATION_FROM' : 'RESEND_FROM_EMAIL'} (${
              sources[env.LEAD_NOTIFICATION_FROM ? 'LEAD_NOTIFICATION_FROM' : 'RESEND_FROM_EMAIL'] || 'unknown source'
            })`
          : '',
        enquiryEmailReady ? 'enquiry notification recipient configured' : '',
        sampleEmailReady ? 'sample request notification recipient configured' : '',
        options.formWritesApproved ? 'Jay approval flag supplied for tagged live form QA writes' : '',
      ].filter(Boolean),
      missing: [
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        env.RESEND_API_KEY ? '' : 'RESEND_API_KEY',
        env.LEAD_NOTIFICATION_FROM || env.RESEND_FROM_EMAIL
          ? ''
          : 'LEAD_NOTIFICATION_FROM or RESEND_FROM_EMAIL',
        enquiryEmailReady ? '' : 'ENQUIRY_NOTIFICATION_TO or LEAD_NOTIFICATION_TO',
        sampleEmailReady ? '' : 'SAMPLE_REQUEST_NOTIFICATION_TO or LEAD_NOTIFICATION_TO',
      ].filter(Boolean),
      manual: options.formWritesApproved
        ? []
        : ['Jay approval for tagged live form QA writes is required before running forms-live --allow-writes'],
      optional: [
        'Requires real email side effects and asserts stored enquiry/sample request notification_status values are sent.',
      ],
    }),
    makeCheck({
      id: 'forms-turnstile-proof',
      label: 'Live form Turnstile proof',
      command: 'npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>',
      present: [
        describeSource(serviceKey, sources),
        describeSource(turnstile, sources),
        describeSource(turnstileSiteKey, sources),
        options.formWritesApproved ? 'Jay approval flag supplied for tagged live form QA writes' : '',
      ].filter(Boolean),
      missing: [
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        turnstile ? '' : 'TURNSTILE_SECRET_KEY or CF_TURNSTILE_SECRET_KEY',
        turnstileSiteKey ? '' : 'VITE_TURNSTILE_SITE_KEY',
      ].filter(Boolean),
      manual: [
        options.formWritesApproved
          ? ''
          : 'Jay approval for tagged live form QA writes is required before running forms-live --allow-writes',
        options.turnstileTokenProvided
          ? ''
          : 'A valid target-environment Turnstile token must be supplied with --turnstile-token',
      ].filter(Boolean),
      optional: [
        'Asserts stored enquiry/sample request turnstile_success values are true for the tagged live rows and keeps the public Contact widget configured.',
      ],
    }),
    makeCheck({
      id: 'admin-live-readiness',
      label: 'Read-only first-admin readiness',
      command: 'npm run agent:admin-live-readiness -- --admin-email <first-admin-email>',
      present: [
        describeSource(browserKey, sources),
        describeSource(serviceKey, sources),
        presentSource(firstAdminEmailEnv, sources, firstAdminEmailSource),
      ].filter(Boolean),
      missing: [
        browserKey ? '' : 'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        firstAdminEmail ? '' : 'URBLO_FIRST_ADMIN_EMAIL or --admin-email',
      ].filter(Boolean),
    }),
    makeCheck({
      id: 'first-admin-bootstrap',
      label: 'First-admin bootstrap plan/read-only verifier',
      command: 'npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>',
      present: [
        describeSource(serviceKey, sources),
        presentSource(firstAdminEmailEnv, sources, firstAdminEmailSource),
      ].filter(Boolean),
      missing: [
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        firstAdminEmail ? '' : 'URBLO_FIRST_ADMIN_EMAIL or --admin-email',
      ].filter(Boolean),
      optional: [
        'Live bootstrap writes require Jay approval plus --allow-writes and a matching --confirm-email.',
      ],
    }),
    makeCheck({
      id: 'first-admin-bootstrap-write',
      label: 'First-admin profile/invite live write',
      command:
        'npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>',
      present: [
        describeSource(serviceKey, sources),
        presentSource(firstAdminEmailEnv, sources, firstAdminEmailSource),
        options.firstAdminWritesApproved ? 'Jay approval flag supplied for first-admin profile/invite writes' : '',
      ].filter(Boolean),
      missing: [
        serviceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
        firstAdminEmail ? '' : 'URBLO_FIRST_ADMIN_EMAIL or --admin-email',
      ].filter(Boolean),
      manual: options.firstAdminWritesApproved
        ? []
        : ['Jay approval for first-admin profile/invite writes is required before running first-admin-bootstrap --allow-writes'],
      optional: [
        'Add --invite only when Jay explicitly approves sending a Supabase Auth invitation.',
        'Existing active owners block a new first-admin bootstrap unless --allow-existing-owner is intentional.',
      ],
    }),
    makeCheck({
      id: 'admin-crud-live',
      label: 'Tagged admin CRUD/audit live writes',
      command: 'npm run agent:admin-crud-live -- --allow-writes',
      present: [
        describeSource(browserKey, sources),
        describeSource(adminToken, sources),
        adminPasswordSession ? 'URBLO_ADMIN_EMAIL and URBLO_ADMIN_PASSWORD configured' : '',
        options.adminWritesApproved ? 'Jay approval flag supplied for tagged live QA writes' : '',
      ].filter(Boolean),
      missing: [
        browserKey ? '' : 'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
        adminToken || adminPasswordSession
          ? ''
          : 'URBLO_ADMIN_ACCESS_TOKEN, or URBLO_ADMIN_EMAIL plus URBLO_ADMIN_PASSWORD',
      ].filter(Boolean),
      manual: options.adminWritesApproved
        ? []
        : ['Jay approval for tagged live QA writes is required before running --allow-writes'],
    }),
    makeCheck({
      id: 'admin-crud-live-storage',
      label: 'Tagged admin media Storage upload policy',
      command: 'npm run agent:admin-crud-live -- --allow-writes --include-storage',
      present: [
        describeSource(browserKey, sources),
        describeSource(adminToken, sources),
        adminPasswordSession ? 'URBLO_ADMIN_EMAIL and URBLO_ADMIN_PASSWORD configured' : '',
        options.adminWritesApproved ? 'Jay approval flag supplied for tagged live QA writes' : '',
      ].filter(Boolean),
      missing: [
        browserKey ? '' : 'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY',
        adminToken || adminPasswordSession
          ? ''
          : 'URBLO_ADMIN_ACCESS_TOKEN, or URBLO_ADMIN_EMAIL plus URBLO_ADMIN_PASSWORD',
      ].filter(Boolean),
      manual: options.adminWritesApproved
        ? []
        : ['Jay approval for tagged live QA writes is required before running --allow-writes --include-storage'],
      optional: [
        'Runs the admin CRUD live verifier, uploads a tiny private urblo-admin-media object, verifies signed-in admin readback, and verifies anonymous reads are denied.',
      ],
    }),
    makeCheck({
      id: 'content-import-artifacts',
      label: 'Static-to-Supabase draft import artifacts',
      command: 'npm run agent:content-import:apply-sql',
      present: ['source-only guarded import, preflight, plan, and rollback artifact command is available'],
      optional: [
        'This command writes ignored .tmp review artifacts only; it does not apply SQL or mutate Supabase.',
        'Review .tmp/content-import-preflight.sql before any live import approval.',
      ],
    }),
    makeCheck({
      id: 'content-import-live-apply',
      label: 'Approved draft content import live apply',
      command:
        'Review .tmp/content-import-preflight.sql, then apply .tmp/content-import-apply.sql only after setting the guarded approval variables inside the transaction',
      present: [
        options.contentImportApproved ? 'Jay approval flag supplied for guarded draft content import apply' : '',
        options.contentMergeApproved ? 'Jay approval flag supplied for merge/upsert when existing parent natural-key matches are present' : '',
      ].filter(Boolean),
      manual: [
        options.contentImportApproved
          ? ''
          : 'Jay approval is required before applying guarded draft content import SQL to Supabase',
        options.contentMergeApproved
          ? ''
          : 'Jay approval for import merge/upsert is required if preflight reports existing parent natural-key matches',
      ].filter(Boolean),
      optional: [
        'The guarded apply SQL must keep imported content in draft and must not publish, delete, truncate, or disable RLS.',
        'Use Supabase connector or an approved server-side SQL session; never paste or commit service-role secrets.',
      ],
    }),
    makeCheck({
      id: 'public-supabase-cutover',
      label: 'Public content read cutover approval',
      command:
        'After approved draft import and live admin verification, migrate public read paths deliberately and run npm run agent:public-supabase-readiness plus runtime gates',
      present: [
        options.contentPublicCutoverApproved ? 'Jay approval flag supplied for public read cutover work' : '',
      ].filter(Boolean),
      manual: options.contentPublicCutoverApproved
        ? []
        : ['Jay approval is required before switching public Projects, Stone Library, Products, or Articles away from static/file-backed reads'],
      optional: [
        'Public routes must continue exposing published content only, and static fallback must remain explicit until each content type is fully migrated.',
      ],
    }),
    makeCheck({
      id: 'cloudflare-preview-smoke',
      label: 'Cloudflare deployed-preview route/API smoke',
      command: 'npm run agent:cloudflare-preview-smoke -- --base-url <preview-origin>',
      present: [presentSource(previewUrlEnv, sources, previewUrlSource)].filter(Boolean),
      missing: previewUrl
        ? []
        : ['CLOUDFLARE_PAGES_PREVIEW_URL or PAGES_PREVIEW_URL, or pass --base-url manually'],
    }),
  ];
}

function printTextReport({ checks, scannedFiles, strict }) {
  console.log('Urblo live readiness input audit.');
  console.log(`Environment files scanned: ${scannedFiles.length > 0 ? scannedFiles.join(', ') : 'none found'}`);
  console.log('Secrets are never printed; only variable names and sources are reported.');
  console.log('');

  for (const check of checks) {
    const status = check.ready ? 'ready' : check.missing.length > 0 ? 'missing' : 'manual';
    console.log(`[${status}] ${check.label}`);
    console.log(`  command: ${check.command}`);
    if (check.present.length > 0) {
      console.log(`  present: ${check.present.join(', ')}`);
    }
    if (check.missing.length > 0) {
      console.log(`  missing: ${check.missing.join('; ')}`);
    }
    if (check.manual.length > 0) {
      console.log(`  manual: ${check.manual.join('; ')}`);
    }
    for (const note of check.optional) {
      console.log(`  note: ${note}`);
    }
    console.log('');
  }

  if (strict) {
    console.log('Strict mode enabled: missing or manual-gated live inputs make this command fail.');
  } else {
    console.log('Report-only mode: use --strict to fail when live inputs are missing or manually gated.');
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const { env, scannedFiles, sources } = loadEnv(options.envFiles);
  const checks = buildChecks(env, sources, options);
  const blockers = checks.filter((check) => !check.ready);

  if (options.json) {
    console.log(JSON.stringify({ checks, scannedFiles, strict: options.strict }, null, 2));
  } else {
    printTextReport({ checks, scannedFiles, strict: options.strict });
  }

  if (options.strict && blockers.length > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
