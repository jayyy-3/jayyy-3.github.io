import assert from 'node:assert/strict';
import { handleEnquiryRequest, handleSampleRequest } from '../functions/_lib/forms.js';

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
};

function jsonRequest(path, body) {
  return new Request(`https://urblo.test${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function readJson(response) {
  return response.json();
}

async function withFetchMock(handler) {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });

    if (url.includes('/rest/v1/enquiries')) {
      return Response.json([{ id: 101 }], { status: 201 });
    }

    if (url.includes('/rest/v1/sample_requests')) {
      return Response.json([{ id: 202 }], { status: 201 });
    }

    if (url.includes('/rest/v1/sample_request_items')) {
      return Response.json([{ id: 303 }], { status: 201 });
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
  const response = await handleEnquiryRequest(jsonRequest('/api/enquiries', {}), env);
  const body = await readJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'validation_failed');
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
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/rest\/v1\/enquiries\?select=id$/);
  assert.equal(JSON.parse(calls[0].init.body).email, 'alex@example.com');
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
  assert.match(calls[0].url, /\/rest\/v1\/sample_requests\?select=id$/);
  assert.match(calls[1].url, /\/rest\/v1\/sample_request_items\?select=id$/);
  assert.equal(JSON.parse(calls[1].init.body).sample_request_id, 202);
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
