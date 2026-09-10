const immutableOrigin = /^https:\/\/[0-9a-f]{8}\.(?:urblo|urblo-site)\.pages\.dev$/i

export function responseDiagnostic(response, text) {
  const type = response.headers.get('content-type') || '(missing)'
  const html = /^\s*(?:<!doctype html|<html)/i.test(text)
  const shell = text.includes('<div id="root"></div>')
  const code = text.match(/(?:error code:|Error\s+)(1\d{3})\b/i)?.[1]
  const ray = (response.headers.get('cf-ray') || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64)
  return `status=${response.status} type=${type} body=${shell ? 'spa-shell' : html ? 'html' : 'non-html'}${code ? ` cloudflare-error=${code}` : ''}${ray ? ` cf-ray=${ray}` : ''}`
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
  let attempt = 0
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
        log(`Function readiness attempt ${attempt}: ready; ${diagnostic}`)
        return
      }
      // Routing propagation may expose an HTML fallback or a temporary edge error.
      // Auth/rate limits, redirects and malformed API contracts fail immediately.
      retryable = [200, 404, 500, 502, 503, 504, 520, 522, 523, 524, 530].includes(response.status) && response.headers.get('content-type')?.includes('text/html')
    } catch (error) {
      retryable = error instanceof TypeError || ['TimeoutError', 'AbortError'].includes(error.name)
      diagnostic = `transport=${error.name}`
    }
    log(`Function readiness attempt ${attempt}: not ready; ${diagnostic}`)
    if (!retryable) throw new Error(`Function readiness failed: ${diagnostic}`)
    const remaining = deadline - now()
    if (remaining <= 0) break
    await sleep(Math.min(5_000, remaining))
  }
  throw new Error(`Function readiness timed out after ${budgetMs}ms; all ${attempt} attempts retained above`)
}
