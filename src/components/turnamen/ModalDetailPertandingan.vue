<script setup>
import { computed } from 'vue'
import ModalDialog from '../umum/ModalDialog.vue'
import LencanaStatus from '../umum/LencanaStatus.vue'
import { Award, Flame, Trophy, Star, Layers } from 'lucide-vue-next'
import { hitungStatusSeriBO3 } from '../../composables/useKnockout.js'

const props = defineProps({
  terbuka: {
    type: Boolean,
    default: false
  },
  laga: {
    type: Object,
    default: null
  },
  semuaLaga: {
    type: Array,
    default: () => []
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tutup'])

const infoSeriBO3 = computed(() => hitungStatusSeriBO3(props.laga, props.semuaLaga))

const daftarGol = computed(() => {
  if (!props.events || props.events.length === 0) return []
  return props.events.filter(e => e.event_type === 'goal' || e.event_type === 'penalty_goal')
})

const golHome = computed(() => {
  return daftarGol.value.filter(e => e.team?.short_name === props.laga?.home_team?.short_name)
})

const golAway = computed(() => {
  return daftarGol.value.filter(e => e.team?.short_name === props.laga?.away_team?.short_name)
})

const labelBabak = computed(() => {
  if (!props.laga) return 'PCL 2026'
  const stage = props.laga.stage
  const slot = props.laga.knockout_bracket_slot
  let namaStage = 'Peak Champions League'

  if (stage === 'group') namaStage = 'Fase Grup'
  else if (stage === 'round_of_32') namaStage = 'Babak 32 Besar'
  else if (stage === 'round_of_16') namaStage = 'Babak 16 Besar'
  else if (stage === 'quarter_final') namaStage = 'Perempat Final'
  else if (stage === 'semi_final') namaStage = 'Semi Final'
  else if (stage === 'final') namaStage = 'Grand Final'

  if (slot) return `${namaStage} · ${slot}`
  return namaStage
})
</script>

<template>
  <ModalDialog :terbuka="terbuka" judul="Rincian Laga" @tutup="emit('tutup')" lebarMaksimal="max-w-lg">
    <div v-if="laga" class="space-y-4">
      <!-- Banner Ringkasan Seri BO3 jika laga SF / Final -->
      <div
        v-if="infoSeriBO3"
        class="rounded-xl bg-gradient-to-r from-ucl-50 via-blue-50/70 to-gold-50/60 border border-ucl-200/80 p-3.5 space-y-2.5 shadow-xs"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="flex items-center gap-1.5 text-xs font-bold text-ucl-900">
            <Layers class="w-3.5 h-3.5 text-ucl-600" />
            <span>Format Best of 3 (BO3) — {{ infoSeriBO3.baseSlot }}</span>
          </span>
          <span class="px-2 py-0.5 rounded bg-ucl-600 text-white text-[10px] font-bold">
            Game {{ infoSeriBO3.gameKe }} dari 3
          </span>
        </div>

        <div class="p-2.5 rounded-lg bg-white border border-ucl-200/80 text-center space-y-1">
          <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Agregat Seri BO3</span>
          <span class="text-base font-extrabold text-ucl-700 font-mono block">
            {{ infoSeriBO3.timAShort }} {{ infoSeriBO3.winA }} – {{ infoSeriBO3.winB }} {{ infoSeriBO3.timBShort }}
          </span>
          <div v-if="infoSeriBO3.viaAgregatGol" class="text-[11px] text-amber-800 bg-amber-50 rounded px-2 py-0.5 border border-amber-200 inline-block font-semibold">
            Seri {{ infoSeriBO3.winA }}–{{ infoSeriBO3.winB }} · Unggul Agregat Gol: {{ infoSeriBO3.golA }} – {{ infoSeriBO3.golB }} ({{ infoSeriBO3.pemenangSeri }} Lolos)
          </div>
          <div v-else-if="infoSeriBO3.isSelesaiSeri" class="text-[11px] text-emerald-800 bg-emerald-50 rounded px-2 py-0.5 border border-emerald-200 inline-block font-semibold">
            Pemenang Seri: {{ infoSeriBO3.pemenangSeri }} Lolos
          </div>
        </div>

        <!-- Mini tracker per game -->
        <div class="flex items-center justify-around gap-1.5 pt-1.5 border-t border-ucl-100 text-[11px] font-mono">
          <div
            v-for="g in infoSeriBO3.rincianGames"
            :key="g.id"
            class="px-2 py-0.5 rounded border flex items-center gap-1"
            :class="
              g.isCurrentMatch
                ? 'bg-ucl-600 text-white font-bold border-ucl-700'
                : g.status === 'finished'
                  ? 'bg-white text-slate-800 font-semibold border-slate-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
            "
          >
            <span>G{{ g.gameNumber }}:</span>
            <span>{{ g.status === 'finished' ? `${g.homeTeamShort} ${g.homeScore}-${g.awayScore} ${g.awayTeamShort}` : (g.isCurrentMatch ? 'Laga Ini' : '—') }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4">
        <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <span class="flex items-center gap-1.5 text-xs font-semibold text-ink-600 truncate">
            <Trophy class="w-3.5 h-3.5 text-ucl-600 shrink-0" />
            <span class="truncate">{{ labelBabak }}</span>
          </span>
          <LencanaStatus :status="laga.status" />
        </div>

        <div class="grid grid-cols-3 items-center gap-2 py-1">
          <div class="text-center space-y-1.5 min-w-0">
            <img
              v-if="laga.home_team?.logo_url"
              :src="laga.home_team.logo_url"
              :alt="laga.home_team.name"
              class="w-12 h-12 mx-auto rounded-xl object-contain bg-white border border-slate-200 p-1.5 shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-bold text-xs text-blue-900 tracking-wider"
            >
              {{ laga.home_team?.short_name || 'HOM' }}
            </div>
            <h4 class="font-semibold text-xs text-ink-900 line-clamp-2">
              {{ laga.home_team?.name }}
            </h4>
          </div>

          <div class="text-center space-y-1">
            <div class="font-display text-3xl font-semibold tracking-tight tabular-nums text-navy-800">
              {{ laga.status !== 'scheduled' ? `${laga.home_score} – ${laga.away_score}` : 'VS' }}
            </div>
            <span
              class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              :class="
                laga.status === 'finished'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : laga.status === 'ongoing'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-slate-500 border-slate-200'
              "
            >
              {{ laga.status === 'finished' ? 'Full Time' : (laga.status === 'ongoing' ? 'Live' : 'Jadwal') }}
            </span>
          </div>

          <div class="text-center space-y-1.5 min-w-0">
            <img
              v-if="laga.away_team?.logo_url"
              :src="laga.away_team.logo_url"
              :alt="laga.away_team.name"
              class="w-12 h-12 mx-auto rounded-xl object-contain bg-white border border-slate-200 p-1.5 shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-bold text-xs text-amber-700 tracking-wider"
            >
              {{ laga.away_team?.short_name || 'AWY' }}
            </div>
            <h4 class="font-semibold text-xs text-ink-900 line-clamp-2">
              {{ laga.away_team?.name }}
            </h4>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div class="flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Flame class="w-4 h-4 text-ucl-600" />
          <h5 class="text-sm font-semibold text-ink-900">
            Pencetak Gol
          </h5>
        </div>

        <div v-if="daftarGol.length === 0" class="text-center py-4 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
          {{ laga.status === 'finished' && laga.home_score === 0 && laga.away_score === 0 ? 'Pertandingan berakhir imbang (0 – 0).' : 'Belum ada gol tercatat.' }}
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <div class="text-[11px] font-semibold text-ink-600 border-b border-slate-100 pb-1 flex items-center justify-between">
              <span class="truncate">{{ laga.home_team?.name }}</span>
              <span class="tabular-nums">({{ golHome.length }})</span>
            </div>

            <div v-if="golHome.length === 0" class="p-2 text-xs text-slate-400 italic text-center">
              Tidak ada gol
            </div>

            <div v-else class="space-y-1">
              <div
                v-for="g in golHome"
                :key="g.id"
                class="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
              >
                <div class="font-medium text-ink-900 flex items-center gap-1.5 truncate">
                  <span class="w-1.5 h-1.5 rounded-full bg-ucl-500 shrink-0"></span>
                  <span class="truncate">{{ g.player?.name || 'Pemain' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="text-[11px] font-semibold text-ink-600 border-b border-slate-100 pb-1 flex items-center justify-between">
              <span class="truncate">{{ laga.away_team?.name }}</span>
              <span class="tabular-nums">({{ golAway.length }})</span>
            </div>

            <div v-if="golAway.length === 0" class="p-2 text-xs text-slate-400 italic text-center">
              Tidak ada gol
            </div>

            <div v-else class="space-y-1">
              <div
                v-for="g in golAway"
                :key="g.id"
                class="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
              >
                <div class="font-medium text-ink-900 flex items-center gap-1.5 truncate">
                  <span class="w-1.5 h-1.5 rounded-full bg-ucl-500 shrink-0"></span>
                  <span class="truncate">{{ g.player?.name || 'Pemain' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="laga.mvp" class="p-3 rounded-xl bg-gold-400/10 border border-gold-400/40 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 flex items-center justify-center font-semibold shrink-0">
            <Award class="w-3.5 h-3.5" />
          </div>
          <div class="min-w-0">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Player of the Match</div>
            <div class="font-semibold text-ink-900 truncate">{{ laga.mvp.name }} <span class="font-normal text-slate-500">({{ laga.mvp.team_short }})</span></div>
          </div>
        </div>
        <div class="px-2 py-0.5 rounded-full border border-gold-400/50 bg-white font-semibold text-ink-900 text-xs tabular-nums inline-flex items-center gap-1 shrink-0">
          <Star class="w-3 h-3 fill-gold-400 text-gold-400" /> {{ laga.mvp.rating }}
        </div>
      </div>
    </div>
  </ModalDialog>
</template>
