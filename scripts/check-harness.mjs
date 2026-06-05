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
  'docs/ADMIN_PRODUCTION_WALKTHROUGH.md',
  'docs/NEXT_STEPS.md',
  'docs/WORKLOG.md',
  'docs/agent/tasks.json',
  'docs/agent/verification.md',
  'scripts/agent-init.sh',
  'scripts/admin-cms-predeploy.sh',
  'scripts/agent-smoke.sh',
  'scripts/check-admin-auth-browser.mjs',
  'scripts/check-admin-config-gate.mjs',
  'scripts/check-admin-handoff-readiness.mjs',
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
  'agent:admin-cms-predeploy': 'bash scripts/admin-cms-predeploy.sh',
  'agent:admin-auth-browser': 'node scripts/check-admin-auth-browser.mjs',
  'agent:admin-crud-live': 'node scripts/check-admin-crud-live.mjs',
  'agent:admin-handoff-readiness': 'node scripts/check-admin-handoff-readiness.mjs',
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
  'Customer Handoff Summary',
  'Give an editor the production admin address',
  'Daily editing starts on Dashboard.',
  'The CMS currently covers Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history.',
  'Public pages read Published CMS content where the public adapter is active, with static fallback still kept for safety.',
  'Quick Start For Editors',
  'One-Page Editor Handoff',
  'Admin address: `https://urblo.com.au/admin`.',
  'Account setup: a Website owner or CMS manager invites the editor from Settings, People and access, using the lowest useful role.',
  'Find content: open the relevant module, then use search and status filters before selecting an item.',
  'Publish carefully: Published can appear on the public website. Publish only when the checklist is clear.',
  'CMS coverage: Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history are in the CMS.',
  'First Handoff Walkthrough',
  'Filter to Draft so the editor sees content that is safe to review.',
  'Pass condition: the editor can explain where they start',
  'Start with Dashboard Recommended next action',
  'visible actions bar',
  'Most day-to-day editing should not require Supabase, code, table names, or developer help.',
  'CMS team',
  'People and access',
  'Active access',
  'Draft',
  'Published',
  'Archived',
  'Needs confirmation',
  'Recommended next action',
  'Content health queue',
  'Project actions',
  'Stone family actions',
  'Variant actions',
  'Product actions',
  'Model actions',
  'Article actions',
  'Section actions',
  'Media actions',
  'Lead workflow status',
  'Lead workflow actions',
  'Website settings status',
  'Site settings actions',
  'CMS access handoff actions',
  'Open public page',
  'Article sections',
  'Published in Media',
  'change history',
  'static fallback',
  'sanitized original import HTML',
  'The approved import has already written production Projects, Stone Library, Products, Articles, and Media candidates into the CMS as Draft items.',
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
  'clean model key',
]

const adminProductionWalkthroughRequiredText = [
  'https://urblo.com.au/admin',
  'Recommended next action',
  'Site settings actions',
  'CMS access handoff actions',
  'Media actions',
  'Project actions',
  'Stone family actions',
  'Variant actions',
  'Product actions',
  'Model actions',
  'Article actions',
  'Section actions',
  'Lead workflow status',
  'Lead workflow actions',
  'Website settings status',
  'Open public page',
  'Settings invite/access',
  'Stone Library publish path',
  'Article publish path',
  'Final Handoff Decision',
  'Handoff Evidence Matrix',
  'Results Template',
  'Copy this table into `docs/WORKLOG.md` after the production walkthrough',
  '| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |',
  'Result values:',
  'Deferred: Jay explicitly chose not to run a live write, invite, or publish path during this walkthrough.',
  'Editor can log in and know where to start.',
  'Publish readiness is visible before Publish.',
  'Technical terms are hidden from editor tasks.',
  'Account handoff works.',
  'CMS coverage and fallback boundary are explained.',
  'Current CMS UX Stack Scope',
  'Deploy Sequence',
  'This deployment approval does not cover:',
  'Final Turnstile proof',
  'Removing static fallback behavior',
  'npm run agent:cloudflare-readiness',
  'npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au',
  'npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au',
]
const adminProductionWalkthroughForbiddenText = [
  'Draft rows',
  'saved rows',
  'imported Draft rows',
  'Published-only public reads',
  'Supabase Auth',
  'admin profile rows',
  'profile rows',
  'claim_status',
  'raw imported HTML or JSON',
  'database rows',
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

try {
  const walkthrough = readFileSync(join(root, 'docs/ADMIN_PRODUCTION_WALKTHROUGH.md'), 'utf8')
  for (const text of adminProductionWalkthroughRequiredText) {
    if (!walkthrough.includes(text)) {
      failures.push(`docs/ADMIN_PRODUCTION_WALKTHROUGH.md must include current production walkthrough text: ${text}`)
    }
  }
  for (const text of adminProductionWalkthroughForbiddenText) {
    if (walkthrough.includes(text)) {
      failures.push(`docs/ADMIN_PRODUCTION_WALKTHROUGH.md must not drift back to technical walkthrough wording: ${text}`)
    }
  }
} catch (error) {
  failures.push(`Unable to read docs/ADMIN_PRODUCTION_WALKTHROUGH.md: ${error.message}`)
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
