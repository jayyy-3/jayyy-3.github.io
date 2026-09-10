// Development fixture only: loopback HTTP, synthetic local Auth, real disposable
// Postgres/PostgREST, and a private/public filesystem Storage adapter. Never deployed.
import http from 'node:http';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { handleAdminImageQrRequest } from '../../functions/_lib/admin-image-qr.js';
import { handleStoneRequest } from '../../functions/_lib/admin-stones.js';
const port = 5417;
const origin = `http://127.0.0.1:${port}`;
const secret = 'stone-fixture-only-secret-at-least-32-bytes';
const root = path.resolve('.tmp/stone-browser-storage');
await mkdir(root, { recursive: true });
const token = (payload) => {
  const base = [{ alg: 'HS256', typ: 'JWT' }, payload]
    .map((x) => Buffer.from(JSON.stringify(x)).toString('base64url'))
    .join('.');
  return (
    base + '.' + createHmac('sha256', secret).update(base).digest('base64url')
  );
};
const anon = token({ role: 'anon', exp: 4102444800 });
const service = token({ role: 'service_role', exp: 4102444800 });
const users = {
  owner: {
    id: '00000000-0000-4000-8000-000000000091',
    email: 'stone-owner@example.invalid',
  },
  editor: {
    id: '00000000-0000-4000-8000-000000000092',
    email: 'stone-editor@example.invalid',
  },
  viewer: {
    id: '00000000-0000-4000-8000-000000000093',
    email: 'stone-viewer@example.invalid',
  },
};
function userFor(jwt) {
  try {
    const [a, b, c] = jwt.split('.');
    if (
      createHmac('sha256', secret)
        .update(a + '.' + b)
        .digest('base64url') !== c
    )
      return null;
    const claims = JSON.parse(Buffer.from(b, 'base64url'));
    return Object.values(users).find((u) => u.id === claims.sub) || null;
  } catch {
    return null;
  }
}
function session(user) {
  return {
    access_token: token({
      role: 'authenticated',
      sub: user.id,
      aud: 'authenticated',
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
    refresh_token: user.id,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      ...user,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: {},
      created_at: '2026-09-10T00:00:00Z',
    },
  };
}
const client = createClient(origin, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const vite = await createViteServer({
  server: { middlewareMode: true, host: '127.0.0.1' },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(origin),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(anon),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(anon),
  },
});
const controls = {
  delayMs: 0,
  failSave: 0,
  dropSavedResponse: 0,
  failStorageUpload: 0,
};
const writes = [];
const send = (res, body, status = 200) => {
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
};
const bodyOf = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
};
const parse = (body) => {
  try {
    return JSON.parse(body.toString());
  } catch {
    return {};
  }
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    const auth = (req.headers.authorization || '').replace(/^Bearer /, '');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (url.pathname === '/__fixture/control') {
      if (req.method === 'POST')
        Object.assign(controls, parse(await bodyOf(req)));
      send(res, { controls, writes });
      return;
    }
    if (url.pathname.startsWith('/auth/v1/')) {
      if (url.pathname.endsWith('/token')) {
        const body = parse(await bodyOf(req));
        const user = body.refresh_token
          ? Object.values(users).find((u) => u.id === body.refresh_token)
          : Object.values(users).find(
              (u) =>
                u.email === body.email && body.password === 'fixture-password',
            );
        if (!user) {
          send(
            res,
            {
              error: 'invalid_grant',
              error_description: 'Use the local fixture account.',
            },
            400,
          );
          return;
        }
        send(res, session(user));
        return;
      }
      if (url.pathname.endsWith('/user')) {
        const user = userFor(auth);
        send(
          res,
          user ? session(user).user : { message: 'Invalid fixture session' },
          user ? 200 : 401,
        );
        return;
      }
      if (url.pathname.endsWith('/logout')) {
        res.writeHead(204);
        res.end();
        return;
      }
      send(res, { message: 'Unsupported fixture auth operation' }, 400);
      return;
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      const bytes = ['GET', 'HEAD'].includes(req.method)
        ? null
        : await bodyOf(req);
      const headers = { ...req.headers };
      delete headers.host;
      delete headers.connection;
      delete headers['content-length'];
      const reply = await fetch(
        'http://127.0.0.1:57331' +
          url.pathname.replace('/rest/v1', '') +
          url.search,
        {
          method: req.method,
          headers,
          ...(bytes ? { body: bytes } : {}),
          redirect: 'manual',
        },
      );
      res.writeHead(
        reply.status,
        Object.fromEntries(
          [...reply.headers].filter(
            ([key]) => !['content-encoding', 'transfer-encoding'].includes(key),
          ),
        ),
      );
      res.end(Buffer.from(await reply.arrayBuffer()));
      return;
    }
    if (url.pathname.startsWith('/storage/v1/')) {
      const prefix = '/storage/v1/object/';
      const part = decodeURIComponent(url.pathname.slice(prefix.length));
      const bits = part.split('/');
      const mode = ['sign', 'public', 'authenticated'].includes(bits[0])
        ? bits.shift()
        : null;
      const bucket = bits.shift();
      const objectPath = bits.join('/');
      if (
        !['urblo-admin-media', 'urblo-public-media'].includes(bucket) ||
        objectPath.split('/').includes('..')
      ) {
        send(res, { message: 'Invalid storage path' }, 400);
        return;
      }
      const file = path.join(root, bucket, objectPath);
      const privileged = auth === service || !!userFor(auth);
      if (mode === 'sign' && req.method === 'POST') {
        if (!privileged) {
          send(res, { message: 'Private file' }, 403);
          return;
        }
        send(res, {
          signedURL: `/object/sign/${bucket}/${encodeURI(objectPath)}?token=fixture-signed`,
        });
        return;
      }
      if (req.method === 'GET') {
        if (
          bucket === 'urblo-admin-media' &&
          !privileged &&
          !(
            mode === 'sign' &&
            url.searchParams.get('token') === 'fixture-signed'
          )
        ) {
          send(res, { message: 'Private file' }, 403);
          return;
        }
        const bytes = await readFile(file).catch(() => null);
        if (!bytes) {
          send(res, { message: 'Object not found' }, 404);
          return;
        }
        const type = /\.png$/i.test(file)
          ? 'image/png'
          : /\.webp$/i.test(file)
            ? 'image/webp'
            : 'image/jpeg';
        res.writeHead(200, { 'content-type': type });
        res.end(bytes);
        return;
      }
      if (
        !privileged ||
        (bucket === 'urblo-public-media' && auth !== service)
      ) {
        send(res, { message: 'Storage role denied' }, 403);
        return;
      }
      if (req.method === 'POST') {
        if (controls.failStorageUpload > 0 && bucket === 'urblo-public-media') {
          controls.failStorageUpload--;
          send(res, { message: 'Injected copy failure' }, 500);
          return;
        }
        if (await stat(file).catch(() => null)) {
          send(
            res,
            {
              message: 'The resource already exists',
              statusCode: '409',
              error: 'Duplicate',
            },
            409,
          );
          return;
        }
        await mkdir(path.dirname(file), { recursive: true });
        let bytes = await bodyOf(req);
        // supabase-js sends Blob bodies as multipart in Node/browser.
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
          const form = await new Response(bytes, {
            headers: { 'content-type': contentType },
          }).formData();
          const blob = [...form.values()].find((v) => typeof v !== 'string');
          if (blob) bytes = Buffer.from(await blob.arrayBuffer());
        }
        await writeFile(file, bytes);
        send(res, { Id: randomUUID(), Key: `${bucket}/${objectPath}` });
        return;
      }
      if (req.method === 'DELETE') {
        const input = parse(await bodyOf(req));
        for (const item of input.prefixes || []) {
          if (!item.split('/').includes('..'))
            await unlink(path.join(root, bucket, item)).catch(() => {});
        }
        send(res, []);
        return;
      }
    }
    if (url.pathname === '/api/admin/stone-library') {
      const bytes = req.method === 'POST' ? await bodyOf(req) : null;
      const data = parse(bytes || Buffer.from('{}'));
      if (bytes)
        writes.push({
          action: data.action,
          requestId: data.requestId,
          stoneId: data.stoneId,
          name: data.draft?.stone?.name,
        });
      if (controls.delayMs)
        await new Promise((r) => setTimeout(r, controls.delayMs));
      if (data.action === 'save' && controls.failSave > 0) {
        controls.failSave--;
        send(res, { message: 'Injected connection failure' }, 503);
        return;
      }
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        ...(bytes ? { body: bytes } : {}),
      });
      const response = await handleStoneRequest(request, {}, { client });
      if (
        data.action === 'save' &&
        controls.dropSavedResponse > 0 &&
        response.ok
      ) {
        controls.dropSavedResponse--;
        res.destroy();
        return;
      }
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (url.pathname === '/api/admin/image-qr' && req.method === 'GET') {
      const response = await handleAdminImageQrRequest(
        new Request(url, { headers: req.headers }),
        { SUPABASE_URL: origin, SUPABASE_SERVICE_ROLE_KEY: service },
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      send(
        res,
        { message: 'This local fixture supports only Stone Library writes.' },
        503,
      );
      return;
    }
    vite.middlewares(req, res);
  } catch (error) {
    send(res, { message: error.message || 'Fixture error' }, 500);
  }
});
server.listen(port, '127.0.0.1', () =>
  console.log(
    `Stone fixture: ${origin} (local synthetic Auth; disposable PostgreSQL; filesystem Storage)`,
  ),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    server.close();
    void vite.close().then(() => process.exit());
  });
