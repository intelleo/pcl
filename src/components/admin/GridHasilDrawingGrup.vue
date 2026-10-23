<script setup>
import { Shield } from 'lucide-vue-next'

defineProps({
  hasilDrawing: {
    type: Object,
    required: true
  },
  targetGrupAktif: {
    type: String,
    default: ''
  },
  sedangDrawing: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(timList, grupName) in hasilDrawing"
      :key="grupName"
      class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card"
    >
      <div
        class="px-4 py-2.5 border-b flex items-center justify-between transition-colors"
        :class="targetGrupAktif === grupName && sedangDrawing ? 'bg-ucl-50/80 border-ucl-200' : 'bg-slate-50 border-slate-200'"
      >
        <span
          class="font-semibold text-xs flex items-center gap-1.5"
          :class="targetGrupAktif === grupName && sedangDrawing ? 'text-ucl-700 font-bold' : 'text-ink-900'"
        >
          <Shield class="w-3.5 h-3.5" :class="targetGrupAktif === grupName && sedangDrawing ? 'text-ucl-600 animate-bounce' : 'text-ucl-600'" />
          {{ grupName }}
          <span v-if="targetGrupAktif === grupName && sedangDrawing" class="text-[10px] text-ucl-600 font-medium animate-pulse">(Sedang Mengundi...)</span>
        </span>
        <span class="text-[11px] font-semibold text-slate-500 tabular-nums">
          {{ timList.length }} Klub
        </span>
      </div>

      <div class="divide-y divide-slate-100 p-2">
        <div
          v-for="(t, idx) in timList"
          :key="t.id || idx"
          class="p-2 rounded-lg flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold flex items-center justify-center tabular-nums shrink-0">
              {{ idx + 1 }}
            </span>
            <img
              v-if="t.logo_url"
              :src="t.logo_url"
              :alt="t.name"
              class="w-7 h-7 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
              loading="lazy"
              decoding="async"
            />
            <span
              v-else
              class="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 font-display font-bold text-[9px] flex items-center justify-center text-navy-800 tracking-wider shrink-0"
            >
              {{ t.short_name }}
            </span>
            <div class="truncate text-xs font-semibold text-ink-900">
              {{ t.name }}
            </div>
          </div>
          <span class="text-[11px] text-slate-400 tabular-nums shrink-0 font-medium">
            {{ t.short_name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
