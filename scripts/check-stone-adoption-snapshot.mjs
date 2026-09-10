import assert from 'node:assert/strict'
import { reviewedStoneState } from './_lib/stone-adoption-snapshot.mjs'
const original = { id: 1, stone_group_key: 'synthetic-historical-test', display_name: 'Synthetic test', status: 'published', archived_at: null, updated_at: '2026-09-10T02:00:00Z' }
const item = { action: 'archive', original }
const archived = { ...original, status: 'archived', archived_at: '2026-09-10T06:41:20Z', updated_at: '2026-09-10T06:41:21Z' }
assert.equal(reviewedStoneState(item, original), 'unchanged')
assert.equal(reviewedStoneState(item, archived), 'already_archived')
for (const patch of [{ display_name: 'Edited' }, { id: 2 }, { stone_group_key: 'different' }, { status: 'draft' }, { archived_at: null }, { updated_at: '2026-09-09T00:00:00Z' }]) {
  assert.equal(reviewedStoneState(item, { ...archived, ...patch }), 'changed')
}
assert.equal(reviewedStoneState({ ...item, action: 'keep_archived' }, archived), 'changed')
assert.equal(reviewedStoneState({ original: { stone: original } }, archived), 'changed', 'formal baseline changes are never waived')
assert.equal(reviewedStoneState(item, null), 'changed')
console.log('Stone adoption snapshot: completed historical archive is retained; content/identity/baseline changes remain blocking.')
