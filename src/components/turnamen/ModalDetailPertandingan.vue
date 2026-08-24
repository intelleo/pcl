<script setup>
import { computed } from 'vue'
import ModalDialog from '../umum/ModalDialog.vue'
import LencanaStatus from '../umum/LencanaStatus.vue'
import { Award, Flame, Trophy, Star } from 'lucide-vue-next'

const props = defineProps({
  terbuka: {
    type: Boolean,
    default: false
  },
  laga: {
    type: Object,
    default: null
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tutup'])

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
</script>

<template>
  <ModalDialog :terbuka="terbuka" judul="Rincian Laga" @tutup="emit('tutup')" lebarMaksimal="max-w-lg">
    <div v-if="laga" class="space-y-4">
      <div class="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4">
        <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <span class="flex items-center gap-1.5 text-xs font-semibold text-ink-600 truncate">
            <Trophy class="w-3.5 h-3.5 text-ucl-600 shrink-0" />
            <span class="truncate">{{ laga.group?.name || laga.stage?.replace('_', ' ') || 'PCL 2026' }}</span>
            <span v-if="laga.matchday" class="tabular-nums text-slate-400">· MD {{ laga.matchday }}</span>
          </span>
          <LencanaStatus :status="laga.status" />
        </div>

        <div class="grid grid-cols-3 items-center gap-2 py-1">
          <div class="text-center space-y-1.5 min-w-0">
            <div class="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center font-display font-semibold text-sm text-navy-800">
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
            <div class="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center font-display font-semibold text-sm text-navy-800">
              {{ laga.away_team?.short_name || 'AWY' }}
            </div>
            <h4 class="font-semibold text-xs text-ink-900 line-clamp-2">
              {{ laga.away_team?.name }}
            </h4>
          </div>
        </div>

        <div
          v-if="laga.home_penalty_score !== null && laga.away_penalty_score !== null"
          class="pt-2.5 border-t border-slate-200 text-center text-xs font-semibold text-ink-600 tabular-nums"
        >
          Adu Penalti: {{ laga.home_penalty_score }} – {{ laga.away_penalty_score }}
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
