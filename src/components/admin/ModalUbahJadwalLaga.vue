<script setup>
import { ref, watch } from 'vue'
import { Calendar, Clock, AlertCircle } from 'lucide-vue-next'
import ModalDialog from '../umum/ModalDialog.vue'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  terbuka: {
    type: Boolean,
    default: false
  },
  laga: {
    type: Object,
    default: null
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tutup', 'simpan'])

const inputWaktu = ref('')

function formatToDatetimeInput(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(
  () => props.laga,
  (val) => {
    if (val) {
      inputWaktu.value = formatToDatetimeInput(val.scheduled_at)
    } else {
      inputWaktu.value = ''
    }
  },
  { immediate: true }
)

function submit() {
  if (!props.laga) return
  const isoString = inputWaktu.value ? new Date(inputWaktu.value).toISOString() : null
  emit('simpan', {
    matchId: props.laga.id,
    scheduledAt: isoString
  })
}
</script>

<template>
  <ModalDialog
    :terbuka="terbuka"
    judul="Ubah Jadwal Pertandingan"
    ukuran="md"
    @tutup="$emit('tutup')"
  >
    <div v-if="laga" class="space-y-4 text-left">
      <!-- Match Info Header Card -->
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <img
            v-if="laga.home_team?.logo_url"
            :src="laga.home_team.logo_url"
            class="w-7 h-7 rounded object-contain bg-white border border-slate-200 p-0.5 shrink-0"
          />
          <span class="text-xs font-bold text-ink-900 truncate">
            {{ laga.home_team?.name || 'Home' }}
          </span>
        </div>

        <span class="text-xs font-bold text-slate-400 shrink-0">VS</span>

        <div class="flex items-center gap-2 min-w-0 justify-end">
          <span class="text-xs font-bold text-ink-900 truncate">
            {{ laga.away_team?.name || 'Away' }}
          </span>
          <img
            v-if="laga.away_team?.logo_url"
            :src="laga.away_team.logo_url"
            class="w-7 h-7 rounded object-contain bg-white border border-slate-200 p-0.5 shrink-0"
          />
        </div>
      </div>

      <!-- Fase Info -->
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span class="px-2 py-0.5 rounded bg-ucl-50 text-ucl-700 font-semibold border border-ucl-100">
          {{ laga.group?.name || laga.knockout_bracket_slot || laga.stage }}
        </span>
        <span v-if="laga.matchday">Matchday {{ laga.matchday }}</span>
      </div>

      <!-- Datetime Input Form -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-ink-700">
          Pilih Tanggal &amp; Jam Kick-off
        </label>
        <div class="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20 transition">
          <Calendar class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            v-model="inputWaktu"
            type="datetime-local"
            class="w-full bg-transparent text-xs sm:text-sm font-semibold text-ink-900 outline-none cursor-pointer"
            required
          />
        </div>
        <p class="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
          <Clock class="w-3.5 h-3.5" />
          <span>Waktu pertandingan disesuaikan otomatis dengan zona waktu perangkat.</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <TombolDasar
          varian="sekunder"
          type="button"
          @click="$emit('tutup')"
        >
          Batal
        </TombolDasar>
        <TombolDasar
          varian="primer"
          type="button"
          :sedangMemuat="sedangMemuat"
          @click="submit"
        >
          Simpan Jadwal Baru
        </TombolDasar>
      </div>
    </div>
  </ModalDialog>
</template>
