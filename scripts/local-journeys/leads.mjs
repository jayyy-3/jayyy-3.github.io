import assert from 'node:assert/strict'
import { expect } from 'playwright/test'
import { LOCAL_ACCOUNTS, LOCAL_APP, LOCAL_PASSWORD, localFetch, readLocalCredentials } from '../_lib/local-environment.mjs'

// NOW-OPT-ADMIN-SMALL-FIXES-001: with 600+ synthetic sample items the newest sample requests
// show complete item lists (the old query read items oldest-first with a 500-row cap); the queue
// is paginated and loads older requests; an expired sign-in mid-edit keeps the unsaved notes,
// offers re-login in place and finishes the save; an Editor can work a lead but not export.
// Every row is synthetic and written only to the isolated local stack.
const OLD_REQUESTS = 130
const ITEMS_PER_OLD_REQUEST = 5
const NEW_REQUESTS = 3
const ITEMS_PER_NEW_REQUEST = 4

export async function leadsJourney({ page, check, id, directory }) {
  const credentials = readLocalCredentials()
  const headers = { apikey: credentials.serviceKey, authorization: `Bearer ${credentials.serviceKey}`, 'content-type': 'application/json' }
  const rest = async (path, init = {}) => {
    const response = await localFetch(`${credentials.apiUrl}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init.headers } })
    assert.ok(response.ok, `${init.method ?? 'GET'} ${path.split('?')[0]} returned ${response.status}`)
    return response.status === 204 ? null : response.json()
  }
  const insert = (table, rows) => rest(table, { method: 'POST', body: JSON.stringify(rows), headers: { Prefer: 'return=representation' } })
  const tag = `smallfix-${id}`
  const minute = 60_000
  const base = Date.now() - 400 * 24 * 60 * minute
  const request = (name, createdAt) => ({ name, email: `${name.replaceAll(' ', '-')}@urblo.example.test`, project_name: `Synthetic ${tag}`, shipping_address: '1 Synthetic Street, Testville', source_route: '/contact?intent=sample-request', notification_status: 'not_required', created_at: new Date(createdAt).toISOString() })
  const newest = []

  const search = page.getByPlaceholder('Search name, email, company, context')
  const leadButton = name => page.getByTestId('lead-queue').getByRole('button').filter({ hasText: name })
  const notes = page.getByRole('textbox', { name: 'Internal notes', exact: true })
  const leadStatus = page.locator('[data-admin-feedback~="lead"] [role="status"]')
  const relogin = page.getByRole('dialog', { name: 'Sign in again to keep working', exact: true })
  const openLead = async name => {
    await search.fill(name)
    await expect(leadButton(name)).toHaveCount(1)
    await leadButton(name).click()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }

  await check('Leads newest sample requests show complete item lists with 600+ synthetic items', async () => {
    const old = await insert('sample_requests', Array.from({ length: OLD_REQUESTS }, (_, index) => request(`${tag} old ${String(index).padStart(3, '0')}`, base + index * minute)))
    await insert('sample_request_items', old.flatMap(row => Array.from({ length: ITEMS_PER_OLD_REQUEST }, (_, index) => ({ sample_request_id: row.id, quantity: 1, notes: `Older item ${index + 1}` }))))
    const fresh = await insert('sample_requests', Array.from({ length: NEW_REQUESTS }, (_, index) => request(`${tag} new ${index + 1}`, Date.now() - (NEW_REQUESTS - index) * 1000)))
    await insert('sample_request_items', fresh.flatMap(row => Array.from({ length: ITEMS_PER_NEW_REQUEST }, (_, index) => ({ sample_request_id: row.id, quantity: index + 1, notes: `Newest item ${index + 1} for ${row.name}` }))))
    newest.push(...fresh)
    // The fixture reproduces the old bug: the first 500 items by id never reach the newest requests.
    const firstFiveHundred = await rest('sample_request_items?select=id,sample_request_id&order=id.asc&limit=500')
    const freshIds = new Set(fresh.map(row => row.id))
    assert.ok(!firstFiveHundred.some(item => freshIds.has(item.sample_request_id)), 'Old oldest-first 500-row query must miss the newest requests')
    const total = await localFetch(`${credentials.apiUrl}/rest/v1/sample_request_items?select=id`, { method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' } })
    const count = Number(total.headers.get('content-range')?.split('/')[1])
    assert.ok(count >= 600, `Expected at least 600 sample items, found ${count}`)

    await page.goto(`${LOCAL_APP}/admin/leads`)
    await page.getByRole('button', { name: 'samples', exact: true }).click()
    for (const row of fresh) {
      await openLead(row.name)
      const items = page.getByText(new RegExp(`^Newest item \\d for ${row.name}$`))
      await expect(items).toHaveCount(ITEMS_PER_NEW_REQUEST)
      await expect(page.getByText('No sample items recorded for this request.', { exact: true })).toHaveCount(0)
    }
    await page.screenshot({ path: `${directory}/leads-newest-items.png`, fullPage: true })
  })

  await check('Leads queue is paginated and Load older reaches the oldest synthetic request', async () => {
    const oldest = `${tag} old 000`
    const pagination = page.getByTestId('lead-pagination')
    await search.fill(tag)
    await expect(pagination).toContainText('1–25 of')
    await expect(page.getByTestId('lead-queue').getByRole('button')).toHaveCount(25)
    await search.fill(oldest)
    await expect(page.getByText('No matching leads', { exact: true })).toBeVisible()
    await search.fill(tag)
    const older = pagination.getByRole('button', { name: /^(Older|Load older)$/ })
    for (let step = 0; step < 12 && await older.isEnabled(); step += 1) await older.click()
    await expect(pagination).toContainText('all loaded')
    await page.screenshot({ path: `${directory}/leads-pagination.png`, fullPage: true })
    await search.fill(oldest)
    await expect(leadButton(oldest)).toHaveCount(1)
  })

  await check('Leads expired sign-in mid-edit keeps the notes, offers re-login in place and finishes the save', async () => {
    const lead = newest[NEW_REQUESTS - 1]
    await openLead(lead.name)
    const text = `Call notes kept through re-login ${id}`
    await notes.fill(text)
    // Simulated JWT expiry: the stored session is marked expired and the refresh token is rejected,
    // so the client signs out exactly as it does when a real session can no longer be renewed.
    const refresh = route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'refresh_token_not_found', message: 'Invalid Refresh Token: Refresh Token Not Found' }) })
    await page.route('**/auth/v1/token?grant_type=refresh_token*', refresh)
    try {
      await page.evaluate(() => {
        const key = Object.keys(localStorage).find(name => name.startsWith('sb-') && name.endsWith('-auth-token'))
        const session = JSON.parse(localStorage.getItem(key))
        session.expires_at = Math.floor(Date.now() / 1000) - 60
        localStorage.setItem(key, JSON.stringify(session))
      })
      await page.getByRole('button', { name: 'Save workflow', exact: true }).click()
      await expect(relogin).toBeVisible()
      await expect(relogin).toContainText('Sign in again and your save will finish automatically.')
      await expect(relogin.getByTestId('admin-relogin-email')).toHaveText(LOCAL_ACCOUNTS.owner)
      assert.equal(new URL(page.url()).pathname, '/admin/leads', 'The expired sign-in must not redirect to login')
      await expect(notes).toHaveValue(text)
      await page.screenshot({ path: `${directory}/leads-relogin-panel.png`, fullPage: true })
    } finally { await page.unroute('**/auth/v1/token?grant_type=refresh_token*', refresh) }
    const [saved] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/sample_requests' && r.request().method() === 'PATCH' && r.ok()),
      (async () => {
        await relogin.getByLabel('Password', { exact: true }).fill(LOCAL_PASSWORD)
        await relogin.getByRole('button', { name: 'Sign in and save', exact: true }).click()
      })(),
    ])
    assert.equal(saved.status(), 200)
    await expect(relogin).toHaveCount(0)
    await expect(leadStatus).toContainText('Lead workflow updated.')
    await expect(notes).toHaveValue(text)
    const [row] = await rest(`sample_requests?id=eq.${lead.id}&select=internal_notes`)
    assert.equal(row.internal_notes, text)
  })

  await check('Leads save rejected with JWT expired opens re-login; after sign-in the save succeeds', async () => {
    const lead = newest[0]
    await openLead(lead.name)
    const text = `Notes saved after a rejected token ${id}`
    await notes.fill(text)
    let rejected = 0
    const expired = route => {
      if (route.request().method() !== 'PATCH' || rejected) return route.continue()
      rejected += 1
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST301', message: 'JWT expired', details: null, hint: null }) })
    }
    await page.route('**/rest/v1/sample_requests?*', expired)
    try {
      await page.getByRole('button', { name: 'Save workflow', exact: true }).click()
      await expect(relogin).toBeVisible()
      await expect(page.locator('[data-admin-feedback~="lead"] [role="alert"]')).toContainText('Your sign-in has expired. Sign in again to continue.')
      await relogin.getByLabel('Password', { exact: true }).fill(LOCAL_PASSWORD)
      await relogin.getByRole('button', { name: 'Sign in and save', exact: true }).click()
      await expect(relogin).toHaveCount(0)
      await expect(leadStatus).toContainText('Lead workflow updated.')
    } finally { await page.unroute('**/rest/v1/sample_requests?*', expired) }
    assert.equal(rejected, 1)
    const [row] = await rest(`sample_requests?id=eq.${lead.id}&select=internal_notes`)
    assert.equal(row.internal_notes, text)
  })

  await check('Editor role works a lead (status and notes) but cannot export', async () => {
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await page.waitForURL(url => url.origin === LOCAL_APP && url.pathname === '/admin/login')
    await page.getByLabel('Email', { exact: true }).fill(LOCAL_ACCOUNTS.editor)
    await page.getByLabel('Password', { exact: true }).fill(LOCAL_PASSWORD)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    // Sign out from Leads keeps /admin/leads as the login "next" target.
    await page.waitForURL(`${LOCAL_APP}/admin/leads`)
    await expect(page.getByRole('heading', { name: 'Leads', exact: true })).toBeVisible()
    const lead = newest[1]
    await openLead(lead.name)
    await expect(page.getByRole('button', { name: 'Export visible queue', exact: true })).toBeDisabled()
    await expect(page.getByText(/lead manager/i)).toHaveCount(0)
    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('confirmed')
    await notes.fill(`Editor follow-up ${id}`)
    await page.getByRole('button', { name: 'Save workflow', exact: true }).click()
    await expect(leadStatus).toContainText('Lead workflow updated.')
    const [row] = await rest(`sample_requests?id=eq.${lead.id}&select=status,internal_notes`)
    assert.deepEqual(row, { status: 'confirmed', internal_notes: `Editor follow-up ${id}` })
    await page.screenshot({ path: `${directory}/leads-editor-saved.png`, fullPage: true })
  })
}
