import { ref, computed } from 'vue'
import { api } from '../lib/api.js'

const timAktif = ref(null)
const terotentikasiTim = ref(false)

// Muat sesi tim dari localStorage jika ada
try {
  const sesi = localStorage.getItem('pcl_team_session')
  if (sesi) {
    const data = JSON.parse(sesi)
    timAktif.value = data
    terotentikasiTim.value = true
  }
} catch {
  // Abaikan error parsing
}

export function useTimAuth() {
  const sedangMasuk = ref(false)
  const pesanKesalahan = ref('')

  async function masukTim(username, password) {
    sedangMasuk.value = true
    pesanKesalahan.value = ''

    const user = (username || '').trim().toLowerCase()
    const pass = (password || '').trim()

    if (!user || !pass) {
      pesanKesalahan.value = 'Username dan Password wajib diisi.'
      sedangMasuk.value = false
      return false
    }

    try {
      const res = await api.loginTim(user, pass)
      if (res && res.user) {
        timAktif.value = res.user
        terotentikasiTim.value = true
        localStorage.setItem('pcl_team_session', JSON.stringify(res.user))
        return true
      }
      pesanKesalahan.value = 'Username atau Password salah.'
      return false
    } catch (err) {
      pesanKesalahan.value = err.message || 'Username atau Password salah.'
      return false
    } finally {
      sedangMasuk.value = false
    }
  }

  function keluarTim() {
    timAktif.value = null
    terotentikasiTim.value = false
    localStorage.removeItem('pcl_team_session')
  }

  return {
    timAktif: computed(() => timAktif.value),
    terotentikasiTim: computed(() => terotentikasiTim.value),
    sedangMasuk,
    pesanKesalahan,
    masukTim,
    keluarTim
  }
}
