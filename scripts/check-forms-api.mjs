import assert from 'node:assert/strict';
import fs from 'node:fs';
import { onRequest as onEnquiryRequest } from '../functions/api/enquiries.js';
import { onRequest as onSampleRequest } from '../functions/api/sample-requests.js';
import { handleEnquiryRequest, handleSampleRequest } from '../functions/_lib/forms.js';

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
};

const sampleRequestAtomicMigration = fs.readFileSync(
  'supabase/migrations/202605290003_sample_request_atomic_insert.sql',
  'utf8',
);

for (const requiredText of [
  'function public.submit_sample_request_with_item',
  'security invoker',
  'grant execute on function public.submit_sample_request_with_item(jsonb, jsonb) to service_role',
  'revoke execute on function public.submit_sample_request_with_item(jsonb, jsonb) from anon',
  'revoke execute on function public.submit_sample_request_with_item(jsonb, jsonb) from authenticated',
]) {
  assert.ok(
    sampleRequestAtomicMigration.toLowerCase().includes(requiredText.toLowerCase()),
    `Expected sample request atomic migration to contain: ${requiredText}`,
  );
}

function jsonRequest(path, body) {
  return new Request(`https://urblo.test${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function methodRequest(path, method, body = undefined) {
  return new Request(`https://urblo.test${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function malformedJsonRequest(path) {
  return new Request(`https://urblo.test${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: '{',
  });
}

async function readJson(response) {
  return response.json();
}

async function withFetchMock(handler, options = {}) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const auditStatus = options.auditStatus ?? 201;
  const resendStatus = options.resendStatus ?? 202;

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });

    if (url.includes('/rest/v1/enquiries')) {
      return Response.json([{ id: 101 }], { status: 201 });
    }

    if (url.includes('/rest/v1/rpc/submit_sample_request_with_item')) {
      return Response.json([{ sample_request_id: 202, sample_request_item_id: 303 }], {
        status: 200,
      });
    }

    if (url.includes('/rest/v1/sample_requests?id=eq.202')) {
      return new Response(null, { status: 204 });
    }

    if (url.includes('/rest/v1/sample_request_items')) {
      throw new Error('Sample request items should be inserted through submit_sample_request_with_item RPC.');
    }

    if (url.includes('/rest/v1/sample_requests?select=id')) {
      throw new Error('Sample requests should be inserted through submit_sample_request_with_item RPC.');
    }

    if (url.includes('/rest/v1/admin_audit_events')) {
      if (auditStatus >= 400) {
        return Response.json({ message: 'audit failed' }, { status: auditStatus });
      }

      return new Response(null, { status: auditStatus });
    }

    if (url.includes('api.resend.com/emails')) {
      if (resendStatus >= 400) {
        return Response.json({ message: 'email failed' }, { status: resendStatus });
      }

      return Response.json({ id: 'email-test-id' }, { status: resendStatus });
    }

    if (url.includes('/turnstile/v0/siteverify')) {
      return Response.json({ success: false }, { status: 200 });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    await handler(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

await withFetchMock(async (calls) => {
  for (const [path, onRequest] of [
    ['/api/enquiries', onEnquiryRequest],
    ['/api/sample-requests', onSampleRequest],
  ]) {
    const response = await onRequest({
      request: methodRequest(path, 'GET'),
      env,
    });
    const body = await readJson(response);

    assert.equal(response.status, 405);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'method_not_allowed');
  }
  assert.equal(calls.length, 0);
});

await withFetchMock(async (calls) => {
  for (const [path, onRequest] of [
    ['/api/enquiries', onEnquiryRequest],
    ['/api/sample-requests', onSampleRequest],
  ]) {
    const response = await onRequest({
      request: methodRequest(path, 'OPTIONS'),
      env,
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get('allow'), 'POST, OPTIONS');
    assert.match(response.headers.get('access-control-allow-methods') ?? '', /POST/);
    assert.match(response.headers.get('access-control-allow-headers') ?? '', /content-type/);
  }
  assert.equal(calls.length, 0);
});

await withFetchMock(async (calls) => {
  const response = await handleEnquiryRequest(jsonRequest('/api/enquiries', {}), env);
  const body = await readJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'validation_failed');
  assert.equal(calls.length, 0);
});

await withFetchMock(async (calls) => {
  const response = await onSampleRequest({
    request: methodRequest('/api/sample-requests', 'POST', {
      name: 'No',
      email: 'bad-sample',
      shippingAddress: 'x',
      sampleStone: '',
    }),
    env,
  });
  const body = await readJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'validation_failed');
  assert.equal(calls.length, 0);
});

await withFetchMock(async (calls) => {
  for (const [path, onRequest] of [
    ['/api/enquiries', onEnquiryRequest],
    ['/api/sample-requests', onSampleRequest],
  ]) {
    const response = await onRequest({
      request: malformedJsonRequest(path),
      env,
    });
    const body = await readJson(response);

    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'invalid_json');
  }
  assert.equal(calls.length, 0);
});

await withFetchMock(async (calls) => {
  const response = await handleEnquiryRequest(
    jsonRequest('/api/enquiries', {
      name: 'Alex Designer',
      email: 'alex@example.com',
      company: 'Studio Example',
      projectType: 'Project enquiry',
      message: 'We are reviewing stone seating for a civic streetscape project.',
      sourceRoute: '/contact',
    }),
    env,
  );
  const body = await readJson(response);

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.id, 101);
  assert.equal(body.notificationStatus, 'not_required');
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/rest\/v1\/enquiries\?select=id$/);
  assert.equal(JSON.parse(calls[0].init.body).email, 'alex@example.com');
  assert.match(calls[1].url, /\/rest\/v1\/admin_audit_events$/);
  const enquiryAuditBody = JSON.parse(calls[1].init.body);
  assert.equal(enquiryAuditBody.action, 'enquiry.create');
  assert.equal(enquiryAuditBody.entity_type, 'enquiries');
  assert.equal(enquiryAuditBody.entity_id, 101);
  assert.equal(enquiryAuditBody.metadata.sourceRoute, '/contact');
});

await withFetchMock(async (calls) => {
  const response = await handleSampleRequest(
    jsonRequest('/api/sample-requests', {
      name: 'Mia Contractor',
      email: 'mia@example.com',
      company: 'Builder Example',
      shippingAddress: '5 Hamilton St, Oakleigh VIC 3166',
      sampleStone: 'Angola Black',
      sampleFinish: 'Honed',
      sampleQuantity: '2',
      message: 'Please send samples for early finish review.',
      sourceRoute: '/contact?intent=sample-request',
    }),
    env,
  );
  const body = await readJson(response);

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.id, 202);
  assert.equal(body.itemId, 303);
  assert.equal(body.notificationStatus, 'not_required');
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/rest\/v1\/rpc\/submit_sample_request_with_item$/);
  const sampleRpcBody = JSON.parse(calls[0].init.body);
  assert.equal(sampleRpcBody.p_request.email, 'mia@example.com');
  assert.equal(sampleRpcBody.p_request.source_route, '/contact?intent=sample-request');
  assert.equal(sampleRpcBody.p_request.notification_status, 'not_required');
  assert.equal(sampleRpcBody.p_item.quantity, 2);
  assert.match(sampleRpcBody.p_item.notes, /Angola Black/);
  assert.match(calls[1].url, /\/rest\/v1\/admin_audit_events$/);
  const sampleAuditBody = JSON.parse(calls[1].init.body);
  assert.equal(sampleAuditBody.action, 'sample_request.create');
  assert.equal(sampleAuditBody.entity_type, 'sample_requests');
  assert.equal(sampleAuditBody.entity_id, 202);
  assert.equal(sampleAuditBody.metadata.sourceRoute, '/contact?intent=sample-request');
  assert.equal(sampleAuditBody.metadata.itemId, 303);
  assert.equal(sampleAuditBody.metadata.quantity, 2);
});

await withFetchMock(async (calls) => {
  const response = await handleEnquiryRequest(
    jsonRequest('/api/enquiries', {
      name: 'Notify Success',
      email: 'notify@example.com',
      message: 'This should send a mocked Resend notification and mark the enquiry sent.',
      sourceRoute: '/contact',
    }),
    {
      ...env,
      ENQUIRY_NOTIFICATION_TO: 'leads@example.com',
      LEAD_NOTIFICATION_FROM: 'Urblo <leads@example.com>',
      RESEND_API_KEY: 'test-resend-key',
    },
  );
  const body = await readJson(response);

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.notificationStatus, 'sent');
  assert.equal(calls.length, 4);
  assert.match(calls[0].url, /\/rest\/v1\/enquiries\?select=id$/);
  assert.equal(JSON.parse(calls[0].init.body).notification_status, 'pending');
  assert.match(calls[1].url, /\/rest\/v1\/admin_audit_events$/);
  assert.match(calls[2].url, /api\.resend\.com\/emails$/);
  assert.equal(JSON.parse(calls[2].init.body).to[0], 'leads@example.com');
  assert.match(calls[3].url, /\/rest\/v1\/enquiries\?id=eq\.101$/);
  assert.equal(calls[3].init.method, 'PATCH');
  assert.equal(JSON.parse(calls[3].init.body).notification_status, 'sent');
});

await withFetchMock(async (calls) => {
  const response = await handleSampleRequest(
    jsonRequest('/api/sample-requests', {
      name: 'Notify Failure',
      email: 'notify-failure@example.com',
      shippingAddress: '11 Test Lane, Melbourne VIC 3000',
      sampleStone: 'Zen Grey',
      sampleQuantity: '1',
      sourceRoute: '/contact?intent=sample-request',
    }),
    {
      ...env,
      LEAD_NOTIFICATION_FROM: 'Urblo <leads@example.com>',
      RESEND_API_KEY: 'test-resend-key',
      SAMPLE_REQUEST_NOTIFICATION_TO: 'samples@example.com',
    },
  );
  const body = await readJson(response);

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.notificationStatus, 'failed');
  assert.equal(calls.length, 4);
  assert.match(calls[0].url, /\/rest\/v1\/rpc\/submit_sample_request_with_item$/);
  assert.equal(JSON.parse(calls[0].init.body).p_request.notification_status, 'pending');
  assert.match(calls[1].url, /\/rest\/v1\/admin_audit_events$/);
  assert.match(calls[2].url, /api\.resend\.com\/emails$/);
  assert.equal(JSON.parse(calls[2].init.body).to[0], 'samples@example.com');
  assert.match(calls[3].url, /\/rest\/v1\/sample_requests\?id=eq\.202$/);
  assert.equal(calls[3].init.method, 'PATCH');
  assert.equal(JSON.parse(calls[3].init.body).notification_status, 'failed');
}, { resendStatus: 500 });

await withFetchMock(async (calls) => {
  const response = await handleEnquiryRequest(
    jsonRequest('/api/enquiries', {
      name: 'Audit Resilient',
      email: 'audit@example.com',
      message: 'The visitor response should still succeed when audit logging fails.',
      sourceRoute: '/contact',
    }),
    env,
  );
  const body = await readJson(response);

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.id, 101);
  assert.equal(calls.length, 2);
  assert.match(calls[1].url, /\/rest\/v1\/admin_audit_events$/);
}, { auditStatus: 500 });

await withFetchMock(async (calls) => {
  const response = await handleEnquiryRequest(
    jsonRequest('/api/enquiries', {
      name: 'No Service Role',
      email: 'missing-service-role@example.com',
      message: 'This should fail closed before any Supabase call without server credentials.',
      sourceRoute: '/contact',
    }),
    {},
  );
  const body = await readJson(response);

  assert.equal(response.status, 500);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'server_not_configured');
  assert.equal(calls.length, 0);
});

await withFetchMock(async (calls) => {
  const response = await handleEnquiryRequest(
    jsonRequest('/api/enquiries', {
      name: 'Sam Reviewer',
      email: 'sam@example.com',
      message: 'This should be rejected when Turnstile fails.',
      turnstileToken: 'bad-token',
    }),
    {
      ...env,
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    },
  );
  const body = await readJson(response);

  assert.equal(response.status, 403);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'turnstile_failed');
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /turnstile\/v0\/siteverify$/);
});

console.log('Forms API checks passed.');
