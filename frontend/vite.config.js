// Polyfill for Node 18/20 on Windows: crypto.hash() is not available (added in Node 21)
import { createHash } from 'node:crypto'
if (typeof globalThis.crypto?.hash !== 'function') {
  globalThis.crypto = { ...globalThis.crypto, hash: (alg) => createHash(alg) }
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
