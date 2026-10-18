import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5175,
    allowedHosts: ['pcl.web.id', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/sitemap.xml': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/berita': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: (req) => {
          const userAgent = req.headers['user-agent'] || ''
          const isCrawler = /whatsapp|facebookexternalhit|twitterbot|telegrambot|slackbot|discordbot|linkedinbot|googlebot|bingbot/i.test(userAgent)
          // Jika bukan crawler bot, biarkan ditangani oleh frontend Vue SPA (Vite)
          if (!isCrawler) {
            return req.url
          }
          // Jika crawler bot (misal WhatsApp), proxy ke Express untuk dapatkan meta tag SSR
          return null
        }
      }
    }
  },
  test: {
    environment: 'node',
    globals: true
  }
})
