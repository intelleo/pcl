<script setup>
import { ref, watch } from 'vue'
import { Target } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  laga: {
    type: Object,
    default: null
  },
  daftarPemain: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tambahEvent'])

const teamId = ref(props.laga?.home_team_id || '')
const playerId = ref('')
const assistPlayerId = ref('')
const eventType = ref('goal')
const minute = ref(1)

watch(() => props.laga, (newLaga) => {
  if (newLaga) {
    teamId.value = newLaga.home_team_id || ''
  }
}, { immediate: true })

function submit() {
  if (!props.laga || !playerId.value) return
  emit('tambahEvent', {
    matchId: props.laga.id,
    teamId: teamId.value,
    playerId: playerId.value,
    eventType: eventType.value,
    minute: minute.value,
    assistPlayerId: assistPlayerId.value || null
  })
  playerId.value = ''
  assistPlayerId.value = ''
}
</script>

<template>
  <div v-if="!laga" class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-card">
    Belum ada data laga yang dipilih.
  </div>
  <form v-else @submit.prevent="submit" class="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-card">
    <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <h3 class="text-sm font-semibold text-ink-900">Tambah event laga (gol / kartu)</h3>
      <Target class="w-4 h-4 text-ucl-600 shrink-0" />
    </div>

    <div>
      <label class="block text-xs font-semibold text-ink-600 mb-1.5">Klub</label>
      <select
        v-model="teamId"
        class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
      >
        <option :value="laga.home_team_id">{{ laga.home_team?.name }}</option>
        <option :value="laga.away_team_id">{{ laga.away_team?.name }}</option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-ink-600 mb-1.5">Tipe event</label>
        <select
          v-model="eventType"
          class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
        >
          <option value="goal">Gol Biasa</option>
          <option value="penalty_goal">Gol Penalti</option>
          <option value="own_goal">Gol Bunuh Diri</option>
          <option value="yellow_card">Kartu Kuning</option>
          <option value="red_card">Kartu Merah</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-ink-600 mb-1.5">Menit</label>
        <input
          v-model.number="minute"
          type="number"
          min="1"
          max="120"
          class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-center text-sm font-semibold tabular-nums text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold text-ink-600 mb-1.5">Pemain terkait</label>
      <select
        v-model="playerId"
        class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
        required
      >
        <option value="" disabled>Pilih pemain</option>
        <option v-for="p in daftarPemain" :key="p.id" :value="p.id">
          #{{ p.squad_number }} {{ p.name }} ({{ p.position }})
        </option>
      </select>
    </div>

    <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat" class="w-full">
      Catat event ke laga
    </TombolDasar>
  </form>
</template>
