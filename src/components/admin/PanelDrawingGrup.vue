<script setup>
import { ref, computed } from 'vue'
import { Dices, Shield, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  daftarTim: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['terapkanHasilDrawing'])

// Opsi Pot / Grup
const jumlahGrup = ref(4) // Default: 4 grup (A, B, C, D)
const hasilDrawing = ref({
  'Grup A': [],
  'Grup B': [],
  'Grup C': [],
  'Grup D': []
})

const sedangDrawing = ref(false)
const sudahDrawing = ref(false)

function acakArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function jalankanDrawingOtomatis() {
  sedangDrawing.value = true
  sudahDrawing.value = false

  setTimeout(() => {
    const timTerkocok = acakArray(props.daftarTim)
    const grupList = ['Grup A', 'Grup B', 'Grup C', 'Grup D'].slice(0, jumlahGrup.value)

    const grupBaru = {}
    grupList.forEach(g => { grupBaru[g] = [] })

    timTerkocok.forEach((tim, idx) => {
      const namaGrup = grupList[idx % grupList.length]
      grupBaru[namaGrup].push({ ...tim, group_name: namaGrup })
    })

    hasilDrawing.value = grupBaru
    sedangDrawing.value = false
    sudahDrawing.value = true
  }, 600)
}

function resetDrawing() {
  hasilDrawing.value = {
    'Grup A': [],
    'Grup B': [],
    'Grup C': [],
    'Grup D': []
  }
  sudahDrawing.value = false
}

function simpanKeTurnamen() {
  emit('terapkanHasilDrawing', hasilDrawing.value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Drawing Control Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 class="text-base font-semibold text-ink-900 flex items-center gap-2">
            <Dices class="w-5 h-5 text-ucl-600" />
            Drawing &amp; Pengundian Grup Otomatis
          </h3>
          <p class="text-xs text-slate-500 mt-1">
            Kocok dan bagi {{ daftarTim.length }} klub peserta ke dalam 2 atau 4 grup turnamen secara acak.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="resetDrawing"
            v-if="sudahDrawing"
            class="px-3 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            Reset
          </button>

          <TombolDasar
            @click="jalankanDrawingOtomatis"
            varian="primer"
            :sedangMemuat="sedangDrawing"
            class="flex items-center gap-1.5"
          >
            <Dices class="w-4 h-4" />
            Kocok Drawing Sekarang
          </TombolDasar>
        </div>
      </div>

      <!-- Setting Bar -->
      <div class="flex items-center gap-4 text-xs">
        <span class="font-semibold text-slate-600">Pilihan Jumlah Grup:</span>
        <div class="inline-flex p-1 rounded-lg bg-slate-100">
          <button
            @click="jumlahGrup = 2"
            class="px-3 py-1 rounded-md font-semibold transition-all cursor-pointer"
            :class="jumlahGrup === 2 ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            2 Grup (A &amp; B)
          </button>
          <button
            @click="jumlahGrup = 4"
            class="px-3 py-1 rounded-md font-semibold transition-all cursor-pointer"
            :class="jumlahGrup === 4 ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            4 Grup (A, B, C, D)
          </button>
        </div>
      </div>
    </div>

    <!-- Hasil Drawing Preview (Grid Grup) -->
    <div v-if="sudahDrawing" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-gold-500" />
          Hasil Drawing Grup
        </h4>
        <button
          @click="simpanKeTurnamen"
          class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <Check class="w-4 h-4" />
          Terapkan Pembagian Grup Ini
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(timList, grupName) in hasilDrawing"
          :key="grupName"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card"
        >
          <div class="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span class="font-semibold text-xs text-ink-900 flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-ucl-600" />
              {{ grupName }}
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
                <span class="w-7 h-7 rounded-md bg-slate-100 font-display font-semibold text-xs flex items-center justify-center text-navy-800 shrink-0">
                  {{ t.short_name }}
                </span>
                <div class="truncate text-xs font-semibold text-ink-900">
                  {{ t.name }}
                </div>
              </div>
              <span class="text-[11px] text-slate-400 tabular-nums shrink-0 font-medium">
                {{ t.rating || 90 }} OVR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
