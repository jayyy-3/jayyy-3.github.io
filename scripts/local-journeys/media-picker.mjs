import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { expect } from 'playwright/test'
import { LOCAL_APP } from '../_lib/local-environment.mjs'
import { fixturePng } from '../_lib/local-fixtures.mjs'

// NOW-OPT-ADMIN-MEDIA-PICKER-001: signed in as the Editor, a colleague picks and uploads images
// without leaving Products or Articles. The limits and accepted types are visible before a file
// is chosen, HEIC gets guidance, a synthetic 20 MB JPG is resized in the browser before it is
// uploaded, the description starts empty (never the file name), and existing images are found
// by searching the library. Every write targets the isolated local stack.

const MB = 1024 * 1024

/** A decodable 6000 × 4000 JPG padded with APP15 segments (like large camera metadata) to 20 MB. */
async function syntheticTwentyMegabyteJpeg(page) {
  const base64 = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 6000
    canvas.height = 4000
    const context = canvas.getContext('2d')
    const gradient = context.createLinearGradient(0, 0, 6000, 4000)
    gradient.addColorStop(0, '#5b6770')
    gradient.addColorStop(1, '#c9c2b4')
    context.fillStyle = gradient
    context.fillRect(0, 0, 6000, 4000)
    context.fillStyle = '#1d2327'
    for (let x = 0; x < 6000; x += 400) context.fillRect(x, 2600, 220, 900)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
    return btoa(binary)
  })
  const jpeg = Buffer.from(base64, 'base64')
  assert.equal(jpeg[0], 0xff); assert.equal(jpeg[1], 0xd8)
  const target = 20 * MB
  const segments = []
  let missing = target - jpeg.length
  while (missing > 0) {
    const payload = Math.min(65533, Math.max(1, missing - 4))
    const segment = Buffer.alloc(payload + 4)
    segment[0] = 0xff; segment[1] = 0xef
    segment.writeUInt16BE(payload + 2, 2)
    segments.push(segment)
    missing -= segment.length
  }
  const file = Buffer.concat([jpeg.subarray(0, 2), ...segments, jpeg.subarray(2)])
  assert.ok(file.length >= target, `synthetic JPG is ${file.length} bytes`)
  return file
}

export async function mediaPickerJourney({ page, check, id, directory }) {
  const fixtures = JSON.parse(readFileSync('.tmp/local/fixtures.json', 'utf8'))
  const [, articleB] = fixtures.articles
  const fixtureAlt = 'Synthetic local fixture'
  const heroField = page.getByTestId('product-hero-media-field')
  const productName = `Picker Product ${id}`
  const description = `Granite bench beside a city footpath ${id}`
  let uploadedId

  await check('Editor sees the image limits and HEIC guidance in Products before choosing a file', async () => {
    await page.goto(`${LOCAL_APP}/admin/products`)
    await expect(page.getByRole('button', { name: 'New product', exact: true })).toBeEnabled()
    await page.getByRole('button', { name: 'New product', exact: true }).click()
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(productName)
    await heroField.getByRole('button', { name: 'Choose image', exact: true }).click()
    await expect(heroField.getByTestId('product-hero-media-limits')).toHaveText('JPG, PNG, WebP, AVIF or GIF, up to 50 MB (GIF up to 10 MB).')
    await expect(heroField).toContainText('Large photos are resized to 2560 px')
    await heroField.locator('input[type=file]').setInputFiles({ name: `IMG_${id}.HEIC`, mimeType: 'image/heic', buffer: Buffer.from('not decoded') })
    await expect(heroField.getByRole('alert')).toContainText('Most Compatible')
    await page.screenshot({ path: `${directory}/picker-product-limits-heic.png`, fullPage: true })
  })

  await check('Editor uploads a 20 MB JPG in Products: resized in the browser, empty description, saved as the hero', async () => {
    const jpeg = await syntheticTwentyMegabyteJpeg(page)
    await heroField.locator('input[type=file]').setInputFiles({ name: `IMG_${id}.jpg`, mimeType: 'image/jpeg', buffer: jpeg })
    await expect(heroField.getByRole('status').filter({ hasText: 'Resized for the website: 20 MB →' })).toBeVisible({ timeout: 30000 })
    const alt = heroField.getByRole('textbox', { name: 'Image description', exact: true })
    await expect(alt).toHaveValue('')
    await expect(heroField.getByRole('button', { name: 'Upload image', exact: true })).toBeDisabled()
    await alt.fill(`IMG_${id}`)
    await heroField.getByRole('button', { name: 'Upload image', exact: true }).click()
    await expect(heroField.getByRole('alert')).toContainText('not the file name')
    await alt.fill(description)
    const [storageRequest, metadataResponse] = await Promise.all([
      page.waitForRequest(r => r.method() === 'POST' && new URL(r.url()).pathname.startsWith('/storage/v1/object/urblo-admin-media/product-editor/')),
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/media_assets' && r.request().method() === 'POST'),
      heroField.getByRole('button', { name: 'Upload image', exact: true }).click(),
    ])
    assert.ok((storageRequest.postDataBuffer()?.length ?? 0) < 10 * MB, 'uploaded body must be the resized image')
    assert.equal(metadataResponse.status(), 201)
    const created = await metadataResponse.json()
    const row = Array.isArray(created) ? created[0] : created
    uploadedId = row.id
    assert.equal(row.status, 'draft'); assert.equal(row.bucket, 'urblo-admin-media'); assert.equal(row.alt, description)
    // The picker reads back only the columns it shows; the inserted metadata carries the file facts.
    const inserted = metadataResponse.request().postDataJSON()
    assert.ok(inserted.size_bytes < 10 * MB, `stored size ${inserted.size_bytes}`)
    assert.equal(Math.max(inserted.width_px, inserted.height_px), 2560)
    assert.notEqual(inserted.mime_type, 'image/jpeg', 'the resized copy is uploaded, not the original JPG')
    await expect(heroField).toContainText(description)
    await expect(heroField).toContainText('Ask a Website owner or CMS manager to publish it from Media.')
    const [saved] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/products' && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Save product', exact: true }).click(),
    ])
    assert.equal(saved.status(), 201)
    const product = await saved.json()
    assert.equal((Array.isArray(product) ? product[0] : product).hero_media_id, uploadedId)
    await page.screenshot({ path: `${directory}/picker-product-uploaded.png`, fullPage: true })
  })

  await check('Products picker searches the library and the saved hero survives a reload', async () => {
    await page.reload()
    await page.getByRole('button').filter({ hasText: `URL: picker-product-${id}` }).click()
    await expect(heroField).toContainText(description)
    await heroField.getByRole('button', { name: 'Replace image', exact: true }).click()
    await heroField.getByRole('searchbox').fill(fixtureAlt)
    const grid = heroField.getByTestId('product-hero-media-thumbnail-grid')
    await expect(grid.getByRole('button')).toHaveCount(1)
    await grid.getByRole('button').filter({ hasText: fixtureAlt }).click()
    await expect(heroField).toContainText('Published image. It can appear on the website.')
    const [saved] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/products' && r.request().method() === 'PATCH'),
      page.getByRole('button', { name: 'Save product', exact: true }).click(),
    ])
    assert.equal(saved.status(), 200)
    assert.equal((await saved.json()).hero_media_id, fixtures.mediaId)
  })

  await check('Editor uploads an Article cover and picks a section image from the library', async () => {
    await page.goto(`${LOCAL_APP}/admin/articles`)
    await expect(page.getByRole('button', { name: 'New article', exact: true })).toBeEnabled()
    await page.getByRole('button').filter({ hasText: `URL: ${articleB.slug} /` }).click()
    const cover = page.getByTestId('article-cover-media-field')
    await cover.getByRole('button', { name: /Choose image|Replace image/ }).click()
    await expect(cover.getByTestId('article-cover-media-limits')).toBeVisible()
    await cover.locator('input[type=file]').setInputFiles({ name: `cover-${id}.png`, mimeType: 'image/png', buffer: fixturePng })
    const alt = cover.getByRole('textbox', { name: 'Image description', exact: true })
    await expect(alt).toHaveValue('')
    await alt.fill(`Article cover stone detail ${id}`)
    const [created] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/media_assets' && r.request().method() === 'POST'),
      cover.getByRole('button', { name: 'Upload image', exact: true }).click(),
    ])
    assert.equal(created.status(), 201)
    const coverRow = await created.json()
    const coverId = (Array.isArray(coverRow) ? coverRow[0] : coverRow).id
    const [saved] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/articles' && r.request().method() === 'PATCH'),
      page.getByRole('button', { name: 'Save article', exact: true }).click(),
    ])
    assert.equal(saved.status(), 200)
    assert.equal((await saved.json()).cover_media_id, coverId)

    const section = page.getByTestId('article-section-media-field')
    await section.getByRole('button', { name: /Choose image|Replace image/ }).click()
    await section.getByRole('searchbox').fill(fixtureAlt)
    await section.getByTestId('article-section-media-thumbnail-grid').getByRole('button').filter({ hasText: fixtureAlt }).click()
    const [block] = await Promise.all([
      page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/article_blocks' && ['POST', 'PATCH'].includes(r.request().method())),
      page.getByRole('button', { name: 'Save section', exact: true }).click(),
    ])
    assert.ok([200, 201].includes(block.status()), `section save ${block.status()}`)
    const blockRow = await block.json()
    assert.equal((Array.isArray(blockRow) ? blockRow[0] : blockRow).media_asset_id, fixtures.mediaId)
    await page.screenshot({ path: `${directory}/picker-article.png`, fullPage: true })
  })
}
