import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

/**
 * Filter daftar laga berdasarkan kriteria stage, matchday, atau groupId.
 */
export function filterPertandingan(daftarLaga = [], kriteria = {}) {
  return daftarLaga.filter(laga => {
    if (kriteria.stage && laga.stage !== kriteria.stage) return false
    if (kriteria.matchday && laga.matchday !== Number(kriteria.matchday)) return false
    if (kriteria.groupId && laga.group_id !== kriteria.groupId) return false
    return true
  })
}

/**
 * Composable Vue untuk state dan fetching jadwal / detail pertandingan.
 */
export function usePertandingan() {
  const sedangMemuat = ref(false)
  const pesanKesalahan = ref(null)
  const daftarPertandingan = ref([])
  const lagaTerpilih = ref(null)
  const eventLagaTerpilih = ref([])

  async function ambilSemuaPertandingan(tournamentId) {
    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          group:tournament_groups(*)
        `)
        .eq('tournament_id', tournamentId)
        .order('matchday', { ascending: true })

      if (error) throw error
      daftarPertandingan.value = data || []
    } catch (err) {
      pesanKesalahan.value = err.message
    } finally {
      sedangMemuat.value = false
    }
  }

  async function ambilDetailPertandingan(matchId) {
    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      const { data: match, error: errMatch } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          group:tournament_groups(*)
        `)
        .eq('id', matchId)
        .single()

      if (errMatch) throw errMatch
      lagaTerpilih.value = match

      const { data: events, error: errEvents } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players!match_events_player_id_fkey(*),
          assist_player:players!match_events_assist_player_id_fkey(*),
          team:teams(*)
        `)
        .eq('match_id', matchId)
        .order('minute', { ascending: true })

      if (errEvents) throw errEvents
      eventLagaTerpilih.value = events || []
    } catch (err) {
      pesanKesalahan.value = err.message
    } finally {
      sedangMemuat.value = false
    }
  }

  return {
    sedangMemuat,
    pesanKesalahan,
    daftarPertandingan,
    lagaTerpilih,
    eventLagaTerpilih,
    filterPertandingan,
    ambilSemuaPertandingan,
    ambilDetailPertandingan
  }
}
