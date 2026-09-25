// Behaviour assertions moved to tests/stone-workspace.test.ts (vitest).
// This entry point keeps `npm run agent:stone-workspace` and the admin CRUD
// coverage delegation working.
import { exit } from 'node:process';
import { runVitest } from './_lib/vitest.mjs';

exit(runVitest(['tests/stone-workspace.test.ts']));
