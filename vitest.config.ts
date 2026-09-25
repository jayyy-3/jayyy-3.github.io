import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Unit tests run in Node with no network: tests/setup/no-network.ts replaces
// fetch/WebSocket with guards, and each suite installs its own in-memory mocks.
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup/no-network.ts'],
    restoreMocks: true,
  },
}))
