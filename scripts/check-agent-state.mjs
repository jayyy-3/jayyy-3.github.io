import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadState, validateState, checkGenerated, verifyArchive, renderState } from './_lib/agent-state.mjs';
const bundle = loadState();
assert.deepEqual(validateState(bundle), []);
assert.deepEqual(checkGenerated(bundle), []);
assert.deepEqual(verifyArchive(), []);
const badTask = structuredClone(bundle); badTask.status.currentTaskId = 'done-or-missing';
assert(validateState(badTask).some((error) => error.includes('currentTaskId')));
const badCms = structuredClone(bundle); badCms.status.production.adminCmsHandoff = 'verified';
assert(validateState(badCms).some((error) => error.includes('CMS status')));
const badContent = structuredClone(bundle); badContent.status.production.content = 'drafts_public';
assert(validateState(badContent).some((error) => error.includes('fallback contract')));
const badPreview = structuredClone(bundle); badPreview.status.environments.preview.testPolicy = 'write';
assert(validateState(badPreview).some((error) => error.includes('read_only')));
const dir = mkdtempSync(join(tmpdir(), 'urblo-state-test-'));
try {
  mkdirSync(join(dir, 'docs'), { recursive: true });
  for (const path of ['docs/HANDOFF.md', 'docs/NEXT_STEPS.md', 'README.md']) cpSync(path, join(dir, path));
  writeFileSync(join(dir, 'docs/HANDOFF.md'), 'Old QR redirect is current.');
  assert(checkGenerated(bundle, dir).some((error) => error.includes('HANDOFF')));
  writeFileSync(join(dir, 'docs/HANDOFF.md'), renderState(bundle)['docs/HANDOFF.md']);
  writeFileSync(join(dir, 'README.md'), readFileSync(join(dir, 'README.md'), 'utf8') + '\nCMS handoff passed.\n');
  assert(checkGenerated(bundle, dir).some((error) => error.includes('unverified')));
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log('State behavior passed: missing/done task, contradictory CMS, unsafe Preview policy and stale generated summaries are rejected; archive bytes retained.');
