import { ref } from 'vue'
import { api } from '../lib/api.js'
import { invalidateCache } from '../lib/cache.js'
import { majukanPemenangKnockoutSupabase } from './useKnockout.js'

/**
 * Validasi nilai skor pertandingan.
 */
export function validasiInputSkor(homeScore, awayScore) {
  const h = Number(homeScore)
  const a = Number(awayScore)

  if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
    return { valid: false, pesan: 'Skor harus berupa angka positif atau nol.' }
  }
  return { valid: true }
}

/**
 * Composable Vue untuk operasi Admin (Input skor, event gol, manajemen tim).
 */
export function useAdmin() {
  const sedangMemuat = ref(false)
  const pesanSukses = ref(null)
  const pesanKesalahan = ref(null)

  async function perbaruiSkorPertandingan(matchId, homeScore, awayScore, status = 'finished', scheduledAt = null) {
    const cek = validasiInputSkor(homeScore, awayScore)
    if (!cek.valid) {
      pesanKesalahan.value = cek.pesan
      return false
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      const payload = {
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        status
      }
      if (scheduledAt) {
        payload.scheduled_at = scheduledAt
      }

      await api.updateMatch(matchId, payload)

      if (status === 'finished') {
        await majukanPemenangKnockoutSupabase(matchId, homeScore, awayScore)
      }

      invalidateCache() // Reset all caches agar klasemen & statistik terupdate
      pesanSukses.value = 'Skor pertandingan berhasil diperbarui!'
      return true
    } catch (err) {
      pesanKesalahan.value = err.message
      return false
    } finally {
      sedangMemuat.value = false
    }
  }

  async function tambahEventPertandingan(matchId, teamId, playerId, eventType, minute, assistPlayerId = null) {
    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      await api.addMatchEvent({
        match_id: matchId,
        team_id: teamId,
        player_id: playerId,
        event_type: eventType,
        minute: Number(minute),
        assist_player_id: assistPlayerId || null
      })

      invalidateCache()
      pesanSukses.value = 'Event pertandingan berhasil ditambahkan!'
      return true
    } catch (err) {
      pesanKesalahan.value = err.message
      return false
    } finally {
      sedangMemuat.value = false
    }
  }

  async function hapusEventPertandingan(eventId) {
    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      await api.deleteMatchEvent(eventId)
      invalidateCache()
      pesanSukses.value = 'Event gol berhasil dihapus!'
      return true
    } catch (err) {
      pesanKesalahan.value = err.message
      return false
    } finally {
      sedangMemuat.value = false
    }
  }

  return {
    sedangMemuat,
    pesanSukses,
    pesanKesalahan,
    validasiInputSkor,
    perbaruiSkorPertandingan,
    tambahEventPertandingan,
    hapusEventPertandingan
  }
}

/**
 * Operasi data lengkap admin
 */
export async function ambilDataLengkapAdmin() {
  const [resLaga, resTim, resPendaftaran, resRiwayat, resBerita] = await Promise.all([
    api.getMatches(),
    api.getTeams(),
    api.getRegistrations(),
    api.getChampions(),
    api.getNews()
  ])

  // Load status overrides dari localStorage jika ada
  let localStatuses = {}
  try {
    localStatuses = JSON.parse(localStorage.getItem('pcl_reg_status_overrides') || '{}')
  } catch (e) {}

  const listPendaftaran = (resPendaftaran || []).map(p => {
    if (localStatuses[p.id]) {
      return { ...p, status: localStatuses[p.id] }
    }
    return p
  })

  return {
    daftarLaga: resLaga || [],
    daftarTim: resTim || [],
    daftarPendaftaran: listPendaftaran,
    daftarBerita: resBerita || [],
    daftarRiwayat: resRiwayat || []
  }
}

/**
 * Operasi CRUD Berita PCL
 */
export async function tambahBeritaSupabase(berita) {
  const res = await api.createNews({
    judul: berita.judul,
    ringkasan: berita.ringkasan,
    konten: berita.konten,
    kategori: berita.kategori,
    tag: berita.tag,
    penulis: berita.penulis,
    gambar_url: berita.gambar_url,
    waktu_baca: berita.waktu_baca,
    terkait_match_id: berita.terkait_match_id || null
  })
  invalidateCache(/news/)
  return res
}

export async function perbaruiBeritaSupabase(berita) {
  const res = await api.updateNews(berita.id, {
    judul: berita.judul,
    ringkasan: berita.ringkasan,
    konten: berita.konten,
    kategori: berita.kategori,
    tag: berita.tag,
    penulis: berita.penulis,
    gambar_url: berita.gambar_url,
    waktu_baca: berita.waktu_baca,
    terkait_match_id: berita.terkait_match_id || null
  })
  invalidateCache(/news/)
  return res
}

export async function hapusBeritaSupabase(beritaId) {
  const res = await api.deleteNews(beritaId)
  invalidateCache(/news/)
  return res
}

/**
 * Operasi CRUD Tim Peserta
 */
export async function buatTimBaruSupabase(payload) {
  const res = await api.createTeam(payload)
  invalidateCache()
  return res
}

export async function perbaruiTimSupabase(payload) {
  const res = await api.updateTeam(payload.id, payload)
  invalidateCache()
  return res
}

export async function hapusTimSupabase(timId) {
  const res = await api.deleteTeam(timId)
  invalidateCache()
  return res
}

/**
 * Operasi Status Pendaftaran Tim
 */
export async function perbaruiStatusPendaftaranSupabase(pendaftaranId, status) {
  const res = await api.updateRegistrationStatus(pendaftaranId, status)
  invalidateCache()
  return res
}

/**
 * Operasi Reset Drawing
 */
export async function resetDrawingAdmin(customTournamentId = null) {
  const res = await api.resetDrawing({ customTournamentId })
  invalidateCache()
  return res
}

