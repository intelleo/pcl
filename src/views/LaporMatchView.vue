<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTimAuth } from '../composables/useTimAuth.js'
import { api } from '../lib/api.js'
import { kompresGambar, validasiUkuranGambar } from '../lib/gambar.js'
import TombolDasar from '../components/umum/TombolDasar.vue'
import ModalDialog from '../components/umum/ModalDialog.vue'
import {
  Shield, Lock, User, LogOut, UploadCloud, Image as ImageIcon,
  CheckCircle2, AlertCircle, Clock, Check, X, FileText, ChevronRight
} from 'lucide-vue-next'

const { timAktif, terotentikasiTim, sedangMasuk, pesanKesalahan: pesanErrorLogin, masukTim, keluarTim } = useTimAuth()

// State Login
const inputUsername = ref('')
const inputPassword = ref('')

async function handleLogin() {
  const sukses = await masukTim(inputUsername.value, inputPassword.value)
  if (sukses) {
    inputPassword.value = ''
    await muatDataTim()
  }
}

// State Upload & Laga
const daftarLagaSelesai = ref([])
const matchTerpilihId = ref('')
const previewRecap = ref('')
const previewGk = ref('')
const catatan = ref('')
const sedangUnggah = ref(false)
const pesanSuksesUpload = ref(null)
const pesanErrorUpload = ref(null)

// Riwayat Upload Tim
const riwayatRecap = ref([])
const sedangMuatRiwayat = ref(false)

// Modal Zoom Screenshot
const modalPreviewTerbuka = ref(false)
const gambarZoom = ref('')
const judulZoom = ref('')

function bukaZoom(url, judul) {
  gambarZoom.value = url
  judulZoom.value = judul
  modalPreviewTerbuka.value = true
}

async function muatDataTim() {
  if (!timAktif.value?.team_id) return
  sedangMuatRiwayat.value = true
  try {
    const [lagaData, recapData] = await Promise.all([
      api.getMatches({ team_id: timAktif.value.team_id }),
      api.getRecapsTim(timAktif.value.team_id)
    ])
    // Tampilkan semua laga milik tim ini (baik scheduled, ongoing, maupun finished)
    daftarLagaSelesai.value = lagaData || []
    riwayatRecap.value = recapData || []
    if (daftarLagaSelesai.value.length > 0 && !matchTerpilihId.value) {
      matchTerpilihId.value = daftarLagaSelesai.value[0].id
    }
  } catch (err) {
    console.error('Gagal memuat data tim:', err)
  } finally {
    sedangMuatRiwayat.value = false
  }
}

onMounted(() => {
  if (terotentikasiTim.value) {
    muatDataTim()
  }
})

watch(terotentikasiTim, (val) => {
  if (val) muatDataTim()
})

async function handlePilihBerkas(event, tipe) {
  const file = event.target.files?.[0]
  if (!file) return

  const cek = validasiUkuranGambar(file, 5 * 1024 * 1024)
  if (!cek.valid) {
    alert(cek.pesan)
    return
  }

  try {
    const hasilBase64 = await kompresGambar(file, {
      maksLebar: 1600,
      maksTinggi: 1600,
      kualitas: 0.85
    })
    if (tipe === 'recap') {
      previewRecap.value = hasilBase64
    } else {
      previewGk.value = hasilBase64
    }
  } catch (err) {
    alert(`Gagal memproses gambar: ${err.message}`)
  }
}

function hapusPratinjau(tipe) {
  if (tipe === 'recap') previewRecap.value = ''
  else previewGk.value = ''
}

async function kirimRecap() {
  if (!matchTerpilihId.value) {
    pesanErrorUpload.value = 'Silakan pilih pertandingan yang ingin dilaporkan.'
    return
  }
  if (!previewRecap.value) {
    pesanErrorUpload.value = 'Foto Screenshot Recap Match wajib diunggah.'
    return
  }

  sedangUnggah.value = true
  pesanSuksesUpload.value = null
  pesanErrorUpload.value = null

  try {
    await api.uploadRecap({
      match_id: matchTerpilihId.value,
      team_id: timAktif.value.team_id,
      recap_image: previewRecap.value,
      gk_stats_image: previewGk.value || null,
      catatan: catatan.value.trim() || null
    })

    pesanSuksesUpload.value = 'Bukti match berhasil dikirim! Menunggu verifikasi admin.'
    previewRecap.value = ''
    previewGk.value = ''
    catatan.value = ''
    await muatDataTim()
  } catch (err) {
    pesanErrorUpload.value = err.message || 'Gagal mengirim recap match.'
  } finally {
    sedangUnggah.value = false
  }
}

const lagaTerpilihObj = computed(() => {
  return daftarLagaSelesai.value.find(m => m.id === matchTerpilihId.value) || null
})

function labelLaga(m) {
  const home = m.home_team_name || m.home_team?.name || 'Home'
  const away = m.away_team_name || m.away_team?.name || 'Away'
  const hScore = m.home_score ?? 0
  const aScore = m.away_score ?? 0
  const stage = m.stage === 'group' ? `Grup (MD ${m.matchday})` : (m.stage?.toUpperCase() || 'MATCH')
  const statusStr = m.status === 'finished' ? `[Selesai ${hScore}-${aScore}]` : '[Belum Update Skor]'
  return `${home} vs ${away} • ${stage} ${statusStr}`
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
    <!-- Header Halaman -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ucl-50 border border-ucl-200 text-ucl-700 text-xs font-semibold">
        <UploadCloud class="w-3.5 h-3.5" />
        <span>Portal Kapten Tim PCL</span>
      </div>
      <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
        Lapor Screenshot Match
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
        Kirimkan foto screenshot bukti hasil akhir pertandingan dan statistik kiper untuk verifikasi skor panitia.
      </p>
    </div>

    <!-- 1. TAMPILAN JIKA BELUM LOGIN -->
    <div
      v-if="!terotentikasiTim"
      class="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card anim-muncul"
    >
      <div class="w-12 h-12 rounded-xl bg-ucl-50 border border-ucl-100 flex items-center justify-center mx-auto mb-4 text-ucl-600">
        <Lock class="w-6 h-6" />
      </div>
      <h2 class="font-semibold text-lg text-ink-900 text-center mb-1">Login Akun Tim</h2>
      <p class="text-xs text-slate-500 text-center mb-6">
        Gunakan akun tim yang telah dibagikan oleh panitia turnamen.
      </p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Username Tim</label>
          <div class="relative">
            <input
              v-model="inputUsername"
              type="text"
              placeholder="contoh: tim_che"
              class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-ink-900 outline-none focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
            <User class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Password</label>
          <div class="relative">
            <input
              v-model="inputPassword"
              type="password"
              placeholder="••••••"
              class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-ink-900 outline-none focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div v-if="pesanErrorLogin" class="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ pesanErrorLogin }}</span>
        </div>

        <TombolDasar
          tipe="submit"
          varian="primer"
          class="w-full"
          :sedangMemuat="sedangMasuk"
        >
          Masuk ke Portal Tim
        </TombolDasar>
      </form>
    </div>

    <!-- 2. TAMPILAN SETELAH LOGIN (PORTAL UPLOAD) -->
    <div v-else class="space-y-6 anim-muncul">
      <!-- Bar Info Akun Tim -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-card">
        <div class="flex items-center gap-3">
          <img
            v-if="timAktif.logo_url"
            :src="timAktif.logo_url"
            :alt="timAktif.team_name"
            class="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1"
          />
          <div
            v-else
            class="w-10 h-10 rounded-lg bg-ucl-50 border border-ucl-100 text-ucl-700 font-bold text-xs flex items-center justify-center font-mono"
          >
            {{ timAktif.short_name }}
          </div>
          <div>
            <div class="text-sm font-bold text-ink-900 flex items-center gap-1.5">
              <span>{{ timAktif.team_name }}</span>
              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600 font-bold uppercase">
                {{ timAktif.short_name }}
              </span>
            </div>
            <div class="text-[11px] text-slate-500">Akun Resmi Kapten / Manajer Tim</div>
          </div>
        </div>

        <button
          type="button"
          @click="keluarTim"
          class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>

      <!-- Form Upload Bukti Match -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-6">
        <div class="border-b border-slate-100 pb-3">
          <h2 class="text-sm font-bold text-ink-900">Form Laporan Pertandingan</h2>
          <p class="text-xs text-slate-500">Pilih pertandingan yang baru saja dimainkan dan lampirkan bukti foto.</p>
        </div>

        <div v-if="pesanSuksesUpload" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 shrink-0" />
          <span>{{ pesanSuksesUpload }}</span>
        </div>

        <div v-if="pesanErrorUpload" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ pesanErrorUpload }}</span>
        </div>

        <!-- 1. Pilih Pertandingan -->
        <div>
          <label class="block text-xs font-semibold text-ink-700 mb-1.5">
            Pilih Pertandingan Tim Anda
          </label>
          <div v-if="daftarLagaSelesai.length === 0" class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            Belum ada jadwal pertandingan yang ditemukan untuk tim ini.
          </div>
          <select
            v-else
            v-model="matchTerpilihId"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-ink-900 outline-none focus:border-ucl-500 cursor-pointer"
          >
            <option v-for="m in daftarLagaSelesai" :key="m.id" :value="m.id">
              {{ labelLaga(m) }}
            </option>
          </select>
        </div>

        <!-- 2. Unggah Dua Screenshot -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Screenshot 1: Recap Match (Wajib) -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-ink-700">
              1. Foto Recap Match <span class="text-red-500">*</span>
              <span class="block text-[11px] font-normal text-slate-500">Tampilan skor akhir laga</span>
            </label>

            <div
              v-if="!previewRecap"
              class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-ucl-400 hover:bg-slate-50/50 transition-colors cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/*"
                @change="e => handlePilihBerkas(e, 'recap')"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud class="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p class="text-xs font-semibold text-ink-900">Pilih / Seret Foto</p>
              <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG maks 5MB</p>
            </div>

            <div v-else class="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2">
              <img :src="previewRecap" alt="Pratinjau Recap" class="w-full h-44 object-contain rounded-lg" />
              <button
                type="button"
                @click="hapusPratinjau('recap')"
                class="absolute top-3 right-3 p-1 rounded-full bg-navy-950/70 text-white hover:bg-red-600 transition-colors cursor-pointer"
                title="Ganti foto"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Screenshot 2: Statistik Kiper (Opsional) -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-ink-700">
              2. Foto Statistik Kiper <span class="text-slate-400 text-[10px] font-normal">(Opsional)</span>
              <span class="block text-[11px] font-normal text-slate-500">Tampilan penyelamatan/rating kiper</span>
            </label>

            <div
              v-if="!previewGk"
              class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-ucl-400 hover:bg-slate-50/50 transition-colors cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/*"
                @change="e => handlePilihBerkas(e, 'gk')"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud class="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p class="text-xs font-semibold text-ink-900">Pilih / Seret Foto</p>
              <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG maks 5MB</p>
            </div>

            <div v-else class="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2">
              <img :src="previewGk" alt="Pratinjau Kiper" class="w-full h-44 object-contain rounded-lg" />
              <button
                type="button"
                @click="hapusPratinjau('gk')"
                class="absolute top-3 right-3 p-1 rounded-full bg-navy-950/70 text-white hover:bg-red-600 transition-colors cursor-pointer"
                title="Ganti foto"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Catatan Opsional -->
        <div>
          <label class="block text-xs font-semibold text-ink-700 mb-1.5">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            v-model="catatan"
            rows="2"
            placeholder="Berikan catatan jika menemukan kejanggalan atau kecurangan pada tim lawan..."
            class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-ink-900 outline-none focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          ></textarea>
        </div>

        <!-- Tombol Kirim -->
        <div class="flex items-center justify-end pt-2 border-t border-slate-100">
          <TombolDasar
            varian="primer"
            :sedangMemuat="sedangUnggah"
            :disabled="!previewRecap || !matchTerpilihId"
            @click="kirimRecap"
          >
            <UploadCloud class="w-4 h-4 mr-1.5" />
            <span>Kirim Bukti Match</span>
          </TombolDasar>
        </div>
      </div>

      <!-- Riwayat Laporan Match Tim Ini -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
        <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-xs text-ink-900">
            Riwayat Laporan Match Anda ({{ riwayatRecap.length }})
          </h3>
        </div>

        <div v-if="riwayatRecap.length === 0" class="p-8 text-center text-xs text-slate-400">
          Belum ada laporan match yang dikirim oleh tim ini.
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="r in riwayatRecap"
            :key="r.id"
            class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-xs text-ink-900">
                  {{ r.home_team_name }} vs {{ r.away_team_name }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-amber-100 text-amber-800': r.status === 'pending',
                    'bg-emerald-100 text-emerald-800': r.status === 'verified',
                    'bg-red-100 text-red-800': r.status === 'rejected'
                  }"
                >
                  {{ r.status === 'pending' ? 'Menunggu Verifikasi' : r.status === 'verified' ? 'Diverifikasi' : 'Ditolak' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500">
                Skor: {{ r.home_score }} - {{ r.away_score }} • Dikirim pada {{ new Date(r.created_at).toLocaleString('id-ID') }}
              </p>
              <p v-if="r.catatan" class="text-[11px] text-slate-600 italic">"{{ r.catatan }}"</p>
            </div>

            <!-- Thumbnail Foto -->
            <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                @click="bukaZoom(r.recap_image_url, 'Screenshot Recap Match')"
                class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <ImageIcon class="w-3.5 h-3.5" />
                <span>Recap</span>
              </button>
              <button
                v-if="r.gk_stats_image_url"
                type="button"
                @click="bukaZoom(r.gk_stats_image_url, 'Screenshot Statistik Kiper')"
                class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <ImageIcon class="w-3.5 h-3.5" />
                <span>Kiper</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Pratinjau Zoom Screenshot -->
    <ModalDialog
      :terbuka="modalPreviewTerbuka"
      @tutup="modalPreviewTerbuka = false"
      :judul="judulZoom"
      lebarMaksimal="max-w-3xl"
    >
      <div class="p-2 space-y-3">
        <div class="bg-black/90 rounded-xl overflow-hidden flex items-center justify-center p-2 max-h-[70vh]">
          <img :src="gambarZoom" :alt="judulZoom" class="max-w-full max-h-[65vh] object-contain" />
        </div>
        <div class="flex justify-end">
          <a
            :href="gambarZoom"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-lg bg-ucl-600 text-white text-xs font-semibold hover:bg-ucl-700 transition-colors inline-flex items-center gap-1.5"
          >
            Buka Ukuran Asli
          </a>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>
