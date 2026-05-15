#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { cwd, exit } from 'node:process'

const root = cwd()
const badTextPatterns = [
  { pattern: /\/Users\//, label: 'machine-specific /Users path' },
  { pattern: /New project/, label: 'external local archive path/name' },
  { pattern: /urblo-react\//, label: 'repo directory embedded in path' },
]

const rootDocs = ['AGENTS.md', 'README.md']
const docRoots = ['docs']
const allowedMissing = new Set([
  'docs/README_AGENT.md',
  'public/404.html',
])
const pathPrefixes = [
  '.github/',
  'AGENTS.md',
  'README.md',
  'data/',
  'docs/',
  'eslint.config.js',
  'index.html',
  'package.json',
  'public/',
  'scripts/',
  'src/',
  'tsconfig.app.json',
  'vite.config.ts',
]

const failures = []

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      files.push(...walk(full))
    } else {
      files.push(full)
    }
  }
  return files
}

function repoRelative(path) {
  return relative(root, path)
}

function shouldScanFile(file) {
  const ext = extname(file)
  return ext === '.md' || ext === '.json'
}

function looksLikeRepoPath(value) {
  return pathPrefixes.some((prefix) => value === prefix || value.startsWith(prefix))
}

function skipPathCandidate(value, line) {
  if (value.includes('*') || value.includes('<') || value.includes('>')) return true
  if (value.includes('${') || value.includes(' ')) return true
  if (allowedMissing.has(value)) return true
  if (line.includes('(if ') || line.includes('future')) return true
  return false
}

function checkTextFile(file) {
  const text = readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const rel = repoRelative(file)

  for (const { pattern, label } of badTextPatterns) {
    const match = text.match(pattern)
    if (match) {
      failures.push(`${rel}: contains ${label}`)
    }
  }

  lines.forEach((line, index) => {
    const lineNo = index + 1
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      const candidate = match[1]
      if (!looksLikeRepoPath(candidate)) continue
      if (skipPathCandidate(candidate, line)) continue
      if (!existsSync(join(root, candidate))) {
        failures.push(`${rel}:${lineNo}: missing repo path \`${candidate}\``)
      }
    }
  })
}

function checkTaskJson(file) {
  const rel = repoRelative(file)
  let data
  try {
    data = JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    failures.push(`${rel}: invalid JSON (${error.message})`)
    return
  }

  if (!Array.isArray(data.tasks)) {
    failures.push(`${rel}: tasks must be an array`)
    return
  }

  const ids = new Set()
  data.tasks.forEach((task, index) => {
    const pointer = `${rel}:tasks[${index}]`
    for (const field of ['id', 'status', 'priority', 'summary', 'files', 'acceptance', 'verification']) {
      if (!(field in task)) failures.push(`${pointer}: missing ${field}`)
    }
    if (task.id) {
      if (ids.has(task.id)) failures.push(`${pointer}: duplicate id ${task.id}`)
      ids.add(task.id)
    }
    if (!['now', 'next', 'later', 'done', 'blocked'].includes(task.status)) {
      failures.push(`${pointer}: invalid status ${task.status}`)
    }
    if (typeof task.priority !== 'number') {
      failures.push(`${pointer}: priority must be a number`)
    }
    if (Array.isArray(task.files)) {
      task.files.forEach((path) => {
        if (path.includes('*') || allowedMissing.has(path)) return
        if (!existsSync(join(root, path))) {
          failures.push(`${pointer}: missing file path \`${path}\``)
        }
      })
    }
  })
}

const files = [
  ...rootDocs.filter((file) => existsSync(join(root, file))).map((file) => join(root, file)),
  ...docRoots.flatMap((dir) => existsSync(join(root, dir)) ? walk(join(root, dir)) : []),
].filter(shouldScanFile)

files.forEach((file) => {
  checkTextFile(file)
  if (repoRelative(file) === 'docs/agent/tasks.json') {
    checkTaskJson(file)
  }
})

if (failures.length) {
  console.error('Documentation path checks failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  exit(1)
}

console.log(`Documentation path checks passed (${files.length} files scanned).`)
