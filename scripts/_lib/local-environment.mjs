import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { resolve } from 'node:path'

export const LOCAL_PROJECT = 'urblo-isolated-v1'
export const LOCAL_API = 'http://127.0.0.1:57321'
export const LOCAL_APP = 'http://127.0.0.1:8788'
export const LOCAL_PASSWORD = 'Urblo-local-only-2026!'
export const LOCAL_ACCOUNTS = {
  owner: 'owner@urblo.example.test',
  editor: 'editor@urblo.example.test',
  outsider: 'outsider@urblo.example.test',
}
export function assertLocalOrigin(value, expected = LOCAL_API) {
  let url
  try { url = new URL(value) } catch { throw new Error('Local target must be the exact loopback origin') }
  if (url.origin !== expected || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`Refusing non-local target; expected ${expected}`)
  }
  return url.origin
}
export function cleanLocalEnv(source = process.env) {
  const keys = ['PATH', 'HOME', 'USER', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot', 'DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_CONFIG', 'XDG_RUNTIME_DIR']
  const result = Object.fromEntries(keys.filter(key => source[key]).map(key => [key, source[key]]))
  if (result.DOCKER_HOST && !result.DOCKER_HOST.startsWith('unix://')) throw new Error('Local stack requires a local Docker socket')
  return { ...result, CI: 'true', NO_COLOR: '1', SUPABASE_TELEMETRY_DISABLED: 'true', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' }
}
export function assertLocalConfig(root = process.cwd()) {
  const text = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8')
  if (!new RegExp(`^project_id = "${LOCAL_PROJECT}"$`, 'm').test(text)) throw new Error('Unexpected local project identity')
  for (const [section, port] of [['api', 57321], ['db', 57322]]) {
    const part = text.split(`[${section}]`)[1]?.split('\n[')[0] ?? ''
    if (!new RegExp(`^port = ${port}$`, 'm').test(part)) throw new Error(`Unexpected ${section} port`)
  }
  const settings = text.split('\n').filter(line => !line.trim().startsWith('#')).join('\n')
  if (/env\(|\[auth\.email\.smtp\]|\[auth\.external\.|\[experimental\]/.test(settings)) throw new Error('Local config must not import credentials or external services')
  for (const match of settings.matchAll(/https?:\/\/[^\s"']+/g)) {
    const url = new URL(match[0]); if (url.origin !== LOCAL_APP || url.username || url.password) throw new Error('Local config contains a non-local URL')
  }
  if (existsSync(resolve(root, 'supabase/.temp/project-ref'))) throw new Error('Local test project must not be linked to a cloud project')
  const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  if (packageJson.devDependencies.supabase !== '2.117.0') throw new Error('Unexpected Supabase CLI version')
}
export function docker(args) {
  return execFileSync('docker', args, { env: cleanLocalEnv(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 })
}
export function assertLocalDocker() {
  const endpoint = JSON.parse(docker(['context', 'inspect', '--format', '{{json .Endpoints.docker.Host}}']).trim())
  if (!endpoint.startsWith('unix://')) throw new Error('Refusing remote Docker context')
}
export function assertLocalContainer() {
  assertLocalConfig(); assertLocalDocker()
  const inspect = JSON.parse(docker(['inspect', '--type', 'container', `supabase_db_${LOCAL_PROJECT}`]))[0]
  if (realpathSync(inspect.Config.Labels?.['com.supabase.cli.workdir'] ?? '/') !== realpathSync(process.cwd())) throw new Error('Local container belongs to a different checkout; stop it there first')
  if (inspect.Config.Labels?.['com.supabase.cli.project'] !== LOCAL_PROJECT) throw new Error('Local database container identity mismatch')
  if (!inspect.State.Running) throw new Error('Local database is stopped')
  const port = inspect.NetworkSettings.Ports?.['5432/tcp']
  if (!port?.some(value => value.HostPort === '57322')) throw new Error('Local database port mismatch')
}
export function supabaseCommand(args) {
  assertLocalConfig(); assertLocalDocker()
  if (args[0] === 'start') {
    let existing
    try { existing = JSON.parse(docker(['inspect', '--type', 'container', `supabase_db_${LOCAL_PROJECT}`]))[0] } catch (error) { if (!String(error.stderr).includes('No such')) throw error }
    if (existing && realpathSync(existing.Config.Labels?.['com.supabase.cli.workdir'] ?? '/') !== realpathSync(process.cwd())) throw new Error('Local container belongs to a different checkout; refusing startup')
  }
  return execFileSync(process.execPath, ['node_modules/supabase/dist/supabase.js', ...args], {
    env: cleanLocalEnv(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024,
  })
}
export function readLocalCredentials() {
  assertLocalContainer()
  const raw = JSON.parse(supabaseCommand(['status', '-o', 'json']))
  const apiUrl = raw.API_URL ?? raw.api?.url
  assertLocalOrigin(apiUrl)
  const anonKey = raw.ANON_KEY ?? raw.auth?.anon_key
  const serviceKey = raw.SERVICE_ROLE_KEY ?? raw.auth?.service_role_key
  if (!anonKey || !serviceKey) throw new Error('Local CLI did not return required local API credentials')
  return { apiUrl, anonKey, serviceKey }
}
export async function localFetch(url, options = {}) {
  const target = new URL(url)
  assertLocalOrigin(target.origin)
  return fetch(target, { ...options, redirect: 'error', signal: options.signal ?? AbortSignal.timeout(15000) })
}
