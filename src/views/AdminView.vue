<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase.js'
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

const pinAdmin = ref('')
const terotentikasi = ref(false)
const pesanErrorAuth = ref('')
const tabAktif = ref('skor') // 'skor' | 'pendaftaran' | 'drawing' | 'klub' | 'juara'

const { sedangMemuat, pesanSukses, pesanKesalahan, perbaruiSkorPertandingan, tambahEventPertandingan } = useAdmin()

// State Data Turnamen
const daftarLaga = ref([])
const daftarTim = ref([])
const daftarPendaftaran = ref([])
const daftarRiwayat = ref([])
const daftarPemainLaga = ref([])

// Match Selector State
const selectedMatchId = ref('')

async function muatSemuaDataAdmin() {
  try {
    const [resLaga, resTim, resPendaftaran, resRiwayat] = await Promise.all([
      supabase
        .from('pcl_matches')
        .select(`
          *,
          home_team:pcl_teams!pcl_matches_home_team_id_fkey(*),
          away_team:pcl_teams!pcl_matches_away_team_id_fkey(*),
          group:pcl_tournament_groups(*)
        `)
        .order('matchday', { ascending: true }),
      supabase
        .from('pcl_teams')
        .select('*')
        .order('name', { ascending: true }),
      supabase
        .from('pcl_team_registrations')
        .select('*')
        .order('didaftarkan_pada', { ascending: false }),
      supabase
        .from('pcl_season_champions')
        .select(`
          *,
          juara:pcl_teams!pcl_season_champions_juara_team_id_fkey(*),
          runner_up:pcl_teams!pcl_season_champions_runner_up_team_id_fkey(*)
        `)
        .order('musim', { ascending: false })
    ])

    daftarLaga.value = resLaga.data || []
    daftarTim.value = resTim.data || []
    daftarPendaftaran.value = resPendaftaran.data || []
    daftarRiwayat.value = (resRiwayat.data || []).map(d => ({
      id: d.id,
      musim: d.musim,
      label_musim: d.label_musim,
      status: 'Selesai',
      skor_final: d.skor_final,
      juara: d.juara || { name: 'Klub Juara', short_name: 'JUR' },
      runner_up: d.runner_up || { name: 'Runner-up', short_name: 'RUN' },
      top_scorer: {
        nama: d.top_scorer_nama || '-',
        klub: d.juara?.short_name || 'PCL',
        total: d.top_scorer_total || 0
      },
      mvp_turnamen: {
        nama: d.mvp_nama || '-',
        klub: d.juara?.short_name || 'PCL',
        rating: d.mvp_rating || 9.0
      }
    }))

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

// Ambil Pemain untuk laga aktif dari Supabase
watch(selectedMatchId, async (newId) => {
  if (!newId || !lagaAktif.value) {
    daftarPemainLaga.value = []
    return
  }
  const teamIds = [lagaAktif.value.home_team_id, lagaAktif.value.away_team_id].filter(Boolean)
  if (teamIds.length === 0) {
    daftarPemainLaga.value = []
    return
  }

  const { data: players } = await supabase
    .from('pcl_players')
    .select(`*, team:pcl_teams(*)`)
    .in('team_id', teamIds)
    .order('squad_number')

  if (players && players.length > 0) {
    daftarPemainLaga.value = players.map(p => ({
      id: p.id,
      name: p.name,
      squad_number: p.squad_number,
      position: p.position,
      team_id: p.team_id,
      team: p.team?.short_name || 'TIM'
    }))
  } else {
    daftarPemainLaga.value = []
  }
}, { immediate: true })

function verifikasiPin() {
  if (pinAdmin.value === '1234' || pinAdmin.value === 'pcl2026') {
    terotentikasi.value = true
    pesanErrorAuth.value = ''
    muatSemuaDataAdmin()
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

async function handleSetujuiPendaftaran(pendaftaranId) {
  const item = daftarPendaftaran.value.find(p => p.id === pendaftaranId)
  if (item) {
    item.status = 'diterima'
    await supabase
      .from('pcl_team_registrations')
      .update({ status: 'diterima' })
      .eq('id', pendaftaranId)

    const sudahAda = daftarTim.value.some(t => t.name.toLowerCase() === item.nama_tim.toLowerCase())
    if (!sudahAda) {
      const { data: newTeam } = await supabase
        .from('pcl_teams')
        .insert({
          name: item.nama_tim,
          short_name: item.short_name,
          manager_name: item.manager_name,
          group_name: 'Grup A',
          rating: 88
        })
        .select()
        .single()

      if (newTeam) {
        daftarTim.value.push(newTeam)
      }
    }
  }
}

async function handleTolakPendaftaran(pendaftaranId) {
  const item = daftarPendaftaran.value.find(p => p.id === pendaftaranId)
  if (item) {
    item.status = 'ditolak'
    await supabase
      .from('pcl_team_registrations')
      .update({ status: 'ditolak' })
      .eq('id', pendaftaranId)
  }
}

async function handleTerapkanDrawing(hasilGrup) {
  // Update group_name di database dan lokal
  for (const grupName of Object.keys(hasilGrup)) {
    const timDiGrup = hasilGrup[grupName]
    for (const tim of timDiGrup) {
      const idx = daftarTim.value.findIndex(t => t.id === tim.id || t.name === tim.name)
      if (idx !== -1) {
        daftarTim.value[idx].group_name = grupName
        if (daftarTim.value[idx].id) {
          await supabase
            .from('pcl_teams')
            .update({ group_name: grupName })
            .eq('id', daftarTim.value[idx].id)
        }
      }
    }
  }
}

async function handleTambahTimBaru(timBaru) {
  const { data: createdTeam } = await supabase
    .from('pcl_teams')
    .insert({
      name: timBaru.name,
      short_name: timBaru.short_name,
      manager_name: timBaru.manager_name || 'Coach',
      group_name: 'Grup A',
      rating: 89
    })
    .select()
    .single()

  if (createdTeam) {
    daftarTim.value.push(createdTeam)
  }
}

async function handleTambahRiwayat(itemBaru) {
  const payload = {
    musim: itemBaru.musim,
    label_musim: itemBaru.label_musim,
    juara_team_id: itemBaru.juara?.id || null,
    runner_up_team_id: itemBaru.runner_up?.id || null,
    skor_final: itemBaru.skor_final,
    top_scorer_nama: itemBaru.top_scorer?.nama || null,
    top_scorer_total: itemBaru.top_scorer?.total || 0,
    mvp_nama: itemBaru.mvp_turnamen?.nama || null,
    mvp_rating: itemBaru.mvp_turnamen?.rating || 9.0
  }

  const { data: created } = await supabase
    .from('pcl_season_champions')
    .insert(payload)
    .select(`
      *,
      juara:pcl_teams!pcl_season_champions_juara_team_id_fkey(*),
      runner_up:pcl_teams!pcl_season_champions_runner_up_team_id_fkey(*)
    `)
    .single()

  if (created) {
    daftarRiwayat.value.unshift({
      id: created.id,
      musim: created.musim,
      label_musim: created.label_musim,
      status: 'Selesai',
      skor_final: created.skor_final,
      juara: created.juara || itemBaru.juara,
      runner_up: created.runner_up || itemBaru.runner_up,
      top_scorer: itemBaru.top_scorer,
      mvp_turnamen: itemBaru.mvp_turnamen
    })
  } else {
    daftarRiwayat.value.unshift(itemBaru)
  }
}

async function handleHapusRiwayat(riwayatId) {
  await supabase.from('pcl_season_champions').delete().eq('id', riwayatId)
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
