const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const MAX_JSON_BYTES = 32_000;

class ApiError extends Error {
  constructor(status, code, message, fields = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: 'POST, OPTIONS',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
    },
  });
}

export function methodNotAllowedResponse() {
  return jsonResponse(
    {
      ok: false,
      error: {
        code: 'method_not_allowed',
        message: 'Use POST for this endpoint.',
      },
    },
    405,
  );
}

function errorResponse(error) {
  if (error instanceof ApiError) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      error.status,
    );
  }

  return jsonResponse(
    {
      ok: false,
      error: {
        code: 'server_error',
        message: 'The request could not be submitted. Please contact Urblo directly.',
      },
    },
    500,
  );
}

function normalizeLine(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, maxLength);
}

function nullable(value) {
  return value.length > 0 ? value : null;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function requireString(fields, key, value, label, minimumLength = 1) {
  if (value.length < minimumLength) {
    fields[key] = `${label} is required.`;
  }
}

function getNotificationConfig(env, type) {
  const to =
    type === 'sample request'
      ? env.SAMPLE_REQUEST_NOTIFICATION_TO || env.LEAD_NOTIFICATION_TO
      : env.ENQUIRY_NOTIFICATION_TO || env.LEAD_NOTIFICATION_TO;
  const from = env.LEAD_NOTIFICATION_FROM || env.RESEND_FROM_EMAIL;

  if (!env.RESEND_API_KEY || !to || !from) {
    return null;
  }

  return {
    apiKey: env.RESEND_API_KEY,
    from,
    to,
  };
}

async function readPayload(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_JSON_BYTES) {
    throw new ApiError(413, 'payload_too_large', 'The submission is too large.');
  }

  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('Expected JSON object');
    }
    return payload;
  } catch {
    throw new ApiError(400, 'invalid_json', 'Send a valid JSON object.');
  }
}

function getSourceRoute(payload) {
  return normalizeLine(payload.sourceRoute || payload.source_route || '/contact', 200) || '/contact';
}

function getTurnstileToken(payload) {
  return normalizeLine(payload.turnstileToken || payload.cfTurnstileToken || '', 4096);
}

function validateEnquiryPayload(payload) {
  const fields = {};
  const name = normalizeLine(payload.name, 120);
  const email = normalizeLine(payload.email, 254).toLowerCase();
  const message = normalizeText(payload.message, 4000);

  requireString(fields, 'name', name, 'Name', 2);
  requireString(fields, 'email', email, 'Email');
  requireString(fields, 'message', message, 'Project notes', 10);

  if (email && !isEmail(email)) {
    fields.email = 'Enter a valid email address.';
  }

  if (Object.keys(fields).length > 0) {
    throw new ApiError(400, 'validation_failed', 'Check the highlighted fields.', fields);
  }

  return {
    name,
    email,
    phone: nullable(normalizeLine(payload.phone, 60)),
    company: nullable(normalizeLine(payload.company, 160)),
    projectType: normalizeLine(payload.projectType || payload.project_type || 'Project enquiry', 120),
    message,
    sourceRoute: getSourceRoute(payload),
    turnstileToken: getTurnstileToken(payload),
  };
}

function validateSampleRequestPayload(payload) {
  const fields = {};
  const name = normalizeLine(payload.name, 120);
  const email = normalizeLine(payload.email, 254).toLowerCase();
  const shippingAddress = normalizeText(payload.shippingAddress || payload.shipping_address, 700);
  const sampleStone = normalizeLine(payload.sampleStone || payload.stone, 160);
  const quantity = Number.parseInt(payload.sampleQuantity || payload.quantity || '1', 10);

  requireString(fields, 'name', name, 'Name', 2);
  requireString(fields, 'email', email, 'Email');
  requireString(fields, 'shippingAddress', shippingAddress, 'Shipping address', 8);
  requireString(fields, 'sampleStone', sampleStone, 'Stone or sample preference', 2);

  if (email && !isEmail(email)) {
    fields.email = 'Enter a valid email address.';
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    fields.sampleQuantity = 'Choose a sample quantity between 1 and 20.';
  }

  if (Object.keys(fields).length > 0) {
    throw new ApiError(400, 'validation_failed', 'Check the highlighted fields.', fields);
  }

  const sampleFinish = normalizeLine(payload.sampleFinish || payload.finish, 160);
  const projectName = normalizeLine(payload.projectName || payload.project_name, 160);
  const message = normalizeText(payload.message, 4000);

  return {
    name,
    email,
    phone: nullable(normalizeLine(payload.phone, 60)),
    company: nullable(normalizeLine(payload.company, 160)),
    shippingAddress,
    projectName: nullable(projectName),
    message: nullable(message),
    sampleStone,
    sampleFinish: nullable(sampleFinish),
    sampleQuantity: quantity,
    sourceRoute: getSourceRoute(payload),
    turnstileToken: getTurnstileToken(payload),
  };
}

async function verifyTurnstile(request, env, token) {
  const secret = env.TURNSTILE_SECRET_KEY || env.CF_TURNSTILE_SECRET_KEY;

  if (!secret) {
    return null;
  }

  if (!token) {
    throw new ApiError(403, 'turnstile_required', 'Complete the verification challenge.');
  }

  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);

  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) {
    form.set('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new ApiError(403, 'turnstile_failed', 'Verification failed. Try again.');
  }

  const result = await response.json();
  if (!result.success) {
    throw new ApiError(403, 'turnstile_failed', 'Verification failed. Try again.');
  }

  return true;
}

function getSupabaseConfig(env) {
  const url = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) {
    throw new ApiError(
      500,
      'server_not_configured',
      'The submission endpoint is not configured yet. Please contact Urblo directly.',
    );
  }

  return { url, serviceKey };
}

async function supabaseRequest(env, path, init) {
  const { url, serviceKey } = getSupabaseConfig(env);
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      502,
      'database_write_failed',
      'The request could not be stored. Please contact Urblo directly.',
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function insertSupabaseRow(env, tableName, row) {
  const result = await supabaseRequest(env, `/rest/v1/${tableName}?select=id`, {
    method: 'POST',
    headers: {
      prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });

  const inserted = Array.isArray(result) ? result[0] : result;
  if (!inserted || typeof inserted.id === 'undefined') {
    throw new ApiError(
      502,
      'database_write_failed',
      'The request could not be stored. Please contact Urblo directly.',
    );
  }

  return inserted;
}

async function updateSupabaseRow(env, tableName, id, values) {
  await supabaseRequest(env, `/rest/v1/${tableName}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      prefer: 'return=minimal',
    },
    body: JSON.stringify(values),
  });
}

function leadSummary(type, id, payload) {
  const rows = [
    `${type} #${id}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.company ? `Company: ${payload.company}` : null,
    payload.projectType ? `Type: ${payload.projectType}` : null,
    payload.projectName ? `Project: ${payload.projectName}` : null,
    payload.shippingAddress ? `Shipping address: ${payload.shippingAddress}` : null,
    payload.sampleStone ? `Sample stone: ${payload.sampleStone}` : null,
    payload.sampleFinish ? `Sample finish: ${payload.sampleFinish}` : null,
    payload.sampleQuantity ? `Sample quantity: ${payload.sampleQuantity}` : null,
    `Source: ${payload.sourceRoute}`,
    '',
    payload.message || '',
  ];

  return rows.filter(Boolean).join('\n');
}

async function sendLeadNotification(env, type, id, payload) {
  const config = getNotificationConfig(env, type);

  if (!config) {
    return 'not_required';
  }

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        subject: `New Urblo ${type} #${id}`,
        text: leadSummary(type, id, payload),
      }),
    });
  } catch {
    return 'failed';
  }

  return response.ok ? 'sent' : 'failed';
}

async function updateNotificationStatus(env, tableName, id, notificationStatus, initialStatus) {
  if (notificationStatus === initialStatus) return;

  try {
    await updateSupabaseRow(env, tableName, id, {
      notification_status: notificationStatus,
    });
  } catch {
    // The lead is already stored. Do not fail the visitor response because a status patch failed.
  }
}

function sampleItemNotes(payload) {
  return [
    `Stone/sample preference: ${payload.sampleStone}`,
    payload.sampleFinish ? `Finish preference: ${payload.sampleFinish}` : null,
    payload.projectName ? `Project: ${payload.projectName}` : null,
    payload.message ? `Notes: ${payload.message}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

async function handleWithErrors(callback) {
  try {
    return await callback();
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleEnquiryRequest(request, env) {
  return handleWithErrors(async () => {
    const payload = validateEnquiryPayload(await readPayload(request));
    const turnstileSuccess = await verifyTurnstile(request, env, payload.turnstileToken);
    const notificationStatus = getNotificationConfig(env, 'enquiry') ? 'pending' : 'not_required';

    const inserted = await insertSupabaseRow(env, 'enquiries', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      project_type: payload.projectType,
      message: payload.message,
      source_route: payload.sourceRoute,
      turnstile_success: turnstileSuccess,
      notification_status: notificationStatus,
    });

    const finalNotificationStatus = await sendLeadNotification(
      env,
      'enquiry',
      inserted.id,
      payload,
    );

    await updateNotificationStatus(
      env,
      'enquiries',
      inserted.id,
      finalNotificationStatus,
      notificationStatus,
    );

    return jsonResponse(
      {
        ok: true,
        id: inserted.id,
        notificationStatus: finalNotificationStatus,
      },
      201,
    );
  });
}

export async function handleSampleRequest(request, env) {
  return handleWithErrors(async () => {
    const payload = validateSampleRequestPayload(await readPayload(request));
    const turnstileSuccess = await verifyTurnstile(request, env, payload.turnstileToken);
    const notificationStatus = getNotificationConfig(env, 'sample request')
      ? 'pending'
      : 'not_required';

    const inserted = await insertSupabaseRow(env, 'sample_requests', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      shipping_address: payload.shippingAddress,
      project_name: payload.projectName,
      message: payload.message,
      source_route: payload.sourceRoute,
      turnstile_success: turnstileSuccess,
      notification_status: notificationStatus,
    });

    const item = await insertSupabaseRow(env, 'sample_request_items', {
      sample_request_id: inserted.id,
      quantity: payload.sampleQuantity,
      notes: sampleItemNotes(payload),
    });

    const finalNotificationStatus = await sendLeadNotification(
      env,
      'sample request',
      inserted.id,
      payload,
    );

    await updateNotificationStatus(
      env,
      'sample_requests',
      inserted.id,
      finalNotificationStatus,
      notificationStatus,
    );

    return jsonResponse(
      {
        ok: true,
        id: inserted.id,
        itemId: item.id,
        notificationStatus: finalNotificationStatus,
      },
      201,
    );
  });
}
