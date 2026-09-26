#!/usr/bin/env node
// Guards the colleague quick guide (docs/ADMIN_EDITOR_GUIDE.md) that the admin Help drawer renders:
// one screen long, plain language, a Markdown subset the drawer can render, and every **bold**
// control label present in the current admin source. Source-only; no network or credentials.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { cwd, exit } from 'node:process'

const root = cwd()
const guidePath = 'docs/ADMIN_EDITOR_GUIDE.md'
const sourceRoots = ['src/pages/admin', 'src/features/stone-library']
const limits = { maxLines: 45, maxContentLines: 32, maxCharacters: 3600 }
const requiredHeadings = [
  'Sign in',
  'Save, Publish and Update live page',
  'Change an image on a project page',
  'Add or update a project and mark materials',
  'Edit a product',
  'Handle an enquiry or sample request',
  'Update company addresses and contact details',
  'Who to ask',
]
// Words a non-technical colleague should never need. Matched case-insensitively on word boundaries.
const forbiddenTerms = [
  'supabase', 'bucket', 'migration', 'localhost', 'handoff', 'storage', 'rls', 'database', 'sql',
  'cloudflare', 'deploy', 'deployment', 'github', 'npm', 'api', 'json', 'row', 'rows', 'fallback',
  'legacy', 'promotion', 'promote', 'service role', 'token', 'slug', 'url key', 'schema', 'cms-only',
  'golden workflow', 'evidence',
]
const requiredWiring = [
  ['src/pages/admin/AdminHelp.tsx', "docs/ADMIN_EDITOR_GUIDE.md?raw"],
  ['src/pages/admin/AdminShell.tsx', '<AdminHelpButton />'],
  ['src/pages/admin/AdminLoginPage.tsx', '<AdminHelpButton />'],
  ['src/pages/admin/AdminAccountSetupPage.tsx', '<AdminHelpButton />'],
  ['src/pages/admin/AdminState.tsx', '<AdminHelpButton />'],
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// A label counts only as a whole string literal or JSX text node, optionally decorated with a
// leading "+" or a trailing arrow/ellipsis, so "Save" does not match inside "saveProduct".
function labelPattern(label) {
  const body = escapeRegExp(label).replace(/ /g, '\\s+')
  return new RegExp(`(?:['"\`]|>\\s*|[+＋]\\s*)${body}(?:\\s*[↗…])?(?:['"\`]|\\s*<|\\s*\\{)`)
}

function boldLabels(markdown) {
  return [...markdown.matchAll(/\*\*([^*]+)\*\*/g)].map((match) => match[1].trim())
}

function unsupportedMarkdown(markdown) {
  const problems = []
  markdown.split(/\r?\n/).forEach((line, index) => {
    const at = `line ${index + 1}`
    if (/^#{3,}\s/.test(line)) problems.push(`${at}: only # and ## headings are rendered`)
    if (index > 0 && /^#\s/.test(line)) problems.push(`${at}: only the first line may be the # title`)
    if (/^\s*[|>]/.test(line) || /`/.test(line)) problems.push(`${at}: tables, quotes and code are not rendered`)
    if (/\[[^\]]*\]\([^)]*\)/.test(line) || /<[a-z/!]/i.test(line)) problems.push(`${at}: links and HTML are not rendered`)
    if (/^\s+[-*\d]/.test(line) || /^\*\s/.test(line)) problems.push(`${at}: use flat "- " or "1. " list items only`)
    if (((line.match(/\*\*/g) ?? []).length % 2) !== 0) problems.push(`${at}: unbalanced ** bold marker`)
    if (/(^|[^*])\*[^*\s]/.test(line.replace(/\*\*[^*]+\*\*/g, ''))) problems.push(`${at}: use **bold** only for control labels`)
  })
  return problems
}

function forbiddenFound(markdown) {
  const lower = markdown.toLowerCase()
  return forbiddenTerms.filter((term) => new RegExp(`(^|[^a-z])${escapeRegExp(term)}([^a-z]|$)`).test(lower))
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return ['.ts', '.tsx'].includes(extname(full)) && !/\.test\.tsx?$/.test(full) ? [full] : []
  })
}

// Self-checks: the matcher must reject substrings and the scanners must flag drift.
assert.ok(labelPattern('Save').test('<Save className="h-4 w-4" />\n  Save\n</button>'))
assert.ok(labelPattern('Update live page').test("export const label = 'Update live page';"))
assert.ok(labelPattern('Add or upload image').test('>\n  + Add or upload image\n</button>'))
assert.ok(labelPattern('View website').test('>\n  View website ↗\n</a>'))
assert.ok(!labelPattern('Save').test('void saveProduct(); const SaveIcon = 1'))
assert.ok(!labelPattern('Publish').test("'Publish product'"))
assert.deepEqual(boldLabels('Press **Save**, then **Publish**.'), ['Save', 'Publish'])
assert.deepEqual(forbiddenFound('Upload to the Supabase bucket'), ['supabase', 'bucket'])
assert.deepEqual(forbiddenFound('Press Save. Browse the library.'), [])
assert.equal(unsupportedMarkdown('# T\n## H\n- a **b**\n1. c').length, 0)
assert.ok(unsupportedMarkdown('# T\n### deep\n| a |\n[x](y)').length >= 3)

const failures = []
const guide = readFileSync(join(root, guidePath), 'utf8')
const lines = guide.replace(/\n$/, '').split('\n')
const contentLines = lines.filter((line) => line.trim())

if (lines.length > limits.maxLines) failures.push(`${guidePath} has ${lines.length} lines; the quick guide must stay within ${limits.maxLines}.`)
if (contentLines.length > limits.maxContentLines) failures.push(`${guidePath} has ${contentLines.length} non-empty lines; limit ${limits.maxContentLines}.`)
if (guide.length > limits.maxCharacters) failures.push(`${guidePath} has ${guide.length} characters; limit ${limits.maxCharacters}.`)
if (!lines[0]?.startsWith('# ')) failures.push(`${guidePath} must start with a single # title.`)

const headings = lines.filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim())
for (const heading of requiredHeadings) {
  if (!headings.includes(heading)) failures.push(`${guidePath} is missing the task section "## ${heading}".`)
}
for (const term of forbiddenFound(guide)) failures.push(`${guidePath} must not use the technical term "${term}"; move it to docs/ADMIN_OPERATIONS_RUNBOOK.md.`)
for (const problem of unsupportedMarkdown(guide)) failures.push(`${guidePath} ${problem}.`)

const source = sourceRoots.flatMap((dir) => walk(join(root, dir))).map((file) => readFileSync(file, 'utf8')).join('\n')
const labels = [...new Set(boldLabels(guide))]
if (labels.length < 10) failures.push(`${guidePath} should name the on-screen controls in **bold** (found ${labels.length}).`)
for (const label of labels) {
  if (!labelPattern(label).test(source)) {
    failures.push(`${guidePath} names **${label}**, but no control or field with that exact label exists in ${sourceRoots.join(' or ')}.`)
  }
}

for (const [file, text] of requiredWiring) {
  if (!readFileSync(join(root, file), 'utf8').includes(text)) failures.push(`${file} must include ${text} so every admin route offers the quick guide.`)
}

if (failures.length) {
  console.error('Admin quick guide check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  exit(1)
}
console.log(`Admin quick guide check passed: ${lines.length} lines, ${guide.length} characters, ${labels.length} control labels found in the admin source.`)
