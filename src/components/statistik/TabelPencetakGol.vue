<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="bg-pcl-card/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
    <div class="px-5 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
      <h3 class="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
        Top Scorer (Pencetak Gol Terbanyak)
      </h3>
      <span class="text-xs text-slate-400 font-mono">GOL</span>
    </div>

    <div v-if="data.length === 0" class="p-8 text-center text-slate-500 text-sm">
      Belum ada data pencetak gol.
    </div>

    <div v-else class="divide-y divide-slate-800/60">
      <div
        v-for="(item, idx) in data"
        :key="item.player_id"
        class="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span
            class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
            :class="[
              idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              idx === 1 ? 'bg-slate-700 text-slate-300' :
              idx === 2 ? 'bg-amber-800/30 text-amber-600' : 'text-slate-500'
            ]"
          >
            {{ idx + 1 }}
          </span>
          <div>
            <div class="text-sm font-bold text-slate-200">{{ item.name }}</div>
            <div class="text-[11px] text-slate-400 font-semibold">{{ item.team_short }}</div>
          </div>
        </div>

        <div class="text-lg font-black font-mono text-emerald-400 px-3 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          {{ item.total }}
        </div>
      </div>
    </div>
  </div>
</template>
