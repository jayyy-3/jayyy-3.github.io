#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, appendFileSync, cpSync, existsSync } from 'node:fs'
import { loadEnv } from 'vite'
import { randomUUID } from 'node:crypto'
import { checks, changedPaths, classify, resolveChecks, runtimeFingerprint } from './_lib/verification.mjs'

const args = process.argv.slice(2)
const value = key => args.includes(key) ? args[args.indexOf(key) + 1] : undefined
for (let i = 0; i < args.length; i++) {
  if (['--suite', '--base', '--out'].includes(args[i])) {
    if (!args[++i] || args[i].startsWith('--')) throw new Error('Missing option value')
  } else if (!['--plan', '--json'].includes(args[i])) throw new Error(`Unknown option: ${args[i]}`)
}
const explicitSuite = value('--suite')
let selection
try { selection = classify(changedPaths(value('--base'))) }
catch (error) {
  if (!explicitSuite) throw error
  selection = { category: 'unknown', deploy: true, paths: [], reason: 'Git metadata unavailable; explicit suite selected' }
}
if (['runtime', 'migrations'].includes(explicitSuite)) selection.deploy = true
const suite = explicitSuite ?? selection.suite
const ids = resolveChecks(suite)
let sha = 'unavailable', fingerprint = 'unavailable'
try { sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); fingerprint = runtimeFingerprint() } catch { /* container may omit Git metadata */ }
const report = { version: 1, attemptId: randomUUID(), startedAt: new Date().toISOString(), repositorySha: sha, runtimeFingerprint: fingerprint, environment: 'local-no-live-writes', ...selection, suite, checks: ids.map(id => ({ id, command: checks[id].command, status: 'pending' })) }
const output = value('--out')
if (args.includes('--plan')) {
  if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2)); process.exit(0)
}
const evidenceDir = `.tmp/verification/${report.attemptId}`
mkdirSync(evidenceDir, { recursive: true })
const secretValues = Object.entries(process.env).filter(([key, val]) => /SECRET|TOKEN|PASSWORD|SERVICE_ROLE|API_KEY/i.test(key) && val?.length > 6).map(([, val]) => val)
function redact(text) {
  for (const secret of secretValues) text = text.split(secret).join('[REDACTED]')
  return text.replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED JWT]')
}
console.log(`Verification: ${suite}; ${ids.length} unique checks; deployment ${report.deploy ? 'required' : 'not required'}`)
let activeChild = null
function terminateChild() {
  if (!activeChild) return
  try { process.kill(-activeChild.pid, 'SIGTERM') } catch { activeChild.kill('SIGTERM') }
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  terminateChild()
  report.interrupted = signal
})
for (const item of report.checks) {
  const started = Date.now()
  const [command, ...commandArgs] = item.command
  const buildPassed = report.checks.some(check => check.id === 'build' && check.status === 'passed')
  const buildEnv = loadEnv('production', process.cwd())
  const envless = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'].every(key => !buildEnv[key])
  const checkEnv = { ...process.env, URBLO_VERIFIED_ENVLESS_DIST: buildPassed && envless ? '1' : '0' }
  item.log = `${evidenceDir}/${item.id}.log`
  item.status = 'running'
  writeFileSync(item.log, '')
  writeFileSync(`${evidenceDir}/result.json`, JSON.stringify(report, null, 2) + '\n')
  const result = await new Promise(resolve => {
    const child = spawn(command, commandArgs, { env: checkEnv, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    activeChild = child
    const pending = { stdout: '', stderr: '' }
    for (const stream of ['stdout', 'stderr']) child[stream].on('data', chunk => {
      pending[stream] += chunk.toString()
      const end = pending[stream].lastIndexOf('\n')
      if (end >= 0) {
        appendFileSync(item.log, redact(pending[stream].slice(0, end + 1)))
        pending[stream] = pending[stream].slice(end + 1)
      }
    })
    let timedOut = false, forceTimer
    const timeout = setTimeout(() => {
      timedOut = true
      appendFileSync(item.log, 'Check exceeded its time budget; terminating its process group.\n')
      terminateChild()
      forceTimer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL') } catch { /* already stopped */ } }, 2000)
    }, item.id === 'build' ? 300000 : 180000)
    child.once('error', error => appendFileSync(item.log, redact(error.message) + '\n'))
    child.once('close', (code, signal) => {
      clearTimeout(timeout); clearTimeout(forceTimer)
      for (const text of Object.values(pending)) if (text) appendFileSync(item.log, redact(text))
      activeChild = null
      resolve({ status: code, signal, timedOut })
    })
  })
  item.durationMs = Date.now() - started
  item.status = result.status === 0 && !result.timedOut && !report.interrupted ? 'passed' : 'failed'
  item.exitCode = result.status
  item.signal = result.signal
  item.timedOut = result.timedOut
  if (item.id === 'browser' && existsSync('.tmp/admin-config-gate/screenshots')) cpSync('.tmp/admin-config-gate/screenshots', `${evidenceDir}/browser-screenshots`, { recursive: true })
  console.log(`${item.status.toUpperCase()} ${item.id} (${item.durationMs} ms) — ${item.log}`)
  if (item.status === 'failed') break
}
report.passed = report.checks.every(item => item.status === 'passed')
report.finishedAt = new Date().toISOString()
writeFileSync(`${evidenceDir}/result.json`, JSON.stringify(report, null, 2) + '\n')
if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
if (args.includes('--json')) console.log(JSON.stringify(report, null, 2))
console.log(`Verification ${report.passed ? 'passed' : 'failed'}: ${evidenceDir}/result.json`)
process.exitCode = report.passed ? 0 : 1
