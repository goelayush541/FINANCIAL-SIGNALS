import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_API_URL || 'https://financial-signals.vercel.app/api',
    proxy: {
      '/api': {
        target: 'https://financial-signals.vercel.app',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  // Important for Vercel
  define: {
    'process.env': {}
  }
})