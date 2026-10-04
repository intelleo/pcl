<script setup>
import { ref, onMounted } from 'vue'
import { Check, X, User, Phone, Lock, Unlock, QrCode, Upload, CheckCircle2, MessageCircle } from 'lucide-vue-next'
import { api } from '../../lib/api.js'
import { kompresGambar, validasiUkuranGambar } from '../../lib/gambar.js'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  daftarPendaftaran: { type: Array, default: () => [] }
})

const emit = defineEmits(['setujui', 'tolak', 'hapus'])

const filterStatus = ref('semua')
const cariTeks = ref('')
const pendaftaranBuka = ref(true)
const sedangUbahStatus = ref(false)

const panelQRTerbuka = ref(false)
const qrPembayaranUrl = ref('')
const biayaPendaftaran = ref('Rp 50.000 / Tim')
const kontakPanitiaWa = ref('081234567890')
const instruksiPembayaran = ref('Scan QRIS di atas lalu kirimkan foto struk transfer ke nomor WhatsApp panitia.')
const sedangSimpanQR = ref(false)
const pesanSuksesQR = ref(null)

const itemTerpilih = ref(null)
const modalDetailTerbuka = ref(false)

async function muatStatusPendaftaran() {
  try {
    const s = await api.getSettings()
    if (s) {
      if (s.pendaftaran_buka !== undefined) pendaftaranBuka.value = s.pendaftaran_buka === 'true' || s.pendaftaran_buka === true
      if (s.qr_pembayaran_url) qrPembayaranUrl.value = s.qr_pembayaran_url
      if (s.biaya_pendaftaran) biayaPendaftaran.value = s.biaya_pendaftaran
      if (s.kontak_panitia_wa) kontakPanitiaWa.value = s.kontak_panitia_wa
      if (s.instruksi_pembayaran) instruksiPembayaran.value = s.instruksi_pembayaran
    }
  } catch {}
}

async function handleUnggahQR(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const cek = validasiUkuranGambar(file)
  if (!cek.valid) return alert(cek.pesan)
  try {
    qrPembayaranUrl.value = await kompresGambar(file, { maksLebar: 600, maksTinggi: 600 })
  } catch (err) {
    alert('Gagal memproses gambar QR: ' + err.message)
  }
}

async function simpanPengaturanQR() {
  sedangSimpanQR.value = true
  pesanSuksesQR.value = null
  try {
    await Promise.all([
      api.updateSetting('qr_pembayaran_url', qrPembayaranUrl.value.trim() || ''),
      api.updateSetting('biaya_pendaftaran', biayaPendaftaran.value.trim() || ''),
      api.updateSetting('kontak_panitia_wa', kontakPanitiaWa.value.trim() || ''),
      api.updateSetting('instruksi_pembayaran', instruksiPembayaran.value.trim() || '')
    ])
    pesanSuksesQR.value = 'Pengaturan pembayaran & kontak WA berhasil disimpan!'
    setTimeout(() => { pesanSuksesQR.value = null }, 3500)
  } catch (e) {
    alert('Gagal menyimpan pengaturan: ' + e.message)
  } finally {
    sedangSimpanQR.value = false
  }
}

async function toggleStatusPendaftaran() {
  sedangUbahStatus.value = true
  const statusNew = !pendaftaranBuka.value
  try {
    await api.updateSetting('pendaftaran_buka', String(statusNew))
    pendaftaranBuka.value = statusNew
  } catch (e) {
    console.error(e)
  } finally {
    sedangUbahStatus.value = false
  }
}

function formatTanggalDaftar(isoOrDateStr) {
  if (!isoOrDateStr) return '-'
  try {
    const d = new Date(isoOrDateStr)
    if (isNaN(d.getTime())) return String(isoOrDateStr)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '-'
  }
}

function parseCatatan(catatanStr) {
  if (!catatanStr) return null
  try {
    return JSON.parse(catatanStr)
  } catch {
    return null
  }
}

function terapkanStatus(id, status) {
  if (status === 'diterima') emit('setujui', id)
  else if (status === 'ditolak') emit('tolak', id)
}

function bukaDetail(item) {
  itemTerpilih.value = item
  modalDetailTerbuka.value = true
}

onMounted(muatStatusPendaftaran)
</script>

<template>
  <div class="space-y-4">
    <!-- Control Bar Admin Pendaftaran -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
      <div>
        <h3 class="text-xs font-semibold text-ink-900">Pengaturan Akses &amp; Pembayaran Pendaftaran</h3>
        <p class="text-[11px] text-slate-500">Kendalikan status buka/tutup pendaftaran, QRIS, dan kontak WhatsApp panitia.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="panelQRTerbuka = !panelQRTerbuka"
          class="px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border"
          :class="panelQRTerbuka ? 'bg-ucl-50 text-ucl-700 border-ucl-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
        >
          <QrCode class="w-4 h-4 text-ucl-600" />
          <span>{{ panelQRTerbuka ? 'Tutup Pengaturan QR & WA' : 'Setting QR & WA Panitia' }}</span>
        </button>

        <button
          @click="toggleStatusPendaftaran"
          :disabled="sedangUbahStatus"
          class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          :class="pendaftaranBuka ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'"
        >
          <component :is="pendaftaranBuka ? Unlock : Lock" class="w-4 h-4" />
          <span>Status: {{ pendaftaranBuka ? 'Pendaftaran Buka' : 'Pendaftaran Ditutup' }}</span>
        </button>
      </div>
    </div>

    <!-- Panel Konfigurasi QR & WA Pembayaran -->
    <div v-if="panelQRTerbuka" class="bg-white rounded-xl border border-slate-200 p-5 shadow-card space-y-4 anim-muncul">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <QrCode class="w-4 h-4 text-ucl-600" />
          Konfigurasi QRIS &amp; Kontak WhatsApp Konfirmasi
        </h3>
        <span class="text-[11px] text-slate-400">Tampil otomatis di formulir pendaftaran tim</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div class="md:col-span-4 flex flex-col items-center p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div class="w-44 h-44 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-inner relative">
            <img v-if="qrPembayaranUrl" :src="qrPembayaranUrl" alt="QRIS" class="w-full h-full object-contain" loading="lazy" decoding="async" />
            <div v-else class="text-center p-4 text-slate-400 text-xs">
              <QrCode class="w-10 h-10 mx-auto mb-1 opacity-30 text-slate-600" />
              <span>Belum ada foto QR diunggah</span>
            </div>
          </div>

          <label class="w-full cursor-pointer px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-ink-900 hover:bg-slate-100 transition text-center flex items-center justify-center gap-1.5">
            <Upload class="w-3.5 h-3.5 text-ucl-600" />
            <span>{{ qrPembayaranUrl ? 'Ganti Foto QR' : 'Upload Foto QR (QRIS)' }}</span>
            <input type="file" accept="image/*" class="hidden" @change="handleUnggahQR" />
          </label>
        </div>

        <div class="md:col-span-8 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-600 mb-1">Biaya Pendaftaran Turnamen</label>
              <input v-model="biayaPendaftaran" type="text" placeholder="Contoh: Rp 50.000 / Tim" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:border-ucl-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-ink-600 mb-1">Nomor WhatsApp Panitia</label>
              <input v-model="kontakPanitiaWa" type="tel" placeholder="Contoh: 081234567890" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:border-ucl-500 outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1">Instruksi Pembayaran &amp; Rekening</label>
            <textarea v-model="instruksiPembayaran" rows="3" placeholder="Scan QRIS atau transfer rekening..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:border-ucl-500 outline-none"></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1">URL Gambar QR (Opsional link eksternal)</label>
            <input v-model="qrPembayaranUrl" type="text" placeholder="https://contoh.com/qris.png" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:border-ucl-500 outline-none" />
          </div>

          <div class="flex items-center justify-between pt-2">
            <div v-if="pesanSuksesQR" class="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ pesanSuksesQR }}</span>
            </div>
            <span v-else class="text-[11px] text-slate-400">Pengaturan akan langsung aktif di form pendaftaran.</span>

            <TombolDasar @click="simpanPengaturanQR" varian="primer" :sedangMemuat="sedangSimpanQR">
              Simpan Pengaturan
            </TombolDasar>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
      <div class="relative flex-1 max-w-sm">
        <input v-model="cariTeks" type="text" placeholder="Cari klub, manajer, atau kontak..." class="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:bg-white transition-colors" />
      </div>

      <div class="flex items-center gap-1 p-1 rounded-lg bg-slate-100 self-start sm:self-auto shrink-0">
        <button @click="filterStatus = 'semua'" class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer" :class="filterStatus === 'semua' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'">
          Semua ({{ daftarPendaftaran.length }})
        </button>
        <button @click="filterStatus = 'pending'" class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer" :class="filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-ink-900'">
          Pending ({{ daftarPendaftaran.filter(p => p.status === 'pending').length }})
        </button>
        <button @click="filterStatus = 'diterima'" class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer" :class="filterStatus === 'diterima' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-ink-900'">
          Diterima
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6">Klub Pendaftar</th>
              <th class="py-3 px-4 sm:px-6">Manager / Kapten</th>
              <th class="py-3 px-4 sm:px-6 hidden md:table-cell">No. WA / HP</th>
              <th class="py-3 px-4 sm:px-6 hidden lg:table-cell">Tgl Daftar</th>
              <th class="py-3 px-4 sm:px-6 text-center">Status</th>
              <th class="py-3 px-4 sm:px-6 text-right">Aksi Panitia</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="daftarPendaftaran.length === 0">
              <td colspan="6" class="py-12 text-center text-xs text-slate-400">
                Belum ada tim yang mendaftar turnamen.
              </td>
            </tr>

            <tr
              v-for="item in daftarPendaftaran.filter(p => {
                const matchStatus = filterStatus === 'semua' || p.status === filterStatus
                const q = cariTeks.toLowerCase()
                const matchQ = !q || p.nama_tim.toLowerCase().includes(q) || p.manager_name.toLowerCase().includes(q) || p.kontak.includes(q)
                return matchStatus && matchQ
              })"
              :key="item.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <img v-if="parseCatatan(item.catatan)?.logo_url" :src="parseCatatan(item.catatan)?.logo_url" :alt="item.nama_tim" class="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 shrink-0" loading="lazy" decoding="async" />
                  <div v-else class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-semibold text-xs text-navy-800 shrink-0">
                    {{ item.short_name }}
                  </div>
                  <div>
                    <div class="font-semibold text-xs text-ink-900 flex items-center gap-1.5">
                      <span>{{ item.nama_tim }}</span>
                      <span class="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600 font-bold uppercase tracking-wider">{{ item.short_name }}</span>
                    </div>
                    <div class="text-[11px] text-slate-400">Pendaftaran Online</div>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                <div class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ item.manager_name }}</span>
                </div>
              </td>

              <td class="py-3.5 px-4 sm:px-6 hidden md:table-cell text-xs text-slate-600 font-mono font-medium">
                <div class="flex items-center gap-1.5">
                  <Phone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{{ item.kontak }}</span>
                </div>
              </td>

              <td class="py-3.5 px-4 sm:px-6 hidden lg:table-cell text-xs text-slate-500 tabular-nums">
                {{ formatTanggalDaftar(item.created_at || item.tanggal_daftar) }}
              </td>

              <td class="py-3.5 px-4 sm:px-6 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                  :class="{
                    'bg-amber-50 text-amber-700 border-amber-200': item.status === 'pending',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': item.status === 'diterima',
                    'bg-red-50 text-red-700 border-red-200': item.status === 'ditolak'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="py-3.5 px-4 sm:px-6 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="bukaDetail(item)" class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-ink-900 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-semibold" title="Lihat Rincian Skuad">
                    Skuad
                  </button>
                  <button v-if="item.status !== 'diterima'" @click="terapkanStatus(item.id, 'diterima')" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer" title="Terima Klub">
                    <Check class="w-4 h-4" />
                  </button>
                  <button v-if="item.status !== 'ditolak'" @click="terapkanStatus(item.id, 'ditolak')" class="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer" title="Tolak Pendaftaran">
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detail Skuad Pendaftar -->
    <div v-if="modalDetailTerbuka && itemTerpilih" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-lift max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto anim-muncul">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-semibold text-ink-900">{{ itemTerpilih.nama_tim }} ({{ itemTerpilih.short_name }})</h3>
            <p class="text-xs text-slate-500">Rincian Data Pendaftaran Skuad</p>
          </div>
          <button @click="modalDetailTerbuka = false" class="p-1 rounded-lg text-slate-400 hover:text-ink-900 hover:bg-slate-100 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Info Kapten & Pendaftaran -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span class="font-semibold text-ucl-700 uppercase tracking-wider text-[10px] block">Data Pendaftaran &amp; Kapten</span>
            <div class="flex items-center justify-between text-ink-900">
              <span class="font-medium text-slate-500">Waktu Daftar:</span>
              <span class="font-semibold font-mono">{{ formatTanggalDaftar(itemTerpilih.created_at || itemTerpilih.tanggal_daftar) }}</span>
            </div>
            <div class="flex items-center justify-between text-ink-900">
              <span class="font-medium text-slate-500">Nickname Kapten:</span>
              <span class="font-semibold">{{ itemTerpilih.manager_name }}</span>
            </div>
            <div class="flex items-center justify-between text-ink-900">
              <span class="font-medium text-slate-500">No. WA / HP:</span>
              <span class="font-semibold font-mono">{{ itemTerpilih.kontak }}</span>
            </div>
            <div v-if="parseCatatan(itemTerpilih.catatan)?.kapten" class="flex items-center justify-between text-ink-900">
              <span class="font-medium text-slate-500">ID Game Kapten:</span>
              <span class="font-semibold">{{ parseCatatan(itemTerpilih.catatan)?.kapten?.game_id || '-' }}</span>
            </div>
            <div v-if="parseCatatan(itemTerpilih.catatan)?.kapten" class="flex items-center justify-between text-ink-900">
              <span class="font-medium text-slate-500">Role Kapten:</span>
              <span class="px-2 py-0.5 rounded bg-ucl-50 text-ucl-700 font-bold text-[10px]">{{ parseCatatan(itemTerpilih.catatan)?.kapten?.role || 'CM' }}</span>
            </div>
          </div>

          <!-- Daftar Anggota Skuad -->
          <div class="space-y-2">
            <span class="font-semibold text-ink-900 block">Daftar Pemain Skuad</span>
            <div v-if="!parseCatatan(itemTerpilih.catatan)?.anggota || parseCatatan(itemTerpilih.catatan)?.anggota?.length === 0" class="text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
              Tidak ada anggota skuad tambahan.
            </div>
            <div v-else class="space-y-1.5">
              <div v-for="(p, i) in parseCatatan(itemTerpilih.catatan)?.anggota" :key="i" class="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">{{ i + 1 }}</span>
                  <div>
                    <div class="font-semibold text-ink-900">{{ p.nickname || p.name || p.game_id || 'Pemain' }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">ID: {{ p.game_id || '-' }}</div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">{{ p.role || 'CM' }}</span>
              </div>
            </div>
          </div>

          <!-- Info Bukti Transfer WA -->
          <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800">
            <MessageCircle class="w-5 h-5 shrink-0 text-emerald-600" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold block">Konfirmasi Bukti Transfer via WhatsApp:</span>
              <span>Pendaftar diarahkan untuk mengirimkan bukti transfer struk pembayaran langsung ke nomor WhatsApp Panitia.</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end">
          <button @click="modalDetailTerbuka = false" class="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
