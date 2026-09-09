import assert from 'node:assert/strict'
import { handleAdminImageQrRequest } from '../functions/_lib/admin-image-qr.js'
import { handleAdminProjectsRequest } from '../functions/_lib/admin-projects.js'
import { readServiceConfig } from '../functions/_lib/admin-runtime.js'

if (typeof globalThis.WebSocket === 'undefined') globalThis.WebSocket = class {
  constructor() { throw new Error('Identity tests do not permit realtime connections') }
}
const originalFetch = globalThis.fetch
const env = { SUPABASE_URL: 'https://local-identity.example.test/', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service-key' }
const modules = [
  ['Image QR', handleAdminImageQrRequest, 'Image QR is not configured on this deployment.', 'Active Image QR access is required.'],
  ['Projects', handleAdminProjectsRequest, 'The Projects workspace is not configured on this deployment.', 'Active Projects access is required.'],
]
let scenario, requests
function request(token = 'synthetic-session') {
  return new Request('https://app.example.test/api/admin/module', {
    method: 'POST', headers: token === null ? {} : { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: '{}',
  })
}
async function expectError(handler, code, status, config = env, token = 'synthetic-session') {
  const response = await handler(request(token), config)
  assert.equal(response.status, status)
  const body = await response.json(); assert.equal(body.error, code)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  return body
}
try {
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url)
    assert.equal(url.origin, 'https://local-identity.example.test')
    requests.push(url.pathname)
    if (url.pathname === '/auth/v1/user') {
      assert.equal(new Headers(init?.headers ?? input.headers).get('authorization'), 'Bearer synthetic-session')
      return scenario === 'invalid' ? Response.json({ message: 'Invalid session' }, { status: 401 }) : Response.json({ id: 'synthetic-user' })
    }
    assert.equal(url.pathname, '/rest/v1/admin_profiles', 'Identity denial must precede all content access')
    assert.equal(url.searchParams.get('user_id'), 'eq.synthetic-user')
    assert.equal(url.searchParams.get('is_active'), 'eq.true')
    assert.equal(url.searchParams.get('select'), 'user_id,role,is_active')
    if (scenario === 'profile-error') return Response.json({ message: 'Synthetic profile failure' }, { status: 500 })
    if (scenario === 'missing') return Response.json([])
    return Response.json({ user_id: 'synthetic-user', role: scenario, is_active: true })
  }
  assert.deepEqual(readServiceConfig({ SUPABASE_URL: env.SUPABASE_URL, SUPABASE_SERVICE_KEY: 'legacy-key' }), { url: 'https://local-identity.example.test', serviceKey: 'legacy-key' })
  for (const [label, handler, missingConfigMessage, deniedMessage] of modules) {
    requests = []; scenario = 'owner'
    await expectError(handler, 'missing_session', 401, {}, null)
    assert.deepEqual(requests, [])
    const configError = await expectError(handler, 'server_not_configured', 500, {})
    assert.equal(configError.message, missingConfigMessage); assert.deepEqual(requests, [])
    scenario = 'invalid'; requests = []
    await expectError(handler, 'invalid_session', 401)
    assert.deepEqual(requests, ['/auth/v1/user'])
    for (scenario of ['missing', 'profile-error', 'unknown-role']) {
      requests = []
      const denied = await expectError(handler, 'not_allowed', 403)
      assert.equal(denied.message, deniedMessage)
      assert.deepEqual(requests, ['/auth/v1/user', '/rest/v1/admin_profiles'])
    }
    scenario = 'viewer'; requests = []
    await expectError(handler, 'read_only', 403)
    assert.deepEqual(requests, ['/auth/v1/user', '/rest/v1/admin_profiles'])
    for (scenario of ['owner', 'admin', 'editor']) {
      requests = []
      const response = await handler(request(), env)
      assert.equal(response.status, 400, `${label} ${scenario} reaches body validation`)
      assert.deepEqual(requests, ['/auth/v1/user', '/rest/v1/admin_profiles'])
    }
    console.log(`PASS ${label}: missing config/session, invalid identity, inactive/missing profile, backend error, unknown role, viewer denial and editor/admin/owner admission`)
  }
} finally { globalThis.fetch = originalFetch }
