#!/usr/bin/env node
// Startup reading budget: what a cold agent reads before touching code.
// Counts AGENTS.md + status.startup.files + the module rule files that
// `agent:init` lists, per module and per representative task. Module
// `references` are on-demand deep documents and are deliberately excluded.
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const MAX_TASK_BYTES = 40 * 1024
export const MAX_RULE_BYTES = 8 * 1024
// One task per kind of change (projects, products, public-ui); ids may be active or archived.
export const REPRESENTATIVE_TASKS = {
  projects: 'NOW-STONE-PROJECT-REFS-001',
  products: 'NEXT-ADMIN-MODULE-BOUNDARIES-001',
  'public-ui': 'NOW-OPT-DESIGN-TOKENS-COMPONENTS-001',
}

export function measureStartup(root = process.cwd()) {
  const read = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'))
  const status = read('docs/agent/status.json')
  const modules = read('docs/agent/modules.json').modules
  const queue = read('docs/agent/tasks.json')
  const archive = existsSync(join(root, queue.archive)) ? read(queue.archive) : { tasks: [] }
  const size = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path)).length : NaN)
  const base = [...new Set(['AGENTS.md', ...status.startup.files])]
  const total = (paths) => [...new Set(paths)].reduce((sum, path) => sum + size(path), 0)
  const errors = []
  const rules = {}
  for (const module of Object.values(modules)) for (const path of module.rules) rules[path] = size(path)
  for (const [path, bytes] of Object.entries(rules)) {
    if (!(bytes <= MAX_RULE_BYTES)) errors.push(`Rule file ${path} is ${bytes} bytes (limit ${MAX_RULE_BYTES}); move detail into an on-demand reference.`)
  }
  const perModule = Object.fromEntries(Object.entries(modules).map(([id, module]) => [id, total([...base, ...module.rules])]))
  for (const [id, bytes] of Object.entries(perModule)) if (!(bytes <= MAX_TASK_BYTES)) errors.push(`Module ${id} startup set is ${bytes} bytes (limit ${MAX_TASK_BYTES}).`)
  const findTask = (id) => queue.tasks.find((task) => task.id === id) ?? archive.tasks.find((task) => task.id === id)
  const taskSet = (task) => [...base, ...(task.modules || []).flatMap((id) => modules[id]?.rules ?? [])]
  const perTask = {}
  for (const [kind, id] of Object.entries(REPRESENTATIVE_TASKS)) {
    const task = findTask(id)
    if (!task) { errors.push(`Representative ${kind} task ${id} not found in the active or archived queue.`); continue }
    perTask[id] = { kind, modules: task.modules || [], bytes: total(taskSet(task)) }
    if (!(perTask[id].bytes <= MAX_TASK_BYTES)) errors.push(`Representative ${kind} task ${id} startup set is ${perTask[id].bytes} bytes (limit ${MAX_TASK_BYTES}).`)
  }
  // Active tasks are reported (not failed): a many-module task may legitimately read more.
  const activeTasks = Object.fromEntries(queue.tasks.filter((task) => task.modules?.length).map((task) => [task.id, total(taskSet(task))]))
  return { base: total(base), baseFiles: base, rules, perModule, perTask, activeTasks, errors }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = measureStartup()
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2))
  else {
    console.log(`Startup base (${result.baseFiles.join(', ')}): ${result.base} bytes`)
    for (const [id, bytes] of Object.entries(result.perModule)) console.log(`module ${id}: ${bytes}`)
    for (const [id, item] of Object.entries(result.perTask)) console.log(`task ${item.kind} ${id} [${item.modules.join(',')}]: ${item.bytes}`)
    const heavy = Object.entries(result.activeTasks).filter(([, bytes]) => bytes > MAX_TASK_BYTES)
    for (const [id, bytes] of heavy) console.log(`note: active multi-module task ${id} reads ${bytes} bytes; read module rules for the files you touch.`)
  }
  if (result.errors.length) {
    console.error(`Agent startup budget failed:\n${result.errors.map((error) => `- ${error}`).join('\n')}`)
    process.exit(1)
  }
  if (!process.argv.includes('--json')) console.log(`Agent startup budget passed (task <= ${MAX_TASK_BYTES} bytes, rule file <= ${MAX_RULE_BYTES} bytes).`)
}
