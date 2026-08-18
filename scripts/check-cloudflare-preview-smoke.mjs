#!/usr/bin/env node
import { exit } from 'node:process';
import { normalizeBaseUrlOrigin } from './_lib/live-input-validation.mjs';

const publicRoutes = [
  '/',
  '/projects',
  '/projects/moon-gate-woolley-street',
  '/products',
  '/products/prime-block',
  '/stone-library',
  '/stone-library/alpine-white',
  '/articles',
  '/articles/modular-mastery-how-primeblock-core-transformed-aitken-college',
  '/contact',
  '/capabilities',
];

const adminRoutes = [
  '/admin',
  '/admin/login',
  '/admin/unauthorized',
  '/admin/leads',
  '/admin/media',
  '/admin/image-qr',
  '/admin/settings',
  '/admin/stone-library',
  '/admin/projects',
  '/admin/products',
  '/admin/articles',
  '/admin/audit',
];

const stateRoutes = ['/not-a-real-urblo-route'];

const redirectContracts = [
  {
    from: '/products/primeBlock',
    to: '/products/prime-block',
  },
  {
    from: '/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College',
    to: '/articles/modular-mastery-how-primeblock-core-transformed-aitken-college',
  },
  {
    from: '/contact-us',
    to: '/contact',
  },
  {
    from: '/our-capacity',
    to: '/capabilities',
  },
  {
    from: '/product/creama',
    to: '/stone-library',
  },
  {
    from: '/product-category/limestone',
    to: '/stone-library',
  },
  {
    from: '/stone-product/bollard',
    to: '/capabilities',
  },
  {
    from: '/article/discover-the-art-of-surface-finishes',
    to: '/articles/stone-transformed-8-ways-to-redefine-bluestones-look-feel',
  },
  {
    from: '/projects/xavier-college/',
    to: '/projects/xavier-college',
  },
];

const functionPaths = ['/api/enquiries', '/api/sample-requests'];
const protectedFunctionPaths = ['/api/admin/projects', '/api/admin/image-qr'];
const MAX_ASSET_GRAPH_SIZE = 200;
const JAVASCRIPT_MEDIA_TYPES = new Set([
  'application/ecmascript',
  'application/javascript',
  'text/ecmascript',
  'text/javascript',
]);

function parseArgs(argv) {
  const options = {
    baseUrl: '',
    referenceUrl: '',
    skipRedirects: false,
    skipFunctions: false,
    timeoutMs: 12_000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
      continue;
    }

    if (arg === '--reference-url') {
      options.referenceUrl = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--reference-url=')) {
      options.referenceUrl = arg.slice('--reference-url='.length);
      continue;
    }

    if (arg === '--skip-redirects') {
      options.skipRedirects = true;
      continue;
    }

    if (arg === '--skip-functions') {
      options.skipFunctions = true;
      continue;
    }

    if (arg === '--timeout-ms') {
      options.timeoutMs = Number.parseInt(argv[index + 1] || '', 10);
      index += 1;
      continue;
    }

    if (arg.startsWith('--timeout-ms=')) {
      options.timeoutMs = Number.parseInt(arg.slice('--timeout-ms='.length), 10);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.baseUrl) {
    throw new Error('Missing --base-url. Example: npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev');
  }

  options.baseUrl = normalizeBaseUrlOrigin(options.baseUrl, '--base-url');
  const targetHostname = new URL(options.baseUrl).hostname.toLowerCase().replace(/\.+$/, '');
  const movingProductionHosts = new Set(['urblo.com.au', 'www.urblo.com.au', 'urblo.pages.dev']);
  assert(
    options.referenceUrl || !movingProductionHosts.has(targetHostname),
    '--reference-url is required for production custom/default domains so the moving origin is bound to one immutable deployment',
  );
  if (options.referenceUrl) {
    options.referenceUrl = normalizeBaseUrlOrigin(options.referenceUrl, '--reference-url');
    const reference = new URL(options.referenceUrl);
    assert(
      reference.protocol === 'https:' && /^[0-9a-f]{8}\.urblo\.pages\.dev$/i.test(reference.hostname),
      '--reference-url must be the exact immutable https://<8-hex-deployment>.urblo.pages.dev origin',
    );
    assert(
      options.referenceUrl !== options.baseUrl,
      '--reference-url must be independent from --base-url; self-comparison cannot prove a deployment',
    );
  }

  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1000) {
    throw new Error('--timeout-ms must be an integer >= 1000');
  }

  const parsed = new URL(options.baseUrl);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  options.isLocalBaseUrl = localHosts.has(parsed.hostname);
  return options;
}

async function timedFetch(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    return await fetch(url, {
      ...options.fetch,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(path, options, init = {}) {
  const response = await timedFetch(`${options.baseUrl}${path}`, {
    ...options,
    fetch: init,
  });
  const text = await response.text();
  return { response, text };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertHtmlShell(path, response, html) {
  assert(!response.redirected, `${path} unexpectedly redirected to ${response.url}`);
  assert(response.status === 200, `${path} returned ${response.status}, expected 200`);

  const contentType = response.headers.get('content-type') || '';
  assert(contentType.includes('text/html'), `${path} returned non-HTML content type: ${contentType}`);
  assert(html.includes('<div id="root"></div>'), `${path} did not return the React root shell`);
  assert(/\/assets\/[^"']+\.js/.test(html), `${path} HTML is missing Vite JS asset references`);
}

function collectAssetPaths(html) {
  const paths = new Set();
  for (const match of html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)) {
    paths.add(normalizeAssetPath(match[1]));
  }
  return [...paths].filter(Boolean);
}

function collectReferencedAssetPaths(text, parentAssetPath) {
  const paths = new Set();
  for (const match of text.matchAll(
    /["'`]((?:(?:https?:)?\/\/[^"'`]*?\/assets\/|\.{1,2}\/|\/?assets\/)[^"'`]+?\.(?:js|css)(?:[?#][^"'`]*)?)["'`]/g,
  )) {
    paths.add(normalizeAssetPath(match[1], parentAssetPath));
  }
  return [...paths].filter(Boolean);
}

function normalizeAssetPath(rawPath, parentAssetPath = '/') {
  if (!rawPath) return '';
  const candidate = rawPath.trim();
  assert(!/^[a-z][a-z\d+.-]*:/i.test(candidate), `Asset references must be same-origin paths, not absolute URLs: ${rawPath}`);
  assert(!candidate.startsWith('//'), `Asset references must not use protocol-relative URLs: ${rawPath}`);

  let resolved;
  if (candidate.startsWith('./') || candidate.startsWith('../')) {
    resolved = new URL(candidate, `https://urblo.invalid${parentAssetPath}`);
  } else if (candidate.startsWith('/')) {
    resolved = new URL(candidate, 'https://urblo.invalid');
  } else {
    assert(candidate.startsWith('assets/'), `Asset reference escaped the /assets/ namespace: ${rawPath}`);
    resolved = new URL(`/${candidate}`, 'https://urblo.invalid');
  }
  assert(!resolved.search && !resolved.hash, `Asset references must not use query strings or fragments: ${rawPath}`);
  assert(resolved.pathname.startsWith('/assets/'), `Asset reference escaped the /assets/ namespace: ${rawPath}`);
  return resolved.pathname;
}

async function checkHtmlRoutes(options) {
  const allRoutes = [...publicRoutes, ...adminRoutes, ...stateRoutes];
  let rootHtml = '';
  let rootAssetIdentity = [];

  for (const route of allRoutes) {
    const { response, text } = await fetchText(route, options);
    assertHtmlShell(route, response, text);
    const routeAssetIdentity = collectAssetPaths(text).sort();
    if (route === '/') {
      rootHtml = text;
      rootAssetIdentity = routeAssetIdentity;
    } else {
      assert(
        JSON.stringify(routeAssetIdentity) === JSON.stringify(rootAssetIdentity),
        `${route} HTML asset identity differs from the root shell: route=${routeAssetIdentity.join(',')} root=${rootAssetIdentity.join(',')}`,
      );
    }
    console.log(`route ok: ${route}`);
  }

  return rootHtml;
}

async function checkDeploymentReference(rootHtml, options) {
  if (!options.referenceUrl) return;

  const response = await timedFetch(`${options.referenceUrl}/`, options);
  const referenceHtml = await response.text();
  assertHtmlShell(`${options.referenceUrl}/`, response, referenceHtml);

  const targetAssets = collectAssetPaths(rootHtml).sort();
  const referenceAssets = collectAssetPaths(referenceHtml).sort();
  assert(
    JSON.stringify(targetAssets) === JSON.stringify(referenceAssets),
    `Root asset identity does not match reference deployment ${options.referenceUrl}: target=${targetAssets.join(',')} reference=${referenceAssets.join(',')}`,
  );

  console.log(`deployment reference ok: ${options.referenceUrl}`);
}

async function checkAssets(html, options) {
  const queue = collectAssetPaths(html);
  const seen = new Set();
  const jsAssetTexts = new Map();
  const cacheWarnings = [];
  assert(queue.length > 0, 'No /assets/ references found in root HTML');
  assert(queue.length <= MAX_ASSET_GRAPH_SIZE, `Initial asset graph exceeds ${MAX_ASSET_GRAPH_SIZE} entries`);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path || seen.has(path)) continue;
    seen.add(path);

    const response = await timedFetch(`${options.baseUrl}${path}`, options);
    assert(response.status === 200, `${path} returned ${response.status}, expected 200`);
    if (path.endsWith('.js') || path.endsWith('.css')) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      const text = new TextDecoder().decode(bytes);
      assertAssetContentType(path, response, text);
      if (options.referenceUrl) {
        await verifyAssetAgainstReference(path, response, bytes, options);
      }
      if (hasRemovedLongLivedCachePolicy(response)) {
        assert(
          options.referenceUrl,
          `${path} still exposes the removed long-lived custom cache policy; rerun with --reference-url to prove the cached bytes and MIME match the immutable deployment`,
        );
        const cacheControl = response.headers.get('cache-control') || '';
        cacheWarnings.push(`${path}: ${cacheControl}`);
        console.warn(
          `asset cache warning: ${path} still exposes ${cacheControl}, but its bytes and MIME exactly match ${options.referenceUrl}`,
        );
      }
      if (path.endsWith('.js')) {
        jsAssetTexts.set(path, text);
      }
      for (const discoveredPath of collectReferencedAssetPaths(text, path)) {
        if (seen.has(discoveredPath) || queue.includes(discoveredPath)) continue;
        assert(
          queue.length + seen.size < MAX_ASSET_GRAPH_SIZE,
          `Deployed asset graph exceeds the ${MAX_ASSET_GRAPH_SIZE}-entry verification budget`,
        );
        queue.push(discoveredPath);
      }
    }
    console.log(`asset ok: ${path}`);
  }

  checkDeployedBundleContracts(jsAssetTexts);
  if (cacheWarnings.length > 0) {
    console.warn(
      `asset cache warning summary: ${cacheWarnings.length} current asset(s) retain stale response headers; source policy removal remains enforced and bytes/MIME matched the immutable reference`,
    );
  }
}

function assertAssetContentType(path, response, text) {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const mediaType = contentType.split(';', 1)[0].trim();
  const normalizedBody = text.trimStart();
  const normalizedPrefix = normalizedBody.slice(0, 1024).toLowerCase();
  const isHtmlFallback =
    normalizedPrefix.startsWith('<!doctype html') ||
    normalizedPrefix.startsWith('<html') ||
    normalizedPrefix.includes('<div id="root"></div>');

  assert(!response.redirected, `${path} unexpectedly redirected to ${response.url}`);
  assert(normalizedBody.length > 0, `${path} returned an empty asset body`);
  assert(!isHtmlFallback, `${path} returned the SPA HTML shell instead of the requested asset`);

  if (path.endsWith('.js')) {
    assert(
      JAVASCRIPT_MEDIA_TYPES.has(mediaType),
      `${path} returned non-JavaScript content type: ${mediaType || '(missing)'}`,
    );
    return;
  }

  assert(mediaType === 'text/css', `${path} returned non-CSS content type: ${mediaType || '(missing)'}`);
}

function hasRemovedLongLivedCachePolicy(response) {
  const cacheControl = (response.headers.get('cache-control') || '').toLowerCase();
  return cacheControl.includes('immutable') || /max-age=(?:31536000|31556952)\b/.test(cacheControl);
}

async function verifyAssetAgainstReference(path, targetResponse, targetBytes, options) {
  const referenceResponse = await timedFetch(`${options.referenceUrl}${path}`, options);
  assert(
    referenceResponse.status === 200,
    `${path} reference deployment returned ${referenceResponse.status}`,
  );
  const referenceBytes = new Uint8Array(await referenceResponse.arrayBuffer());
  const referenceText = new TextDecoder().decode(referenceBytes);
  assertAssetContentType(`${options.referenceUrl}${path}`, referenceResponse, referenceText);

  const targetMediaType = (targetResponse.headers.get('content-type') || '').toLowerCase().split(';', 1)[0].trim();
  const referenceMediaType = (referenceResponse.headers.get('content-type') || '')
    .toLowerCase()
    .split(';', 1)[0]
    .trim();
  assert(
    targetMediaType === referenceMediaType,
    `${path} MIME ${targetMediaType || '(missing)'} does not match reference MIME ${referenceMediaType || '(missing)'}`,
  );
  assert(
    bytesEqual(targetBytes, referenceBytes),
    `${path} bytes do not match the immutable reference deployment`,
  );
}

function bytesEqual(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((value, index) => value === right[index]);
}

function checkDeployedBundleContracts(jsAssetTexts) {
  assert(jsAssetTexts.size > 0, 'No deployed JS asset text was available for bundle contract checks');

  const combinedJs = [...jsAssetTexts.values()].join('\n');
  assert(
    combinedJs.includes('Configuration required'),
    'Deployed JS bundle is missing the /admin configuration-required state copy',
  );
  assert(
    combinedJs.includes('admin_profiles'),
    'Deployed JS bundle is missing the admin profile gate contract marker',
  );

  const forbiddenBrowserSecretPatterns = [
    /VITE_SUPABASE_SERVICE(?:_ROLE)?_KEY/,
    /import\.meta\.env\.(?:VITE_)?SUPABASE_SERVICE(?:_ROLE)?_KEY/,
    /process\.env\.(?:VITE_)?SUPABASE_SERVICE(?:_ROLE)?_KEY/,
    /(?:import\.meta\.env|process\.env)\[['"`](?:VITE_)?SUPABASE_SERVICE(?:_ROLE)?_KEY['"`]\]/,
  ];

  for (const pattern of forbiddenBrowserSecretPatterns) {
    assert(
      !pattern.test(combinedJs),
      `Deployed browser JS includes forbidden service-role exposure pattern: ${pattern}`,
    );
  }

  console.log('bundle contract ok: admin config gate and browser secret boundary');
}

async function checkRedirects(options) {
  if (options.skipRedirects || options.isLocalBaseUrl) {
    console.log('redirect checks skipped.');
    return;
  }

  for (const contract of redirectContracts) {
    const response = await timedFetch(`${options.baseUrl}${contract.from}`, {
      ...options,
      fetch: {
        redirect: 'manual',
      },
    });
    assert(
      response.status === 301 || response.status === 302,
      `${contract.from} returned ${response.status}, expected 301/302 redirect`,
    );

    const location = response.headers.get('location') || '';
    const locationPath = location.startsWith('http') ? new URL(location).pathname : location;
    assert(
      locationPath === contract.to,
      `${contract.from} redirected to ${location || '(missing location)'}, expected ${contract.to}`,
    );
    console.log(`redirect ok: ${contract.from} -> ${contract.to}`);
  }
}

async function expectJson(response, context) {
  const contentType = response.headers.get('content-type') || '';
  assert(contentType.includes('application/json'), `${context} returned non-JSON content type: ${contentType}`);

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${context} returned invalid JSON: ${text.slice(0, 160)}`);
  }
}

async function checkFunctionPath(path, options) {
  const getResponse = await timedFetch(`${options.baseUrl}${path}`, options);
  const getJson = await expectJson(getResponse, `${path} GET`);
  assert(getResponse.status === 405, `${path} GET returned ${getResponse.status}, expected 405`);
  assert(getJson?.error?.code === 'method_not_allowed', `${path} GET returned unexpected error code`);

  const optionsResponse = await timedFetch(`${options.baseUrl}${path}`, {
    ...options,
    fetch: {
      method: 'OPTIONS',
    },
  });
  assert(optionsResponse.status === 204, `${path} OPTIONS returned ${optionsResponse.status}, expected 204`);
  assert(
    (optionsResponse.headers.get('access-control-allow-methods') || '').includes('POST'),
    `${path} OPTIONS is missing POST in access-control-allow-methods`,
  );
  assert(
    (optionsResponse.headers.get('access-control-allow-headers') || '').includes('content-type'),
    `${path} OPTIONS is missing content-type in access-control-allow-headers`,
  );

  const malformedPost = await timedFetch(`${options.baseUrl}${path}`, {
    ...options,
    fetch: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{',
    },
  });
  const malformedJson = await expectJson(malformedPost, `${path} malformed POST`);
  assert(malformedPost.status === 400, `${path} malformed POST returned ${malformedPost.status}, expected 400`);
  assert(
    malformedJson?.error?.code === 'invalid_json',
    `${path} malformed POST returned unexpected error code`,
  );

  const invalidPost = await timedFetch(`${options.baseUrl}${path}`, {
    ...options,
    fetch: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    },
  });
  const postJson = await expectJson(invalidPost, `${path} invalid POST`);
  assert(invalidPost.status === 400, `${path} invalid POST returned ${invalidPost.status}, expected 400`);
  assert(
    postJson?.error?.code === 'validation_failed',
    `${path} invalid POST returned unexpected error code`,
  );

  console.log(`function ok: ${path}`);
}

async function checkProtectedFunctionPath(path, options) {
  for (const method of ['GET', 'POST']) {
    const response = await timedFetch(`${options.baseUrl}${path}`, {
      ...options,
      fetch: {
        method,
        headers: method === 'POST' ? { 'content-type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify({ action: 'save' }) : undefined,
      },
    });
    const payload = await expectJson(response, `${path} unauthenticated ${method}`);
    assert(response.status === 401, `${path} unauthenticated ${method} returned ${response.status}, expected 401`);
    assert(
      Boolean(payload?.error || payload?.error?.code),
      `${path} unauthenticated ${method} returned no structured error`,
    );
  }

  const optionsResponse = await timedFetch(`${options.baseUrl}${path}`, {
    ...options,
    fetch: { method: 'OPTIONS' },
  });
  assert(optionsResponse.status === 204, `${path} OPTIONS returned ${optionsResponse.status}, expected 204`);
  const allowedMethods = (optionsResponse.headers.get('access-control-allow-methods') || '').toUpperCase();
  assert(allowedMethods.includes('GET'), `${path} OPTIONS is missing GET in access-control-allow-methods`);
  assert(allowedMethods.includes('POST'), `${path} OPTIONS is missing POST in access-control-allow-methods`);
  const allowedHeaders = (optionsResponse.headers.get('access-control-allow-headers') || '').toLowerCase();
  assert(allowedHeaders.includes('authorization'), `${path} OPTIONS is missing authorization in access-control-allow-headers`);
  assert(allowedHeaders.includes('content-type'), `${path} OPTIONS is missing content-type in access-control-allow-headers`);

  console.log(`protected function boundary ok: ${path}`);
}

async function checkFunctions(options) {
  if (options.skipFunctions || options.isLocalBaseUrl) {
    console.log('function checks skipped.');
    return;
  }

  for (const path of functionPaths) {
    await checkFunctionPath(path, options);
  }

  for (const path of protectedFunctionPaths) {
    await checkProtectedFunctionPath(path, options);
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  console.log('Cloudflare preview smoke starting.');
  console.log(`Base URL: ${options.baseUrl}`);
  if (options.referenceUrl) {
    console.log(`Reference deployment: ${options.referenceUrl}`);
  }
  if (options.isLocalBaseUrl) {
    console.log('Local base URL detected; Cloudflare-only redirect and Function checks will be skipped.');
  }

  const rootHtml = await checkHtmlRoutes(options);
  await checkDeploymentReference(rootHtml, options);
  await checkAssets(rootHtml, options);
  await checkRedirects(options);
  await checkFunctions(options);

  console.log('Cloudflare preview smoke passed.');
}

run().catch((error) => {
  console.error(`Cloudflare preview smoke failed: ${error.message}`);
  exit(1);
});
