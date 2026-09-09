#!/usr/bin/env node
import { cpSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { assertLocalOrigin, readLocalCredentials, cleanLocalEnv, LOCAL_API, LOCAL_APP } from './_lib/local-environment.mjs'
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--api-url')) throw new Error('Only --api-url is supported')
assertLocalOrigin(args[1] ?? LOCAL_API)
const credentials = readLocalCredentials()
const root = process.cwd()
const directory = resolve(root, '.tmp/local/app')
mkdirSync(directory, { recursive: true })
// A separate envDir and process allowlist prevent production .env values entering the build.
const buildEnv = { ...cleanLocalEnv(), VITE_SUPABASE_URL: credentials.apiUrl, VITE_SUPABASE_PUBLISHABLE_KEY: credentials.anonKey, VITE_SUPABASE_ANON_KEY: '', VITE_TURNSTILE_SITE_KEY: '' }
const buildScript = `import { build } from 'vite'; await build({ root: ${JSON.stringify(root)}, envDir: ${JSON.stringify(directory)}, build: { outDir: ${JSON.stringify(resolve(directory, 'dist'))}, emptyOutDir: true } });`
const built = spawnSync(process.execPath, ['--input-type=module', '-e', buildScript], { env: buildEnv, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
if (built.status !== 0) { console.error('Local application build failed'); process.exit(1) }
cpSync(resolve(root, 'functions'), resolve(directory, 'functions'), { recursive: true })
// Function modules import shared source contracts using their original relative paths.
cpSync(resolve(root, 'src'), resolve(directory, 'src'), { recursive: true })
cpSync(resolve(root, 'data/clean'), resolve(directory, 'data/clean'), { recursive: true })
writeFileSync(resolve(directory, '.dev.vars'), `SUPABASE_URL=${credentials.apiUrl}\nSUPABASE_SERVICE_ROLE_KEY=${credentials.serviceKey}\n`, { mode: 0o600 })
console.log(`Starting real Pages Functions at ${LOCAL_APP}; database ${LOCAL_API}; external mail credentials absent.`)
const server = spawn(process.execPath, [resolve(root, 'node_modules/wrangler/bin/wrangler.js'), 'pages', 'dev', 'dist', '--ip', '127.0.0.1', '--port', '8788', '--inspector-port', '9238', '--compatibility-date', '2026-09-09', '--log-level', 'warn'], { cwd: directory, env: cleanLocalEnv(), stdio: ['ignore', 'pipe', 'pipe'] })
function safeOutput(chunk) {
  let value = chunk.toString()
  for (const secret of [credentials.serviceKey, credentials.anonKey]) value = value.split(secret).join('[LOCAL KEY REDACTED]')
  process.stdout.write(value)
}
server.stdout.on('data', safeOutput); server.stderr.on('data', safeOutput)
server.on('error', () => { console.error('Local Functions process could not start'); process.exitCode = 1 })
server.on('exit', code => { process.exitCode = code ?? 0 })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill('SIGTERM'))
