#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4173}"
LOG_FILE="${TMPDIR:-/tmp}/urblo-agent-smoke-${PORT}.log"

if [ ! -d "dist" ]; then
  echo "dist/ not found; running npm run build first."
  npm run build
fi

echo "Starting Vite preview on http://${HOST}:${PORT}"
npx vite preview --host "${HOST}" --port "${PORT}" --strictPort >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
  wait "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

SMOKE_HOST="${HOST}" SMOKE_PORT="${PORT}" node --input-type=module <<'NODE'
import fs from 'node:fs'

const host = process.env.SMOKE_HOST
const port = process.env.SMOKE_PORT
const base = `http://${host}:${port}`
const routes = [
  '/',
  '/stone-library',
  '/stone-library/alpine-white',
  '/products',
  '/products/prime-block',
  '/projects',
  '/projects/moon-gate-woolley-street',
  '/our-story',
  '/capabilities',
  '/contact',
  '/admin',
  '/admin/account-setup',
  '/admin/login',
  '/admin/unauthorized',
  '/admin/leads',
  '/admin/media',
  '/admin/settings',
  '/admin/stone-library',
  '/admin/projects',
  '/admin/projects/1',
  '/admin/products',
  '/admin/articles',
  '/admin/audit',
  '/articles',
  '/articles/modular-mastery-how-primeblock-core-transformed-aitken-college',
]

const stateRoutes = [
  {
    name: 'Unknown route branded 404 shell',
    path: '/not-a-real-urblo-route',
  },
  {
    name: 'Missing product detail state shell',
    path: '/products/not-a-real-product',
  },
]

const requiredAssets = [
  '/articles/index.json',
  '/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College/content.html',
  '/downloads/urblo-capability-statement-2026.pdf',
  '/media/launch/capabilities/factory-preassembly.jpg',
  '/media/launch/capabilities/west-side-place-aerial.jpg',
  '/media/launch/capabilities/site-install-review.jpg',
  '/media/launch/capabilities/curved-stone-preassembly.jpg',
  '/media/launch/capabilities/moon-gate-framed-view.jpg',
  '/media/launch/our-story/natalie-ma-2026.jpg',
  '/media/launch/homepage/partner-banner-west-side-place.jpg',
  '/media/launch/homepage/project-artisan-park.jpg',
  '/media/launch/homepage/project-moon-gate.jpg',
  '/media/launch/homepage/project-west-side-place.jpg',
  '/media/launch/homepage/project-xavier-college.jpg',
  '/media/launch/contact/project-contact.jpg',
  '/media/launch/projects/australian-catholic-university/detail-2.jpg',
  '/media/launch/projects/artisan-park-yarrabend/detail-2.png',
  '/media/launch/projects/west-side-place/detail-2.jpg',
  '/media/launch/projects/xavier-college/detail-2.jpg',
  '/images/projects/moon-gate/moon-gate-seat-detail.jpg',
]

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
]

const ctaContracts = [
  {
    name: 'Header Contact navigation',
    target: '/contact',
  },
  {
    name: 'Footer Contact navigation',
    target: '/contact',
  },
  {
    name: 'Footer Sample Request navigation',
    target: '/contact?intent=sample-request',
  },
  {
    name: 'Homepage Capabilities navigation',
    target: '/capabilities',
  },
  {
    name: 'Header Capabilities navigation',
    target: '/capabilities',
  },
  {
    name: 'Footer Capabilities navigation',
    target: '/capabilities',
  },
  {
    name: 'Homepage Sample Request navigation',
    target: '/contact?intent=sample-request',
  },
  {
    name: 'Homepage Contact navigation',
    target: '/contact',
  },
  {
    name: 'Moon Gate primary CTA',
    target: '/contact',
  },
  {
    name: 'Moon Gate secondary CTA',
    target: '/stone-library',
  },
  {
    name: 'Contact page Stone Library CTA',
    target: '/stone-library',
  },
  {
    name: 'Stone detail phone CTA',
    target: 'tel:1300187256',
  },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${base}/`)
      if (response.ok) return
    } catch {
      await sleep(250)
    }
  }
  throw new Error(`Vite preview did not respond at ${base}`)
}

async function checkHtmlShell(route) {
  const response = await fetch(`${base}${route}`)
  if (!response.ok) {
    throw new Error(`${route} returned ${response.status}`)
  }
  const html = await response.text()
  if (!html.includes('<div id="root"></div>')) {
    throw new Error(`${route} did not return the React root shell`)
  }
}

async function checkAsset(path) {
  const response = await fetch(`${base}${path}`)
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }
}

function checkRedirectRule(contract) {
  const redirects = fs.readFileSync('public/_redirects', 'utf8')
  const expected = `${contract.from} ${contract.to} 301`
  if (!redirects.includes(expected)) {
    throw new Error(`Missing redirect rule: ${expected}`)
  }
  console.log(`redirect ok: ${contract.from} -> ${contract.to}`)
}

async function checkCta(contract) {
  if (contract.target.startsWith('/')) {
    await checkHtmlShell(contract.target)
    console.log(`cta ok: ${contract.name} -> ${contract.target}`)
    return
  }

  if (contract.target.startsWith('mailto:')) {
    const url = new URL(contract.target)
    if (url.pathname !== 'info@urblo.com.au') {
      throw new Error(`${contract.name} mailto target is ${url.pathname}`)
    }
    if (!url.searchParams.get('subject')) {
      throw new Error(`${contract.name} mailto is missing a subject`)
    }
    console.log(`cta ok: ${contract.name} -> mailto`)
    return
  }

  if (contract.target.startsWith('tel:')) {
    const phone = contract.target.replace(/^tel:/, '')
    if (!/^\d{10}$/.test(phone)) {
      throw new Error(`${contract.name} tel target is ${contract.target}`)
    }
    console.log(`cta ok: ${contract.name} -> tel`)
    return
  }

  throw new Error(`${contract.name} has unsupported CTA target ${contract.target}`)
}

await waitForServer()

for (const route of routes) {
  await checkHtmlShell(route)
  console.log(`route ok: ${route}`)
}

for (const stateRoute of stateRoutes) {
  await checkHtmlShell(stateRoute.path)
  console.log(`state route ok: ${stateRoute.name} -> ${stateRoute.path}`)
}

for (const asset of requiredAssets) {
  await checkAsset(asset)
  console.log(`asset ok: ${asset}`)
}

for (const contract of redirectContracts) {
  checkRedirectRule(contract)
}

for (const contract of ctaContracts) {
  await checkCta(contract)
}

console.log('Agent smoke passed.')
NODE

node scripts/check-forms-api.mjs
node scripts/check-contact-form-ui-source.mjs
node scripts/check-capabilities-page-source.mjs
npm run agent:admin-projects-aggregate
