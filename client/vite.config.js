import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    proxy: {
      "/flights": {
        target: "http://node_server:5000",
        changeOrigin: true
      },
      "/hotels": {
        target: "http://node_server:5000",
         changeOrigin: true
      }
    }
  }
})