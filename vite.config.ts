import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const r = (...segments: string[]) => path.resolve(import.meta.dirname, ...segments)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@components': r('src/components'),
      '@styles': r('src/styles'),
      '@services': r('src/services'),
      '@editor': r('src/components/Objects/Editor'),
      '@hooks': r('src/components/Hooks'),
      '@lib': r('src/lib'),
      '@ee': r('src/ee'),
      '@': r('src'),
      '@app': r('src/app'),
      app: r('src/app'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 4096,
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
