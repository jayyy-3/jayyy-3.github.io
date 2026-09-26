import { afterEach, expect, test } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MAX_RULE_BYTES, MAX_TASK_BYTES, REPRESENTATIVE_TASKS, measureStartup } from '../scripts/check-agent-startup-budget.mjs'

let root = ''
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }) })

function fixture(ruleBytes: number, moduleCount = 1) {
  root = mkdtempSync(join(tmpdir(), 'urblo-startup-budget-'))
  mkdirSync(join(root, 'docs/agent'), { recursive: true })
  const write = (path: string, data: string) => writeFileSync(join(root, path), data)
  write('AGENTS.md', 'a'.repeat(1000))
  write('docs/agent/status.json', JSON.stringify({ startup: { files: ['AGENTS.md', 'docs/agent/status.json'] } }))
  const modules: Record<string, { rules: string[] }> = {}
  for (let i = 0; i < moduleCount; i++) {
    write(`docs/rule-${i}.md`, 'r'.repeat(ruleBytes))
    modules[`m${i}`] = { rules: [`docs/rule-${i}.md`] }
  }
  write('docs/agent/modules.json', JSON.stringify({ modules }))
  const tasks = Object.values(REPRESENTATIVE_TASKS).map(id => ({ id, modules: Object.keys(modules) }))
  write('docs/agent/tasks.json', JSON.stringify({ archive: 'docs/agent/none.json', tasks }))
  return root
}

test('passes a small startup set and counts shared files once', () => {
  const result = measureStartup(fixture(2000, 2))
  expect(result.errors).toEqual([])
  expect(Object.values(result.perTask)[0].bytes).toBe(result.base + 4000)
})

test('fails an oversized rule file', () => {
  const result = measureStartup(fixture(MAX_RULE_BYTES + 1))
  expect(result.errors.some(error => error.includes('Rule file docs/rule-0.md'))).toBe(true)
})

test('fails a representative task whose combined rules exceed the task budget', () => {
  const result = measureStartup(fixture(MAX_RULE_BYTES, 6))
  expect(MAX_RULE_BYTES * 6).toBeGreaterThan(MAX_TASK_BYTES)
  expect(result.errors.filter(error => error.startsWith('Representative'))).toHaveLength(3)
})
