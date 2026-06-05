#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { cwd, exit } from 'node:process'
import { join } from 'node:path'

const root = cwd()
const args = new Set(process.argv.slice(2))
const shouldFix = args.has('--fix')
const shouldReview = args.has('--review')
const today = new Date().toISOString().slice(0, 10)

const checks = []
const reviewNotes = []
const writes = []

function add(level, title, detail = '') {
  checks.push({ level, title, detail })
  if (level !== 'ok') {
    reviewNotes.push({ level, title, detail })
  }
}

function readText(path) {
  return readFileSync(join(root, path), 'utf8')
}

function readJson(path) {
  return JSON.parse(readText(path))
}

function lineCount(path) {
  return readText(path).split(/\r?\n/).length
}

function includesAny(text, phrases) {
  return phrases.filter((phrase) => text.includes(phrase))
}

function formatList(values) {
  return values.length ? values.join(', ') : 'none'
}

function topLevelLastUpdated(text) {
  return /^Last updated:\s*(\d{4}-\d{2}-\d{2})/m.exec(text)?.[1] || ''
}

function replaceTopLevelLastUpdated(path, nextDate) {
  const absolute = join(root, path)
  const text = readFileSync(absolute, 'utf8')
  const updated = text.replace(/^Last updated:\s*\d{4}-\d{2}-\d{2}/m, `Last updated: ${nextDate}`)
  if (updated !== text) {
    writeFileSync(absolute, updated)
    writes.push(path)
  }
}

let pkg = null
let tasksData = null
let status = null

try {
  pkg = readJson('package.json')
  add('ok', 'package.json parse', 'Package manifest parsed.')
} catch (error) {
  add('fail', 'package.json parse', error.message)
}

try {
  tasksData = readJson('docs/agent/tasks.json')
  add('ok', 'tasks.json parse', 'Machine task queue parsed.')
} catch (error) {
  add('fail', 'tasks.json parse', error.message)
}

try {
  status = readJson('docs/agent/status.json')
  const required = [
    'version',
    'lastUpdated',
    'production',
    'localReproducibility',
    'nextDecisions',
    'activeExecutableTasks',
    'umbrellaTasks',
  ]
  const missing = required.filter((key) => !(key in status))
  if (missing.length) {
    add('fail', 'status.json shape', `Missing keys: ${missing.join(', ')}`)
  } else {
    add('ok', 'status.json shape', `Version ${status.version}, last updated ${status.lastUpdated}.`)
  }
} catch (error) {
  add('fail', 'status.json parse', error.message)
}

if (status) {
  const active = new Set(status.activeExecutableTasks || [])
  const umbrella = status.umbrellaTasks || []
  const activeUmbrellas = umbrella.filter((taskId) => active.has(taskId))
  if (activeUmbrellas.length) {
    add('fail', 'active executable task boundary', `Umbrella tasks cannot be active executable tasks: ${activeUmbrellas.join(', ')}`)
  } else {
    add('ok', 'active executable task boundary', 'No umbrella task appears in activeExecutableTasks.')
  }
}

if (tasksData?.tasks) {
  const counts = {}
  for (const task of tasksData.tasks) {
    counts[task.status || 'missing'] = (counts[task.status || 'missing'] || 0) + 1
  }
  add('ok', 'task status counts', JSON.stringify(counts))

  const nowTasks = tasksData.tasks.filter((task) => task.status === 'now')
  const maxNow = status?.harnessGc?.maxNowTasks ?? 3
  if (nowTasks.length > maxNow) {
    add('warn', 'too many now tasks', `${nowTasks.length} now tasks exceed target ${maxNow}: ${nowTasks.map((task) => task.id).join(', ')}`)
  } else {
    add('ok', 'now task count', `${nowTasks.length} now tasks within target ${maxNow}.`)
  }

  const umbrellaIds = new Set(status?.umbrellaTasks || [])
  for (const task of tasksData.tasks) {
    const haystack = `${task.summary || ''}\n${(task.notes || []).join('\n')}`.toLowerCase()
    if (haystack.includes('umbrella')) {
      umbrellaIds.add(task.id)
    }
  }
  const nowUmbrellas = nowTasks.filter((task) => umbrellaIds.has(task.id)).map((task) => task.id)
  if (nowUmbrellas.length) {
    add('warn', 'umbrella task in now queue', `Umbrella tasks still marked now: ${nowUmbrellas.join(', ')}`)
  } else {
    add('ok', 'umbrella task in now queue', 'No known umbrella task is marked now.')
  }

  const doneWithActiveLanguage = tasksData.tasks
    .filter((task) => task.status === 'done')
    .filter((task) => {
      const recent = [...(task.notes || []), ...(task.acceptance || [])].join('\n').toLowerCase()
      return recent.includes('remaining proof') || recent.includes('still requires') || recent.includes('blocked')
    })
    .map((task) => task.id)
  if (doneWithActiveLanguage.length) {
    add('warn', 'done tasks with active-blocker language', `Review wording in done tasks: ${doneWithActiveLanguage.join(', ')}`)
  } else {
    add('ok', 'done task wording', 'Done tasks do not contain the configured active-blocker phrases.')
  }
}

try {
  const readme = readText('README.md')
  const stalePhrases = [
    'no production API',
    'Supabase integration, or admin CMS is implemented yet',
    'admin CMS is implemented yet',
    'static React frontend with file-backed content',
  ]
  const hits = includesAny(readme, stalePhrases)
  if (hits.length) {
    add('fail', 'README stale production status', `Stale phrases found: ${hits.join(' | ')}`)
  } else {
    add('ok', 'README stale production status', 'No configured stale production-status phrases found.')
  }
} catch (error) {
  add('fail', 'README scan', error.message)
}

try {
  const gitignore = readText('.gitignore')
  if (gitignore.includes('.tmp/')) {
    add('ok', '.tmp ignore', '.tmp/ is ignored.')
  } else {
    add('fail', '.tmp ignore', '.tmp/ must remain ignored so review artifacts are not canonical state.')
  }
} catch (error) {
  add('fail', '.gitignore scan', error.message)
}

if (pkg?.scripts) {
  const agentScripts = Object.keys(pkg.scripts).filter((name) => name.startsWith('agent:')).sort()
  const docsToScan = [
    'AGENTS.md',
    'README.md',
    'docs/HANDOFF.md',
    'docs/NEXT_STEPS.md',
    'docs/ARCHITECTURE.md',
    'docs/agent/verification.md',
    'docs/agent/harness-gc.md',
    'docs/CLOUDFLARE_DEPLOYMENT.md',
    'docs/ADMIN_PRODUCTION_WALKTHROUGH.md',
  ]
  const docsText = docsToScan
    .filter((path) => existsSync(join(root, path)))
    .map((path) => readText(path))
    .join('\n')
  const missingCoverage = agentScripts.filter((script) => !docsText.includes(script))
  if (missingCoverage.length) {
    add('warn', 'agent script documentation coverage', `Missing exact script mentions: ${missingCoverage.join(', ')}`)
  } else {
    add('ok', 'agent script documentation coverage', `${agentScripts.length} agent scripts are represented in Harness docs.`)
  }
}

if (status?.lastUpdated) {
  const dateDocs = [
    'AGENTS.md',
    'docs/HANDOFF.md',
    'docs/NEXT_STEPS.md',
    'docs/WORKLOG.md',
    'docs/agent/verification.md',
    'docs/agent/harness-gc.md',
  ]
  for (const path of dateDocs) {
    if (!existsSync(join(root, path))) continue
    const date = topLevelLastUpdated(readText(path))
    if (!date) {
      add('warn', 'Last updated metadata', `${path} has no top-level Last updated date.`)
      continue
    }
    if (date < status.lastUpdated) {
      add('warn', 'Last updated metadata', `${path} is ${date}, older than status.json ${status.lastUpdated}.`)
      if (shouldFix) {
        replaceTopLevelLastUpdated(path, status.lastUpdated)
      }
    } else {
      add('ok', 'Last updated metadata', `${path} is ${date}.`)
    }
  }
}

const thresholds = status?.harnessGc || {}
const sizeChecks = [
  ['AGENTS.md', thresholds.agentsMdTargetLines ?? 180],
  ['docs/HANDOFF.md', thresholds.handoffTargetLines ?? 220],
  ['docs/WORKLOG.md', thresholds.worklogReviewWarningLines ?? 8000],
]
for (const [path, threshold] of sizeChecks) {
  if (!existsSync(join(root, path))) continue
  const lines = lineCount(path)
  if (lines > threshold) {
    add('warn', 'Harness size threshold', `${path} has ${lines} lines; target is ${threshold}.`)
  } else {
    add('ok', 'Harness size threshold', `${path} has ${lines} lines; target is ${threshold}.`)
  }
}

if (shouldFix) {
  if (writes.length) {
    add('ok', 'fix mode writes', `Updated: ${writes.join(', ')}`)
  } else {
    add('ok', 'fix mode writes', 'No low-risk automatic fixes were needed.')
  }
}

if (shouldReview) {
  writeReviewArtifact()
}

printReport()

if (checks.some((check) => check.level === 'fail')) {
  exit(1)
}

function printReport() {
  const failures = checks.filter((check) => check.level === 'fail')
  const warnings = checks.filter((check) => check.level === 'warn')

  console.log('Harness GC report')
  console.log(`Mode: ${shouldReview ? 'review' : shouldFix ? 'fix' : 'read-only'}`)
  console.log(`Failures: ${failures.length}`)
  console.log(`Warnings: ${warnings.length}`)
  console.log('')

  for (const check of checks) {
    const prefix = check.level === 'fail' ? '[fail]' : check.level === 'warn' ? '[warn]' : '[ok]'
    console.log(`${prefix} ${check.title}`)
    if (check.detail) console.log(`  ${check.detail}`)
  }

  if (shouldReview) {
    console.log('')
    console.log('Review artifact: .tmp/harness-gc-review.md')
  }
}

function writeReviewArtifact() {
  const failures = checks.filter((check) => check.level === 'fail')
  const warnings = checks.filter((check) => check.level === 'warn')
  const score = Math.max(0, 100 - failures.length * 20 - warnings.length * 4)
  const taskCounts = checks.find((check) => check.title === 'task status counts')?.detail || 'unavailable'
  const topRisks = reviewNotes.slice(0, 8)

  const lines = [
    '# Harness GC Review',
    '',
    `Generated: ${today}`,
    '',
    `Harness architecture score: ${score}/100`,
    '',
    '## Summary',
    `- Failures: ${failures.length}`,
    `- Warnings: ${warnings.length}`,
    `- Task status counts: ${taskCounts}`,
    '',
    '## Top Drift Risks',
    ...(topRisks.length
      ? topRisks.map((note) => `- ${note.level.toUpperCase()}: ${note.title} - ${note.detail}`)
      : ['- None from configured checks.']),
    '',
    '## Documents To Shorten Or Split',
    ...documentsToShorten().map((entry) => `- ${entry}`),
    '',
    '## Guardrails Worth Adding',
    '- Promote stable Harness GC checks into `npm run agent:check` only after false positives are reviewed.',
    '- Keep `docs/agent/status.json` short and update it after major production proof changes.',
    '- Add a task-queue cleanup pass that separates umbrella objectives from executable follow-ups.',
    '',
    '## Questions For Jay',
    '- Which remaining `now` tasks are truly active this week?',
    '- Should final Turnstile proof block any future launch milestone?',
    '- Who should receive the first real Settings invite proof email?',
    '- Which imported Draft CMS items should a customer review and publish first?',
    '',
    '## Suggested Task Updates',
    '- Consider moving completed CMS handoff follow-ups out of `now` and into deferred/next items where appropriate.',
    '- Keep `NOW-ADMIN-CMS-001` as an umbrella only; use child tasks for executable work.',
    '- Keep optional Settings invite proof separate from CMS handoff readiness.',
    '',
  ]

  mkdirSync(join(root, '.tmp'), { recursive: true })
  writeFileSync(join(root, '.tmp/harness-gc-review.md'), `${lines.join('\n')}\n`)
}

function documentsToShorten() {
  const items = []
  for (const [path, threshold] of [
    ['AGENTS.md', thresholds.agentsMdTargetLines ?? 180],
    ['docs/HANDOFF.md', thresholds.handoffTargetLines ?? 220],
    ['docs/WORKLOG.md', thresholds.worklogReviewWarningLines ?? 8000],
  ]) {
    if (!existsSync(join(root, path))) continue
    const lines = lineCount(path)
    if (lines > threshold) {
      items.push(`${path}: ${lines} lines exceeds target ${threshold}.`)
    }
  }
  if (!items.length) {
    items.push('No configured size threshold is exceeded.')
  }
  return items
}
