import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    // Explicitly disable the SSR build
    ssr: false,
  },
}) 