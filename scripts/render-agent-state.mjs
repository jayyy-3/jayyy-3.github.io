import { readFileSync, writeFileSync } from 'node:fs';
import { loadState, renderState, checkGenerated } from './_lib/agent-state.mjs';
const bundle = loadState();
if (process.argv.includes('--check')) {
  const errors = checkGenerated(bundle);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Generated state is current.');
} else {
  const rendered = renderState(bundle);
  for (const path of ['docs/HANDOFF.md', 'docs/NEXT_STEPS.md']) writeFileSync(path, rendered[path]);
  const readme = readFileSync('README.md', 'utf8');
  if (!readme.includes('<!-- agent:status:start -->') || !readme.includes('<!-- agent:status:end -->')) throw new Error('README state markers missing; refusing to overwrite.');
  writeFileSync('README.md', readme.replace(/<!-- agent:status:start -->[\s\S]*?<!-- agent:status:end -->/, rendered.readme));
  console.log('Generated HANDOFF, NEXT_STEPS and README state.');
}
