<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../lib/api.js'
import { Dices, Shield, RefreshCw, Check, Sparkles, AlertCircle, RotateCcw, AlertTriangle, Calendar, Clock, Hourglass, ChevronDown } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'
import ModalDialog from '../umum/ModalDialog.vue'

const props = defineProps({
  daftarTim: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['terapkanHasilDrawing', 'resetDrawingTotal'])

// Season Selector
const daftarSeason = ref([])
const seasonTerpilihId = ref(null)

async function muatDaftarSeason() {
  try {
    const data = await api.getTournaments()
    daftarSeason.value = data || []
    const aktif = (data || []).find((s) => s.status !== 'completed')
    seasonTerpilihId.value = aktif?.id || (data || [])[0]?.id || null
  } catch {
    daftarSeason.value = []
  }
}

onMounted(muatDaftarSeason)

const timTerfilter = computed(() => {
  if (!seasonTerpilihId.value) return props.daftarTim
  return props.daftarTim.filter((t) => t.tournament_id === seasonTerpilihId.value)
})

// Opsi Pot / Grup
const jumlahGrup = ref(4) // Default: 4 grup (A, B, C, D)
const hasilDrawing = ref({
  'Grup A': [],
  'Grup B': [],
  'Grup C': [],
  'Grup D': []
})

// Pengaturan Jadwal Sama Hari & Interval
const tanggalMulai = ref(new Date().toISOString().slice(0, 10))
const jamMulai = ref('19:00')
const jedaMenit = ref(15)

const sedangDrawing = ref(false)
const sudahDrawing = ref(false)
const sedangMenyimpan = ref(false)
const modalKonfirmasiReset = ref(false)
const pesanSukses = ref(null)
const pesanError = ref(null)

const estimasiJadwal = computed(() => {
  let totalLaga = 0
  const maxMd = 3
  Object.values(hasilDrawing.value).forEach(timList => {
    const n = timList.length
    if (n === 4) totalLaga += 6
    else if (n >= 2) totalLaga += (n * (n - 1)) / 2
  })
  if (totalLaga === 0) return null

  const jeda = Number(jedaMenit.value) || 15
  const [h, m] = (jamMulai.value || '19:00').split(':').map(Number)
  const pad = (v) => String(v).padStart(2, '0')

  const getTimeStr = (mdIndex) => {
    const d = new Date()
    d.setHours(isNaN(h) ? 19 : h, isNaN(m) ? 0 : m, 0, 0)
    const target = new Date(d.getTime() + (mdIndex * jeda * 60 * 1000))
    return `${pad(target.getHours())}:${pad(target.getMinutes())}`
  }

  return {
    totalLaga,
    maxMd,
    md1: getTimeStr(0),
    md2: getTimeStr(1),
    md3: getTimeStr(2)
  }
})

defineExpose({ sedangMenyimpan, pesanSukses, pesanError, resetDrawing })

function acakArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function jalankanDrawingOtomatis() {
  sedangDrawing.value = true
  sudahDrawing.value = false

  setTimeout(() => {
    const timTerkocok = acakArray(timTerfilter.value)
    const grupList = ['Grup A', 'Grup B', 'Grup C', 'Grup D'].slice(0, jumlahGrup.value)

    const grupBaru = {}
    grupList.forEach(g => { grupBaru[g] = [] })

    timTerkocok.forEach((tim, idx) => {
      const namaGrup = grupList[idx % grupList.length]
      grupBaru[namaGrup].push({ ...tim, group_name: namaGrup })
    })

    hasilDrawing.value = grupBaru
    sedangDrawing.value = false
    sudahDrawing.value = true
  }, 600)
}

function resetDrawing() {
  hasilDrawing.value = {
    'Grup A': [],
    'Grup B': [],
    'Grup C': [],
    'Grup D': []
  }
  sudahDrawing.value = false
  pesanSukses.value = null
}

function simpanKeTurnamen() {
  sedangMenyimpan.value = true
  pesanSukses.value = null
  pesanError.value = null
  emit('terapkanHasilDrawing', {
    pembagianGrup: hasilDrawing.value,
    customTournamentId: seasonTerpilihId.value,
    tanggalMulai: tanggalMulai.value,
    jamMulai: jamMulai.value,
    jedaMenit: Number(jedaMenit.value) || 15
  })
}

function konfirmasiResetTotal() {
  modalKonfirmasiReset.value = true
}

function eksekusiResetTotal() {
  modalKonfirmasiReset.value = false
  resetDrawing()
  emit('resetDrawingTotal')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Drawing Control Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 class="text-base font-semibold text-ink-900 flex items-center gap-2">
            <Dices class="w-5 h-5 text-ucl-600" />
            Drawing &amp; Pengundian Grup Otomatis
          </h3>
          <p class="text-xs text-slate-500 mt-1">
            Kocok dan bagi {{ timTerfilter.length }} klub peserta di musim ini ke dalam 2 atau 4 grup turnamen secara acak.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <!-- Season Picker -->
          <div v-if="daftarSeason.length > 0" class="relative">
            <select
              v-model="seasonTerpilihId"
              class="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-ink-900 cursor-pointer hover:border-ucl-400 focus:border-ucl-500 outline-none transition-colors"
            >
              <option v-for="s in daftarSeason" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.season }})
              </option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            @click="konfirmasiResetTotal"
            class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Hapus seluruh hasil drawing, jadwal pertandingan, dan klasemen di database"
          >
            <RotateCcw class="w-3.5 h-3.5 text-red-600" />
            Reset Drawing DB
          </button>

          <button
            type="button"
            @click="resetDrawing"
            v-if="sudahDrawing"
            class="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            Batal Pratinjau
          </button>

          <TombolDasar
            @click="jalankanDrawingOtomatis"
            varian="primer"
            :sedangMemuat="sedangDrawing"
            class="flex items-center gap-1.5"
          >
            <Dices class="w-4 h-4" />
            Kocok Drawing Sekarang
          </TombolDasar>
        </div>
      </div>

      <!-- Setting Bar & Pilihan Grup -->
      <div class="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div class="flex items-center gap-3">
          <span class="font-semibold text-slate-600">Format Grup:</span>
          <div class="inline-flex p-1 rounded-lg bg-slate-100">
            <button
              type="button"
              @click="jumlahGrup = 2"
              class="px-3 py-1 rounded-md font-semibold transition-all cursor-pointer"
              :class="jumlahGrup === 2 ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
            >
              2 Grup (A &amp; B)
            </button>
            <button
              type="button"
              @click="jumlahGrup = 4"
              class="px-3 py-1 rounded-md font-semibold transition-all cursor-pointer"
              :class="jumlahGrup === 4 ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
            >
              4 Grup (A, B, C, D)
            </button>
          </div>
        </div>
      </div>

      <!-- Pengaturan Waktu & Interval Pertandingan -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-ucl-600" />
            Tanggal Pertandingan
          </label>
          <input
            type="date"
            v-model="tanggalMulai"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-ucl-600" />
            Kick-off Perdana
          </label>
          <input
            type="time"
            v-model="jamMulai"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Hourglass class="w-3.5 h-3.5 text-ucl-600" />
            Jeda Antar Matchday (Menit)
          </label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              min="5"
              max="60"
              step="5"
              v-model.number="jedaMenit"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            />
            <span class="text-xs font-medium text-slate-500 shrink-0">Menit</span>
          </div>
        </div>
      </div>

      <!-- Estimasi Ringkasan Jadwal -->
      <div
        v-if="estimasiJadwal"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-3.5 py-2 rounded-lg bg-blue-50/80 border border-blue-200/80 text-blue-900"
      >
        <span class="font-semibold flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-blue-600 shrink-0" />
          Estimasi Jadwal (Serentak per Matchday):
        </span>
        <span class="font-medium text-blue-800">
          {{ estimasiJadwal.totalLaga }} Laga (3 Matchday) • MD 1 ({{ estimasiJadwal.md1 }} WIB), MD 2 ({{ estimasiJadwal.md2 }} WIB), MD 3 ({{ estimasiJadwal.md3 }} WIB)
        </span>
      </div>
    </div>

    <!-- Hasil Drawing Preview (Grid Grup) -->
    <div v-if="sudahDrawing" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-gold-500" />
          Hasil Drawing Grup
        </h4>
        <button
          @click="simpanKeTurnamen"
          :disabled="sedangMenyimpan"
          class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw v-if="sedangMenyimpan" class="w-4 h-4 animate-spin" />
          <Check v-else class="w-4 h-4" />
          {{ sedangMenyimpan ? 'Menyimpan & Generate Jadwal...' : 'Terapkan Pembagian Grup Ini' }}
        </button>
      </div>

      <!-- Alert Sukses Toast Banner -->
      <div
        v-if="pesanSukses"
        class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm"
      >
        <Check class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{{ pesanSukses }}</span>
      </div>

      <!-- Alert Error Toast Banner -->
      <div
        v-if="pesanError"
        class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm"
      >
        <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
        <span>{{ pesanError }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(timList, grupName) in hasilDrawing"
          :key="grupName"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card"
        >
          <div class="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span class="font-semibold text-xs text-ink-900 flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-ucl-600" />
              {{ grupName }}
            </span>
            <span class="text-[11px] font-semibold text-slate-500 tabular-nums">
              {{ timList.length }} Klub
            </span>
          </div>

          <div class="divide-y divide-slate-100 p-2">
            <div
              v-for="(t, idx) in timList"
              :key="t.id || idx"
              class="p-2 rounded-lg flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold flex items-center justify-center tabular-nums shrink-0">
                  {{ idx + 1 }}
                </span>
                <img
                  v-if="t.logo_url"
                  :src="t.logo_url"
                  :alt="t.name"
                  class="w-7 h-7 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                />
                <span
                  v-else
                  class="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 font-display font-bold text-[9px] flex items-center justify-center text-navy-800 tracking-wider shrink-0"
                >
                  {{ t.short_name }}
                </span>
                <div class="truncate text-xs font-semibold text-ink-900">
                  {{ t.name }}
                </div>
              </div>
              <span class="text-[11px] text-slate-400 tabular-nums shrink-0 font-medium">
                {{ t.short_name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Reset Drawing DB -->
    <ModalDialog
      :terbuka="modalKonfirmasiReset"
      judul="Konfirmasi Reset Drawing Turnamen"
      @tutup="modalKonfirmasiReset = false"
    >
      <div class="space-y-4">
        <div class="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div class="space-y-1 text-xs text-red-800">
            <p class="font-bold">Peringatan: Tindakan ini tidak dapat dibatalkan!</p>
            <p>
              Semua jadwal pertandingan babak grup &amp; knockout, event gol, hasil klasemen grup, dan pembagian grup pada database akan dihapus total. Status turnamen akan kembali ke awal.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <TombolDasar
            varian="sekunder"
            @click="modalKonfirmasiReset = false"
            class="justify-center"
          >
            Batal
          </TombolDasar>
          <button
            type="button"
            @click="eksekusiResetTotal"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Ya, Reset &amp; Hapus Semua Drawing
          </button>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>
