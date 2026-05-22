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
const host = process.env.SMOKE_HOST
const port = process.env.SMOKE_PORT
const base = `http://${host}:${port}`
const routes = [
  '/',
  '/stone-library',
  '/stone-library/alpine-white',
  '/products',
  '/products/primeBlock',
  '/projects',
  '/projects/moon-gate-woolley-street',
  '/our-story',
  '/contact',
  '/articles',
]

const requiredAssets = [
  '/articles/index.json',
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
    name: 'Footer Sample Request fallback',
    target: 'mailto:info@urblo.com.au?subject=Sample%20Request',
  },
  {
    name: 'Homepage Sample Request fallback',
    target:
      'mailto:info@urblo.com.au?subject=Sample%20Request&body=Hi%20Urblo%2C%20I%20would%20like%20to%20request%20stone%20samples.',
  },
  {
    name: 'Homepage Contact fallback',
    target: 'mailto:info@urblo.com.au?subject=Contact%20Us',
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

for (const asset of requiredAssets) {
  await checkAsset(asset)
  console.log(`asset ok: ${asset}`)
}

for (const contract of ctaContracts) {
  await checkCta(contract)
}

console.log('Agent smoke passed.')
NODE
