import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co'

/**
 * Emits the public Supabase target the browser bundle was built with, so the edge SEO
 * middleware (functions/_lib/edge-seo.js) reads Published rows from the same place with
 * the same browser-safe key. The middleware reads it through env.ASSETS and answers 404 to
 * direct requests. A secret or service-role key fails the build instead of shipping.
 */
function edgePublicContentConfig(): Plugin {
  let env: Record<string, string> = {}
  return {
    name: 'urblo-edge-public-content-config',
    apply: 'build',
    configResolved(config) {
      env = loadEnv(config.mode, config.envDir || process.cwd(), 'VITE_')
    },
    generateBundle() {
      const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''
      if (publicKey && !isBrowserSafeKey(publicKey)) {
        throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY/VITE_SUPABASE_ANON_KEY is not a browser-safe public key.')
      }
      this.emitFile({
        type: 'asset',
        fileName: 'seo-edge-config.json',
        source: `${JSON.stringify({
          supabaseUrl: (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, ''),
          publicKey: publicKey || null,
        })}\n`,
      })
    },
  }
}

function isBrowserSafeKey(key: string) {
  if (key.startsWith('sb_secret_')) return false
  if (key.startsWith('sb_publishable_')) return true
  const parts = key.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    return payload?.role === 'anon'
  } catch {
    return false
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), edgePublicContentConfig()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@supabase/')) {
            return 'supabase'
          }
        },
      },
    },
  },
})
