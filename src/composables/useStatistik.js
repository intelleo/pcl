import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

/**
 * Agregasi list match_events menjadi data top scorer, top assist, dan disiplin kartu.
 */
export function hitungStatistikPemain(daftarEvent = []) {
  const mapGol = {}
  const mapAssist = {}
  const mapKartu = {}

  daftarEvent.forEach(ev => {
    // 1. Gol
    if (ev.event_type === 'goal' || ev.event_type === 'penalty_goal') {
      const pId = ev.player_id
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

    // 2. Assist
    if (ev.assist_player_id || ev.event_type === 'assist') {
      const aId = ev.assist_player_id || ev.player_id
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

    // 3. Kartu
    if (ev.event_type === 'yellow_card' || ev.event_type === 'red_card') {
      const pId = ev.player_id
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

  const topScorer = Object.values(mapGol).sort((a, b) => b.total - a.total)
  const topAssist = Object.values(mapAssist).sort((a, b) => b.total - a.total)
  const disiplin = Object.values(mapKartu).sort((a, b) => (b.merah * 2 + b.kuning) - (a.merah * 2 + a.kuning))

  return { topScorer, topAssist, disiplin }
}

/**
 * Composable Vue untuk mengambil seluruh event dan kalkulasi statistik.
 */
export function useStatistik() {
  const sedangMemuat = ref(false)
  const pesanKesalahan = ref(null)
  const dataTopScorer = ref([])
  const dataTopAssist = ref([])
  const dataDisiplin = ref([])

  async function ambilSemuaStatistik(tournamentId) {
    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players!match_events_player_id_fkey(*),
          assist_player:players!match_events_assist_player_id_fkey(*),
          team:teams(*)
        `)

      if (error) throw error

      const { topScorer, topAssist, disiplin } = hitungStatistikPemain(data || [])
      dataTopScorer.value = topScorer
      dataTopAssist.value = topAssist
      dataDisiplin.value = disiplin
    } catch (err) {
      pesanKesalahan.value = err.message
    } finally {
      sedangMemuat.value = false
    }
  }

  return {
    sedangMemuat,
    pesanKesalahan,
    dataTopScorer,
    dataTopAssist,
    dataDisiplin,
    hitungStatistikPemain,
    ambilSemuaStatistik
  }
}
