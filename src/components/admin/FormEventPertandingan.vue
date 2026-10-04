<script setup>
import { ref, watch } from 'vue'
import { Target, Trash2, Flame } from 'lucide-vue-next'
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
  daftarEvent: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tambahEvent', 'hapusEvent'])

const teamId = ref(props.laga?.home_team_id || '')
const playerId = ref('')

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
    eventType: 'goal',
    minute: 1,
    assistPlayerId: null
  })
  playerId.value = ''
}

function hapus(eventId) {
  emit('hapusEvent', eventId)
}
</script>

<template>
  <div v-if="!laga" class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-card">
    Belum ada data laga yang dipilih.
  </div>
  <div v-else class="space-y-4">
    <!-- Form Tambah Pencetak Gol -->
    <form @submit.prevent="submit" class="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-card">
      <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-ink-900">Tambah Pencetak Gol</h3>
        <Target class="w-4 h-4 text-ucl-600 shrink-0" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-ink-600 mb-1.5">Klub</label>
        <select
          v-model="teamId"
          class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
        >
          <option :value="laga.home_team_id">{{ laga.home_team?.name }}</option>
          <option :value="laga.away_team_id">{{ laga.away_team?.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-ink-600 mb-1.5">Pemain Pencetak Gol</label>
        <select
          v-model="playerId"
          class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
          required
        >
          <option value="" disabled>Pilih pemain</option>
          <option
            v-for="p in daftarPemain.filter(pem => pem.team_id === teamId || !teamId)"
            :key="p.id"
            :value="p.id"
          >
            #{{ p.squad_number }} {{ p.name }} ({{ p.position }})
          </option>
        </select>
      </div>

      <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat" class="w-full justify-center">
        Catat Pencetak Gol
      </TombolDasar>
    </form>

    <!-- Daftar Gol yang Sudah Tercatat -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-card">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-1.5 text-xs font-semibold text-ink-900">
          <Flame class="w-4 h-4 text-ucl-600" />
          <span>Daftar Gol Laga Ini</span>
        </div>
        <span class="text-[11px] font-semibold text-slate-500 tabular-nums">
          Total: {{ daftarEvent.length }} Gol
        </span>
      </div>

      <div v-if="daftarEvent.length === 0" class="py-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg">
        Belum ada pencetak gol yang tercatat pada pertandingan ini.
      </div>

      <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <div
          v-for="ev in daftarEvent"
          :key="ev.id"
          class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs gap-2 transition hover:bg-slate-100/70"
        >
          <div class="flex items-center gap-2 min-w-0 truncate">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-navy-800 shrink-0">
              {{ ev.team?.short_name || 'TIM' }}
            </span>
            <span class="font-medium text-ink-900 truncate">
              {{ ev.player?.name || 'Pemain' }}
            </span>
          </div>

          <button
            type="button"
            @click="hapus(ev.id)"
            class="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer shrink-0"
            title="Hapus Gol"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
