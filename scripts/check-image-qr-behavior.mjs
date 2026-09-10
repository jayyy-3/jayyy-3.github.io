import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { handleAdminImageQrRequest, handlePublicImageQrRequest, handlePublicImageQrDataRequest } from '../functions/_lib/admin-image-qr.js';
import { onRequest as publicEndpoint } from '../functions/api/image-qr/[slug].js';
import { defaultQrMaterialForName, staticQrMaterialOptions, validateQrMaterialShape, listQrMaterialOptions } from '../functions/_lib/image-qr-materials.js';

export async function checkQrBehavior() {
  const originalFetch = globalThis.fetch;
  const originalWebSocket = globalThis.WebSocket;
  // Supabase constructs its unused realtime client even for REST-only calls.
  // Node 20 needs a constructor; opening any socket is forbidden in this test.
  if (!originalWebSocket) globalThis.WebSocket = class TestOnlyWebSocket {
    constructor() { throw new Error('QR behavior tests must never open WebSockets'); }
  };
  const id = '11111111-1111-4111-8111-111111111111';
  const userId = '22222222-2222-4222-8222-222222222222';
  const fixture = {
    id, slug: 'zen-grey-honed-example', name: 'Zen Grey · Honed', status: 'active',
    object_path: 'image-qr/zen-grey-honed-example/original.webp', width_px: 2560, height_px: 1707,
    size_bytes: 12345, mime_type: 'image/webp', updated_at: '2026-09-09T00:00:00.000Z', created_at: '2026-08-18T00:00:00.000Z',
    created_by: userId, updated_by: userId, material_selection: null,
  };
  let row = structuredClone(fixture);
  let role = 'owner';
  const audits = [];
  let writes = 0;
  const env = { SUPABASE_URL: 'https://qr-fixture.test', SUPABASE_SERVICE_ROLE_KEY: 'test-only-not-a-real-key', ASSETS: {
    fetch: async (request) => { assert.equal(new URL(request.url).pathname, '/'); return new Response('<!doctype html><html><head><title>Urblo</title></head><body><div id="root"></div></body></html>', { headers: { 'content-type': 'text/html' } }); },
  } };
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    assert.equal(url.hostname, 'qr-fixture.test', 'Tests must never make live network requests');
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
    if (url.pathname === '/auth/v1/user') return json({ id: userId, email: 'qr@example.test', aud: 'authenticated' });
    if (url.pathname === '/rest/v1/admin_profiles') return json([{ user_id: userId, role, is_active: true }]);
    if (url.pathname === '/rest/v1/rpc/public_stone_catalogue') return json({stones:[],managedKeys:[],finishes:[]});
    if (url.pathname === '/rest/v1/admin_audit_events') { writes++; audits.push(await request.json()); return json(null, 201); }
    if (url.pathname === '/rest/v1/image_qr_resources') {
      if (url.searchParams.has('slug') && url.searchParams.get('slug') !== `eq.${row.slug}`) return json([]);
      if (url.searchParams.has('status') && url.searchParams.get('status') !== `eq.${row.status}`) return json([]);
      if (url.searchParams.has('updated_at') && url.searchParams.get('updated_at') !== `eq.${row.updated_at}`) return json([]);
      if (request.method === 'PATCH') {
        writes++;
        row = { ...row, ...await request.json(), updated_at: `2026-09-09T00:00:${String(writes).padStart(2, '0')}.000Z` };
      }
      return json(request.headers.get('accept')?.includes('vnd.pgrst.object') ? row : [row]);
    }
    throw new Error(`Unexpected fixture request ${request.method} ${url.pathname}`);
  };
  const admin = (body) => handleAdminImageQrRequest(new Request('https://example.test/api/admin/image-qr', {
    method: 'POST', headers: { authorization: 'Bearer test-session', 'content-type': 'application/json' }, body: JSON.stringify(body),
  }), env);
  const publicRequest = () => new Request(`https://example.test/image/${row.slug}`);
  try {
    assert.deepEqual(defaultQrMaterialForName('Zen Grey · Honed'), { stoneGroupId: 'zen-grey', stoneVariantId: 'zen-grey', finishKey: 'honed' });
    assert.deepEqual(defaultQrMaterialForName('Unknown stone · Made up finish'), defaultQrMaterialForName('Zen Grey · Honed'));
    assert.equal(defaultQrMaterialForName('Steel Blue · Sawn').stoneGroupId, 'blueocean');
    assert.equal(defaultQrMaterialForName('Toscany · Cross Cut').stoneVariantId, 'tuscany--cross-cut');
    assert.equal(validateQrMaterialShape({ stoneGroupId: '../private', stoneVariantId: 'x', finishKey: 'honed' }), null);
    const sources = JSON.parse(readFileSync('data/clean/stone_finish_images.json', 'utf8'));
    for (const finishes of Object.values(sources)) for (const asset of Object.values(finishes)) {
      assert(existsSync(`data/Product/${asset.path}`), `Source image missing: ${asset.path}`);
      for (const secondary of asset.secondaryImages || []) assert(existsSync(`data/Product/${secondary.path}`));
    }
    const options = staticQrMaterialOptions();
    const defaultsSql = readFileSync('supabase/migrations/20260910064551_stone_library_workspace.sql', 'utf8').split('private.stone_qr_default')[1];
    const embeddedDefaults = defaultsSql.match(/jsonb_array_elements\('(.+)'::jsonb\)/)[1].replace(/''/g, "'");
    assert.deepEqual(JSON.parse(embeddedDefaults), options, 'Database QR default references must match the deployed name-resolution catalogue');
    assert(options.length > 10);
    assert(!options.some((option) => option.stoneGroupId === 'ivory-sand' && option.finishKey === 'sawn'));
    const hiddenOptions = await listQrMaterialOptions({rpc:async()=>({data:{stones:[],managedKeys:['zen-grey'],finishes:[]}})});
    assert(!hiddenOptions.some(option => option.stoneGroupId === 'zen-grey'), 'Managed hidden QR material cannot revive a static option');
    await assert.rejects(listQrMaterialOptions({rpc:async()=>({error:new Error('catalogue unavailable')})}));
    const first = await handlePublicImageQrRequest(publicRequest(), env, row.slug);
    assert.equal(first.status, 200);
    assert.match(first.headers.get('content-type'), /text\/html/);
    assert.equal(first.headers.get('location'), null, 'Existing QR must now render a webpage, not redirect to an image');
    assert.equal(first.headers.get('cache-control'), 'no-store');
    const html = await first.text();
    const embedded = JSON.parse(html.match(/id="image-qr-data">(.*?)<\/script>/s)[1]);
    assert.deepEqual(Object.keys(embedded).sort(), ['materialSelection', 'name', 'productImageUrl', 'slug']);
    assert(embedded.productImageUrl.includes(row.object_path));
    assert(!html.includes(userId), 'Public page must never expose actor IDs');
    assert.equal(writes, 0, 'Default resolution must never mutate existing resources');

    row.name = '</script><script>alert(1)</script>';
    const unsafeHtml = await (await handlePublicImageQrRequest(publicRequest(), env, row.slug)).text();
    assert(!unsafeHtml.includes(row.name), 'Embedded metadata must be HTML-safe');
    assert.equal(JSON.parse(unsafeHtml.match(/id="image-qr-data">(.*?)<\/script>/s)[1]).name, row.name);
    row.name = fixture.name;
    const head = await handlePublicImageQrRequest(new Request(publicRequest(), { method: 'HEAD' }), env, row.slug);
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
    const methods = await publicEndpoint({ request: new Request('https://example.test/api/image-qr/x', { method: 'POST' }), env, params: { slug: row.slug } });
    assert.equal(methods.status, 405);

    const selection = { stoneGroupId: 'zen-grey', stoneVariantId: 'zen-grey', finishKey: 'flamed' };
    role = 'viewer';
    assert.equal((await admin({ action: 'assign-material', id, selection, expectedUpdatedAt: row.updated_at })).status, 403);
    assert.equal(writes, 0);
    role = 'editor';
    assert.equal((await admin({ action: 'assign-material', id, selection: { ...selection, finishKey: 'invented' }, expectedUpdatedAt: row.updated_at })).status, 400);
    assert.equal((await admin({ action: 'assign-material', id, selection: { ...selection, stoneVariantId: 'tan-brown' }, expectedUpdatedAt: row.updated_at })).status, 400);
    assert.equal(writes, 0);
    assert.equal((await admin({ action: 'assign-material', id, selection, expectedUpdatedAt: '2020-01-01T00:00:00Z' })).status, 409);
    assert.equal(writes, 0, 'Stale saves must not change the selection');
    const saved = await admin({ action: 'assign-material', id, selection, expectedUpdatedAt: row.updated_at });
    assert.equal(saved.status, 200);
    const savedPayload = await saved.json();
    assert.equal(savedPayload.resource.materialIsDefault, false);
    assert.deepEqual(savedPayload.resource.materialSelection, selection);
    assert.equal(row.slug, fixture.slug); assert.equal(row.object_path, fixture.object_path); assert.equal(row.status, 'active');
    assert.equal(audits.at(-1).action, 'image_qr.assign_material');
    const readback = await (await handlePublicImageQrDataRequest(publicRequest(), env, row.slug)).json();
    assert.deepEqual(readback.resource.materialSelection, selection, 'Refresh must use the persisted selection');
    assert.equal((await admin({ action: 'rename', id, name: 'Renamed image' })).status, 200);
    assert.deepEqual(row.material_selection, selection, 'Rename must not reset an explicit material');
    assert.equal((await admin({ action: 'hide', id })).status, 200);
    assert.equal((await handlePublicImageQrRequest(publicRequest(), env, row.slug)).status, 404);
    const hidden = await handlePublicImageQrDataRequest(publicRequest(), env, row.slug);
    assert.equal(hidden.status, 404); assert(!(await hidden.text()).includes(row.object_path));
    assert.equal((await admin({ action: 'restore', id })).status, 200);
    assert.equal((await handlePublicImageQrRequest(publicRequest(), env, row.slug)).status, 200);
    assert.deepEqual(row.material_selection, selection);
    console.log('QR behavior verified: defaults, safe HTML, fixed material validation, role/conflict boundaries, save/readback, stable images and Hide/Restore (in-memory only).');
  } finally { globalThis.fetch = originalFetch; if (originalWebSocket) globalThis.WebSocket = originalWebSocket; else delete globalThis.WebSocket; }
}
