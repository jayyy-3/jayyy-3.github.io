// Behaviour assertions moved to tests/public-content-overlay.test.ts (vitest).
// This entry point keeps `npm run agent:public-content-overlay` working.
import { exit } from 'node:process';
import { runVitest } from './_lib/vitest.mjs';

exit(runVitest(['tests/public-content-overlay.test.ts']));
