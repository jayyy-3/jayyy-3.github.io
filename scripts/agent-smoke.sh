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

await waitForServer()

for (const route of routes) {
  await checkHtmlShell(route)
  console.log(`route ok: ${route}`)
}

for (const asset of requiredAssets) {
  await checkAsset(asset)
  console.log(`asset ok: ${asset}`)
}

console.log('Agent smoke passed.')
NODE
