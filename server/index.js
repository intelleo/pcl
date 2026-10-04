import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import Routes
import authRoutes from './routes/auth.js'
import tournamentRoutes from './routes/tournaments.js'
import teamRoutes from './routes/teams.js'
import playerRoutes from './routes/players.js'
import matchRoutes from './routes/matches.js'
import matchEventRoutes from './routes/match_events.js'
import knockoutRoutes from './routes/knockout.js'
import standingRoutes from './routes/standings.js'
import statisticsRoutes from './routes/statistics.js'
import registrationRoutes from './routes/registrations.js'
import championRoutes from './routes/champions.js'
import newsRoutes from './routes/news.js'
import settingRoutes from './routes/settings.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Peak Champions League (PCL) API Backend Aktif',
    database: 'MySQL 8.x',
    timestamp: new Date().toISOString()
  })
})

// Mount API Endpoints
app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/match-events', matchEventRoutes)
app.use('/api/knockout', knockoutRoutes)
app.use('/api/standings', standingRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/registrations', registrationRoutes)
app.use('/api/champions', championRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/settings', settingRoutes)

// Open Graph SSR Pre-renderer untuk Bot & Social Media Crawlers (WhatsApp, Telegram, Twitter, Facebook)
app.get('/berita/:id', async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || ''
  const isCrawler = /whatsapp|facebookexternalhit|twitterbot|telegrambot|slackbot|discordbot|linkedinbot|googlebot|bingbot/i.test(userAgent)

  // Hanya proses jika request datang dari crawler preview social media
  if (!isCrawler) {
    return next()
  }

  try {
    const { id } = req.params
    const { query } = await import('./config/db.js')
    const [news] = await query('SELECT * FROM pcl_news WHERE id = ?', [id])
    if (!news) return next()

    const title = news.judul || 'Peak Champions League (PCL)'
    const desc = news.ringkasan || 'Ulasan dan kabar turnamen Peak Champions League.'
    const defaultBanner = `${req.protocol}://${req.get('host')}/img/hero-banner.webp`
    let img = news.gambar_url || defaultBanner
    if (img && img.startsWith('/')) {
      img = `${req.protocol}://${req.get('host')}${img}`
    }
    const fullUrl = `${req.protocol}://${req.get('host')}/berita/${id}`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} - PCL 2026</title>
  <meta name="description" content="${desc}">

  <!-- Open Graph / WhatsApp / Facebook Preview -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Peak Champions League">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:secure_url" content="${img}">
  <meta property="og:url" content="${fullUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${img}">

  <meta http-equiv="refresh" content="0;url=/berita/${id}">
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <img src="${img}" alt="${title}">
</body>
</html>`)
  } catch {
    next()
  }
})

// 404 Handler untuk API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Endpoint API "${req.originalUrl}" tidak ditemukan.` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err)
  res.status(500).json({ error: err.message || 'Terjadi kesalahan internal pada server backend.' })
})

// Jalankan Server jika dipanggil langsung
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 PCL Express API Server berjalan di http://localhost:${PORT}`)
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`)
  })
}

export default app
