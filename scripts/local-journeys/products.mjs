import assert from 'node:assert/strict'
import { expect } from 'playwright/test'
import { LOCAL_APP } from '../_lib/local-environment.mjs'

// NOW-OPT-ADMIN-SHARED-UX-001: Products shows save results beside the action bar within 1 s
// (announced), translates real database and network errors into plain English with the raw
// text behind Details, and guards unsaved edits on record switch, navigation, Sign out and
// refresh. Every write targets the isolated local stack with a synthetic product.
export async function productJourney({ page, check, id, directory }) {
  const name = `Local Product ${id}`
  const slug = `local-product-${id}`
  const field = label => page.getByRole('textbox', { name: label, exact: true })
  const ready = () => expect(page.getByRole('button', { name: 'New product', exact: true })).toBeEnabled()
  const productStatus = page.locator('[data-admin-feedback~="product"] [role="status"]')
  const productAlert = page.locator('[data-admin-feedback~="product"] [role="alert"]')
  const guardDialog = page.getByRole('dialog', { name: 'Save your changes first?', exact: true })
  const item = page.getByRole('button').filter({ hasText: `URL: ${slug}` })

  await check('Products save result appears beside the action bar within 1 s and is announced', async () => {
    await page.goto(`${LOCAL_APP}/admin/products`); await ready()
    await page.getByRole('button', { name: 'New product', exact: true }).click()
    await field('Name').fill(name)
    await expect(field('Website URL key')).toHaveValue(slug)
    const [response] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/products' && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Save product', exact: true }).click(),
    ])
    assert.equal(response.status(), 201)
    await expect(productStatus).toContainText('Product saved.', { timeout: 1000 })
    await expect(productStatus).toHaveAttribute('aria-live', 'polite')
    await ready()
    await expect(item).toHaveCount(1)
    await page.screenshot({ path: `${directory}/product-saved-feedback.png`, fullPage: true })
  })

  await check('Products duplicate URL key shows a plain-English error with the database text in Details', async () => {
    await page.getByRole('button', { name: 'New product', exact: true }).click()
    await field('Name').fill(name)
    await expect(field('Website URL key')).toHaveValue(slug)
    const [response] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/products' && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Save product', exact: true }).click(),
    ])
    assert.equal(response.status(), 409)
    await expect(productAlert).toContainText('That website URL key is already used by another product. Change the URL key and save again.')
    await expect(productAlert.getByText('duplicate key value', { exact: false })).toBeHidden()
    await productAlert.getByText('Details', { exact: true }).click()
    await expect(productAlert).toContainText('products_slug_key')
    await expect(field('Name')).toHaveValue(name)
    await page.screenshot({ path: `${directory}/product-duplicate-error.png`, fullPage: true })
  })

  await check('Products record switch with unsaved edits offers Keep editing and Discard', async () => {
    // The unsaved duplicate from the previous step is still in the form.
    await item.click()
    await expect(guardDialog).toBeVisible()
    await expect(guardDialog).toContainText('Product details')
    await expect(guardDialog.getByRole('button', { name: 'Save and continue', exact: true })).toBeVisible()
    await page.screenshot({ path: `${directory}/product-unsaved-guard.png` })
    await guardDialog.getByRole('button', { name: 'Keep editing', exact: true }).click()
    await expect(guardDialog).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'New product', exact: true })).toBeVisible()
    await item.click()
    await guardDialog.getByRole('button', { name: 'Discard changes', exact: true }).click()
    await ready()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(field('Website URL key')).toHaveValue(slug)
  })

  await check('Products network failure is translated and keeps the edit; refresh and Sign out warn', async () => {
    const description = `Offline edit ${id}`
    await page.getByRole('textbox', { name: 'Short description', exact: true }).fill(description)
    const pattern = '**/rest/v1/products?*'
    const offline = route => route.request().method() === 'PATCH' ? route.abort('internetdisconnected') : route.continue()
    await page.route(pattern, offline)
    try {
      await page.getByRole('button', { name: 'Save product', exact: true }).click()
      await expect(productAlert).toContainText('Could not reach the website server. Check your internet connection, then try again. Your changes are still on this page.')
      await expect(page.getByRole('textbox', { name: 'Short description', exact: true })).toHaveValue(description)
    } finally { await page.unroute(pattern, offline) }
    const refreshBlocked = await page.evaluate(() => {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    })
    assert.equal(refreshBlocked, true, 'Refresh/close must warn while edits are unsaved')
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(guardDialog).toContainText('sign out')
    await guardDialog.getByRole('button', { name: 'Keep editing', exact: true }).click()
    assert.equal(new URL(page.url()).pathname, '/admin/products')
  })

  await check('Products navigation guard saves then continues to the chosen module', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Media', exact: true }).click()
    await expect(guardDialog).toBeVisible()
    assert.equal(new URL(page.url()).pathname, '/admin/products')
    const [response] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/products' && r.request().method() === 'PATCH'),
      guardDialog.getByRole('button', { name: 'Save and continue', exact: true }).click(),
    ])
    assert.equal(response.status(), 200)
    assert.equal((await response.json()).short_description, `Offline edit ${id}`)
    await page.waitForURL(`${LOCAL_APP}/admin/media`)
    // The URL changes before the lazily loaded Media screen replaces Products; judge the settled page.
    await expect(page.getByRole('button', { name: 'External media', exact: true })).toBeEnabled()
    await expect.poll(() => page.evaluate(() => {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }), { message: 'A clean page must not warn on refresh' }).toBe(false)
  })
}
