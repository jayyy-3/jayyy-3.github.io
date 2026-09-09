import assert from 'node:assert/strict'
import { assertLocalOrigin, cleanLocalEnv, LOCAL_API } from './_lib/local-environment.mjs'
assert.equal(assertLocalOrigin(LOCAL_API), LOCAL_API)
for (const url of ['https://urblo.com.au', 'https://npkidywzwddbnfrnxlmo.supabase.co', 'http://localhost:57321', 'http://127.0.0.1:54321', `${LOCAL_API}/rest/v1`, `${LOCAL_API}?target=production`, 'http://user:pass@127.0.0.1:57321', 'http://127.0.0.1.evil.example:57321']) assert.throws(() => assertLocalOrigin(url))
const cleaned = cleanLocalEnv({ PATH: '/bin', SUPABASE_URL: 'production', SUPABASE_SERVICE_ROLE_KEY: 'secret', SUPABASE_ACCESS_TOKEN: 'secret', VITE_SUPABASE_URL: 'production', CLOUDFLARE_API_TOKEN: 'secret', SMTP2GO_API_KEY: 'secret', RESEND_API_KEY: 'secret', NODE_OPTIONS: '--require unsafe.js' })
for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ACCESS_TOKEN', 'VITE_SUPABASE_URL', 'CLOUDFLARE_API_TOKEN', 'SMTP2GO_API_KEY', 'RESEND_API_KEY', 'NODE_OPTIONS']) assert.equal(cleaned[key], undefined)
assert.throws(() => cleanLocalEnv({ DOCKER_HOST: 'tcp://remote.example:2376' }))
console.log('Local target, credential stripping, redirect policy and remote Docker denial passed.')
const { spawnSync } = await import('node:child_process')
for (const command of ['start', 'reset', 'seed', 'status']) {
  const result = spawnSync(process.execPath, ['scripts/local-stack.mjs', command, '--api-url', 'https://npkidywzwddbnfrnxlmo.supabase.co'], { env: { PATH: '/unavailable', HOME: process.env.HOME }, encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Refusing non-local target/)
  assert.doesNotMatch(result.stderr, /spawn.*ENOENT/)
}
console.log('Actual CLI refuses production targets before attempting any Docker command or write.')
