import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

const PENGGUNA_ADMIN_DEFAULT = [
  { username: 'admin', email: 'admin@pcl.com', nama: 'Super Admin PCL', role: 'admin' },
  { username: 'panitia', email: 'panitia@pcl.com', nama: 'Panitia Turnamen', role: 'panitia' }
]

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
      // 1. Coba login via Supabase Auth jika email valid
      if (idBersih.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: idBersih,
          password: passBersih
        })

        if (!error && data?.user) {
          const userObj = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'admin',
            email: data.user.email,
            nama: data.user.user_metadata?.full_name || 'Admin PCL',
            role: 'admin'
          }
          adminAktif.value = userObj
          terotentikasi.value = true
          localStorage.setItem('pcl_admin_session', JSON.stringify(userObj))
          return true
        }
      }

      // 2. Fallback kredensial lokal panitia turnamen PCL
      const kecocokan = PENGGUNA_ADMIN_DEFAULT.find(
        u => u.username.toLowerCase() === idBersih || u.email.toLowerCase() === idBersih
      )

      if (kecocokan && (passBersih === 'admin123' || passBersih === 'pcl2026')) {
        const userObj = { ...kecocokan, id: `local-${kecocokan.username}` }
        adminAktif.value = userObj
        terotentikasi.value = true
        localStorage.setItem('pcl_admin_session', JSON.stringify(userObj))
        return true
      }

      pesanKesalahan.value = 'Username/Email atau Password salah. (Default: admin / admin123)'
      return false
    } catch (err) {
      pesanKesalahan.value = err.message || 'Gagal melakukan login admin.'
      return false
    } finally {
      sedangMasuk.value = false
    }
  }

  function keluarAdmin() {
    try {
      supabase.auth.signOut()
    } catch (e) {}
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
