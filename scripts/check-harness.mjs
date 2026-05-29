#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { cwd, exit } from 'node:process'
import { join } from 'node:path'

const root = cwd()
const requiredFiles = [
  'AGENTS.md',
  'docs/HANDOFF.md',
  'docs/DESIGN.md',
  'docs/ARCHITECTURE.md',
  'docs/NEXT_STEPS.md',
  'docs/WORKLOG.md',
  'docs/agent/tasks.json',
  'docs/agent/verification.md',
  'scripts/agent-init.sh',
  'scripts/agent-smoke.sh',
  'scripts/check-admin-config-gate.mjs',
  'scripts/check-contact-form-ui-source.mjs',
  'scripts/check-doc-paths.mjs',
  'scripts/check-harness.mjs',
]
const requiredPackageScripts = {
  'agent:check': 'node scripts/check-harness.mjs',
  'agent:admin-crud-coverage': 'node scripts/check-admin-crud-coverage.mjs',
  'agent:admin-config-gate': 'node scripts/check-admin-config-gate.mjs',
  'agent:admin-crud-live': 'node scripts/check-admin-crud-live.mjs',
  'agent:admin-live-readiness': 'node scripts/check-admin-live-readiness.mjs',
  'agent:cloudflare-preview-smoke': 'node scripts/check-cloudflare-preview-smoke.mjs',
  'agent:cloudflare-readiness': 'node scripts/check-cloudflare-pages-readiness.mjs',
  'agent:content-import': 'node scripts/check-content-import-readiness.mjs',
  'agent:content-import:apply-sql': 'node scripts/check-content-import-readiness.mjs --out .tmp/content-import-preview.json --plan-out .tmp/content-import-plan.md --preflight-sql-out .tmp/content-import-preflight.sql --apply-sql-out .tmp/content-import-apply.sql --rollback-sql-out .tmp/content-import-rollback.sql',
  'agent:first-admin-bootstrap': 'node scripts/bootstrap-first-admin.mjs',
  'agent:forms-live': 'node scripts/check-forms-api-live.mjs',
  'agent:forms-ui': 'node scripts/check-contact-form-ui-source.mjs',
  'agent:init': 'bash scripts/agent-init.sh',
  'agent:live-readiness': 'node scripts/check-live-readiness.mjs',
  'agent:public-supabase-readiness': 'node scripts/check-public-supabase-readiness.mjs',
  'agent:smoke': 'bash scripts/agent-smoke.sh',
}

const failures = []

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    failures.push(`Missing required harness file: ${file}`)
  }
}

if (existsSync(join(root, 'docs/README_AGENT.md'))) {
  failures.push('Retired docs/README_AGENT.md still exists; root AGENTS.md should be the entry point.')
}

try {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  for (const [name, command] of Object.entries(requiredPackageScripts)) {
    if (pkg.scripts?.[name] !== command) {
      failures.push(`package.json script ${name} must be "${command}"`)
    }
  }
} catch (error) {
  failures.push(`Unable to parse package.json: ${error.message}`)
}

try {
  const smoke = readFileSync(join(root, 'scripts/agent-smoke.sh'), 'utf8')
  if (!smoke.includes('node scripts/check-contact-form-ui-source.mjs')) {
    failures.push('scripts/agent-smoke.sh must run the Contact form UI source contract check.')
  }
} catch (error) {
  failures.push(`Unable to read scripts/agent-smoke.sh: ${error.message}`)
}

if (!failures.length) {
  const result = spawnSync('node', ['scripts/check-doc-paths.mjs'], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.status !== 0) {
    failures.push(result.stdout.trim())
    failures.push(result.stderr.trim())
  } else {
    process.stdout.write(result.stdout)
  }
}

if (failures.length) {
  console.error('Harness checks failed:')
  failures.filter(Boolean).forEach((failure) => console.error(`- ${failure}`))
  exit(1)
}

console.log('Harness checks passed.')
