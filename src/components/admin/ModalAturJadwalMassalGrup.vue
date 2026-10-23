<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import ModalDialog from '../umum/ModalDialog.vue'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  terbuka: {
    type: Boolean,
    default: false
  },
  daftarLaga: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tutup', 'terapkan'])

const lagaGrup = computed(() => {
  return props.daftarLaga.filter(m => m.stage === 'group')
})

const inputTanggalJam = ref('')
const jedaMenit = ref(15)

// Ambil default awal dari jadwal laga grup yang sudah ada (jika ada)
watch(
  () => props.terbuka,
  (isBuka) => {
    if (isBuka) {
      const matchPertama = lagaGrup.value.find(m => m.matchday === 1 && m.scheduled_at) || lagaGrup.value[0]
      if (matchPertama?.scheduled_at) {
        const d = new Date(matchPertama.scheduled_at)
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0')
          inputTanggalJam.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        }
      } else {
        // Fallback default: hari ini jam 19:30
        const now = new Date()
        const pad = (n) => String(n).padStart(2, '0')
        inputTanggalJam.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T19:30`
      }
      jedaMenit.value = 15
    }
  },
  { immediate: true }
)

const estimasiJadwalMD = computed(() => {
  if (!inputTanggalJam.value) return []
  const d = new Date(inputTanggalJam.value)
  if (isNaN(d.getTime())) return []

  const jeda = Math.max(1, Number(jedaMenit.value) || 15)
  const pad = (n) => String(n).padStart(2, '0')

  return [1, 2, 3].map(md => {
    const target = new Date(d.getTime() + (md - 1) * jeda * 60 * 1000)
    const jamStr = `${pad(target.getHours())}:${pad(target.getMinutes())}`
    const tglStr = target.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    const totalMatchMD = lagaGrup.value.filter(m => m.matchday === md).length || 8
    return {
      matchday: md,
      jamStr,
      tglStr,
      totalMatch: totalMatchMD
    }
  })
})

function submit() {
  if (!inputTanggalJam.value) {
    alert('Mohon tentukan tanggal & jam mulai kick-off terlebih dahulu.')
    return
  }
  emit('terapkan', {
    tanggalJamMulai: new Date(inputTanggalJam.value).toISOString(),
    jedaMenit: Number(jedaMenit.value) || 15
  })
}
</script>

<template>
  <ModalDialog
    :terbuka="terbuka"
    judul="Atur Jadwal Massal Fase Grup"
    ukuran="md"
    @tutup="$emit('tutup')"
  >
    <div class="space-y-4 text-left">
      <!-- Info banner -->
      <div class="p-3 bg-blue-50/70 border border-ucl-200 rounded-xl text-xs text-ink-800 leading-relaxed">
        Fitur ini akan menyelaraskan jadwal <strong>seluruh {{ lagaGrup.length }} laga fase grup</strong> secara serentak berdasarkan kick-off Matchday 1 dan jeda interval antar matchday.
      </div>

      <!-- Form Inputs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2 space-y-1.5">
          <label class="block text-xs font-semibold text-ink-700">
            Kick-off Matchday 1 (Tanggal &amp; Jam)
          </label>
          <div class="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20 transition">
            <Calendar class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              v-model="inputTanggalJam"
              type="datetime-local"
              class="w-full bg-transparent text-xs sm:text-sm font-semibold text-ink-900 outline-none cursor-pointer"
              required
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-ink-700">
            Jeda Antar MD
          </label>
          <div class="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20 transition">
            <input
              v-model.number="jedaMenit"
              type="number"
              min="5"
              max="180"
              step="5"
              class="w-full bg-transparent text-xs sm:text-sm font-semibold text-ink-900 outline-none text-center"
              required
            />
            <span class="text-xs text-slate-400 font-medium ml-1">Mnt</span>
          </div>
        </div>
      </div>

      <!-- Preview Estimasi Timeline -->
      <div class="space-y-2">
        <span class="text-xs font-bold text-ink-900 flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-ucl-600" />
          <span>Pratinjau Jadwal Otomatis:</span>
        </span>

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="item in estimasiJadwalMD"
            :key="item.matchday"
            class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5"
          >
            <div class="text-[10px] font-bold uppercase text-ucl-700 tracking-wider">
              Matchday {{ item.matchday }}
            </div>
            <div class="text-sm font-extrabold text-ink-900 font-mono">
              {{ item.jamStr }} WIB
            </div>
            <div class="text-[10px] text-slate-400 truncate">
              {{ item.tglStr }}
            </div>
          </div>
        </div>
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
          <Sparkles class="w-3.5 h-3.5 mr-1.5" />
          <span>Terapkan ke Semua Match Grup</span>
        </TombolDasar>
      </div>
    </div>
  </ModalDialog>
</template>
