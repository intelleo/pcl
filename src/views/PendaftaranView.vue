<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../lib/api.js'
import { kompresGambar, validasiUkuranGambar } from '../lib/gambar.js'
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  MessageCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-vue-next'
import TombolDasar from '../components/umum/TombolDasar.vue'
import KotakPembayaranWa from '../components/pendaftaran/KotakPembayaranWa.vue'
import FormSkuadDaftar from '../components/pendaftaran/FormSkuadDaftar.vue'
import bgPattern from '@/assets/img/bg-pattern.webp'
import logoo from '@/assets/img/logoo.webp'

const DRAFT_KEY = 'pcl_pendaftaran_draft'

// State form
const pendaftaranBuka = ref(true)
const sedangMemuatCek = ref(true)
const sedangKirim = ref(false)
const pesanSukses = ref(false)
const pesanError = ref(null)
const draftTersimpanWaktu = ref(null)

// Form Data - Klub
const namaTim = ref('')
const logoUrl = ref('')
const previewLogo = ref(null)
const tagTim = ref('')
const tagTimManual = ref(false)

// Form Data - Kapten & Skuad
const kaptenNoHp = ref('')
const kaptenGameId = ref('')
const kaptenNickname = ref('')
const kaptenRole = ref('CM')
const daftarAnggota = ref([])

// Pengaturan Pembayaran & WA
const qrPembayaranUrl = ref('')
const biayaPendaftaran = ref('Rp 50.000 / Tim')
const kontakPanitiaWa = ref('081234567890')
const instruksiPembayaran = ref(
  'Scan QRIS pembayaran di bawah lalu kirim bukti transfer ke nomor WhatsApp panitia.'
)

// === Auto Save & Restore Draft ===
function pulihkanDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const d = JSON.parse(raw)
    if (d.namaTim) namaTim.value = d.namaTim
    if (d.tagTim) tagTim.value = d.tagTim
    if (d.tagTimManual !== undefined) tagTimManual.value = d.tagTimManual
    if (d.logoUrl) {
      logoUrl.value = d.logoUrl
      previewLogo.value = d.logoUrl
    }
    if (d.kaptenNoHp) kaptenNoHp.value = d.kaptenNoHp
    if (d.kaptenGameId) kaptenGameId.value = d.kaptenGameId
    if (d.kaptenNickname) kaptenNickname.value = d.kaptenNickname
    if (d.kaptenRole) kaptenRole.value = d.kaptenRole
    if (Array.isArray(d.daftarAnggota)) daftarAnggota.value = d.daftarAnggota
    if (d.savedAt) draftTersimpanWaktu.value = d.savedAt
  } catch (e) {
    console.error('Gagal memuat draft pendaftaran:', e)
  }
}

function simpanDraft() {
  try {
    // Jangan simpan draft kosong
    if (!namaTim.value && !kaptenNoHp.value && !kaptenNickname.value && daftarAnggota.value.length === 0) {
      return
    }
    const draftData = {
      namaTim: namaTim.value,
      tagTim: tagTim.value,
      tagTimManual: tagTimManual.value,
      logoUrl: logoUrl.value,
      kaptenNoHp: kaptenNoHp.value,
      kaptenGameId: kaptenGameId.value,
      kaptenNickname: kaptenNickname.value,
      kaptenRole: kaptenRole.value,
      daftarAnggota: daftarAnggota.value,
      savedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
    draftTersimpanWaktu.value = draftData.savedAt
  } catch (e) {
    console.error('Gagal menyimpan draft ke localStorage:', e)
  }
}

function resetDraftDanForm() {
  if (confirm('Yakin ingin mengosongkan seluruh isian form pendaftaran?')) {
    localStorage.removeItem(DRAFT_KEY)
    namaTim.value = ''
    tagTim.value = ''
    tagTimManual.value = false
    logoUrl.value = ''
    previewLogo.value = null
    kaptenNoHp.value = ''
    kaptenGameId.value = ''
    kaptenNickname.value = ''
    kaptenRole.value = 'CM'
    daftarAnggota.value = []
    draftTersimpanWaktu.value = null
  }
}

// Watcher untuk auto-save saat form diisi (deep watch)
watch(
  [namaTim, tagTim, logoUrl, kaptenNoHp, kaptenGameId, kaptenNickname, kaptenRole, daftarAnggota],
  () => {
    simpanDraft()
  },
  { deep: true }
)

// Auto-generate Tag Tim jika tidak diisi manual
watch(namaTim, (val) => {
  if (!tagTimManual.value) {
    const text = val.trim()
    if (!text) {
      tagTim.value = ''
      return
    }
    const kata = text.split(/\s+/).filter(Boolean)
    if (kata.length >= 3) {
      tagTim.value = (kata[0][0] + kata[1][0] + kata[2][0]).toUpperCase().slice(0, 3)
    } else if (kata.length === 2) {
      tagTim.value = (kata[0].substring(0, 2) + kata[1].substring(0, 1)).toUpperCase().slice(0, 3)
    } else {
      tagTim.value = text.substring(0, 3).toUpperCase()
    }
  }
})

function handleInputTagTim(e) {
  tagTimManual.value = true
  tagTim.value = e.target.value.toUpperCase().slice(0, 3)
}

async function handleUnggahLogo(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const cek = validasiUkuranGambar(file)
  if (!cek.valid) {
    alert(cek.pesan)
    return
  }
  try {
    const hasil = await kompresGambar(file, { maksLebar: 400, maksTinggi: 400 })
    logoUrl.value = hasil
    previewLogo.value = hasil
  } catch (err) {
    alert('Gagal memproses gambar: ' + err.message)
  }
}

function tambahAnggota() {
  daftarAnggota.value.push({
    id: Date.now(),
    game_id: '',
    nickname: '',
    role: 'CM'
  })
}

function hapusAnggota(index) {
  daftarAnggota.value.splice(index, 1)
}

const linkWhatsApp = computed(() => {
  let raw = (kontakPanitiaWa.value || '').replace(/\D/g, '')
  if (raw.startsWith('0')) raw = '62' + raw.slice(1)
  const pesan = encodeURIComponent(
    `Halo Panitia PCL, saya Kapten ${kaptenNickname.value || 'Pendaftar'} dari tim ${namaTim.value || '-'} sudah mengisi formulir pendaftaran turnamen PCL 2026 dan ingin konfirmasi / kirim bukti transfer pembayaran.`
  )
  return `https://wa.me/${raw}?text=${pesan}`
})

async function cekStatusPendaftaran() {
  sedangMemuatCek.value = true
  try {
    const settings = await api.getSettings()
    if (settings) {
      if (settings.pendaftaran_buka !== undefined) {
        pendaftaranBuka.value = settings.pendaftaran_buka === 'true' || settings.pendaftaran_buka === true
      }
      if (settings.qr_pembayaran_url) qrPembayaranUrl.value = settings.qr_pembayaran_url
      if (settings.biaya_pendaftaran) biayaPendaftaran.value = settings.biaya_pendaftaran
      if (settings.kontak_panitia_wa) kontakPanitiaWa.value = settings.kontak_panitia_wa
      if (settings.instruksi_pembayaran) instruksiPembayaran.value = settings.instruksi_pembayaran
    } else {
      pendaftaranBuka.value = true
    }
  } catch {
    pendaftaranBuka.value = true
  } finally {
    sedangMemuatCek.value = false
  }
}

async function handleKirimPendaftaran() {
  if (!namaTim.value || !kaptenNoHp.value || !kaptenNickname.value) {
    pesanError.value = 'Harap isi semua data wajib (Nama Tim, No HP Kapten & Nickname Kapten).'
    return
  }

  sedangKirim.value = true
  pesanError.value = null

  try {
    const dataPendaftar = {
      nama_tim: namaTim.value.trim(),
      short_name: (tagTim.value.trim() || 'TIM').toUpperCase().slice(0, 3),
      manager_name: kaptenNickname.value.trim(),
      kontak: kaptenNoHp.value.trim(),
      email: 'pendaftar@pcl.com',
      catatan: JSON.stringify({
        logo_url: logoUrl.value.trim() || null,
        metode_konfirmasi: 'whatsapp',
        kapten: {
          no_hp: kaptenNoHp.value.trim(),
          game_id: kaptenGameId.value.trim(),
          nickname: kaptenNickname.value.trim(),
          role: kaptenRole.value
        },
        anggota: daftarAnggota.value.map((a) => ({
          game_id: a.game_id.trim(),
          nickname: a.nickname.trim(),
          role: a.role
        }))
      }),
      status: 'pending'
    }

    await api.createRegistration(dataPendaftar)
    localStorage.removeItem(DRAFT_KEY)
    pesanSukses.value = true
  } catch (err) {
    pesanError.value = err.message || 'Gagal mengirim pendaftaran tim.'
  } finally {
    sedangKirim.value = false
  }
}

onMounted(() => {
  pulihkanDraft()
  cekStatusPendaftaran()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16 space-y-6 sm:space-y-8">
    <!-- Hero Header Pendaftaran -->
    <div class="anim-muncul relative overflow-hidden rounded-3xl shadow-lift hero-navy border border-ucl-800/40 p-6 sm:p-10 text-white">
      <!-- Background Pattern Layer -->
      <img
        :src="bgPattern"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-center opacity-20 mix-blend-luminosity pointer-events-none select-none"
        decoding="async"
      />
      <div aria-hidden="true" class="absolute inset-0 pola-bintang opacity-50 pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none"></div>

      <!-- Watermark Logo PCL -->
      <div
        aria-hidden="true"
        class="absolute -right-6 -bottom-6 w-44 sm:w-64 opacity-10 pointer-events-none select-none"
      >
        <img :src="logoo" alt="" class="w-full h-auto object-contain" decoding="async" />
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-xs font-bold uppercase tracking-[0.14em]">
          <Shield class="w-3.5 h-3.5 text-gold-400" />
          <span>Registrasi Resmi Turnamen</span>
        </div>

        <h1 class="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Pendaftaran Tim Peak Champions League
        </h1>

        <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Daftarkan klub dan skuad terbaikmu untuk berlaga di turnamen PCL 2026. Format 16 Klub dengan sistem Best of 3 Knockout.
        </p>

        <!-- Tombol Kosongkan Form jika ada isian draft -->
        <div v-if="draftTersimpanWaktu" class="pt-2 flex items-center justify-center text-xs">
          <button
            type="button"
            @click="resetDraftDanForm"
            class="text-xs text-slate-300/80 hover:text-red-400 font-medium underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw class="w-3 h-3" />
            Kosongkan Form
          </button>
        </div>
      </div>
    </div>

    <!-- State Loading -->
    <div v-if="sedangMemuatCek" class="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>

    <!-- State Pendaftaran Ditutup -->
    <div
      v-else-if="!pendaftaranBuka"
      class="anim-muncul bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-card space-y-4"
    >
      <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
        <Lock class="w-7 h-7" />
      </div>
      <h2 class="text-xl font-bold text-ink-900">Pendaftaran PCL 2026 Saat Ini Ditutup</h2>
      <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        Kuota pendaftaran tim telah terpenuhi atau masa pendaftaran telah ditutup oleh panitia. Pantau terus informasi turnamen di halaman Berita.
      </p>
    </div>

    <!-- State Sukses Mendaftar -->
    <div
      v-else-if="pesanSukses"
      class="anim-muncul bg-white border border-emerald-200 rounded-2xl p-8 sm:p-12 text-center shadow-card space-y-5"
    >
      <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 class="w-8 h-8" />
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-ink-900">Pendaftaran Berhasil Dikirim!</h2>
        <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Data tim <span class="font-bold text-ink-900">{{ namaTim }}</span> telah masuk ke sistem panitia. Langkah terakhir, silakan kirimkan bukti transfer ke WhatsApp panitia.
        </p>
      </div>

      <!-- WA CTA Box -->
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto space-y-3">
        <div class="text-xs font-semibold text-emerald-900 flex items-center justify-center gap-1.5">
          <MessageCircle class="w-4 h-4 text-emerald-600" />
          <span>Nomor WhatsApp Panitia: {{ kontakPanitiaWa }}</span>
        </div>
        <a
          :href="linkWhatsApp"
          target="_blank"
          class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Kirim Bukti Pembayaran ke WhatsApp</span>
          <ExternalLink class="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      <div class="pt-2">
        <router-link to="/jadwal?tab=tim" class="text-xs text-slate-500 hover:text-ink-900 font-semibold underline">
          Lihat Daftar Klub Peserta
        </router-link>
      </div>
    </div>

    <!-- Form Pendaftaran -->
    <form v-else @submit.prevent="handleKirimPendaftaran" class="anim-muncul space-y-6">
      <div v-if="pesanError" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ pesanError }}
      </div>

      <!-- Section 1: Informasi Klub -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield class="w-5 h-5 text-ucl-600" />
          <h3 class="text-base font-semibold text-ink-900">1. Informasi Klub</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div class="sm:col-span-6">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Nama Klub *</label>
            <input
              v-model="namaTim"
              type="text"
              placeholder="contoh: Real Madrid Indonesia"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Tag Tim (Maks 3 Huruf) *</label>
            <input
              :value="tagTim"
              @input="handleInputTagTim"
              type="text"
              maxlength="3"
              placeholder="contoh: BAR"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ucl-700 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Logo Klub (File Image)</label>
            <div class="flex items-center gap-2">
              <label class="flex-1 cursor-pointer bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-ink-600 hover:bg-slate-50 transition flex items-center justify-between">
                <span class="truncate">{{ logoUrl ? 'Logo Terpilih' : 'Pilih File Logo...' }}</span>
                <input type="file" accept="image/*" class="hidden" @change="handleUnggahLogo" />
              </label>
              <div v-if="previewLogo" class="w-8 h-8 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                <img :src="previewLogo" alt="Preview" class="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2 & 3: Kapten & Skuad Anggota -->
      <FormSkuadDaftar
        v-model:kaptenNoHp="kaptenNoHp"
        v-model:kaptenGameId="kaptenGameId"
        v-model:kaptenNickname="kaptenNickname"
        v-model:kaptenRole="kaptenRole"
        :daftarAnggota="daftarAnggota"
        @tambahAnggota="tambahAnggota"
        @hapusAnggota="hapusAnggota"
      />

      <!-- Section 4: Pembayaran & WhatsApp -->
      <KotakPembayaranWa
        :biayaPendaftaran="biayaPendaftaran"
        :qrPembayaranUrl="qrPembayaranUrl"
        :kontakPanitiaWa="kontakPanitiaWa"
        :instruksiPembayaran="instruksiPembayaran"
        :namaTim="namaTim"
        :kaptenNickname="kaptenNickname"
      />

      <!-- Tombol Submit -->
      <div class="pt-2">
        <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangKirim" class="w-full text-sm py-3">
          Kirim Pendaftaran Tim Sekarang
        </TombolDasar>
      </div>
    </form>
  </div>
</template>
