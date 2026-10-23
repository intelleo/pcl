<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
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
    default: 'siap' // 'siap' | 'spinning' | 'terpilih' | 'selesai'
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
  }
})
</script>

<template>
  <div
    class="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white rounded-2xl border border-navy-700/80 p-5 sm:p-6 shadow-2xl relative overflow-hidden"
  >
    <!-- Background Ambient Glow -->
    <div class="absolute -top-12 -right-12 w-48 h-48 bg-ucl-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-12 -left-12 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 space-y-4">
      <!-- Status Header Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full"
            :class="sedangDrawing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'"
          ></span>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {{ sedangDrawing ? `Mengundi Slot: ${targetGrupAktif} (Urutan ${slotTargetAktif})` : 'Drawing Selesai Dilakukan' }}
          </span>
        </div>

        <!-- Progress Counter -->
        <div class="flex items-center gap-2 text-xs font-mono font-medium text-slate-300">
          <span>Terundi:</span>
          <span class="text-gold-400 font-bold">{{ slotTerisiCount }}</span>
          <span>/</span>
          <span>{{ totalSlotDibutuhkan }} Klub</span>
        </div>
      </div>

      <!-- Spin Stage / Roulette Center Visual -->
      <div class="py-4 flex flex-col items-center justify-center min-h-[160px] text-center">
        <!-- Sedang Berputar / Terkunci -->
        <div v-if="timSedangSpin" class="space-y-3 flex flex-col items-center">
          <!-- Box Logo Spin -->
          <div
            class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2.5 flex items-center justify-center transition-all duration-200"
            :class="[
              statusSpin === 'spinning'
                ? 'bg-white/10 border-2 border-ucl-400 scale-95 shadow-[0_0_25px_rgba(30,144,255,0.4)] animate-pulse'
                : 'bg-white border-2 border-gold-400 scale-105 shadow-[0_0_35px_rgba(255,215,0,0.6)]'
            ]"
          >
            <img
              v-if="timSedangSpin.logo_url"
              :src="timSedangSpin.logo_url"
              :alt="timSedangSpin.name"
              class="w-full h-full object-contain drop-shadow"
            />
            <div
              v-else
              class="w-full h-full rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-display font-extrabold text-base text-gold-400 tracking-wider"
            >
              {{ timSedangSpin.short_name }}
            </div>

            <!-- Lencana Terpilih -->
            <div
              v-if="statusSpin === 'terpilih'"
              class="absolute -top-2 -right-2 bg-gold-500 text-navy-950 font-bold rounded-full p-1 shadow-lg"
            >
              <Check class="w-3.5 h-3.5" />
            </div>
          </div>

          <!-- Nama Tim & Tag -->
          <div class="space-y-1">
            <div
              class="font-display font-bold text-lg sm:text-xl tracking-tight transition-all"
              :class="statusSpin === 'terpilih' ? 'text-gold-300 scale-105' : 'text-white'"
            >
              {{ timSedangSpin.name }}
            </div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 border border-white/20 text-slate-300">
              <span>{{ timSedangSpin.short_name }}</span>
              <span class="text-white/40">•</span>
              <span class="text-gold-400 font-bold">{{ targetGrupAktif }}</span>
            </div>
          </div>
        </div>

        <!-- Kondisi Selesai -->
        <div v-else-if="sudahDrawing" class="space-y-2 flex flex-col items-center">
          <div class="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
            <Check class="w-7 h-7" />
          </div>
          <div class="font-display font-bold text-lg text-white">Semua Grup Sudah Terisi Lengkap!</div>
          <p class="text-xs text-slate-400 max-w-sm">
            Periksa susunan grup di bawah. Klik "Terapkan Pembagian Grup Ini" untuk menyimpan ke database dan menjadwalkan pertandingan.
          </p>
        </div>
      </div>

      <!-- Progress Bar Strip -->
      <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-ucl-500 to-gold-400 transition-all duration-300"
          :style="{ width: `${totalSlotDibutuhkan > 0 ? (slotTerisiCount / totalSlotDibutuhkan) * 100 : 0}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
