#!/usr/bin/env node
// Converts the self-hosted TTF fonts to WOFF2 next to the originals.
//
//   node scripts/convert-fonts-woff2.mjs          convert every TTF in public/fonts/urblo and rewrite the lock
//   node scripts/convert-fonts-woff2.mjs --check  verify WOFF2 files, lock and @font-face sources, no writes
//
// The encoder is wawoff2 (Google's woff2 reference encoder compiled to WebAssembly, Brotli quality 11),
// pinned exactly in package.json. The same wawoff2 version produces byte-identical output, so the lock
// records source and output hashes and --check detects stale or hand-edited files without re-encoding.
// Originals are kept: @font-face lists the WOFF2 first and the TTF as fallback.
// Licence basis: Jay confirmed on 2026-09-29 that a web font licence exists (obtained by the previous designer).
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fontDir = join(root, 'public', 'fonts', 'urblo')
const publicFontDir = '/fonts/urblo'
const lockPath = join(root, 'scripts', 'web-fonts-woff2.lock.json')
const cssPath = join(root, 'src', 'index.css')

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 16)
const ttfSources = () => readdirSync(fontDir).filter((name) => name.endsWith('.ttf')).sort()
const woff2Name = (ttf) => ttf.replace(/\.ttf$/, '.woff2')

async function convert() {
  const { default: wawoff2 } = await import('wawoff2')
  const version = JSON.parse(readFileSync(join(root, 'node_modules', 'wawoff2', 'package.json'), 'utf8')).version
  const lock = { generator: { script: 'scripts/convert-fonts-woff2.mjs', tool: 'wawoff2', version }, fonts: {} }
  let ttfBytes = 0
  let woff2Bytes = 0
  for (const ttf of ttfSources()) {
    const input = readFileSync(join(fontDir, ttf))
    const output = Buffer.from(await wawoff2.compress(input))
    writeFileSync(join(fontDir, woff2Name(ttf)), output)
    lock.fonts[ttf] = { bytes: input.length, sha256: sha(input), woff2: { bytes: output.length, sha256: sha(output) } }
    ttfBytes += input.length
    woff2Bytes += output.length
    console.log(`${ttf} ${input.length} B -> ${woff2Name(ttf)} ${output.length} B (${((1 - output.length / input.length) * 100).toFixed(1)}% smaller)`)
  }
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
  console.log(`\nTotal TTF ${ttfBytes} B -> WOFF2 ${woff2Bytes} B (wawoff2 ${version})`)
}

function check() {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  const css = readFileSync(cssPath, 'utf8')
  const failures = []
  const sources = ttfSources()
  for (const ttf of sources) {
    const locked = lock.fonts[ttf]
    if (!locked) {
      failures.push(`TTF without a WOFF2 lock entry: ${ttf}`)
      continue
    }
    if (sha(readFileSync(join(fontDir, ttf))) !== locked.sha256) failures.push(`TTF changed since conversion: ${ttf}`)
    const woff2 = join(fontDir, woff2Name(ttf))
    if (!existsSync(woff2)) failures.push(`missing WOFF2: ${woff2Name(ttf)}`)
    else if (sha(readFileSync(woff2)) !== locked.woff2.sha256) failures.push(`WOFF2 differs from lock: ${woff2Name(ttf)}`)
    // Every @font-face that uses the TTF must list its WOFF2 first, with the TTF kept as fallback.
    const ttfUrl = `url('${publicFontDir}/${ttf}') format('truetype')`
    const pair = `url('${publicFontDir}/${woff2Name(ttf)}') format('woff2'), ${ttfUrl}`
    if (css.includes(ttfUrl) && css.split(ttfUrl).length !== css.split(pair).length) {
      failures.push(`src/index.css: ${ttf} must be preceded by its WOFF2 in the same src list`)
    }
  }
  for (const ttf of Object.keys(lock.fonts)) {
    if (!sources.includes(ttf)) failures.push(`stale lock entry (TTF removed): ${ttf}`)
  }
  if (failures.length) {
    console.error(`Web font WOFF2 files are out of date (run node scripts/convert-fonts-woff2.mjs):\n  ${failures.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`Web fonts: ${sources.length} TTFs, WOFF2 files match the lock (${lock.generator.tool} ${lock.generator.version}).`)
}

if (process.argv.includes('--check')) check()
else await convert()
