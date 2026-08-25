<script setup>
import { ref } from 'vue'
import {
  Trophy,
  Crown,
  Flame,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move
} from 'lucide-vue-next'
import pialaPcl from '@/assets/img/piala-pcl.webp'

const props = defineProps({
  baganData: {
    type: Object,
    default: () => ({
      perempatFinal: [
        {
          id: 'qf1',
          label: 'QF 1',
          home: { nama: 'Juara Grup A', short: '1A', skor: 0, pemenang: false },
          away: { nama: 'Runner-up Grup B', short: '2B', skor: 0, pemenang: false },
          selesai: false
        },
        {
          id: 'qf2',
          label: 'QF 2',
          home: { nama: 'Juara Grup B', short: '1B', skor: 0, pemenang: false },
          away: { nama: 'Runner-up Grup A', short: '2A', skor: 0, pemenang: false },
          selesai: false
        },
        {
          id: 'qf3',
          label: 'QF 3',
          home: { nama: 'Juara Grup C', short: '1C', skor: 0, pemenang: false },
          away: { nama: 'Runner-up Grup D', short: '2D', skor: 0, pemenang: false },
          selesai: false
        },
        {
          id: 'qf4',
          label: 'QF 4',
          home: { nama: 'Juara Grup D', short: '1D', skor: 0, pemenang: false },
          away: { nama: 'Runner-up Grup C', short: '2C', skor: 0, pemenang: false },
          selesai: false
        }
      ],
      semiFinal: [
        {
          id: 'sf1',
          label: 'Semi Final 1',
          home: { nama: 'Pemenang QF 1', short: 'W1', skor: 0, pemenang: false },
          away: { nama: 'Pemenang QF 2', short: 'W2', skor: 0, pemenang: false },
          selesai: false
        },
        {
          id: 'sf2',
          label: 'Semi Final 2',
          home: { nama: 'Pemenang QF 3', short: 'W3', skor: 0, pemenang: false },
          away: { nama: 'Pemenang QF 4', short: 'W4', skor: 0, pemenang: false },
          selesai: false
        }
      ],
      final: {
        id: 'fin',
        label: 'Grand Final PCL 2026',
        home: { nama: 'Pemenang SF 1', short: 'F1', skor: 0, pemenang: false },
        away: { nama: 'Pemenang SF 2', short: 'F2', skor: 0, pemenang: false },
        selesai: false,
        juara: null
      }
    })
  }
})

const tingkatZoom = ref(1)
const kontainerBagan = ref(null)

function perbesar() {
  if (tingkatZoom.value < 1.3) {
    tingkatZoom.value = Number((tingkatZoom.value + 0.15).toFixed(2))
  }
}

function perkecil() {
  if (tingkatZoom.value > 0.6) {
    tingkatZoom.value = Number((tingkatZoom.value - 0.15).toFixed(2))
  }
}

function aturUlangZoom() {
  tingkatZoom.value = 1
}

function pasUkuranMobile() {
  tingkatZoom.value = 0.65
}

function geserKeFase(posisi) {
  if (!kontainerBagan.value) return
  const petaPosisi = {
    qf: 0,
    sf: 320,
    final: 650,
    juara: 950
  }
  kontainerBagan.value.scrollTo({
    left: (petaPosisi[posisi] || 0) * tingkatZoom.value,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-card">
      <div class="flex items-center gap-2 min-w-0">
        <Trophy class="w-4 h-4 text-ucl-600 shrink-0" />
        <span class="text-sm font-semibold tracking-tight text-ink-900 truncate">Bagan Turnamen</span>
        <span class="text-xs text-slate-400 truncate">· 8 Klub Knockout</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex items-center p-1 rounded-full bg-slate-100 text-xs">
          <button
            @click="geserKeFase('qf')"
            class="px-3 py-1 rounded-full text-[11px] font-semibold text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer"
          >
            QF
          </button>
          <button
            @click="geserKeFase('sf')"
            class="px-3 py-1 rounded-full text-[11px] font-semibold text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer"
          >
            SF
          </button>
          <button
            @click="geserKeFase('final')"
            class="px-3 py-1 rounded-full text-[11px] font-semibold text-ucl-600 hover:bg-white transition-colors cursor-pointer"
          >
            Final
          </button>
          <button
            @click="geserKeFase('juara')"
            class="px-3 py-1 rounded-full text-[11px] font-semibold text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer"
          >
            Juara
          </button>
        </div>

        <div class="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <button
            @click="perkecil"
            :disabled="tingkatZoom <= 0.6"
            class="p-1 rounded-full text-slate-500 hover:text-ucl-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut class="w-3.5 h-3.5" />
          </button>

          <span class="px-2 text-[11px] font-semibold text-ink-900 tabular-nums min-w-[42px] text-center">
            {{ Math.round(tingkatZoom * 100) }}%
          </span>

          <button
            @click="perbesar"
            :disabled="tingkatZoom >= 1.3"
            class="p-1 rounded-full text-slate-500 hover:text-ucl-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn class="w-3.5 h-3.5" />
          </button>

          <button
            @click="aturUlangZoom"
            class="p-1 ml-0.5 rounded-full text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer border-l border-slate-300"
            title="Reset (100%)"
          >
            <RotateCcw class="w-3 h-3" />
          </button>

          <button
            @click="pasUkuranMobile"
            class="p-1 rounded-full text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer"
            title="Fit Mobile"
          >
            <Maximize2 class="w-3 h-3 text-ucl-600" />
          </button>
        </div>
      </div>
    </div>

    <div class="sm:hidden flex items-center justify-between px-3 py-2 rounded-xl bg-ucl-50 border border-ucl-100 text-[11px] text-ucl-600">
      <span class="flex items-center gap-1.5">
        <Move class="w-3.5 h-3.5" />
        Geser horizontal untuk melihat bagan
      </span>
      <button @click="pasUkuranMobile" class="font-semibold underline">
        Fit (65%)
      </button>
    </div>

    <div
      ref="kontainerBagan"
      class="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 overflow-x-auto shadow-card relative"
    >
      <div
        class="origin-top-left transition-transform duration-150"
        :style="{
          transform: `scale(${tingkatZoom})`,
          width: `${100 / tingkatZoom}%`
        }"
      >
        <div class="min-w-[1020px] relative pb-2">
          <div class="grid grid-cols-4 gap-10 mb-4 text-center">
            <div class="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-ink-600 flex items-center justify-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-ink-400" />
              Perempat Final
            </div>
            <div class="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-ink-600 flex items-center justify-center gap-1.5">
              <Flame class="w-3.5 h-3.5 text-ucl-600" />
              Semi Final
            </div>
            <div class="px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/50 text-[11px] font-semibold text-amber-700 flex items-center justify-center gap-1.5">
              <Trophy class="w-3.5 h-3.5 text-gold-500" />
              Grand Final
            </div>
            <div class="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-[11px] font-semibold text-navy-950 flex items-center justify-center gap-1.5">
              <Crown class="w-3.5 h-3.5" />
              Juara
            </div>
          </div>

          <div class="relative h-[520px]">
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M 235 58 H 275 V 123 H 315" fill="none" stroke="#CBD5E1" stroke-width="2" />
              <circle cx="275" cy="123" r="3.5" fill="#CBD5E1" />
              <path d="M 235 188 H 275 V 123" fill="none" stroke="#CBD5E1" stroke-width="2" />

              <path d="M 235 318 H 275 V 383 H 315" fill="none" stroke="#CBD5E1" stroke-width="2" />
              <circle cx="275" cy="383" r="3.5" fill="#CBD5E1" />
              <path d="M 235 448 H 275 V 383" fill="none" stroke="#CBD5E1" stroke-width="2" />

              <path d="M 550 123 H 590 V 253 H 630" fill="none" stroke="#CBD5E1" stroke-width="2" />
              <circle cx="590" cy="253" r="3.5" fill="#CBD5E1" />
              <path d="M 550 383 H 590 V 253" fill="none" stroke="#CBD5E1" stroke-width="2" />

              <path d="M 865 253 H 905" fill="none" stroke="#2465EB" stroke-width="2" stroke-dasharray="4,3" />
              <circle cx="905" cy="253" r="4" fill="#2465EB" />
            </svg>

            <div class="absolute left-0 top-0 w-[235px] h-full flex flex-col justify-between z-10">
              <div
                v-for="match in baganData.perempatFinal"
                :key="match.id"
                class="h-[96px] bg-slate-50 border border-slate-200 hover:border-ucl-500/50 transition-colors rounded-lg p-2.5 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between text-[10px] font-semibold text-slate-400 pb-1 border-b border-slate-200">
                  <span>{{ match.label }}</span>
                  <span>FT</span>
                </div>

                <div
                  class="flex items-center justify-between px-2 py-0.5 rounded-md text-xs transition-colors"
                  :class="match.home.pemenang ? 'bg-white ring-1 ring-ucl-500/40 text-ink-900 font-semibold' : 'text-slate-400'"
                >
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-4 h-4 rounded-full bg-white border border-slate-300 text-[9px] font-semibold flex items-center justify-center text-navy-800 shrink-0">{{ match.home.short }}</span>
                    <span class="truncate">{{ match.home.nama }}</span>
                  </div>
                  <span class="font-semibold tabular-nums text-xs ml-2" :class="match.home.pemenang ? 'text-ucl-600' : 'text-slate-400'">{{ match.selesai ? match.home.skor : '-' }}</span>
                </div>

                <div
                  class="flex items-center justify-between px-2 py-0.5 rounded-md text-xs transition-colors"
                  :class="match.away.pemenang ? 'bg-white ring-1 ring-ucl-500/40 text-ink-900 font-semibold' : 'text-slate-400'"
                >
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-4 h-4 rounded-full bg-white border border-slate-300 text-[9px] font-semibold flex items-center justify-center text-navy-800 shrink-0">{{ match.away.short }}</span>
                    <span class="truncate">{{ match.away.nama }}</span>
                  </div>
                  <span class="font-semibold tabular-nums text-xs ml-2" :class="match.away.pemenang ? 'text-ucl-600' : 'text-slate-400'">{{ match.selesai ? match.away.skor : '-' }}</span>
                </div>
              </div>
            </div>

            <div class="absolute left-[315px] top-0 w-[235px] h-full flex flex-col justify-around z-10">
              <div
                v-for="match in baganData.semiFinal"
                :key="match.id"
                class="h-[106px] bg-slate-50 border border-slate-200 hover:border-ucl-500/50 transition-colors rounded-lg p-2.5 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between text-[10px] font-semibold text-slate-400 pb-1 border-b border-slate-200">
                  <span class="flex items-center gap-1">
                    <Flame class="w-3 h-3 text-ucl-600" />
                    {{ match.label }}
                  </span>
                  <span>FT</span>
                </div>

                <div
                  class="flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors"
                  :class="match.home.pemenang ? 'bg-white ring-1 ring-ucl-500/40 text-ink-900 font-semibold' : 'text-slate-400'"
                >
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-5 h-5 rounded-full bg-white border border-slate-300 text-[10px] font-semibold flex items-center justify-center text-navy-800 shrink-0">{{ match.home.short }}</span>
                    <span class="truncate">{{ match.home.nama }}</span>
                  </div>
                  <span class="tabular-nums text-sm ml-2 font-semibold" :class="match.home.pemenang ? 'text-ucl-600' : 'text-slate-400'">{{ match.selesai ? match.home.skor : '-' }}</span>
                </div>

                <div
                  class="flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors"
                  :class="match.away.pemenang ? 'bg-white ring-1 ring-ucl-500/40 text-ink-900 font-semibold' : 'text-slate-400'"
                >
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-5 h-5 rounded-full bg-white border border-slate-300 text-[10px] font-semibold flex items-center justify-center text-navy-800 shrink-0">{{ match.away.short }}</span>
                    <span class="truncate">{{ match.away.nama }}</span>
                  </div>
                  <span class="tabular-nums text-sm ml-2 font-semibold" :class="match.away.pemenang ? 'text-ucl-600' : 'text-slate-400'">{{ match.selesai ? match.away.skor : '-' }}</span>
                </div>
              </div>
            </div>

            <div class="absolute left-[630px] top-0 w-[235px] h-full flex flex-col justify-center z-10">
              <div class="bg-white border border-gold-400/50 ring-1 ring-gold-400/50 rounded-lg shadow-card overflow-hidden">
                <div class="p-3.5 space-y-2.5">
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span class="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                      <Trophy class="w-3.5 h-3.5 text-gold-500" />
                      {{ baganData.final.label }}
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-gold-400/15 border border-gold-400/50 text-amber-700 font-semibold text-[10px] uppercase tracking-wider">Final</span>
                  </div>

                  <div
                    class="flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all"
                    :class="baganData.final.home.pemenang ? 'bg-ucl-50 ring-1 ring-ucl-500/40 text-ink-900 font-semibold' : 'text-slate-400'"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-5 h-5 rounded-full bg-white border border-slate-300 text-[10px] font-semibold flex items-center justify-center text-navy-800 shrink-0">{{ baganData.final.home.short }}</span>
                      <span class="truncate text-xs">{{ baganData.final.home.nama }}</span>
                    </div>
                    <span class="text-base font-semibold tabular-nums ml-2" :class="baganData.final.home.pemenang ? 'text-ucl-600' : 'text-slate-400'">{{ baganData.final.selesai ? baganData.final.home.skor : '-' }}</span>
                  </div>

                  <div
                    class="flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all"
                    :class="baganData.final.away.pemenang ? 'bg-ucl-50 ring-1 ring-ucl-500/40 text-ink-900 font-semibold' : 'text-slate-400'"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-5 h-5 rounded-full bg-white border border-slate-300 text-[10px] font-semibold flex items-center justify-center text-navy-800 shrink-0">{{ baganData.final.away.short }}</span>
                      <span class="truncate text-xs">{{ baganData.final.away.nama }}</span>
                    </div>
                    <span class="text-base font-semibold tabular-nums ml-2" :class="baganData.final.away.pemenang ? 'text-ucl-600' : 'text-slate-400'">{{ baganData.final.selesai ? baganData.final.away.skor : '-' }}</span>
                  </div>

                  <div class="text-center pt-1 text-[11px] text-slate-400">
                    Full Time · Menentukan Juara
                  </div>
                </div>
              </div>
            </div>

            <div class="absolute left-[905px] top-0 w-[235px] h-full flex flex-col justify-center z-10">
              <div class="bg-white border border-gold-400/50 ring-1 ring-gold-400/50 rounded-xl shadow-lift overflow-hidden">
                <div class="p-5 text-center space-y-2.5">
                  <div class="mx-auto w-16 h-16 flex items-center justify-center relative">
                    <img :src="pialaPcl" alt="Piala PCL" class="w-full h-full object-contain drop-shadow-md" />
                  </div>

                  <div>
                    <span class="inline-block px-2.5 py-0.5 rounded-full bg-gold-400/15 border border-gold-400/50 text-amber-700 text-[10px] font-semibold uppercase tracking-wider">
                      Juara 1
                    </span>
                    <h3 class="font-display text-base font-semibold tracking-tight text-ink-900 mt-1">
                      {{ baganData.final.juara?.nama || 'Menunggu Juara' }}
                    </h3>
                    <p class="text-xs text-slate-400 mt-0.5">
                      Peak Champions League 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
