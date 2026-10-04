import { ref } from 'vue'
import { api } from '../lib/api.js'
import { invalidateCache, getCache, setCache } from '../lib/cache.js'

export function useSeason() {
  const daftarSeason = ref([])
  const seasonAktif = ref(null)
  const sedangMemuat = ref(false)
  const pesanKesalahan = ref(null)
  const pesanSukses = ref(null)

  /**
   * Mengambil semua daftar season dari API
   */
  async function muatSemuaSeason(forceFresh = false) {
    if (!forceFresh) {
      const cached = getCache('tournaments_list')
      if (cached) {
        daftarSeason.value = cached
        seasonAktif.value = cached.find(s => s.status !== 'completed') || cached[0] || null
        return
      }
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const data = await api.getTournaments()
      daftarSeason.value = data || []
      seasonAktif.value = (data || []).find(s => s.status !== 'completed') || (data || [])[0] || null
      setCache('tournaments_list', data || [], 30000)
    } catch (err) {
      pesanKesalahan.value = err.message
    } finally {
      sedangMemuat.value = false
    }
  }

  /**
   * Membuat season baru.
   */
  async function buatSeasonBaru(namaTurnamen, labelSeason) {
    if (!namaTurnamen?.trim() || !labelSeason?.trim()) {
      pesanKesalahan.value = 'Nama turnamen dan label season wajib diisi.'
      return false
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null

    try {
      const payload = {
        name: namaTurnamen.trim(),
        season: labelSeason.trim(),
        status: 'knockout'
      }

      const data = await api.createTournament(payload)
      invalidateCache()
      await muatSemuaSeason(true)
      pesanSukses.value = `Season "${payload.season}" berhasil dibuat!`
      return data
    } catch (err) {
      pesanKesalahan.value = err.message
      return false
    } finally {
      sedangMemuat.value = false
    }
  }

  /**
   * Mengubah status season (misal 'knockout' <-> 'completed').
   */
  async function perbaruiStatusSeason(tournamentId, status) {
    sedangMemuat.value = true
    try {
      await api.updateTournament(tournamentId, { status })
      invalidateCache()
      await muatSemuaSeason(true)
      pesanSukses.value = 'Status season berhasil diperbarui!'
      return true
    } catch (err) {
      pesanKesalahan.value = err.message
      return false
    } finally {
      sedangMemuat.value = false
    }
  }

  /**
   * Hapus season beserta data terkait jika diperlukan.
   */
  async function hapusSeason(tournamentId) {
    sedangMemuat.value = true
    try {
      await api.deleteTournament(tournamentId)
      invalidateCache()
      await muatSemuaSeason(true)
      pesanSukses.value = 'Season berhasil dihapus!'
      return true
    } catch (err) {
      pesanKesalahan.value = err.message
      return false
    } finally {
      sedangMemuat.value = false
    }
  }

  return {
    daftarSeason,
    seasonAktif,
    sedangMemuat,
    pesanKesalahan,
    pesanSukses,
    muatSemuaSeason,
    buatSeasonBaru,
    perbaruiStatusSeason,
    hapusSeason
  }
}
