import { execFileSync } from 'node:child_process';
import { loadState } from './_lib/agent-state.mjs';
const { status, queue, modules } = loadState();
const args = process.argv.slice(2);
const taskId = args.includes('--task') ? args[args.indexOf('--task') + 1] : status.currentTaskId;
let task = queue.tasks.find((item) => item.id === taskId);
if (!task) {
  console.error(`Task ${taskId} is not active. Consult ${queue.archive} for completed tasks; do not silently resume history.`);
  process.exit(1);
}
const git = (args) => { try { return execFileSync('git', args, { encoding: 'utf8' }).trim(); } catch { return 'unavailable'; } };
const moduleIds = task.modules || ['harness'];
const selectedModules = Object.fromEntries(moduleIds.map((id) => [id, modules.modules[id]]));
const result = { version: 1, checkout: { sha: git(['rev-parse', 'HEAD']), branch: git(['branch', '--show-current']), dirty: Boolean(git(['status', '--porcelain'])) }, release: status.release, task, modules: selectedModules, startup: status.startup.files };
if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Urblo — ${result.checkout.branch} / ${result.checkout.sha.slice(0, 7)}${result.checkout.dirty ? ' (dirty; preserve unrelated work)' : ''}`);
  console.log(`Observed runtime: ${status.release.runtimeSha.slice(0, 7)} / ${status.release.verifiedRuntimeUrl}`);
  console.log(`Task: ${task.id} [${task.status}/${task.phase}]\n${task.summary}`);
  if (task.blocker) console.log(`Blocker: ${task.blocker}`);
  console.log(`Acceptance:\n${task.acceptance.map((line) => `- ${line}`).join('\n')}`);
  for (const [id, module] of Object.entries(selectedModules)) console.log(`\n${id}\nRead: ${module.rules.join(', ')}\nCode: ${module.paths.join(', ')}\nChecks: ${module.checks.join(', ')}`);
  console.log(`\nAuthorization: ${task.authorization ? JSON.stringify(task.authorization) : 'Use the current user request; no live-write authority is inferred.'}`);
  console.log(`\nNext: ${task.verification.join(' → ')}. No full history read is required.`);
}
