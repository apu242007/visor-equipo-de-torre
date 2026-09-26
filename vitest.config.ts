import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Solo src/**: tests/*.mjs pertenecen al visor legacy y corren con `node --test`.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
})
