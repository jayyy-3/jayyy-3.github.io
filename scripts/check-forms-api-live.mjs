import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { handleEnquiryRequest, handleSampleRequest } from '../functions/_lib/forms.js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const DEFAULT_ENV_FILES = ['.env.local', '.env', '.dev.vars'];
const SERVICE_KEY_NAMES = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
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
    turnstileToken: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-email') {
      options.allowEmail = true;
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

function requireConfig(env) {
  const serviceKeyName = SERVICE_KEY_NAMES.find((key) => env[key]);
  if (!serviceKeyName) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Set it in the shell, .env.local, .env, or .dev.vars before running live form verification.',
    );
  }

  const supabaseUrl = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  return {
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

async function verifyAudit(config, action, entityType, entityId) {
  const rows = await selectRows(
    config,
    'admin_audit_events',
    {
      action,
      entity_type: entityType,
      entity_id: entityId,
    },
    'id,action,entity_type,entity_id',
  );
  assert.equal(rows.length, 1, `Expected one audit event for ${action} ${entityType} #${entityId}`);
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

function withTurnstile(body, options) {
  if (!options.turnstileToken) return body;
  return {
    ...body,
    turnstileToken: options.turnstileToken,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const env = loadEnv(options.envFiles);
  const config = requireConfig(env);
  const runtimeEnv = options.baseUrl ? env : safeRuntimeEnv(env, options);
  const marker = `urblo-live-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  console.log('Live Forms API verification starting.');
  console.log(`Mode: ${options.baseUrl ? `HTTP ${options.baseUrl}` : 'direct handler'}`);
  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Service key source: ${config.serviceKeyName}`);
  if (!options.baseUrl && !options.allowEmail) {
    console.log('Handler mode email delivery disabled for this verification run.');
  }
  if (!options.baseUrl && !options.turnstileToken) {
    console.log('Handler mode Turnstile disabled for this verification run.');
  }

  const invalidEnquiryEmail = `invalid-enquiry-${marker}`;
  const invalidSampleEmail = `invalid-sample-${marker}`;

  assert.equal(await countRows(config, 'enquiries', { email: invalidEnquiryEmail }), 0);
  const invalidEnquiryResponse = await submitForm(
    '/api/enquiries',
    {
      name: 'No',
      email: invalidEnquiryEmail,
      message: 'short',
      sourceRoute: `/contact?live_check=${marker}`,
    },
    runtimeEnv,
    options,
  );
  const invalidEnquiryBody = await readResponseJson(invalidEnquiryResponse);
  assert.equal(invalidEnquiryResponse.status, 400);
  assert.equal(invalidEnquiryBody.ok, false);
  assert.equal(await countRows(config, 'enquiries', { email: invalidEnquiryEmail }), 0);
  console.log('Invalid enquiry created no rows.');

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
        sourceRoute: `/contact?live_check=${marker}`,
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
  assert.equal(enquiryRows[0].source_route, `/contact?live_check=${marker}`);
  verifyNotificationStatus(enquiryRows[0], enquiryBody, 'enquiry');
  await verifyAudit(config, 'enquiry.create', 'enquiries', enquiryBody.id);
  console.log(`Valid enquiry created row and audit event: enquiries #${enquiryBody.id}.`);

  assert.equal(await countRows(config, 'sample_requests', { email: invalidSampleEmail }), 0);
  const invalidSampleResponse = await submitForm(
    '/api/sample-requests',
    {
      name: 'No',
      email: invalidSampleEmail,
      shippingAddress: 'x',
      sampleStone: '',
      sourceRoute: `/contact?intent=sample-request&live_check=${marker}`,
    },
    runtimeEnv,
    options,
  );
  const invalidSampleBody = await readResponseJson(invalidSampleResponse);
  assert.equal(invalidSampleResponse.status, 400);
  assert.equal(invalidSampleBody.ok, false);
  assert.equal(await countRows(config, 'sample_requests', { email: invalidSampleEmail }), 0);
  console.log('Invalid sample request created no rows.');

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
        sourceRoute: `/contact?intent=sample-request&live_check=${marker}`,
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
  assert.equal(sampleRows[0].source_route, `/contact?intent=sample-request&live_check=${marker}`);
  verifyNotificationStatus(sampleRows[0], sampleBody, 'sample request');

  const itemRows = await selectRows(
    config,
    'sample_request_items',
    { sample_request_id: sampleBody.id },
    'id,sample_request_id,quantity,notes',
  );
  assert.equal(itemRows.length, 1, 'Expected one live sample request item row.');
  assert.equal(itemRows[0].quantity, 2);
  assert.match(itemRows[0].notes, /Angola Black/);
  await verifyAudit(config, 'sample_request.create', 'sample_requests', sampleBody.id);
  console.log(
    `Valid sample request created row, item, and audit event: sample_requests #${sampleBody.id}, item #${itemRows[0].id}.`,
  );

  console.log('Live Forms API verification passed.');
  console.log(`Marker: ${marker}`);
  console.log('Test rows are retained for auditability. Mark or remove them only after Jay approves cleanup.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
