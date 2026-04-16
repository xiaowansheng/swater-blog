import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const stripAppConsolePlugin = (enabled: boolean) => ({
  name: 'strip-app-console',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!enabled || !id.includes('/src/')) {
      return null
    }

    return {
      code: code.replace(/\bconsole\.(log|debug|info|warn|error)\b/g, '(() => {})'),
      map: null
    }
  }
})

export default defineConfig(({ mode }) => ({
  plugins: [stripAppConsolePlugin(mode === 'production'), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  esbuild: mode === 'production'
    ? {
        drop: ['debugger']
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

