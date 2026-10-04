import { ref } from 'vue'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'

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

  async function ambilSemuaPertandingan(tournamentId, forceFresh = false) {
    const cacheKey = `matches_${tournamentId || 'all'}`
    if (!forceFresh) {
      const cached = getCache(cacheKey)
      if (cached) {
        daftarPertandingan.value = cached
        return
      }
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const params = {}
      if (tournamentId) params.tournament_id = tournamentId

      const data = await api.getMatches(params)
      daftarPertandingan.value = data || []
      setCache(cacheKey, daftarPertandingan.value, 30000) // TTL 30s
    } catch (err) {
      pesanKesalahan.value = err.message
      daftarPertandingan.value = []
    } finally {
      sedangMemuat.value = false
    }
  }

  async function ambilDetailPertandingan(matchId, forceFresh = false) {
    const cacheKey = `match_detail_${matchId}`
    if (!forceFresh) {
      const cached = getCache(cacheKey)
      if (cached) {
        lagaTerpilih.value = cached.match
        eventLagaTerpilih.value = cached.events
        return
      }
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const res = await api.getMatchDetail(matchId)
      lagaTerpilih.value = res.match || null
      eventLagaTerpilih.value = res.events || []
      setCache(cacheKey, { match: lagaTerpilih.value, events: eventLagaTerpilih.value }, 45000)
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
