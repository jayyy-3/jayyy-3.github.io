import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { LOCAL_ACCOUNTS, LOCAL_PASSWORD, localFetch, assertLocalOrigin } from './local-environment.mjs'

function pngChunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  let crc = 0xffffffff
  for (const byte of body) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0) }
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return Buffer.concat([size, body, checksum])
}
function syntheticPng() {
  const header = Buffer.alloc(13); header.writeUInt32BE(64, 0); header.writeUInt32BE(64, 4); header[8] = 8; header[9] = 2
  const pixels = Buffer.alloc(64 * (1 + 64 * 3))
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const offset = y * 193 + 1 + x * 3; pixels[offset] = 100 + x; pixels[offset + 1] = 110 + y; pixels[offset + 2] = 120 }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(pixels)), pngChunk('IEND', Buffer.alloc(0))])
}
export const fixturePng = syntheticPng()

export async function seedLocalFixtures(credentials) {
  assertLocalOrigin(credentials.apiUrl)
  const headers = { apikey: credentials.serviceKey, authorization: `Bearer ${credentials.serviceKey}`, 'content-type': 'application/json' }
  async function request(path, { method = 'GET', body, extraHeaders = {} } = {}) {
    const response = await localFetch(`${credentials.apiUrl}${path}`, { method, headers: { ...headers, ...extraHeaders }, ...(body !== undefined ? { body: body instanceof Buffer ? body : JSON.stringify(body) } : {}) })
    if (!response.ok) throw new Error(`Synthetic seed ${method} ${path.split('?')[0]} returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`)
    const text = await response.text(); return text ? JSON.parse(text) : null
  }
  const users = {}
  const existing = (await request('/auth/v1/admin/users?per_page=1000')).users
  for (const [role, email] of Object.entries(LOCAL_ACCOUNTS)) {
    let user = existing.find(item => item.email === email)
    if (!user) user = await request('/auth/v1/admin/users', { method: 'POST', body: { email, password: LOCAL_PASSWORD, email_confirm: true, user_metadata: { display_name: `Local ${role}` } } })
    users[role] = user.id
    if (role !== 'outsider') await request('/rest/v1/admin_profiles?on_conflict=user_id', { method: 'POST', body: { user_id: user.id, email, display_name: `Local ${role}`, role, is_active: true }, extraHeaders: { Prefer: 'resolution=merge-duplicates' } })
  }
  const articles = []
  for (const letter of ['a', 'b']) {
    const slug = `local-article-${letter}`
    let rows = await request(`/rest/v1/articles?slug=eq.${slug}&select=*`)
    if (!rows.length) rows = await request('/rest/v1/articles', { method: 'POST', body: { slug, title: `Local Article ${letter.toUpperCase()}`, status: 'draft', author: 'Synthetic editor', excerpt: 'Synthetic local workflow fixture.', created_by: users.owner, updated_by: users.owner }, extraHeaders: { Prefer: 'return=representation' } })
    const article = rows[0]
    const blocks = await request(`/rest/v1/article_blocks?article_id=eq.${article.id}&select=*`)
    if (!blocks.length) await request('/rest/v1/article_blocks', { method: 'POST', body: { article_id: article.id, block_type: 'rich_text', content: { body: `Local body ${letter.toUpperCase()}` }, status: 'published', created_by: users.owner, updated_by: users.owner } })
    articles.push({ id: article.id, slug, title: article.title })
  }
  const path = 'synthetic/local-pixel.png'
  await request(`/storage/v1/object/urblo-public-media/${path}`, { method: 'POST', body: fixturePng, extraHeaders: { 'content-type': 'image/png', 'x-upsert': 'true' } })
  let media = await request(`/rest/v1/media_assets?object_path=eq.${path}&select=*`)
  if (!media.length) media = await request('/rest/v1/media_assets', { method: 'POST', body: { status: 'published', bucket: 'urblo-public-media', object_path: path, source_kind: 'storage', media_type: 'image', mime_type: 'image/png', width_px: 64, height_px: 64, size_bytes: fixturePng.length, alt: 'Synthetic local fixture', created_by: users.owner, updated_by: users.owner }, extraHeaders: { Prefer: 'return=representation' } })
  mkdirSync('.tmp/local', { recursive: true })
  writeFileSync('.tmp/local/synthetic.png', fixturePng)
  const fixture = { synthetic: true, users, articles, mediaId: media[0].id }
  writeFileSync('.tmp/local/fixtures.json', JSON.stringify(fixture, null, 2) + '\n', { mode: 0o600 })
  return fixture
}
