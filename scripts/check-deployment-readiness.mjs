import assert from 'node:assert/strict'
import { responseDiagnostic, waitForDeploymentFunctions } from './_lib/deployment-readiness.mjs'

const origin = 'https://1234abcd.urblo-site.pages.dev'
const ready = () => new Response(JSON.stringify({ error: { code: 'method_not_allowed' } }), { status: 405, headers: { 'content-type': 'application/json' } })
const html = status => new Response('<!doctype html><html>Error 1101 private-body-marker</html>', { status, headers: { 'content-type': 'text/html', 'cf-ray': 'abc123-MEL' } })
function fixture(responses) {
  let time = 0, calls = 0
  const logs = []
  return {
    logs, calls: () => calls,
    options: {
      budgetMs: 15_000, now: () => time, sleep: async ms => { time += ms }, log: line => logs.push(line),
      fetchImpl: async (url, init) => {
        assert.equal(url, `${origin}/api/enquiries`)
        assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'manual')
        assert.equal(init.body, undefined); assert.equal(init.headers, undefined)
        const next = responses[Math.min(calls++, responses.length - 1)]
        if (next instanceof Error) throw next
        return next()
      },
    },
  }
}
let test = fixture([() => html(503), () => html(200), ready])
await waitForDeploymentFunctions(origin, test.options)
assert.equal(test.calls(), 3)
assert.equal(test.logs.length, 3)
assert.match(test.logs[0], /status=503.*cloudflare-error=1101.*cf-ray=abc123-MEL/)
assert.ok(!test.logs.join('').includes('private-body-marker'))
test = fixture([() => html(503)])
await assert.rejects(waitForDeploymentFunctions(origin, test.options), /timed out/)
assert.equal(test.calls(), 3, 'persistent failure stops at its budget')
for (const status of [302, 401, 403, 429]) {
  test = fixture([() => html(status), ready])
  await assert.rejects(waitForDeploymentFunctions(origin, test.options), /readiness failed/)
  assert.equal(test.calls(), 1, 'redirect/access/rate-limit failures must not be retried')
}
for (const body of ['invalid', JSON.stringify({ error: { code: 'wrong' } })]) {
  test = fixture([() => new Response(body, { status: 405, headers: { 'content-type': 'application/json' } }), ready])
  await assert.rejects(waitForDeploymentFunctions(origin, test.options), /readiness failed/)
  assert.equal(test.calls(), 1)
}
test = fixture([new TypeError('private-network-detail'), ready])
await waitForDeploymentFunctions(origin, test.options)
assert.equal(test.calls(), 2)
assert.ok(!test.logs.join('').includes('private-network-detail'))
for (const url of ['https://urblo.com.au', 'https://urblo-site.pages.dev', `${origin}/`, 'http://127.0.0.1:8788']) {
  test = fixture([ready])
  await assert.rejects(waitForDeploymentFunctions(url, test.options), /immutable/)
  assert.equal(test.calls(), 0)
}
assert.match(responseDiagnostic(html(200), '<div id="root"></div>'), /body=spa-shell/)
console.log('Deployment readiness: bounded recovery, persistent failure, strict contracts, access/redirect denial, diagnostics and immutable-only GET checks passed.')
