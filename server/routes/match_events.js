import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

/**
 * POST /api/match-events
 * Tambah event gol / kartu pada laga
 */
router.post('/', async (req, res) => {
  try {
    const { match_id, team_id, player_id, event_type = 'goal', minute = 1, assist_player_id } = req.body

    if (!match_id || !team_id || !player_id) {
      return res.status(400).json({ error: 'match_id, team_id, dan player_id wajib diisi.' })
    }

    const id = generateUUID()
    await query(
      `INSERT INTO pcl_match_events (id, match_id, team_id, player_id, event_type, minute, assist_player_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, match_id, team_id, player_id, event_type, Number(minute), assist_player_id || null]
    )

    const [created] = await query('SELECT * FROM pcl_match_events WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/match-events/:id
 * Hapus event gol / kartu
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_match_events WHERE id = ?', [id])
    res.json({ success: true, message: 'Event pertandingan berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
