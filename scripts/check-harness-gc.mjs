import { mkdirSync, writeFileSync } from 'node:fs';
import { loadState, validateState, checkGenerated, verifyArchive } from './_lib/agent-state.mjs';
const args = process.argv.slice(2);
if (args.includes('--fix')) {
  console.error('GC is read-only. Edit canonical inputs and run agent:state; dates are never refreshed to hide stale evidence.');
  process.exit(1);
}
const bundle = loadState();
const errors = [...validateState(bundle), ...checkGenerated(bundle), ...verifyArchive()];
const summary = { version: 2, passed: !errors.length, errors, activeTasks: bundle.queue.tasks.length, currentTask: bundle.status.currentTaskId };
if (args.includes('--review')) {
  mkdirSync('.tmp', { recursive: true });
  writeFileSync('.tmp/harness-gc-review.md', `# Harness GC\n\n${JSON.stringify(summary, null, 2)}\n\nReview modules and evidence from docs/MAINTAINABILITY_AUDIT.md. No state was changed.\n`);
}
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
