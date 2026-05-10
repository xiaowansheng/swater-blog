import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  esbuild: mode === 'production'
    ? {
        drop: ['console', 'debugger']
      }
    : undefined,
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8888',
        ws: true
      }
    }
  }
}))

