<script setup>
import { ref, computed } from 'vue'
import { useAdmin } from '../composables/useAdmin.js'
import FormInputSkor from '../components/admin/FormInputSkor.vue'
import FormEventPertandingan from '../components/admin/FormEventPertandingan.vue'
import ManajemenTim from '../components/admin/ManajemenTim.vue'
import PanelPendaftaranTim from '../components/admin/PanelPendaftaranTim.vue'
import PanelDrawingGrup from '../components/admin/PanelDrawingGrup.vue'
import PanelManajemenJuara from '../components/admin/PanelManajemenJuara.vue'
import {
  ShieldCheck,
  Lock,
  Calendar,
  Users,
  Dices,
  Trophy,
  Activity,
  PlusCircle,
  Clock,
  CheckCircle2
} from 'lucide-vue-next'
import TombolDasar from '../components/umum/TombolDasar.vue'
import { mockPertandingan, mockTim, mockPendaftaranTim, mockRiwayatJuara } from '../lib/mockData.js'

const pinAdmin = ref('')
const terotentikasi = ref(false)
const pesanErrorAuth = ref('')
const tabAktif = ref('skor') // 'skor' | 'pendaftaran' | 'drawing' | 'klub' | 'juara'

const { sedangMemuat, pesanSukses, pesanKesalahan, perbaruiSkorPertandingan, tambahEventPertandingan } = useAdmin()

// State Data Turnamen
const daftarLaga = ref([...mockPertandingan])
const daftarTim = ref([...mockTim])
const daftarPendaftaran = ref([...mockPendaftaranTim])
const daftarRiwayat = ref([...mockRiwayatJuara])

// Match Selector State
const selectedMatchId = ref(daftarLaga.value[0]?.id || 'm1')

const lagaAktif = computed(() => {
  return daftarLaga.value.find(m => m.id === selectedMatchId.value) || daftarLaga.value[0]
})

// Daftar Pemain Dinamis berdasarkan kedua tim yang bertanding di laga aktif
const daftarPemainLaga = computed(() => {
  if (!lagaAktif.value) return []
  const ratings = lagaAktif.value.player_ratings || []
  if (ratings.length > 0) {
    return ratings.map((p, idx) => ({
      id: p.id || `p-${idx}`,
      name: p.name,
      squad_number: p.pos === 'FW' ? 9 : p.pos === 'MF' ? 8 : 4,
      position: p.pos || 'MF',
      team: p.team
    }))
  }
  return [
    { id: 'p1', name: `Pemain 1 (${lagaAktif.value.home_team?.short_name})`, squad_number: 10, position: 'FW', team: lagaAktif.value.home_team?.short_name },
    { id: 'p2', name: `Pemain 2 (${lagaAktif.value.home_team?.short_name})`, squad_number: 8, position: 'MF', team: lagaAktif.value.home_team?.short_name },
    { id: 'p3', name: `Pemain 3 (${lagaAktif.value.away_team?.short_name})`, squad_number: 7, position: 'FW', team: lagaAktif.value.away_team?.short_name },
    { id: 'p4', name: `Pemain 4 (${lagaAktif.value.away_team?.short_name})`, squad_number: 11, position: 'MF', team: lagaAktif.value.away_team?.short_name }
  ]
})

function verifikasiPin() {
  if (pinAdmin.value === '1234' || pinAdmin.value === 'pcl2026') {
    terotentikasi.value = true
    pesanErrorAuth.value = ''
  } else {
    pesanErrorAuth.value = 'PIN Admin salah. Coba: 1234'
  }
}

async function simpanSkor(payload) {
  const matchIndex = daftarLaga.value.findIndex(m => m.id === payload.matchId)
  if (matchIndex !== -1) {
    daftarLaga.value[matchIndex].home_score = payload.homeScore
    daftarLaga.value[matchIndex].away_score = payload.awayScore
    daftarLaga.value[matchIndex].status = payload.status
  }
  await perbaruiSkorPertandingan(payload.matchId, payload.homeScore, payload.awayScore, payload.status)
}

async function simpanEvent(payload) {
  const matchIndex = daftarLaga.value.findIndex(m => m.id === payload.matchId)
  if (matchIndex !== -1) {
    const pemainObj = daftarPemainLaga.value.find(p => p.id === payload.playerId)
    if (!daftarLaga.value[matchIndex].events) {
      daftarLaga.value[matchIndex].events = []
    }
    daftarLaga.value[matchIndex].events.push({
      id: `ev-${Date.now()}`,
      minute: payload.minute,
      event_type: payload.eventType,
      player: { name: pemainObj?.name || 'Pemain' },
      team: { short_name: payload.teamId === lagaAktif.value.home_team_id ? lagaAktif.value.home_team?.short_name : lagaAktif.value.away_team?.short_name }
    })
  }
  await tambahEventPertandingan(payload.matchId, payload.teamId, payload.playerId, payload.eventType, payload.minute)
}

function handleSetujuiPendaftaran(pendaftaranId) {
  const item = daftarPendaftaran.value.find(p => p.id === pendaftaranId)
  if (item) {
    item.status = 'diterima'
    // Otomatis masukkan ke daftar klub turnamen jika belum ada
    const sudahAda = daftarTim.value.some(t => t.name.toLowerCase() === item.nama_tim.toLowerCase())
    if (!sudahAda) {
      daftarTim.value.push({
        id: `t-${Date.now()}`,
        name: item.nama_tim,
        short_name: item.short_name,
        manager_name: item.manager_name,
        group_name: 'Grup Pending',
        rating: 88,
        stadium: 'Stadion Utama PCL'
      })
    }
  }
}

function handleTolakPendaftaran(pendaftaranId) {
  const item = daftarPendaftaran.value.find(p => p.id === pendaftaranId)
  if (item) {
    item.status = 'ditolak'
  }
}

function handleTerapkanDrawing(hasilGrup) {
  // Update group_name di daftar klub turnamen
  Object.keys(hasilGrup).forEach(grupName => {
    const timDiGrup = hasilGrup[grupName]
    timDiGrup.forEach(tim => {
      const idx = daftarTim.value.findIndex(t => t.id === tim.id || t.name === tim.name)
      if (idx !== -1) {
        daftarTim.value[idx].group_name = grupName
      }
    })
  })
}

function handleTambahTimBaru(timBaru) {
  daftarTim.value.push({
    id: `t-${Date.now()}`,
    name: timBaru.name,
    short_name: timBaru.short_name,
    manager_name: timBaru.manager_name || 'Coach',
    group_name: 'Grup A',
    rating: 89,
    stadium: 'Stadion PCL Arena'
  })
}

function handleTambahRiwayat(itemBaru) {
  daftarRiwayat.value.unshift(itemBaru)
}

function handleHapusRiwayat(riwayatId) {
  daftarRiwayat.value = daftarRiwayat.value.filter(r => r.id !== riwayatId)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Lock Screen -->
    <div v-if="!terotentikasi" class="anim-muncul max-w-md mx-auto my-12 rounded-2xl bg-white border border-slate-200 shadow-lift p-6 sm:p-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-ucl-50 border border-ucl-100 flex items-center justify-center mx-auto mb-4 text-ucl-600 shadow-sm">
        <Lock class="w-6 h-6" />
      </div>
      <h2 class="font-display text-xl font-semibold tracking-tight text-ink-900 mb-1">Panel Panitia PCL</h2>
      <p class="text-xs sm:text-sm text-ink-400 mb-6 leading-relaxed">
        Masukkan PIN keamanan admin turnamen untuk mengelola skor, tim, dan jadwal laga.
      </p>

      <form @submit.prevent="verifikasiPin" class="space-y-3">
        <div class="text-left">
          <label for="pin-admin" class="block text-xs font-semibold text-ink-600 mb-1.5">PIN Keamanan</label>
          <input
            id="pin-admin"
            v-model="pinAdmin"
            type="password"
            placeholder="Masukkan PIN (Default: 1234)"
            class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>
        <div v-if="pesanErrorAuth" class="text-xs text-red-600 font-semibold">{{ pesanErrorAuth }}</div>
        <TombolDasar tipe="submit" varian="primer" class="w-full">
          Buka Panel Admin
        </TombolDasar>
      </form>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="space-y-6">
      <!-- Top Control Bar -->
      <div class="anim-muncul flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Control Room</span>
            <span class="text-slate-300">•</span>
            <span class="text-xs text-slate-500">PCL Season 2026</span>
          </div>
          <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1 flex items-center gap-2.5">
            <ShieldCheck class="w-7 h-7 text-emerald-600 shrink-0" />
            Panel Panitia Turnamen
          </h1>
        </div>

        <button
          @click="terotentikasi = false"
          class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-ink-600 transition-colors hover:border-red-500 hover:text-red-600 cursor-pointer shadow-sm"
        >
          Kunci Kembali
        </button>
      </div>

      <!-- Navigation Tabs Module -->
      <div class="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/70 overflow-x-auto max-w-full gap-1.5 shadow-inner">
        <button
          @click="tabAktif = 'skor'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          :class="tabAktif === 'skor'
            ? 'bg-white text-ink-900 shadow-card border border-slate-200/80'
            : 'text-slate-600 hover:text-ink-900 hover:bg-slate-200/60'"
        >
          <Activity class="w-4 h-4" :class="tabAktif === 'skor' ? 'text-ucl-600' : 'text-slate-400'" />
          Input Skor &amp; Event
        </button>

        <button
          @click="tabAktif = 'pendaftaran'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          :class="tabAktif === 'pendaftaran'
            ? 'bg-white text-ink-900 shadow-card border border-slate-200/80'
            : 'text-slate-600 hover:text-ink-900 hover:bg-slate-200/60'"
        >
          <Users class="w-4 h-4" :class="tabAktif === 'pendaftaran' ? 'text-ucl-600' : 'text-slate-400'" />
          Pendaftaran Klub
          <span
            v-if="daftarPendaftaran.filter(p => p.status === 'pending').length > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white"
          >
            {{ daftarPendaftaran.filter(p => p.status === 'pending').length }}
          </span>
        </button>

        <button
          @click="tabAktif = 'drawing'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          :class="tabAktif === 'drawing'
            ? 'bg-white text-ink-900 shadow-card border border-slate-200/80'
            : 'text-slate-600 hover:text-ink-900 hover:bg-slate-200/60'"
        >
          <Dices class="w-4 h-4" :class="tabAktif === 'drawing' ? 'text-ucl-600' : 'text-slate-400'" />
          Drawing Grup
        </button>

        <button
          @click="tabAktif = 'klub'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          :class="tabAktif === 'klub'
            ? 'bg-white text-ink-900 shadow-card border border-slate-200/80'
            : 'text-slate-600 hover:text-ink-900 hover:bg-slate-200/60'"
        >
          <PlusCircle class="w-4 h-4" :class="tabAktif === 'klub' ? 'text-ucl-600' : 'text-slate-400'" />
          Manajemen Klub
        </button>

        <button
          @click="tabAktif = 'juara'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          :class="tabAktif === 'juara'
            ? 'bg-white text-ink-900 shadow-card border border-slate-200/80'
            : 'text-slate-600 hover:text-ink-900 hover:bg-slate-200/60'"
        >
          <Trophy class="w-4 h-4" :class="tabAktif === 'juara' ? 'text-gold-600' : 'text-slate-400'" />
          Arsip Juara Musim
        </button>
      </div>

      <!-- Feedback Alerts -->
      <div v-if="pesanSukses" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
        {{ pesanSukses }}
      </div>
      <div v-if="pesanKesalahan" class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
        {{ pesanKesalahan }}
      </div>

      <!-- TAB 1: Input Skor & Event Pertandingan -->
      <div v-if="tabAktif === 'skor'" class="space-y-6">
        <!-- Match Selector Bar -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-card space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink-900 mb-0.5">Pilih Pertandingan yang Ingin Diupdate</label>
              <p class="text-[11px] text-slate-500">Pilih dari jadwal babak grup atau fase knockout turnamen.</p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-semibold text-slate-600 shrink-0 self-start sm:self-auto">
              ID Laga: {{ selectedMatchId }}
            </span>
          </div>

          <select
            v-model="selectedMatchId"
            class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:outline-none focus:border-ucl-500 focus:bg-white transition cursor-pointer"
          >
            <option v-for="m in daftarLaga" :key="m.id" :value="m.id">
              [{{ m.group?.name || m.stage.toUpperCase() }}] {{ m.home_team?.name }} vs {{ m.away_team?.name }} (Skor Saat Ini: {{ m.home_score ?? 0 }} - {{ m.away_score ?? 0 }}) · Status: {{ m.status }}
            </option>
          </select>
        </div>

        <!-- 2 Kolom Form -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormInputSkor
            :key="selectedMatchId"
            :laga="lagaAktif"
            :sedangMemuat="sedangMemuat"
            @simpan="simpanSkor"
          />

          <FormEventPertandingan
            :key="selectedMatchId + '-event'"
            :laga="lagaAktif"
            :daftarPemain="daftarPemainLaga"
            :sedangMemuat="sedangMemuat"
            @tambahEvent="simpanEvent"
          />
        </div>
      </div>

      <!-- TAB 2: Pendaftaran Tim Online -->
      <div v-else-if="tabAktif === 'pendaftaran'">
        <PanelPendaftaranTim
          :daftarPendaftaran="daftarPendaftaran"
          @setujui="handleSetujuiPendaftaran"
          @tolak="handleTolakPendaftaran"
        />
      </div>

      <!-- TAB 3: Drawing Grup Otomatis -->
      <div v-else-if="tabAktif === 'drawing'">
        <PanelDrawingGrup
          :daftarTim="daftarTim"
          @terapkanHasilDrawing="handleTerapkanDrawing"
        />
      </div>

      <!-- TAB 4: Manajemen Klub Peserta -->
      <div v-else-if="tabAktif === 'klub'" class="space-y-6">
        <ManajemenTim
          :daftarTim="daftarTim"
          :sedangMemuat="sedangMemuat"
          @tambahTim="handleTambahTimBaru"
        />

        <!-- Preview Tabel Klub -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
          <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h4 class="font-semibold text-xs text-ink-900">Daftar Klub Aktif Turnamen ({{ daftarTim.length }} Tim)</h4>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                  <th class="py-2.5 px-4">Klub</th>
                  <th class="py-2.5 px-4">Grup</th>
                  <th class="py-2.5 px-4">Manajer</th>
                  <th class="py-2.5 px-4">Stadion</th>
                  <th class="py-2.5 px-4 text-right">OVR</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="t in daftarTim" :key="t.id" class="hover:bg-slate-50">
                  <td class="py-2.5 px-4 font-semibold text-ink-900 flex items-center gap-2">
                    <span class="w-6 h-6 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center text-navy-800">
                      {{ t.short_name }}
                    </span>
                    {{ t.name }}
                  </td>
                  <td class="py-2.5 px-4 text-slate-600">{{ t.group_name || '-' }}</td>
                  <td class="py-2.5 px-4 text-slate-500">{{ t.manager_name || '-' }}</td>
                  <td class="py-2.5 px-4 text-slate-400">{{ t.stadium || '-' }}</td>
                  <td class="py-2.5 px-4 text-right font-bold text-navy-800">{{ t.rating || 90 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: Arsip Juara Musim -->
      <div v-else-if="tabAktif === 'juara'">
        <PanelManajemenJuara
          :daftarRiwayat="daftarRiwayat"
          :daftarTim="daftarTim"
          @tambahRiwayat="handleTambahRiwayat"
          @hapusRiwayat="handleHapusRiwayat"
        />
      </div>
    </div>
  </div>
</template>
