#!/usr/bin/env node
import { exit } from 'node:process';

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
];

const functionPaths = ['/api/enquiries', '/api/sample-requests'];

function parseArgs(argv) {
  const options = {
    baseUrl: '',
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

  options.baseUrl = options.baseUrl.replace(/\/$/, '');

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
    const path = match[1];
    if (path.startsWith('http')) {
      paths.add(new URL(path).pathname);
    } else {
      paths.add(path);
    }
  }
  return [...paths].slice(0, 8);
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

async function checkAssets(html, options) {
  const assetPaths = collectAssetPaths(html);
  assert(assetPaths.length > 0, 'No /assets/ references found in root HTML');

  for (const path of assetPaths) {
    const response = await timedFetch(`${options.baseUrl}${path}`, options);
    assert(response.status === 200, `${path} returned ${response.status}, expected 200`);
    console.log(`asset ok: ${path}`);
  }
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
  if (options.isLocalBaseUrl) {
    console.log('Local base URL detected; Cloudflare-only redirect and Function checks will be skipped.');
  }

  const rootHtml = await checkHtmlRoutes(options);
  await checkAssets(rootHtml, options);
  await checkRedirects(options);
  await checkFunctions(options);

  console.log('Cloudflare preview smoke passed.');
}

run().catch((error) => {
  console.error(`Cloudflare preview smoke failed: ${error.message}`);
  exit(1);
});
