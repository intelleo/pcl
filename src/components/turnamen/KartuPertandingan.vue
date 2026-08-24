<script setup>
import LencanaStatus from '../umum/LencanaStatus.vue'

defineProps({
  laga: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['klikDetail'])
</script>

<template>
  <div
    @click="emit('klikDetail', laga)"
    class="bg-white border border-slate-200 rounded-xl p-4 transition-shadow duration-150 cursor-pointer shadow-card hover:shadow-lift group space-y-3"
  >
    <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
      <span class="text-[11px] font-semibold text-slate-400 truncate">
        {{ laga.group?.name ? laga.group.name : 'Knockout' }}
        <span class="tabular-nums">· MD {{ laga.matchday }}</span>
      </span>
      <LencanaStatus :status="laga.status" />
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-semibold text-[11px] text-navy-800 shrink-0">
            {{ laga.home_team?.short_name || 'HOM' }}
          </div>
          <span
            class="text-sm truncate transition-colors"
            :class="
              laga.status === 'finished' && laga.home_score > laga.away_score
                ? 'font-semibold text-ink-900'
                : 'font-medium text-ink-600 group-hover:text-ucl-600'
            "
          >
            {{ laga.home_team?.name || 'Home Team' }}
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
          <div class="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-semibold text-[11px] text-navy-800 shrink-0">
            {{ laga.away_team?.short_name || 'AWY' }}
          </div>
          <span
            class="text-sm truncate transition-colors"
            :class="
              laga.status === 'finished' && laga.away_score > laga.home_score
                ? 'font-semibold text-ink-900'
                : 'font-medium text-ink-600 group-hover:text-ucl-600'
            "
          >
            {{ laga.away_team?.name || 'Away Team' }}
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
      v-if="laga.home_penalty_score !== null && laga.away_penalty_score !== null"
      class="pt-2 border-t border-slate-100 text-[11px] text-center text-slate-500 font-medium tabular-nums"
    >
      Penalti: {{ laga.home_penalty_score }} – {{ laga.away_penalty_score }}
    </div>
  </div>
</template>
