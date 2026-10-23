<script setup>
import { Award, Activity } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

defineProps({
  laga: {
    type: Object,
    required: true
  }
})

defineEmits(['lihatDetail'])
</script>

<template>
  <div class="rounded-2xl bg-white border border-slate-200 shadow-card p-4 sm:p-5 space-y-3 hover:shadow-lift transition-shadow">
    <div class="flex items-center justify-between border-b border-slate-100 pb-2">
      <span class="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Laga Terkait
      </span>
      <span class="font-mono text-[10px] sm:text-[11px] font-bold text-ucl-600">MD {{ laga.matchday }}</span>
    </div>

    <div class="flex items-center justify-between py-1">
      <div class="text-center min-w-0 flex-1">
        <div class="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-navy-800 text-xs">
          {{ laga.home_team?.short_name || 'H' }}
        </div>
        <div class="text-[10px] sm:text-[11px] font-medium text-ink-600 mt-1 truncate max-w-[80px] mx-auto">
          {{ laga.home_team?.name || 'Home' }}
        </div>
      </div>

      <div class="text-center px-2 shrink-0">
        <div class="font-mono text-sm sm:text-base font-bold text-ink-900 tracking-wider">
          {{ laga.home_score ?? 0 }} - {{ laga.away_score ?? 0 }}
        </div>
        <div class="text-[9px] uppercase font-semibold text-slate-400 mt-0.5">
          {{ laga.status === 'finished' ? 'Selesai' : 'Jadwal' }}
        </div>
      </div>

      <div class="text-center min-w-0 flex-1">
        <div class="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-navy-800 text-xs">
          {{ laga.away_team?.short_name || 'A' }}
        </div>
        <div class="text-[10px] sm:text-[11px] font-medium text-ink-600 mt-1 truncate max-w-[80px] mx-auto">
          {{ laga.away_team?.name || 'Away' }}
        </div>
      </div>
    </div>

    <div v-if="laga.mvp" class="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-1.5">
      <Award class="w-3.5 h-3.5 text-gold-500 shrink-0" />
      <span class="text-ink-600 truncate">MVP: <strong class="text-ink-900 font-semibold">{{ laga.mvp.name }}</strong></span>
    </div>

    <TombolDasar
      varian="primer"
      @click="$emit('lihatDetail')"
      class="w-full text-xs sm:text-sm py-2"
    >
      <Activity class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
      Lihat Detail Laga
    </TombolDasar>
  </div>
</template>
