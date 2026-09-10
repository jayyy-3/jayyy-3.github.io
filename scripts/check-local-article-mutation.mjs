import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
import { expect } from 'playwright/test'
import { assertLocalContainer, cleanLocalEnv, LOCAL_APP, LOCAL_API, LOCAL_ACCOUNTS, LOCAL_PASSWORD } from './_lib/local-environment.mjs'
import { assertArticleSaveUnlocked } from './_lib/article-assertions.mjs'
import { runtimeFingerprint } from './_lib/verification.mjs'

assertLocalContainer()
try {
  const response = await fetch(LOCAL_APP, { signal: AbortSignal.timeout(500) })
  if (response) throw new Error('Stop the normal local app before mutation proof')
} catch (error) { if (error.message.includes('Stop the normal')) throw error }
const directory = `.tmp/local/article-mutation-${Date.now()}`
mkdirSync(directory, { recursive: true })
const fingerprint = runtimeFingerprint()
const report = { environment: 'synthetic-local', mutation: 'validation-lock-before-validation', originalRuntimeFingerprint: fingerprint, detected: false }
const app = spawn(process.execPath, ['scripts/local-app.mjs', '--article-fault', 'validation-lock'], { env: cleanLocalEnv(), detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
let log = '', browser
for (const stream of [app.stdout, app.stderr]) stream.on('data', chunk => { log += chunk.toString(); writeFileSync(`${directory}/app.log`, log) })
try {
  let ready = false
  for (let count = 0; count < 120; count++) {
    if (app.exitCode !== null) throw new Error('Mutation app exited before readiness')
    try { const response = await fetch(`${LOCAL_APP}/admin/login`, { signal: AbortSignal.timeout(500) }); if (response.ok) { ready = true; break } } catch { /* wait for local build */ }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  assert.ok(ready, 'Mutation app must start')
  assert.match(log, /Deliberate local build fault: validation-lock/)
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(15000)
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return [LOCAL_APP, LOCAL_API].includes(url.origin) || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort()
  })
  await page.goto(`${LOCAL_APP}/admin/login`)
  await page.getByLabel('Email', { exact: true }).fill(LOCAL_ACCOUNTS.owner)
  await page.getByLabel('Password', { exact: true }).fill(LOCAL_PASSWORD)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL(`${LOCAL_APP}/admin`)
  await page.goto(`${LOCAL_APP}/admin/articles`)
  await expect(page.getByRole('button', { name: 'New article', exact: true })).toBeEnabled()
  const fixture = JSON.parse(readFileSync('.tmp/local/fixtures.json', 'utf8')).articles[1]
  await page.getByRole('button').filter({ hasText: `URL: ${fixture.slug} /` }).click()
  await expect(page.getByRole('button', { name: 'New article', exact: true })).toBeEnabled()
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('   ')
  await page.getByRole('button', { name: 'Save article', exact: true }).click()
  await expect(page.getByText('Article title is required.', { exact: true })).toBeVisible()
  try { await assertArticleSaveUnlocked(page, 800) }
  catch (error) {
    assert.match(error.message, /toBeEnabled/)
    report.detected = true; report.expectedFailure = error.message
  }
  assert.ok(report.detected, 'The normal recovery assertion must fail against the deliberate old lock-order defect')
  await page.screenshot({ path: `${directory}/detected-lock.png`, fullPage: true })
  assert.equal(runtimeFingerprint(), fingerprint, 'Mutation must not edit source files')
  console.log('PASS real browser recovery assertion rejects the deliberately reintroduced validation-lock defect; source unchanged')
} catch (error) { report.error = error.message; process.exitCode = 1; console.error(error.message) }
finally {
  await browser?.close()
  try { process.kill(-app.pid, 'SIGTERM') } catch { /* exited */ }
  await new Promise(resolve => setTimeout(resolve, 500))
  try { process.kill(-app.pid, 'SIGKILL') } catch { /* exited */ }
  report.finishedAt = new Date().toISOString()
  writeFileSync(`${directory}/result.json`, JSON.stringify(report, null, 2) + '\n')
  console.log(`Mutation evidence: ${directory}/result.json`)
}
