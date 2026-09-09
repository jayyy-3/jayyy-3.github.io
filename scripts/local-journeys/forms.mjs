import assert from 'node:assert/strict'
import { expect } from 'playwright/test'
import { LOCAL_APP, readLocalCredentials, localFetch } from '../_lib/local-environment.mjs'

export async function formsJourney({ page, context, check, id, directory }) {
  const credentials = readLocalCredentials()
  const headers = { apikey: credentials.serviceKey, authorization: `Bearer ${credentials.serviceKey}` }
  const read = async path => {
    const response = await localFetch(`${credentials.apiUrl}/rest/v1/${path}`, { headers })
    assert.equal(response.status, 200); return response.json()
  }
  for (const sample of [false, true]) {
    const kind = sample ? 'sample' : 'enquiry'
    const email = `${kind}-${id}@urblo.example.test`
    const table = sample ? 'sample_requests' : 'enquiries'
    await check(`${kind} UI submission persists locally and appears in the owner inbox`, async () => {
      const formPage = await context.newPage()
      try {
        await formPage.goto(`${LOCAL_APP}/contact${sample ? '?intent=sample-request' : ''}`)
        await formPage.getByLabel('Name', { exact: true }).fill(`Local ${kind} ${id}`)
        await formPage.getByLabel('Email', { exact: true }).fill(email)
        if (sample) {
          await formPage.getByLabel('Stone or sample preference', { exact: true }).fill('Synthetic test stone')
          await formPage.getByLabel('Shipping address', { exact: true }).fill('1 Synthetic Street, Testville')
        } else await formPage.getByLabel('Project notes', { exact: true }).fill(`Synthetic local enquiry ${id}. No external delivery.`)
        const [response] = await Promise.all([
          formPage.waitForResponse(r => new URL(r.url()).pathname === `/api/${sample ? 'sample-requests' : 'enquiries'}` && r.request().method() === 'POST'),
          formPage.getByRole('button', { name: sample ? 'Request samples' : 'Send enquiry', exact: true }).click(),
        ])
        assert.ok(response.ok(), JSON.stringify(await response.json()))
        await expect(formPage.getByText(sample ? 'Sample request received. Urblo will confirm availability and next steps.' : 'Project enquiry received. Urblo will review the brief and respond with practical next steps.', { exact: true })).toBeVisible()
        const rows = await read(`${table}?email=eq.${email}&select=id,email,notification_status`)
        assert.equal(rows.length, 1)
        assert.equal(rows[0].notification_status, 'not_required', 'Local app has no external notification credentials')
        if (sample) assert.equal((await read(`sample_request_items?sample_request_id=eq.${rows[0].id}&select=id`)).length, 1)
        const anonymous = await localFetch(`${credentials.apiUrl}/rest/v1/${table}?email=eq.${email}&select=id`, { headers: { apikey: credentials.anonKey } })
        assert.equal(anonymous.status, 401)
        await page.goto(`${LOCAL_APP}/admin/leads`)
        await page.getByPlaceholder('Search name, email, company, context').fill(email)
        const lead = page.getByRole('button').filter({ hasText: email })
        await expect(lead).toHaveCount(1); await lead.click()
        await expect(page.getByText(email, { exact: true }).first()).toBeVisible()
        await page.screenshot({ path: `${directory}/${kind}-inbox.png`, fullPage: true })
      } finally { await formPage.close() }
    })
  }
}
