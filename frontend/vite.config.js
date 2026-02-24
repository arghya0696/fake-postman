import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Output the build directly into Spring Boot's static folder
    outDir: '../src/main/resources/static',
    emptyOutDir: true, // Clears the directory before building
  },
  server: {
    // Proxy API calls to Spring Boot during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})