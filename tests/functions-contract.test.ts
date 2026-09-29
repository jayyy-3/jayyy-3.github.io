// Pages Functions contract snapshot: status, headers, body and the exact upstream calls of
// every route for its method, configuration, identity and role cases. The snapshot was
// recorded before the shared-runtime refactor (NOW-OPT-DB-TYPES-FUNCTIONS-RUNTIME-001) and
// must stay unchanged by it. Supabase is replaced by an in-memory HTTP double; unauthenticated
// cases must record zero upstream requests.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { onRequest as enquiries } from '../functions/api/enquiries.js'
import { onRequest as sampleRequests } from '../functions/api/sample-requests.js'
import { onRequest as adminProjects } from '../functions/api/admin/projects.js'
import { onRequest as adminImageQr } from '../functions/api/admin/image-qr.js'
import { onRequest as adminStones } from '../functions/api/admin/stone-library.js'
import { onRequest as adminInvite } from '../functions/api/admin/invite-user.js'
import { onRequest as publicImageQrData } from '../functions/api/image-qr/[slug].js'
import { onRequest as publicImageQrPage } from '../functions/image/[slug].js'

type Handler = (context: {
  request: Request
  env: Record<string, unknown>
  params: Record<string, string>
  next: () => Promise<Response>
}) => Promise<Response> | Response

const ORIGIN = 'https://functions-contract.example.test'
const CONFIGURED = { SUPABASE_URL: ORIGIN, SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service-key' }
const USER_ID = '00000000-0000-4000-8000-0000000000c1'
const originalFetch = globalThis.fetch

type Identity = 'invalid' | 'missing' | 'profile-error' | 'owner' | 'admin' | 'editor' | 'viewer' | 'unknown-role'
let identity: Identity = 'owner'
let requests: string[] = []

beforeEach(() => {
  requests = []
  vi.spyOn(console, 'error').mockImplementation(() => {})
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    if (url.origin !== ORIGIN) throw new Error(`Unexpected upstream origin ${url.origin}`)
    requests.push(`${method} ${url.pathname}`)
    if (url.pathname === '/auth/v1/user') {
      return identity === 'invalid'
        ? Response.json({ message: 'Invalid session' }, { status: 401 })
        : Response.json({ id: USER_ID, aud: 'authenticated', email: 'actor@example.test' })
    }
    if (url.pathname === '/rest/v1/admin_profiles' && method === 'GET' && url.searchParams.get('user_id')) {
      if (identity === 'profile-error') return Response.json({ message: 'Synthetic profile failure' }, { status: 500 })
      if (identity === 'missing') return Response.json([])
      return Response.json({ user_id: USER_ID, email: 'actor@example.test', role: identity, is_active: true })
    }
    if (url.pathname === '/rest/v1/admin_profiles' && method === 'GET') {
      return Response.json([{ user_id: 'existing', email: 'taken@example.test', is_active: true }])
    }
    if (url.pathname === '/rest/v1/image_qr_resources' && method === 'GET') return Response.json([])
    return Response.json({ message: 'Synthetic upstream failure', code: 'XX000' }, { status: 500 })
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

async function call(
  handler: Handler,
  path: string,
  { method = 'GET', token = null as string | null, authorization = null as string | null, body = undefined as unknown, env = CONFIGURED as Record<string, unknown>, params = {} as Record<string, string> } = {},
) {
  const headers: Record<string, string> = {}
  if (token) headers.authorization = `Bearer ${token}`
  if (authorization) headers.authorization = authorization
  if (body !== undefined) headers['content-type'] = 'application/json'
  const request = new Request(`https://app.example.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })
  requests = []
  const response = await handler({
    request,
    env: { ...env, ASSETS: { fetch: async () => new Response('<html><head></head></html>', { headers: { 'content-type': 'text/html' } }) } },
    params,
    next: async () => new Response('next'),
  })
  const text = method === 'HEAD' ? '' : await response.text()
  let parsed: unknown = text
  try { parsed = text ? JSON.parse(text) : null } catch { /* HTML or empty bodies stay text */ }
  return {
    status: response.status,
    headers: Object.fromEntries([...response.headers.entries()].sort(([a], [b]) => a.localeCompare(b))),
    body: parsed,
    upstream: requests,
  }
}

const protectedRoutes: Array<[string, Handler, string]> = [
  ['projects', adminProjects as Handler, '/api/admin/projects'],
  ['image-qr', adminImageQr as Handler, '/api/admin/image-qr'],
  ['stone-library', adminStones as Handler, '/api/admin/stone-library'],
  ['invite-user', adminInvite as Handler, '/api/admin/invite-user'],
]

describe('protected admin Functions', () => {
  for (const [name, handler, path] of protectedRoutes) {
    test(`${name}: method, configuration and session gates make zero upstream calls`, async () => {
      const cases = {
        options: await call(handler, path, { method: 'OPTIONS' }),
        put: await call(handler, path, { method: 'PUT', token: 'synthetic-session' }),
        getWithoutSession: await call(handler, path),
        postWithoutSession: await call(handler, path, { method: 'POST', body: {} }),
        malformedAuthorization: await call(handler, path, { method: 'POST', body: {}, authorization: 'Basic synthetic' }),
        emptyBearer: await call(handler, path, { method: 'POST', body: {}, authorization: 'Bearer ' }),
        postWithoutSessionUnconfigured: await call(handler, path, { method: 'POST', body: {}, env: {} }),
        postWithSessionUnconfigured: await call(handler, path, { method: 'POST', body: {}, token: 'synthetic-session', env: {} }),
      }
      for (const [label, result] of Object.entries(cases)) {
        expect(result.upstream, `${name} ${label} must not reach Supabase`).toEqual([])
      }
      expect(cases.getWithoutSession.status === 405 || cases.getWithoutSession.status === 401).toBe(true)
      expect(cases.postWithoutSession.status === 401 || cases.postWithoutSession.status === 500).toBe(true)
      expect(cases).toMatchSnapshot()
    })

    test(`${name}: identity and role contracts`, async () => {
      const results: Record<string, unknown> = {}
      for (const scenario of ['invalid', 'missing', 'profile-error', 'unknown-role', 'viewer', 'editor', 'admin', 'owner'] as Identity[]) {
        identity = scenario
        results[`${scenario} POST {}`] = await call(handler, path, { method: 'POST', token: 'synthetic-session', body: {} })
        results[`${scenario} POST malformed`] = await call(handler, path, { method: 'POST', token: 'synthetic-session', body: '{' })
        if (name !== 'invite-user') results[`${scenario} GET`] = await call(handler, path, { token: 'synthetic-session' })
      }
      expect(results).toMatchSnapshot()
    })
  }

  test('invite-user: role, duplicate and upstream contracts', async () => {
    const results: Record<string, unknown> = {}
    for (const scenario of ['editor', 'admin', 'owner'] as Identity[]) {
      identity = scenario
      for (const role of ['viewer', 'editor', 'admin', 'owner', 'superuser']) {
        results[`${scenario} invites ${role}`] = await call(adminInvite as Handler, '/api/admin/invite-user', {
          method: 'POST', token: 'synthetic-session', body: { email: 'new.person@example.test', displayName: 'New Person', role },
        })
      }
      results[`${scenario} invites existing`] = await call(adminInvite as Handler, '/api/admin/invite-user', {
        method: 'POST', token: 'synthetic-session', body: { email: ' Taken@Example.test ', role: 'editor' },
      })
      results[`${scenario} invalid email`] = await call(adminInvite as Handler, '/api/admin/invite-user', {
        method: 'POST', token: 'synthetic-session', body: { email: 'not-an-email', role: 'editor' },
      })
    }
    expect(results).toMatchSnapshot()
  })

  test('stone-library: viewer read paths and editor write gate', async () => {
    const results: Record<string, unknown> = {}
    for (const scenario of ['viewer', 'editor'] as Identity[]) {
      identity = scenario
      for (const query of ['?view=media', '?view=media&ids=1,2', '?view=media&ids=0', '?view=finishes', '?stoneId=abc', '?stoneId=4&view=usage']) {
        results[`${scenario} GET ${query}`] = await call(adminStones as Handler, `/api/admin/stone-library${query}`, { token: 'synthetic-session' })
      }
      results[`${scenario} POST save`] = await call(adminStones as Handler, '/api/admin/stone-library', {
        method: 'POST', token: 'synthetic-session', body: { action: 'save', stoneId: null, draft: null },
      })
    }
    expect(results).toMatchSnapshot()
  })
})

describe('public form Functions', () => {
  for (const [name, handler, path] of [
    ['enquiries', enquiries, '/api/enquiries'],
    ['sample-requests', sampleRequests, '/api/sample-requests'],
  ] as Array<[string, Handler, string]>) {
    test(`${name}: method, validation and configuration contracts`, async () => {
      const valid = name === 'enquiries'
        ? { name: 'Contract Test', email: 'contract@example.com', message: 'Synthetic contract message for the enquiry form.', sourceRoute: '/contact' }
        : { name: 'Contract Test', email: 'contract@example.com', shippingAddress: '5 Hamilton St, Oakleigh VIC 3166', sampleStone: 'Angola Black', sampleFinish: 'Honed', sampleQuantity: '2', message: 'Synthetic contract sample request.', sourceRoute: '/contact?intent=sample-request' }
      const results = {
        options: await call(handler, path, { method: 'OPTIONS' }),
        get: await call(handler, path),
        malformed: await call(handler, path, { method: 'POST', body: '{' }),
        empty: await call(handler, path, { method: 'POST', body: {} }),
        validUnconfigured: await call(handler, path, { method: 'POST', body: valid, env: {} }),
        validUpstreamFailure: await call(handler, path, { method: 'POST', body: valid }),
      }
      expect(results.options.upstream).toEqual([])
      expect(results.validUnconfigured.upstream).toEqual([])
      expect(results.validUnconfigured.status).toBe(500)
      expect(results).toMatchSnapshot()
    })
  }
})

describe('public Image QR Functions', () => {
  test('data and page resolvers: methods, unknown slug, configuration', async () => {
    const results = {
      dataPost: await call(publicImageQrData as Handler, '/api/image-qr/missing-slug', { method: 'POST', params: { slug: 'missing-slug' } }),
      dataUnknown: await call(publicImageQrData as Handler, '/api/image-qr/missing-slug', { params: { slug: 'missing-slug' } }),
      dataHead: await call(publicImageQrData as Handler, '/api/image-qr/missing-slug', { method: 'HEAD', params: { slug: 'missing-slug' } }),
      dataEmptySlug: await call(publicImageQrData as Handler, '/api/image-qr/---', { params: { slug: '---' } }),
      dataUnconfigured: await call(publicImageQrData as Handler, '/api/image-qr/missing-slug', { params: { slug: 'missing-slug' }, env: {} }),
      pagePost: await call(publicImageQrPage as Handler, '/image/missing-slug', { method: 'POST', params: { slug: 'missing-slug' } }),
      pageUnknown: await call(publicImageQrPage as Handler, '/image/missing-slug', { params: { slug: 'missing-slug' } }),
      pageUnconfigured: await call(publicImageQrPage as Handler, '/image/missing-slug', { params: { slug: 'missing-slug' }, env: {} }),
    }
    expect(results.dataUnconfigured.upstream).toEqual([])
    expect(results).toMatchSnapshot()
  })
})
