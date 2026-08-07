import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // HTTPS is opt-in (VITE_ENABLE_HTTPS=true) — needed for phone/LAN camera
  // access, but it makes the frontend a different "site" than a plain-HTTP
  // backend (schemeful same-site), which silently drops SameSite=Lax auth
  // cookies on cross-site fetches. Defaulting to HTTP keeps auth working
  // for the common case of a local HTTP backend.
  const enableHttps = env.VITE_ENABLE_HTTPS === 'true'

  return {
  plugins: [react(), ...(enableHttps ? [basicSsl()] : [])],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    hmr: {
      port: 5173
    },
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    target: ['es2020', 'chrome87', 'firefox78', 'safari14', 'edge88'],
  },
  define: {
    'process.env': {},
  },
  }
})