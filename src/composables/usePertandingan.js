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
      let query = supabase
        .from('pcl_matches')
        .select(`
          *,
          home_team:pcl_teams!pcl_matches_home_team_id_fkey(*),
          away_team:pcl_teams!pcl_matches_away_team_id_fkey(*),
          group:pcl_tournament_groups(*)
        `)
        .order('matchday', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      daftarPertandingan.value = data || []
    } catch (err) {
      pesanKesalahan.value = err.message
      daftarPertandingan.value = []
    } finally {
      sedangMemuat.value = false
    }
  }

  async function ambilDetailPertandingan(matchId) {
    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const { data: match, error: errMatch } = await supabase
        .from('pcl_matches')
        .select(`
          *,
          home_team:pcl_teams!pcl_matches_home_team_id_fkey(*),
          away_team:pcl_teams!pcl_matches_away_team_id_fkey(*),
          group:pcl_tournament_groups(*)
        `)
        .eq('id', matchId)
        .single()

      if (errMatch) throw errMatch
      lagaTerpilih.value = match

      const { data: events, error: errEvents } = await supabase
        .from('pcl_match_events')
        .select(`
          *,
          player:pcl_players!pcl_match_events_player_id_fkey(*),
          assist_player:pcl_players!pcl_match_events_assist_player_id_fkey(*),
          team:pcl_teams(*)
        `)
        .eq('match_id', matchId)
        .order('minute', { ascending: true })

      if (errEvents) throw errEvents
      eventLagaTerpilih.value = events || []
    } catch (err) {
      pesanKesalahan.value = err.message
      lagaTerpilih.value = null
      eventLagaTerpilih.value = []
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
