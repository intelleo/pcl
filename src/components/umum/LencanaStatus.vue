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
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
    :class="{
      'bg-slate-50 text-slate-500 border-slate-200': status === 'scheduled' || status === 'draft',
      'bg-red-50 text-red-600 border-red-200': status === 'ongoing',
      'bg-emerald-50 text-emerald-700 border-emerald-200': status === 'finished' || status === 'completed',
      'bg-ucl-50 text-ucl-600 border-ucl-100': status === 'group_stage',
      'bg-amber-50 text-amber-700 border-amber-200': status === 'knockout'
    }"
  >
    <span
      v-if="status === 'ongoing'"
      class="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500 animate-pulse"
    ></span>
    {{ labelStatus[status] || status }}
  </span>
</template>
