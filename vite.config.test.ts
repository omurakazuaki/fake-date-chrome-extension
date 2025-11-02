import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  root: 'test-page',
  build: {
    outDir: '../dist-test',
  },
  server: {
    host: '0.0.0.0',
    strictPort: false,
  },
})
