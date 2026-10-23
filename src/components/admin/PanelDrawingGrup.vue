<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '../../lib/api.js'
import { Dices, Shield, RefreshCw, Check, Sparkles, AlertCircle, RotateCcw, AlertTriangle, Calendar, Clock, Hourglass, ChevronDown, FastForward, Maximize2, Minimize2 } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'
import ModalDialog from '../umum/ModalDialog.vue'
import RouletteDrawingGrup from './RouletteDrawingGrup.vue'
import GridHasilDrawingGrup from './GridHasilDrawingGrup.vue'
import FloatingActionBarDrawing from './FloatingActionBarDrawing.vue'
import FullscreenStageDrawingGrup from './FullscreenStageDrawingGrup.vue'
import { useEstimasiJadwal } from '../../composables/useEstimasiJadwal.js'

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

// State Animasi Spin Drawing
const sedangDrawing = ref(false)
const sudahDrawing = ref(false)
const sedangMenyimpan = ref(false)
const modalKonfirmasiReset = ref(false)
const pesanSukses = ref(null)
const pesanError = ref(null)

// Detail Animasi Roulette / Spin
const timTersedia = ref([])
const timSedangSpin = ref(null)
const targetGrupAktif = ref('')
const slotTargetAktif = ref(1)
const totalSlotDibutuhkan = ref(0)
const slotTerisiCount = ref(0)
const statusSpin = ref('siap') // 'siap' | 'spinning' | 'terpilih' | 'selesai'

let timerIntervalSpin = null
let timerTimeoutStep = null

function bersihkanTimerSpin() {
  if (timerIntervalSpin) {
    clearInterval(timerIntervalSpin)
    timerIntervalSpin = null
  }
  if (timerTimeoutStep) {
    clearTimeout(timerTimeoutStep)
    timerTimeoutStep = null
  }
}

// Mode Fullscreen / Layar Penuh Eksklusif
const modeFullscreen = ref(false)

function toggleFullscreen() {
  modeFullscreen.value = !modeFullscreen.value
}

function tanganiKeydown(e) {
  if (e.key === 'Escape' && modeFullscreen.value) {
    modeFullscreen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', tanganiKeydown)
})

onUnmounted(() => {
  bersihkanTimerSpin()
  window.removeEventListener('keydown', tanganiKeydown)
})

const estimasiJadwal = useEstimasiJadwal(hasilDrawing, jamMulai, jedaMenit)

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
  const pool = [...timTerfilter.value]
  if (pool.length === 0) return

  bersihkanTimerSpin()
  sedangDrawing.value = true
  sudahDrawing.value = false
  statusSpin.value = 'spinning'

  const grupList = ['Grup A', 'Grup B', 'Grup C', 'Grup D'].slice(0, jumlahGrup.value)
  const grupBaru = {}
  grupList.forEach(g => { grupBaru[g] = [] })
  hasilDrawing.value = grupBaru

  const antreanAcak = acakArray(pool)
  timTersedia.value = [...antreanAcak]
  totalSlotDibutuhkan.value = pool.length
  slotTerisiCount.value = 0

  let indexUrutan = 0

  function prosesSatuTim() {
    if (indexUrutan >= antreanAcak.length) {
      bersihkanTimerSpin()
      sedangDrawing.value = false
      sudahDrawing.value = true
      statusSpin.value = 'selesai'
      timSedangSpin.value = null
      targetGrupAktif.value = ''
      return
    }

    const timTerpilih = antreanAcak[indexUrutan]
    const namaGrupTarget = grupList[indexUrutan % grupList.length]
    targetGrupAktif.value = namaGrupTarget
    slotTargetAktif.value = Math.floor(indexUrutan / grupList.length) + 1
    statusSpin.value = 'spinning'

    // Efek spin berputar acak selama 700ms
    const startTime = Date.now()
    const durasiSpin = 700

    timerIntervalSpin = setInterval(() => {
      if (timTersedia.value.length > 0) {
        const randomIndex = Math.floor(Math.random() * timTersedia.value.length)
        timSedangSpin.value = timTersedia.value[randomIndex]
      }
    }, 60)

    timerTimeoutStep = setTimeout(() => {
      clearInterval(timerIntervalSpin)
      timerIntervalSpin = null

      // Kunci tim terpilih
      timSedangSpin.value = timTerpilih
      statusSpin.value = 'terpilih'

      // Masukkan ke grup
      hasilDrawing.value[namaGrupTarget].push({ ...timTerpilih, group_name: namaGrupTarget })
      slotTerisiCount.value++

      // Hapus dari sisa tim
      timTersedia.value = timTersedia.value.filter(t => t.id !== timTerpilih.id)

      indexUrutan++

      // Jeda 450ms untuk melihat hasil terkunci sebelum tim berikutnya
      timerTimeoutStep = setTimeout(() => {
        prosesSatuTim()
      }, 450)
    }, durasiSpin)
  }

  prosesSatuTim()
}

function lewatiAnimasiSpin() {
  bersihkanTimerSpin()
  const pool = [...timTerfilter.value]
  if (pool.length === 0) return

  const timTerkocok = acakArray(pool)
  const grupList = ['Grup A', 'Grup B', 'Grup C', 'Grup D'].slice(0, jumlahGrup.value)

  const grupBaru = {}
  grupList.forEach(g => { grupBaru[g] = [] })

  timTerkocok.forEach((tim, idx) => {
    const namaGrup = grupList[idx % grupList.length]
    grupBaru[namaGrup].push({ ...tim, group_name: namaGrup })
  })

  hasilDrawing.value = grupBaru
  timTersedia.value = []
  timSedangSpin.value = null
  targetGrupAktif.value = ''
  sedangDrawing.value = false
  sudahDrawing.value = true
  statusSpin.value = 'selesai'
  slotTerisiCount.value = pool.length
}

function resetDrawing() {
  bersihkanTimerSpin()
  hasilDrawing.value = {
    'Grup A': [],
    'Grup B': [],
    'Grup C': [],
    'Grup D': []
  }
  timTersedia.value = []
  timSedangSpin.value = null
  targetGrupAktif.value = ''
  sedangDrawing.value = false
  sudahDrawing.value = false
  statusSpin.value = 'siap'
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
  <div class="space-y-6" :class="{ 'relative': !modeFullscreen }">
    <!-- Floating Action Bar di Bawah Tengah Layar -->
    <FloatingActionBarDrawing
      :sedangDrawing="sedangDrawing"
      :sudahDrawing="sudahDrawing"
      :sedangMenyimpan="sedangMenyimpan"
      :jumlahTim="timTerfilter.length"
      :modeFullscreen="modeFullscreen"
      @kocok="jalankanDrawingOtomatis"
      @lewati="lewatiAnimasiSpin"
      @simpan="simpanKeTurnamen"
      @toggleFullscreen="toggleFullscreen"
    />

    <!-- OVERLAY FULLSCREEN KHUSUS REKAM LAYAR DRAWING -->
    <Teleport to="body">
      <div
        v-if="modeFullscreen"
        class="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col overflow-y-auto p-4 sm:p-8 space-y-6"
      >
        <!-- Top Bar Fullscreen -->
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-ucl-500/20 border border-ucl-400/40 flex items-center justify-center text-ucl-400">
              <Dices class="w-5 h-5" />
            </div>
            <div>
              <h1 class="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
                PEAK CHAMPIONS LEAGUE - OFFICIAL DRAWING
              </h1>
              <p class="text-xs text-slate-400">
                Pengundian Fase Grup Turnamen • {{ timTerfilter.length }} Klub Peserta
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="toggleFullscreen"
              class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Minimize2 class="w-4 h-4" />
              <span>Keluar Layar Penuh (Esc)</span>
            </button>
          </div>
        </div>

        <!-- Stage Roulette di Fullscreen -->
        <RouletteDrawingGrup
          v-if="sedangDrawing || sudahDrawing"
          :sedangDrawing="sedangDrawing"
          :sudahDrawing="sudahDrawing"
          :statusSpin="statusSpin"
          :targetGrupAktif="targetGrupAktif"
          :slotTargetAktif="slotTargetAktif"
          :timSedangSpin="timSedangSpin"
          :slotTerisiCount="slotTerisiCount"
          :totalSlotDibutuhkan="totalSlotDibutuhkan"
        />

        <!-- Grid Hasil Grup di Fullscreen -->
        <div class="flex-1 pb-24">
          <GridHasilDrawingGrup
            :hasilDrawing="hasilDrawing"
            :targetGrupAktif="targetGrupAktif"
            :sedangDrawing="sedangDrawing"
          />
        </div>

        <!-- Floating Bar di dalam Teleport Fullscreen -->
        <FloatingActionBarDrawing
          :sedangDrawing="sedangDrawing"
          :sudahDrawing="sudahDrawing"
          :sedangMenyimpan="sedangMenyimpan"
          :jumlahTim="timTerfilter.length"
          :modeFullscreen="modeFullscreen"
          @kocok="jalankanDrawingOtomatis"
          @lewati="lewatiAnimasiSpin"
          @simpan="simpanKeTurnamen"
          @toggleFullscreen="toggleFullscreen"
        />
      </div>
    </Teleport>

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

        <div class="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <!-- Season Picker -->
          <div v-if="daftarSeason.length > 0" class="relative">
            <select
              v-model="seasonTerpilihId"
              class="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-ink-900 cursor-pointer hover:border-ucl-400 focus:border-ucl-500 outline-none transition-colors"
            >
              <option v-for="s in daftarSeason" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.season }})
              </option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div class="grid grid-cols-2 sm:flex items-center gap-2">
            <!-- Tombol Fullscreen / Layar Penuh -->
            <button
              type="button"
              @click="toggleFullscreen"
              class="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Tampilkan mode layar penuh khusus drawing (sangat cocok untuk rekam layar)"
            >
              <Maximize2 class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span class="truncate">Layar Penuh</span>
            </button>

            <button
              type="button"
              @click="konfirmasiResetTotal"
              class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Hapus seluruh hasil drawing, jadwal pertandingan, dan klasemen di database"
            >
              <RotateCcw class="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span class="truncate">Reset DB</span>
            </button>

            <button
              type="button"
              @click="resetDrawing"
              v-if="sudahDrawing"
              class="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Batal</span>
            </button>
          </div>
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

    <!-- Roulette Spin Box Live Card (Tampil saat sedang drawing atau sudah ada slot terisi) -->
    <RouletteDrawingGrup
      v-if="sedangDrawing || sudahDrawing"
      :sedangDrawing="sedangDrawing"
      :sudahDrawing="sudahDrawing"
      :statusSpin="statusSpin"
      :targetGrupAktif="targetGrupAktif"
      :slotTargetAktif="slotTargetAktif"
      :timSedangSpin="timSedangSpin"
      :slotTerisiCount="slotTerisiCount"
      :totalSlotDibutuhkan="totalSlotDibutuhkan"
    />

    <!-- Hasil Drawing Preview (Grid Grup) -->
    <div v-if="sudahDrawing || sedangDrawing" class="space-y-4">
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

      <GridHasilDrawingGrup
        :hasilDrawing="hasilDrawing"
        :targetGrupAktif="targetGrupAktif"
        :sedangDrawing="sedangDrawing"
      />
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
