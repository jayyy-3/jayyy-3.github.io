import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const node = (file, args = [], deps = []) => ({ command: ['node', `scripts/${file}`, ...args], deps })
const tsx = (file, args = []) => ({ command: ['node', 'node_modules/tsx/dist/cli.mjs', `scripts/${file}`, ...args], deps: [] })
export const checks = {
  build: { command: ['npm', 'run', 'build'], deps: [] },
  lint: { command: ['npm', 'run', 'lint'], deps: [] },
  knip: { command: ['node', 'node_modules/knip/bin/knip.js', '--no-progress'], deps: [] },
  state: node('check-agent-state.mjs'),
  paths: node('check-doc-paths.mjs'),
  foundation: node('check-supabase-foundation-readiness.mjs'),
  harness: node('check-harness.mjs', ['--self-only'], ['state', 'paths', 'foundation']),
  classifier: node('check-verification.mjs'),
  'local-boundary': node('check-local-boundary.mjs'),
  // vitest: all *.test.ts behaviour suites (forms API, overlay, Stone workspace, QR, Projects, admin editors).
  unit: { command: ['node', 'node_modules/vitest/vitest.mjs', 'run'], deps: [] },
  routes: { command: ['bash', 'scripts/agent-smoke-core.sh'], deps: ['build'] },
  'forms-ui': node('check-contact-form-ui-source.mjs'),
  capabilities: node('check-capabilities-page-source.mjs'),
  // Public type-scale ratchet: arbitrary text-[Npx] may not grow past scripts/public-ui-tokens-baseline.json.
  'ui-tokens': node('check-public-ui-tokens.mjs'),
  'homepage-video': node('check-homepage-hero-video.mjs'),
  'product-images': node('check-product-model-image-mapping.mjs'),
  'stone-library': node('check-stone-library-detail-integrity.mjs'),
  'stone-adoption-snapshot': node('check-stone-adoption-snapshot.mjs'),
  qr: tsx('check-admin-image-qr.mjs', ['--source-only']),
  projects: tsx('check-admin-projects-aggregate.mjs', ['--source-only']),
  coverage: node('check-admin-crud-coverage.mjs', ['--self-only'], ['projects']),
  // Colleague quick guide: one screen, plain words, every bold control label present in the admin source.
  guide: node('check-admin-guide.mjs'),
  'public-readiness': node('check-public-supabase-readiness.mjs'),
  cloudflare: node('check-cloudflare-pages-readiness.mjs'),
  'deployment-readiness': node('check-deployment-readiness.mjs'),
  'media-plan': node('check-admin-media-role-boundary-live.mjs'),
  handoff: node('check-admin-handoff-readiness.mjs', ['--base-url', 'https://urblo.com.au', '--admin-email', 'info@urblo.com.au']),
  browser: node('check-admin-config-gate.mjs', [], ['build']),
}
const smoke = ['routes', 'unit', 'forms-ui', 'capabilities', 'ui-tokens', 'homepage-video', 'product-images', 'stone-library', 'stone-adoption-snapshot', 'qr', 'projects']
const admin = ['unit', 'coverage', 'guide', 'qr', 'projects', 'build', 'lint', 'foundation', 'media-plan', 'public-readiness', 'cloudflare', 'harness', 'handoff']
export const suites = {
  docs: ['state', 'paths', 'harness', 'classifier', 'guide'],
  tooling: ['harness', 'classifier', 'lint', 'knip'],
  smoke,
  admin,
  container: [...smoke, ...admin, 'classifier', 'local-boundary', 'deployment-readiness', 'knip'],
  runtime: [...smoke, ...admin, 'classifier', 'local-boundary', 'deployment-readiness', 'knip', 'browser'],
  migrations: [...smoke, ...admin, 'classifier', 'local-boundary', 'deployment-readiness', 'knip', 'browser'],
}
export function resolveChecks(suite) {
  if (!suites[suite]) throw new Error(`Unknown verification suite: ${suite}`)
  const ordered = [], visited = new Set(), visiting = new Set()
  function visit(id) {
    if (visited.has(id)) return
    if (visiting.has(id) || !checks[id]) throw new Error(`Invalid dependency: ${id}`)
    visiting.add(id)
    checks[id].deps.forEach(visit)
    visiting.delete(id); visited.add(id); ordered.push(id)
  }
  suites[suite].forEach(visit)
  return ordered
}
export function pathCategory(path) {
  if (/^scripts\/(?:container-gate|deploy|build|release)/.test(path)) return 'runtime'
  // Tests and their config never enter the deployed bundle (functions/ and public/ files always deploy).
  if (/^(?:tests\/|vitest\.config\.[cm]?[jt]s$|src\/.*\.test\.tsx?$)/.test(path)) return 'tooling'
  if (/^supabase\/migrations\//.test(path)) return 'migrations'
  // The colleague quick guide is bundled into the admin Help drawer, so it is a build input.
  if (path === 'docs/ADMIN_EDITOR_GUIDE.md') return 'runtime'
  if (/^(src\/|public\/|functions\/|supabase\/|\.github\/|Dockerfile|\.dockerignore$|package(?:-lock)?\.json$|(?:vite|tsconfig|tailwind|postcss|eslint|wrangler)[^/]*|index\.html$)/.test(path)) return 'runtime'
  if (/^(scripts\/|\.nvmrc$|\.node-version$)/.test(path)) return 'tooling'
  if (/^(docs\/|AGENTS\.md$|README\.md$|\.gitattributes$)/.test(path)) return 'docs'
  return 'runtime'
}
export function classify(paths) {
  const categories = paths.map(pathCategory)
  const suite = ['migrations', 'runtime', 'tooling', 'docs'].find(value => categories.includes(value)) ?? 'docs'
  // Changes to executable validation can affect release guarantees; run the complete source graph.
  return { category: suite, suite: suite === 'tooling' ? 'container' : suite, deploy: ['runtime', 'migrations'].includes(suite), paths }
}
export function parseNameStatus(value) {
  const fields = value.split('\0'); const paths = []
  for (let i = 0; i < fields.length && fields[i];) {
    const status = fields[i++]
    const count = /^[RC]/.test(status) ? 2 : 1
    for (let n = 0; n < count; n++) {
      if (!fields[i]) throw new Error('Malformed git name-status record')
      paths.push(fields[i++])
    }
  }
  return paths
}
export function changedPaths(base, cwd = process.cwd()) {
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8' })
  const reference = base || git(['merge-base', 'HEAD', 'origin/main']).trim()
  const committedAndWorking = parseNameStatus(git(['diff', '--name-status', '-z', '--find-renames', reference]))
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)
  return [...new Set([...committedAndWorking, ...untracked])].sort()
}
export function runtimeFingerprint(cwd = process.cwd()) {
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd, encoding: 'utf8' }).split('\0').filter(p => p && pathCategory(p) !== 'docs').sort()
  const hash = createHash('sha256')
  for (const path of paths) {
    hash.update(path + '\0')
    try { hash.update(readFileSync(`${cwd}/${path}`)) } catch { hash.update('<deleted>') }
    hash.update('\0')
  }
  return hash.digest('hex')
}
