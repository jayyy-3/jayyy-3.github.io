#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { normalizeAdoptionSnapshot as normal, reviewedStoneState } from './_lib/stone-adoption-snapshot.mjs';
const args = process.argv.slice(2);
const value = (flag, fallback) =>
  args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const planFile = value('--plan', 'docs/agent/stone-library-adoption-plan.json');
const planBytes = await readFile(planFile);
const plan = JSON.parse(planBytes);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const planHash = hash(planBytes);
const allow = args.includes('--allow-writes');
const local = args.includes('--local-fixture');
const base = new URL(value('--base-url', 'https://urblo.com.au'));
if (
  local
    ? !['127.0.0.1', 'localhost'].includes(base.hostname)
    : !(
        base.protocol === 'https:' &&
        (base.hostname === 'urblo.com.au' ||
          base.hostname.endsWith('.urblo-site.pages.dev'))
      )
)
  throw new Error(
    'Use an approved Urblo runtime or the explicit local fixture.',
  );
for (const photo of plan.photos) {
  const bytes = await readFile(photo.sourceFile);
  if (hash(bytes) !== photo.sha256)
    throw new Error(`Reviewed photo changed: ${photo.sourceFile}`);
}
if (!allow) {
  console.log(
    JSON.stringify(
      {
        mode: 'plan_only',
        productionWrites: 0,
        planFile,
        planSha256: planHash,
        baseUrl: base.origin,
        stones: plan.stones.map(({ id, key }) => ({ id, key })),
        archiveIds: plan.historical
          .filter((s) => s.action === 'archive')
          .map((s) => s.id),
        privateUploads: plan.photos.length,
        requiredApproval:
          'Pass --allow-writes and the item-specific approved --approved-plan-sha256 only after the review is approved.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
if (value('--approved-plan-sha256', '') !== planHash)
  throw new Error(
    'The supplied approval does not match this exact reviewed plan.',
  );
const env = { ...process.env };
if (!local)
  for (const file of ['.env.local', '.env', '.dev.vars']) {
    const content = await readFile(file, 'utf8').catch(() => null);
    if (content)
      for (const line of content.split(/\r?\n/)) {
        const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
        if (match && !(match[1] in env))
          env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
      }
  }
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = local
  ? base.origin
  : env.VITE_SUPABASE_URL || 'https://npkidywzwddbnfrnxlmo.supabase.co';
if (!key || !env.URBLO_ADMIN_EMAIL || !env.URBLO_ADMIN_PASSWORD)
  throw new Error(
    'Owner/admin browser credentials and a browser-safe key are required; no credentials are printed.',
  );
const client = createClient(supabaseUrl, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
const signIn = await client.auth.signInWithPassword({
  email: env.URBLO_ADMIN_EMAIL,
  password: env.URBLO_ADMIN_PASSWORD,
});
if (signIn.error || !signIn.data.user)
  throw new Error('The approved admin session could not be opened.');
const actor = signIn.data.user.id;
const profile = await client
  .from('admin_profiles')
  .select('role,is_active')
  .eq('user_id', actor)
  .single();
if (
  profile.error ||
  !profile.data?.is_active ||
  !['owner', 'admin'].includes(profile.data.role)
)
  throw new Error('Adoption requires an active owner/admin.');
const receiptFile = value(
  '--receipt',
  `.tmp/stone-adoption-${local ? 'local' : base.hostname}-${planHash.slice(0, 12)}.json`,
);
await mkdir(path.dirname(receiptFile), { recursive: true });
let receipt = JSON.parse(
  await readFile(receiptFile, 'utf8').catch(() =>
    JSON.stringify({
      planHash,
      baseUrl: base.origin,
      photos: {},
      stones: {},
      pending: null,
      preserved: null,
    }),
  ),
);
if (receipt.planHash !== planHash || receipt.baseUrl !== base.origin)
  throw new Error('Receipt belongs to a different plan or deployment.');
const persist = () =>
  writeFile(receiptFile, JSON.stringify(receipt, null, 2) + '\n', {
    mode: 0o600,
  });
async function api(query = '', body) {
  const session = await client.auth.getSession();
  const response = await fetch(
    base.origin + '/api/admin/stone-library' + query,
    {
      method: body ? 'POST' : 'GET',
      headers: {
        authorization: `Bearer ${session.data.session?.access_token}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(120000),
    },
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.message || `Stone request failed (${response.status}).`,
    );
  return result;
}
async function readRows(table, columns = '*') {
  const { data, error } = await client.from(table).select(columns).order('id');
  if (error) throw new Error(`Could not read ${table} before adoption.`);
  return data;
}
async function checkOriginal(item) {
  const current = await api(`?stoneId=${item.id}`);
  if (current.revision !== 0)
    throw new Error(
      `Stone ID ${item.id} has a newer workspace draft. Review it before replacing the draft with the public baseline.`,
    );
  const g = item.original.stone || item.original;
  const result = await client
    .from('stone_groups')
    .select(Object.keys(g).join(','))
    .eq('id', item.id)
    .single();
  const state = reviewedStoneState(item, result.data);
  if (result.error || state === 'changed')
    throw new Error(
      `Stone ID ${item.id} changed after the snapshot. Review it before proceeding.`,
    );
  if (item.original.stone)
    for (const [table, key] of [
      ['stone_variants', 'variants'],
      ['stone_finish_capabilities', 'capabilities'],
      ['stone_finish_images', 'images'],
    ]) {
      const expected = item.original[key];
      let query = client
        .from(table)
        .select(expected.length ? Object.keys(expected[0]).join(',') : '*');
      query =
        table === 'stone_finish_capabilities'
          ? query.in(
              'stone_variant_id',
              item.original.variants.map((v) => v.id),
            )
          : query.eq('stone_group_id', item.id);
      const { data, error } = await query.order('id');
      if (
        error ||
        JSON.stringify(normal(data)) !==
          JSON.stringify(normal([...expected].sort((a, b) => a.id - b.id)))
      )
        throw new Error(`Stone ID ${item.id} ${key} changed after review.`);
    }
  return state;
}
async function preservedState() {
  const tables = [
    'products',
    'product_material_defaults',
    'articles',
    'article_blocks',
    'projects',
    'project_materials',
  ];
  const result = Object.fromEntries(
    await Promise.all(
      tables.map(async (t) => [
        t,
        hash(JSON.stringify(normal(await readRows(t)))),
      ]),
    ),
  );
  const session = await client.auth.getSession();
  const response = await fetch(base.origin + '/api/admin/image-qr', {
    headers: { authorization: `Bearer ${session.data.session?.access_token}` },
  });
  const data = await response.json();
  if (!response.ok || !Array.isArray(data.resources))
    throw new Error(
      'Could not read the protected Image QR library before adoption.',
    );
  if (data.resources.length !== plan.preserved.imageQr.count)
    throw new Error('Image QR resource count changed after review.');
  result.image_qr_resources = hash(
    JSON.stringify(
      normal(data.resources.sort((a, b) => a.id.localeCompare(b.id))),
    ),
  );
  return result;
}
function finishPending(result) {
  const { id, phase } = receipt.pending;
  receipt.stones[id] = { ...(receipt.stones[id] || {}), phase, result };
  receipt.pending = null;
}
async function writeStone(id, action, draft, envelope, phase) {
  const body = {
    action,
    stoneId: id,
    revision: envelope.revision,
    liveVersion: envelope.liveVersion,
    requestId: randomUUID(),
    draft,
  };
  receipt.pending = { id, phase, body };
  await persist();
  const result = await api('', body);
  finishPending(result);
  await persist();
  return result;
}
try {
  if (receipt.pending) {
    const result = await api('', receipt.pending.body);
    finishPending(result);
    await persist();
  }
  if (!receipt.preserved) {
    for (const item of [...plan.stones, ...plan.historical])
      await checkOriginal(item);
    receipt.preserved = await preservedState();
    await persist();
  }
  // The one published test is removed before the baseline photo/content work.
  for (const item of plan.historical.filter((i) => i.action === 'archive')) {
    if (receipt.stones[item.id]?.phase === 'complete') continue;
    const state = await checkOriginal(item);
    if (state === 'already_archived') {
      receipt.stones[item.id] = { phase: 'complete', retainedAlreadyArchived: true };
      await persist();
      console.log(`Retained already archived historical stone ID ${item.id}; no write.`);
      continue;
    }
    const current = await api(`?stoneId=${item.id}`);
    await writeStone(item.id, 'archive', current.draft, current, 'complete');
    console.log(`Archived exact historical stone ID ${item.id}.`);
  }
  for (const photo of plan.photos) {
    if (receipt.photos[photo.key]?.id) continue;
    const objectPath = `stone-adoption/${planHash.slice(0, 16)}/${photo.key}${path.extname(photo.sourceFile).toLowerCase()}`;
    const bucket = 'urblo-admin-media';
    const lookup = await client
      .from('media_assets')
      .select('id,alt,bucket,object_path,status')
      .eq('bucket', bucket)
      .eq('object_path', objectPath)
      .maybeSingle();
    if (lookup.error)
      throw new Error(`Could not verify private photo receipt: ${photo.key}`);
    let asset = lookup.data;
    if (!asset) {
      const bytes = await readFile(photo.sourceFile);
      const upload = await client.storage
        .from(bucket)
        .upload(objectPath, bytes, {
          upsert: false,
          contentType: photo.mimeType,
        });
      if (upload.error) {
        const download = await client.storage.from(bucket).download(objectPath);
        if (
          download.error ||
          hash(Buffer.from(await download.data.arrayBuffer())) !== photo.sha256
        )
          throw new Error(
            `Private upload not confirmed for ${photo.sourceFile}. Retained originals were not removed.`,
          );
      }
      const inserted = await client
        .from('media_assets')
        .insert({
          status: 'draft',
          source_kind: 'storage',
          bucket,
          object_path: objectPath,
          media_type: 'image',
          mime_type: photo.mimeType,
          size_bytes: photo.sizeBytes,
          alt: photo.alt,
          created_by: actor,
          updated_by: actor,
        })
        .select('id,alt,bucket,object_path,status')
        .single();
      asset = inserted.data;
      if (!asset) {
        const readback = await client
          .from('media_assets')
          .select('id,alt,bucket,object_path,status')
          .eq('bucket', bucket)
          .eq('object_path', objectPath)
          .maybeSingle();
        if (readback.error || !readback.data)
          throw new Error(
            `Media record uncertain for ${photo.key}; stop and inspect the retained upload before retrying.`,
          );
        asset = readback.data;
      }
    }
    receipt.photos[photo.key] = {
      id: asset.id,
      objectPath,
      sha256: photo.sha256,
    };
    await persist();
  }
  for (const item of plan.stones) {
    const state = receipt.stones[item.id];
    if (state?.phase === 'complete') continue;
    let current;
    if (state?.phase === 'saved') {
      current = await api(`?stoneId=${item.id}`);
      if (
        current.liveVersion !== state.result.liveVersion ||
        current.revision !== state.result.revision
      )
        throw new Error(
          `Saved adoption draft ${item.id} changed in another session.`,
        );
    } else {
      await checkOriginal(item);
      current = await api(`?stoneId=${item.id}`);
      const draft = structuredClone(item.draft);
      for (const variant of draft.variants)
        for (const finish of variant.finishes)
          for (const image of finish.images) {
            image.mediaAssetId = receipt.photos[image.photoKey].id;
            delete image.photoKey;
          }
      current = await writeStone(item.id, 'save', draft, current, 'saved');
    }
    await writeStone(item.id, 'publish', current.draft, current, 'complete');
    console.log(`Adopted baseline stone ID ${item.id} (${item.key}).`);
  }
  const { data: catalogue, error } = await client.rpc('public_stone_catalogue');
  if (error) throw new Error('Could not verify the public catalogue.');
  for (const item of plan.stones) {
    const live = catalogue.stones.find((s) => s.draft.stone.id === item.id);
    if (
      !live ||
      live.draft.stone.name !== item.newName ||
      live.draft.stone.availability !== item.availability
    )
      throw new Error(`Public baseline readback failed for stone ${item.id}.`);
  }
  for (const item of plan.stones) {
    const live = catalogue.stones.find((s) => s.draft.stone.id === item.id);
    const shape = (variants, expected) =>
      variants
        .filter((v) => v.enabled)
        .map((v) => ({
          slug: v.slug,
          label: v.label,
          type: v.type,
          finishes: v.finishes.map((f) => ({
            definitionId: f.definitionId,
            capability: f.capability,
            images: f.images.map((i) => ({
              mediaAssetId: expected
                ? receipt.photos[i.photoKey].id
                : i.mediaAssetId,
              role: i.role,
            })),
          })),
        }));
    if (
      JSON.stringify(shape(live.draft.variants, false)) !==
      JSON.stringify(shape(item.draft.variants, true))
    )
      throw new Error(
        `Public variant/finish/image readback failed for stone ${item.id}.`,
      );
    for (const asset of live.media) {
      const photo = plan.photos.find(
        (p) => receipt.photos[p.key]?.id === asset.id,
      );
      if (!photo || asset.bucket !== 'urblo-public-media')
        throw new Error(`Unexpected public media for stone ${item.id}.`);
      const result = await client.storage
        .from(asset.bucket)
        .download(asset.objectPath);
      if (
        result.error ||
        hash(Buffer.from(await result.data.arrayBuffer())) !== photo.sha256
      )
        throw new Error(`Public photo bytes differ for ${photo.key}.`);
    }
  }
  if (
    catalogue.stones.some((s) =>
      plan.historical.some((h) => h.id === s.draft.stone.id),
    )
  )
    throw new Error('A historical stone remains in the public catalogue.');
  if (!local && catalogue.stones.length !== 12)
    throw new Error(
      'Unexpected public catalogue count; review the additional records.',
    );
  const preserved = await preservedState();
  if (JSON.stringify(preserved) !== JSON.stringify(receipt.preserved))
    throw new Error(
      'A protected non-Stone module changed during adoption; review before release.',
    );
  receipt.complete = true;
  receipt.completedAt = new Date().toISOString();
  await persist();
  console.log(
    JSON.stringify(
      {
        result: 'passed',
        mode: local ? 'local_fixture' : 'approved_live',
        baselineStones: 12,
        photos: plan.photos.length,
        preservedModules: Object.keys(preserved),
        receipt: receiptFile,
      },
      null,
      2,
    ),
  );
} finally {
  await client.auth.signOut({ scope: 'local' }).catch(() => {});
}
