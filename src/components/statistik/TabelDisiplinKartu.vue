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
        <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
        Kedisiplinan & Kartu
      </h3>
      <div class="flex items-center gap-3 text-[11px] font-bold">
        <span class="text-amber-400">KUNING</span>
        <span class="text-red-400">MERAH</span>
      </div>
    </div>

    <div v-if="data.length === 0" class="p-8 text-center text-slate-500 text-sm">
      Belum ada data pelanggaran / kartu.
    </div>

    <div v-else class="divide-y divide-slate-800/60">
      <div
        v-for="(item, idx) in data"
        :key="item.player_id"
        class="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-slate-500 bg-slate-800">
            {{ idx + 1 }}
          </span>
          <div>
            <div class="text-sm font-bold text-slate-200">{{ item.name }}</div>
            <div class="text-[11px] text-slate-400 font-semibold">{{ item.team_short }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3 font-mono font-bold text-sm">
          <span class="w-6 h-8 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            {{ item.kuning }}
          </span>
          <span class="w-6 h-8 rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center">
            {{ item.merah }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
