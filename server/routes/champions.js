import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

/**
 * GET /api/champions
 * Ambil daftar riwayat juara (Hall of Fame) lengkap dengan data tim juara & runner up
 */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        c.id, c.musim, c.label_musim, c.skor_final,
        c.top_scorer_nama, c.top_scorer_total, c.mvp_nama, c.mvp_rating, c.created_at,

        -- Juara Team
        tj.id AS juara_id, tj.name AS juara_name, tj.short_name AS juara_short, tj.logo_url AS juara_logo,

        -- Runner Up Team
        tr.id AS runner_up_id, tr.name AS runner_up_name, tr.short_name AS runner_up_short, tr.logo_url AS runner_up_logo
      FROM pcl_season_champions c
      LEFT JOIN pcl_teams tj ON c.juara_team_id = tj.id
      LEFT JOIN pcl_teams tr ON c.runner_up_team_id = tr.id
      ORDER BY c.musim DESC, c.created_at DESC
    `

    const [rows, events, players] = await Promise.all([
      query(sql),
      query(`
        SELECT e.player_id, p.name AS player_name, t.short_name AS team_short
        FROM pcl_match_events e
        LEFT JOIN pcl_players p ON e.player_id = p.id
        LEFT JOIN pcl_teams t ON e.team_id = t.id
        WHERE e.event_type IN ('goal', 'penalty_goal')
      `),
      query(`
        SELECT p.id, p.name, p.goals, p.mvp, t.short_name AS team_short
        FROM pcl_players p
        LEFT JOIN pcl_teams t ON p.team_id = t.id
      `)
    ])

    // Hitung fallback Top Scorer dan MVP aktif
    const mapGol = {}
    ;(events || []).forEach(ev => {
      const pId = ev.player_id
      if (pId) {
        if (!mapGol[pId]) {
          mapGol[pId] = { name: ev.player_name || 'Pemain', klub: ev.team_short || 'TIM', total: 0 }
        }
        mapGol[pId].total += 1
      }
    })
    ;(players || []).forEach(p => {
      const manualGol = Number(p.goals || 0)
      if (manualGol > 0) {
        if (!mapGol[p.id]) {
          mapGol[p.id] = { name: p.name, klub: p.team_short || 'TIM', total: manualGol }
        } else {
          mapGol[p.id].total += manualGol
        }
      }
    })

    const sortedScorer = Object.values(mapGol).sort((a, b) => b.total - a.total)
    const fallbackTopScorer = sortedScorer.length > 0 && sortedScorer[0].total > 0 ? sortedScorer[0] : null

    const sortedMvp = [...(players || [])].filter(p => Number(p.mvp || 0) > 0).sort((a, b) => Number(b.mvp || 0) - Number(a.mvp || 0))
    const fallbackTopMvp = sortedMvp.length > 0
      ? { name: sortedMvp[0].name, klub: sortedMvp[0].team_short || 'TIM', rating: Math.min(10, 7.5 + Number(sortedMvp[0].mvp) * 0.5) }
      : (fallbackTopScorer ? { name: fallbackTopScorer.name, klub: fallbackTopScorer.klub, rating: 9.0 } : null)

    const formatted = rows.map(d => {
      const namaScorer = d.top_scorer_nama && d.top_scorer_nama !== '-' ? d.top_scorer_nama : (fallbackTopScorer?.name || '-')
      const totalScorer = d.top_scorer_total > 0 ? Number(d.top_scorer_total) : (fallbackTopScorer?.total || 0)
      const klubScorer = d.juara_short || fallbackTopScorer?.klub || 'PCL'

      const namaMvp = d.mvp_nama && d.mvp_nama !== '-' ? d.mvp_nama : (fallbackTopMvp?.name || '-')
      const ratingMvp = d.mvp_rating ? Number(d.mvp_rating) : (fallbackTopMvp?.rating || 9.0)
      const klubMvp = d.juara_short || fallbackTopMvp?.klub || 'PCL'

      return {
        id: d.id,
        musim: d.musim,
        label_musim: d.label_musim,
        status: 'Selesai',
        skor_final: d.skor_final,
        top_scorer_nama: namaScorer,
        top_scorer_total: totalScorer,
        mvp_nama: namaMvp,
        mvp_rating: ratingMvp,
        juara: d.juara_id ? {
          id: d.juara_id,
          name: d.juara_name,
          short_name: d.juara_short,
          logo_url: d.juara_logo
        } : { name: 'Klub Juara', short_name: 'JUR', logo_url: null },
        runner_up: d.runner_up_id ? {
          id: d.runner_up_id,
          name: d.runner_up_name,
          short_name: d.runner_up_short,
          logo_url: d.runner_up_logo
        } : { name: 'Runner-up', short_name: 'RUN', logo_url: null },
        top_scorer: {
          nama: namaScorer,
          klub: klubScorer,
          total: totalScorer
        },
        mvp_turnamen: {
          nama: namaMvp,
          klub: klubMvp,
          rating: ratingMvp
        }
      }
    })

    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/champions
 * Buat atau simpan riwayat juara baru
 */
router.post('/', async (req, res) => {
  try {
    const {
      musim, label_musim, juara_team_id, runner_up_team_id,
      skor_final, top_scorer_nama, top_scorer_total, mvp_nama, mvp_rating
    } = req.body

    if (!musim || !skor_final) {
      return res.status(400).json({ error: 'Musim dan skor final wajib diisi.' })
    }

    const id = generateUUID()
    await query(
      `INSERT INTO pcl_season_champions
       (id, musim, label_musim, juara_team_id, runner_up_team_id, skor_final, top_scorer_nama, top_scorer_total, mvp_nama, mvp_rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, musim, label_musim || `PCL Season ${musim}`,
        juara_team_id || null, runner_up_team_id || null, skor_final,
        top_scorer_nama || null, Number(top_scorer_total || 0),
        mvp_nama || null, Number(mvp_rating || 9.0)
      ]
    )

    const [created] = await query('SELECT * FROM pcl_season_champions WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/champions/:id
 * Perbarui data riwayat juara
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      musim, label_musim, juara_team_id, runner_up_team_id,
      skor_final, top_scorer_nama, top_scorer_total, mvp_nama, mvp_rating
    } = req.body

    const updates = []
    const params = []

    if (musim !== undefined) { updates.push('musim = ?'); params.push(musim) }
    if (label_musim !== undefined) { updates.push('label_musim = ?'); params.push(label_musim) }
    if (juara_team_id !== undefined) { updates.push('juara_team_id = ?'); params.push(juara_team_id) }
    if (runner_up_team_id !== undefined) { updates.push('runner_up_team_id = ?'); params.push(runner_up_team_id) }
    if (skor_final !== undefined) { updates.push('skor_final = ?'); params.push(skor_final) }
    if (top_scorer_nama !== undefined) { updates.push('top_scorer_nama = ?'); params.push(top_scorer_nama) }
    if (top_scorer_total !== undefined) { updates.push('top_scorer_total = ?'); params.push(Number(top_scorer_total)) }
    if (mvp_nama !== undefined) { updates.push('mvp_nama = ?'); params.push(mvp_nama) }
    if (mvp_rating !== undefined) { updates.push('mvp_rating = ?'); params.push(Number(mvp_rating)) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data juara yang diubah.' })
    }

    params.push(id)
    await query(`UPDATE pcl_season_champions SET ${updates.join(', ')} WHERE id = ?`, params)

    const [updated] = await query('SELECT * FROM pcl_season_champions WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/champions/:id
 * Hapus rekaman riwayat juara
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_season_champions WHERE id = ?', [id])
    res.json({ success: true, message: 'Riwayat juara berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
