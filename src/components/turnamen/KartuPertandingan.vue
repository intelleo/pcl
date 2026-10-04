<script setup>
import { computed } from 'vue'
import LencanaStatus from '../umum/LencanaStatus.vue'
import { Calendar, Layers } from 'lucide-vue-next'
import { hitungStatusSeriBO3 } from '../../composables/useKnockout.js'

const props = defineProps({
  laga: {
    type: Object,
    required: true
  },
  semuaLaga: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['klikDetail'])

const infoSeriBO3 = computed(() => hitungStatusSeriBO3(props.laga, props.semuaLaga))

const placeholderHomeName = computed(() => {
  if (props.laga.home_team?.name) return props.laga.home_team.name
  const stage = props.laga.stage
  const slot = props.laga.knockout_bracket_slot || ''
  if (stage === 'semi_final') {
    const isSF1 = /SF[- ]?1/i.test(slot)
    return isSF1 ? 'Pemenang QF 1' : 'Pemenang QF 3'
  }
  if (stage === 'final') {
    return 'Pemenang SF 1'
  }
  return 'Home Team'
})

const placeholderAwayName = computed(() => {
  if (props.laga.away_team?.name) return props.laga.away_team.name
  const stage = props.laga.stage
  const slot = props.laga.knockout_bracket_slot || ''
  if (stage === 'semi_final') {
    const isSF1 = /SF[- ]?1/i.test(slot)
    return isSF1 ? 'Pemenang QF 2' : 'Pemenang QF 4'
  }
  if (stage === 'final') {
    return 'Pemenang SF 2'
  }
  return 'Away Team'
})

const placeholderHomeShort = computed(() => {
  if (props.laga.home_team?.short_name) return props.laga.home_team.short_name
  const stage = props.laga.stage
  const slot = props.laga.knockout_bracket_slot || ''
  if (stage === 'semi_final') {
    const isSF1 = /SF[- ]?1/i.test(slot)
    return isSF1 ? 'W1' : 'W3'
  }
  if (stage === 'final') return 'F1'
  return 'HOM'
})

const placeholderAwayShort = computed(() => {
  if (props.laga.away_team?.short_name) return props.laga.away_team.short_name
  const stage = props.laga.stage
  const slot = props.laga.knockout_bracket_slot || ''
  if (stage === 'semi_final') {
    const isSF1 = /SF[- ]?1/i.test(slot)
    return isSF1 ? 'W2' : 'W4'
  }
  if (stage === 'final') return 'F2'
  return 'AWY'
})

const labelBabak = computed(() => {
  const stage = props.laga.stage
  const slot = props.laga.knockout_bracket_slot
  let namaStage = 'Turnamen'

  if (stage === 'group') namaStage = 'Fase Grup'
  else if (stage === 'round_of_32') namaStage = 'Babak 32 Besar'
  else if (stage === 'round_of_16') namaStage = 'Babak 16 Besar'
  else if (stage === 'quarter_final') namaStage = 'Perempat Final'
  else if (stage === 'semi_final') namaStage = 'Semi Final'
  else if (stage === 'final') namaStage = 'Grand Final'

  if (slot) return `${namaStage} · ${slot}`
  return namaStage
})

function formatWaktu(isoStr) {
  if (!isoStr) return null
  try {
    const d = new Date(isoStr)
    const hariStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    const jamStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return `${hariStr} · ${jamStr} WIB`
  } catch (e) {
    return null
  }
}
</script>

<template>
  <div
    @click="emit('klikDetail', laga)"
    class="bg-white border border-slate-200 rounded-xl p-4 transition-shadow duration-150 cursor-pointer shadow-card hover:shadow-lift group space-y-3"
  >
    <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
      <div class="flex items-center gap-1.5 truncate">
        <span
          v-if="infoSeriBO3"
          class="px-1.5 py-0.5 rounded bg-gold-50 border border-gold-200 text-gold-700 text-[10px] font-bold uppercase tracking-wider shrink-0"
        >
          BO3
        </span>
        <span class="text-[11px] font-semibold text-slate-500 truncate">
          {{ labelBabak }}
        </span>
      </div>
      <LencanaStatus :status="laga.status" />
    </div>

    <!-- Badge Agregat BO3 jika laga Quarter/Semi/Final dan tim sudah terisi -->
    <div
      v-if="infoSeriBO3 && (laga.home_team_id || laga.away_team_id)"
      class="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]"
    >
      <div class="flex items-center gap-1.5 text-ucl-800 font-semibold truncate">
        <Layers class="w-3.5 h-3.5 text-ucl-600 shrink-0" />
        <span class="truncate">
          BO3: <strong class="font-mono text-ucl-700 font-bold">{{ infoSeriBO3.winA }} – {{ infoSeriBO3.winB }}</strong>
          <span v-if="infoSeriBO3.viaAgregatGol" class="text-amber-700 font-medium ml-1">
            (Agg Gol: {{ infoSeriBO3.golA }}–{{ infoSeriBO3.golB }}, {{ infoSeriBO3.pemenangShort }} Lolos)
          </span>
          <span v-else-if="infoSeriBO3.isSelesaiSeri" class="text-emerald-700 font-medium ml-1">
            ({{ infoSeriBO3.pemenangShort }} Lolos)
          </span>
          <span v-else class="text-slate-500 font-normal ml-1">
            ({{ infoSeriBO3.timAShort }} vs {{ infoSeriBO3.timBShort }})
          </span>
        </span>
      </div>
      <span class="text-slate-500 text-[10px] font-medium shrink-0 ml-1">
        Game {{ infoSeriBO3.gameKe }}/3
      </span>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <img
            v-if="laga.home_team?.logo_url"
            :src="laga.home_team.logo_url"
            :alt="laga.home_team.name"
            class="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-0.5"
            loading="lazy"
            decoding="async"
          />
          <div
            v-else
            class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-blue-900 tracking-wider shrink-0"
          >
            {{ placeholderHomeShort }}
          </div>
          <span
            class="text-sm truncate transition-colors"
            :class="
              laga.status === 'finished' && laga.home_score > laga.away_score
                ? 'font-semibold text-ink-900'
                : 'font-medium text-ink-600 group-hover:text-ucl-600'
            "
          >
            {{ placeholderHomeName }}
          </span>
        </div>
        <span
          class="text-base tabular-nums min-w-[1.5rem] text-right"
          :class="[
            laga.status === 'finished'
              ? laga.home_score > laga.away_score ? 'text-ucl-600 font-semibold' : 'text-slate-400'
              : 'text-slate-400'
          ]"
        >
          {{ laga.status !== 'scheduled' ? laga.home_score : '-' }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <img
            v-if="laga.away_team?.logo_url"
            :src="laga.away_team.logo_url"
            :alt="laga.away_team.name"
            class="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-0.5"
            loading="lazy"
            decoding="async"
          />
          <div
            v-else
            class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-amber-700 tracking-wider shrink-0"
          >
            {{ placeholderAwayShort }}
          </div>
          <span
            class="text-sm truncate transition-colors"
            :class="
              laga.status === 'finished' && laga.away_score > laga.home_score
                ? 'font-semibold text-ink-900'
                : 'font-medium text-ink-600 group-hover:text-ucl-600'
            "
          >
            {{ placeholderAwayName }}
          </span>
        </div>
        <span
          class="text-base tabular-nums min-w-[1.5rem] text-right"
          :class="[
            laga.status === 'finished'
              ? laga.away_score > laga.home_score ? 'text-ucl-600 font-semibold' : 'text-slate-400'
              : 'text-slate-400'
          ]"
        >
          {{ laga.status !== 'scheduled' ? laga.away_score : '-' }}
        </span>
      </div>
    </div>

    <div
      v-if="formatWaktu(laga.scheduled_at)"
      class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium"
    >
      <span class="inline-flex items-center gap-1 text-slate-500">
        <Calendar class="w-3 h-3 text-slate-400" />
        {{ formatWaktu(laga.scheduled_at) }}
      </span>
    </div>
  </div>
</template>
