import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El visor V2 legacy se embebe desde public/legacy/ (iframe, generado por scripts/build-legacy.mjs);
// reference/ y legacy-ext/ no forman parte de este build.
// BASE_PATH lo define el workflow de GitHub Pages (/<repo>/); en local queda '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
})
