#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { assertLocalOrigin, assertLocalConfig, assertLocalDocker, LOCAL_API, LOCAL_APP, cleanLocalEnv } from './_lib/local-environment.mjs'
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--api-url')) throw new Error('Only --api-url is supported')
assertLocalOrigin(args[1] ?? LOCAL_API); assertLocalConfig(); assertLocalDocker()
if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Local Functions verification requires Node 22+ for pinned Wrangler; source verification remains Node 20')
// Refuse to reuse an unrelated server, including another in-progress local walkthrough.
try {
  const response = await fetch(LOCAL_APP, { signal: AbortSignal.timeout(1000) })
  if (response) throw new Error('Port 8788 is occupied. Stop local:dev before local:verify.')
} catch (error) { if (error.message.includes('occupied')) throw error }
const attempt = `.tmp/local/full-${Date.now()}`
mkdirSync(attempt, { recursive: true })
const report = { environment: 'synthetic-local', startedAt: new Date().toISOString(), steps: [], passed: false }
let app
function run(script, args = []) {
  const step = { script, args, startedAt: new Date().toISOString() }
  report.steps.push(step)
  const result = spawnSync(process.execPath, [`scripts/${script}`, ...args], { env: cleanLocalEnv(), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
  step.exitCode = result.status
  step.finishedAt = new Date().toISOString()
  writeFileSync(`${attempt}/${report.steps.length}.log`, [result.stdout, result.stderr].filter(Boolean).join('\n'))
  if (result.status !== 0) throw new Error(`${script} failed; see ${attempt}/${report.steps.length}.log`)
  console.log(`PASS ${script} ${args.join(' ')}`)
}
async function stopApp() {
  if (app?.pid) {
    try { process.kill(-app.pid, 'SIGTERM') } catch { /* process already stopped */ }
    await new Promise(resolve => setTimeout(resolve, 500))
    try { process.kill(-app.pid, 'SIGKILL') } catch { /* process group already stopped */ }
  }
  app = null
}
try {
  run('check-local-boundary.mjs')
  run('local-stack.mjs', ['start'])
  run('local-stack.mjs', ['reset'])
  run('local-stack.mjs', ['reset'])
  run('check-local-migrations.mjs')
  app = spawn(process.execPath, ['scripts/local-app.mjs'], { env: cleanLocalEnv(), detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  app.stdout.on('data', chunk => { output += chunk.toString(); writeFileSync(`${attempt}/app.log`, output) })
  app.stderr.on('data', chunk => { output += chunk.toString(); writeFileSync(`${attempt}/app.log`, output) })
  let ready = false
  for (let i = 0; i < 120; i++) {
    if (app.exitCode !== null) throw new Error(`Local Functions exited before readiness; see ${attempt}/app.log`)
    try { const response = await fetch(`${LOCAL_APP}/admin/login`, { signal: AbortSignal.timeout(1000) }); if (response.ok) { ready = true; break } } catch { /* readiness polling */ }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Local Functions did not become ready')
  run('check-local-journeys.mjs')
  await stopApp()
  run('check-local-article-mutation.mjs')
  report.passed = true
} catch (error) { report.error = error.message; console.error(error.message); process.exitCode = 1 }
finally {
  await stopApp()
  report.finishedAt = new Date().toISOString()
  writeFileSync(`${attempt}/result.json`, JSON.stringify(report, null, 2) + '\n')
  console.log(`Local stack verification: ${attempt}/result.json`)
}
