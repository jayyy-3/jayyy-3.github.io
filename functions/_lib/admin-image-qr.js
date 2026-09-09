import { createClient } from '@supabase/supabase-js';
import { defaultQrMaterialForName, listQrMaterialOptions, sameQrMaterial, validateQrMaterialShape } from './image-qr-materials.js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const PRIVATE_MEDIA_BUCKET = 'urblo-admin-media';
const PUBLIC_MEDIA_BUCKET = 'urblo-public-media';
const PUBLIC_SITE_ORIGIN = 'https://urblo.com.au';
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_ROLES = new Set(['owner', 'admin', 'editor', 'viewer']);
const MAX_OPTIMIZED_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_NAME_LENGTH = 160;

class AdminImageQrError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function adminImageQrOptionsResponse() {
  return jsonResponse({}, { status: 204 });
}

export function adminImageQrMethodNotAllowedResponse() {
  return jsonResponse(
    { error: 'method_not_allowed', message: 'Use GET or POST for Image QR.' },
    { status: 405 },
  );
}

export async function handleAdminImageQrRequest(request, env) {
  try {
    const accessToken = getBearerToken(request);
    const supabase = createServiceClient(getSupabaseConfig(env));
    const actor = await requireAdminActor(supabase, accessToken);

    if (request.method === 'GET') {
      if (new URL(request.url).searchParams.get('materials') === '1') {
        return jsonResponse({ materials: await listQrMaterialOptions(supabase) });
      }
      return jsonResponse(await listResources(supabase, request));
    }
    if (actor.profile.role === 'viewer') {
      throw new AdminImageQrError(403, 'read_only', 'This account can view Image QR but cannot change it.');
    }

    const input = await parsePostInput(request);
    if (input.action === 'create') {
      return jsonResponse(await createResource(supabase, actor, input, request), { status: 201 });
    }
    if (input.action === 'assign-material') {
      return jsonResponse(await assignMaterial(supabase, actor, input));
    }
    if (input.action === 'replace') {
      return jsonResponse(await replaceResource(supabase, actor, input, request));
    }
    if (input.action === 'rename') {
      return jsonResponse(await renameResource(supabase, actor, input, request));
    }
    if (input.action === 'hide' || input.action === 'restore') {
      return jsonResponse(await changeVisibility(supabase, actor, input, request));
    }
    throw new AdminImageQrError(400, 'invalid_action', 'Choose a valid Image QR action.');
  } catch (error) {
    if (error instanceof AdminImageQrError) {
      return jsonResponse({ error: error.code, message: error.message }, { status: error.status });
    }
    console.error('Image QR request failed.', error);
    return jsonResponse(
      { error: 'image_qr_failed', message: 'Image QR could not complete that change. Try again.' },
      { status: 500 },
    );
  }
}

async function publicResource(env, rawSlug) {
  const slug = normalizeSlug(rawSlug);
  if (!slug) return null;
  const supabase = createServiceClient(getSupabaseConfig(env));
  const { data: resource, error } = await supabase.from('image_qr_resources')
    .select('*').eq('slug', slug).eq('status', 'active').maybeSingle();
  if (error) throw error;
  if (!resource) return null;
  // Deliberately omit IDs, history, actor IDs, original paths and hidden rows.
  return {
    slug: resource.slug,
    name: resource.name,
    productImageUrl: storagePublicUrl(supabase, resource.object_path, resource.updated_at),
    materialSelection: resource.material_selection || defaultQrMaterialForName(resource.name),
  };
}

export async function handlePublicImageQrDataRequest(request, env, rawSlug) {
  try {
    const resource = await publicResource(env, rawSlug);
    const response = jsonResponse(resource ? { resource } : { error: 'not_found', message: 'This image link is unavailable.' }, { status: resource ? 200 : 404 });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch (error) {
    console.error('Public Image QR resolution failed.', error);
    const response = jsonResponse({ error: 'unavailable', message: 'This image link is temporarily unavailable.' }, { status: 503 });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return request.method === 'HEAD' ? new Response(null, response) : response;
  }
}

export async function handlePublicImageQrRequest(request, env, rawSlug) {
  try {
    const resource = await publicResource(env, rawSlug);
    if (!resource) return publicQrErrorPage(request, 404);
    // ASSETS uses the root pretty path so Pages does not redirect /index.html.
    const shell = await env.ASSETS.fetch(new Request(new URL('/', request.url), { method: 'GET' }));
    if (!shell.ok || !(shell.headers.get('content-type') || '').includes('text/html')) throw new Error('QR page shell unavailable');
    const payload = JSON.stringify(resource).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    const html = (await shell.text()).replace('</head>', `<meta name="robots" content="noindex,nofollow"><script type="application/json" id="image-qr-data">${payload}</script></head>`);
    return new Response(request.method === 'HEAD' ? null : html, { headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    } });
  } catch (error) {
    console.error('Public Image QR resolution failed.', error);
    return publicQrErrorPage(request, 503);
  }
}

function publicQrErrorPage(request, status) {
  const title = status === 404 ? 'This image link is unavailable' : 'Please try again shortly';
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} | Urblo</title><body style="margin:0;padding:32px;font-family:Arial,sans-serif;color:#000;background:#fff"><a href="/"><img src="/media/launch/identity/urblo-logo.png" alt="Urblo" width="72"></a><main style="max-width:480px;margin:64px auto"><h1>${title}</h1><p>${status === 404 ? 'The link may have been paused. Contact Urblo for help with this material.' : 'The material page could not load. Refresh this page or contact Urblo.'}</p><a href="/stone-library">Stone Library</a> · <a href="/contact">Contact Urblo</a></main></body></html>`;
  return new Response(request.method === 'HEAD' ? null : html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' } });
}

async function assignMaterial(supabase, actor, input) {
  const current = await loadResource(supabase, input.id);
  const options = await listQrMaterialOptions(supabase);
  if (!options.some((option) => sameQrMaterial(option, input.selection))) {
    throw new AdminImageQrError(400, 'invalid_material', 'Choose a public stone and a supported finish with a surface image.');
  }
  const { data: resource, error } = await supabase.from('image_qr_resources')
    .update({ material_selection: input.selection, updated_by: actor.user.id })
    .eq('id', input.id).eq('updated_at', input.expectedUpdatedAt).select('*').maybeSingle();
  if (error) throw upstream('material_save_failed', 'The stone selection could not be saved. Try again.', error);
  if (!resource) throw new AdminImageQrError(409, 'conflict', 'This resource changed elsewhere. Close these details and refresh the list before saving again.');
  const auditError = await recordAudit(supabase, actor.user.id, 'image_qr.assign_material', resource, {
    previousSelection: current.material_selection || null, selection: input.selection,
  });
  return { resource: serializeResource(supabase, null, resource), warning: auditError ? 'The selection was saved, but its change-history entry could not be recorded.' : null };
}

async function listResources(supabase, request) {
  const { data, error } = await supabase
    .from('image_qr_resources')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500);
  if (error) throw upstream('resource_list_failed', 'The Image QR library could not be loaded.', error);
  return {
    resources: (data || []).map((row) => serializeResource(supabase, request, row)),
  };
}

async function createResource(supabase, actor, input, request) {
  const upload = await readPrivateUpload(supabase, actor.user.id, input.upload);
  const slug = await createUniqueSlug(supabase, input.name);
  const destinationPath = publicDestination(slug, input.upload.mimeType);
  await uploadPublicObject(supabase, destinationPath, upload.blob, input.upload.mimeType);

  const { data: resource, error } = await supabase
    .from('image_qr_resources')
    .insert({
      slug,
      name: input.name,
      status: 'active',
      object_path: destinationPath,
      mime_type: input.upload.mimeType,
      width_px: input.upload.width,
      height_px: input.upload.height,
      size_bytes: upload.blob.size,
      created_by: actor.user.id,
      updated_by: actor.user.id,
    })
    .select('*')
    .single();

  if (error || !resource) {
    await removeStorageObject(supabase, PUBLIC_MEDIA_BUCKET, destinationPath);
    throw upstream('resource_create_failed', 'The image was uploaded but its QR resource could not be created.', error);
  }

  const auditError = await recordAudit(supabase, actor.user.id, 'image_qr.create', resource, {
    objectPath: destinationPath,
    optimizedBytes: upload.blob.size,
  });
  if (auditError) {
    await supabase.from('image_qr_resources').delete().eq('id', resource.id);
    await removeStorageObject(supabase, PUBLIC_MEDIA_BUCKET, destinationPath);
    throw new AdminImageQrError(502, 'audit_failed', 'The QR resource could not be recorded safely. Please try again.');
  }

  const privateCleanupError = await removeStorageObject(supabase, PRIVATE_MEDIA_BUCKET, input.upload.objectPath);
  return {
    resource: serializeResource(supabase, request, resource),
    warning: privateCleanupError ? 'The QR is ready, but a private temporary upload needs cleanup.' : null,
  };
}

async function replaceResource(supabase, actor, input, request) {
  const current = await loadResource(supabase, input.id);
  const upload = await readPrivateUpload(supabase, actor.user.id, input.upload);
  const destinationPath = publicDestination(current.slug, input.upload.mimeType);
  await uploadPublicObject(supabase, destinationPath, upload.blob, input.upload.mimeType);

  const { data: resource, error } = await supabase
    .from('image_qr_resources')
    .update({
      object_path: destinationPath,
      mime_type: input.upload.mimeType,
      width_px: input.upload.width,
      height_px: input.upload.height,
      size_bytes: upload.blob.size,
      updated_by: actor.user.id,
    })
    .eq('id', current.id)
    .select('*')
    .single();
  if (error || !resource) {
    await removeStorageObject(supabase, PUBLIC_MEDIA_BUCKET, destinationPath);
    throw upstream('resource_replace_failed', 'The replacement image could not be saved.', error);
  }

  const auditError = await recordAudit(supabase, actor.user.id, 'image_qr.replace', resource, {
    previousObjectPath: current.object_path,
    objectPath: destinationPath,
    optimizedBytes: upload.blob.size,
  });
  if (auditError) {
    await restoreResource(supabase, current, actor.user.id);
    await removeStorageObject(supabase, PUBLIC_MEDIA_BUCKET, destinationPath);
    throw new AdminImageQrError(502, 'audit_failed', 'The replacement could not be recorded safely. Please try again.');
  }

  const [oldCleanupError, privateCleanupError] = await Promise.all([
    removeStorageObject(supabase, PUBLIC_MEDIA_BUCKET, current.object_path),
    removeStorageObject(supabase, PRIVATE_MEDIA_BUCKET, input.upload.objectPath),
  ]);
  return {
    resource: serializeResource(supabase, request, resource),
    warning: oldCleanupError || privateCleanupError ? 'The new image is ready, but an older stored file needs cleanup.' : null,
  };
}

async function renameResource(supabase, actor, input, request) {
  const current = await loadResource(supabase, input.id);
  const resource = await updateResourceWithAudit(
    supabase,
    actor,
    current,
    { name: input.name, updated_by: actor.user.id },
    'image_qr.rename',
    { previousName: current.name, name: input.name },
  );
  return { resource: serializeResource(supabase, request, resource), warning: null };
}

async function changeVisibility(supabase, actor, input, request) {
  const current = await loadResource(supabase, input.id);
  const status = input.action === 'hide' ? 'hidden' : 'active';
  const resource = await updateResourceWithAudit(
    supabase,
    actor,
    current,
    { status, updated_by: actor.user.id },
    `image_qr.${input.action}`,
    { previousStatus: current.status, status },
  );
  return { resource: serializeResource(supabase, request, resource), warning: null };
}

async function updateResourceWithAudit(supabase, actor, current, changes, action, metadata) {
  const { data: resource, error } = await supabase
    .from('image_qr_resources')
    .update(changes)
    .eq('id', current.id)
    .select('*')
    .single();
  if (error || !resource) throw upstream('resource_update_failed', 'The QR resource could not be updated.', error);
  const auditError = await recordAudit(supabase, actor.user.id, action, resource, metadata);
  if (auditError) {
    await restoreResource(supabase, current, actor.user.id);
    throw new AdminImageQrError(502, 'audit_failed', 'The change could not be recorded safely. Please try again.');
  }
  return resource;
}

async function restoreResource(supabase, resource, userId) {
  return supabase
    .from('image_qr_resources')
    .update({
      name: resource.name,
      status: resource.status,
      object_path: resource.object_path,
      mime_type: resource.mime_type,
      width_px: resource.width_px,
      height_px: resource.height_px,
      size_bytes: resource.size_bytes,
      updated_by: userId,
    })
    .eq('id', resource.id);
}

async function loadResource(supabase, id) {
  const { data, error } = await supabase
    .from('image_qr_resources')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw upstream('resource_lookup_failed', 'The QR resource could not be loaded.', error);
  if (!data) throw new AdminImageQrError(404, 'not_found', 'That QR resource no longer exists.');
  return data;
}

async function readPrivateUpload(supabase, userId, upload) {
  const requiredPrefix = `image-qr-drafts/${userId}/`;
  if (!upload.objectPath.startsWith(requiredPrefix)) {
    throw new AdminImageQrError(403, 'invalid_upload_owner', 'That temporary upload does not belong to this session.');
  }
  const { data: blob, error } = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).download(upload.objectPath);
  if (error || !blob) throw upstream('upload_unavailable', 'The optimized upload could not be read.', error);
  if (blob.size <= 0 || blob.size > MAX_OPTIMIZED_IMAGE_BYTES || blob.size !== upload.sizeBytes) {
    throw new AdminImageQrError(400, 'invalid_upload_size', 'The optimized image size could not be verified.');
  }
  const detectedMimeType = await detectSupportedImageMime(blob);
  if (!detectedMimeType || detectedMimeType !== upload.mimeType) {
    throw new AdminImageQrError(400, 'invalid_image', 'The uploaded file is not a supported image.');
  }
  return { blob };
}

async function uploadPublicObject(supabase, path, blob, mimeType) {
  const { error } = await supabase.storage.from(PUBLIC_MEDIA_BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw upstream('public_upload_failed', 'The optimized image could not be made available.', error);
}

async function removeStorageObject(supabase, bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error('Image QR Storage cleanup failed.', { bucket, path, error });
  return error || null;
}

async function recordAudit(supabase, actorUserId, action, resource, metadata) {
  const { error } = await supabase.from('admin_audit_events').insert({
    actor_user_id: actorUserId,
    action,
    entity_type: 'image_qr_resources',
    entity_id: null,
    metadata: {
      resourceId: resource.id,
      slug: resource.slug,
      source: 'functions/api/admin/image-qr.js',
      ...metadata,
    },
  });
  if (error) console.error('Image QR audit failed.', error);
  return error || null;
}

async function createUniqueSlug(supabase, name) {
  const base = normalizeSlug(name) || 'image';
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const slug = `${base.slice(0, 48).replace(/-+$/, '')}-${token}`;
    const { data, error } = await supabase
      .from('image_qr_resources')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw upstream('slug_lookup_failed', 'A stable image address could not be prepared.', error);
    if (!data) return slug;
  }
  throw new AdminImageQrError(409, 'slug_unavailable', 'A unique image address could not be prepared. Try again.');
}

async function parsePostInput(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new AdminImageQrError(400, 'invalid_json', 'Send a valid Image QR request.');
  }
  const action = String(body?.action || '').trim().toLowerCase();
  if (action === 'assign-material') {
    const selection = validateQrMaterialShape(body?.selection);
    const expectedUpdatedAt = String(body?.expectedUpdatedAt || '');
    if (!selection || !expectedUpdatedAt || !Number.isFinite(Date.parse(expectedUpdatedAt))) {
      throw new AdminImageQrError(400, 'invalid_material', 'Choose a stone and finish, then try saving again.');
    }
    return { action, id: validateId(body?.id), selection, expectedUpdatedAt };
  }
  if (action === 'create') return { action, name: validateName(body?.name), upload: validateUpload(body?.upload) };
  if (action === 'replace') return { action, id: validateId(body?.id), upload: validateUpload(body?.upload) };
  if (action === 'rename') return { action, id: validateId(body?.id), name: validateName(body?.name) };
  if (action === 'hide' || action === 'restore') return { action, id: validateId(body?.id) };
  throw new AdminImageQrError(400, 'invalid_action', 'Choose create, replace, rename, assign-material, hide or restore.');
}

function validateUpload(value) {
  const objectPath = String(value?.objectPath || '').trim();
  const mimeType = String(value?.mimeType || '').trim().toLowerCase();
  const width = Number(value?.width);
  const height = Number(value?.height);
  const sizeBytes = Number(value?.sizeBytes);
  if (!objectPath || objectPath.includes('..') || /[\u0000-\u001f\\]/.test(objectPath)) {
    throw new AdminImageQrError(400, 'invalid_upload_path', 'The temporary upload path is invalid.');
  }
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new AdminImageQrError(400, 'invalid_mime_type', 'Choose a JPG, PNG, WebP or AVIF image.');
  }
  if (![width, height, sizeBytes].every((number) => Number.isInteger(number) && number > 0)) {
    throw new AdminImageQrError(400, 'invalid_upload_metadata', 'The optimized image details are incomplete.');
  }
  if (width > 2560 || height > 2560 || sizeBytes > MAX_OPTIMIZED_IMAGE_BYTES) {
    throw new AdminImageQrError(400, 'upload_not_optimized', 'The image must be optimized before it is added.');
  }
  return { objectPath, mimeType, width, height, sizeBytes };
}

function validateName(value) {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new AdminImageQrError(400, 'invalid_name', 'Enter a name up to 160 characters.');
  }
  return name;
}

function validateId(value) {
  const id = String(value || '').trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) {
    throw new AdminImageQrError(400, 'invalid_id', 'Choose a valid QR resource.');
  }
  return id;
}

function getSupabaseConfig(env) {
  const url = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) throw new AdminImageQrError(500, 'server_not_configured', 'Image QR is not configured on this deployment.');
  return { url, serviceKey };
}

function createServiceClient(config) {
  return createClient(config.url, config.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function getBearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  if (!match?.[1]) throw new AdminImageQrError(401, 'missing_session', 'Sign in before opening Image QR.');
  return match[1].trim();
}

async function requireAdminActor(supabase, accessToken) {
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) throw new AdminImageQrError(401, 'invalid_session', 'Sign in again before opening Image QR.');
  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('user_id,role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (profileError || !profile || !ALLOWED_ROLES.has(profile.role)) {
    throw new AdminImageQrError(403, 'not_allowed', 'Active Image QR access is required.');
  }
  return { user, profile };
}

function serializeResource(supabase, _request, row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    mimeType: row.mime_type,
    width: row.width_px,
    height: row.height_px,
    sizeBytes: Number(row.size_bytes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    materialSelection: row.material_selection || defaultQrMaterialForName(row.name),
    materialIsDefault: !row.material_selection,
    imageUrl: `${PUBLIC_SITE_ORIGIN}/image/${encodeURIComponent(row.slug)}`,
    previewUrl: storagePublicUrl(supabase, row.object_path, row.updated_at),
  };
}

function storagePublicUrl(supabase, path, version) {
  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
  const url = new URL(data.publicUrl);
  url.searchParams.set('v', String(version || '1'));
  return url.toString();
}

function publicDestination(slug, mimeType) {
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
  return `image-qr/${slug}/${crypto.randomUUID()}.${extension}`;
}

function normalizeSlug(value) {
  return String(Array.isArray(value) ? value[0] : value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '')
    .slice(0, 80);
}

async function detectSupportedImageMime(blob) {
  const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'image/avif';
  return null;
}

function upstream(code, message, error) {
  if (error) console.error(message, error);
  return new AdminImageQrError(502, code, message);
}

function jsonResponse(body, init = {}) {
  return new Response(init.status === 204 ? null : JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type',
      ...(init.headers || {}),
    },
  });
}

function publicTextResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': status === 404 ? 'public, max-age=60' : 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
