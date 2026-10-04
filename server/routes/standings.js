import express from 'express'
import { query } from '../config/db.js'

const router = express.Router()

/**
 * Kalkulasi klasemen tim dari laga group berstatus finished
 */
function hitungKlasemen(daftarPertandingan = [], daftarTim = []) {
  const mapKlasemen = {}

  daftarTim.forEach(tim => {
    mapKlasemen[tim.id] = {
      team_id: tim.id,
      team_name: tim.name,
      team_short_name: tim.short_name,
      logo_url: tim.logo_url || null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      rank: 0
    }
  })

  daftarPertandingan.forEach(laga => {
    if (laga.status !== 'finished') return

    const home = mapKlasemen[laga.home_team_id]
    const away = mapKlasemen[laga.away_team_id]
    if (!home || !away) return

    const homeSkor = Number(laga.home_score || 0)
    const awaySkor = Number(laga.away_score || 0)

    home.played += 1
    away.played += 1
    home.goals_for += homeSkor
    home.goals_against += awaySkor
    home.goal_difference = home.goals_for - home.goals_against

    away.goals_for += awaySkor
    away.goals_against += homeSkor
    away.goal_difference = away.goals_for - away.goals_against

    if (homeSkor > awaySkor) {
      home.won += 1
      home.points += 3
      away.lost += 1
    } else if (homeSkor < awaySkor) {
      away.won += 1
      away.points += 3
      home.lost += 1
    } else {
      home.drawn += 1
      home.points += 1
      away.drawn += 1
      away.points += 1
    }
  })

  const hasilUrut = Object.values(mapKlasemen).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    return b.goals_for - a.goals_for
  })

  hasilUrut.forEach((item, index) => {
    item.rank = index + 1
  })

  return hasilUrut
}

/**
 * GET /api/standings
 * Ambil klasemen per grup
 */
router.get('/', async (req, res) => {
  try {
    const { tournament_id } = req.query

    let sqlGrup = 'SELECT id, name, tournament_id FROM pcl_tournament_groups'
    let sqlTim = 'SELECT id, name, short_name, logo_url, group_name, tournament_id FROM pcl_teams'
    let sqlLaga = "SELECT id, stage, group_id, home_team_id, away_team_id, home_score, away_score, status, tournament_id FROM pcl_matches WHERE stage = 'group'"

    const params = []
    if (tournament_id) {
      sqlGrup += ' WHERE tournament_id = ?'
      sqlTim += ' WHERE tournament_id = ?'
      sqlLaga += ' AND tournament_id = ?'
      params.push(tournament_id)
    }

    const [grupList, timList, lagaList] = await Promise.all([
      query(sqlGrup, params),
      query(sqlTim, params),
      query(sqlLaga, params)
    ])

    const hasil = {}

    if (grupList.length > 0) {
      grupList.forEach(grup => {
        const timDiGrup = timList.filter(t => t.group_name === grup.name)
        const timIds = timDiGrup.map(t => t.id)
        const lagaGrup = lagaList.filter(m =>
          m.group_id === grup.id ||
          (timIds.includes(m.home_team_id) && timIds.includes(m.away_team_id))
        )
        hasil[grup.id] = {
          id: grup.id,
          nama: grup.name,
          klasemen: hitungKlasemen(lagaGrup, timDiGrup)
        }
      })
    } else {
      const grupMap = {}
      timList.forEach(t => {
        if (t.group_name) {
          if (!grupMap[t.group_name]) grupMap[t.group_name] = []
          grupMap[t.group_name].push(t)
        }
      })

      Object.keys(grupMap).sort().forEach(gName => {
        const timDiGrup = grupMap[gName]
        const timIds = timDiGrup.map(t => t.id)
        const lagaGrup = lagaList.filter(m => timIds.includes(m.home_team_id) && timIds.includes(m.away_team_id))
        hasil[gName] = {
          id: gName,
          nama: gName,
          klasemen: hitungKlasemen(lagaGrup, timDiGrup)
        }
      })
    }

    res.json(hasil)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
