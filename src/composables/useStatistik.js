import { ref } from 'vue'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'

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
          name: ev.player?.name || ev.player_name || 'Pemain',
          team_short: ev.team?.short_name || ev.team_short || 'TIM',
          total: 0
        }
      }
      mapGol[pId].total += 1
    }

    // Assist
    if (ev.assist_player_id || ev.assist_player || ev.event_type === 'assist') {
      const aId = ev.assist_player_id || ev.assist_player?.id || ev.assist_player?.name || ev.player_id
      const name = ev.assist_player?.name || ev.assist_player_name || ev.player?.name || 'Pemain'
      if (!mapAssist[aId]) {
        mapAssist[aId] = {
          player_id: aId,
          name: name,
          team_short: ev.team?.short_name || ev.team_short || 'TIM',
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
          name: ev.player?.name || ev.player_name || 'Pemain',
          team_short: ev.team?.short_name || ev.team_short || 'TIM',
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

  async function ambilSemuaStatistik(tournamentId, forceFresh = false) {
    const cacheKey = `statistics_${tournamentId || 'all'}`
    if (!forceFresh) {
      const cached = getCache(cacheKey)
      if (cached) {
        dataTopScorer.value = cached.topScorer || []
        dataTopAssist.value = cached.topAssist || []
        dataTopPass.value = cached.topPass || []
        dataTopDefense.value = cached.topDefense || []
        dataTopMvp.value = cached.topMvp || []
        dataDisiplin.value = cached.disiplin || []
        return
      }
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const params = {}
      if (tournamentId) params.tournament_id = tournamentId
      const stats = await api.getStatistics(params)

      dataTopScorer.value = stats.topScorer || []
      dataTopAssist.value = stats.topAssist || []
      dataTopPass.value = stats.topPass || []
      dataTopDefense.value = stats.topDefense || []
      dataTopMvp.value = stats.topMvp || []
      dataDisiplin.value = stats.disiplin || []

      setCache(cacheKey, stats, 45000) // TTL 45s
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
