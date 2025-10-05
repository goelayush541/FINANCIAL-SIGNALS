import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_API_URL || 'https://financial-signals.vercel.app/api',
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Important for Vercel
  publicDir: 'public',
  base: './'
})