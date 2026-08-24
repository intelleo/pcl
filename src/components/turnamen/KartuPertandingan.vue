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
    class="relative bg-pcl-card/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-950/20 group"
  >
    <!-- Header: Matchday / Grup & Status -->
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60 text-xs text-slate-400 font-semibold">
      <span>
        {{ laga.group?.name ? laga.group.name : 'Knockout Stage' }}
        <span class="text-slate-500">• Matchday {{ laga.matchday }}</span>
      </span>
      <LencanaStatus :status="laga.status" />
    </div>

    <!-- Match Teams & Score Grid -->
    <div class="space-y-3">
      <!-- Home Team -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
            {{ laga.home_team?.short_name || 'HOM' }}
          </div>
          <span class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
            {{ laga.home_team?.name || 'Home Team' }}
          </span>
        </div>
        <span
          class="text-base font-black px-2.5 py-0.5 rounded font-mono"
          :class="[
            laga.status === 'finished'
              ? laga.home_score > laga.away_score ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
              : 'text-slate-500'
          ]"
        >
          {{ laga.status !== 'scheduled' ? laga.home_score : '-' }}
        </span>
      </div>

      <!-- Away Team -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
            {{ laga.away_team?.short_name || 'AWY' }}
          </div>
          <span class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
            {{ laga.away_team?.name || 'Away Team' }}
          </span>
        </div>
        <span
          class="text-base font-black px-2.5 py-0.5 rounded font-mono"
          :class="[
            laga.status === 'finished'
              ? laga.away_score > laga.home_score ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
              : 'text-slate-500'
          ]"
        >
          {{ laga.status !== 'scheduled' ? laga.away_score : '-' }}
        </span>
      </div>
    </div>

    <!-- Knockout Penalty Score Indicator -->
    <div
      v-if="laga.home_penalty_score !== null && laga.away_penalty_score !== null"
      class="mt-3 pt-2 border-t border-slate-800/40 text-[11px] text-center text-amber-400 font-semibold"
    >
      Adu Penalti: {{ laga.home_penalty_score }} - {{ laga.away_penalty_score }}
    </div>
  </div>
</template>
