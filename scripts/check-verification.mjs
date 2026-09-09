import assert from 'node:assert/strict'
import { classify, parseNameStatus, resolveChecks, suites } from './_lib/verification.mjs'
import { sanitizeDiagnostic } from './_lib/browser-diagnostics.mjs'
const sanitized = sanitizeDiagnostic({ status: 500, details: { authorization: 'Bearer private-value', access_token: 'private-token', password: 'private-password', message: 'API failed' } })
assert.deepEqual(sanitized, { status: 500, details: { authorization: '[redacted]', access_token: '[redacted]', password: '[redacted]', message: 'API failed' } })
assert.equal(sanitizeDiagnostic('Bearer private-value'), 'Bearer [redacted]')
for (const path of ['README.md', 'AGENTS.md', 'docs/HANDOFF.md', 'docs/agent/tasks.json']) assert.equal(classify([path]).deploy, false, path)
for (const path of ['src/App.tsx', 'public/articles/content.md', 'public/data.json', 'package.json', '.github/workflows/deploy.yml', 'vite.config.ts', 'unknown.txt', '.gitignore']) assert.equal(classify([path]).deploy, true, path)
assert.equal(classify(['scripts/check-harness.mjs']).suite, 'container')
assert.equal(classify(['supabase/migrations/example.sql']).category, 'migrations')
assert.deepEqual(parseNameStatus('R100\0src/old.ts\0docs/new.md\0D\0public/old.json\0'), ['src/old.ts', 'docs/new.md', 'public/old.json'])
assert.equal(classify(parseNameStatus('R100\0src/old.ts\0docs/new.md\0')).deploy, true)
assert.equal(classify(parseNameStatus('D\0src/old.ts\0')).deploy, true)
assert.throws(() => parseNameStatus('R100\0one\0'))
assert.throws(() => resolveChecks('unknown'))
for (const suite of Object.keys(suites)) {
  const ids = resolveChecks(suite)
  assert.equal(ids.length, new Set(ids).size, suite)
  if (ids.includes('routes')) assert.ok(ids.indexOf('build') < ids.indexOf('routes'))
}
assert.equal(resolveChecks('container').filter(id => id === 'build').length, 1)
assert.ok(resolveChecks('runtime').includes('browser'))
console.log('Verification classification, rename/delete fail-closed handling, dependencies and deduplication passed.')

// Exercise actual Git records and fingerprints, not just handcrafted path arrays.
const { mkdtempSync, writeFileSync, mkdirSync, renameSync, rmSync } = await import('node:fs')
const { tmpdir } = await import('node:os')
const { join } = await import('node:path')
const { execFileSync } = await import('node:child_process')
const { changedPaths, runtimeFingerprint } = await import('./_lib/verification.mjs')
const fixture = mkdtempSync(join(tmpdir(), 'urblo-classifier-'))
try {
  const git = args => execFileSync('git', args, { cwd: fixture, stdio: 'pipe', env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } })
  git(['init']); git(['config', 'user.email', 'synthetic@example.test']); git(['config', 'user.name', 'Synthetic test'])
  mkdirSync(join(fixture, 'src')); mkdirSync(join(fixture, 'docs'))
  writeFileSync(join(fixture, 'src/app.ts'), 'export const value = 1\n'); writeFileSync(join(fixture, 'docs/note.md'), 'Record\n')
  git(['add', '.']); git(['commit', '-m', 'synthetic baseline'])
  const baseline = runtimeFingerprint(fixture)
  writeFileSync(join(fixture, 'docs/note.md'), 'Updated record\n')
  assert.equal(classify(changedPaths('HEAD', fixture)).deploy, false)
  assert.equal(runtimeFingerprint(fixture), baseline, 'record-only changes preserve runtime evidence')
  renameSync(join(fixture, 'src/app.ts'), join(fixture, 'docs/app.md')); git(['add', '.'])
  assert.equal(classify(changedPaths('HEAD', fixture)).deploy, true, 'runtime moved into docs cannot skip deployment')
  assert.notEqual(runtimeFingerprint(fixture), baseline)
  writeFileSync(join(fixture, 'unrecognized.json'), '{}')
  assert.ok(changedPaths('HEAD', fixture).includes('unrecognized.json'))
} finally { rmSync(fixture, { recursive: true, force: true }) }
console.log('Actual Git rename/delete/untracked classification and runtime evidence invalidation passed.')
