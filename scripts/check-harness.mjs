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
  'docs/ADMIN_EDITOR_GUIDE.md',
  'docs/NEXT_STEPS.md',
  'docs/WORKLOG.md',
  'docs/agent/tasks.json',
  'docs/agent/verification.md',
  'scripts/agent-init.sh',
  'scripts/agent-smoke.sh',
  'scripts/check-admin-auth-browser.mjs',
  'scripts/check-admin-config-gate.mjs',
  'scripts/check-capabilities-page-source.mjs',
  'scripts/check-contact-form-ui-source.mjs',
  'scripts/check-doc-paths.mjs',
  'scripts/check-harness.mjs',
  'scripts/check-supabase-foundation-readiness.mjs',
]
const requiredPackageScripts = {
  'agent:check': 'node scripts/check-harness.mjs',
  'agent:admin-crud-coverage': 'node scripts/check-admin-crud-coverage.mjs',
  'agent:admin-config-gate': 'node scripts/check-admin-config-gate.mjs',
  'agent:admin-auth-browser': 'node scripts/check-admin-auth-browser.mjs',
  'agent:admin-crud-live': 'node scripts/check-admin-crud-live.mjs',
  'agent:admin-live-readiness': 'node scripts/check-admin-live-readiness.mjs',
  'agent:cloudflare-preview-smoke': 'node scripts/check-cloudflare-preview-smoke.mjs',
  'agent:cloudflare-readiness': 'node scripts/check-cloudflare-pages-readiness.mjs',
  'agent:content-import': 'node scripts/check-content-import-readiness.mjs',
  'agent:content-import:apply-sql': 'node scripts/check-content-import-readiness.mjs --out .tmp/content-import-preview.json --plan-out .tmp/content-import-plan.md --preflight-sql-out .tmp/content-import-preflight.sql --apply-sql-out .tmp/content-import-apply.sql --rollback-sql-out .tmp/content-import-rollback.sql',
  'agent:first-admin-bootstrap': 'node scripts/bootstrap-first-admin.mjs',
  'agent:forms-live': 'node scripts/check-forms-api-live.mjs',
  'agent:forms-ui': 'node scripts/check-contact-form-ui-source.mjs',
  'agent:capabilities-ui': 'node scripts/check-capabilities-page-source.mjs',
  'agent:init': 'bash scripts/agent-init.sh',
  'agent:live-readiness': 'node scripts/check-live-readiness.mjs',
  'agent:public-supabase-readiness': 'node scripts/check-public-supabase-readiness.mjs',
  'agent:supabase-foundation-readiness': 'node scripts/check-supabase-foundation-readiness.mjs',
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
  if (!smoke.includes('node scripts/check-capabilities-page-source.mjs')) {
    failures.push('scripts/agent-smoke.sh must run the Capabilities page source contract check.')
  }
} catch (error) {
  failures.push(`Unable to read scripts/agent-smoke.sh: ${error.message}`)
}

const adminEditorGuideRequiredText = [
  'https://urblo.com.au/admin',
  'Website owner',
  'CMS manager',
  'Editor',
  'Viewer',
  'CMS team',
  'People and access',
  'Active access',
  'Draft',
  'Published',
  'Archived',
  'Needs confirmation',
  'Open public page',
  'Article sections',
  'Published in Media',
  'change history',
  'static fallback',
  'sanitized original import HTML',
  'The approved import has already written production Projects, Stone Library, Products, Articles, and Media candidates into Supabase as Draft rows.',
  'Push and deploy the local CMS UX commits',
  'final editor walkthrough',
]
const adminEditorGuideRequiredModules = [
  'Dashboard',
  'Projects',
  'Stone Library',
  'Products',
  'Articles',
  'Media',
  'Leads',
  'Settings',
  'Change history',
]
const adminEditorGuideForbiddenText = [
  'Supabase Auth login account',
  'Admin team',
  'Active profile',
  'structured article blocks',
  'activity logging',
  'SEO defaults',
  'TBC |',
  'owner/admin',
  '| Owner |',
  '| Admin |',
  'reviewed project claim status',
]

try {
  const guide = readFileSync(join(root, 'docs/ADMIN_EDITOR_GUIDE.md'), 'utf8')
  for (const text of adminEditorGuideRequiredText) {
    if (!guide.includes(text)) {
      failures.push(`docs/ADMIN_EDITOR_GUIDE.md must include current editor handoff text: ${text}`)
    }
  }
  for (const moduleName of adminEditorGuideRequiredModules) {
    if (!guide.includes(`| ${moduleName} |`)) {
      failures.push(`docs/ADMIN_EDITOR_GUIDE.md must document the ${moduleName} admin module.`)
    }
  }
  for (const text of adminEditorGuideForbiddenText) {
    if (guide.includes(text)) {
      failures.push(`docs/ADMIN_EDITOR_GUIDE.md must not drift back to old admin terminology: ${text}`)
    }
  }
} catch (error) {
  failures.push(`Unable to read docs/ADMIN_EDITOR_GUIDE.md: ${error.message}`)
}

const liveReadinessDocFlags = [
  '--base-url',
  '--admin-email',
  '--form-writes-approved',
  '--first-admin-writes-approved',
  '--admin-writes-approved',
  '--content-import-approved',
  '--content-merge-approved',
  '--content-public-cutover-approved',
  '--turnstile-token-provided',
]
const liveReadinessDocFiles = [
  'docs/ARCHITECTURE.md',
  'docs/CLOUDFLARE_DEPLOYMENT.md',
  'docs/agent/verification.md',
]

for (const file of liveReadinessDocFiles) {
  try {
    const text = readFileSync(join(root, file), 'utf8')
    for (const flag of liveReadinessDocFlags) {
      if (!text.includes(flag)) {
        failures.push(`${file} must document agent:live-readiness flag ${flag}.`)
      }
    }
  } catch (error) {
    failures.push(`Unable to read ${file}: ${error.message}`)
  }
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

if (!failures.length) {
  const result = spawnSync('node', ['scripts/check-supabase-foundation-readiness.mjs'], {
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
