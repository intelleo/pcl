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
import teamAuthRoutes from './routes/team_auth.js'
import recapRoutes from './routes/recaps.js'
import bookingKeyRoutes from './routes/booking_keys.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Static file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
app.use('/api/team-auth', teamAuthRoutes)
app.use('/api/recaps', recapRoutes)
app.use('/api/booking-keys', bookingKeyRoutes)

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

    // Gunakan host publik https://pcl.web.id untuk crawler media sosial
    const baseUrl = 'https://pcl.web.id'
    const defaultBanner = `${baseUrl}/img/og-banner.jpg`

    let img = news.gambar_url || defaultBanner
    if (img && img.startsWith('/')) {
      img = `${baseUrl}${img}`
    }
    const fullUrl = `${baseUrl}/berita/${id}`

    // Deteksi tipe mime gambar untuk tag og:image:type
    let imgType = 'image/jpeg'
    if (img.endsWith('.png')) imgType = 'image/png'
    else if (img.endsWith('.webp')) imgType = 'image/webp'

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>${title} - PCL 2026</title>
  <meta name="description" content="${desc}">

  <!-- Open Graph / WhatsApp / Facebook Preview -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Peak Champions League">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:secure_url" content="${img}">
  <meta property="og:image:type" content="${imgType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

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

// Dinamis XML Sitemap untuk Google & Search Engine Indexing
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { query } = await import('./config/db.js')
    const daftarBerita = await query('SELECT id, created_at, diterbitkan_pada FROM pcl_news ORDER BY diterbitkan_pada DESC')
    const daftarTim = await query('SELECT id FROM pcl_teams')

    const baseUrl = 'https://pcl.web.id'
    const nowIso = new Date().toISOString().split('T')[0]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

    // Halaman Statis Utama
    const halamanStatis = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/turnamen', priority: '0.9', changefreq: 'daily' },
      { loc: '/jadwal', priority: '0.9', changefreq: 'daily' },
      { loc: '/statistik', priority: '0.8', changefreq: 'daily' },
      { loc: '/berita', priority: '0.8', changefreq: 'daily' },
      { loc: '/riwayat-juara', priority: '0.7', changefreq: 'weekly' },
      { loc: '/pendaftaran', priority: '0.7', changefreq: 'weekly' }
    ]

    for (const h of halamanStatis) {
      xml += `  <url>\n`
      xml += `    <loc>${baseUrl}${h.loc}</loc>\n`
      xml += `    <lastmod>${nowIso}</lastmod>\n`
      xml += `    <changefreq>${h.changefreq}</changefreq>\n`
      xml += `    <priority>${h.priority}</priority>\n`
      xml += `  </url>\n`
    }

    // Halaman Berita Dinamis
    for (const b of (daftarBerita || [])) {
      const lastMod = (b.diterbitkan_pada || b.created_at || nowIso).toString().slice(0, 10)
      xml += `  <url>\n`
      xml += `    <loc>${baseUrl}/berita/${b.id}</loc>\n`
      xml += `    <lastmod>${lastMod}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.7</priority>\n`
      xml += `  </url>\n`
    }

    // Halaman Detail Tim Dinamis
    for (const t of (daftarTim || [])) {
      xml += `  <url>\n`
      xml += `    <loc>${baseUrl}/tim/${t.id}</loc>\n`
      xml += `    <lastmod>${nowIso}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    xml += `</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (err) {
    console.error('Gagal membuat sitemap.xml:', err)
    res.status(500).send('Error generating sitemap')
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

// Auto-migrate: pastikan struktur tabel mutakhir
async function jalankanMigrasi() {
  try {
    const { query } = await import('./config/db.js')

    // 1. Kolom catatan pendaftaran -> LONGTEXT
    const [colCatatan] = await query("SHOW COLUMNS FROM pcl_team_registrations WHERE Field = 'catatan'")
    if (colCatatan && colCatatan.Type.toLowerCase() !== 'longtext') {
      await query('ALTER TABLE pcl_team_registrations MODIFY COLUMN catatan LONGTEXT NULL')
      console.log('✅ Migrasi: kolom catatan diubah ke LONGTEXT')
    }

    // 2. Kolom contact di pcl_teams
    const [colContact] = await query("SHOW COLUMNS FROM pcl_teams WHERE Field = 'contact'")
    if (!colContact) {
      await query('ALTER TABLE pcl_teams ADD COLUMN contact VARCHAR(50) NULL AFTER manager_name')
      console.log('✅ Migrasi: kolom contact ditambahkan ke pcl_teams')
    }

    // 3. Sinkronkan nomor kontak dari pcl_team_registrations jika contact masih null
    await query(`
      UPDATE pcl_teams t
      JOIN (
        SELECT nama_tim, MAX(kontak) AS kontak
        FROM pcl_team_registrations
        WHERE kontak IS NOT NULL AND kontak != ''
        GROUP BY nama_tim
      ) r ON t.name = r.nama_tim
      SET t.contact = r.kontak
      WHERE t.contact IS NULL OR t.contact = ''
    `)
  } catch (e) {
    console.warn('⚠️  Migrasi database dilewati:', e.message)
  }
}

// Jalankan Server jika dipanggil langsung
if (process.env.NODE_ENV !== 'test') {
  jalankanMigrasi().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 PCL Express API Server berjalan di http://localhost:${PORT}`)
      console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`)
    })
  })
}

export default app
