import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

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

  async function perbaruiSkorPertandingan(matchId, homeScore, awayScore, status = 'finished') {
    const cek = validasiInputSkor(homeScore, awayScore)
    if (!cek.valid) {
      pesanKesalahan.value = cek.pesan
      return false
    }

    sedangMemuat.value = true
    pesanKesalahan.value = null
    try {
      const { error } = await supabase
        .from('pcl_matches')
        .update({
          home_score: Number(homeScore),
          away_score: Number(awayScore),
          status
        })
        .eq('id', matchId)

      if (error) throw error
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
      const { error } = await supabase
        .from('pcl_match_events')
        .insert({
          match_id: matchId,
          team_id: teamId,
          player_id: playerId,
          event_type: eventType,
          minute: Number(minute),
          assist_player_id: assistPlayerId || null
        })

      if (error) throw error
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
    try {
      const { error } = await supabase.from('pcl_match_events').delete().eq('id', eventId)
      if (error) throw error
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
