<script setup>
import { Award } from 'lucide-vue-next'

defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
    <div class="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
        <Award class="w-4 h-4 text-ucl-600" />
        Top MVP
      </h3>
    </div>

    <div v-if="data.length === 0" class="px-4 py-10 text-center text-sm text-ink-400">
      Belum ada rekaman MVP.
    </div>

    <template v-else>
      <div class="bg-slate-50 border-b border-slate-100 px-4 sm:px-5 py-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span>Pemain</span>
        <span>Total MVP</span>
      </div>

      <div class="divide-y divide-slate-100">
        <div
          v-for="(item, idx) in data"
          :key="item.player_id"
          class="flex items-center justify-between px-4 sm:px-5 py-2.5 transition-colors hover:bg-slate-50/80"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-6 h-6 flex items-center justify-center shrink-0 rounded-full text-xs tabular-nums transition-colors"
              :class="idx < 3 ? 'font-bold text-gold-600 bg-amber-50 border border-gold-300' : 'text-slate-400 font-normal'"
            >
              {{ idx + 1 }}
            </span>
            <div class="min-w-0">
              <div
                class="text-sm truncate"
                :class="idx < 3 ? 'font-bold text-gold-600' : 'font-medium text-ink-900'"
              >
                {{ item.name }}
              </div>
              <div class="mt-0.5 text-[11px] text-ink-400">{{ item.team_short }} · Pemain terbaik</div>
            </div>
          </div>

          <div class="shrink-0 ml-2">
            <span
              class="text-base tabular-nums"
              :class="idx < 3 ? 'font-bold text-gold-600' : 'font-semibold text-ink-900'"
            >
              {{ item.total }}x
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
