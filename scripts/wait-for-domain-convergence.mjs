#!/usr/bin/env node
// Read-only wait used by CI before the production apex/www readback smoke.
// Exits 0 once every --base-url serves the --reference-url asset graph byte-for-byte,
// 1 if the budget (default 180s) runs out. See run 36153157216 for the false failure it prevents.
import { waitForDomainConvergence } from './_lib/deployment-readiness.mjs'

const args = process.argv.slice(2)
const values = flag => args.flatMap((arg, index) => (arg === flag ? [args[index + 1]] : []))
const [referenceUrl] = values('--reference-url')
const baseUrls = values('--base-url')
const budgetSeconds = Number(values('--budget-seconds')[0] ?? 180)

try {
  const result = await waitForDomainConvergence(baseUrls, referenceUrl, { budgetMs: budgetSeconds * 1000 })
  if (!result.converged) {
    console.error(`Domains did not converge on ${referenceUrl} within ${budgetSeconds}s after ${result.attempts} attempts: ${result.pending.join(', ')}`)
    process.exitCode = 1
  } else console.log(`All domains serve ${referenceUrl} after ${result.attempts} attempt(s).`)
} catch (error) {
  console.error(`Domain convergence check failed: ${error.message}`)
  process.exitCode = 1
}
