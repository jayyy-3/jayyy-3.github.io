#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs'
import { assertLocalOrigin, assertLocalConfig, assertLocalDocker, assertLocalContainer, supabaseCommand, readLocalCredentials, LOCAL_API } from './_lib/local-environment.mjs'
import { seedLocalFixtures } from './_lib/local-fixtures.mjs'
const args = process.argv.slice(2)
const command = args.shift() ?? 'status'
if (!['start', 'reset', 'status', 'stop', 'seed'].includes(command)) throw new Error('Use local:start, local:reset, local:status or local:stop')
let apiUrl = LOCAL_API
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api-url') apiUrl = args[++i]
  else throw new Error(`Unsupported local option: ${args[i]}`)
}
// All target/config checks precede any subprocess or write.
assertLocalOrigin(apiUrl); assertLocalConfig(); assertLocalDocker()
mkdirSync('.tmp/local', { recursive: true })
const attempt = `${Date.now()}-${command}`
const report = { command, target: apiUrl, syntheticOnly: true, startedAt: new Date().toISOString(), passed: false }
try {
  if (command === 'start') { supabaseCommand(['start']); assertLocalContainer() }
  if (command === 'reset') { assertLocalContainer(); supabaseCommand(['db', 'reset', '--local', '--yes']); assertLocalContainer() }
  if (command === 'stop') { assertLocalContainer(); supabaseCommand(['stop']); report.passed = true }
  else {
    const credentials = readLocalCredentials()
    if (['start', 'reset', 'seed'].includes(command)) {
      const fixtures = await seedLocalFixtures(credentials)
      report.fixtureCounts = { accounts: Object.keys(fixtures.users).length, articles: fixtures.articles.length, publicMedia: 1 }
    }
    report.passed = true
  }
  console.log(`Local ${command} passed: ${apiUrl}; synthetic project only; no credentials printed.`)
} catch (error) {
  // CLI status/start output can contain local keys: do not persist raw subprocess output.
  report.error = error.status != null ? `Local subprocess failed with exit ${error.status}; inspect local Docker service logs` : error.message
  console.error(report.error)
  process.exitCode = 1
} finally {
  report.finishedAt = new Date().toISOString()
  writeFileSync(`.tmp/local/${attempt}.json`, JSON.stringify(report, null, 2) + '\n')
}
