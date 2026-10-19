import assert from 'node:assert/strict'
import { pageShellReady, readinessPagePaths, responseDiagnostic, waitForDeploymentFunctions, waitForDeploymentPages } from './_lib/deployment-readiness.mjs'

const origin = 'https://1234abcd.urblo-site.pages.dev'
const ready = () => new Response(JSON.stringify({ error: { code: 'method_not_allowed' } }), { status: 405, headers: { 'content-type': 'application/json' } })
const html = status => new Response('<!doctype html><html>Error 1101 private-body-marker</html>', { status, headers: { 'content-type': 'text/html', 'cf-ray': 'abc123-MEL' } })
function fixture(responses) {
  let time = 0, calls = 0
  const logs = []
  return {
    logs, calls: () => calls,
    options: {
      budgetMs: 30_000, now: () => time, sleep: async ms => { time += ms }, log: line => logs.push(line),
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
assert.equal(test.calls(), 5)
assert.equal(test.logs.length, 5)
assert.match(test.logs[0], /status=503.*cloudflare-error=1101.*cf-ray=abc123-MEL/)
assert.ok(!test.logs.join('').includes('private-body-marker'))
test = fixture([() => html(503)])
await assert.rejects(waitForDeploymentFunctions(origin, test.options), /timed out/)
assert.equal(test.calls(), 6, 'persistent failure stops at its budget')
test = fixture([ready, () => html(404), ready, ready, ready])
await waitForDeploymentFunctions(origin, test.options)
assert.equal(test.calls(), 5, 'an early success followed by an edge failure resets the stability window')
assert.match(test.logs[2], /ready 1\/3/)
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
assert.equal(test.calls(), 4)
assert.ok(!test.logs.join('').includes('private-network-detail'))
for (const url of ['https://urblo.com.au', 'https://urblo-site.pages.dev', `${origin}/`, 'http://127.0.0.1:8788']) {
  test = fixture([ready])
  await assert.rejects(waitForDeploymentFunctions(url, test.options), /immutable/)
  assert.equal(test.calls(), 0)
}
assert.match(responseDiagnostic(html(200), '<div id="root"></div>'), /body=spa-shell/)

// Page readiness: the same bounded loop over the public page paths, reproducing the
// "/ returned 404" first attempts of PR #95/#96 and production run 38679742624.
const shellHtml = '<!doctype html><html><head><script type="module" src="/assets/index-abc.js"></script></head><body><div id="root"></div></body></html>'
const page = (status = 200, body = shellHtml) => new Response(body, { status, headers: { 'content-type': 'text/html', 'cf-ray': 'def456-SYD' } })
function pageFixture(serve) {
  let time = 0, calls = 0
  const logs = [], urls = []
  return {
    logs, urls, calls: () => calls,
    options: {
      budgetMs: 30_000, now: () => time, sleep: async ms => { time += ms }, log: line => logs.push(line),
      fetchImpl: async (url, init) => {
        assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'manual')
        assert.equal(init.body, undefined); assert.equal(init.headers, undefined)
        urls.push(url)
        const next = serve(new URL(url).pathname, calls++)
        if (next instanceof Error) throw next
        return next
      },
    },
  }
}
assert.deepEqual([...readinessPagePaths], ['/', '/projects'])
assert.ok(pageShellReady(page(), shellHtml))
assert.ok(!pageShellReady(page(404), shellHtml), 'the edge 404 shell is not ready')
assert.ok(!pageShellReady(page(200, '<!doctype html><html><div id="root"></div></html>'), '<!doctype html><html><div id="root"></div></html>'), 'a shell without a Vite asset is not ready')
assert.ok(!pageShellReady(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }), '{}'))
// Run 38679742624: / answered 404 for the first attempts, then every path served the shell.
let pages = pageFixture((path, call) => (call < 2 ? page(404) : page()))
await waitForDeploymentPages(origin, pages.options)
assert.equal(pages.calls(), 8, 'two 404 attempts stop at /, then three ready attempts fetch both paths')
assert.deepEqual(pages.urls.slice(0, 4), [`${origin}/`, `${origin}/`, `${origin}/`, `${origin}/projects`])
assert.match(pages.logs[0], /not ready; \/ status=404.*cf-ray=def456-SYD/)
assert.match(pages.logs[4], /ready 3\/3; \/ \/projects/)
assert.equal(pages.logs.length, 5)
// /projects lagging alone (PR 1A Preview 25f121b5) also holds the smoke back.
pages = pageFixture((path, call) => (path === '/projects' && call < 4 ? page(404) : page()))
await waitForDeploymentPages(origin, pages.options)
assert.match(pages.logs[0], /not ready; \/projects status=404/)
assert.match(pages.logs.at(-1), /ready 3\/3/)
// Persistent 404 stops at the budget.
pages = pageFixture(() => page(404))
await assert.rejects(waitForDeploymentPages(origin, pages.options), /timed out/)
assert.equal(pages.calls(), 6)
// A success followed by an edge error or a stale non-shell 200 resets the stability window.
pages = pageFixture((path, call) => (call === 2 ? page(503, '<html>Error 1101</html>') : call === 4 ? page(200, '<html>stale</html>') : page()))
await waitForDeploymentPages(origin, pages.options)
assert.match(pages.logs[0], /ready 1\/3/)
assert.match(pages.logs[1], /not ready; \/ status=503.*cloudflare-error=1101/)
assert.match(pages.logs[2], /not ready; \/projects status=200.*body=html/)
assert.equal(pages.logs.filter(line => /ready [123]\/3/.test(line)).length, 4)
// Redirects and access/rate-limit denials fail immediately; transport errors retry safely.
for (const status of [301, 302, 401, 403, 429]) {
  pages = pageFixture(() => page(status))
  await assert.rejects(waitForDeploymentPages(origin, pages.options), /Page readiness failed/)
  assert.equal(pages.calls(), 1)
}
pages = pageFixture((path, call) => (call === 0 ? new TypeError('private-network-detail') : page()))
await waitForDeploymentPages(origin, pages.options)
assert.equal(pages.calls(), 7)
assert.ok(!pages.logs.join('').includes('private-network-detail'))
for (const url of ['https://urblo.com.au', 'https://urblo-site.pages.dev', `${origin}/`, 'http://127.0.0.1:8788']) {
  pages = pageFixture(() => page())
  await assert.rejects(waitForDeploymentPages(url, pages.options), /immutable/)
  assert.equal(pages.calls(), 0)
}
await assert.rejects(waitForDeploymentPages(origin, { ...pageFixture(() => page()).options, paths: ['projects'] }), /root-relative/)
console.log('Deployment readiness: bounded Function and page recovery, persistent failure, strict contracts, access/redirect denial, diagnostics and immutable-only GET checks passed.')
