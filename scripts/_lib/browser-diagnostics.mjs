const sensitive = /password|authorization|cookie|secret|token|(?:api|service|anon|publishable)[_-]?key/i
export function sanitizeDiagnostic(value, depth = 0) {
  if (depth > 5) return '[depth limited]'
  if (typeof value === 'string') return value.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted JWT]').slice(0, 3000)
  if (Array.isArray(value)) return value.slice(0, 20).map(item => sanitizeDiagnostic(item, depth + 1))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 30).map(([key, item]) => [key, sensitive.test(key) ? '[redacted]' : sanitizeDiagnostic(item, depth + 1)]))
  return value
}
export function captureBrowserDiagnostics(context, report) {
  const pending = []
  report.console = []
  context.on('page', page => {
    page.on('pageerror', error => report.errors.push(sanitizeDiagnostic(error.stack ?? error.message)))
    page.on('console', message => {
      if (!['error', 'warning'].includes(message.type())) return
      pending.push((async () => {
        const values = await Promise.all(message.args().map(async handle => {
          try { return sanitizeDiagnostic(await handle.jsonValue()) } catch { return '[unavailable argument]' }
        }))
        const location = message.location()
        let path = ''
        try { path = new URL(location.url).pathname } catch { /* console without source URL */ }
        report.console.push({ type: message.type(), text: sanitizeDiagnostic(message.text()), values, path, line: location.lineNumber })
      })())
    })
  })
  return async () => { await Promise.all(pending) }
}
