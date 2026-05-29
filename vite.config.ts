import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Тих Стих',
        short_name: 'Тих Стих',
        description: 'Записани стихове — слушай, чети и споделяй.',
        lang: 'bg',
        theme_color: '#edebe5',
        background_color: '#edebe5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Аудио файловете могат да са големи — кешираме ги при поискване.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tihstih-audio',
              expiration: { maxEntries: 60 },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
})
