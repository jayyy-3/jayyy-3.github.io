import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))

// Runs the named vitest files once (no watch) from the repository root and
// returns the exit status. Behaviour assertions live in *.test.ts; the legacy
// check-*.mjs entry points delegate here so their npm script names keep working.
export function runVitest(files) {
  const result = spawnSync(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run', ...files], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.error) console.error(result.error.message)
  return result.status ?? 1
}
