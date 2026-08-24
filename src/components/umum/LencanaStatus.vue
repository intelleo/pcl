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
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border transition-colors"
    :class="{
      'bg-slate-800/80 text-slate-400 border-slate-700': status === 'scheduled' || status === 'draft',
      'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse': status === 'ongoing',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': status === 'finished' || status === 'completed',
      'bg-cyan-500/10 text-cyan-400 border-cyan-500/30': status === 'group_stage',
      'bg-amber-500/10 text-amber-400 border-amber-500/30': status === 'knockout'
    }"
  >
    <span
      v-if="status === 'ongoing'"
      class="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-400 animate-ping"
    ></span>
    {{ labelStatus[status] || status }}
  </span>
</template>
