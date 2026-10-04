import { ref } from 'vue'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'

/**
 * Menghitung klasemen tim berdasarkan daftar pertandingan yang berstatus finished.
 * Mengurutkan peringkat berdasarkan: Poin > Selisih Gol > Gol Masuk.
 *
 * @param {Array} daftarPertandingan - Array data laga (home_team_id, away_team_id, home_score, away_score, status)
 * @param {Array} daftarTim - Array data tim peserta (id, name, short_name)
 * @returns {Array} Array data klasemen terurut
 */
export function hitungKlasemen(daftarPertandingan = [], daftarTim = []) {
  const mapKlasemen = {}

  // 1. Inisialisasi awal seluruh tim
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

  // 2. Kalkulasi tiap laga finished
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
      // Home Menang
      home.won += 1
      home.points += 3
      away.lost += 1
    } else if (homeSkor < awaySkor) {
      // Away Menang
      away.won += 1
      away.points += 3
      home.lost += 1
    } else {
      // Seri
      home.drawn += 1
      home.points += 1
      away.drawn += 1
      away.points += 1
    }
  })

  // 3. Urutkan berdasarkan aturan tie-breaker
  const hasilUrut = Object.values(mapKlasemen).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    return b.goals_for - a.goals_for
  })

  // 4. Beri peringkat (rank)
  hasilUrut.forEach((item, index) => {
    item.rank = index + 1
  })

  return hasilUrut
}

/**
 * Composable Vue untuk state dan fetching klasemen.
 */
export function useKlasemen() {
  const sedangMemuat = ref(false)
  const pesanKesalahan = ref(null)
  const klasemenPerGrup = ref({})

  async function ambilKlasemenGrup(tournamentId, forceFresh = false) {
    const cacheKey = `standings_${tournamentId || 'all'}`
    if (!forceFresh) {
      const cached = getCache(cacheKey)
      if (cached) {
        klasemenPerGrup.value = cached
        return
      }
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const params = {}
      if (tournamentId) params.tournament_id = tournamentId

      const hasil = await api.getStandings(params)
      klasemenPerGrup.value = hasil || {}
      setCache(cacheKey, hasil, 30000) // TTL 30s
    } catch (err) {
      pesanKesalahan.value = err.message
      klasemenPerGrup.value = {}
    } finally {
      sedangMemuat.value = false
    }
  }

  return {
    sedangMemuat,
    pesanKesalahan,
    klasemenPerGrup,
    hitungKlasemen,
    ambilKlasemenGrup
  }
}
