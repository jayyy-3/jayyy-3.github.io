const immutableOrigin = /^https:\/\/[0-9a-f]{8}\.(?:urblo|urblo-site)\.pages\.dev$/i

export function responseDiagnostic(response, text) {
  const type = response.headers.get('content-type') || '(missing)'
  const html = /^\s*(?:<!doctype html|<html)/i.test(text)
  const shell = text.includes('<div id="root"></div>')
  const code = text.match(/(?:error code:|Error\s+)(1\d{3})\b/i)?.[1]
  const ray = (response.headers.get('cf-ray') || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64)
  const target = response.url ? new URL(response.url) : null
  return `status=${response.status} type=${type} body=${shell ? 'spa-shell' : html ? 'html' : 'non-html'} redirected=${response.redirected}${target ? ` target=${target.origin}${target.pathname}` : ''}${code ? ` cloudflare-error=${code}` : ''}${ray ? ` cf-ray=${ray}` : ''}`
}

// Only a newly deployed immutable origin may wait. This never retries writes,
// follows redirects, weakens the smoke contract, or waits on production aliases.
export async function waitForDeploymentFunctions(baseUrl, {
  budgetMs = 120_000,
  fetchImpl = fetch,
  now = Date.now,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  log = console.log,
} = {}) {
  if (!immutableOrigin.test(baseUrl)) throw new Error('Function readiness requires an immutable Pages origin')
  if (!Number.isInteger(budgetMs) || budgetMs < 1 || budgetMs > 120_000) throw new Error('Invalid readiness budget')
  const deadline = now() + budgetMs
  let attempt = 0, consecutiveReady = 0
  while (now() < deadline) {
    attempt++
    let retryable = false
    let diagnostic
    try {
      const response = await fetchImpl(`${baseUrl}/api/enquiries`, {
        method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(Math.min(12_000, deadline - now())),
      })
      const text = await response.text()
      diagnostic = responseDiagnostic(response, text)
      let payload
      try { payload = JSON.parse(text) } catch { /* diagnostic only */ }
      if (response.status === 405 && response.headers.get('content-type')?.includes('application/json') && payload?.error?.code === 'method_not_allowed') {
        consecutiveReady++
        log(`Function readiness attempt ${attempt}: ready ${consecutiveReady}/3; ${diagnostic}`)
        if (consecutiveReady === 3) return
        await sleep(Math.min(5_000, Math.max(0, deadline - now())))
        continue
      }
      // Routing propagation may expose an HTML fallback or a temporary edge error.
      // Auth/rate limits, redirects and malformed API contracts fail immediately.
      retryable = [200, 404, 500, 502, 503, 504, 520, 522, 523, 524, 530].includes(response.status) && response.headers.get('content-type')?.includes('text/html')
    } catch (error) {
      retryable = error instanceof TypeError || ['TimeoutError', 'AbortError'].includes(error.name)
      diagnostic = `transport=${error.name}`
    }
    consecutiveReady = 0
    log(`Function readiness attempt ${attempt}: not ready; ${diagnostic}`)
    if (!retryable) throw new Error(`Function readiness failed: ${diagnostic}`)
    const remaining = deadline - now()
    if (remaining <= 0) break
    await sleep(Math.min(5_000, remaining))
  }
  throw new Error(`Function readiness timed out after ${budgetMs}ms; all ${attempt} attempts retained above`)
}

// Production domains can lag a new immutable deployment at the edge. CI run
// 36153157216 (2026-09-26) failed its apex readback because /assets/Projects-*.js
// still returned the SPA shell; the same smoke passed minutes later. This waits,
// read-only and bounded, until every domain serves the reference asset graph
// byte-for-byte. It never follows redirects and never replaces the full smoke.
const assetReference = /["'`(]((?:\/assets\/|\.\/|assets\/)[\w.\-/]+?\.(?:js|css))["'`)]/g
export function referencedAssets(text, fromAsset = false) {
  const paths = new Set()
  for (const [, raw] of text.matchAll(assetReference)) {
    if (raw.startsWith('./')) { if (fromAsset) paths.add(`/assets/${raw.slice(2)}`) }
    else paths.add(raw.startsWith('/') ? raw : `/${raw}`)
  }
  return [...paths].filter(path => path.startsWith('/assets/') && !path.includes('..')).sort()
}

export async function waitForDomainConvergence(baseUrls, referenceUrl, {
  budgetMs = 180_000,
  intervalMs = 10_000,
  maxAssets = 400,
  fetchImpl = fetch,
  now = Date.now,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  log = console.log,
} = {}) {
  if (!immutableOrigin.test(referenceUrl)) throw new Error('Domain convergence requires an immutable reference origin')
  if (!Array.isArray(baseUrls) || !baseUrls.length) throw new Error('Supply at least one production origin')
  for (const base of baseUrls) {
    let parsed
    try { parsed = new URL(base) } catch { throw new Error(`Invalid origin: ${base}`) }
    if (parsed.protocol !== 'https:' || parsed.origin !== base || immutableOrigin.test(base)) throw new Error(`Expected a production https origin without path: ${base}`)
  }
  if (!Number.isInteger(budgetMs) || budgetMs < 1 || budgetMs > 600_000) throw new Error('Invalid convergence budget')
  const { createHash } = await import('node:crypto')
  const digest = bytes => createHash('sha256').update(bytes).digest('hex')
  const get = async url => {
    const response = await fetchImpl(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(12_000) })
    const bytes = new Uint8Array(await response.arrayBuffer())
    return { response, bytes, text: new TextDecoder().decode(bytes) }
  }
  const root = await get(`${referenceUrl}/`)
  if (root.response.status !== 200) throw new Error(`Reference root failed: ${responseDiagnostic(root.response, root.text)}`)
  const rootAssets = referencedAssets(root.text)
  if (!rootAssets.length) throw new Error('Reference root has no /assets/ references')
  const reference = new Map()
  const queue = [...rootAssets]
  while (queue.length) {
    const path = queue.shift()
    if (reference.has(path)) continue
    if (reference.size >= maxAssets) throw new Error(`Reference asset graph exceeds ${maxAssets} entries`)
    const asset = await get(`${referenceUrl}${path}`)
    if (asset.response.status !== 200) throw new Error(`Reference ${path} failed: ${responseDiagnostic(asset.response, asset.text)}`)
    reference.set(path, digest(asset.bytes))
    queue.push(...referencedAssets(asset.text, true))
  }
  const firstMismatch = async base => {
    try {
      const page = await get(`${base}/`)
      if (page.response.status !== 200) return `/ ${responseDiagnostic(page.response, page.text)}`
      if (JSON.stringify(referencedAssets(page.text)) !== JSON.stringify(rootAssets)) return '/ references a different entry asset set'
      for (const [path, hash] of reference) {
        const asset = await get(`${base}${path}`)
        if (asset.response.status !== 200 || digest(asset.bytes) !== hash) return `${path} ${responseDiagnostic(asset.response, asset.text)}`
      }
      return null
    } catch (error) {
      return `transport=${error.name}`
    }
  }
  const deadline = now() + budgetMs
  const pending = new Set(baseUrls)
  let attempt = 0
  for (;;) {
    attempt++
    for (const base of [...pending]) {
      const mismatch = await firstMismatch(base)
      if (mismatch) log(`Convergence attempt ${attempt}: ${base} not yet serving ${referenceUrl}: ${mismatch}`)
      else { pending.delete(base); log(`Convergence attempt ${attempt}: ${base} serves ${referenceUrl} (${reference.size} assets identical)`) }
    }
    if (!pending.size) return { converged: true, attempts: attempt, assets: reference.size }
    if (now() + intervalMs > deadline) return { converged: false, attempts: attempt, assets: reference.size, pending: [...pending] }
    await sleep(intervalMs)
  }
}
