import { assertArticleSaveUnlocked } from '../_lib/article-assertions.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { expect } from 'playwright/test'
import { LOCAL_APP, readLocalCredentials, localFetch } from '../_lib/local-environment.mjs'

export async function articleJourney({ page, context, check, id, directory }) {
  const fixtures = JSON.parse(readFileSync('.tmp/local/fixtures.json', 'utf8'))
  const [a, b] = fixtures.articles
  const title = `Local Article A ${id}`
  const field = name => page.getByRole('textbox', { name, exact: true })
  const item = slug => page.getByRole('button').filter({ hasText: `URL: ${slug} /` })
  const ready = () => expect(page.getByRole('button', { name: 'New article', exact: true })).toBeEnabled()
  const save = async (name, table) => {
    const [response] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === `/rest/v1/${table}` && r.request().method() === 'PATCH'),
      page.getByRole('button', { name, exact: true }).click(),
    ])
    const data = await response.json()
    assert.equal(response.status(), 200, JSON.stringify(data))
    await expect(page.getByRole('button', { name, exact: true })).toBeEnabled()
    return { response, data }
  }
  await check('Articles invalid Save recovers and failed API Save preserves entered content', async () => {
    await page.goto(`${LOCAL_APP}/admin/articles`); await ready()
    await item(a.slug).click(); await ready()
    await field('Title').fill('   ')
    await page.getByRole('button', { name: 'Save article', exact: true }).click()
    await expect(page.getByText('Article title is required.', { exact: true })).toBeVisible()
    await assertArticleSaveUnlocked(page)
    await field('Title').fill(title)
    const pattern = '**/rest/v1/articles?*'
    const fail = route => route.request().method() === 'PATCH'
      ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Synthetic article save failure', code: 'LOCAL_FAULT' }) }) : route.continue()
    await page.route(pattern, fail)
    try {
      await page.getByRole('button', { name: 'Save article', exact: true }).click()
      await expect(page.getByText('Synthetic article save failure', { exact: true })).toBeVisible()
      await expect(field('Title')).toHaveValue(title)
      await assertArticleSaveUnlocked(page)
      await page.screenshot({ path: `${directory}/article-failed-save.png`, fullPage: true })
    } finally { await page.unroute(pattern, fail) }
    const saved = await save('Save article', 'articles')
    assert.equal(saved.data.id, a.id)
    await page.reload(); await ready(); await item(a.slug).click(); await ready()
    await expect(field('Title')).toHaveValue(title)
  })
  await check('Articles section Save stays bound to its parent and locks switching until completion', async () => {
    await field('Article copy').fill(`Local body A ${id}`)
    let release, observed
    const held = new Promise(resolve => { release = resolve })
    const started = new Promise(resolve => { observed = resolve })
    const pattern = '**/rest/v1/article_blocks?*'
    const delayed = async route => {
      if (route.request().method() !== 'PATCH') return route.continue()
      const url = new URL(route.request().url())
      assert.equal(url.searchParams.get('article_id'), `eq.${a.id}`)
      assert.ok(url.searchParams.get('id'))
      observed(); await held; await route.continue()
    }
    await page.route(pattern, delayed)
    try {
      const saved = save('Save section', 'article_blocks')
      await started
      await expect(item(b.slug)).toBeDisabled()
      release()
      const result = await saved
      assert.equal(result.data.article_id, a.id)
      assert.equal(result.data.content.body, `Local body A ${id}`)
    } finally { release(); await page.unroute(pattern, delayed) }
    await item(b.slug).click(); await ready()
    await expect(field('Article copy')).not.toHaveValue(`Local body A ${id}`)
    await item(a.slug).click(); await ready()
    await expect(field('Article copy')).toHaveValue(`Local body A ${id}`)
    await page.reload(); await ready(); await item(a.slug).click(); await ready()
    await expect(field('Article copy')).toHaveValue(`Local body A ${id}`)
  })
  await check('Articles delayed selection blocks a second switch and displays the correct parent after release', async () => {
    let release, observed
    const held = new Promise(resolve => { release = resolve })
    const started = new Promise(resolve => { observed = resolve })
    const pattern = '**/rest/v1/article_blocks?*'
    const delayed = async route => {
      if (route.request().method() === 'GET' && new URL(route.request().url()).searchParams.get('article_id') === `eq.${b.id}`) {
        observed(); await held
      }
      await route.continue()
    }
    await page.route(pattern, delayed)
    try {
      await item(b.slug).click(); await started
      await expect(page.locator('[aria-busy=true][inert]')).toHaveCount(1)
      await expect(page.getByRole('button', { name: 'New article', exact: true })).toBeDisabled()
      release(); await ready()
      await expect(field('Title')).toHaveValue(b.title)
      await expect(field('Article copy')).not.toHaveValue(`Local body A ${id}`)
    } finally { release(); await page.unroute(pattern, delayed) }
    await item(a.slug).click(); await ready()
    await expect(field('Title')).toHaveValue(title)
  })
  await check('Articles published parent and section render together and archive removes public content', async () => {
    await page.getByLabel('Published on', { exact: true }).fill('2026-09-09')
    await save('Save article', 'articles')
    await save('Publish article', 'articles')
    const publicPage = await context.newPage()
    try {
      await publicPage.goto(`${LOCAL_APP}/articles/${a.slug}`)
      await expect(publicPage.getByRole('heading', { name: title, exact: true })).toBeVisible()
      await expect(publicPage.getByText(`Local body A ${id}`, { exact: true })).toBeVisible()
      await publicPage.screenshot({ path: `${directory}/article-public.png`, fullPage: true })
    } finally { await publicPage.close() }
    // NOW-OPT-ADMIN-SAFETY-001: Save on a live article names the live effect and waits for
    // confirmation; Keep editing writes nothing. The published URL key is locked.
    await expect(field('Website URL key')).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Save article', exact: true })).toHaveCount(0)
    await field('Excerpt').fill(`Live excerpt ${id}`)
    const writes = []
    const recordWrite = request => { if (request.method() === 'PATCH' && new URL(request.url()).pathname === '/rest/v1/articles') writes.push(request.url()) }
    page.on('request', recordWrite)
    try {
      await page.getByRole('button', { name: 'Update live page', exact: true }).click()
      const dialog = page.getByRole('dialog', { name: 'Update the live article?', exact: true })
      await expect(dialog).toContainText(`/articles/${a.slug}`)
      await page.screenshot({ path: `${directory}/article-live-save-confirm.png`, fullPage: true })
      await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      assert.deepEqual(writes, [])
      await expect(field('Excerpt')).toHaveValue(`Live excerpt ${id}`)
      await page.getByRole('button', { name: 'Update live page', exact: true }).click()
      const [response] = await Promise.all([
        page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/articles' && r.request().method() === 'PATCH'),
        dialog.getByRole('button', { name: 'Update live page', exact: true }).click(),
      ])
      assert.equal(response.status(), 200)
      assert.equal((await response.json()).status, 'published')
      assert.equal(writes.length, 1)
    } finally { page.off('request', recordWrite) }
    await expect(page.getByRole('button', { name: 'Update live page', exact: true })).toBeEnabled()
    await save('Archive article', 'articles')
    const credentials = readLocalCredentials()
    const response = await localFetch(`${credentials.apiUrl}/rest/v1/articles?slug=eq.${a.slug}&select=id`, { headers: { apikey: credentials.anonKey } })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), [])
  })
  await check('Articles new draft URL key follows the title until edited', async () => {
    // NOW-OPT-ADMIN-SAFETY-001: nothing is saved here; the key is editable before first publish.
    await page.getByRole('button', { name: 'New article', exact: true }).click()
    await field('Title').fill(`Local Draft Key ${id}`)
    await expect(field('Website URL key')).toHaveValue(`local-draft-key-${id}`)
    await expect(field('Website URL key')).toBeEnabled()
    await field('Website URL key').fill(`custom-key-${id}`)
    await field('Title').fill(`Local Draft Key Renamed ${id}`)
    await expect(field('Website URL key')).toHaveValue(`custom-key-${id}`)
    await expect(page.getByRole('button', { name: 'Save article', exact: true })).toBeEnabled()
  })
}
