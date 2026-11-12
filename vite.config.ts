import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(() => {
  // Хоства се на собствен домейн askbible.online (GitHub Pages), от корена → base "/".
  // (tihstih.eu остава като вторичен домейн — виж README.)
  const base = '/'

  return {
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg', 'logo-emblem.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'Pregúntale a la Biblia',
        short_name: 'Pregúntale a la Biblia',
        description: 'Haz una pregunta y recibe el versículo bíblico que mejor le habla, con una breve reflexión.',
        lang: 'es',
        dir: 'ltr',
        categories: ['books', 'lifestyle', 'education'],
        theme_color: '#14100c',
        background_color: '#14100c',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Библейското аудио и пълният библейски текст (66 файла, ~11MB) не се
        // прекешират предварително — само при поискване.
        globIgnores: ['**/audio-bible/**', '**/bible/**'],
        // Аудио файловете могат да са големи — кешираме ги при поискване.
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname.includes('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tihstih-audio',
              expiration: { maxEntries: 60 },
              rangeRequests: true,
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname.includes('/audio-bible/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-audio',
              expiration: { maxEntries: 200 },
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname.includes('/bible/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-text',
              expiration: { maxEntries: 70 },
            },
          },
        ],
      },
    }),
  ],
  }
})
