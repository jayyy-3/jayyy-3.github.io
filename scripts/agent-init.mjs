import { execFileSync } from 'node:child_process';
import { loadState } from './_lib/agent-state.mjs';
const { status, queue, modules } = loadState();
const args = process.argv.slice(2);
const taskFlag = args.indexOf('--task');
if (taskFlag !== -1 && (!args[taskFlag + 1] || args[taskFlag + 1].startsWith('--'))) {
  console.error('--task requires a task ID.');
  process.exit(1);
}
const taskId = taskFlag !== -1 ? args[taskFlag + 1] : status.currentTaskId;
const task = taskId ? queue.tasks.find((item) => item.id === taskId) : null;
if (taskId && !task) {
  console.error(`Task ${taskId} is not active. Consult ${queue.archive} for completed tasks; do not silently resume history.`);
  process.exit(1);
}
const git = (args) => { try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const moduleIds = task?.modules || [];
const selectedModules = Object.fromEntries(moduleIds.map((id) => [id, modules.modules[id]]));
const workingStatus = git(['status', '--porcelain']);
const result = {
  version: 2,
  checkout: { sha: git(['rev-parse', 'HEAD']), branch: git(['branch', '--show-current']), dirty: workingStatus === null ? null : Boolean(workingStatus) },
  release: status.release,
  task,
  lastCompletedTask: status.lastCompletedTask ?? null,
  recommendedTasks: queue.tasks.filter(item => item.status === 'next').sort((a, b) => a.priority - b.priority).map(({ id, summary }) => ({ id, summary })),
  modules: selectedModules,
  startup: status.startup.files,
};
if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Urblo — ${result.checkout.branch ?? 'no Git metadata'} / ${result.checkout.sha?.slice(0, 7) ?? 'unavailable'}${result.checkout.dirty ? ' (dirty; preserve unrelated work)' : ''}`);
  console.log(`Observed runtime: ${status.release.runtimeSha.slice(0, 7)} / ${status.release.verifiedRuntimeUrl}`);
  if (task) {
    console.log(`Task: ${task.id} [${task.status}/${task.phase}]\n${task.summary}`);
    if (task.blocker) console.log(`Blocker: ${task.blocker}`);
    if (task.progress) console.log(`Progress: ${JSON.stringify(task.progress)}`);
    console.log(`Acceptance:\n${task.acceptance.map((line) => `- ${line}`).join('\n')}`);
    for (const [id, module] of Object.entries(selectedModules)) console.log(`\n${id}\nRead: ${module.rules.join(', ')}\nCode: ${module.paths.join(', ')}\nChecks: ${module.checks.join(', ')}`);
    console.log(`\nAuthorization: ${task.authorization ? JSON.stringify(task.authorization) : 'Use the current user request; no live-write authority is inferred.'}`);
    console.log(`\nNext action: ${task.nextAction ?? 'Follow the task acceptance and current phase.'}`);
    console.log(`Verification: ${task.verification.join(' → ')}. No full history read is required.`);
  } else {
    console.log('No active implementation task. Completed work is archived; queued work is not automatically authorized.');
    if (result.lastCompletedTask) console.log(`Last completed: ${result.lastCompletedTask.id} — ${result.lastCompletedTask.summary}`);
    console.log(`Next candidates:\n${result.recommendedTasks.slice(0, 3).map(item => `- ${item.id}: ${item.summary}`).join('\n')}`);
    console.log('Use --task <id> to inspect a candidate; this command does not change task state.');
  }
}
