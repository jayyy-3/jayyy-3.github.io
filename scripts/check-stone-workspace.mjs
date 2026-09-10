import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  StoneSaveQueue,
  StoneApiError,
} from '../src/features/stone-library/stoneSaveQueue.ts';
import {
  emptyStone,
  stoneDraftToDetail,
} from '../src/features/stone-library/stoneDraft.ts';
import {
  validateStoneDraft,
  handleStoneRequest,
  publishedMediaIds,
} from '../functions/_lib/admin-stones.js';
const definitions = [
  { id: 1, key: 'flamed', name: 'Flamed', sortOrder: 1 },
  { id: 2, key: 'sawn', name: 'Sawn', sortOrder: 2 },
];
const draft = () => {
  const d = emptyStone(definitions);
  d.stone.name = 'Fixture';
  d.stone.slug = 'fixture';
  d.stone.type = 'Granite';
  d.variants[0].slug = 'fixture';
  d.variants[0].finishes[0].capability = 'yes';
  return d;
};
const envelope = (d, revision = 1) => ({
  stoneId: 17,
  revision,
  liveVersion: 'a'.repeat(32),
  publishedRevision: null,
  status: 'draft',
  addressLocked: false,
  isTest: false,
  updatedAt: '2026-09-10T00:00:00Z',
  draft: { ...structuredClone(d), stone: { ...d.stone, id: 17 } },
});
const waitFor = async (predicate) => {
  for (let n = 0; n < 100 && !predicate(); n++)
    await new Promise((r) => setTimeout(r, 1));
  assert.ok(predicate(), 'asynchronous test reached expected state');
};
const tests = [];
const test = async (name, fn) => {
  await fn();
  tests.push(name);
};
await test('serial saves coalesce typing and never replace newer text with old responses', async () => {
  const calls = [];
  let release;
  const q = new StoneSaveQueue(draft(), null, async (body) => {
    calls.push(body);
    if (calls.length === 1)
      await new Promise((r) => {
        release = r;
      });
    return envelope(body.draft, calls.length);
  });
  q.change({ ...q.draft, stone: { ...q.draft.stone, name: 'First' } });
  const running = q.flush();
  await waitFor(() => calls.length === 1);
  q.change({ ...q.draft, stone: { ...q.draft.stone, name: 'Second' } });
  q.change({ ...q.draft, stone: { ...q.draft.stone, name: 'Latest' } });
  assert.equal(calls.length, 1);
  release();
  await running;
  assert.equal(calls.length, 2);
  assert.equal(calls[1].draft.stone.name, 'Latest');
  assert.equal(calls[1].stoneId, 17);
  assert.equal(calls[1].revision, 1);
  assert.equal(q.draft.stone.name, 'Latest');
  assert.equal(q.dirty, false);
  q.dispose();
});
await test('lost committed response replays the identical request before a newer change', async () => {
  const calls = [];
  const q = new StoneSaveQueue(draft(), null, async (body) => {
    calls.push(structuredClone(body));
    if (calls.length === 1)
      throw new StoneApiError('Lost response', 0, 'uncertain');
    return envelope(body.draft, calls.length === 2 ? 1 : 2);
  });
  q.change(draft());
  await assert.rejects(q.flush());
  q.change({
    ...q.draft,
    stone: { ...q.draft.stone, name: 'Typed while disconnected' },
  });
  await q.flush();
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].draft.stone.name, 'Typed while disconnected');
  assert.notEqual(calls[2].requestId, calls[0].requestId);
  q.dispose();
});
await test('multi-editor conflict keeps all local edits and cannot silently advance revision', async () => {
  const q = new StoneSaveQueue(draft(), envelope(draft(), 3), async () => {
    throw new StoneApiError('Conflict', 409, 'conflict');
  });
  q.change({ ...q.draft, stone: { ...q.draft.stone, name: 'My text' } });
  await assert.rejects(q.flush());
  assert.equal(q.state, 'error');
  assert.equal(q.draft.stone.name, 'My text');
  assert.equal(q.envelope.revision, 3);
  assert.equal(q.dirty, true);
  q.dispose();
});
await test('definite validation failure can be corrected and retried with a new payload', async () => {
  const calls = [];
  const q = new StoneSaveQueue(draft(), null, async (body) => {
    calls.push(body);
    if (calls.length === 1)
      throw new StoneApiError('Name needed', 400, 'name_required');
    return envelope(body.draft);
  });
  q.change(draft());
  await assert.rejects(q.flush());
  q.change({ ...q.draft, stone: { ...q.draft.stone, name: 'Corrected' } });
  await q.flush();
  assert.notEqual(calls[0].requestId, calls[1].requestId);
  assert.equal(q.state, 'saved');
  q.dispose();
});
await test('flush waits for the latest draft before publication or navigation can proceed', async () => {
  let resolve;
  const q = new StoneSaveQueue(draft(), null, async (body) => {
    await new Promise((r) => {
      resolve = r;
    });
    return envelope(body.draft);
  });
  q.change(draft());
  const first = q.flush();
  await waitFor(() => !!resolve);
  let navigated = false;
  const next = q.flush().then(() => {
    navigated = true;
  });
  await Promise.resolve();
  assert.equal(navigated, false);
  resolve();
  await first;
  await next;
  assert.equal(navigated, true);
  q.dispose();
});
await test('whole draft validation rejects forged shapes and duplicate child ownership IDs', () => {
  assert.equal(validateStoneDraft(draft()).stone.name, 'Fixture');
  for (const bad of [
    null,
    {},
    [],
    { schemaVersion: 1, stone: {}, variants: [null] },
  ])
    assert.throws(() => validateStoneDraft(bad));
  const d = draft();
  d.variants.push({ ...structuredClone(d.variants[0]), key: 'other' });
  assert.throws(() => validateStoneDraft(d), /unique/);
  const images = draft();
  images.variants[0].finishes[0].images = [
    { key: 'one', id: 7, mediaAssetId: 1, role: 'primary' },
    { key: 'two', id: 7, mediaAssetId: 2, role: 'secondary' },
  ];
  assert.throws(() => validateStoneDraft(images), /unique/);
});
await test('preview uses exact finish photography and never fills Sawn with Flamed', () => {
  const d = draft();
  d.stone.availability = 'tbc';
  d.stone.originCountry = 'Internal origin';
  d.variants[0].finishes[0].images = [
    { id: null, key: 'one', mediaAssetId: 22, role: 'primary' },
  ];
  d.variants[0].finishes[1].capability = 'yes';
  const vm = stoneDraftToDetail(d, definitions, [
    {
      id: 22,
      status: 'draft',
      url: 'https://local.invalid/flamed.jpg',
      alt: 'Flamed',
      name: 'Flamed',
    },
  ]);
  assert.equal(vm.finishes[0].imageUrl, 'https://local.invalid/flamed.jpg');
  assert.equal(vm.finishes[1].imageUrl, undefined);
  assert.equal(vm.finishes[1].imageRole, 'placeholder');
  assert.equal(vm.status, 'tbc');
  assert.equal(vm.originLabel, '');
  d.variants[0].enabled = false;
  assert.deepEqual(publishedMediaIds(d), []);
});
function clientFor(role = 'owner', custom = {}) {
  const calls = [];
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: { id: '00000000-0000-4000-8000-000000000091' } },
      }),
    },
    storage: {
      from: () => ({
        getPublicUrl: (p) => ({
          data: { publicUrl: 'https://local.invalid/' + p },
        }),
        createSignedUrl: async (p) => ({
          data: { signedUrl: 'https://local.invalid/private/' + p },
        }),
      }),
    },
    from(table) {
      const filters = [];
      const q = {
        select() {
          return q;
        },
        eq(...a) {
          filters.push(a);
          return q;
        },
        neq() {
          return q;
        },
        order() {
          return q;
        },
        or(value) {
          calls.push({ search: value });
          return q;
        },
        range(a, b) {
          calls.push({ range: [a, b] });
          return q;
        },
        in(field, ids) {
          calls.push({ field, ids });
          return q;
        },
        maybeSingle: async () => ({ data: { role, is_active: true } }),
        then(resolve, reject) {
          return Promise.resolve(
            table === 'media_assets'
              ? {
                  data: Array.from({ length: 25 }, (_, i) => ({
                    id: i + 1,
                    status: 'draft',
                    source_kind: 'storage',
                    bucket: 'urblo-admin-media',
                    object_path: `image-${i}.jpg`,
                    alt: `Photo ${i}`,
                  })),
                  error: null,
                }
              : { data: [], error: null },
          ).then(resolve, reject);
        },
      };
      return q;
    },
    rpc: async () => ({
      data: {
        references: [
          { module: 'leads', id: 1 },
          { module: 'projects', id: 2 },
        ],
      },
    }),
    ...custom,
  };
  return { client, calls };
}
const get = (query, client) =>
  handleStoneRequest(
    new Request('https://fixture.invalid/api/admin/stone-library' + query, {
      headers: { authorization: 'Bearer fixture' },
    }),
    {},
    { client },
  );
await test('image library pages beyond 160 and signs private images without exposing public writes', async () => {
  const { client, calls } = clientFor();
  const result = await get('?view=media&page=7&q=granite', client);
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.deepEqual(calls.find((c) => c.range).range, [168, 192]);
  assert.equal(body.media.length, 24);
  assert.equal(body.hasMore, true);
  assert.match(body.media[0].url, /private/);
  assert.equal(body.media[0].status, 'draft');
});
await test('viewer and editor usage responses omit private lead references', async () => {
  for (const role of ['viewer', 'editor']) {
    const { client } = clientFor(role);
    const result = await get('?stoneId=17&view=usage', client);
    assert.deepEqual((await result.json()).references, [
      { module: 'projects', id: 2 },
    ]);
  }
});
await test('unauthenticated requests and Viewer writes are rejected before any mutation', async () => {
  assert.equal(
    (
      await handleStoneRequest(
        new Request('https://fixture.invalid/api/admin/stone-library'),
        {},
      )
    ).status,
    401,
  );
  const { client } = clientFor('viewer');
  const response = await handleStoneRequest(
    new Request('https://fixture.invalid/api/admin/stone-library', {
      method: 'POST',
      headers: { authorization: 'Bearer fixture' },
      body: '{}',
    }),
    {},
    { client },
  );
  assert.equal(response.status, 403);
});
await test('malformed JSON object returns 400 and never reaches RPC', async () => {
  const { client } = clientFor();
  client.rpc = () => {
    throw new Error('must not mutate');
  };
  for (const body of ['null', '[]', '{"action":"publish"}']) {
    const result = await handleStoneRequest(
      new Request('https://fixture.invalid/api/admin/stone-library', {
        method: 'POST',
        headers: { authorization: 'Bearer fixture' },
        body,
      }),
      {},
      { client },
    );
    assert.equal(result.status, 400);
  }
});
await test('failed copy and failed commit compensate only public copies; uncertain commit retains them', async () => {
  for (const mode of ['copy_failure', 'rollback', 'uncertain', 'success']) {
    const d = draft();
    d.stone.id = 17;
    d.variants[0].finishes[0].images = [1, 2].map((id) => ({
      key: `photo-${id}`,
      id: null,
      mediaAssetId: id,
      role: id === 1 ? 'primary' : 'secondary',
    }));
    const media = [1, 2].map((id) => ({
      id,
      status: 'draft',
      source_kind: 'storage',
      bucket: 'urblo-admin-media',
      object_path: `original-${id}.png`,
      mime_type: 'image/png',
      media_type: 'image',
      alt: `Photo ${id}`,
      updated_at: '2026-09-10T00:00:00Z',
    }));
    const png = new Blob(
      [
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',
          'base64',
        ),
      ],
      { type: 'image/png' },
    );
    const objects = new Map();
    const removed = [];
    let uploads = 0;
    let commits = 0;
    const { client } = clientFor();
    const originalFrom = client.from;
    client.from = (table) => {
      if (table === 'admin_profiles') return originalFrom(table);
      let filters = [];
      const q = {
        select() {
          return q;
        },
        in() {
          return q;
        },
        eq(k, v) {
          filters.push([k, v]);
          return q;
        },
        limit() {
          return q;
        },
        insert() {
          return q;
        },
        then(resolve, reject) {
          return Promise.resolve({
            data: table === 'media_assets' && !filters.length ? media : [],
            error: null,
          }).then(resolve, reject);
        },
      };
      return q;
    };
    client.storage = {
      from(bucket) {
        return {
          download: async (path) => ({
            data: bucket === 'urblo-admin-media' ? png : objects.get(path),
            error: null,
          }),
          upload: async (path, blob) => {
            uploads++;
            if (mode === 'copy_failure' && uploads === 2)
              return { error: { message: 'fixture upload failure' } };
            objects.set(path, blob);
            return { error: null };
          },
          remove: async (paths) => {
            assert.equal(bucket, 'urblo-public-media');
            for (const path of paths) {
              removed.push(path);
              objects.delete(path);
            }
            return { error: null };
          },
        };
      },
    };
    client.rpc = async (_name, args) => {
      if (args.p_action === 'prepare')
        return { data: { ready: true }, error: null };
      commits++;
      if (mode === 'rollback')
        return { error: { code: '40001', message: 'stone_conflict' } };
      if (mode === 'uncertain')
        return { error: { code: '08006', message: 'lost connection' } };
      return { data: envelope(d), error: null };
    };
    const response = await handleStoneRequest(
      new Request('https://fixture.invalid/api/admin/stone-library', {
        method: 'POST',
        headers: { authorization: 'Bearer fixture' },
        body: JSON.stringify({
          action: 'publish',
          requestId: crypto.randomUUID(),
          stoneId: 17,
          revision: 1,
          liveVersion: 'a'.repeat(32),
          draft: d,
        }),
      }),
      {},
      { client },
    );
    if (mode === 'copy_failure') {
      assert.equal(response.status, 422);
      assert.equal(commits, 0);
      assert.equal(objects.size, 0);
      assert.equal(removed.length, 2);
    }
    if (mode === 'rollback') {
      assert.equal(response.status, 409);
      assert.equal(objects.size, 0);
      assert.equal(removed.length, 2);
    }
    if (mode === 'uncertain') {
      assert.ok(response.status >= 500);
      assert.equal(objects.size, 2);
      assert.equal(removed.length, 0);
    }
    if (mode === 'success') {
      assert.equal(response.status, 200);
      assert.equal(objects.size, 2);
      assert.equal(removed.length, 0);
    }
  }
});
await test('source retains protected boundary, parent ownership, reference serialization and tombstones', async () => {
  const [sql, lock, api, editor, service] = await Promise.all(
    [
      'supabase/migrations/20260910064551_stone_library_workspace.sql',
      'supabase/migrations/20260910065803_stone_library_reference_lockdown.sql',
      'functions/_lib/admin-stones.js',
      'src/pages/admin/AdminStoneLibraryPage.tsx',
      'src/service/StoneLibraryService.ts',
    ].map((f) => readFile(f, 'utf8')),
  );
  for (const needle of [
    'stone_variant_mismatch',
    'stone_image_mismatch',
    'stone_conflict',
    'stone_request_reused',
    'private.stone_history',
    'private.project_drafts',
    'private.stone_static_references',
    'stone_in_use',
  ])
    assert.ok(sql.includes(needle), needle);
  assert.match(
    lock,
    /before insert or update or delete[\s\S]+for each statement/,
  );
  assert.match(lock, /deferrable initially deferred/);
  assert.match(lock, /from authenticated,anon/);
  assert.ok(api.includes('commitAttempted'));
  assert.ok(api.includes('compensatePublicCopies'));
  assert.ok(editor.includes('queue.flush()'));
  assert.ok(!editor.includes(".from('stone_groups')"));
  assert.ok(
    service.includes('catalogue.managedKeys.includes(stoneGroupId) ? null'),
  );
  assert.ok(!service.includes(".from('stone_finish_images')"));
});
console.log(
  `Stone workspace: ${tests.length} behavior/security groups passed.`,
);
for (const name of tests) console.log(`  PASS ${name}`);
