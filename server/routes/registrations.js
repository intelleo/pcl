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

    // Jika diterima, sinkronkan klub dan skuad pemain ke pcl_teams & pcl_players
    if (status === 'diterima') {
      const [reg] = await query('SELECT * FROM pcl_team_registrations WHERE id = ?', [id])
      if (reg) {
        let catatanData = null
        try {
          catatanData = typeof reg.catatan === 'string' ? JSON.parse(reg.catatan) : reg.catatan
        } catch (e) {}

        const logoUrl = catatanData?.logo_url || null

        // Ambil tournament aktif (atau tournament terbaru)
        let [activeTourney] = await query("SELECT id FROM pcl_tournaments WHERE status != 'completed' ORDER BY created_at DESC LIMIT 1")
        if (!activeTourney) {
          const [latestTourney] = await query('SELECT id FROM pcl_tournaments ORDER BY created_at DESC LIMIT 1')
          activeTourney = latestTourney
        }
        const tourneyId = activeTourney?.id || null

        // Cek apakah tim sudah ada di tournament ini
        const [existingTeam] = await query(
          'SELECT id FROM pcl_teams WHERE (name = ? OR short_name = ?) AND (tournament_id = ? OR (? IS NULL AND tournament_id IS NULL))',
          [reg.nama_tim, reg.short_name, tourneyId, tourneyId]
        )

        let teamId = existingTeam?.id
        if (!teamId) {
          teamId = generateUUID()
          await query(
            `INSERT INTO pcl_teams (id, tournament_id, name, short_name, logo_url, manager_name, rating)
             VALUES (?, ?, ?, ?, ?, ?, 90)`,
            [teamId, tourneyId, reg.nama_tim.trim(), reg.short_name.trim().toUpperCase(), logoUrl, reg.manager_name.trim()]
          )
        } else {
          await query(
            'UPDATE pcl_teams SET logo_url = COALESCE(?, logo_url), manager_name = COALESCE(?, manager_name) WHERE id = ?',
            [logoUrl, reg.manager_name.trim(), teamId]
          )
        }

        // Sinkronkan skuad pemain jika tim belum memiliki pemain di DB
        const existingPlayers = await query('SELECT id FROM pcl_players WHERE team_id = ?', [teamId])
        if (existingPlayers.length === 0 && catatanData) {
          const validPositions = ['GK', 'DF', 'CB', 'MF', 'CM', 'WF', 'FW', 'ST']
          let noPunggung = 1

          // 1. Masukkan Kapten sebagai pemain #1
          const kapten = catatanData.kapten
          const namaKapten = kapten?.nickname || reg.manager_name || 'Kapten'
          const roleKapten = validPositions.includes(kapten?.role?.toUpperCase()) ? kapten.role.toUpperCase() : 'CM'
          const pIdKapten = generateUUID()

          await query(
            `INSERT INTO pcl_players (id, team_id, name, squad_number, position)
             VALUES (?, ?, ?, ?, ?)`,
            [pIdKapten, teamId, namaKapten.trim(), noPunggung++, roleKapten]
          )

          // 2. Masukkan Anggota Skuad
          if (Array.isArray(catatanData.anggota)) {
            for (const a of catatanData.anggota) {
              const namaAnggota = a.nickname || a.name || a.game_id
              if (namaAnggota && String(namaAnggota).trim()) {
                const roleAnggota = validPositions.includes(a.role?.toUpperCase()) ? a.role.toUpperCase() : 'CM'
                const pId = generateUUID()
                await query(
                  `INSERT INTO pcl_players (id, team_id, name, squad_number, position)
                   VALUES (?, ?, ?, ?, ?)`,
                  [pId, teamId, String(namaAnggota).trim(), noPunggung++, roleAnggota]
                )
              }
            }
          }
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
