#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const args = process.argv.slice(2)
const target = args.includes('--target') ? args[args.indexOf('--target') + 1] : 'local'
if (!['local', 'preview', 'production'].includes(target)) throw new Error('Target must be local, preview or production')
const status = JSON.parse(readFileSync('docs/agent/status.json', 'utf8'))
const observations = []
const add = (name, ready, detail) => observations.push({ name, ready, detail })
add('node', Number(process.versions.node.split('.')[0]) >= (target === 'local' ? 22 : 20), `Node ${process.versions.node}; local Functions require Node 22+, source compatibility is verified in the Node 20 container`)
add('dependencies', existsSync('node_modules'), 'Locked dependencies installed locally')
if (target === 'local') {
  const docker = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { encoding: 'utf8', timeout: 10000 })
  add('docker', docker.status === 0, docker.status === 0 ? 'Docker daemon is available' : 'Docker is not reachable from this process; check socket permissions or start Docker')
  add('supabase-config', existsSync('supabase/config.toml'), 'Local stack configuration; never uses linked production project')
  add('local-seed', existsSync('supabase/seed.sql'), 'Synthetic seed required for reset and journey checks')
} else {
  add('data-policy', true, 'Read-only verification; no login, database writes, email or deployment is performed')
  if (target === 'preview') add('isolation', false, `Preview currently targets ${status.environments.preview.dataTarget}; use local stack for test writes`)
  const suppliedUrl = args.includes('--base-url') ? args[args.indexOf('--base-url') + 1] : null
  const url = target === 'production' ? status.environments.production.origin : suppliedUrl
  if (!url) add('preview-origin', false, 'Supply --base-url with the Preview origin; the production immutable URL is not substituted')
  try {
    if (!url) throw new Error('Preview origin missing')
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error('Expected an HTTPS origin')
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'error' })
    const body = await response.text()
    add('public-shell', response.ok && body.includes('<div id="root"></div>'), `${new URL(url).origin}: HTTP ${response.status}; use deployed smoke for recursive asset integrity`)
  } catch { add('public-shell', false, 'Origin could not be read without redirect; run deployed smoke for details') }
  add('github-protection', status.externalDependencies.find(item => item.id === 'github-protection')?.status === 'complete', 'See structured external dependency; this is recorded configuration, not a fresh account audit')
}
const result = { target, checkedAt: new Date().toISOString(), readOnly: true, observations }
console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : observations.map(item => `${item.ready ? 'READY' : 'MISSING'} ${item.name}: ${item.detail}`).join('\n'))
if (args.includes('--strict') && observations.some(item => !item.ready)) process.exitCode = 1
