import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(() => {
  // Хоства се на собствен домейн tihstih.eu (GitHub Pages), от корена → base "/".
  const base = '/'

  return {
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg', 'robots.txt'],
      manifest: {
        name: 'Тих Стих',
        short_name: 'Тих Стих',
        description: 'Записани стихове — слушай, чети и споделяй.',
        lang: 'bg',
        theme_color: '#14100c',
        background_color: '#14100c',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'logo.svg',
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
            urlPattern: ({ url }) => url.pathname.includes('/audio/'),
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
  }
})
