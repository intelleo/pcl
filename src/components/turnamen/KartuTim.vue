<script setup>
import { Shield, User } from 'lucide-vue-next'

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
    class="bg-pcl-card/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-950/20 group flex flex-col justify-between"
  >
    <div class="flex items-start gap-4">
      <!-- Team Badge Placeholder / Logo -->
      <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200 group-hover:border-emerald-500/40 transition-colors">
        {{ tim.short_name || 'TIM' }}
      </div>

      <div class="flex-1">
        <h3 class="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
          {{ tim.name }}
        </h3>
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <User class="w-3.5 h-3.5 text-slate-500" />
          <span>{{ tim.manager_name || 'Tanpa Manajer' }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
      <span class="flex items-center gap-1">
        <Shield class="w-3.5 h-3.5 text-emerald-400" />
        PCL Contender
      </span>
      <span class="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
        Lihat Skuad →
      </span>
    </div>
  </div>
</template>
