<script setup>
defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) => ['scheduled', 'ongoing', 'finished', 'draft', 'group_stage', 'knockout', 'completed'].includes(v)
  }
})

const labelStatus = {
  scheduled: 'Jadwal',
  ongoing: 'Live',
  finished: 'Selesai',
  draft: 'Draft',
  group_stage: 'Fase Grup',
  knockout: 'Fase Gugur',
  completed: 'Selesai'
}
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border transition-colors shadow-sm"
    :class="{
      'bg-slate-800/80 text-pcl-silver border-slate-700': status === 'scheduled' || status === 'draft',
      'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse': status === 'ongoing',
      'bg-emerald-500/15 text-emerald-300 border-emerald-500/40': status === 'finished' || status === 'completed',
      'bg-pcl-royal/30 text-pcl-blueGlow border-pcl-blueGlow/30': status === 'group_stage',
      'bg-pcl-gold/15 text-pcl-goldLight border-pcl-gold/40': status === 'knockout'
    }"
  >
    <span
      v-if="status === 'ongoing'"
      class="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-400 animate-ping"
    ></span>
    {{ labelStatus[status] || status }}
  </span>
</template>
