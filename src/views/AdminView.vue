<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../lib/api.js'
import { invalidateCache } from '../lib/cache.js'
import { useAdmin, ambilDataLengkapAdmin, tambahBeritaSupabase, perbaruiBeritaSupabase, hapusBeritaSupabase, buatTimBaruSupabase, perbaruiTimSupabase, hapusTimSupabase, perbaruiStatusPendaftaranSupabase } from '../composables/useAdmin.js'
import { generateJadwalKnockoutSupabase } from '../composables/useKnockout.js'
import { useAuth } from '../composables/useAuth.js'
import FormInputSkor from '../components/admin/FormInputSkor.vue'
import ManajemenTim from '../components/admin/ManajemenTim.vue'
import PanelPendaftaranTim from '../components/admin/PanelPendaftaranTim.vue'
import PanelDrawingGrup from '../components/admin/PanelDrawingGrup.vue'
import PanelDrawingBagan from '../components/admin/PanelDrawingBagan.vue'
import PanelManajemenJuara from '../components/admin/PanelManajemenJuara.vue'
import PanelManajemenBerita from '../components/admin/PanelManajemenBerita.vue'
import PanelPemilihLagaSkor from '../components/admin/PanelPemilihLagaSkor.vue'
import PanelManajemenSeason from '../components/admin/PanelManajemenSeason.vue'
import ModalDialog from '../components/umum/ModalDialog.vue'
import TombolDasar from '../components/umum/TombolDasar.vue'
import { ShieldCheck, Lock, User, Users, Dices, Trophy, Activity, PlusCircle, CheckCircle2, Newspaper, Calendar, LayoutGrid, GitBranch } from 'lucide-vue-next'

const { terotentikasi, sedangMasuk, pesanKesalahan: pesanErrorAuth, masukAdmin } = useAuth()
const inputUsername = ref('')
const inputPassword = ref('')
const tabAktif = ref('skor') // 'skor' | 'season' | 'berita' | 'pendaftaran' | 'drawing' | 'klub' | 'juara'
const subTabDrawing = ref('grup') // 'grup' | 'bagan'

const {
  sedangMemuat,
  pesanSukses,
  pesanKesalahan,
  perbaruiSkorPertandingan,
  tambahEventPertandingan,
  hapusEventPertandingan
} = useAdmin()

const daftarLaga = ref([])
const daftarTim = ref([])
const daftarPendaftaran = ref([])
const daftarRiwayat = ref([])
const daftarBerita = ref([])
const daftarPemainLaga = ref([])
const daftarEventLaga = ref([])
const selectedMatchId = ref('')
const modalSkorTerbuka = ref(false)

const daftarNavTabs = computed(() => [
  { id: 'skor', label: 'Input Skor', icon: Activity },
  { id: 'season', label: 'Season Turnamen', icon: Calendar },
  { id: 'berita', label: 'Berita', icon: Newspaper, count: daftarBerita.value.length, countBg: 'bg-ucl-500' },
  { id: 'pendaftaran', label: 'Pendaftaran', icon: Users, count: daftarPendaftaran.value.filter(p => p.status === 'pending').length, countBg: 'bg-amber-500' },
  { id: 'drawing', label: 'Drawing Bagan', icon: Dices },
  { id: 'klub', label: 'Klub Peserta', icon: PlusCircle },
  { id: 'juara', label: 'Riwayat Juara', icon: Trophy }
])

async function muatSemuaDataAdmin() {
  try {
    const res = await ambilDataLengkapAdmin()
    daftarLaga.value = res.daftarLaga
    daftarTim.value = res.daftarTim
    daftarPendaftaran.value = res.daftarPendaftaran
    daftarBerita.value = res.daftarBerita
    daftarRiwayat.value = res.daftarRiwayat
    if (daftarLaga.value.length > 0 && !selectedMatchId.value) {
      selectedMatchId.value = daftarLaga.value[0].id
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(muatSemuaDataAdmin)

const lagaAktif = computed(() => {
  return daftarLaga.value.find(m => m.id === selectedMatchId.value) || daftarLaga.value[0] || null
})

watch(selectedMatchId, async (newId) => {
  if (!newId || !lagaAktif.value) {
    daftarPemainLaga.value = []
    daftarEventLaga.value = []
    return
  }
  const teamIds = [lagaAktif.value.home_team_id, lagaAktif.value.away_team_id].filter(Boolean)
  if (teamIds.length === 0) {
    daftarPemainLaga.value = []
    daftarEventLaga.value = []
    return
  }

  try {
    const [playersHome, playersAway, matchDetail] = await Promise.all([
      lagaAktif.value.home_team_id ? api.getPlayers({ team_id: lagaAktif.value.home_team_id }) : Promise.resolve([]),
      lagaAktif.value.away_team_id ? api.getPlayers({ team_id: lagaAktif.value.away_team_id }) : Promise.resolve([]),
      api.getMatchDetail(newId)
    ])

    const allPlayers = [...(playersHome || []), ...(playersAway || [])]
    daftarPemainLaga.value = allPlayers.map(p => ({
      id: p.id,
      name: p.name,
      squad_number: p.squad_number,
      position: p.position,
      team_id: p.team_id,
      team: p.team_short || 'TIM'
    }))
    daftarEventLaga.value = matchDetail?.events || []
  } catch (err) {
    daftarPemainLaga.value = []
    daftarEventLaga.value = []
  }
}, { immediate: true })

async function handleLogin() {
  const sukses = await masukAdmin(inputUsername.value, inputPassword.value)
  if (sukses) {
    inputPassword.value = ''
    muatSemuaDataAdmin()
  }
}

async function simpanSkor(payload) {
  const matchIndex = daftarLaga.value.findIndex(m => m.id === payload.matchId)
  if (matchIndex !== -1) {
    daftarLaga.value[matchIndex].home_score = payload.homeScore
    daftarLaga.value[matchIndex].away_score = payload.awayScore
    daftarLaga.value[matchIndex].status = payload.status
    if (payload.scheduledAt) daftarLaga.value[matchIndex].scheduled_at = payload.scheduledAt
  }
  const sukses = await perbaruiSkorPertandingan(payload.matchId, payload.homeScore, payload.awayScore, payload.status, payload.scheduledAt)
  if (sukses) {
    await muatSemuaDataAdmin()
    if (payload.tutup) {
      modalSkorTerbuka.value = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

async function simpanEvent(payload) {
  const matchIndex = daftarLaga.value.findIndex(m => m.id === payload.matchId)
  const pemainObj = daftarPemainLaga.value.find(p => p.id === payload.playerId)
  const timShort = payload.teamId === lagaAktif.value?.home_team_id ? lagaAktif.value?.home_team?.short_name : lagaAktif.value?.away_team?.short_name
  const eventTempId = `ev-${Date.now()}`

  if (matchIndex !== -1) {
    if (!daftarLaga.value[matchIndex].events) daftarLaga.value[matchIndex].events = []
    daftarLaga.value[matchIndex].events.push({
      id: eventTempId, minute: payload.minute, event_type: payload.eventType, player: { name: pemainObj?.name || 'Pemain' }, team: { short_name: timShort }
    })
  }
  daftarEventLaga.value.push({
    id: eventTempId, event_type: payload.eventType, minute: payload.minute, player: { name: pemainObj?.name || 'Pemain' }, team: { short_name: timShort }
  })
  await tambahEventPertandingan(payload.matchId, payload.teamId, payload.playerId, payload.eventType, payload.minute)
  if (lagaAktif.value?.id) {
    try {
      const detail = await api.getMatchDetail(lagaAktif.value.id)
      if (detail && detail.events) daftarEventLaga.value = detail.events
    } catch (e) {}
  }
}

async function handleHapusEvent(eventId) {
  daftarEventLaga.value = daftarEventLaga.value.filter(e => e.id !== eventId)
  if (lagaAktif.value?.events) {
    lagaAktif.value.events = lagaAktif.value.events.filter(e => e.id !== eventId)
  }
  await hapusEventPertandingan(eventId)
}

function simpanOverrideStatus(id, status) {
  try {
    const local = JSON.parse(localStorage.getItem('pcl_reg_status_overrides') || '{}')
    local[id] = status
    localStorage.setItem('pcl_reg_status_overrides', JSON.stringify(local))
  } catch (e) {}
}

async function handleSetujuiPendaftaran(id) {
  const item = daftarPendaftaran.value.find(p => p.id === id)
  if (item) item.status = 'diterima'
  simpanOverrideStatus(id, 'diterima')
  await perbaruiStatusPendaftaranSupabase(id, 'diterima')
  await muatSemuaDataAdmin()
}

async function handleTolakPendaftaran(id) {
  const item = daftarPendaftaran.value.find(p => p.id === id)
  if (item) item.status = 'ditolak'
  simpanOverrideStatus(id, 'ditolak')
  await perbaruiStatusPendaftaranSupabase(id, 'ditolak')
}

async function handleTerapkanDrawing(payload) {
  const timTerpilih = payload.timTerpilih || payload
  const kapasitas = payload.kapasitas || 8
  const customTournamentId = payload.customTournamentId || null
  await generateJadwalKnockoutSupabase(timTerpilih, kapasitas, customTournamentId)
  await muatSemuaDataAdmin()
}

const refDrawingGrup = ref(null)

async function handleTerapkanDrawingGrup(payload) {
  const panel = refDrawingGrup.value
  try {
    if (panel) panel.pesanError = null
    const reqBody = payload?.pembagianGrup ? payload : { pembagianGrup: payload }
    await api.drawGroups(reqBody)
    invalidateCache()
    await muatSemuaDataAdmin()
    if (panel) {
      panel.sedangMenyimpan = false
      panel.pesanSukses = 'Pembagian grup & jadwal laga berhasil diterapkan!'
      setTimeout(() => { panel.pesanSukses = null }, 4000)
    }
  } catch (err) {
    console.error('Gagal menerapkan drawing grup:', err)
    if (panel) {
      panel.sedangMenyimpan = false
      panel.pesanError = `Gagal: ${err.message}`
      setTimeout(() => { panel.pesanError = null }, 6000)
    }
  }
}

async function handleResetDrawingTotal() {
  const panelGrup = refDrawingGrup.value
  try {
    pesanSukses.value = null
    pesanKesalahan.value = null
    await api.resetDrawing()
    invalidateCache()
    await muatSemuaDataAdmin()
    pesanSukses.value = 'Semua hasil drawing dan jadwal pertandingan berhasil direset!'
    if (panelGrup) {
      panelGrup.resetDrawing()
      panelGrup.pesanSukses = 'Drawing berhasil direset total!'
      setTimeout(() => { panelGrup.pesanSukses = null }, 4000)
    }
  } catch (err) {
    pesanKesalahan.value = `Gagal reset drawing: ${err.message}`
  }
}

async function handleTambahTimBaru(tim) {
  const created = await buatTimBaruSupabase({ ...tim, rating: 89, group_name: null })
  if (created) daftarTim.value.push(created)
}
async function handleUpdateTimBaru(tim) {
  const updated = await perbaruiTimSupabase(tim)
  if (updated) {
    const idx = daftarTim.value.findIndex(t => t.id === tim.id)
    if (idx !== -1) daftarTim.value[idx] = { ...daftarTim.value[idx], ...updated }
  }
}
async function handleHapusTimBaru(id) {
  await hapusTimSupabase(id)
  daftarTim.value = daftarTim.value.filter(t => t.id !== id)
}
async function handleTambahRiwayat(item) {
  const created = await api.createChampion({
    musim: item.musim, label_musim: item.label_musim, juara_team_id: item.juara?.id || null, runner_up_team_id: item.runner_up?.id || null,
    skor_final: item.skor_final, top_scorer_nama: item.top_scorer?.nama || null, top_scorer_total: item.top_scorer?.total || 0,
    mvp_nama: item.mvp_turnamen?.nama || null, mvp_rating: item.mvp_turnamen?.rating || 9.0
  })
  if (created) daftarRiwayat.value.unshift(created)
}
async function handleHapusRiwayat(id) {
  await api.deleteChampion(id)
  daftarRiwayat.value = daftarRiwayat.value.filter(r => r.id !== id)
}
async function handleTambahBerita(b) {
  const created = await tambahBeritaSupabase(b)
  if (created) daftarBerita.value.unshift(created)
}
async function handleUpdateBerita(b) {
  const updated = await perbaruiBeritaSupabase(b)
  if (updated) {
    const idx = daftarBerita.value.findIndex(item => item.id === b.id)
    if (idx !== -1) daftarBerita.value[idx] = updated
  }
}
async function handleHapusBerita(id) {
  await hapusBeritaSupabase(id)
  daftarBerita.value = daftarBerita.value.filter(b => b.id !== id)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Login User Screen -->
    <div v-if="!terotentikasi" class="anim-muncul max-w-md mx-auto my-12 rounded-2xl bg-white border border-slate-200 shadow-lift p-6 sm:p-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-ucl-50 border border-ucl-100 flex items-center justify-center mx-auto mb-4 text-ucl-600 shadow-sm">
        <Lock class="w-6 h-6" />
      </div>
      <h2 class="font-display text-xl font-semibold tracking-tight text-ink-900 mb-1">Login Panitia PCL</h2>
      <p class="text-xs sm:text-sm text-ink-400 mb-6 leading-relaxed">
        Masuk menggunakan akun pengguna panitia untuk mengelola jadwal, skor, tim, dan turnamen.
      </p>

      <form @submit.prevent="handleLogin" class="space-y-4 text-left">
        <div>
          <label for="admin-username" class="block text-xs font-semibold text-ink-600 mb-1.5">Username / Email</label>
          <div class="relative">
            <input
              id="admin-username"
              v-model="inputUsername"
              type="text"
              placeholder="admin atau admin@pcl.com"
              class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-sm font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
            <User class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label for="admin-password" class="block text-xs font-semibold text-ink-600 mb-1.5">Password</label>
          <div class="relative">
            <input
              id="admin-password"
              v-model="inputPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-sm font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div v-if="pesanErrorAuth" class="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-semibold leading-relaxed">
          {{ pesanErrorAuth }}
        </div>

        <TombolDasar tipe="submit" varian="primer" class="w-full justify-center mt-2" :disabled="sedangMasuk">
          {{ sedangMasuk ? 'Memverifikasi...' : 'Masuk Panel Admin' }}
        </TombolDasar>

        <div class="pt-2 text-center">
          <p class="text-[11px] text-slate-400">Akun default: <span class="font-mono text-slate-600 font-semibold">admin</span> / <span class="font-mono text-slate-600 font-semibold">admin123</span></p>
        </div>
      </form>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="space-y-6">
      <!-- Admin Header -->
      <div class="anim-muncul pb-5 border-b border-slate-200">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Control Room</span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1 flex items-center gap-2.5">
          <ShieldCheck class="w-7 h-7 text-emerald-600 shrink-0" />
          Panel Panitia Turnamen
        </h1>
        <p class="text-sm text-ink-400 mt-1">Kelola season, jadwal, skor, berita, tim, dan turnamen PCL.</p>
      </div>

      <!-- Navigation Tabs Module -->
      <div class="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/70 overflow-x-auto max-w-full gap-1.5 shadow-inner">
        <button
          v-for="tab in daftarNavTabs"
          :key="tab.id"
          @click="tabAktif = tab.id"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          :class="tabAktif === tab.id ? 'bg-white text-ink-900 shadow-card border border-slate-200/80' : 'text-slate-600 hover:text-ink-900'"
        >
          <component :is="tab.icon" class="w-4 h-4" :class="tabAktif === tab.id ? (tab.id === 'juara' ? 'text-gold-600' : 'text-ucl-600') : 'text-slate-400'" />
          {{ tab.label }}
          <span v-if="tab.count > 0" class="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white" :class="tab.countBg">
            {{ tab.count }}
          </span>
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

      <!-- TAB: Input Skor & Event Pertandingan -->
      <div v-if="tabAktif === 'skor'" class="space-y-6">
        <PanelPemilihLagaSkor
          :daftarLaga="daftarLaga"
          v-model="selectedMatchId"
          @bukaModalSkor="modalSkorTerbuka = true"
        />

        <ModalDialog
          :terbuka="modalSkorTerbuka"
          @tutup="modalSkorTerbuka = false"
          :judul="lagaAktif ? `Input Skor: ${lagaAktif.home_team?.name || 'Home'} vs ${lagaAktif.away_team?.name || 'Away'}` : 'Input Skor Laga'"
          lebarMaksimal="max-w-4xl"
        >
          <FormInputSkor
            :key="selectedMatchId"
            :laga="lagaAktif"
            :semuaLaga="daftarLaga"
            :daftarPemain="daftarPemainLaga"
            :daftarEvent="daftarEventLaga"
            :sedangMemuat="sedangMemuat"
            @simpan="simpanSkor"
            @tambahEvent="simpanEvent"
            @hapusEvent="handleHapusEvent"
            @tutup="modalSkorTerbuka = false"
          />
        </ModalDialog>
      </div>

      <!-- TAB: Manajemen Season Turnamen -->
      <div v-else-if="tabAktif === 'season'">
        <PanelManajemenSeason />
      </div>

      <!-- TAB: Manajemen Berita Turnamen -->
      <div v-else-if="tabAktif === 'berita'">
        <PanelManajemenBerita
          :daftarBerita="daftarBerita"
          :daftarLaga="daftarLaga"
          :sedangMemuat="sedangMemuat"
          @tambahBerita="handleTambahBerita"
          @updateBerita="handleUpdateBerita"
          @hapusBerita="handleHapusBerita"
        />
      </div>

      <!-- TAB: Pendaftaran Tim Online -->
      <div v-else-if="tabAktif === 'pendaftaran'">
        <PanelPendaftaranTim
          :daftarPendaftaran="daftarPendaftaran"
          @setujui="handleSetujuiPendaftaran"
          @tolak="handleTolakPendaftaran"
        />
      </div>

      <!-- TAB: Drawing Turnamen (Grup & Knockout) -->
      <div v-else-if="tabAktif === 'drawing'" class="space-y-6">
        <div class="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            @click="subTabDrawing = 'grup'"
            class="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            :class="subTabDrawing === 'grup' ? 'bg-white text-ucl-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            Drawing Fase Grup (16 Tim)
          </button>
          <button
            @click="subTabDrawing = 'bagan'"
            class="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            :class="subTabDrawing === 'bagan' ? 'bg-white text-ucl-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            <GitBranch class="w-3.5 h-3.5" />
            Drawing Bagan Knockout (8 Besar)
          </button>
        </div>

        <PanelDrawingGrup
          v-if="subTabDrawing === 'grup'"
          ref="refDrawingGrup"
          :daftarTim="daftarTim"
          @terapkanHasilDrawing="handleTerapkanDrawingGrup"
          @resetDrawingTotal="handleResetDrawingTotal"
        />

        <PanelDrawingBagan
          v-else
          :daftarTim="daftarTim"
          @terapkanHasilDrawing="handleTerapkanDrawing"
          @resetDrawingTotal="handleResetDrawingTotal"
        />
      </div>

      <!-- TAB: Manajemen Klub Peserta -->
      <div v-else-if="tabAktif === 'klub'">
        <ManajemenTim
          :daftarTim="daftarTim"
          :sedangMemuat="sedangMemuat"
          @tambahTim="handleTambahTimBaru"
          @updateTim="handleUpdateTimBaru"
          @hapusTim="handleHapusTimBaru"
          @dataBerubah="muatSemuaDataAdmin"
        />
      </div>

      <!-- TAB: Arsip Juara Musim -->
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
