#!/usr/bin/env node
// Generates responsive WebP variants for the static images that public pages reference.
//
//   node scripts/generate-static-image-variants.mjs          regenerate variants + manifests
//   node scripts/generate-static-image-variants.mjs --check  verify manifests and files, no writes
//
// Originals stay untouched in public/. Variants are written to
// public/media/variants/<original path without extension>-<width>w.webp with fixed encoder settings
// (single-threaded sharp, no cache), so the same sharp/libvips version produces byte-identical files.
// The runtime manifest (src/data/staticImageVariants.json) holds only intrinsic sizes and widths;
// the lock (scripts/static-image-variants.lock.json) holds source and output hashes so --check can
// detect stale or hand-edited variants without re-encoding.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const variantDir = join(publicDir, 'media', 'variants')
const manifestPath = join(root, 'src', 'data', 'staticImageVariants.json')
const lockPath = join(root, 'scripts', 'static-image-variants.lock.json')

// Inputs: raster images under these public roots, at least MIN_BYTES, whose file name is referenced
// by page code or content (paths are sometimes assembled from a folder constant plus a file name).
const SOURCE_ROOTS = ['media/launch', 'products', 'images']
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MIN_BYTES = 100 * 1024
const REFERENCE_ROOTS = ['src', 'public/articles', 'functions']
const REFERENCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.json', '.html', '.css'])

// Width ladder. A step is used when it is clearly below the source width; the source width (capped
// at the top step) is the largest candidate, so nothing is upscaled.
const WIDTH_LADDER = [480, 768, 1200, 1600, 2400]
const LADDER_HEADROOM = 0.9
// When the full-width WebP is not clearly smaller than an already web-friendly original, the
// original itself is the top srcset candidate instead of a near-duplicate variant.
const TOP_VARIANT_MAX_RATIO = 0.7

const ENCODERS = {
  photo: { quality: 72, alphaQuality: 90, effort: 6, smartSubsample: false },
  // Imagery that always sits under a >= 40% dark overlay (route banners, hero poster, section
  // backdrops); compression artefacts are not visible through the scrim.
  overlay: { quality: 60, alphaQuality: 90, effort: 6, smartSubsample: false },
  // Finish swatches (timber, galvanised steel) are inspected for surface grain; keep the noise.
  texture: { quality: 88, alphaQuality: 90, effort: 6, smartSubsample: true },
}
const OVERLAY_SOURCES = [
  /^\/media\/launch\/banners\//,
  /^\/media\/launch\/home\/hero-poster\./,
  /^\/media\/launch\/homepage\/(partner-banner|manifesto-bg|video-cta-bg)/,
]
const TEXTURE_SOURCES = [/^\/products\/(battens|frame)\//]
const encoderFor = (publicPath) => {
  if (OVERLAY_SOURCES.some((pattern) => pattern.test(publicPath))) return 'overlay'
  if (TEXTURE_SOURCES.some((pattern) => pattern.test(publicPath))) return 'texture'
  return 'photo'
}

function plannedWidths(sourceWidth) {
  const top = Math.min(sourceWidth, WIDTH_LADDER[WIDTH_LADDER.length - 1])
  return [...WIDTH_LADDER.filter((width) => width < top * LADDER_HEADROOM), top]
}

function variantPath(publicPath, width) {
  return `/media/variants${publicPath.slice(0, -extname(publicPath).length)}-${width}w.webp`
}

const toPosix = (value) => value.split(sep).join('/')
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 16)

function walk(directory, visit) {
  if (!existsSync(directory)) return
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) walk(full, visit)
    else visit(full)
  }
}

function referenceCorpus() {
  const parts = []
  for (const referenceRoot of REFERENCE_ROOTS) {
    walk(join(root, referenceRoot), (file) => {
      if (!REFERENCE_EXTENSIONS.has(extname(file))) return
      if (file.endsWith('staticImageVariants.json') || /\.test\.tsx?$/.test(file)) return
      parts.push(readFileSync(file, 'utf8'))
    })
  }
  return parts.join('\n')
}

function collectSources() {
  const corpus = referenceCorpus()
  const selected = []
  const skippedUnreferenced = []
  for (const sourceRoot of SOURCE_ROOTS) {
    walk(join(publicDir, sourceRoot), (file) => {
      if (!SOURCE_EXTENSIONS.has(extname(file).toLowerCase())) return
      if (statSync(file).size < MIN_BYTES) return
      const publicPath = `/${toPosix(relative(publicDir, file))}`
      if (corpus.includes(publicPath) || corpus.includes(`/${basename(file)}`)) selected.push({ file, publicPath })
      else skippedUnreferenced.push(publicPath)
    })
  }
  selected.sort((a, b) => a.publicPath.localeCompare(b.publicPath))
  const seen = new Map()
  for (const { publicPath } of selected) {
    const key = variantPath(publicPath, 0)
    if (seen.has(key)) throw new Error(`Variant name collision: ${seen.get(key)} and ${publicPath}`)
    seen.set(key, publicPath)
  }
  return { selected, skippedUnreferenced }
}

const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)

async function generate() {
  const { default: sharp } = await import('sharp')
  sharp.cache(false)
  sharp.concurrency(1)
  const { selected, skippedUnreferenced } = collectSources()
  const images = {}
  const lock = {
    generator: {
      script: 'scripts/generate-static-image-variants.mjs',
      sharp: sharp.versions.sharp,
      libvips: sharp.versions.vips,
      webp: sharp.versions.webp,
      encoders: ENCODERS,
      ladder: WIDTH_LADDER,
      topVariantMaxRatio: TOP_VARIANT_MAX_RATIO,
    },
    images: {},
  }

  rmSync(variantDir, { recursive: true, force: true })
  let sourceBytes = 0
  let variantBytes = 0
  for (const { file, publicPath } of selected) {
    const input = readFileSync(file)
    const encoderName = encoderFor(publicPath)
    // rotate() applies EXIF orientation, matching how browsers display the original.
    const oriented = await sharp(input).rotate().toBuffer({ resolveWithObject: true })
    const { width, height } = oriented.info
    const widths = plannedWidths(width)
    const encoded = []
    for (const targetWidth of widths) {
      const output = await sharp(oriented.data)
        .resize({ width: targetWidth, withoutEnlargement: true, kernel: 'lanczos3' })
        .webp(ENCODERS[encoderName])
        .toBuffer()
      encoded.push({ targetWidth, output })
    }
    const top = encoded[encoded.length - 1]
    const originalIsTop =
      top.targetWidth === width && !/\.png$/i.test(publicPath) && top.output.length >= input.length * TOP_VARIANT_MAX_RATIO
    if (originalIsTop) encoded.pop()

    const outputs = {}
    for (const { targetWidth, output } of encoded) {
      const target = join(publicDir, variantPath(publicPath, targetWidth))
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, output)
      outputs[targetWidth] = { bytes: output.length, sha256: sha(output) }
      variantBytes += output.length
    }
    sourceBytes += input.length
    const variantWidths = encoded.map((entry) => entry.targetWidth)
    // [intrinsic width, intrinsic height, WebP variant widths, 1 when the original is the top candidate]
    images[publicPath] = [width, height, variantWidths, originalIsTop ? 1 : 0]
    lock.images[publicPath] = { bytes: input.length, sha256: sha(input), encoder: encoderName, variants: outputs }
    const sizes = encoded.map(({ targetWidth, output }) => `${targetWidth}w ${(output.length / 1024).toFixed(0)}KB`)
    console.log(`${publicPath} ${width}x${height} ${(input.length / 1024).toFixed(0)}KB [${encoderName}] -> ${sizes.join(', ')}${originalIsTop ? ' + original' : ''}`)
  }

  // One image per line keeps review diffs readable.
  const entries = Object.entries(images).map(([publicPath, entry]) => `    ${JSON.stringify(publicPath)}: ${JSON.stringify(entry)}`)
  writeFileSync(manifestPath, `{\n  "version": 1,\n  "variantRoot": "/media/variants",\n  "images": {\n${entries.join(',\n')}\n  }\n}\n`)
  writeJson(lockPath, lock)
  console.log(`\n${selected.length} images, originals ${(sourceBytes / 1048576).toFixed(2)}MB, variants ${(variantBytes / 1048576).toFixed(2)}MB`)
  if (skippedUnreferenced.length) console.log(`Skipped ${skippedUnreferenced.length} unreferenced images >= ${MIN_BYTES / 1024}KB:\n  ${skippedUnreferenced.join('\n  ')}`)
}

function check() {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  const { selected } = collectSources()
  const failures = []
  const expected = new Set(selected.map((entry) => entry.publicPath))
  for (const publicPath of expected) if (!manifest.images[publicPath]) failures.push(`missing manifest entry: ${publicPath}`)
  const expectedFiles = new Set()
  for (const [publicPath, [width, , widths, originalIsTop]] of Object.entries(manifest.images)) {
    if (!expected.has(publicPath)) failures.push(`stale manifest entry (no longer referenced or removed): ${publicPath}`)
    const plan = plannedWidths(width)
    if (JSON.stringify(originalIsTop ? [...widths, width] : widths) !== JSON.stringify(plan)) failures.push(`width plan changed: ${publicPath}`)
    const locked = lock.images[publicPath]
    const sourceFile = join(publicDir, publicPath)
    if (!locked || !existsSync(sourceFile) || sha(readFileSync(sourceFile)) !== locked.sha256) {
      failures.push(`source changed since generation: ${publicPath}`)
      continue
    }
    for (const targetWidth of widths) {
      const relativeVariant = variantPath(publicPath, targetWidth)
      expectedFiles.add(relativeVariant)
      const target = join(publicDir, relativeVariant)
      if (!existsSync(target)) failures.push(`missing variant: ${relativeVariant}`)
      else if (sha(readFileSync(target)) !== locked.variants[targetWidth]?.sha256) failures.push(`variant differs from lock: ${relativeVariant}`)
    }
  }
  walk(variantDir, (file) => {
    const publicPath = `/${toPosix(relative(publicDir, file))}`
    if (!expectedFiles.has(publicPath)) failures.push(`orphan variant: ${publicPath}`)
  })
  if (failures.length) {
    console.error(`Static image variants are out of date (run node scripts/generate-static-image-variants.mjs):\n  ${failures.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`Static image variants: ${Object.keys(manifest.images).length} images, ${expectedFiles.size} variants match the lock.`)
}

if (process.argv.includes('--check')) check()
else await generate()
