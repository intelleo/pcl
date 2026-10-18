<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../lib/api.js'
import { unduhGambar } from '../../lib/gambar.js'
import TombolDasar from '../umum/TombolDasar.vue'
import ModalDialog from '../umum/ModalDialog.vue'
import {
  Camera, Users, Key, Download, Check, X, Trash2, Eye,
  RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Copy, Shield
} from 'lucide-vue-next'

const props = defineProps({
  daftarTim: { type: Array, default: () => [] }
})

// Sub-tab: 'recaps' (Daftar Bukti Match) | 'accounts' (Kelola Akun Tim)
const subTab = ref('recaps')

// === STATE RECAPS ===
const daftarRecap = ref([])
const sedangMuatRecap = ref(false)
const filterStatus = ref('semua') // 'semua' | 'pending' | 'verified' | 'rejected'
const cariTeks = ref('')

// Modal Zoom Screenshot
const modalZoomTerbuka = ref(false)
const gambarZoom = ref('')
const judulZoom = ref('')
const sedangUnduh = ref(false)

function bukaZoom(url, judul) {
  gambarZoom.value = url
  judulZoom.value = judul
  modalZoomTerbuka.value = true
}

async function handleUnduh(url, namaBerkas) {
  sedangUnduh.value = true
  try {
    await unduhGambar(url, namaBerkas)
  } catch (err) {
    alert(`Gagal mengunduh gambar: ${err.message}`)
  } finally {
    sedangUnduh.value = false
  }
}

async function muatDaftarRecap() {
  sedangMuatRecap.value = true
  try {
    daftarRecap.value = await api.getRecaps() || []
  } catch (err) {
    console.error('Gagal memuat daftar recap:', err)
  } finally {
    sedangMuatRecap.value = false
  }
}

async function ubahStatusRecap(id, status) {
  try {
    await api.updateStatusRecap(id, status)
    const idx = daftarRecap.value.findIndex(r => r.id === id)
    if (idx !== -1) daftarRecap.value[idx].status = status
  } catch (err) {
    alert(`Gagal mengubah status: ${err.message}`)
  }
}

async function hapusRecap(id) {
  if (!confirm('Yakin ingin menghapus bukti match ini? File di disk server juga akan dihapus.')) return
  try {
    await api.hapusRecap(id)
    daftarRecap.value = daftarRecap.value.filter(r => r.id !== id)
  } catch (err) {
    alert(`Gagal menghapus: ${err.message}`)
  }
}

const recapTerfilter = computed(() => {
  return daftarRecap.value.filter(r => {
    const matchStatus = filterStatus.value === 'semua' || r.status === filterStatus.value
    const q = cariTeks.value.toLowerCase()
    const matchQ = !q ||
      r.team_name?.toLowerCase().includes(q) ||
      r.home_team_name?.toLowerCase().includes(q) ||
      r.away_team_name?.toLowerCase().includes(q)
    return matchStatus && matchQ
  })
})

// === STATE AKUN TIM (GENERATOR & MANAGEMENT) ===
const daftarAkun = ref([])
const sedangMuatAkun = ref(false)
const sedangGenerate = ref(false)
const modalKredensialTerbuka = ref(false)
const kredensialBaru = ref(null)
const pesanSuksesAkun = ref(null)

async function muatDaftarAkun() {
  sedangMuatAkun.value = true
  try {
    daftarAkun.value = await api.daftarAkunTim() || []
  } catch (err) {
    console.error('Gagal memuat akun tim:', err)
  } finally {
    sedangMuatAkun.value = false
  }
}

async function generateAkun(teamId) {
  sedangGenerate.value = true
  try {
    const res = await api.generateAkunTim(teamId)
    kredensialBaru.value = res
    modalKredensialTerbuka.value = true
    await muatDaftarAkun()
  } catch (err) {
    alert(`Gagal membuat akun: ${err.message}`)
  } finally {
    sedangGenerate.value = false
  }
}

async function resetPassword(id) {
  if (!confirm('Reset password untuk akun tim ini? Password baru akan digenerate secara acak.')) return
  try {
    const res = await api.resetPasswordTim(id)
    kredensialBaru.value = res
    modalKredensialTerbuka.value = true
  } catch (err) {
    alert(`Gagal reset password: ${err.message}`)
  }
}

async function hapusAkun(id) {
  if (!confirm('Yakin ingin menghapus akun tim ini? Kapten tidak akan bisa login lagi.')) return
  try {
    await api.hapusAkunTim(id)
    daftarAkun.value = daftarAkun.value.filter(a => a.id !== id)
  } catch (err) {
    alert(`Gagal menghapus akun: ${err.message}`)
  }
}

function timPunyaAkun(teamId) {
  return daftarAkun.value.some(a => a.team_id === teamId)
}

function akunDariTim(teamId) {
  return daftarAkun.value.find(a => a.team_id === teamId)
}

function salinKredensial() {
  if (!kredensialBaru.value) return
  const teks = `*AKUN LOGIN PORTAL MATCH PCL*\nTim: ${kredensialBaru.value.team_name}\nUsername: ${kredensialBaru.value.username}\nPassword: ${kredensialBaru.value.password}\nLink: https://pcl.web.id/lapor-match`
  navigator.clipboard.writeText(teks)
  pesanSuksesAkun.value = 'Kredensial berhasil disalin ke clipboard!'
  setTimeout(() => { pesanSuksesAkun.value = null }, 2500)
}

onMounted(() => {
  muatDaftarRecap()
  muatDaftarAkun()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Sub-tab Selector -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-card">
      <div class="grid grid-cols-2 sm:flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
        <button
          type="button"
          @click="subTab = 'recaps'"
          class="px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          :class="subTab === 'recaps' ? 'bg-white text-ucl-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          <Camera class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Bukti Match ({{ daftarRecap.length }})</span>
        </button>
        <button
          type="button"
          @click="subTab = 'accounts'"
          class="px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          :class="subTab === 'accounts' ? 'bg-white text-ucl-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          <Key class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Akun Tim ({{ daftarAkun.length }})</span>
        </button>
      </div>

      <button
        type="button"
        @click="subTab === 'recaps' ? muatDaftarRecap() : muatDaftarAkun()"
        class="self-end sm:self-auto p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-ucl-600 hover:bg-slate-100 transition-colors cursor-pointer"
        title="Muat Ulang"
      >
        <RefreshCw class="w-4 h-4" />
      </button>
    </div>

    <!-- ================= SUB-TAB 1: DAFTAR RECAP MATCH ================= -->
    <div v-if="subTab === 'recaps'" class="space-y-4">
      <!-- Toolbar Filter & Search -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-card">
        <div class="relative flex-1">
          <input
            v-model="cariTeks"
            type="text"
            placeholder="Cari nama tim atau lawan..."
            class="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:bg-white"
          />
        </div>

        <div class="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-lg bg-slate-100 shrink-0 text-center">
          <button
            @click="filterStatus = 'semua'"
            class="px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
            :class="filterStatus === 'semua' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            Semua ({{ daftarRecap.length }})
          </button>
          <button
            @click="filterStatus = 'pending'"
            class="px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
            :class="filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            Pending ({{ daftarRecap.filter(r => r.status === 'pending').length }})
          </button>
          <button
            @click="filterStatus = 'verified'"
            class="px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
            :class="filterStatus === 'verified' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            Diverifikasi
          </button>
        </div>
      </div>

      <!-- Tabel Bukti Screenshot Recap Match -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th class="py-3 px-4">Pengirim</th>
                <th class="py-3 px-4">Pertandingan</th>
                <th class="py-3 px-4 text-center">Screenshot Recap</th>
                <th class="py-3 px-4 text-center">Screenshot Kiper</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="recapTerfilter.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  Belum ada screenshot match yang dilaporkan.
                </td>
              </tr>

              <tr v-for="r in recapTerfilter" :key="r.id" class="hover:bg-slate-50 transition-colors">
                <!-- Pengirim -->
                <td class="py-3 px-4 font-semibold text-ink-900">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="r.team_logo"
                      :src="r.team_logo"
                      :alt="r.team_name"
                      class="w-6 h-6 rounded object-contain bg-white border border-slate-200 p-0.5"
                    />
                    <div>
                      <div class="font-bold">{{ r.team_name }}</div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        {{ new Date(r.created_at).toLocaleDateString('id-ID') }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Pertandingan -->
                <td class="py-3 px-4 text-slate-700">
                  <div class="font-semibold">{{ r.home_team_name }} vs {{ r.away_team_name }}</div>
                  <div class="text-[11px] text-slate-500 font-mono">
                    Skor: {{ r.home_score }} - {{ r.away_score }} ({{ r.stage?.toUpperCase() }})
                  </div>
                  <div v-if="r.catatan" class="text-[11px] text-amber-700 italic mt-0.5 max-w-xs truncate" :title="r.catatan">
                    "{{ r.catatan }}"
                  </div>
                </td>

                <!-- Screenshot Recap -->
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      @click="bukaZoom(r.recap_image_url, `Recap: ${r.home_team_name} vs ${r.away_team_name}`)"
                      class="relative group rounded-lg overflow-hidden border border-slate-200 cursor-pointer"
                      title="Lihat Pratinjau Besar"
                    >
                      <img :src="r.recap_image_url" alt="Recap" class="w-12 h-12 object-cover group-hover:scale-105 transition-transform" />
                      <span class="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye class="w-3.5 h-3.5" />
                      </span>
                    </button>
                    <button
                      type="button"
                      @click="handleUnduh(r.recap_image_url, `recap-${r.home_team_short}-vs-${r.away_team_short}.jpg`)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-ucl-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Download Gambar"
                    >
                      <Download class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                <!-- Screenshot Kiper -->
                <td class="py-3 px-4 text-center">
                  <div v-if="r.gk_stats_image_url" class="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      @click="bukaZoom(r.gk_stats_image_url, `Kiper: ${r.home_team_name} vs ${r.away_team_name}`)"
                      class="relative group rounded-lg overflow-hidden border border-slate-200 cursor-pointer"
                      title="Lihat Pratinjau Besar"
                    >
                      <img :src="r.gk_stats_image_url" alt="Kiper" class="w-12 h-12 object-cover group-hover:scale-105 transition-transform" />
                      <span class="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye class="w-3.5 h-3.5" />
                      </span>
                    </button>
                    <button
                      type="button"
                      @click="handleUnduh(r.gk_stats_image_url, `kiper-${r.home_team_short}-vs-${r.away_team_short}.jpg`)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-ucl-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Download Gambar"
                    >
                      <Download class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span v-else class="text-slate-400 text-[11px]">-</span>
                </td>

                <!-- Status -->
                <td class="py-3 px-4 text-center">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    :class="{
                      'bg-amber-50 text-amber-700 border-amber-200': r.status === 'pending',
                      'bg-emerald-50 text-emerald-700 border-emerald-200': r.status === 'verified',
                      'bg-red-50 text-red-700 border-red-200': r.status === 'rejected'
                    }"
                  >
                    {{ r.status }}
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                  <button
                    v-if="r.status !== 'verified'"
                    type="button"
                    @click="ubahStatusRecap(r.id, 'verified')"
                    class="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title="Verifikasi Bukti Match"
                  >
                    <Check class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-if="r.status !== 'rejected'"
                    type="button"
                    @click="ubahStatusRecap(r.id, 'rejected')"
                    class="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    title="Tolak Bukti Match"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="hapusRecap(r.id)"
                    class="p-1.5 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= SUB-TAB 2: KELOLA AKUN TIM ================= -->
    <div v-else class="space-y-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <h3 class="text-xs font-bold text-ink-900 mb-1">Manajemen Akun Login Tim Peserta</h3>
        <p class="text-[11px] text-slate-500">
          Buat dan kelola akun kapten untuk login di portal <code class="px-1.5 py-0.5 bg-slate-100 rounded text-ucl-700 font-mono">/lapor-match</code>.
        </p>
      </div>

      <!-- 1. Tampilan Kartu Akun Tim Mobile (< sm) -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="t in daftarTim"
          :key="`card-acc-${t.id}`"
          class="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-card"
        >
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2 min-w-0">
              <img
                v-if="t.logo_url"
                :src="t.logo_url"
                :alt="t.name"
                class="w-7 h-7 rounded object-contain bg-white border border-slate-200 p-0.5 shrink-0"
              />
              <div class="min-w-0">
                <div class="font-bold text-xs text-ink-900 truncate">{{ t.name }}</div>
                <div class="text-[10px] font-mono font-bold text-slate-500 uppercase">{{ t.short_name }}</div>
              </div>
            </div>

            <span
              v-if="timPunyaAkun(t.id)"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0"
            >
              Aktif
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500 shrink-0"
            >
              Belum Ada
            </span>
          </div>

          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 text-[11px]">Username Login:</span>
            <span v-if="timPunyaAkun(t.id)" class="px-2 py-0.5 rounded bg-slate-100 text-ucl-700 font-mono font-bold text-xs">
              {{ akunDariTim(t.id)?.username }}
            </span>
            <span v-else class="text-slate-400 italic text-[11px]">Belum dibuat</span>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
            <button
              v-if="!timPunyaAkun(t.id)"
              type="button"
              @click="generateAkun(t.id)"
              :disabled="sedangGenerate"
              class="w-full py-1.5 px-3 rounded-lg bg-ucl-600 text-white hover:bg-ucl-700 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Key class="w-3.5 h-3.5" />
              <span>Generate Akun Tim</span>
            </button>

            <template v-else>
              <button
                type="button"
                @click="resetPassword(akunDariTim(t.id).id)"
                class="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Reset Password
              </button>
              <button
                type="button"
                @click="hapusAkun(akunDariTim(t.id).id)"
                class="py-1.5 px-3 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                title="Hapus Akun"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- 2. Tabel Akun Tim Desktop (>= sm) -->
      <div class="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th class="py-3 px-4">Klub Peserta</th>
                <th class="py-3 px-4">Tag</th>
                <th class="py-3 px-4">Username Login</th>
                <th class="py-3 px-4 text-center">Status Akun</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="t in daftarTim" :key="t.id" class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 font-semibold text-ink-900">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="t.logo_url"
                      :src="t.logo_url"
                      :alt="t.name"
                      class="w-6 h-6 rounded object-contain bg-white border border-slate-200 p-0.5"
                    />
                    <span>{{ t.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono font-bold text-slate-600">{{ t.short_name }}</td>
                <td class="py-3 px-4 font-mono text-xs">
                  <span v-if="timPunyaAkun(t.id)" class="px-2 py-0.5 rounded bg-slate-100 text-ucl-700 font-semibold">
                    {{ akunDariTim(t.id)?.username }}
                  </span>
                  <span v-else class="text-slate-400 italic">Belum dibuat</span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    v-if="timPunyaAkun(t.id)"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    Aktif
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500"
                  >
                    Belum Ada
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    v-if="!timPunyaAkun(t.id)"
                    type="button"
                    @click="generateAkun(t.id)"
                    :disabled="sedangGenerate"
                    class="px-2.5 py-1 rounded bg-ucl-600 text-white hover:bg-ucl-700 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                  >
                    <Key class="w-3.5 h-3.5" />
                    <span>Generate Akun</span>
                  </button>

                  <template v-else>
                    <button
                      type="button"
                      @click="resetPassword(akunDariTim(t.id).id)"
                      class="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer"
                      title="Reset Password"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      @click="hapusAkun(akunDariTim(t.id).id)"
                      class="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Hapus Akun"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Zoom Screenshot -->
    <ModalDialog
      :terbuka="modalZoomTerbuka"
      @tutup="modalZoomTerbuka = false"
      :judul="judulZoom"
      lebarMaksimal="max-w-4xl"
    >
      <div class="space-y-4">
        <div class="bg-black/90 rounded-xl overflow-hidden flex items-center justify-center p-2 max-h-[70vh]">
          <img :src="gambarZoom" :alt="judulZoom" class="max-w-full max-h-[65vh] object-contain" />
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <a
            :href="gambarZoom"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            <span>Buka Tab Baru</span>
          </a>
          <TombolDasar
            varian="primer"
            :sedangMemuat="sedangUnduh"
            @click="handleUnduh(gambarZoom, 'screenshot-match.jpg')"
          >
            <Download class="w-4 h-4 mr-1.5" />
            <span>Download Gambar</span>
          </TombolDasar>
        </div>
      </div>
    </ModalDialog>

    <!-- Modal Tampilkan Kredensial Baru -->
    <ModalDialog
      :terbuka="modalKredensialTerbuka"
      @tutup="modalKredensialTerbuka = false"
      judul="Akun Login Tim Berhasil Dibuat"
      lebarMaksimal="max-w-md"
    >
      <div v-if="kredensialBaru" class="space-y-4 text-xs">
        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
          <p class="font-bold flex items-center gap-1.5">
            <CheckCircle2 class="w-4 h-4 text-emerald-600" />
            <span>Kredensial Login Kapten Tim</span>
          </p>
          <p class="text-[11px] text-emerald-700">
            Salin informasi di bawah dan kirimkan ke kapten tim melalui WhatsApp.
          </p>
        </div>

        <div v-if="pesanSuksesAkun" class="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <Check class="w-4 h-4" />
          <span>{{ pesanSuksesAkun }}</span>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Nama Tim:</span>
            <span class="font-bold text-ink-900">{{ kredensialBaru.team_name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Username:</span>
            <span class="font-mono font-bold text-ucl-700 bg-white px-2 py-0.5 rounded border border-slate-200">{{ kredensialBaru.username }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Password Baru:</span>
            <span class="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-sm tracking-wider">{{ kredensialBaru.password }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Link Portal:</span>
            <span class="font-mono text-slate-700 text-[11px]">https://pcl.web.id/lapor-match</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="salinKredensial"
            class="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Copy class="w-3.5 h-3.5" />
            <span>Salin Format WA</span>
          </button>
          <button
            type="button"
            @click="modalKredensialTerbuka = false"
            class="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>
