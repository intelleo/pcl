import express from 'express'
import { query } from '../config/db.js'

const router = express.Router()

/**
 * Agregasi list match_events & pemain menjadi data Top Scorer, Top Assist, Top Pass, Top Defense, Top MVP, dan Kartu.
 */
function hitungStatistikPemain(daftarEvent = [], daftarPemain = [], daftarTim = []) {
  const mapGol = {}
  const mapAssist = {}
  const mapKartu = {}

  daftarEvent.forEach(ev => {
    // Gol
    if (ev.event_type === 'goal' || ev.event_type === 'penalty_goal') {
      const pId = ev.player_id
      if (!mapGol[pId]) {
        mapGol[pId] = {
          player_id: pId,
          name: ev.player_name || 'Pemain',
          team_short: ev.team_short || 'TIM',
          total: 0
        }
      }
      mapGol[pId].total += 1
    }

    // Assist
    if (ev.assist_player_id || ev.event_type === 'assist') {
      const aId = ev.assist_player_id || ev.player_id
      const name = ev.assist_player_name || ev.player_name || 'Pemain'
      if (!mapAssist[aId]) {
        mapAssist[aId] = {
          player_id: aId,
          name: name,
          team_short: ev.team_short || 'TIM',
          total: 0
        }
      }
      mapAssist[aId].total += 1
    }

    // Kartu
    if (ev.event_type === 'yellow_card' || ev.event_type === 'red_card') {
      const pId = ev.player_id
      if (!mapKartu[pId]) {
        mapKartu[pId] = {
          player_id: pId,
          name: ev.player_name || 'Pemain',
          team_short: ev.team_short || 'TIM',
          kuning: 0,
          merah: 0
        }
      }
      if (ev.event_type === 'yellow_card') mapKartu[pId].kuning += 1
      if (ev.event_type === 'red_card') mapKartu[pId].merah += 1
    }
  })

  const mapTeam = {}
  daftarTim.forEach(t => {
    if (t && t.id) mapTeam[t.id] = t.short_name
  })

  const listPass = []
  const listDefense = []
  const listMvp = []
  const listScorerFinal = { ...mapGol }
  const listAssistFinal = { ...mapAssist }

  daftarPemain.forEach(p => {
    const tShort = p.team_short || mapTeam[p.team_id] || 'TIM'
    const manualGoal = Number(p.goals) || 0
    const manualAssist = Number(p.assists) || 0
    const passVal = Number(p.passes) || 0
    const defVal = Number(p.defense) || 0
    const mvpVal = Number(p.mvp) || 0

    // Gabungkan gol event laga + manual statistik jika ada
    if (manualGoal > 0) {
      if (!listScorerFinal[p.id]) {
        listScorerFinal[p.id] = { player_id: p.id, name: p.name, team_short: tShort, total: manualGoal }
      } else {
        listScorerFinal[p.id].total += manualGoal
      }
    }

    // Gabungkan assist event laga + manual statistik jika ada
    if (manualAssist > 0) {
      if (!listAssistFinal[p.id]) {
        listAssistFinal[p.id] = { player_id: p.id, name: p.name, team_short: tShort, total: manualAssist }
      } else {
        listAssistFinal[p.id].total += manualAssist
      }
    }

    if (passVal > 0) {
      listPass.push({ player_id: p.id, name: p.name, team_short: tShort, total: passVal })
    }
    if (defVal > 0) {
      listDefense.push({ player_id: p.id, name: p.name, team_short: tShort, total: defVal })
    }
    if (mvpVal > 0) {
      listMvp.push({ player_id: p.id, name: p.name, team_short: tShort, total: mvpVal })
    }
  })

  const topScorer = Object.values(listScorerFinal).sort((a, b) => b.total - a.total)
  const topAssist = Object.values(listAssistFinal).sort((a, b) => b.total - a.total)
  const topPass = listPass.sort((a, b) => b.total - a.total)
  const topDefense = listDefense.sort((a, b) => b.total - a.total)
  const topMvp = listMvp.sort((a, b) => b.total - a.total)
  const disiplin = Object.values(mapKartu).sort((a, b) => (b.merah * 2 + b.kuning) - (a.merah * 2 + a.kuning))

  return { topScorer, topAssist, topPass, topDefense, topMvp, disiplin }
}

/**
 * GET /api/statistics
 * Ambil agregasi statistik turnamen
 */
router.get('/', async (req, res) => {
  try {
    const { tournament_id } = req.query

    let sqlEvents = `
      SELECT e.id, e.event_type, e.minute, e.player_id, e.assist_player_id, e.team_id,
             p.name AS player_name, p.position AS player_position,
             ap.name AS assist_player_name,
             t.short_name AS team_short
      FROM pcl_match_events e
      JOIN pcl_matches m ON e.match_id = m.id
      LEFT JOIN pcl_players p ON e.player_id = p.id
      LEFT JOIN pcl_players ap ON e.assist_player_id = ap.id
      LEFT JOIN pcl_teams t ON e.team_id = t.id
    `
    const eventParams = []
    if (tournament_id) {
      sqlEvents += ' WHERE m.tournament_id = ?'
      eventParams.push(tournament_id)
    }

    let sqlPlayers = `
      SELECT p.id, p.name, p.position, p.squad_number, p.team_id,
             p.goals, p.assists, p.passes, p.defense, p.mvp,
             t.short_name AS team_short
      FROM pcl_players p
      LEFT JOIN pcl_teams t ON p.team_id = t.id
    `
    const playerParams = []
    if (tournament_id) {
      sqlPlayers += ' WHERE t.tournament_id = ?'
      playerParams.push(tournament_id)
    }

    let sqlTeams = 'SELECT id, name, short_name FROM pcl_teams'
    const teamParams = []
    if (tournament_id) {
      sqlTeams += ' WHERE tournament_id = ?'
      teamParams.push(tournament_id)
    }

    const [events, players, teams] = await Promise.all([
      query(sqlEvents, eventParams),
      query(sqlPlayers, playerParams),
      query(sqlTeams, teamParams)
    ])

    const data = hitungStatistikPemain(events, players, teams)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
