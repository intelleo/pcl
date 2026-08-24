<script setup>
import { Shield, User, Star, ChevronRight } from 'lucide-vue-next'

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
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-ucl-500/40 flex items-center justify-center font-display font-semibold text-sm text-navy-800 transition-colors">
          {{ tim.short_name || 'TIM' }}
        </div>

        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-[11px] font-semibold text-ucl-600">
          <Star class="w-3 h-3 fill-ucl-100" />
          <span class="tabular-nums">{{ tim.rating || 90 }} OVR</span>
        </div>
      </div>

      <div>
        <h3 class="text-base font-semibold tracking-tight text-ink-900 group-hover:text-ucl-600 transition-colors truncate">
          {{ tim.name }}
        </h3>
        <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <User class="w-3.5 h-3.5 text-ink-400" />
          <span>{{ tim.manager_name || 'Pelatih Kepala' }}</span>
        </div>
        <p v-if="tim.stadium" class="text-xs text-slate-400 mt-1 truncate">
          {{ tim.stadium }}
        </p>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span class="flex items-center gap-1.5 font-medium text-slate-500">
        <Shield class="w-3.5 h-3.5 text-ucl-600" />
        {{ tim.group_name || 'Grup PCL' }}
      </span>
      <span class="text-ucl-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
        Detail <ChevronRight class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>
