// Build-only mutation for proving the browser recovery assertion detects the old defect.
// This plugin is installed only by the guarded local-app runner with an explicit fault flag.
export function localArticleFault(fault) {
  if (!fault) return { name: 'urblo-no-local-fault' }
  if (fault !== 'validation-lock') throw new Error('Unknown local Article fault')
  let applied = false
  return {
    name: 'urblo-local-article-validation-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/pages/admin/articles/useArticleEditor.ts')) return null
      const anchor = 'const validation = validateArticleForm({ ...articleForm, status: nextStatus });'
      if (!code.includes(anchor)) throw new Error('Article validation mutation anchor is missing')
      applied = true
      return { code: code.replace(anchor, `savingArticleRef.current = true;\nsetIsSavingArticle(true);\n${anchor}`), map: null }
    },
    buildEnd(error) {
      if (!error && !applied) throw new Error('Article validation mutation was not applied')
    },
  }
}
