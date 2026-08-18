#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cwd, exit } from 'node:process';
import { join } from 'node:path';
import {
  adminImageQrMethodNotAllowedResponse,
  adminImageQrOptionsResponse,
  handleAdminImageQrRequest,
  handlePublicImageQrRequest,
} from '../functions/_lib/admin-image-qr.js';

const root = cwd();
const failures = [];

function read(path) {
  try {
    return readFileSync(join(root, path), 'utf8');
  } catch {
    failures.push(`Missing file: ${path}`);
    return '';
  }
}

function requireIncludes(text, value, label) {
  if (!text.includes(value)) failures.push(`${label}: missing ${value}`);
}

async function run() {
  const page = read('src/pages/admin/AdminImageQrPage.tsx');
  const optimizer = read('src/lib/imageQrOptimization.ts');
  const app = read('src/pages/admin/AdminApp.tsx');
  const content = read('src/pages/admin/adminContent.ts');
  const server = read('functions/_lib/admin-image-qr.js');
  const publicRoute = read('functions/image/[slug].js');
  const migration = read('supabase/migrations/20260818070944_image_qr_resources.sql');

  for (const value of [
    'multiple',
    'onDrop={handleDrop}',
    'optimizeImageForQr',
    'One image, one permanent QR',
    "action: 'create'",
    "action: 'replace'",
    "runAction('rename'",
    "runAction(isActive ? 'hide' : 'restore')",
    'QRCodeSVG',
    'QRCodeCanvas',
    'downloadPng',
    'downloadSvg',
    'Copy link',
    'The QR is unchanged',
  ]) requireIncludes(page, value, 'AdminImageQrPage');

  for (const value of [
    'imageQrMaximumLongEdge = 2560',
    'imageQrWebpQuality = 0.9',
    "canvas.toBlob",
    "'image/webp'",
    'file.size <= webp.size',
  ]) requireIncludes(optimizer, value, 'imageQrOptimization');

  requireIncludes(app, "path=\"image-qr\"", 'AdminApp route');
  requireIncludes(content, "key: 'image-qr'", 'Admin navigation');

  for (const value of [
    'getBearerToken(request)',
    'requireAdminActor',
    "profile.role === 'viewer'",
    "image-qr-drafts/${userId}/",
    'uploadPublicObject',
    "from('image_qr_resources')",
    "from('admin_audit_events')",
    "'image_qr.create'",
    "'image_qr.replace'",
    '`image_qr.${input.action}`',
    "status: 302",
    "'Cache-Control': 'no-store'",
  ]) requireIncludes(server, value, 'Image QR server boundary');

  requireIncludes(publicRoute, "['GET', 'HEAD']", 'Public image route methods');
  requireIncludes(publicRoute, 'handlePublicImageQrRequest', 'Public image route handler');

  for (const value of [
    'create table public.image_qr_resources',
    'alter table public.image_qr_resources enable row level security',
    'revoke all on table public.image_qr_resources from anon, authenticated',
    'grant select, insert, update, delete on table public.image_qr_resources to service_role',
    "check (status in ('active', 'hidden'))",
    'object_path text not null unique',
  ]) requireIncludes(migration, value, 'Image QR migration');

  assert.equal((await adminImageQrOptionsResponse()).status, 204);
  assert.equal((await adminImageQrMethodNotAllowedResponse()).status, 405);

  for (const method of ['GET', 'POST']) {
    const response = await handleAdminImageQrRequest(
      new Request('https://example.test/api/admin/image-qr', { method }),
      {},
    );
    const payload = await response.json();
    assert.equal(response.status, 401);
    assert.equal(payload.error, 'missing_session');
  }

  const invalidPublic = await handlePublicImageQrRequest(
    new Request('https://example.test/image/%20'),
    {},
    ' ',
  );
  assert.equal(invalidPublic.status, 404);

  if (failures.length) {
    console.error('Admin Image QR checks failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    exit(1);
  }
  console.log('Admin Image QR checks passed. No Supabase or Storage writes were attempted.');
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
});
