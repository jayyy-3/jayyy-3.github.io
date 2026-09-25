#!/usr/bin/env node
// Ratchet for the public type scale (docs/DESIGN.md "Visual System → Tokens").
// Counts arbitrary `text-[Npx]` font-size utilities in public page and component source and fails
// when the total, or any single file, exceeds the recorded baseline. New public files start at 0.
//
//   node scripts/check-public-ui-tokens.mjs                 check against the baseline
//   node scripts/check-public-ui-tokens.mjs --json          print counts as JSON
//   node scripts/check-public-ui-tokens.mjs --write-baseline  record current counts (never raises
//                                                          a file or the total without --allow-increase)
import fs from 'node:fs'
import path from 'node:path'

const baselinePath = 'scripts/public-ui-tokens-baseline.json'
const roots = ['src/pages', 'src/components', 'src/layouts']
// Admin and the QR material page are separate surfaces with their own design contracts.
const excluded = [/^src\/pages\/admin\//, /^src\/components\/image-qr\//, /^src\/pages\/ImageQrPage\.tsx$/, /\.test\.tsx?$/]
const arbitraryFontSize = /text-\[\d+(?:\.\d+)?px\]/g

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.posix.join(dir, entry.name)
    if (entry.isDirectory()) return listFiles(full)
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : []
  })
}

function countArbitraryFontSizes(source) {
  return (source.match(arbitraryFontSize) || []).length
}

function measure() {
  const files = {}
  for (const file of roots.flatMap(listFiles).sort()) {
    if (excluded.some((pattern) => pattern.test(file))) continue
    const count = countArbitraryFontSizes(fs.readFileSync(file, 'utf8'))
    if (count) files[file] = count
  }
  const total = Object.values(files).reduce((sum, count) => sum + count, 0)
  return { total, files }
}

const args = new Set(process.argv.slice(2))
const current = measure()

if (args.has('--json')) {
  console.log(JSON.stringify(current, null, 2))
  process.exit(0)
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))

if (args.has('--write-baseline')) {
  const raised = Object.entries(current.files).filter(([file, count]) => count > (baseline.files[file] ?? 0))
  if ((current.total > baseline.total || raised.length) && !args.has('--allow-increase')) {
    console.error('Refusing to raise the public type-scale baseline. Use tokens, or pass --allow-increase with a reason in the PR.')
    for (const [file, count] of raised) console.error(`  ${file}: ${baseline.files[file] ?? 0} -> ${count}`)
    process.exit(1)
  }
  const next = { ...baseline, total: current.total, files: current.files }
  fs.writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`Recorded public arbitrary font-size baseline: ${current.total}`)
  process.exit(0)
}

const failures = []
if (current.total > baseline.total) {
  failures.push(`total ${current.total} exceeds baseline ${baseline.total}`)
}
for (const [file, count] of Object.entries(current.files)) {
  const allowed = baseline.files[file] ?? 0
  if (count > allowed) failures.push(`${file}: ${count} arbitrary text-[Npx] (baseline ${allowed})`)
}

if (failures.length) {
  console.error('Public type-scale check failed. Use the font-size tokens in tailwind.config.js (docs/DESIGN.md Tokens) instead of text-[Npx]:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

const headroom = baseline.total - current.total
console.log(`Public type-scale check passed: ${current.total} arbitrary text-[Npx] (baseline ${baseline.total}${headroom ? `, ${headroom} below; run --write-baseline to ratchet` : ''}).`)
