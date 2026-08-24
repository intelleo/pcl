<script setup>
import { ref } from 'vue'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  laga: {
    type: Object,
    required: true
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['simpan'])

const homeScore = ref(props.laga.home_score || 0)
const awayScore = ref(props.laga.away_score || 0)
const status = ref(props.laga.status || 'finished')

function submit() {
  emit('simpan', {
    matchId: props.laga.id,
    homeScore: homeScore.value,
    awayScore: awayScore.value,
    status: status.value
  })
}
</script>

<template>
  <form @submit.prevent="submit" class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
    <div class="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
      <span>Input Skor Pertandingan</span>
      <span class="text-emerald-400">{{ laga.stage }}</span>
    </div>

    <!-- Inputs -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1 truncate">
          {{ laga.home_team?.name || 'Home' }}
        </label>
        <input
          v-model.number="homeScore"
          type="number"
          min="0"
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1 truncate">
          {{ laga.away_team?.name || 'Away' }}
        </label>
        <input
          v-model.number="awayScore"
          type="number"
          min="0"
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Status Selector -->
    <div>
      <label class="block text-xs font-bold text-slate-400 mb-1">Status Laga</label>
      <select
        v-model="status"
        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
      >
        <option value="scheduled">Jadwal (Scheduled)</option>
        <option value="ongoing">Sedang Berlangsung (Live)</option>
        <option value="finished">Selesai (Finished)</option>
      </select>
    </div>

    <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat" class="w-full">
      Simpan & Perbarui Skor
    </TombolDasar>
  </form>
</template>
