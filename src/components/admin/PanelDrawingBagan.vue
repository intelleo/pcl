<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../lib/api.js'
import { Dices, Trophy, RefreshCw, Check, Sparkles, AlertCircle, Users, LayoutGrid, RotateCcw, AlertTriangle, ChevronDown } from 'lucide-vue-next'
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

// Kapasitas Tournament Knockout (4, 8, 16, 32)
const opsiKapasitas = [4, 8, 16, 32]
const kapasitas = ref(8)

const hasilPasangan = ref([])
const sedangDrawing = ref(false)
const sudahDrawing = ref(false)
const sedangMenyimpan = ref(false)
const modalKonfirmasiReset = ref(false)
const pesanSukses = ref(null)

const babakAwalLabel = computed(() => {
  if (kapasitas.value === 4) return 'Semi Final (4 Besar)'
  if (kapasitas.value === 8) return 'Perempat Final (8 Besar)'
  if (kapasitas.value === 16) return 'Babak 16 Besar'
  if (kapasitas.value === 32) return 'Babak 32 Besar'
  return 'Babak Pertama'
})

function acakArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function pasangkanOtomatisDariKlasemen() {
  sedangDrawing.value = true
  sudahDrawing.value = false
  kapasitas.value = 8

  try {
    const params = {}
    if (seasonTerpilihId.value) params.tournament_id = seasonTerpilihId.value
    const standingsData = await api.getStandings(params)
    const groups = Object.values(standingsData || {})

    const getTopTwo = (namePattern) => {
      const g = groups.find(item => item.nama?.toLowerCase().includes(namePattern.toLowerCase()))
      if (!g || !g.klasemen) return [null, null]
      const t1 = timTerfilter.value.find(t => t.id === g.klasemen[0]?.team_id) || null
      const t2 = timTerfilter.value.find(t => t.id === g.klasemen[1]?.team_id) || null
      return [t1, t2]
    }

    const [a1, a2] = getTopTwo('grup a')
    const [b1, b2] = getTopTwo('grup b')
    const [c1, c2] = getTopTwo('grup c')
    const [d1, d2] = getTopTwo('grup d')

    hasilPasangan.value = [
      { index: 1, label: 'QF 1 (1A vs 2B)', home: a1, away: b2 },
      { index: 2, label: 'QF 2 (1C vs 2D)', home: c1, away: d2 },
      { index: 3, label: 'QF 3 (1B vs 2A)', home: b1, away: a2 },
      { index: 4, label: 'QF 4 (1D vs 2C)', home: d1, away: c2 }
    ]
    sudahDrawing.value = true
  } catch (e) {
    console.error('Gagal memuat klasemen grup:', e)
  } finally {
    sedangDrawing.value = false
  }
}

function jalankanDrawingOtomatis() {
  sedangDrawing.value = true
  sudahDrawing.value = false

  setTimeout(() => {
    const timTerkocok = acakArray(timTerfilter.value).slice(0, kapasitas.value)
    const pasangan = []
    const totalMatch = kapasitas.value / 2

    for (let i = 0; i < totalMatch; i++) {
      const home = timTerkocok[i * 2] || null
      const away = timTerkocok[i * 2 + 1] || null

      let label = `Match ${i + 1}`
      if (kapasitas.value === 8) label = `QF ${i + 1}`
      else if (kapasitas.value === 16) label = `R16-${i + 1}`
      else if (kapasitas.value === 32) label = `R32-${i + 1}`
      else if (kapasitas.value === 4) label = `SF ${i + 1}`

      pasangan.push({
        index: i + 1,
        label,
        home,
        away
      })
    }

    hasilPasangan.value = pasangan
    sedangDrawing.value = false
    sudahDrawing.value = true
  }, 500)
}

function resetDrawing() {
  hasilPasangan.value = []
  sudahDrawing.value = false
  pesanSukses.value = null
}

function konfirmasiResetTotal() {
  modalKonfirmasiReset.value = true
}

function eksekusiResetTotal() {
  modalKonfirmasiReset.value = false
  resetDrawing()
  emit('resetDrawingTotal')
}

async function simpanKeTurnamen() {
  sedangMenyimpan.value = true
  pesanSukses.value = null
  try {
    // Susun array tim terpilih berurutan sesuai pasangan (home 1, away 1, home 2, away 2...)
    const timTerpilih = []
    hasilPasangan.value.forEach(p => {
      if (p.home) timTerpilih.push(p.home)
      if (p.away) timTerpilih.push(p.away)
    })

    await emit('terapkanHasilDrawing', {
      timTerpilih,
      kapasitas: kapasitas.value,
      customTournamentId: seasonTerpilihId.value
    })
    pesanSukses.value = 'Bagan fase gugur & jadwal pertandingan berhasil diterapkan!'
    setTimeout(() => {
      pesanSukses.value = null
    }, 4000)
  } catch (err) {
    console.error('Gagal menerapkan drawing:', err)
  } finally {
    sedangMenyimpan.value = false
  }
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
            Drawing &amp; Pengundian Bagan Knockout
          </h3>
          <p class="text-xs text-slate-500 mt-1">
            Kocok dan pasangkan {{ timTerfilter.length }} klub peserta di musim ini ke dalam bagan turnamen sistem gugur secara acak.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Season Selector -->
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

          <!-- Pilih Kapasitas Bagan -->
          <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <span class="px-2 text-slate-500 flex items-center gap-1">
              <Users class="w-3.5 h-3.5" />
              Format:
            </span>
            <button
              v-for="k in opsiKapasitas"
              :key="k"
              type="button"
              @click="kapasitas = k; resetDrawing()"
              class="px-2.5 py-1 rounded-md transition cursor-pointer"
              :class="kapasitas === k ? 'bg-white text-ucl-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
            >
              {{ k }} Klub
            </button>
          </div>

          <button
            type="button"
            @click="pasangkanOtomatisDariKlasemen"
            :disabled="sedangDrawing"
            class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Ambil Juara 1 &amp; Runner-up tiap Grup (A, B, C, D) untuk Perempat Final 8 Besar"
          >
            <LayoutGrid class="w-3.5 h-3.5 text-emerald-600" />
            Ambil Top 2 Tiap Grup (8 Besar)
          </button>

          <TombolDasar
            @click="jalankanDrawingOtomatis"
            varian="primer"
            :sedangMemuat="sedangDrawing"
            :dinonaktifkan="timTerfilter.length < 2"
            class="flex items-center gap-1.5"
          >
            <Sparkles class="w-4 h-4" />
            <span>{{ sudahDrawing ? 'Kocok Acak Ulang' : 'Kocok Acak Bagan' }}</span>
          </TombolDasar>

          <TombolDasar
            v-if="sudahDrawing"
            @click="resetDrawing"
            varian="sekunder"
          >
            Batal Pratinjau
          </TombolDasar>

          <button
            type="button"
            @click="konfirmasiResetTotal"
            class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Hapus seluruh hasil drawing, jadwal pertandingan, dan klasemen di database"
          >
            <RotateCcw class="w-3.5 h-3.5 text-red-600" />
            Reset Drawing DB
          </button>
        </div>
      </div>

      <!-- Warning if teams less than capacity -->
      <div
        v-if="timTerfilter.length < kapasitas"
        class="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800"
      >
        <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Total klub terdaftar di musim ini ({{ timTerfilter.length }}) lebih sedikit dari format ({{ kapasitas }} klub).
          Slot yang kosong akan diisi tim Bye/TBD.
        </span>
      </div>

      <!-- Alert Success -->
      <div
        v-if="pesanSukses"
        class="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold"
      >
        <Check class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{{ pesanSukses }}</span>
      </div>

      <!-- Hasil Drawing Grid -->
      <div v-if="sudahDrawing" class="space-y-4 pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Trophy class="w-4 h-4 text-gold-500" />
            <h4 class="text-xs font-semibold uppercase tracking-wider text-ink-900">
              Hasil Pengundian Pasangan {{ babakAwalLabel }}
            </h4>
          </div>
          <span class="text-xs text-slate-500">
            Total {{ hasilPasangan.length }} Laga Babak Awal
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="match in hasilPasangan"
            :key="match.index"
            class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 hover:border-ucl-500/50 transition-colors shadow-sm"
          >
            <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1.5 border-b border-slate-200">
              <span class="text-ucl-700 font-mono">{{ match.label }}</span>
              <span>Babak 1</span>
            </div>

            <div class="space-y-1.5">
              <!-- Home -->
              <div class="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-200 text-xs">
                <img
                  v-if="match.home?.logo_url"
                  :src="match.home.logo_url"
                  :alt="match.home.name"
                  class="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-blue-900 tracking-wider shrink-0"
                >
                  {{ match.home?.short_name || 'TBD' }}
                </div>
                <span class="font-medium text-ink-900 truncate flex-1">
                  {{ match.home?.name || 'TBD (Menunggu Tim)' }}
                </span>
              </div>

              <!-- VS Badge -->
              <div class="text-center text-[10px] font-bold text-slate-400">VS</div>

              <!-- Away -->
              <div class="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-200 text-xs">
                <img
                  v-if="match.away?.logo_url"
                  :src="match.away.logo_url"
                  :alt="match.away.name"
                  class="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-amber-700 tracking-wider shrink-0"
                >
                  {{ match.away?.short_name || 'TBD' }}
                </div>
                <span class="font-medium text-ink-900 truncate flex-1">
                  {{ match.away?.name || 'TBD (Menunggu Tim)' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Terapkan Final -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <TombolDasar
            @click="simpanKeTurnamen"
            variant="emas"
            ukuran="sedang"
            :disabled="sedangMenyimpan"
          >
            <Check class="w-4 h-4" />
            <span>{{ sedangMenyimpan ? 'Menyimpan Jadwal Bagan...' : 'Terapkan Bagan & Generate Jadwal' }}</span>
          </TombolDasar>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!sedangDrawing" class="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
        <Dices class="w-8 h-8 text-slate-300 mx-auto" />
        <p class="text-sm font-semibold text-ink-900">Bagan Turnamen Belum Diundi</p>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Pilih format kapasitas klub di atas, lalu klik tombol "Mulai Drawing Bagan" untuk memasangkan klub secara otomatis.
        </p>
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
