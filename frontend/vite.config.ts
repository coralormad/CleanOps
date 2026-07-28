import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CleanOps',
        short_name: 'CleanOps',
        description: 'Fichaje y evidencia para equipos de limpieza',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
      },
    }),
  ],
})