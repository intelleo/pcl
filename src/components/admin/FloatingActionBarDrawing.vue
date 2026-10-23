<script setup>
import { Dices, FastForward, Maximize2, Minimize2, Check, RefreshCw } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

defineProps({
  sedangDrawing: {
    type: Boolean,
    default: false
  },
  sudahDrawing: {
    type: Boolean,
    default: false
  },
  sedangMenyimpan: {
    type: Boolean,
    default: false
  },
  jumlahTim: {
    type: Number,
    default: 0
  },
  modeFullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['kocok', 'lewati', 'simpan', 'toggleFullscreen'])
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 rounded-2xl bg-navy-950/90 backdrop-blur-md border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all">
    <!-- Tombol Lewati jika sedang spin -->
    <button
      v-if="sedangDrawing"
      type="button"
      @click="emit('lewati')"
      class="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
      title="Langsung tampilkan seluruh hasil tanpa animasi"
    >
      <FastForward class="w-4 h-4 text-amber-400 shrink-0" />
      <span class="hidden sm:inline">Lewati Animasi</span>
    </button>

    <!-- Tombol Utama Kocok Drawing (Paling Menonjol di Tengah) -->
    <button
      type="button"
      @click="emit('kocok')"
      :disabled="sedangDrawing || jumlahTim === 0"
      class="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-ucl-600 via-blue-600 to-indigo-600 hover:from-ucl-500 hover:to-indigo-500 text-white font-display font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(30,144,255,0.5)] flex items-center gap-2.5 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <Dices class="w-5 h-5 shrink-0" :class="{ 'animate-spin': sedangDrawing }" />
      <span>{{ sedangDrawing ? 'Sedang Mengundi Slot...' : (sudahDrawing ? 'Kocok Ulang Drawing' : 'Kocok Drawing Sekarang') }}</span>
    </button>

    <!-- Tombol Terapkan Pembagian Grup jika sudah selesai drawing -->
    <button
      v-if="sudahDrawing && !sedangDrawing"
      type="button"
      @click="emit('simpan')"
      :disabled="sedangMenyimpan"
      class="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all transform hover:scale-[1.03] cursor-pointer disabled:opacity-50"
    >
      <RefreshCw v-if="sedangMenyimpan" class="w-4 h-4 animate-spin" />
      <Check v-else class="w-4 h-4" />
      <span class="hidden sm:inline">{{ sedangMenyimpan ? 'Menyimpan...' : 'Terapkan Hasil' }}</span>
    </button>

    <!-- Tombol Layar Penuh -->
    <button
      type="button"
      @click="emit('toggleFullscreen')"
      class="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
      :title="modeFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Mode Layar Penuh (Rekam Layar)'"
    >
      <Minimize2 v-if="modeFullscreen" class="w-4 h-4 text-slate-300" />
      <Maximize2 v-else class="w-4 h-4 text-slate-300" />
    </button>
  </div>
</template>
