#!/usr/bin/env node
// Offline check of a Project content package (docs/content-import/README.md), for colleagues and
// Claude Design to self-check before importing. Usage:
//   npm run agent:project-package -- <project.json | package.zip>
// Runs the same parser and zip reader as the admin import, then the protected Function's own
// block validator (functions/_lib/blocks.js) on every mapped block. Stones and finishes resolve
// against the bundled snapshot (data/clean/stone_library.json) plus the dated live list in
// docs/content-import/stone-catalogue-2026-10-15.json; the Live Stone Library in the admin is
// authoritative. No network, no credentials, no writes.
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { argv, exit } from 'node:process'
import {
  catalogueResolvers,
  packageImageFiles,
  packageToDraft,
  parseProjectPackageText,
} from '../src/features/blocks/importPackage.ts'
import { readPackageZip } from '../src/features/blocks/importZip.ts'
import { validateContentBlock } from '../functions/_lib/blocks.js'

const root = resolve(import.meta.dirname, '..')
const target = argv.slice(2).find((arg) => !arg.startsWith('--'))
if (!target) {
  console.error('Usage: npm run agent:project-package -- <project.json | package.zip>')
  exit(2)
}

/** The bundled Stone Library snapshot in the shape the admin catalogue uses. */
function offlineCatalogue() {
  const library = JSON.parse(readFileSync(resolve(root, 'data/clean/stone_library.json'), 'utf8'))
  const finishKey = (finish) => (finish.finishVariantId ? `${finish.finishId}__${finish.finishVariantId}` : finish.finishId)
  const finishes = library.finishes.map((finish, index) => ({ id: index + 1, key: finishKey(finish), label: finish.displayName, status: 'published' }))
  const finishIdByKey = new Map(finishes.map((finish) => [finish.key, finish.id]))
  const stones = []
  const variants = []
  const capabilities = []
  library.stones.forEach((stone, stoneIndex) => {
    const stoneId = stoneIndex + 1
    stones.push({ id: stoneId, key: stone.stoneGroupId, label: stone.displayName, status: stone.status === 'active' ? 'published' : 'draft' })
    stone.variants.forEach((variant, variantIndex) => {
      const variantId = stoneId * 100 + variantIndex
      variants.push({ id: variantId, stoneGroupId: stoneId, status: variant.status === 'active' ? 'published' : 'draft', sortOrder: variantIndex })
      for (const capability of variant.finishCapabilities) {
        const finishDefinitionId = finishIdByKey.get(finishKey(capability))
        if (finishDefinitionId) capabilities.push({ stoneVariantId: variantId, finishDefinitionId, capability: capability.capability })
      }
    })
  })
  // The dated live Stone Library list the colleague docs publish: a live stone missing from the
  // older bundled snapshot still resolves, with one variant offering its listed finishes.
  const live = JSON.parse(readFileSync(resolve(root, 'docs/content-import/stone-catalogue-2026-10-15.json'), 'utf8'))
  for (const stone of live.stones) {
    if (stones.some((entry) => entry.key === stone.slug)) continue
    const stoneId = stones.length + 1
    const variantId = stoneId * 100
    stones.push({ id: stoneId, key: stone.slug, label: stone.name, status: 'published' })
    variants.push({ id: variantId, stoneGroupId: stoneId, status: 'published', sortOrder: 0 })
    for (const key of stone.finishes) {
      const finishDefinitionId = finishIdByKey.get(key)
      if (finishDefinitionId) capabilities.push({ stoneVariantId: variantId, finishDefinitionId, capability: 'yes' })
    }
  }
  return { stones, variants, finishes, capabilities }
}

const path = resolve(process.cwd(), target)
let text
let files = new Map()
const issues = []
if (path.toLowerCase().endsWith('.zip')) {
  const { archive, errors } = await readPackageZip(new Uint8Array(readFileSync(path)))
  issues.push(...errors)
  if (archive) {
    text = archive.projectJson
    files = archive.files
  }
} else {
  if (statSync(path).size > 2 * 1024 * 1024) issues.push({ path: 'project.json', message: 'The package text is larger than 1 MB.' })
  else text = readFileSync(path, 'utf8')
}

let parsed = null
let warnings = []
if (text !== undefined) {
  const result = parseProjectPackageText(text)
  issues.push(...result.errors)
  warnings = result.warnings
  parsed = result.package
}

const lines = [`Project package check: ${target}`]
if (parsed) {
  const resolvers = catalogueResolvers(offlineCatalogue())
  const { draft, pendingImages, unresolvedStones } = packageToDraft(parsed, {
    ...resolvers,
    mediaIdForFile: (file) => (files.has(file) ? 1 : null),
    existingSlugs: [],
  })
  draft.blocks.forEach((block, index) => {
    for (const issue of validateContentBlock(block, 'draft')) issues.push({ path: `blocks[${index}] (server check) ${issue.path}`, message: issue.code })
  })
  const imageFiles = packageImageFiles(parsed)
  lines.push(`Title: ${parsed.project.title}`)
  lines.push(`Page address: /projects/${draft.project.slug}`)
  lines.push(`Blocks: ${draft.blocks.map((block) => block.type).join(', ') || 'none'}`)
  lines.push(`Images: ${imageFiles.filter((image) => files.has(image.file)).length} in package, ${new Set(pendingImages.map((use) => use.file ?? use.path)).size} to add later`)
  lines.push(`Stones: ${parsed.stones.length - unresolvedStones.length} found in the Stone Library list, ${unresolvedStones.length} to check`)
  for (const use of unresolvedStones) warnings.push({ path: use.path, message: use.reason === 'stone' ? `"${use.stone}" is not in the Stone Library list of 2026-10-15; check it on the website.` : `"${use.finish}" is not a known finish key.` })
}
for (const issue of issues) lines.push(`ERROR ${issue.path}: ${issue.message}`)
for (const warning of warnings) lines.push(`WARNING ${warning.path}: ${warning.message}`)
lines.push(issues.length ? `Result: ${issues.length} error(s). Fix them and export again.` : `Result: ready to import (${warnings.length} warning(s)).`)
console.log(lines.join('\n'))
exit(issues.length ? 1 : 0)
