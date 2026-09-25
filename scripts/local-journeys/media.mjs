import assert from 'node:assert/strict'
import { expect } from 'playwright/test'
import { LOCAL_APP } from '../_lib/local-environment.mjs'

// NOW-OPT-ADMIN-SHARED-UX-001: Media translates an expired sign-in into plain English (raw
// text in Details), guards unsaved edits on record switch and navigation, and asks before
// archiving published media. The expired-session response is simulated in the browser only;
// Keep editing / Discard never write, so the published synthetic fixture is left unchanged.
export async function mediaJourney({ page, check, id, directory }) {
  const fixtureAlt = 'Synthetic local fixture'
  const caption = page.getByRole('textbox', { name: 'Caption', exact: true })
  const guardDialog = page.getByRole('dialog', { name: 'Save your changes first?', exact: true })
  const mediaAlert = page.locator('[data-admin-feedback~="media"] [role="alert"]')
  const openFixture = async () => {
    await page.getByPlaceholder('Search description, source, location, type').fill(fixtureAlt)
    await page.getByRole('button').filter({ hasText: fixtureAlt }).first().click()
    await expect(page.getByRole('textbox', { name: 'Alt text', exact: true })).toHaveValue(fixtureAlt)
  }
  const writes = []
  const recordWrite = request => {
    if (['PATCH', 'POST'].includes(request.method()) && new URL(request.url()).pathname === '/rest/v1/media_assets') writes.push(request.url())
  }

  await check('Media record switch with unsaved edits offers Keep editing and Discard', async () => {
    await page.goto(`${LOCAL_APP}/admin/media`)
    await expect(page.getByRole('button', { name: 'External media', exact: true })).toBeEnabled()
    await openFixture()
    await caption.fill(`Unsaved caption ${id}`)
    await page.getByRole('button', { name: 'External media', exact: true }).click()
    await expect(guardDialog).toContainText('Media details')
    await page.screenshot({ path: `${directory}/media-unsaved-guard.png` })
    await guardDialog.getByRole('button', { name: 'Keep editing', exact: true }).click()
    await expect(caption).toHaveValue(`Unsaved caption ${id}`)
    await page.getByRole('button', { name: 'External media', exact: true }).click()
    await guardDialog.getByRole('button', { name: 'Discard changes', exact: true }).click()
    await expect(page.getByRole('textbox', { name: 'Alt text', exact: true })).toHaveValue('')
  })

  await check('Media expired sign-in is translated, keeps the edit, and live Archive asks first', async () => {
    await openFixture()
    await caption.fill(`Expired session caption ${id}`)
    const pattern = '**/rest/v1/media_assets?*'
    const expired = route => route.request().method() === 'PATCH'
      ? route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST301', message: 'JWT expired', details: null, hint: null }) })
      : route.continue()
    await page.route(pattern, expired)
    try {
      const liveSave = page.locator('form').filter({ has: caption }).getByRole('button', { name: 'Update live page', exact: true }).first()
      await liveSave.click()
      const confirm = page.getByRole('dialog', { name: 'Update the live media item?', exact: true })
      await confirm.getByRole('button', { name: 'Update live page', exact: true }).click()
      await expect(mediaAlert).toContainText('Your sign-in has expired. Open the admin in a new tab, sign in again, then come back here and save.')
      await expect(mediaAlert).toContainText('JWT expired')
      await expect(caption).toHaveValue(`Expired session caption ${id}`)
      await page.screenshot({ path: `${directory}/media-expired-session.png`, fullPage: true })
    } finally { await page.unroute(pattern, expired) }

    page.on('request', recordWrite)
    try {
      await page.getByRole('button', { name: 'Archive media', exact: true }).first().click()
      const archive = page.getByRole('dialog', { name: 'Archive this live media item?', exact: true })
      await expect(archive).toContainText('every public page that shows this media')
      await page.screenshot({ path: `${directory}/media-archive-confirm.png` })
      await archive.getByRole('button', { name: 'Keep editing', exact: true }).click()
      await expect(archive).toHaveCount(0)
      assert.deepEqual(writes, [], 'Keep editing must not archive the media item')
    } finally { page.off('request', recordWrite) }
  })

  await check('Media navigation guard discards and leaves; the fixture keeps its saved caption', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Products', exact: true }).click()
    await expect(guardDialog).toBeVisible()
    await guardDialog.getByRole('button', { name: 'Discard changes', exact: true }).click()
    await page.waitForURL(`${LOCAL_APP}/admin/products`)
    await page.goto(`${LOCAL_APP}/admin/media`)
    await openFixture()
    await expect(caption).not.toHaveValue(`Expired session caption ${id}`)
  })
}
