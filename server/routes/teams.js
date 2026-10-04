import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

/**
 * GET /api/teams
 * Ambil semua tim dengan filter optional tournament_id / group_name
 */
router.get('/', async (req, res) => {
  try {
    const { tournament_id, group_name } = req.query
    let sql = `
      SELECT t.id, t.tournament_id, t.name, t.short_name, t.logo_url,
             t.manager_name, t.group_name, t.rating, t.created_at,
             COUNT(p.id) AS total_pemain
      FROM pcl_teams t
      LEFT JOIN pcl_players p ON t.id = p.team_id
    `
    const conditions = []
    const params = []

    if (tournament_id) {
      conditions.push('t.tournament_id = ?')
      params.push(tournament_id)
    }
    if (group_name) {
      conditions.push('t.group_name = ?')
      params.push(group_name)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' GROUP BY t.id ORDER BY t.name ASC'

    const rows = await query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/teams/:id
 * Ambil detail tim beserta daftar pemainnya
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [team] = await query('SELECT * FROM pcl_teams WHERE id = ?', [id])

    if (!team) {
      return res.status(404).json({ error: 'Tim tidak ditemukan.' })
    }

    const players = await query(
      'SELECT id, name, squad_number, position, avatar_url FROM pcl_players WHERE team_id = ? ORDER BY squad_number ASC',
      [id]
    )

    res.json({ ...team, players })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/teams
 * Tambah tim baru beserta skuad pemain awal (opsional)
 */
router.post('/', async (req, res) => {
  try {
    const { name, short_name, logo_url, manager_name, group_name, tournament_id, rating = 90, players = [] } = req.body

    if (!name || !short_name) {
      return res.status(400).json({ error: 'Nama tim dan singkatan wajib diisi.' })
    }

    const teamId = generateUUID()
    await query(
      `INSERT INTO pcl_teams (id, tournament_id, name, short_name, logo_url, manager_name, group_name, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [teamId, tournament_id || null, name.trim(), short_name.trim().toUpperCase(), logo_url || null, manager_name || null, group_name || null, rating]
    )

    if (Array.isArray(players) && players.length > 0) {
      for (const p of players) {
        if (p.name) {
          const pId = generateUUID()
          await query(
            `INSERT INTO pcl_players (id, team_id, name, squad_number, position, avatar_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [pId, teamId, p.name.trim(), p.squad_number || 1, p.position || 'MF', p.avatar_url || null]
          )
        }
      }
    }

    const [created] = await query('SELECT * FROM pcl_teams WHERE id = ?', [teamId])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/teams/copy-from-season
 * Salin seluruh klub & pemain dari season sumber ke season target
 */
router.post('/copy-from-season', async (req, res) => {
  try {
    const { from_tournament_id, to_tournament_id } = req.body

    if (!from_tournament_id || !to_tournament_id) {
      return res.status(400).json({ error: 'from_tournament_id dan to_tournament_id wajib diisi.' })
    }

    if (from_tournament_id === to_tournament_id) {
      return res.status(400).json({ error: 'Season asal dan season tujuan tidak boleh sama.' })
    }

    const teamsAsal = await query(
      'SELECT * FROM pcl_teams WHERE tournament_id = ? OR (? IS NULL AND tournament_id IS NULL)',
      [from_tournament_id, from_tournament_id]
    )

    if (teamsAsal.length === 0) {
      return res.status(404).json({ error: 'Tidak ada tim ditemukan di season asal.' })
    }

    let totalDisalin = 0

    for (const t of teamsAsal) {
      const [existing] = await query(
        'SELECT id FROM pcl_teams WHERE tournament_id = ? AND (name = ? OR short_name = ?)',
        [to_tournament_id, t.name, t.short_name]
      )

      if (!existing) {
        const newTeamId = generateUUID()
        await query(
          `INSERT INTO pcl_teams (id, tournament_id, name, short_name, logo_url, manager_name, group_name, rating)
           VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
          [newTeamId, to_tournament_id, t.name, t.short_name, t.logo_url, t.manager_name, t.rating || 90]
        )

        const pemainAsal = await query(
          'SELECT * FROM pcl_players WHERE team_id = ?',
          [t.id]
        )

        for (const p of pemainAsal) {
          const newPlayerId = generateUUID()
          await query(
            `INSERT INTO pcl_players (id, team_id, name, squad_number, position, avatar_url, goals, assists, passes, defense, mvp)
             VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0)`,
            [newPlayerId, newTeamId, p.name, p.squad_number, p.position, p.avatar_url]
          )
        }

        totalDisalin++
      }
    }

    res.json({ success: true, message: `Berhasil menyalin ${totalDisalin} klub ke season baru.`, total: totalDisalin })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/teams/:id
 * Perbarui data tim
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, short_name, logo_url, manager_name, group_name, rating, tournament_id } = req.body

    const updates = []
    const params = []

    if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()) }
    if (short_name !== undefined) { updates.push('short_name = ?'); params.push(short_name.trim().toUpperCase()) }
    if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url) }
    if (manager_name !== undefined) { updates.push('manager_name = ?'); params.push(manager_name) }
    if (group_name !== undefined) { updates.push('group_name = ?'); params.push(group_name) }
    if (rating !== undefined) { updates.push('rating = ?'); params.push(Number(rating)) }
    if (tournament_id !== undefined) { updates.push('tournament_id = ?'); params.push(tournament_id) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data tim yang diubah.' })
    }

    params.push(id)
    await query(`UPDATE pcl_teams SET ${updates.join(', ')} WHERE id = ?`, params)

    const [updated] = await query('SELECT * FROM pcl_teams WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/teams/:id
 * Hapus tim
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_teams WHERE id = ?', [id])
    res.json({ success: true, message: 'Tim berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
