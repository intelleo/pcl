<script setup>
import { ref, computed, watch } from 'vue'
import {
  Plus,
  Minus,
  Trash2,
  Flame,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  UserCheck,
  Trophy,
  Layers
} from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'
import { hitungStatusSeriBO3 } from '../../composables/useKnockout.js'

const props = defineProps({
  laga: {
    type: Object,
    default: null
  },
  semuaLaga: {
    type: Array,
    default: () => []
  },
  daftarPemain: {
    type: Array,
    default: () => []
  },
  daftarEvent: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['simpan', 'tambahEvent', 'hapusEvent', 'tutup'])

const infoSeriBO3 = computed(() => hitungStatusSeriBO3(props.laga, props.semuaLaga))

const homeScore = ref(props.laga?.home_score ?? 0)
const awayScore = ref(props.laga?.away_score ?? 0)
const status = ref(props.laga?.status || 'finished')
const scheduledAt = ref('')
const feedbackPemainId = ref(null)

function formatToDatetimeInput(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(
  () => props.laga,
  (newLaga) => {
    if (newLaga) {
      homeScore.value = newLaga.home_score ?? 0
      awayScore.value = newLaga.away_score ?? 0
      status.value = newLaga.status || 'finished'
      scheduledAt.value = formatToDatetimeInput(newLaga.scheduled_at)
    }
  },
  { immediate: true }
)

const pemainHome = computed(() => {
  if (!props.laga?.home_team_id) return []
  return props.daftarPemain.filter((p) => p.team_id === props.laga.home_team_id)
})

const pemainAway = computed(() => {
  if (!props.laga?.away_team_id) return []
  return props.daftarPemain.filter((p) => p.team_id === props.laga.away_team_id)
})

function tambahGolPemain(pemain, timTipe) {
  if (!props.laga) return

  if (timTipe === 'home') {
    homeScore.value += 1
  } else {
    awayScore.value += 1
  }

  feedbackPemainId.value = pemain.id
  setTimeout(() => {
    if (feedbackPemainId.value === pemain.id) {
      feedbackPemainId.value = null
    }
  }, 900)

  emit('tambahEvent', {
    matchId: props.laga.id,
    teamId: timTipe === 'home' ? props.laga.home_team_id : props.laga.away_team_id,
    playerId: pemain.id,
    eventType: 'goal',
    minute: 1,
    assistPlayerId: null
  })

  simpanPerubahanSkor(false)
}

function ubahSkorManual(timTipe, delta) {
  if (timTipe === 'home') {
    const baru = homeScore.value + delta
    if (baru >= 0) homeScore.value = baru
  } else {
    const baru = awayScore.value + delta
    if (baru >= 0) awayScore.value = baru
  }
  simpanPerubahanSkor(false)
}

function hapusGol(ev) {
  emit('hapusEvent', ev.id)
  const isHome = ev.team_id === props.laga?.home_team_id
  if (isHome && homeScore.value > 0) {
    homeScore.value -= 1
  } else if (!isHome && awayScore.value > 0) {
    awayScore.value -= 1
  }
  simpanPerubahanSkor(false)
}

function simpanPerubahanSkor(tutup = false) {
  if (!props.laga) return
  emit('simpan', {
    matchId: props.laga.id,
    homeScore: homeScore.value,
    awayScore: awayScore.value,
    status: status.value,
    scheduledAt: scheduledAt.value ? new Date(scheduledAt.value).toISOString() : null,
    tutup
  })
}
</script>

<template>
  <div v-if="!laga" class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-card">
    Belum ada data laga yang dipilih.
  </div>

  <div v-else class="space-y-5">
    <!-- Header & Info Babak -->
    <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full bg-gold-50 border border-gold-200 text-xs font-semibold text-gold-700 flex items-center gap-1.5">
          <Trophy v-if="laga.stage === 'final'" class="w-3.5 h-3.5 text-gold-600" />
          <Flame v-else-if="laga.stage === 'semi_final'" class="w-3.5 h-3.5 text-ucl-600" />
          {{ laga.knockout_bracket_slot ? `${laga.stage?.replace('_', ' ').toUpperCase()} · ${laga.knockout_bracket_slot}` : (laga.stage ? laga.stage.replace('_', ' ').toUpperCase() : 'KNOCKOUT') }}
        </span>
        <span class="text-xs text-slate-400 font-medium hidden sm:inline">Klik nama pemain untuk menambah skor langsung</span>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="status"
          @change="simpanPerubahanSkor(false)"
          class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-ink-900 outline-none transition focus:border-ucl-500 cursor-pointer"
        >
          <option value="scheduled">Jadwal (Scheduled)</option>
          <option value="ongoing">Sedang Main (Live)</option>
          <option value="finished">Selesai (Finished)</option>
        </select>
      </div>
    </div>

    <!-- BO3 Series & Aggregate Info Card (Hanya muncul saat Semi Final / Final) -->
    <div
      v-if="infoSeriBO3"
      class="p-3.5 rounded-xl bg-gradient-to-r from-ucl-50 via-blue-50/60 to-gold-50/50 border border-ucl-200/70 shadow-xs space-y-2.5"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-ucl-600 text-white font-bold text-[10px] uppercase tracking-wider">
            Format BO3
          </span>
          <span class="text-xs font-bold text-ink-900">
            {{ infoSeriBO3.baseSlot }} — Game {{ infoSeriBO3.gameKe }} dari 3
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <!-- Agregat Skor Seri BO3 (Menang Game) -->
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-ucl-200 text-ucl-800 shadow-2xs">
            <Layers class="w-3.5 h-3.5 text-ucl-600" />
            <span>Agregat BO3: <strong class="text-ucl-700 font-bold font-mono text-sm">{{ infoSeriBO3.winA }} – {{ infoSeriBO3.winB }}</strong> ({{ infoSeriBO3.timAShort }} vs {{ infoSeriBO3.timBShort }})</span>
          </div>
          <div v-if="infoSeriBO3.viaAgregatGol" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs font-semibold">
            <span>Agg Gol: <strong class="font-mono">{{ infoSeriBO3.golA }}–{{ infoSeriBO3.golB }}</strong> ({{ infoSeriBO3.pemenangShort }} Lolos)</span>
          </div>
          <div v-else-if="infoSeriBO3.isSelesaiSeri" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-2xs font-semibold">
            <span>{{ infoSeriBO3.pemenangShort }} Lolos</span>
          </div>
        </div>
      </div>

      <!-- Rincian Game-Game di Seri Ini -->
      <div class="flex flex-wrap items-center gap-2 pt-1.5 border-t border-ucl-100 text-[11px]">
        <span class="text-slate-500 font-medium">Riwayat Game:</span>
        <div
          v-for="g in infoSeriBO3.rincianGames"
          :key="g.id"
          class="px-2 py-0.5 rounded-md border text-[11px] font-mono flex items-center gap-1"
          :class="
            g.isCurrentMatch
              ? 'bg-ucl-600 text-white border-ucl-700 font-bold shadow-xs'
              : g.status === 'finished'
                ? 'bg-white border-slate-300 text-slate-800 font-semibold'
                : 'bg-slate-100 border-slate-200 text-slate-400'
          "
        >
          <span>G{{ g.gameNumber }}:</span>
          <span>{{ g.status === 'finished' ? `${g.homeTeamShort} ${g.homeScore} - ${g.awayScore} ${g.awayTeamShort}` : (g.isCurrentMatch ? 'Sedang Diedit' : 'Belum Main') }}</span>
        </div>
      </div>
    </div>

    <!-- Live Interactive Scoreboard -->
    <div class="bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-ucl-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="grid grid-cols-1 md:grid-cols-11 items-center gap-4 relative z-10">
        <!-- Home Team Card & Score -->
        <div class="md:col-span-5 flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
          <div class="flex items-center gap-3 min-w-0">
            <img
              v-if="laga.home_team?.logo_url"
              :src="laga.home_team.logo_url"
              :alt="laga.home_team.name"
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-white/10 border border-white/15 p-1 shrink-0"
            />
            <div
              v-else
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-bold text-xs text-gold-400 tracking-wider shrink-0"
            >
              {{ laga.home_team?.short_name || 'HOM' }}
            </div>
            <div class="min-w-0">
              <span class="text-[10px] uppercase font-semibold text-gold-400 tracking-wider block">Klub Home</span>
              <h4 class="font-display text-sm sm:text-base font-bold text-white truncate">{{ laga.home_team?.name || 'Home Team' }}</h4>
              <span class="text-[11px] text-slate-300 truncate block">{{ laga.home_team?.manager_name || '-' }}</span>
            </div>
          </div>

          <!-- Counter Skor Home -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="ubahSkorManual('home', -1)"
              class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition text-white flex items-center justify-center cursor-pointer disabled:opacity-30"
              :disabled="homeScore <= 0"
              title="Kurangi skor"
            >
              <Minus class="w-3.5 h-3.5" />
            </button>
            <span class="font-display text-2xl sm:text-3xl font-extrabold text-gold-400 min-w-[32px] text-center tabular-nums">
              {{ homeScore }}
            </span>
            <button
              type="button"
              @click="ubahSkorManual('home', 1)"
              class="w-7 h-7 rounded-lg bg-ucl-600 hover:bg-ucl-500 active:scale-95 transition text-white flex items-center justify-center cursor-pointer"
              title="Tambah skor manual"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Center VS / Match Status -->
        <div class="md:col-span-1 flex md:flex-col items-center justify-center text-center gap-1">
          <span class="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-300">VS</span>
        </div>

        <!-- Away Team Card & Score -->
        <div class="md:col-span-5 flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
          <!-- Counter Skor Away -->
          <div class="flex items-center gap-2 shrink-0 order-2 md:order-1">
            <button
              type="button"
              @click="ubahSkorManual('away', -1)"
              class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition text-white flex items-center justify-center cursor-pointer disabled:opacity-30"
              :disabled="awayScore <= 0"
              title="Kurangi skor"
            >
              <Minus class="w-3.5 h-3.5" />
            </button>
            <span class="font-display text-2xl sm:text-3xl font-extrabold text-gold-400 min-w-[32px] text-center tabular-nums">
              {{ awayScore }}
            </span>
            <button
              type="button"
              @click="ubahSkorManual('away', 1)"
              class="w-7 h-7 rounded-lg bg-ucl-600 hover:bg-ucl-500 active:scale-95 transition text-white flex items-center justify-center cursor-pointer"
              title="Tambah skor manual"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="flex items-center gap-3 min-w-0 order-1 md:order-2 md:text-right">
            <div class="min-w-0">
              <span class="text-[10px] uppercase font-semibold text-gold-400 tracking-wider block">Klub Away</span>
              <h4 class="font-display text-sm sm:text-base font-bold text-white truncate">{{ laga.away_team?.name || 'Away Team' }}</h4>
              <span class="text-[11px] text-slate-300 truncate block">{{ laga.away_team?.manager_name || '-' }}</span>
            </div>
            <img
              v-if="laga.away_team?.logo_url"
              :src="laga.away_team.logo_url"
              :alt="laga.away_team.name"
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-white/10 border border-white/15 p-1 shrink-0"
            />
            <div
              v-else
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-bold text-xs text-gold-400 tracking-wider shrink-0"
            >
              {{ laga.away_team?.short_name || 'AWY' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick-Click Player Squads (2 Kolom) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Skuad Tim Home -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-card">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-1.5 min-w-0">
            <Shield class="w-4 h-4 text-ucl-600 shrink-0" />
            <span class="text-xs font-bold text-ink-900 truncate">{{ laga.home_team?.name }}</span>
          </div>
          <span class="text-[10px] font-semibold text-slate-400">Klik = +1 Gol</span>
        </div>

        <div v-if="pemainHome.length === 0" class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
          Belum ada data pemain terdaftar untuk tim ini.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          <button
            v-for="p in pemainHome"
            :key="p.id"
            type="button"
            @click="tambahGolPemain(p, 'home')"
            class="flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer active:scale-95"
            :class="feedbackPemainId === p.id ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/30' : 'bg-slate-50 hover:bg-ucl-50/70 border-slate-200 hover:border-ucl-300 text-ink-900'"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-5 h-5 rounded bg-white border border-slate-200 text-[10px] font-bold text-navy-800 flex items-center justify-center shrink-0">
                #{{ p.squad_number || '?' }}
              </span>
              <span class="text-xs font-semibold truncate">{{ p.name }}</span>
            </div>
            <span class="text-[10px] font-semibold text-ucl-600 px-1.5 py-0.5 rounded bg-white border border-slate-200 shrink-0">
              +1 ⚽
            </span>
          </button>
        </div>
      </div>

      <!-- Skuad Tim Away -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-card">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-1.5 min-w-0">
            <Shield class="w-4 h-4 text-gold-600 shrink-0" />
            <span class="text-xs font-bold text-ink-900 truncate">{{ laga.away_team?.name }}</span>
          </div>
          <span class="text-[10px] font-semibold text-slate-400">Klik = +1 Gol</span>
        </div>

        <div v-if="pemainAway.length === 0" class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
          Belum ada data pemain terdaftar untuk tim ini.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          <button
            v-for="p in pemainAway"
            :key="p.id"
            type="button"
            @click="tambahGolPemain(p, 'away')"
            class="flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer active:scale-95"
            :class="feedbackPemainId === p.id ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/30' : 'bg-slate-50 hover:bg-gold-50/70 border-slate-200 hover:border-gold-300 text-ink-900'"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-5 h-5 rounded bg-white border border-slate-200 text-[10px] font-bold text-navy-800 flex items-center justify-center shrink-0">
                #{{ p.squad_number || '?' }}
              </span>
              <span class="text-xs font-semibold truncate">{{ p.name }}</span>
            </div>
            <span class="text-[10px] font-semibold text-gold-700 px-1.5 py-0.5 rounded bg-white border border-slate-200 shrink-0">
              +1 ⚽
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Riwayat Gol Laga Ini -->
    <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-card">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-1.5 text-xs font-semibold text-ink-900">
          <Flame class="w-4 h-4 text-ucl-600" />
          <span>Daftar Gol Tercatat</span>
        </div>
        <span class="text-[11px] font-semibold text-slate-500 tabular-nums">
          Total Gol: {{ daftarEvent.length }}
        </span>
      </div>

      <div v-if="daftarEvent.length === 0" class="py-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg">
        Belum ada pencetak gol tercatat. Klik nama pemain pada daftar skuad di atas untuk menambahkan gol.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
        <div
          v-for="ev in daftarEvent"
          :key="ev.id"
          class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs gap-2 transition hover:bg-slate-100"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white border border-slate-200 text-navy-800 shrink-0">
              {{ ev.team?.short_name || 'TIM' }}
            </span>
            <span class="font-semibold text-ink-900 truncate">
              {{ ev.player?.name || 'Pemain' }}
            </span>
          </div>

          <button
            type="button"
            @click="hapusGol(ev)"
            class="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer shrink-0"
            title="Hapus gol (otomatis kurangi -1 skor)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Setting Waktu & Tombol Aksi -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
      <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
        <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span class="text-slate-500 font-medium">Jadwal:</span>
        <input
          v-model="scheduledAt"
          @change="simpanPerubahanSkor(false)"
          type="datetime-local"
          class="bg-transparent text-xs text-ink-900 outline-none cursor-pointer"
        />
      </div>

      <div class="flex items-center gap-2 justify-end">
        <TombolDasar
          @click="emit('tutup')"
          varian="sekunder"
          class="justify-center !px-3.5"
        >
          Tutup
        </TombolDasar>

        <TombolDasar
          @click="simpanPerubahanSkor(true)"
          varian="primer"
          :sedangMemuat="sedangMemuat"
          class="justify-center"
        >
          <CheckCircle2 class="w-4 h-4 mr-1.5" />
          Simpan &amp; Selesai
        </TombolDasar>
      </div>
    </div>
  </div>
</template>
