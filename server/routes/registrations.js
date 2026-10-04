import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

/**
 * GET /api/registrations
 * Ambil semua data pendaftaran tim
 */
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM pcl_team_registrations ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/registrations
 * Pendaftaran tim baru dari publik
 */
router.post('/', async (req, res) => {
  try {
    const { nama_tim, short_name, manager_name, kontak, email, catatan, status = 'pending' } = req.body

    if (!nama_tim || !short_name || !manager_name) {
      return res.status(400).json({ error: 'Nama tim, singkatan, dan manajer wajib diisi.' })
    }

    const id = generateUUID()
    await query(
      `INSERT INTO pcl_team_registrations (id, nama_tim, short_name, manager_name, kontak, email, catatan, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nama_tim.trim(), short_name.trim().toUpperCase(), manager_name.trim(), kontak || '', email || '', catatan || null, status]
    )

    const [created] = await query('SELECT * FROM pcl_team_registrations WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/registrations/:id/status
 * Update status pendaftaran (diterima, ditolak, pending)
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'diterima', 'ditolak'].includes(status)) {
      return res.status(400).json({ error: 'Status pendaftaran tidak valid.' })
    }

    await query('UPDATE pcl_team_registrations SET status = ? WHERE id = ?', [status, id])

    // Jika diterima, cek apakah tim sudah ada di pcl_teams, jika belum, bisa dimasukkan otomatis
    if (status === 'diterima') {
      const [reg] = await query('SELECT * FROM pcl_team_registrations WHERE id = ?', [id])
      if (reg) {
        const [existingTeam] = await query('SELECT id FROM pcl_teams WHERE name = ? OR short_name = ?', [reg.nama_tim, reg.short_name])
        if (!existingTeam) {
          // Ambil tournament aktif
          const [activeTourney] = await query("SELECT id FROM pcl_tournaments WHERE status != 'completed' ORDER BY created_at DESC LIMIT 1")
          const teamId = generateUUID()
          await query(
            `INSERT INTO pcl_teams (id, tournament_id, name, short_name, manager_name, rating)
             VALUES (?, ?, ?, ?, ?, 90)`,
            [teamId, activeTourney?.id || null, reg.nama_tim, reg.short_name, reg.manager_name]
          )
        }
      }
    }

    const [updated] = await query('SELECT * FROM pcl_team_registrations WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
