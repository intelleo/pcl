<script setup>
import { Dices, Minimize2 } from 'lucide-vue-next'
import RouletteDrawingGrup from './RouletteDrawingGrup.vue'
import GridHasilDrawingGrup from './GridHasilDrawingGrup.vue'
import FloatingActionBarDrawing from './FloatingActionBarDrawing.vue'

defineProps({
  modeFullscreen: {
    type: Boolean,
    default: false
  },
  timTerfilter: {
    type: Array,
    default: () => []
  },
  sedangDrawing: {
    type: Boolean,
    default: false
  },
  sudahDrawing: {
    type: Boolean,
    default: false
  },
  statusSpin: {
    type: String,
    default: 'siap'
  },
  targetGrupAktif: {
    type: String,
    default: ''
  },
  slotTargetAktif: {
    type: Number,
    default: 1
  },
  timSedangSpin: {
    type: Object,
    default: null
  },
  slotTerisiCount: {
    type: Number,
    default: 0
  },
  totalSlotDibutuhkan: {
    type: Number,
    default: 0
  },
  hasilDrawing: {
    type: Object,
    required: true
  },
  sedangMenyimpan: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggleFullscreen', 'kocok', 'lewati', 'simpan'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modeFullscreen"
      class="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col overflow-y-auto p-4 sm:p-8 space-y-6"
    >
      <!-- Top Bar Fullscreen -->
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-ucl-500/20 border border-ucl-400/40 flex items-center justify-center text-ucl-400">
            <Dices class="w-5 h-5" />
          </div>
          <div>
            <h1 class="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              PEAK CHAMPIONS LEAGUE - OFFICIAL DRAWING
            </h1>
            <p class="text-xs text-slate-400">
              Pengundian Fase Grup Turnamen • {{ timTerfilter.length }} Klub Peserta
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('toggleFullscreen')"
          class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Minimize2 class="w-4 h-4" />
          <span>Keluar Layar Penuh (Esc)</span>
        </button>
      </div>

      <!-- Stage Roulette di Fullscreen -->
      <RouletteDrawingGrup
        v-if="sedangDrawing || sudahDrawing"
        :sedangDrawing="sedangDrawing"
        :sudahDrawing="sudahDrawing"
        :statusSpin="statusSpin"
        :targetGrupAktif="targetGrupAktif"
        :slotTargetAktif="slotTargetAktif"
        :timSedangSpin="timSedangSpin"
        :slotTerisiCount="slotTerisiCount"
        :totalSlotDibutuhkan="totalSlotDibutuhkan"
      />

      <!-- Grid Hasil Grup di Fullscreen -->
      <div class="flex-1 pb-24">
        <GridHasilDrawingGrup
          :hasilDrawing="hasilDrawing"
          :targetGrupAktif="targetGrupAktif"
          :sedangDrawing="sedangDrawing"
        />
      </div>

      <!-- Floating Action Bar di Layar Penuh -->
      <FloatingActionBarDrawing
        :sedangDrawing="sedangDrawing"
        :sudahDrawing="sudahDrawing"
        :sedangMenyimpan="sedangMenyimpan"
        :jumlahTim="timTerfilter.length"
        :modeFullscreen="modeFullscreen"
        @kocok="emit('kocok')"
        @lewati="emit('lewati')"
        @simpan="emit('simpan')"
        @toggleFullscreen="emit('toggleFullscreen')"
      />
    </div>
  </Teleport>
</template>
