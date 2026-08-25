<script setup>
import { ref, watch } from 'vue'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  laga: {
    type: Object,
    default: null
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['simpan'])

const homeScore = ref(props.laga?.home_score ?? 0)
const awayScore = ref(props.laga?.away_score ?? 0)
const status = ref(props.laga?.status || 'finished')

watch(() => props.laga, (newLaga) => {
  if (newLaga) {
    homeScore.value = newLaga.home_score ?? 0
    awayScore.value = newLaga.away_score ?? 0
    status.value = newLaga.status || 'finished'
  }
}, { immediate: true })

function submit() {
  if (!props.laga) return
  emit('simpan', {
    matchId: props.laga.id,
    homeScore: homeScore.value,
    awayScore: awayScore.value,
    status: status.value
  })
}
</script>

<template>
  <div v-if="!laga" class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-card">
    Belum ada data laga yang dipilih.
  </div>
  <form v-else @submit.prevent="submit" class="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-card">
    <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <h3 class="text-sm font-semibold text-ink-900">Input skor pertandingan</h3>
      <span class="px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-[11px] font-semibold text-ucl-600 truncate">
        {{ laga.stage }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-ink-600 mb-1.5 truncate">
          {{ laga.home_team?.name || 'Home' }}
        </label>
        <input
          v-model.number="homeScore"
          type="number"
          min="0"
          class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-center text-xl font-semibold tabular-nums text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-ink-600 mb-1.5 truncate">
          {{ laga.away_team?.name || 'Away' }}
        </label>
        <input
          v-model.number="awayScore"
          type="number"
          min="0"
          class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-center text-xl font-semibold tabular-nums text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold text-ink-600 mb-1.5">Status laga</label>
      <select
        v-model="status"
        class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
      >
        <option value="scheduled">Jadwal (Scheduled)</option>
        <option value="ongoing">Sedang Berlangsung (Live)</option>
        <option value="finished">Selesai (Finished)</option>
      </select>
    </div>

    <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat" class="w-full">
      Simpan &amp; perbarui skor
    </TombolDasar>
  </form>
</template>
