<script setup>
import { Shield, User, ChevronRight } from 'lucide-vue-next'

defineProps({
  tim: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['klikDetail'])
</script>

<template>
  <div
    @click="emit('klikDetail', tim)"
    class="bg-white border border-slate-200 rounded-xl p-5 transition-shadow duration-150 cursor-pointer shadow-card hover:shadow-lift group flex flex-col justify-between"
  >
    <div class="space-y-3.5">
      <div class="flex items-start justify-between gap-2">
        <img
          v-if="tim.logo_url"
          :src="tim.logo_url"
          :alt="tim.name"
          class="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 group-hover:border-ucl-500/40 p-1.5 transition-colors shrink-0"
        />
        <div
          v-else
          class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-ucl-500/40 flex items-center justify-center font-display font-bold text-xs text-navy-800 tracking-wider transition-colors shrink-0"
        >
          {{ tim.short_name || 'TIM' }}
        </div>
      </div>

      <div>
        <h3 class="text-base font-semibold tracking-tight text-ink-900 group-hover:text-ucl-600 transition-colors truncate">
          {{ tim.name }}
        </h3>
        <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <User class="w-3.5 h-3.5 text-ink-400" />
          <span>{{ tim.manager_name || '-' }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span class="flex items-center gap-1.5 font-medium text-slate-500">
        <Shield class="w-3.5 h-3.5 text-ucl-600" />
        {{ tim.group_name || 'Belum Ditentukan' }}
      </span>
      <span class="text-ucl-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
        Detail <ChevronRight class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>
