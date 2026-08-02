#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { cwd, exit } from 'node:process'
import { join } from 'node:path'

const root = cwd()
const requiredFiles = [
  'AGENTS.md',
  'Dockerfile.gate',
  'docs/OPERATING_PROTOCOL.md',
  'docs/HANDOFF.md',
  'docs/DESIGN.md',
  'docs/ARCHITECTURE.md',
  'docs/ADMIN_EDITOR_GUIDE.md',
  'docs/ADMIN_PRODUCTION_WALKTHROUGH.md',
  'docs/NEXT_STEPS.md',
  'docs/WORKLOG.md',
  'docs/agent/admin-handoff-evidence.json',
  'docs/agent/status.json',
  'docs/agent/harness-gc.md',
  'docs/agent/tasks.json',
  'docs/agent/verification.md',
  'scripts/agent-init.sh',
  'scripts/admin-cms-predeploy.sh',
  'scripts/agent-smoke.sh',
  'scripts/container-gate.sh',
  'scripts/check-admin-auth-browser.mjs',
  'scripts/check-admin-config-gate.mjs',
  'scripts/check-admin-handoff-readiness.mjs',
  'scripts/check-admin-media-role-boundary-live.mjs',
  'scripts/check-admin-projects-aggregate.mjs',
  'scripts/check-capabilities-page-source.mjs',
  'scripts/check-contact-form-ui-source.mjs',
  'scripts/check-doc-paths.mjs',
  'scripts/check-harness.mjs',
  'scripts/check-harness-gc.mjs',
  'scripts/check-live-readiness.mjs',
  'scripts/check-public-content-overlay.mjs',
  'scripts/check-seo-readiness.mjs',
  'scripts/check-supabase-foundation-readiness.mjs',
]
const requiredPackageScripts = {
  'agent:check': 'node scripts/check-harness.mjs',
  'agent:admin-crud-coverage': 'node scripts/check-admin-crud-coverage.mjs',
  'agent:admin-config-gate': 'node scripts/check-admin-config-gate.mjs',
  'agent:admin-cms-predeploy': 'bash scripts/admin-cms-predeploy.sh',
  'agent:admin-auth-browser': 'node scripts/check-admin-auth-browser.mjs',
  'agent:admin-crud-live': 'node scripts/check-admin-crud-live.mjs',
  'agent:admin-media-role-boundary-live': 'node scripts/check-admin-media-role-boundary-live.mjs',
  'agent:admin-projects-aggregate': 'tsx scripts/check-admin-projects-aggregate.mjs',
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
  'agent:seo-readiness': 'node scripts/check-seo-readiness.mjs',
  'agent:harness-gc': 'node scripts/check-harness-gc.mjs',
  'agent:harness-gc:fix': 'node scripts/check-harness-gc.mjs --fix',
  'agent:harness-gc:review': 'node scripts/check-harness-gc.mjs --review',
  'agent:init': 'bash scripts/agent-init.sh',
  'agent:live-readiness': 'node scripts/check-live-readiness.mjs',
  'agent:public-content-overlay': 'tsx scripts/check-public-content-overlay.mjs',
  'agent:public-supabase-readiness': 'node scripts/check-public-supabase-readiness.mjs',
  'agent:supabase-foundation-readiness': 'node scripts/check-supabase-foundation-readiness.mjs',
  'agent:smoke': 'bash scripts/agent-smoke.sh',
  gate: 'bash scripts/container-gate.sh',
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
  const evidence = JSON.parse(
    readFileSync(join(root, 'docs/agent/admin-handoff-evidence.json'), 'utf8'),
  )
  const workflowKeys = [
    'authenticatedSignIn',
    'draftSaveRefresh',
    'privateMediaPublish',
    'publishedPublicReadback',
    'archivePublicReadback',
    'settingsPublicReadback',
    'inviteSetPassword',
    'passwordRecovery',
    'responsiveAdminNavigation',
    'projectsTaskWorkspace',
    'dashboardOperationalQueue',
    'editorGuideUsability',
  ]

  if (evidence.version !== 2) {
    failures.push('docs/agent/admin-handoff-evidence.json version must remain 2.')
  }
  if (!['revalidation_required', 'verified'].includes(evidence.state)) {
    failures.push('docs/agent/admin-handoff-evidence.json state must be revalidation_required or verified.')
  }
  if (!Object.hasOwn(evidence, 'deploymentSha') || !Object.hasOwn(evidence, 'deploymentUrl')) {
    failures.push('docs/agent/admin-handoff-evidence.json must record deploymentSha and deploymentUrl fields.')
  }
  const mediaRolePrerequisite = evidence.productionPrerequisites?.mediaPublicBucketRoleBoundary
  if (
    !mediaRolePrerequisite ||
    mediaRolePrerequisite.migration !== '20260714050750_media_public_bucket_role_hardening.sql' ||
    !Array.isArray(mediaRolePrerequisite.evidenceRefs)
  ) {
    failures.push(
      'docs/agent/admin-handoff-evidence.json must define the mediaPublicBucketRoleBoundary production prerequisite and migration.',
    )
  }
  for (const key of workflowKeys) {
    if (!evidence.workflows?.[key] || !Array.isArray(evidence.workflows[key].evidenceRefs)) {
      failures.push(`docs/agent/admin-handoff-evidence.json must define workflow ${key} with evidenceRefs.`)
    }
  }
} catch (error) {
  failures.push(`Unable to parse docs/agent/admin-handoff-evidence.json: ${error.message}`)
}

try {
  const smoke = readFileSync(join(root, 'scripts/agent-smoke.sh'), 'utf8')
  if (!smoke.includes('node scripts/check-contact-form-ui-source.mjs')) {
    failures.push('scripts/agent-smoke.sh must run the Contact form UI source contract check.')
  }
  if (!smoke.includes('node scripts/check-capabilities-page-source.mjs')) {
    failures.push('scripts/agent-smoke.sh must run the Capabilities page source contract check.')
  }
  if (!smoke.includes('npm run agent:admin-projects-aggregate')) {
    failures.push('scripts/agent-smoke.sh must run the Admin Projects aggregate behavior check.')
  }
} catch (error) {
  failures.push(`Unable to read scripts/agent-smoke.sh: ${error.message}`)
}

try {
  const predeploy = readFileSync(join(root, 'scripts/admin-cms-predeploy.sh'), 'utf8')
  if (!predeploy.includes('npm run agent:public-content-overlay')) {
    failures.push('scripts/admin-cms-predeploy.sh must run the public content overlay behavior check.')
  }
  if (!predeploy.includes('npm run agent:admin-media-role-boundary-live')) {
    failures.push('scripts/admin-cms-predeploy.sh must run the plan-only Media role-boundary verifier.')
  }
  if (!predeploy.includes('npm run agent:admin-projects-aggregate')) {
    failures.push('scripts/admin-cms-predeploy.sh must run the Admin Projects aggregate behavior verifier.')
  }
} catch (error) {
  failures.push(`Unable to read scripts/admin-cms-predeploy.sh: ${error.message}`)
}

try {
  const adminCrudCoverage = readFileSync(
    join(root, 'scripts/check-admin-crud-coverage.mjs'),
    'utf8',
  )
  if (!adminCrudCoverage.includes("join(root, 'node_modules/tsx/dist/cli.mjs')")) {
    failures.push(
      'scripts/check-admin-crud-coverage.mjs must invoke the Projects aggregate verifier through tsx for Node 20.',
    )
  }
} catch (error) {
  failures.push(`Unable to read scripts/check-admin-crud-coverage.mjs: ${error.message}`)
}

try {
  const roleBoundaryVerifier = readFileSync(
    join(root, 'scripts/check-admin-media-role-boundary-live.mjs'),
    'utf8',
  )
  for (const phrase of [
    'Live mode requires explicit --allow-writes.',
    'Editor private-bucket insert',
    'Editor private-bucket update',
    'Editor public-bucket insert',
    'Editor public-bucket update',
    'Owner/admin public-bucket insert',
    'Owner/admin public-bucket update',
    'All tagged Storage objects were removed',
  ]) {
    if (!roleBoundaryVerifier.includes(phrase)) {
      failures.push(`scripts/check-admin-media-role-boundary-live.mjs missing required contract: ${phrase}`)
    }
  }
  for (const forbidden of ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY']) {
    if (roleBoundaryVerifier.includes(forbidden)) {
      failures.push(`scripts/check-admin-media-role-boundary-live.mjs must not reference ${forbidden}.`)
    }
  }
} catch (error) {
  failures.push(`Unable to read scripts/check-admin-media-role-boundary-live.mjs: ${error.message}`)
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
  'Current warning: this guide is the target operating flow, not proof that production is handoff-ready.',
  '/admin/account-setup',
  'golden workflow',
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
  'Settings account handoff',
  'Stone Library publish path',
  'Articles publish path',
  'Final Handoff Decision',
  'Handoff Evidence Matrix',
  'Results Template',
  'Copy this table into `docs/WORKLOG.md` after the production walkthrough',
  'Admin CMS Golden Workflow Evidence',
  'Deployment URL: `https://<deployment>.urblo.pages.dev`',
  '| responsiveAdminNavigation | Pending |',
  '| projectsTaskWorkspace | Pending |',
  '| dashboardOperationalQueue | Pending |',
  '| editorGuideUsability | Pending |',
  'Admin Navigation Widths',
  'Editor Guide Usability',
  '| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |',
  'Result values:',
  'Deferred: Jay explicitly chose not to run a live action. Deferred is a blocker for final handoff, not a passing result.',
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
  '--media-role-migration-verified',
  '--media-role-writes-approved',
  '--content-import-approved',
  '--content-merge-approved',
  '--content-public-cutover-approved',
  '--turnstile-token-provided',
]

try {
  const liveReadiness = readFileSync(join(root, 'scripts/check-live-readiness.mjs'), 'utf8')
  for (const phrase of [
    '--media-role-migration-verified',
    '--media-role-writes-approved',
    'mediaRoleAccountsDistinct',
    'URBLO_EDITOR_EMAIL must identify a different Auth user from URBLO_ADMIN_EMAIL',
  ]) {
    if (!liveReadiness.includes(phrase)) {
      failures.push(`scripts/check-live-readiness.mjs missing Media role readiness contract: ${phrase}`)
    }
  }
} catch (error) {
  failures.push(`Unable to read scripts/check-live-readiness.mjs: ${error.message}`)
}
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
