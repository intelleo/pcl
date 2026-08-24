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
    class="relative bg-pcl-card/95 hover:bg-pcl-cardLight border border-pcl-border hover:border-pcl-gold/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-pcl-gold/10 group"
  >
    <!-- Header: Matchday / Grup & Status -->
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-pcl-border/70 text-xs text-pcl-silver font-semibold">
      <span>
        {{ laga.group?.name ? laga.group.name : 'Knockout Stage' }}
        <span class="text-pcl-silver/60">• Matchday {{ laga.matchday }}</span>
      </span>
      <LencanaStatus :status="laga.status" />
    </div>

    <!-- Match Teams & Score Grid -->
    <div class="space-y-3">
      <!-- Home Team -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-b from-pcl-royal/40 to-pcl-navy border border-pcl-border flex items-center justify-center font-bold text-xs text-pcl-gold shadow-sm">
            {{ laga.home_team?.short_name || 'HOM' }}
          </div>
          <span class="text-sm font-bold text-slate-100 group-hover:text-pcl-goldLight transition-colors">
            {{ laga.home_team?.name || 'Home Team' }}
          </span>
        </div>
        <span
          class="text-base font-black px-2.5 py-0.5 rounded-md font-mono"
          :class="[
            laga.status === 'finished'
              ? laga.home_score > laga.away_score ? 'bg-pcl-gold/20 text-pcl-goldLight border border-pcl-gold/30' : 'bg-pcl-navy text-pcl-silver'
              : 'text-slate-500'
          ]"
        >
          {{ laga.status !== 'scheduled' ? laga.home_score : '-' }}
        </span>
      </div>

      <!-- Away Team -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-b from-pcl-royal/40 to-pcl-navy border border-pcl-border flex items-center justify-center font-bold text-xs text-pcl-blueGlow shadow-sm">
            {{ laga.away_team?.short_name || 'AWY' }}
          </div>
          <span class="text-sm font-bold text-slate-100 group-hover:text-pcl-goldLight transition-colors">
            {{ laga.away_team?.name || 'Away Team' }}
          </span>
        </div>
        <span
          class="text-base font-black px-2.5 py-0.5 rounded-md font-mono"
          :class="[
            laga.status === 'finished'
              ? laga.away_score > laga.home_score ? 'bg-pcl-gold/20 text-pcl-goldLight border border-pcl-gold/30' : 'bg-pcl-navy text-pcl-silver'
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
      class="mt-3 pt-2 border-t border-pcl-border/40 text-[11px] text-center text-pcl-goldLight font-bold"
    >
      Adu Penalti: {{ laga.home_penalty_score }} - {{ laga.away_penalty_score }}
    </div>
  </div>
</template>
