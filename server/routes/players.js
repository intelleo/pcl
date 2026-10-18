import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

// Pastikan kolom statistik pemain dan game_id tersedia di database
async function ensureStatsColumns() {
  try {
    const cols = await query("SHOW COLUMNS FROM `pcl_players` LIKE 'goals'")
    if (cols.length === 0) {
      await query("ALTER TABLE `pcl_players` ADD COLUMN `goals` INT NOT NULL DEFAULT 0 AFTER `avatar_url`")
      await query("ALTER TABLE `pcl_players` ADD COLUMN `assists` INT NOT NULL DEFAULT 0 AFTER `goals`")
      await query("ALTER TABLE `pcl_players` ADD COLUMN `passes` INT NOT NULL DEFAULT 0 AFTER `assists`")
      await query("ALTER TABLE `pcl_players` ADD COLUMN `defense` INT NOT NULL DEFAULT 0 AFTER `passes`")
      await query("ALTER TABLE `pcl_players` ADD COLUMN `mvp` INT NOT NULL DEFAULT 0 AFTER `defense`")
    }
    const gameIdCol = await query("SHOW COLUMNS FROM `pcl_players` LIKE 'game_id'")
    if (gameIdCol.length === 0) {
      await query("ALTER TABLE `pcl_players` ADD COLUMN `game_id` VARCHAR(50) NULL AFTER `name`")
    }
  } catch (e) {
    // Abaikan jika tabel belum ada saat boot awal
  }
}
ensureStatsColumns()

/**
 * GET /api/players
 * Ambil daftar pemain (opsional filter team_id)
 */
router.get('/', async (req, res) => {
  try {
    const { team_id } = req.query
    let sql = `
      SELECT p.id, p.team_id, p.name, p.game_id, p.squad_number, p.position, p.avatar_url,
             p.goals, p.assists, p.passes, p.defense, p.mvp,
             t.name AS team_name, t.short_name AS team_short
      FROM pcl_players p
      JOIN pcl_teams t ON p.team_id = t.id
    `
    const params = []
    if (team_id) {
      sql += ' WHERE p.team_id = ?'
      params.push(team_id)
    }
    sql += ' ORDER BY p.squad_number ASC, p.name ASC'

    const rows = await query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/players
 * Tambah pemain ke tim
 */
router.post('/', async (req, res) => {
  try {
    const {
      team_id,
      name,
      game_id = null,
      squad_number = 1,
      position = 'MF',
      avatar_url = null,
      goals = 0,
      assists = 0,
      passes = 0,
      defense = 0,
      mvp = 0
    } = req.body

    if (!team_id || !name) {
      return res.status(400).json({ error: 'Team ID dan nama pemain wajib diisi.' })
    }

    const id = generateUUID()
    await query(
      `INSERT INTO pcl_players (id, team_id, name, game_id, squad_number, position, avatar_url, goals, assists, passes, defense, mvp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        team_id,
        name.trim(),
        game_id ? String(game_id).trim() : null,
        Number(squad_number),
        position,
        avatar_url || null,
        Number(goals) || 0,
        Number(assists) || 0,
        Number(passes) || 0,
        Number(defense) || 0,
        Number(mvp) || 0
      ]
    )

    const [created] = await query('SELECT * FROM pcl_players WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/players/:id
 * Perbarui data pemain & statistik
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      game_id,
      squad_number,
      position,
      avatar_url,
      goals,
      assists,
      passes,
      defense,
      mvp
    } = req.body

    const updates = []
    const params = []

    if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()) }
    if (game_id !== undefined) { updates.push('game_id = ?'); params.push(game_id ? String(game_id).trim() : null) }
    if (squad_number !== undefined) { updates.push('squad_number = ?'); params.push(Number(squad_number)) }
    if (position !== undefined) { updates.push('position = ?'); params.push(position) }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url) }
    if (goals !== undefined) { updates.push('goals = ?'); params.push(Number(goals)) }
    if (assists !== undefined) { updates.push('assists = ?'); params.push(Number(assists)) }
    if (passes !== undefined) { updates.push('passes = ?'); params.push(Number(passes)) }
    if (defense !== undefined) { updates.push('defense = ?'); params.push(Number(defense)) }
    if (mvp !== undefined) { updates.push('mvp = ?'); params.push(Number(mvp)) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data pemain yang diubah.' })
    }

    params.push(id)
    await query(`UPDATE pcl_players SET ${updates.join(', ')} WHERE id = ?`, params)

    const [updated] = await query('SELECT * FROM pcl_players WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/players/:id
 * Hapus pemain
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_players WHERE id = ?', [id])
    res.json({ success: true, message: 'Pemain berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
