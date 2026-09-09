import assert from 'node:assert/strict'
import { expect } from 'playwright/test'
import { fixturePng } from '../_lib/local-fixtures.mjs'
import { LOCAL_APP, readLocalCredentials, localFetch } from '../_lib/local-environment.mjs'

export async function projectJourney({ page, context, check, id, directory }) {
  const title = `Local Project ${id}`
  let savedEnvelope
  const credentials = readLocalCredentials()
  const publicRows = async slug => {
    const response = await localFetch(`${credentials.apiUrl}/rest/v1/projects?slug=eq.${slug}&select=id,title,status`, { headers: { apikey: credentials.anonKey } })
    assert.equal(response.status, 200); return response.json()
  }
  const action = async name => {
    const [response] = await Promise.all([
      page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/projects' && response.request().method() === 'POST'),
      page.getByRole('button', { name, exact: true }).click(),
    ])
    const result = await response.json()
    assert.equal(response.status(), 200, JSON.stringify(result))
    return result
  }
  await check('Projects private image and draft Save survive refresh', async () => {
    const loaded = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/projects' && response.request().method() === 'GET')
    await page.goto(`${LOCAL_APP}/admin/projects`); assert.equal((await loaded).status(), 200)
    await page.getByRole('button', { name: 'New project', exact: true }).click()
    await page.getByRole('textbox', { name: 'Project title', exact: true }).fill(title)
    await page.getByRole('textbox', { name: 'Opening line', exact: true }).fill('Synthetic local project introduction.')
    await page.getByRole('textbox', { name: 'Project story', exact: true }).fill('Synthetic local project story for repeatable workflow verification.')
    await page.getByRole('button', { name: 'Choose image', exact: true }).first().click()
    await page.locator('input[type=file]').first().setInputFiles({ name: `local-project-${id}.png`, mimeType: 'image/png', buffer: fixturePng })
    await page.getByRole('button', { name: 'Upload original', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Upload original', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled({ timeout: 15000 })
    savedEnvelope = await action('Save')
    assert.ok(savedEnvelope.projectId, JSON.stringify(savedEnvelope))
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('textbox', { name: 'Project title', exact: true })).toHaveValue(title)
    await expect(page.getByRole('textbox', { name: 'Opening line', exact: true })).toHaveValue('Synthetic local project introduction.')
    assert.deepEqual(await publicRows(savedEnvelope.draft.project.slug), [])
    await page.screenshot({ path: `${directory}/project-draft.png`, fullPage: true })
  })
  await check('Projects New cancels a delayed existing draft without staying busy or overwriting the new form', async () => {
    let release
    let observed
    const held = new Promise(resolve => { release = resolve })
    const started = new Promise(resolve => { observed = resolve })
    const pattern = '**/api/admin/projects?projectId=*'
    const handler = async route => {
      observed()
      await held
      await route.continue()
    }
    await page.route(pattern, handler)
    try {
      await page.reload()
      await started
      await page.getByRole('button', { name: 'New project', exact: true }).click()
      await expect(page.getByRole('textbox', { name: 'Project title', exact: true })).toHaveValue('')
      const returned = page.waitForResponse(response => response.url().includes(`/api/admin/projects?projectId=${savedEnvelope.projectId}`))
      release()
      await returned
      await expect(page.getByRole('textbox', { name: 'Project title', exact: true })).toHaveValue('')
    } finally {
      release()
      await page.unroute(pattern, handler)
    }
    await page.goto(`${LOCAL_APP}/admin/projects/${savedEnvelope.projectId}`)
    await expect(page.getByRole('textbox', { name: 'Project title', exact: true })).toHaveValue(title)
  })
  await check('Projects Publish exposes approved parent and Hide removes it', async () => {
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeEnabled()
    const published = await action('Publish')
    const rows = await publicRows(published.draft.project.slug)
    assert.equal(rows.length, 1); assert.equal(rows[0].title, title)
    const publicPage = await context.newPage()
    await publicPage.goto(`${LOCAL_APP}/projects/${published.draft.project.slug}`)
    await expect(publicPage.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await publicPage.screenshot({ path: `${directory}/project-public.png`, fullPage: true })
    await publicPage.close()
    await action('Hide')
    assert.deepEqual(await publicRows(published.draft.project.slug), [])
  })
}
