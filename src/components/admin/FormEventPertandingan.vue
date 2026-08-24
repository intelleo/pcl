<script setup>
import { ref } from 'vue'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  laga: {
    type: Object,
    required: true
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

const teamId = ref(props.laga.home_team_id)
const playerId = ref('')
const assistPlayerId = ref('')
const eventType = ref('goal')
const minute = ref(1)

function submit() {
  if (!playerId.value) return
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
  <form @submit.prevent="submit" class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
    <div class="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
      Tambah Event Laga (Gol / Assist / Kartu)
    </div>

    <!-- Pilih Tim -->
    <div>
      <label class="block text-xs font-bold text-slate-400 mb-1">Klub</label>
      <select
        v-model="teamId"
        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
      >
        <option :value="laga.home_team_id">{{ laga.home_team?.name }}</option>
        <option :value="laga.away_team_id">{{ laga.away_team?.name }}</option>
      </select>
    </div>

    <!-- Tipe Event & Menit -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-400 mb-1">Tipe Event</label>
        <select
          v-model="eventType"
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="goal">Gol Biasa</option>
          <option value="penalty_goal">Gol Penalti</option>
          <option value="own_goal">Gol Bunuh Diri</option>
          <option value="yellow_card">Kartu Kuning</option>
          <option value="red_card">Kartu Merah</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 mb-1">Menit</label>
        <input
          v-model.number="minute"
          type="number"
          min="1"
          max="120"
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm font-mono font-bold text-white focus:outline-none"
        />
      </div>
    </div>

    <!-- Pemain -->
    <div>
      <label class="block text-xs font-bold text-slate-400 mb-1">Pemain Terkait</label>
      <select
        v-model="playerId"
        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
        required
      >
        <option value="" disabled>Pilih Pemain</option>
        <option v-for="p in daftarPemain" :key="p.id" :value="p.id">
          #{{ p.squad_number }} {{ p.name }} ({{ p.position }})
        </option>
      </select>
    </div>

    <TombolDasar tipe="submit" varian="aksen" :sedangMemuat="sedangMemuat" class="w-full">
      Catat Event ke Laga
    </TombolDasar>
  </form>
</template>
