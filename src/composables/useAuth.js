import { ref, computed } from 'vue'
import { api } from '../lib/api.js'

const adminAktif = ref(null)
const terotentikasi = ref(false)

// Muat status sesi dari localStorage jika ada
try {
  const sesiTersimpan = localStorage.getItem('pcl_admin_session')
  if (sesiTersimpan) {
    const data = JSON.parse(sesiTersimpan)
    adminAktif.value = data
    terotentikasi.value = true
  }
} catch (e) {
  // Abaikan error parsing storage
}

export function useAuth() {
  const sedangMasuk = ref(false)
  const pesanKesalahan = ref('')

  async function masukAdmin(identitas, kataSandi) {
    sedangMasuk.value = true
    pesanKesalahan.value = ''

    const idBersih = (identitas || '').trim().toLowerCase()
    const passBersih = (kataSandi || '').trim()

    if (!idBersih || !passBersih) {
      pesanKesalahan.value = 'Username / Email dan Password wajib diisi.'
      sedangMasuk.value = false
      return false
    }

    try {
      const res = await api.login(idBersih, passBersih)
      if (res && res.user) {
        adminAktif.value = res.user
        terotentikasi.value = true
        localStorage.setItem('pcl_admin_session', JSON.stringify(res.user))
        return true
      }
      pesanKesalahan.value = 'Username/Email atau Password salah.'
      return false
    } catch (err) {
      pesanKesalahan.value = err.message || 'Username/Email atau Password salah.'
      return false
    } finally {
      sedangMasuk.value = false
    }
  }

  function keluarAdmin() {
    adminAktif.value = null
    terotentikasi.value = false
    localStorage.removeItem('pcl_admin_session')
  }

  return {
    adminAktif: computed(() => adminAktif.value),
    terotentikasi: computed(() => terotentikasi.value),
    sedangMasuk,
    pesanKesalahan,
    masukAdmin,
    keluarAdmin
  }
}
