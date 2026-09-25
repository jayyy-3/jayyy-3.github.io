import { expect, test } from 'vitest'
import { referencedAssets, waitForDomainConvergence } from '../scripts/_lib/deployment-readiness.mjs'

// Synthetic origins only; fetch is injected, so nothing reaches the network.
const reference = 'https://1234abcd.urblo-site.pages.dev'
const apex = 'https://urblo.com.au'
const www = 'https://www.urblo.com.au'
const shell = (entry: string) => `<!doctype html><html><head><script type="module" src="/assets/${entry}"></script><link rel="stylesheet" href="/assets/index-new.css"></head><body><div id="root"></div></body></html>`
const newGraph: Record<string, string> = {
  '/': shell('index-new.js'),
  '/assets/index-new.js': 'import("./Projects-new.js");const m=["assets/Stone-new.js"]',
  '/assets/index-new.css': 'body{}',
  '/assets/Projects-new.js': 'export const projects=1',
  '/assets/Stone-new.js': 'export const stone=1',
}
const oldGraph: Record<string, string> = { '/': shell('index-old.js'), '/assets/index-old.js': 'old' }

function fixture(serve: (origin: string, path: string, attempt: number) => Response | Error) {
  let time = 0
  const logs: string[] = []
  const attempts = new Map<string, number>()
  const requests: { url: string; init: RequestInit }[] = []
  const options = {
    budgetMs: 180_000,
    intervalMs: 10_000,
    now: () => time,
    sleep: async (ms: number) => { time += ms },
    log: (line: string) => logs.push(line),
    fetchImpl: async (url: string, init: RequestInit) => {
      requests.push({ url, init })
      const { origin, pathname } = new URL(url)
      if (pathname === '/') attempts.set(origin, (attempts.get(origin) ?? 0) + 1)
      const result = serve(origin, pathname, attempts.get(origin) ?? 0)
      if (result instanceof Error) throw result
      return result
    },
  }
  return { options, logs, requests, elapsed: () => time }
}
const ok = (body: string, type = 'application/javascript') => new Response(body, { status: 200, headers: { 'content-type': type } })
const spaShell = () => new Response(shell('index-new.js'), { status: 200, headers: { 'content-type': 'text/html' } })
const fromGraph = (graph: Record<string, string>, path: string) => (path in graph ? ok(graph[path], path === '/' ? 'text/html' : 'application/javascript') : spaShell())

test('collects entry, preload and relative chunk references inside /assets only', () => {
  expect(referencedAssets(shell('index-new.js'))).toEqual(['/assets/index-new.css', '/assets/index-new.js'])
  expect(referencedAssets(newGraph['/assets/index-new.js'], true)).toEqual(['/assets/Projects-new.js', '/assets/Stone-new.js'])
  expect(referencedAssets('"./x.js" "/assets/../secret.js"')).toEqual([])
})

test('waits until apex and www serve the reference graph, reproducing the lagging lazy chunk of run 36153157216', async () => {
  const run = fixture((origin, path, attempt) => {
    if (origin === reference) return fromGraph(newGraph, path)
    if (origin === apex && path === '/assets/Projects-new.js' && attempt < 3) return spaShell()
    if (origin === www && attempt < 2) return fromGraph(oldGraph, path)
    return fromGraph(newGraph, path)
  })
  const result = await waitForDomainConvergence([apex, www], reference, run.options)
  expect(result).toMatchObject({ converged: true, attempts: 3, assets: 4 })
  expect(run.logs.some(line => line.includes('/assets/Projects-new.js') && line.includes('body=spa-shell'))).toBe(true)
  expect(run.logs.some(line => line.includes(www) && line.includes('different entry asset set'))).toBe(true)
  expect(run.elapsed()).toBe(20_000)
  for (const { init } of run.requests) {
    expect(init.method).toBe('GET')
    expect(init.redirect).toBe('manual')
    expect(init.body).toBeUndefined()
  }
})

test('reports non-convergence after the budget instead of passing', async () => {
  const run = fixture((origin, path) => (origin === reference ? fromGraph(newGraph, path) : fromGraph(oldGraph, path)))
  const result = await waitForDomainConvergence([apex], reference, run.options)
  expect(result).toMatchObject({ converged: false, pending: [apex] })
  expect(result.attempts).toBe(19) // t = 0, 10, ..., 180s
  expect(run.elapsed()).toBeLessThanOrEqual(180_000)
})

test('treats redirects and transport errors as not converged and never follows them', async () => {
  const run = fixture((origin, path, attempt) => {
    if (origin === reference) return fromGraph(newGraph, path)
    if (attempt === 1) return new Response('', { status: 301, headers: { location: `${apex}/` } })
    if (attempt === 2) return new TypeError('private-network-detail')
    return fromGraph(newGraph, path)
  })
  const result = await waitForDomainConvergence([www], reference, run.options)
  expect(result).toMatchObject({ converged: true, attempts: 3 })
  expect(run.logs.join('\n')).toMatch(/status=301/)
  expect(run.logs.join('\n')).not.toMatch(/private-network-detail/)
})

test('rejects non-immutable references and non-origin targets before any request', async () => {
  for (const [bases, ref] of [[[apex], 'https://urblo-site.pages.dev'], [[`${apex}/path`], reference], [[reference], reference], [[], reference], [['http://urblo.com.au'], reference]] as const) {
    const run = fixture(() => ok(''))
    await expect(waitForDomainConvergence([...bases], ref, run.options)).rejects.toThrow()
    expect(run.requests).toHaveLength(0)
  }
})
