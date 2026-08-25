import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

/**
 * Agregasi list match_events & pemain menjadi data Top Scorer, Top Assist, Top Pass, Top Defense, Top MVP, dan Kartu.
 */
export function hitungStatistikPemain(daftarEvent = [], daftarPemain = [], daftarTim = []) {
  const mapGol = {}
  const mapAssist = {}
  const mapKartu = {}

  // 1. Hitung event spesifik
  daftarEvent.forEach(ev => {
    // Gol
    if (ev.event_type === 'goal' || ev.event_type === 'penalty_goal') {
      const pId = ev.player_id || ev.player?.id || ev.player?.name
      if (!mapGol[pId]) {
        mapGol[pId] = {
          player_id: pId,
          name: ev.player?.name || 'Pemain',
          team_short: ev.team?.short_name || 'TIM',
          total: 0
        }
      }
      mapGol[pId].total += 1
    }

    // Assist
    if (ev.assist_player_id || ev.assist_player || ev.event_type === 'assist') {
      const aId = ev.assist_player_id || ev.assist_player?.id || ev.assist_player?.name || ev.player_id
      const name = ev.assist_player?.name || ev.player?.name || 'Pemain'
      if (!mapAssist[aId]) {
        mapAssist[aId] = {
          player_id: aId,
          name: name,
          team_short: ev.team?.short_name || 'TIM',
          total: 0
        }
      }
      mapAssist[aId].total += 1
    }

    // Kartu
    if (ev.event_type === 'yellow_card' || ev.event_type === 'red_card') {
      const pId = ev.player_id || ev.player?.id || ev.player?.name
      if (!mapKartu[pId]) {
        mapKartu[pId] = {
          player_id: pId,
          name: ev.player?.name || 'Pemain',
          team_short: ev.team?.short_name || 'TIM',
          kuning: 0,
          merah: 0
        }
      }
      if (ev.event_type === 'yellow_card') mapKartu[pId].kuning += 1
      if (ev.event_type === 'red_card') mapKartu[pId].merah += 1
    }
  })

  // Agregasi dari tim & skuad jika tersedia
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
    const tShort = p.team?.short_name || mapTeam[p.team_id] || p.team_short || 'TIM'
    const stats = p.stats || {}

    // Lengkapi gol jika dari player stats
    if (stats.goal && !listScorerFinal[p.id]) {
      listScorerFinal[p.id] = { player_id: p.id, name: p.name, team_short: tShort, total: stats.goal }
    }
    // Lengkapi assist
    if (stats.assist && !listAssistFinal[p.id]) {
      listAssistFinal[p.id] = { player_id: p.id, name: p.name, team_short: tShort, total: stats.assist }
    }
    // Pass
    if (stats.pass) {
      listPass.push({ player_id: p.id, name: p.name, team_short: tShort, total: stats.pass })
    }
    // Defense
    if (stats.def) {
      listDefense.push({ player_id: p.id, name: p.name, team_short: tShort, total: stats.def })
    }
    // MVP
    if (stats.mvp) {
      listMvp.push({ player_id: p.id, name: p.name, team_short: tShort, total: stats.mvp })
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
 * Composable Vue untuk mengambil seluruh event dan kalkulasi statistik turnamen.
 */
export function useStatistik() {
  const sedangMemuat = ref(false)
  const pesanKesalahan = ref(null)
  const dataTopScorer = ref([])
  const dataTopAssist = ref([])
  const dataTopPass = ref([])
  const dataTopDefense = ref([])
  const dataTopMvp = ref([])
  const dataDisiplin = ref([])

  async function ambilSemuaStatistik(tournamentId) {
    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const [resEvents, resPlayers, resTeams] = await Promise.all([
        supabase
          .from('pcl_match_events')
          .select(`
            *,
            player:pcl_players!pcl_match_events_player_id_fkey(*),
            assist_player:pcl_players!pcl_match_events_assist_player_id_fkey(*),
            team:pcl_teams(*)
          `),
        supabase
          .from('pcl_players')
          .select(`
            *,
            team:pcl_teams(*)
          `),
        supabase
          .from('pcl_teams')
          .select('*')
      ])

      if (resEvents.error) throw resEvents.error

      const events = resEvents.data || []
      const players = resPlayers.data || []
      const teams = resTeams.data || []

      const { topScorer, topAssist, topPass, topDefense, topMvp, disiplin } = hitungStatistikPemain(events, players, teams)
      dataTopScorer.value = topScorer
      dataTopAssist.value = topAssist
      dataTopPass.value = topPass
      dataTopDefense.value = topDefense
      dataTopMvp.value = topMvp
      dataDisiplin.value = disiplin
    } catch (err) {
      pesanKesalahan.value = err.message
      dataTopScorer.value = []
      dataTopAssist.value = []
      dataTopPass.value = []
      dataTopDefense.value = []
      dataTopMvp.value = []
      dataDisiplin.value = []
    } finally {
      sedangMemuat.value = false
    }
  }

  return {
    sedangMemuat,
    pesanKesalahan,
    dataTopScorer,
    dataTopAssist,
    dataTopPass,
    dataTopDefense,
    dataTopMvp,
    dataDisiplin,
    hitungStatistikPemain,
    ambilSemuaStatistik
  }
}
