import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

/**
 * GET /api/tournaments
 * Ambil semua daftar turnamen / season
 */
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, name, season, status, created_at, updated_at FROM pcl_tournaments ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/tournaments
 * Buat season / turnamen baru
 */
router.post('/', async (req, res) => {
  try {
    const { name, season, status = 'knockout' } = req.body
    if (!name || !season) {
      return res.status(400).json({ error: 'Nama turnamen dan label season wajib diisi.' })
    }

    const id = generateUUID()
    await query(
      'INSERT INTO pcl_tournaments (id, name, season, status) VALUES (?, ?, ?, ?)',
      [id, name.trim(), season.trim(), status]
    )

    const [created] = await query('SELECT * FROM pcl_tournaments WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/tournaments/:id
 * Perbarui status season
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, season, status } = req.body

    const updates = []
    const params = []

    if (name) { updates.push('name = ?'); params.push(name.trim()) }
    if (season) { updates.push('season = ?'); params.push(season.trim()) }
    if (status) { updates.push('status = ?'); params.push(status) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diperbarui.' })
    }

    params.push(id)
    await query(`UPDATE pcl_tournaments SET ${updates.join(', ')} WHERE id = ?`, params)

    const [updated] = await query('SELECT * FROM pcl_tournaments WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/tournaments/draw-groups
 * Terapkan pembagian grup & generate jadwal laga Round Robin babak grup
 */
router.post('/draw-groups', async (req, res) => {
  try {
    const { pembagianGrup = {}, customTournamentId = null, tanggalMulai = null, jamMulai = '19:00', jedaMenit = 15 } = req.body
    let tournamentId = customTournamentId

    if (!tournamentId) {
      const [tur] = await query('SELECT id FROM pcl_tournaments ORDER BY created_at DESC LIMIT 1')
      if (tur?.id) {
        tournamentId = tur.id
      } else {
        tournamentId = generateUUID()
        await query(
          'INSERT INTO pcl_tournaments (id, name, season, status) VALUES (?, ?, ?, ?)',
          [tournamentId, 'Peak Champions League 2026', '2026', 'group_stage']
        )
      }
    }

    // 1. Update status turnamen ke group_stage
    await query("UPDATE pcl_tournaments SET status = 'group_stage' WHERE id = ?", [tournamentId])

    // 2. Bersihkan data grup lama khusus turnamen/season ini:
    await query("DELETE FROM pcl_matches WHERE stage = 'group' AND status != 'finished' AND (tournament_id = ? OR tournament_id IS NULL)", [tournamentId])
    await query(
      "DELETE FROM pcl_group_standings WHERE group_id IN (SELECT id FROM pcl_tournament_groups WHERE tournament_id = ?)",
      [tournamentId]
    )
    await query("DELETE FROM pcl_tournament_groups WHERE tournament_id = ?", [tournamentId])
    // Reset group_name di tim turnamen ini agar bersih
    await query("UPDATE pcl_teams SET group_name = NULL WHERE tournament_id = ? OR tournament_id IS NULL", [tournamentId])

    const createdMatches = []
    const fixturesByMd = { 1: [], 2: [], 3: [] }
    const genericFixtures = []

    // 3. Iterasi tiap grup: buat grup, klasemen awal, dan kumpulkan fixture
    const groupNames = Object.keys(pembagianGrup)
    for (const gName of groupNames) {
      const teams = pembagianGrup[gName] || []
      if (teams.length === 0) continue

      // Buat grup baru di pcl_tournament_groups
      const groupId = generateUUID()
      await query(
        'INSERT INTO pcl_tournament_groups (id, tournament_id, name) VALUES (?, ?, ?)',
        [groupId, tournamentId, gName]
      )

      // Update group_name di pcl_teams & buat klasemen awal
      for (const t of teams) {
        if (t.id) {
          await query('UPDATE `pcl_teams` SET `group_name` = ? WHERE `id` = ?', [gName, t.id])
          const stdId = generateUUID()
          await query(
            'INSERT INTO `pcl_group_standings` (`id`, `group_id`, `team_id`, `played`, `won`, `drawn`, `lost`, `goals_for`, `goals_against`, `goal_difference`, `points`, `rank`) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0)',
            [stdId, groupId, t.id]
          )
        }
      }

      // Kumpulkan round-robin fixture jika ada 4 tim
      if (teams.length === 4) {
        // Matchday 1
        fixturesByMd[1].push({ groupId, md: 1, slot: `${gName} - MD 1`, home: teams[0], away: teams[1] })
        fixturesByMd[1].push({ groupId, md: 1, slot: `${gName} - MD 1`, home: teams[2], away: teams[3] })
        // Matchday 2
        fixturesByMd[2].push({ groupId, md: 2, slot: `${gName} - MD 2`, home: teams[0], away: teams[2] })
        fixturesByMd[2].push({ groupId, md: 2, slot: `${gName} - MD 2`, home: teams[1], away: teams[3] })
        // Matchday 3
        fixturesByMd[3].push({ groupId, md: 3, slot: `${gName} - MD 3`, home: teams[0], away: teams[3] })
        fixturesByMd[3].push({ groupId, md: 3, slot: `${gName} - MD 3`, home: teams[1], away: teams[2] })
      } else if (teams.length >= 2) {
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            genericFixtures.push({
              groupId,
              md: 1,
              slot: `${gName} - Match`,
              home: teams[i],
              away: teams[j]
            })
          }
        }
      }
    }

    // 4. Jadwalkan pertandingan serentak per Matchday dengan jeda waktu antar Matchday
    const allMatchesToSchedule = [
      ...fixturesByMd[1],
      ...fixturesByMd[2],
      ...fixturesByMd[3],
      ...genericFixtures
    ]

    let baseTime = new Date()
    if (tanggalMulai) {
      const [y, m, d] = tanggalMulai.split('-').map(Number)
      baseTime = new Date(y, m - 1, d)
    } else {
      baseTime.setDate(baseTime.getDate() + 1)
    }

    let startHour = 19
    let startMin = 0
    if (jamMulai) {
      const [h, min] = jamMulai.split(':').map(Number)
      if (!isNaN(h)) startHour = h
      if (!isNaN(min)) startMin = min
    }
    baseTime.setHours(startHour, startMin, 0, 0)

    const intervalMinutes = Number(jedaMenit) > 0 ? Number(jedaMenit) : 15
    const pad = (n) => String(n).padStart(2, '0')

    for (let idx = 0; idx < allMatchesToSchedule.length; idx++) {
      const fix = allMatchesToSchedule[idx]
      const mdIndex = (fix.md && fix.md >= 1) ? (fix.md - 1) : 0
      // Semua grup pada Matchday yang sama kick-off bersamaan di jam yang sama
      const matchDate = new Date(baseTime.getTime() + (mdIndex * intervalMinutes * 60 * 1000))
      const tglStr = `${matchDate.getFullYear()}-${pad(matchDate.getMonth() + 1)}-${pad(matchDate.getDate())} ${pad(matchDate.getHours())}:${pad(matchDate.getMinutes())}:${pad(matchDate.getSeconds())}`
      const mId = generateUUID()

      await query(
        `INSERT INTO \`pcl_matches\`
         (\`id\`, \`tournament_id\`, \`stage\`, \`group_id\`, \`matchday\`, \`knockout_bracket_slot\`, \`home_team_id\`, \`away_team_id\`, \`home_score\`, \`away_score\`, \`status\`, \`scheduled_at\`)
         VALUES (?, ?, 'group', ?, ?, ?, ?, ?, 0, 0, 'scheduled', ?)`,
        [
          mId,
          tournamentId,
          fix.groupId,
          fix.md,
          fix.slot,
          fix.home?.id || null,
          fix.away?.id || null,
          tglStr
        ]
      )
      createdMatches.push(mId)
    }

    res.json({
      success: true,
      message: 'Drawing grup dan jadwal pertandingan babak grup berhasil dibuat!',
      totalMatches: createdMatches.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/tournaments/reset-drawing
 * Hapus seluruh hasil drawing: laga grup, laga knockout, event laga, klasemen, grup, & reset status tim
 */
router.post('/reset-drawing', async (req, res) => {
  try {
    const { customTournamentId = null } = req.body
    let tournamentId = customTournamentId

    if (!tournamentId) {
      const [tur] = await query('SELECT id FROM pcl_tournaments ORDER BY created_at DESC LIMIT 1')
      tournamentId = tur?.id || null
    }

    // 1. Hapus event pertandingan khusus season ini
    if (tournamentId) {
      await query(
        "DELETE FROM pcl_match_events WHERE match_id IN (SELECT id FROM pcl_matches WHERE tournament_id = ?)",
        [tournamentId]
      )
      await query('DELETE FROM pcl_matches WHERE tournament_id = ?', [tournamentId])
      await query(
        "DELETE FROM pcl_group_standings WHERE group_id IN (SELECT id FROM pcl_tournament_groups WHERE tournament_id = ?)",
        [tournamentId]
      )
      await query('DELETE FROM pcl_tournament_groups WHERE tournament_id = ?', [tournamentId])
      await query('UPDATE pcl_teams SET group_name = NULL WHERE tournament_id = ? OR tournament_id IS NULL', [tournamentId])
      await query("UPDATE pcl_tournaments SET status = 'draft' WHERE id = ?", [tournamentId])
    } else {
      await query('DELETE FROM pcl_match_events')
      await query('DELETE FROM pcl_matches')
      await query('DELETE FROM pcl_group_standings')
      await query('DELETE FROM pcl_tournament_groups')
      await query('UPDATE pcl_teams SET group_name = NULL')
    }

    res.json({
      success: true,
      message: 'Semua hasil drawing dan jadwal pertandingan berhasil direset!'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/tournaments/:id
 * Hapus season
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_tournaments WHERE id = ?', [id])
    res.json({ success: true, message: 'Turnamen berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
