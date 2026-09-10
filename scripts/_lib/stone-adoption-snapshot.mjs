export function normalizeAdoptionSnapshot(value, key = '') {
  if (Array.isArray(value)) return value.map(v => normalizeAdoptionSnapshot(v))
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
    .filter(k => !['created_by', 'updated_by'].includes(k))
    .map(k => [k, normalizeAdoptionSnapshot(value[k], k)]))
  if (key.endsWith('_at') && typeof value === 'string') return new Date(value).toISOString()
  return value
}

// An already completed historical archive is a no-op, never permission to replace
// a changed baseline or edited historical content. The approved plan is unchanged.
export function reviewedStoneState(item, current) {
  const expected = item.original.stone || item.original
  if (!current) return 'changed'
  const normalize = value => JSON.stringify(normalizeAdoptionSnapshot(value))
  if (normalize(current) === normalize(expected)) return 'unchanged'
  if (item.action !== 'archive' || item.original.stone || current.status !== 'archived') return 'changed'
  if (!Number.isFinite(Date.parse(current.archived_at)) || !Number.isFinite(Date.parse(current.updated_at)) || Date.parse(current.updated_at) < Date.parse(expected.updated_at)) return 'changed'
  const restoredState = { ...current, status: expected.status, archived_at: expected.archived_at, updated_at: expected.updated_at }
  return normalize(restoredState) === normalize(expected) ? 'already_archived' : 'changed'
}
