import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { handleEnquiryRequest, handleSampleRequest } from '../functions/_lib/forms.js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const SERVICE_KEY_NAMES = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
const BROWSER_KEY_NAMES = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
const EMAIL_ENV_NAMES = [
  'RESEND_API_KEY',
  'LEAD_NOTIFICATION_FROM',
  'RESEND_FROM_EMAIL',
  'LEAD_NOTIFICATION_TO',
  'ENQUIRY_NOTIFICATION_TO',
  'SAMPLE_REQUEST_NOTIFICATION_TO',
];
const TURNSTILE_ENV_NAMES = ['TURNSTILE_SECRET_KEY', 'CF_TURNSTILE_SECRET_KEY'];

function parseArgs(argv) {
  const options = {
    baseUrl: null,
    envFiles: [...DEFAULT_ENV_FILES],
    allowEmail: false,
    allowWrites: false,
    requireEmail: false,
    requireTurnstile: false,
    requireBrowserBoundary: false,
    turnstileToken: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-email') {
      options.allowEmail = true;
      continue;
    }

    if (arg === '--allow-writes') {
      options.allowWrites = true;
      continue;
    }

    if (arg === '--require-email') {
      options.requireEmail = true;
      continue;
    }

    if (arg === '--require-turnstile') {
      options.requireTurnstile = true;
      continue;
    }

    if (arg === '--require-browser-boundary') {
      options.requireBrowserBoundary = true;
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

    if (arg === '--env-file') {
      options.envFiles.push(argv[index + 1] || '');
      index += 1;
      continue;
    }

    if (arg.startsWith('--env-file=')) {
      options.envFiles.push(arg.slice('--env-file='.length));
      continue;
    }

    if (arg === '--turnstile-token') {
      options.turnstileToken = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--turnstile-token=')) {
      options.turnstileToken = arg.slice('--turnstile-token='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.baseUrl) {
    options.baseUrl = options.baseUrl.replace(/\/$/, '');
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

function hasNotificationConfig(env, type) {
  const to =
    type === 'sample request'
      ? env.SAMPLE_REQUEST_NOTIFICATION_TO || env.LEAD_NOTIFICATION_TO
      : env.ENQUIRY_NOTIFICATION_TO || env.LEAD_NOTIFICATION_TO;
  const from = env.LEAD_NOTIFICATION_FROM || env.RESEND_FROM_EMAIL;

  return Boolean(env.RESEND_API_KEY && to && from);
}

function hasTurnstileConfig(env) {
  return Boolean(env.TURNSTILE_SECRET_KEY || env.CF_TURNSTILE_SECRET_KEY);
}

function requireConfig(env, options) {
  const serviceKeyName = SERVICE_KEY_NAMES.find((key) => env[key]);
  if (!serviceKeyName) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Set it in the shell, .env.local, .env, or .dev.vars before running live form verification.',
    );
  }

  const browserKey = firstEnv(env, BROWSER_KEY_NAMES);
  if (options.requireBrowserBoundary && !browserKey.value) {
    throw new Error(
      'Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY. Set a browser-safe key before running --require-browser-boundary.',
    );
  }

  const supabaseUrl = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  return {
    browserKey: browserKey.value,
    browserKeyName: browserKey.key,
    serviceKey: env[serviceKeyName],
    serviceKeyName,
    supabaseUrl,
  };
}

function safeRuntimeEnv(env, options) {
  const runtimeEnv = { ...env };

  if (!options.allowEmail) {
    for (const key of EMAIL_ENV_NAMES) {
      delete runtimeEnv[key];
    }
  }

  if (!options.turnstileToken) {
    for (const key of TURNSTILE_ENV_NAMES) {
      delete runtimeEnv[key];
    }
  }

  return runtimeEnv;
}

function jsonRequest(path, body) {
  return new Request(`https://urblo-live-check.local${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function submitForm(path, body, runtimeEnv, options) {
  if (options.baseUrl) {
    return fetch(`${options.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  if (path === '/api/enquiries') {
    return handleEnquiryRequest(jsonRequest(path, body), runtimeEnv);
  }

  if (path === '/api/sample-requests') {
    return handleSampleRequest(jsonRequest(path, body), runtimeEnv);
  }

  throw new Error(`Unsupported form path: ${path}`);
}

async function readResponseJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Expected JSON response, received: ${text.slice(0, 160)}`);
  }
}

function restHeaders(config) {
  return {
    apikey: config.serviceKey,
    authorization: `Bearer ${config.serviceKey}`,
    'content-type': 'application/json',
  };
}

function browserKeyHeaders(config, extra = {}) {
  const headers = {
    apikey: config.browserKey,
    ...extra,
  };

  if (config.browserKey && !config.browserKey.startsWith('sb_publishable_')) {
    headers.authorization = `Bearer ${config.browserKey}`;
  }

  return headers;
}

async function supabaseRest(config, path, init = {}) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...init,
    headers: {
      ...restHeaders(config),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase REST ${response.status} for ${path}: ${body.slice(0, 240)}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function selectRows(config, table, filters, select = '*') {
  const query = new URLSearchParams({ select });
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, `eq.${value}`);
  }

  return supabaseRest(config, `/rest/v1/${table}?${query.toString()}`);
}

async function countRows(config, table, filters) {
  const rows = await selectRows(config, table, filters, 'id');
  return rows.length;
}

async function selectAuditRowsByMetadata(config, metadata) {
  const query = new URLSearchParams({ select: 'id,action,entity_type,entity_id,metadata' });
  query.set('metadata', `cs.${JSON.stringify(metadata)}`);
  return supabaseRest(config, `/rest/v1/admin_audit_events?${query.toString()}`);
}

function buildQuery(select, filters = {}) {
  const query = new URLSearchParams({ select });
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, `eq.${value}`);
  }
  return query.toString();
}

async function assertNotAnonymousReadable(config, table, filters, label) {
  if (!config.browserKey) return false;

  const response = await fetch(
    `${config.supabaseUrl}/rest/v1/${table}?${buildQuery('id', filters)}`,
    {
      headers: browserKeyHeaders(config),
    },
  );

  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (response.ok) {
    assert.ok(Array.isArray(json), `${label} anonymous read returned a non-array response.`);
    assert.equal(json.length, 0, `${label} unexpectedly returned rows through anonymous browser-key access.`);
    return true;
  }

  assert.ok(
    [401, 403, 404].includes(response.status),
    `${label} anonymous read failed with unexpected HTTP ${response.status}: ${
      typeof json === 'string' ? json : JSON.stringify(json)
    }`,
  );
  return true;
}

async function verifyAudit(config, action, entityType, entityId, expectedMetadata = {}) {
  const rows = await selectRows(
    config,
    'admin_audit_events',
    {
      action,
      entity_type: entityType,
      entity_id: entityId,
    },
    'id,action,entity_type,entity_id,metadata',
  );
  assert.equal(rows.length, 1, `Expected one audit event for ${action} ${entityType} #${entityId}`);

  for (const [key, value] of Object.entries(expectedMetadata)) {
    assert.equal(
      rows[0].metadata?.[key],
      value,
      `Expected audit event ${action} ${entityType} #${entityId} metadata.${key} to match.`,
    );
  }
}

function verifyNotificationStatus(row, responseBody, label) {
  assert.ok(
    ['not_required', 'sent', 'failed'].includes(responseBody.notificationStatus),
    `Unexpected ${label} notificationStatus: ${responseBody.notificationStatus}`,
  );
  assert.equal(
    row.notification_status,
    responseBody.notificationStatus,
    `Expected stored ${label} notification_status to match the response.`,
  );
}

function verifyRequiredNotificationStatus(row, responseBody, label, options) {
  verifyNotificationStatus(row, responseBody, label);

  if (!options.requireEmail) return;

  assert.equal(
    responseBody.notificationStatus,
    'sent',
    `Expected ${label} notificationStatus to be sent when --require-email is used.`,
  );
  assert.equal(
    row.notification_status,
    'sent',
    `Expected stored ${label} notification_status to be sent when --require-email is used.`,
  );
}

function verifyRequiredTurnstileStatus(row, label, options) {
  if (!options.requireTurnstile) return;

  assert.equal(
    row.turnstile_success,
    true,
    `Expected stored ${label} turnstile_success to be true when --require-turnstile is used.`,
  );
}

function withTurnstile(body, options) {
  if (!options.turnstileToken) return body;
  return {
    ...body,
    turnstileToken: options.turnstileToken,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.allowWrites) {
    throw new Error(
      'Live form verification creates tagged Supabase rows. Re-run with --allow-writes only after Jay approves tagged live form QA writes.',
    );
  }

  const env = loadEnv(options.envFiles);
  const config = requireConfig(env, options);

  if (options.requireEmail && !options.baseUrl) {
    if (!options.allowEmail) {
      throw new Error('Direct handler --require-email also requires --allow-email so live email delivery is explicit.');
    }

    const missingEmailTypes = ['enquiry', 'sample request'].filter((type) => !hasNotificationConfig(env, type));
    if (missingEmailTypes.length > 0) {
      throw new Error(
        `Missing email notification configuration for ${missingEmailTypes.join(
          ' and ',
        )}. Set RESEND_API_KEY, LEAD_NOTIFICATION_FROM or RESEND_FROM_EMAIL, and the relevant recipient variable before using --require-email.`,
      );
    }
  }

  if (options.requireTurnstile) {
    if (!options.turnstileToken) {
      throw new Error('Missing --turnstile-token. A valid Turnstile token is required when using --require-turnstile.');
    }

    if (!options.baseUrl && !hasTurnstileConfig(env)) {
      throw new Error(
        'Missing TURNSTILE_SECRET_KEY or CF_TURNSTILE_SECRET_KEY. Set a server-side Turnstile secret before using --require-turnstile in direct handler mode.',
      );
    }
  }

  const runtimeEnv = options.baseUrl ? env : safeRuntimeEnv(env, options);
  const marker = `urblo-live-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  console.log('Live Forms API verification starting.');
  console.log(`Mode: ${options.baseUrl ? `HTTP ${options.baseUrl}` : 'direct handler'}`);
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Service key source: ${config.serviceKeyName}`);
  console.log(`Browser-key private boundary: ${config.browserKey ? config.browserKeyName : 'not configured'}`);
  if (!options.baseUrl && !options.allowEmail) {
    console.log('Handler mode email delivery disabled for this verification run.');
  }
  if (!options.baseUrl && !options.turnstileToken) {
    console.log('Handler mode Turnstile disabled for this verification run.');
  }

  const invalidEnquiryEmail = `invalid-enquiry-${marker}`;
  const invalidSampleEmail = `invalid-sample-${marker}`;
  const invalidEnquiryRoute = `/contact?live_check=${marker}&invalid=enquiry`;
  const invalidSampleRoute = `/contact?intent=sample-request&live_check=${marker}&invalid=sample`;
  const enquiryRoute = `/contact?live_check=${marker}`;
  const sampleRoute = `/contact?intent=sample-request&live_check=${marker}`;

  assert.equal(await countRows(config, 'enquiries', { email: invalidEnquiryEmail }), 0);
  assert.equal((await selectAuditRowsByMetadata(config, { sourceRoute: invalidEnquiryRoute })).length, 0);
  const invalidEnquiryResponse = await submitForm(
    '/api/enquiries',
    {
      name: 'No',
      email: invalidEnquiryEmail,
      message: 'short',
      sourceRoute: invalidEnquiryRoute,
    },
    runtimeEnv,
    options,
  );
  const invalidEnquiryBody = await readResponseJson(invalidEnquiryResponse);
  assert.equal(invalidEnquiryResponse.status, 400);
  assert.equal(invalidEnquiryBody.ok, false);
  assert.equal(await countRows(config, 'enquiries', { email: invalidEnquiryEmail }), 0);
  assert.equal((await selectAuditRowsByMetadata(config, { sourceRoute: invalidEnquiryRoute })).length, 0);
  console.log('Invalid enquiry created no rows or audit events.');

  const enquiryEmail = `enquiry-${marker}@example.com`;
  const enquiryResponse = await submitForm(
    '/api/enquiries',
    withTurnstile(
      {
        name: 'Urblo Live Check',
        email: enquiryEmail,
        company: 'Urblo Verification',
        projectType: 'Live persistence check',
        message: `Live Supabase form persistence verification marker ${marker}.`,
        sourceRoute: enquiryRoute,
      },
      options,
    ),
    runtimeEnv,
    options,
  );
  const enquiryBody = await readResponseJson(enquiryResponse);
  assert.equal(enquiryResponse.status, 201);
  assert.equal(enquiryBody.ok, true);

  const enquiryRows = await selectRows(config, 'enquiries', { id: enquiryBody.id });
  assert.equal(enquiryRows.length, 1, 'Expected one live enquiry row.');
  assert.equal(enquiryRows[0].email, enquiryEmail);
  assert.equal(enquiryRows[0].source_route, enquiryRoute);
  verifyRequiredNotificationStatus(enquiryRows[0], enquiryBody, 'enquiry', options);
  verifyRequiredTurnstileStatus(enquiryRows[0], 'enquiry', options);
  await verifyAudit(config, 'enquiry.create', 'enquiries', enquiryBody.id, { sourceRoute: enquiryRoute });
  const checkedEnquiryBoundary = await assertNotAnonymousReadable(
    config,
    'enquiries',
    { id: enquiryBody.id },
    'Live enquiry row',
  );
  console.log(`Valid enquiry created row and audit event: enquiries #${enquiryBody.id}.`);

  assert.equal(await countRows(config, 'sample_requests', { email: invalidSampleEmail }), 0);
  assert.equal((await selectAuditRowsByMetadata(config, { sourceRoute: invalidSampleRoute })).length, 0);
  const invalidSampleResponse = await submitForm(
    '/api/sample-requests',
    {
      name: 'No',
      email: invalidSampleEmail,
      shippingAddress: 'x',
      sampleStone: '',
      sourceRoute: invalidSampleRoute,
    },
    runtimeEnv,
    options,
  );
  const invalidSampleBody = await readResponseJson(invalidSampleResponse);
  assert.equal(invalidSampleResponse.status, 400);
  assert.equal(invalidSampleBody.ok, false);
  assert.equal(await countRows(config, 'sample_requests', { email: invalidSampleEmail }), 0);
  assert.equal((await selectAuditRowsByMetadata(config, { sourceRoute: invalidSampleRoute })).length, 0);
  console.log('Invalid sample request created no rows or audit events.');

  const sampleEmail = `sample-${marker}@example.com`;
  const sampleResponse = await submitForm(
    '/api/sample-requests',
    withTurnstile(
      {
        name: 'Urblo Sample Live Check',
        email: sampleEmail,
        company: 'Urblo Verification',
        shippingAddress: '1 Verification Street, Melbourne VIC 3000',
        projectName: 'Live Forms Check',
        sampleStone: 'Angola Black',
        sampleFinish: 'Honed',
        sampleQuantity: '2',
        message: `Live sample request persistence verification marker ${marker}.`,
        sourceRoute: sampleRoute,
      },
      options,
    ),
    runtimeEnv,
    options,
  );
  const sampleBody = await readResponseJson(sampleResponse);
  assert.equal(sampleResponse.status, 201);
  assert.equal(sampleBody.ok, true);

  const sampleRows = await selectRows(config, 'sample_requests', { id: sampleBody.id });
  assert.equal(sampleRows.length, 1, 'Expected one live sample request row.');
  assert.equal(sampleRows[0].email, sampleEmail);
  assert.equal(sampleRows[0].source_route, sampleRoute);
  verifyRequiredNotificationStatus(sampleRows[0], sampleBody, 'sample request', options);
  verifyRequiredTurnstileStatus(sampleRows[0], 'sample request', options);

  const itemRows = await selectRows(
    config,
    'sample_request_items',
    { sample_request_id: sampleBody.id },
    'id,sample_request_id,quantity,notes',
  );
  assert.equal(itemRows.length, 1, 'Expected one live sample request item row.');
  assert.equal(itemRows[0].quantity, 2);
  assert.match(itemRows[0].notes, /Angola Black/);
  await verifyAudit(config, 'sample_request.create', 'sample_requests', sampleBody.id, {
    sourceRoute: sampleRoute,
    itemId: itemRows[0].id,
    quantity: 2,
  });
  const checkedSampleRequestBoundary = await assertNotAnonymousReadable(
    config,
    'sample_requests',
    { id: sampleBody.id },
    'Live sample request row',
  );
  const checkedSampleItemBoundary = await assertNotAnonymousReadable(
    config,
    'sample_request_items',
    { id: itemRows[0].id },
    'Live sample request item row',
  );
  console.log(
    `Valid sample request created row, item, and audit event: sample_requests #${sampleBody.id}, item #${itemRows[0].id}.`,
  );

  if (checkedEnquiryBoundary && checkedSampleRequestBoundary && checkedSampleItemBoundary) {
    console.log('Anonymous browser-key reads returned no live private form rows.');
  } else {
    console.log(
      'Browser-key private lead boundary skipped; set VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY and rerun with --require-browser-boundary before final launch proof.',
    );
  }

  console.log('Live Forms API verification passed.');
  console.log(`Marker: ${marker}`);
  console.log('Test rows are retained for auditability. Mark or remove them only after Jay approves cleanup.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
