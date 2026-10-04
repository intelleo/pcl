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
