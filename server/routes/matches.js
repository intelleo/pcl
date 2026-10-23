import express from 'express'
import { query, generateUUID } from '../config/db.js'
import { sinkronkanSemuaBaganKnockout } from './knockout.js'

const router = express.Router()

/**
 * POST /api/matches/batch-reschedule-group
 * Mengatur ulang jadwal seluruh pertandingan fase grup berdasarkan jam mulai & jeda interval per matchday
 */
router.post('/batch-reschedule-group', async (req, res) => {
  try {
    const { tournament_id, tanggalJamMulai, jedaMenit = 15 } = req.body

    if (!tanggalJamMulai) {
      return res.status(400).json({ error: 'Tanggal dan jam mulai kick-off wajib diisi.' })
    }

    const baseTime = new Date(tanggalJamMulai)
    if (isNaN(baseTime.getTime())) {
      return res.status(400).json({ error: 'Format tanggal dan jam mulai tidak valid.' })
    }

    const intervalMinutes = Math.max(1, Number(jedaMenit) || 15)
    const pad = (n) => String(n).padStart(2, '0')

    let sqlWhere = "stage = 'group'"
    const params = []
    if (tournament_id) {
      sqlWhere += ' AND tournament_id = ?'
      params.push(tournament_id)
    }

    // Ambil semua match grup
    const matches = await query(
      `SELECT id, matchday FROM pcl_matches WHERE ${sqlWhere}`,
      params
    )

    if (matches.length === 0) {
      return res.status(404).json({ error: 'Tidak ada pertandingan fase grup yang ditemukan.' })
    }

    for (const m of matches) {
      const mdIndex = (m.matchday && m.matchday >= 1) ? (m.matchday - 1) : 0
      const targetDate = new Date(baseTime.getTime() + (mdIndex * intervalMinutes * 60 * 1000))
      const tglStr = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())} ${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}:${pad(targetDate.getSeconds())}`

      await query(
        'UPDATE pcl_matches SET scheduled_at = ? WHERE id = ?',
        [tglStr, m.id]
      )
    }

    res.json({
      success: true,
      message: `Jadwal ${matches.length} pertandingan fase grup berhasil diselaraskan ulang!`,
      totalDiubah: matches.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/matches
 * Ambil daftar pertandingan lengkap dengan info tim home/away dan grup
 */
router.get('/', async (req, res) => {
  try {
    const { tournament_id, stage, status, matchday, group_id, team_id } = req.query

    // Evaluasi & sinkronisasi otomatis status tim di babak knockout
    await sinkronkanSemuaBaganKnockout()

    let sql = `
      SELECT
        m.id, m.tournament_id, m.stage, m.group_id, m.knockout_bracket_slot,
        m.home_score, m.away_score, m.home_penalty_score, m.away_penalty_score,
        m.status, m.matchday, m.scheduled_at, m.created_at,

        -- Home Team
        th.id AS home_team_id, th.name AS home_team_name, th.short_name AS home_team_short,
        th.logo_url AS home_team_logo, th.group_name AS home_team_group,

        -- Away Team
        ta.id AS away_team_id, ta.name AS away_team_name, ta.short_name AS away_team_short,
        ta.logo_url AS away_team_logo, ta.group_name AS away_team_group,

        -- Group
        g.id AS group_table_id, g.name AS group_name
      FROM pcl_matches m
      LEFT JOIN pcl_teams th ON m.home_team_id = th.id
      LEFT JOIN pcl_teams ta ON m.away_team_id = ta.id
      LEFT JOIN pcl_tournament_groups g ON m.group_id = g.id
    `

    const conditions = []
    const params = []

    if (tournament_id) { conditions.push('m.tournament_id = ?'); params.push(tournament_id) }
    if (stage) { conditions.push('m.stage = ?'); params.push(stage) }
    if (status) { conditions.push('m.status = ?'); params.push(status) }
    if (matchday) { conditions.push('m.matchday = ?'); params.push(Number(matchday)) }
    if (group_id) { conditions.push('m.group_id = ?'); params.push(group_id) }
    if (team_id) {
      conditions.push('(m.home_team_id = ? OR m.away_team_id = ?)')
      params.push(team_id, team_id)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += " ORDER BY FIELD(m.stage, 'group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final'), g.name ASC, m.matchday ASC, m.scheduled_at ASC, m.created_at ASC"

    const rows = await query(sql, params)

    // Format output sesuai struktur yang diharapkan Vue Frontend
    const formatted = rows.map(r => ({
      id: r.id,
      tournament_id: r.tournament_id,
      stage: r.stage,
      matchday: r.matchday,
      status: r.status,
      home_score: r.home_score,
      away_score: r.away_score,
      home_penalty_score: r.home_penalty_score,
      away_penalty_score: r.away_penalty_score,
      scheduled_at: r.scheduled_at,
      knockout_bracket_slot: r.knockout_bracket_slot,
      home_team_id: r.home_team_id,
      away_team_id: r.away_team_id,
      home_team: r.home_team_id ? {
        id: r.home_team_id,
        name: r.home_team_name,
        short_name: r.home_team_short,
        logo_url: r.home_team_logo,
        group_name: r.home_team_group
      } : null,
      away_team: r.away_team_id ? {
        id: r.away_team_id,
        name: r.away_team_name,
        short_name: r.away_team_short,
        logo_url: r.away_team_logo,
        group_name: r.away_team_group
      } : null,
      group: r.group_name ? {
        id: r.group_table_id,
        name: r.group_name
      } : null
    }))

    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/matches/:id
 * Detail 1 laga + daftar event pencetak gol/kartu
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const sqlMatch = `
      SELECT
        m.id, m.tournament_id, m.stage, m.group_id, m.knockout_bracket_slot,
        m.home_score, m.away_score, m.home_penalty_score, m.away_penalty_score,
        m.status, m.matchday, m.scheduled_at, m.created_at,
        th.id AS home_team_id, th.name AS home_team_name, th.short_name AS home_team_short, th.logo_url AS home_team_logo, th.group_name AS home_team_group,
        ta.id AS away_team_id, ta.name AS away_team_name, ta.short_name AS away_team_short, ta.logo_url AS away_team_logo, ta.group_name AS away_team_group,
        g.id AS group_table_id, g.name AS group_name
      FROM pcl_matches m
      LEFT JOIN pcl_teams th ON m.home_team_id = th.id
      LEFT JOIN pcl_teams ta ON m.away_team_id = ta.id
      LEFT JOIN pcl_tournament_groups g ON m.group_id = g.id
      WHERE m.id = ?
    `

    const [match] = await query(sqlMatch, [id])
    if (!match) {
      return res.status(404).json({ error: 'Pertandingan tidak ditemukan.' })
    }

    const sqlEvents = `
      SELECT
        e.id, e.event_type, e.minute, e.team_id, e.player_id, e.assist_player_id,
        p.id AS p_id, p.name AS p_name, p.position AS p_pos,
        ap.id AS ap_id, ap.name AS ap_name,
        t.id AS t_id, t.short_name AS t_short
      FROM pcl_match_events e
      LEFT JOIN pcl_players p ON e.player_id = p.id
      LEFT JOIN pcl_players ap ON e.assist_player_id = ap.id
      LEFT JOIN pcl_teams t ON e.team_id = t.id
      WHERE e.match_id = ?
      ORDER BY e.minute ASC
    `

    const eventRows = await query(sqlEvents, [id])

    const formattedMatch = {
      id: match.id,
      tournament_id: match.tournament_id,
      stage: match.stage,
      matchday: match.matchday,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      home_penalty_score: match.home_penalty_score,
      away_penalty_score: match.away_penalty_score,
      scheduled_at: match.scheduled_at,
      knockout_bracket_slot: match.knockout_bracket_slot,
      home_team: match.home_team_id ? {
        id: match.home_team_id,
        name: match.home_team_name,
        short_name: match.home_team_short,
        logo_url: match.home_team_logo,
        group_name: match.home_team_group
      } : null,
      away_team: match.away_team_id ? {
        id: match.away_team_id,
        name: match.away_team_name,
        short_name: match.away_team_short,
        logo_url: match.away_team_logo,
        group_name: match.away_team_group
      } : null,
      group: match.group_name ? {
        id: match.group_table_id,
        name: match.group_name
      } : null
    }

    const formattedEvents = eventRows.map(e => ({
      id: e.id,
      event_type: e.event_type,
      minute: e.minute,
      player: e.p_id ? { id: e.p_id, name: e.p_name, position: e.p_pos } : null,
      assist_player: e.ap_id ? { id: e.ap_id, name: e.ap_name } : null,
      team: e.t_id ? { id: e.t_id, short_name: e.t_short } : null
    }))

    res.json({ match: formattedMatch, events: formattedEvents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/matches/:id
 * Update skor, status, atau waktu laga
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { home_score, away_score, status, scheduled_at, home_penalty_score, away_penalty_score } = req.body

    const updates = []
    const params = []

    if (home_score !== undefined) { updates.push('home_score = ?'); params.push(Number(home_score)) }
    if (away_score !== undefined) { updates.push('away_score = ?'); params.push(Number(away_score)) }
    if (status !== undefined) { updates.push('status = ?'); params.push(status) }
    if (scheduled_at !== undefined) {
      let formattedScheduled = null
      if (scheduled_at) {
        const d = new Date(scheduled_at)
        if (!isNaN(d.getTime())) {
          formattedScheduled = d.toISOString().slice(0, 19).replace('T', ' ')
        }
      }
      updates.push('scheduled_at = ?')
      params.push(formattedScheduled)
    }
    if (home_penalty_score !== undefined) { updates.push('home_penalty_score = ?'); params.push(home_penalty_score) }
    if (away_penalty_score !== undefined) { updates.push('away_penalty_score = ?'); params.push(away_penalty_score) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data pertandingan yang diubah.' })
    }

    params.push(id)
    await query(`UPDATE pcl_matches SET ${updates.join(', ')} WHERE id = ?`, params)

    // Sinkronisasi otomatis bagan knockout jika laga yang diubah adalah babak gugur
    await sinkronkanSemuaBaganKnockout()

    const [updated] = await query('SELECT * FROM pcl_matches WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
