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
  if (options.referenceUrl) {
    options.referenceUrl = normalizeBaseUrlOrigin(options.referenceUrl, '--reference-url');
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
  for (const match of text.matchAll(/["'`]((?:\.{1,2}\/|\/?assets\/)[^"'`]+?\.(?:js|css))["'`]/g)) {
    paths.add(normalizeAssetPath(match[1], parentAssetPath));
  }
  return [...paths].filter(Boolean);
}

function normalizeAssetPath(rawPath, parentAssetPath = '/') {
  if (!rawPath) return '';
  if (rawPath.startsWith('http')) {
    return new URL(rawPath).pathname;
  }
  if (rawPath.startsWith('./') || rawPath.startsWith('../')) {
    return new URL(rawPath, `https://urblo.invalid${parentAssetPath}`).pathname;
  }
  return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
}

async function checkHtmlRoutes(options) {
  const allRoutes = [...publicRoutes, ...adminRoutes, ...stateRoutes];
  let rootHtml = '';

  for (const route of allRoutes) {
    const { response, text } = await fetchText(route, options);
    assertHtmlShell(route, response, text);
    if (route === '/') rootHtml = text;
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
  assert(queue.length > 0, 'No /assets/ references found in root HTML');
  assert(queue.length <= MAX_ASSET_GRAPH_SIZE, `Initial asset graph exceeds ${MAX_ASSET_GRAPH_SIZE} entries`);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path || seen.has(path)) continue;
    seen.add(path);

    const response = await timedFetch(`${options.baseUrl}${path}`, options);
    assert(response.status === 200, `${path} returned ${response.status}, expected 200`);
    if (path.endsWith('.js') || path.endsWith('.css')) {
      const text = await response.text();
      assertAssetContentType(path, response, text);
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
}

function assertAssetContentType(path, response, text) {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const mediaType = contentType.split(';', 1)[0].trim();
  const cacheControl = (response.headers.get('cache-control') || '').toLowerCase();
  const normalizedBody = text.trimStart();
  const normalizedPrefix = normalizedBody.slice(0, 1024).toLowerCase();
  const isHtmlFallback =
    normalizedPrefix.startsWith('<!doctype html') ||
    normalizedPrefix.startsWith('<html') ||
    normalizedPrefix.includes('<div id="root"></div>');

  assert(!response.redirected, `${path} unexpectedly redirected to ${response.url}`);
  assert(normalizedBody.length > 0, `${path} returned an empty asset body`);
  assert(!isHtmlFallback, `${path} returned the SPA HTML shell instead of the requested asset`);
  assert(
    !cacheControl.includes('immutable') && !/max-age=(?:31536000|31556952)\b/.test(cacheControl),
    `${path} still exposes the removed long-lived custom cache policy: ${cacheControl}`,
  );

  if (path.endsWith('.js')) {
    assert(
      JAVASCRIPT_MEDIA_TYPES.has(mediaType),
      `${path} returned non-JavaScript content type: ${mediaType || '(missing)'}`,
    );
    return;
  }

  assert(mediaType === 'text/css', `${path} returned non-CSS content type: ${mediaType || '(missing)'}`);
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

async function checkFunctions(options) {
  if (options.skipFunctions || options.isLocalBaseUrl) {
    console.log('function checks skipped.');
    return;
  }

  for (const path of functionPaths) {
    await checkFunctionPath(path, options);
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
