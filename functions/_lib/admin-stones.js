import { createClient } from '@supabase/supabase-js';
import {
  prepareMediaPromotions,
  compensatePublicCopies,
} from './admin-projects.js';

const endpointName = 'Stone Library';
const MAX_BYTES = 1_100_000;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const variantSlugPattern = /^[a-z0-9]+(?:--?[a-z0-9]+)*$/;
export class StoneError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}
export function stoneResponse(body, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type',
      'x-content-type-options': 'nosniff',
    },
  });
}
function integer(value, name, nullable = false) {
  if (nullable && value === null) return;
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new StoneError(400, 'invalid_field', `${name} is invalid.`);
}
function string(value, name, max = 4000) {
  if (typeof value !== 'string' || value.length > max || value.includes(String.fromCharCode(0)))
    throw new StoneError(400, 'invalid_field', `${name} is invalid.`);
}
function array(value, name, max) {
  if (!Array.isArray(value) || value.length > max)
    throw new StoneError(400, 'invalid_field', `${name} is invalid.`);
}
function unique(values, name) {
  if (new Set(values).size !== values.length)
    throw new StoneError(
      400,
      'duplicate_field',
      `Each ${name} must be unique.`,
    );
}
function object(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new StoneError(400, 'invalid_field', `${name} is invalid.`);
}
export function validateStoneDraft(draft) {
  object(draft, 'Stone draft');
  object(draft.stone, 'Stone');
  if (!draft || draft.schemaVersion !== 1 || !draft.stone)
    throw new StoneError(
      400,
      'invalid_draft',
      'The stone draft is incomplete.',
    );
  const s = draft.stone;
  integer(s.id, 'Stone', true);
  for (const key of [
    'slug',
    'name',
    'type',
    'sourceName',
    'originRegion',
    'originCountry',
  ])
    string(s[key], key, key === 'slug' ? 100 : 200);
  for (const key of ['summary', 'internalNote', 'pricingNote'])
    string(s[key], key);
  if (!s.name.trim() || !slugPattern.test(s.slug))
    throw new StoneError(
      400,
      'name_required',
      'Name this stone before saving.',
    );
  if (
    !['active', 'tbc'].includes(s.availability) ||
    ![null, 1, 2, 3].includes(s.priceTier)
  )
    throw new StoneError(
      400,
      'invalid_field',
      'Choose a valid availability and price tier.',
    );
  for (const key of ['blockLength', 'blockWidth', 'blockHeight']) {
    integer(s[key], key, true);
    if (s[key] > 2147483647)
      throw new StoneError(
        400,
        'invalid_field',
        'Block dimensions are too large.',
      );
  }
  array(s.cutOptions, 'Cut options', 12);
  for (const c of s.cutOptions) {
    object(c, 'Cut option');
    string(c.cutOrientation, 'Cut option', 100);
    if (typeof c.available !== 'boolean')
      throw new StoneError(
        400,
        'invalid_field',
        'Cut availability is invalid.',
      );
    array(c.sources, 'Cut sources', 20);
    c.sources.forEach((x) => string(x, 'Source', 200));
  }
  array(draft.variants, 'Variants', 24);
  draft.variants.forEach((v) => object(v, 'Variant'));
  unique(
    draft.variants.map((v) => v.key),
    'variant',
  );
  unique(
    draft.variants.map((v) => v.slug),
    'variant address',
  );
  unique(
    draft.variants.filter((v) => v.id !== null).map((v) => v.id),
    'variant ID',
  );
  const allImages = [];
  for (const v of draft.variants) {
    integer(v.id, 'Variant', true);
    string(v.key, 'Variant key', 100);
    string(v.slug, 'Variant address', 150);
    string(v.label, 'Variant name', 200);
    if (
      !v.key ||
      !variantSlugPattern.test(v.slug) ||
      !['none', 'shade', 'cut_orientation'].includes(v.type) ||
      typeof v.enabled !== 'boolean'
    )
      throw new StoneError(
        400,
        'invalid_variant',
        'The variant is incomplete.',
      );
    array(v.finishes, 'Finishes', 32);
    v.finishes.forEach((f) => object(f, 'Finish'));
    unique(
      v.finishes.map((f) => f.definitionId),
      'finish',
    );
    for (const f of v.finishes) {
      integer(f.definitionId, 'Finish');
      if (!['yes', 'no', 'tbc'].includes(f.capability))
        throw new StoneError(
          400,
          'invalid_finish',
          'Choose a finish availability.',
        );
      string(f.behaviorNote, 'Finish description');
      string(f.internalNote, 'Finish note');
      array(f.sources, 'Sources', 20);
      f.sources.forEach((x) => string(x, 'Source', 200));
      array(f.images, 'Finish images', 12);
      f.images.forEach((i) => object(i, 'Image'));
      if (f.images.filter((i) => i.role === 'primary').length > 1)
        throw new StoneError(
          400,
          'duplicate_primary',
          'Choose one main image per finish.',
        );
      for (const i of f.images) {
        integer(i.id, 'Image link', true);
        integer(i.mediaAssetId, 'Image');
        string(i.key, 'Image key', 100);
        if (
          !i.key ||
          !['primary', 'secondary', 'detail', 'swatch'].includes(i.role)
        )
          throw new StoneError(
            400,
            'invalid_image',
            'The image link is invalid.',
          );
        allImages.push(i);
      }
    }
  }
  if (allImages.length > 100)
    throw new StoneError(
      400,
      'too_many_images',
      'Keep each stone to 100 images or fewer.',
    );
  unique(
    allImages.map((i) => i.key),
    'image link',
  );
  unique(
    allImages.filter((i) => i.id !== null).map((i) => i.id),
    'image link ID',
  );
  return draft;
}
export function publishedMediaIds(draft) {
  return [
    ...new Set(
      draft.variants
        .filter((v) => v.enabled)
        .flatMap((v) =>
          v.finishes
            .filter((f) => f.capability !== 'no')
            .flatMap((f) => f.images.map((i) => i.mediaAssetId)),
        ),
    ),
  ];
}
export function mapStoneError(error) {
  const code = error?.message || '';
  const mappings = {
    stone_conflict: [
      409,
      'conflict',
      'This stone changed in another session. Your edits are kept here. Reload the latest version before continuing.',
    ],
    stone_media_conflict: [
      409,
      'conflict',
      'An image changed in another session. Reload before publishing.',
    ],
    stone_not_found: [404, 'not_found', 'This stone could not be found.'],
    stone_access_denied: [
      403,
      'not_allowed',
      'Active Stone Library access is required.',
    ],
    stone_read_only: [
      403,
      'read_only',
      'Your account can view stones but cannot edit them.',
    ],
    stone_in_use: [
      409,
      'in_use',
      'Update the listed pages before hiding this stone or disabling its referenced content.',
    ],
    stone_history_only: [
      409,
      'history_only',
      'This historical record cannot be published.',
    ],
    stone_address_locked: [
      409,
      'address_locked',
      'A website address cannot change after publication.',
    ],
    stone_variant_address_locked: [
      409,
      'address_locked',
      'A published variant address cannot change.',
    ],
    stone_request_reused: [
      409,
      'request_reused',
      'This save identifier belongs to a different change. Reload before continuing.',
    ],
    stone_duplicate_address: [
      409,
      'duplicate_address',
      'Another stone already uses that name in its website address. Choose a distinct name.',
    ],
    stone_finish_required: [
      422,
      'publish_incomplete',
      'Choose at least one available finish for each enabled variant.',
    ],
    stone_publish_incomplete: [
      422,
      'publish_incomplete',
      'Add a stone type and at least one enabled variant.',
    ],
    stone_media_unavailable: [
      422,
      'media_unavailable',
      'An image is unavailable. Choose another image or restore it in Media.',
    ],
    stone_media_not_ready: [
      422,
      'media_unavailable',
      'An image could not be prepared. Your stone has not been published.',
    ],
  };
  if (mappings[code]) {
    let details = {};
    if (code === 'stone_in_use') {
      try {
        details.references = JSON.parse(error.details);
      } catch { /* Preserve the original error and retain uncertain files. */ }
    }
    return new StoneError(...mappings[code], details);
  }
  if (error?.code === '42501')
    return new StoneError(403, 'not_allowed', 'This change is not allowed.');
  if (['22023', '23514', '23503'].includes(error?.code))
    return new StoneError(
      422,
      'invalid_draft',
      'Some information is invalid. Review the stone and image selections.',
    );
  if (error?.code === '23505')
    return new StoneError(
      409,
      'duplicate_address',
      'A stone or variant already uses this address.',
    );
  return new StoneError(
    502,
    'save_uncertain',
    'The result could not be confirmed. Retry this operation to check its result; do not start a second copy.',
  );
}
async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BYTES)
    throw new StoneError(413, 'too_large', 'The stone draft is too large.');
  const reader = request.body?.getReader();
  if (!reader)
    throw new StoneError(400, 'empty_body', 'The stone draft is missing.');
  let bytes = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BYTES) {
      await reader.cancel();
      throw new StoneError(413, 'too_large', 'The stone draft is too large.');
    }
    chunks.push(value);
  }
  let body;
  try {
    body = JSON.parse(await new Blob(chunks).text());
  } catch {
    throw new StoneError(
      400,
      'invalid_json',
      'The stone draft could not be read.',
    );
  }
  object(body, 'Request');
  if (
    !['save', 'publish', 'archive'].includes(body.action) ||
    !uuid.test(body.requestId || '') ||
    !Number.isSafeInteger(body.revision) ||
    body.revision < 0
  )
    throw new StoneError(
      400,
      'invalid_request',
      'The save request is invalid.',
    );
  integer(body.stoneId, 'Stone', true);
  if (
    body.stoneId !== null &&
    (typeof body.liveVersion !== 'string' ||
      !/^[a-f0-9]{32}$/.test(body.liveVersion))
  )
    throw new StoneError(
      400,
      'invalid_version',
      'Reload this stone before saving.',
    );
  validateStoneDraft(body.draft);
  if (body.draft.stone.id !== body.stoneId)
    throw new StoneError(
      400,
      'parent_mismatch',
      'The stone selection changed. Reload before saving.',
    );
  return body;
}
async function actorFor(client, token) {
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user)
    throw new StoneError(
      401,
      'invalid_session',
      'Sign in again to continue editing.',
    );
  const { data: profile, error: profileError } = await client
    .from('admin_profiles')
    .select('role,is_active')
    .eq('user_id', data.user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (
    profileError ||
    !profile ||
    !['owner', 'admin', 'editor', 'viewer'].includes(profile.role)
  )
    throw new StoneError(
      403,
      'not_allowed',
      'Active Stone Library access is required.',
    );
  return { id: data.user.id, role: profile.role };
}
async function rpc(client, actor, body, action = body.action, promotions = []) {
  const { data, error } = await client.rpc('admin_stone_workspace', {
    p_action: action,
    p_stone_id: body.stoneId ?? null,
    p_revision: body.revision ?? 0,
    p_live_version: body.liveVersion ?? null,
    p_request_id: body.requestId ?? null,
    p_draft: body.draft ?? null,
    p_actor: actor.id,
    p_role: actor.role,
    p_promotions: promotions,
  });
  if (error) throw mapStoneError(error);
  if (!data || typeof data !== 'object')
    throw new StoneError(
      502,
      'invalid_response',
      'The editor returned an incomplete result.',
    );
  return data;
}
const mediaSelect =
  'id,status,source_kind,source_url,bucket,object_path,media_type,mime_type,alt,caption,updated_at';
async function mediaPresentation(client, asset) {
  let url = null;
  if (asset.source_kind === 'storage' && asset.object_path) {
    if (asset.bucket === 'urblo-public-media' && asset.status === 'published')
      url = client.storage.from(asset.bucket).getPublicUrl(asset.object_path)
        .data.publicUrl;
    else if (asset.bucket === 'urblo-admin-media') {
      const { data } = await client.storage
        .from(asset.bucket)
        .createSignedUrl(asset.object_path, 3600);
      url = data?.signedUrl || null;
    }
  } else if (safeSource(asset.source_url)) url = asset.source_url;
  return {
    id: asset.id,
    status: asset.status,
    url,
    alt: asset.alt || '',
    name:
      asset.alt ||
      asset.caption ||
      asset.object_path?.split('/').pop() ||
      'Untitled image',
  };
}
function safeSource(value) {
  return (
    typeof value === 'string' &&
    ((value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\') && !Array.from(value).some(c => c.charCodeAt(0) <= 32)) ||
      /^https:\/\/[^\s@\\]+$/i.test(value))
  );
}
async function getMedia(client, url) {
  let query = client
    .from('media_assets')
    .select(mediaSelect)
    .eq('media_type', 'image');
  const rawIds = url.searchParams.get('ids');
  let hasMore = false;
  if (rawIds) {
    const ids = rawIds.split(',').map(Number);
    if (ids.length > 100 || ids.some((x) => !Number.isSafeInteger(x) || x <= 0))
      throw new StoneError(
        400,
        'invalid_ids',
        'The image selection is invalid.',
      );
    query = query.in('id', ids);
  } else {
    const page = Number(url.searchParams.get('page') || 0);
    if (!Number.isSafeInteger(page) || page < 0 || page > 10000)
      throw new StoneError(400, 'invalid_page', 'The image page is invalid.');
    const search = (url.searchParams.get('q') || '')
      .slice(0, 150)
      .replace(/[,%()_*\\]/g, ' ');
    query = query.neq('status', 'archived');
    if (search.trim())
      query = query.or(
        `alt.ilike.%${search}%,caption.ilike.%${search}%,object_path.ilike.%${search}%`,
      );
    query = query
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false })
      .range(page * 24, page * 24 + 24);
  }
  const { data, error } = await query;
  if (error)
    throw new StoneError(
      502,
      'media_load_failed',
      'Images could not load. Try again.',
    );
  hasMore = !rawIds && (data || []).length > 24;
  return {
    media: await Promise.all(
      (rawIds ? data || [] : (data || []).slice(0, 24)).map((a) =>
        mediaPresentation(client, a),
      ),
    ),
    hasMore,
  };
}
export async function handleStoneRequest(request, env, dependencies = {}) {
  if (request.method === 'OPTIONS') return stoneResponse(null, 204);
  if (!['GET', 'POST'].includes(request.method))
    return stoneResponse(
      { error: 'method_not_allowed', message: 'Use GET or POST.' },
      405,
    );
  try {
    const token = /^Bearer\s+(.+)$/i.exec(
      request.headers.get('authorization') || '',
    )?.[1];
    if (!token)
      throw new StoneError(
        401,
        'missing_session',
        `Sign in before opening ${endpointName}.`,
      );
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
    if (!key && !dependencies.client)
      throw new StoneError(
        503,
        'not_configured',
        'The stone editor is not connected on this deployment.',
      );
    const client =
      dependencies.client ||
      createClient(
        env.SUPABASE_URL || 'https://npkidywzwddbnfrnxlmo.supabase.co',
        key,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        },
      );
    const actor = await actorFor(client, token);
    if (request.method === 'GET') {
      const url = new URL(request.url);
      if (url.searchParams.get('view') === 'media')
        return stoneResponse(await getMedia(client, url));
      if (url.searchParams.get('view') === 'finishes') {
        const { data, error } = await client
          .from('finish_definitions')
          .select('id,finish_key,display_name,sort_order')
          .eq('status', 'published')
          .order('sort_order');
        if (error)
          throw new StoneError(
            502,
            'load_failed',
            'Finish choices could not load.',
          );
        return stoneResponse({
          finishes: data.map((f) => ({
            id: f.id,
            key: f.finish_key,
            name: f.display_name,
            sortOrder: f.sort_order,
          })),
        });
      }
      const raw = url.searchParams.get('stoneId');
      const stoneId = raw === null ? null : Number(raw);
      integer(stoneId, 'Stone', true);
      const result = await rpc(
        client,
        actor,
        { stoneId },
        stoneId === null
          ? 'list'
          : url.searchParams.get('view') === 'usage'
            ? 'usage'
            : url.searchParams.get('view') === 'history'
              ? 'history'
              : 'get',
      );
      if (!['owner', 'admin'].includes(actor.role) && result.references)
        result.references = result.references.filter(
          (r) => r.module !== 'leads',
        );
      if (result.stones) {
        const ids = [
          ...new Set(result.stones.map((s) => s.coverMediaId).filter(Boolean)),
        ];
        const covers = new Map();
        for (let start = 0; start < ids.length; start += 100) {
          const { data } = await client
            .from('media_assets')
            .select(mediaSelect)
            .in('id', ids.slice(start, start + 100))
            .neq('status', 'archived');
          for (const a of data || [])
            covers.set(a.id, (await mediaPresentation(client, a)).url);
        }
        result.stones = result.stones.map(({ coverMediaId, ...s }) => ({
          ...s,
          cover: covers.get(coverMediaId) || null,
        }));
      }
      return stoneResponse(result);
    }
    if (actor.role === 'viewer')
      throw new StoneError(
        403,
        'read_only',
        'Your account can view stones but cannot edit them.',
      );
    const body = await readBody(request);
    if (body.action !== 'publish')
      return stoneResponse(await rpc(client, actor, body));
    const preflight = await rpc(client, actor, body, 'prepare');
    if (preflight.replayed) return stoneResponse(preflight);
    const mediaIds = publishedMediaIds(body.draft);
    const { data: media, error: mediaError } = mediaIds.length
      ? await client.from('media_assets').select(mediaSelect).in('id', mediaIds)
      : { data: [], error: null };
    if (mediaError || media?.length !== mediaIds.length)
      throw new StoneError(
        422,
        'media_unavailable',
        'A selected image is missing. Choose another image.',
      );
    if (
      media.some(
        (m) =>
          m.status === 'archived' ||
          m.media_type !== 'image' ||
          !m.alt?.trim() ||
          (m.source_kind !== 'storage' && !safeSource(m.source_url)),
      )
    )
      throw new StoneError(
        422,
        'media_unavailable',
        'Each image needs a description and a valid file.',
      );
    const copies = [];
    let commitAttempted = false;
    try {
      const needsPromotion = media.filter(
        (m) =>
          m.status !== 'published' ||
          (m.source_kind === 'storage' && m.bucket !== 'urblo-public-media'),
      );
      const promotions = await prepareMediaPromotions(
        client,
        needsPromotion,
        copies,
        crypto.randomUUID(),
        'stone-assets',
      );
      for (const asset of media.filter((m) => !needsPromotion.includes(m)))
        promotions.push({
          promotionKind: 'reference_check',
          mediaAssetId: asset.id,
          sourceUpdatedAt: asset.updated_at,
          sourceKind: asset.source_kind,
          sourceBucket: asset.bucket,
          sourcePath: asset.object_path,
          sourceUrl: asset.source_url,
        });
      commitAttempted = true;
      const result = await rpc(client, actor, body, 'publish', promotions);
      if (result.replayed && copies.length)
        await compensatePublicCopies(client, copies);
      if (result.stones) {
        const ids = [
          ...new Set(result.stones.map((s) => s.coverMediaId).filter(Boolean)),
        ];
        const covers = new Map();
        for (let start = 0; start < ids.length; start += 100) {
          const { data } = await client
            .from('media_assets')
            .select(mediaSelect)
            .in('id', ids.slice(start, start + 100))
            .neq('status', 'archived');
          for (const a of data || [])
            covers.set(a.id, (await mediaPresentation(client, a)).url);
        }
        result.stones = result.stones.map(({ coverMediaId, ...s }) => ({
          ...s,
          cover: covers.get(coverMediaId) || null,
        }));
      }
      return stoneResponse(result);
    } catch (error) {
      // Unknown commit outcomes retain copies. Retry the SAME request to read the receipt.
      const definiteRollback =
        !commitAttempted || (error instanceof StoneError && error.status < 500);
      let cleanup = {
        removed: [],
        retained: copies.map((c) => ({
          path: c.path,
          reason: 'outcome_uncertain',
        })),
      };
      if (definiteRollback) {
        try {
          cleanup = await compensatePublicCopies(client, copies);
        } catch { /* Preserve the original error and retain uncertain files. */ }
      }
      if (copies.length) {
        try {
          await client
            .from('admin_audit_events')
            .insert({
              actor_user_id: actor.id,
              action: 'stone.aggregate.publish_compensation',
              entity_type: 'stone_groups',
              entity_id: String(body.stoneId),
              metadata: { requestId: body.requestId, ...cleanup },
            });
        } catch { /* Preserve the original error and retain uncertain files. */ }
      }
      if (error instanceof StoneError) throw error;
      if (!commitAttempted)
        throw new StoneError(
          422,
          'media_preparation_failed',
          'An image could not be prepared for publication. The stone was not published. Check the selected files (10 MB per image, 100 MB total) and retry.',
        );
      throw new StoneError(
        502,
        'publish_uncertain',
        'Publication could not be confirmed. Your draft and original images are retained. Retry to check the result.',
      );
    }
  } catch (error) {
    if (error instanceof StoneError)
      return stoneResponse(
        { error: error.code, message: error.message, ...error.details },
        error.status,
      );
    return stoneResponse(
      {
        error: 'stone_failed',
        message:
          'Stone Library could not complete this request. Your edits are retained; try again.',
      },
      500,
    );
  }
}
