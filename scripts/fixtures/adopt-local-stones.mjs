// Exercises the approved-plan machinery only against the disposable loopback fixture.
import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const plan = 'docs/agent/stone-library-adoption-plan.json';
const sha = createHash('sha256').update(readFileSync(plan)).digest('hex');
const base = [
  { alg: 'HS256', typ: 'JWT' },
  { role: 'anon', exp: 4102444800 },
]
  .map((x) => Buffer.from(JSON.stringify(x)).toString('base64url'))
  .join('.');
const key =
  base +
  '.' +
  createHmac('sha256', 'stone-fixture-only-secret-at-least-32-bytes')
    .update(base)
    .digest('base64url');
const result = spawnSync(
  process.execPath,
  [
    'scripts/apply-stone-library-adoption.mjs',
    '--local-fixture',
    '--base-url',
    'http://127.0.0.1:5417',
    '--allow-writes',
    '--approved-plan-sha256',
    sha,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_SUPABASE_PUBLISHABLE_KEY: key,
      URBLO_ADMIN_EMAIL: 'stone-owner@example.invalid',
      URBLO_ADMIN_PASSWORD: 'fixture-password',
    },
  },
);
process.exit(result.status ?? 1);
