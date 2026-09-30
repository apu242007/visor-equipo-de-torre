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
    chunkSizeWarningLimit: 1500, // el chunk de three (~1,5 MB) es irreducible
    // three + R3F en su propio chunk: cambian poco entre deploys y así el navegador los reutiliza de caché.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'three', test: /node_modules[\/](three|@react-three)[\/]/ }],
        },
      },
    },
  },
})
