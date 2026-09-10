#!/usr/bin/env node
import { captureBrowserDiagnostics } from './_lib/browser-diagnostics.mjs'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { expect } from 'playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { assertLocalOrigin, assertLocalContainer, LOCAL_API, LOCAL_APP, LOCAL_ACCOUNTS, LOCAL_PASSWORD } from './_lib/local-environment.mjs'
import { fixturePng } from './_lib/local-fixtures.mjs'
import { projectJourney } from './local-journeys/projects.mjs'
import { articleJourney } from './local-journeys/articles.mjs'
import { formsJourney } from './local-journeys/forms.mjs'
import { runtimeFingerprint } from './_lib/verification.mjs'
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--base-url')) throw new Error('Only --base-url is supported')
assertLocalOrigin(args[1] ?? LOCAL_APP, LOCAL_APP); assertLocalContainer()
const id = `${Date.now()}`
const directory = `.tmp/local/journeys-${id}`
mkdirSync(directory, { recursive: true })
const report = { attemptId: id, environment: 'synthetic-local', baseUrl: LOCAL_APP, repositorySha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), runtimeFingerprint: runtimeFingerprint(), browserPath: 'Browser plugin not available; repository Playwright used', viewport: { width: 1440, height: 1000 }, checks: [], requests: [], errors: [] }
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: report.viewport })
context.setDefaultTimeout(15000)
await context.route('**/*', route => {
  const url = new URL(route.request().url())
  if ([LOCAL_APP, LOCAL_API].includes(url.origin) || ['data:', 'blob:'].includes(url.protocol)) return route.continue()
  report.errors.push(`Blocked non-local request: ${url.origin}${url.pathname}`)
  return route.abort()
})
const finishDiagnostics = captureBrowserDiagnostics(context, report)
const page = await context.newPage()
page.on('response', response => {
  const url = new URL(response.url())
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')) report.requests.push({ method: response.request().method(), path: url.pathname, status: response.status() })
})
async function check(name, work) {
  const record = { name, status: 'running' }; report.checks.push(record)
  let timer
  try {
    await Promise.race([work(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Journey timed out: ${name}`)), 90000) })])
    record.status = 'passed'; console.log(`PASS ${name}`)
  }
  catch (error) { record.status = 'failed'; record.error = error.message; await page.screenshot({ path: `${directory}/failure.png`, fullPage: true }); throw error }
  finally { clearTimeout(timer); writeFileSync(`${directory}/result.json`, JSON.stringify(report, null, 2) + '\n') }
}
async function login(role) {
  await page.goto(`${LOCAL_APP}/admin/login`)
  await page.getByLabel('Email', { exact: true }).fill(LOCAL_ACCOUNTS[role])
  await page.getByLabel('Password', { exact: true }).fill(LOCAL_PASSWORD)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL(`${LOCAL_APP}/admin`)
}
let resource
try {
  await check('Owner signs in through UI', () => login('owner'))
  await check('QR upload traverses real Storage and Pages Function', async () => {
    const loaded = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/image-qr' && response.request().method() === 'GET')
    await page.goto(`${LOCAL_APP}/admin/image-qr`); assert.equal((await loaded).status(), 200)
    const created = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/image-qr' && response.request().method() === 'POST')
    await page.locator('input[type=file]').first().setInputFiles({ name: `local-qr-${id}.png`, mimeType: 'image/png', buffer: fixturePng })
    const response = await created; assert.equal(response.status(), 201)
    resource = (await response.json()).resource
    assert.equal(resource.imageUrl, `https://urblo.com.au/image/${resource.slug}`, 'Canonical printed QR contract stays unchanged')
    await expect(page.getByRole('button').filter({ hasText: resource.name }).first()).toBeVisible()
  })
  await check('QR stone save persists after refresh', async () => {
    await page.getByRole('button').filter({ hasText: resource.name }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('combobox', { name: 'Stone', exact: true })).toBeEnabled()
    await dialog.getByRole('combobox', { name: 'Stone', exact: true }).selectOption('blueocean')
    await expect(dialog.getByRole('button', { name: 'Save stone selection', exact: true })).toBeEnabled()
    const saved = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/image-qr' && response.request().method() === 'POST')
    await dialog.getByRole('button', { name: 'Save stone selection', exact: true }).click()
    const response = await saved; assert.equal(response.status(), 200); resource = (await response.json()).resource
    assert.equal(resource.materialSelection.stoneGroupId, 'blueocean')
    await expect(dialog.getByText('Stone selection saved. The QR page is updated.', { exact: true })).toBeVisible()
    await page.reload()
    await page.getByRole('button').filter({ hasText: resource.name }).first().click()
    await expect(page.getByRole('dialog').getByRole('combobox', { name: 'Stone', exact: true })).toHaveValue('blueocean')
    await page.screenshot({ path: `${directory}/qr-saved.png`, fullPage: true })
  })
  await check('QR public page reads saved material from the local route', async () => {
    // The Open page link must stay on the local origin; printed QR values remain canonical.
    const popup = context.waitForEvent('page')
    await page.getByRole('dialog').getByRole('link', { name: 'Open page', exact: true }).click()
    const publicPage = await popup
    await publicPage.waitForURL(`${LOCAL_APP}/image/${resource.slug}`)
    const response = await context.request.get(publicPage.url())
    assert.equal(response.status(), 200)
    await expect(publicPage.getByRole('heading', { name: /BlueOcean/i })).toBeVisible()
    assert.ok(await publicPage.locator('body').innerText())
    await publicPage.screenshot({ path: `${directory}/qr-public.png`, fullPage: true })
    await publicPage.close()
  })
  await check('QR Hide denies public readback and Restore retains slug', async () => {
    const dialog = page.getByRole('dialog')
    const hidden = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/image-qr' && response.request().method() === 'POST')
    await dialog.getByRole('button', { name: 'Hide QR', exact: true }).click()
    const hiddenResponse = await hidden; assert.equal(hiddenResponse.status(), 200)
    const publicResponse = await context.request.get(`${LOCAL_APP}/image/${resource.slug}`)
    assert.equal(publicResponse.status(), 404)
    const restored = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/image-qr' && response.request().method() === 'POST')
    await dialog.getByRole('button', { name: 'Restore QR', exact: true }).click()
    const response = await restored; assert.equal(response.status(), 200); assert.equal((await response.json()).resource.slug, resource.slug)
  })
  await check('Unauthenticated QR mutations are denied', async () => {
    const response = await context.request.post(`${LOCAL_APP}/api/admin/image-qr`, { data: { action: 'hide', id: resource.id } })
    assert.equal(response.status(), 401)
  })
  await projectJourney({ page, context, check, id, directory })
  await articleJourney({ page, context, check, id, directory })
  await formsJourney({ page, context, check, id, directory })
  await check('A valid local account without an admin profile cannot enter protected modules', async () => {
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await page.waitForURL(url => url.origin === LOCAL_APP && url.pathname === '/admin/login')
    await page.getByLabel('Email', { exact: true }).fill(LOCAL_ACCOUNTS.outsider)
    await page.getByLabel('Password', { exact: true }).fill(LOCAL_PASSWORD)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(`${LOCAL_APP}/admin/unauthorized`)
    for (const route of ['articles', 'projects', 'image-qr', 'leads']) {
      await page.goto(`${LOCAL_APP}/admin/${route}`)
      await page.waitForURL(`${LOCAL_APP}/admin/unauthorized`)
      await expect(page.getByRole('button', { name: /New article|New project|Save article/ })).toHaveCount(0)
    }
  })
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.passed = false; report.failure = error.message; console.error(error.message); process.exitCode = 1
} finally {
  await finishDiagnostics()
  report.finishedAt = new Date().toISOString()
  writeFileSync(`${directory}/result.json`, JSON.stringify(report, null, 2) + '\n')
  await browser.close()
  console.log(`Local journey evidence: ${directory}/result.json`)
}
