<script setup>
import { Trophy } from 'lucide-vue-next'

defineProps({
  baganData: {
    type: Object,
    default: () => ({
      semiFinal: [
        {
          id: 'sf1',
          home: { nama: 'Barcelona FC', skor: 2, pemenang: true },
          away: { nama: 'Bayern Munich', skor: 1, pemenang: false },
          selesai: true
        },
        {
          id: 'sf2',
          home: { nama: 'Real Madrid', skor: 3, pemenang: true },
          away: { nama: 'Manchester City', skor: 2, pemenang: false },
          selesai: true
        }
      ],
      final: {
        id: 'fin',
        home: { nama: 'Barcelona FC', skor: 0, pemenang: false },
        away: { nama: 'Real Madrid', skor: 0, pemenang: false },
        selesai: false
      }
    })
  }
})
</script>

<template>
  <div class="bg-pcl-card/80 border border-slate-800 rounded-2xl p-6 sm:p-8 overflow-x-auto shadow-2xl">
    <div class="min-w-[700px] flex items-center justify-between gap-8 py-4">

      <!-- Kolom Semi Final -->
      <div class="flex-1 flex flex-col justify-around gap-12">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 text-center pb-2 border-b border-slate-800">
          Semi Final
        </div>

        <div v-for="match in baganData.semiFinal" :key="match.id" class="relative group">
          <!-- Card Match Bracket -->
          <div class="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-lg space-y-2">
            <!-- Home -->
            <div
              class="flex items-center justify-between text-xs px-2 py-1.5 rounded"
              :class="match.home.pemenang ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-300'"
            >
              <span class="truncate">{{ match.home.nama }}</span>
              <span class="font-mono font-bold">{{ match.selesai ? match.home.skor : '-' }}</span>
            </div>
            <!-- Away -->
            <div
              class="flex items-center justify-between text-xs px-2 py-1.5 rounded"
              :class="match.away.pemenang ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-300'"
            >
              <span class="truncate">{{ match.away.nama }}</span>
              <span class="font-mono font-bold">{{ match.selesai ? match.away.skor : '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider / Garis Visual -->
      <div class="w-12 flex flex-col items-center justify-center text-slate-600">
        <div class="h-24 w-px bg-slate-700"></div>
        <div class="w-8 h-px bg-slate-700"></div>
        <div class="h-24 w-px bg-slate-700"></div>
      </div>

      <!-- Kolom Final -->
      <div class="flex-1 flex flex-col justify-center max-w-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-amber-400 text-center pb-2 border-b border-amber-500/30 flex items-center justify-center gap-1.5">
          <Trophy class="w-4 h-4 text-amber-400" />
          Grand Final
        </div>

        <div class="mt-6 bg-slate-900/90 border-2 border-amber-500/40 rounded-xl p-4 shadow-xl shadow-amber-500/10 space-y-3">
          <!-- Final Home -->
          <div
            class="flex items-center justify-between text-sm px-3 py-2 rounded-lg"
            :class="baganData.final.home.pemenang ? 'bg-amber-500/20 text-amber-300 font-black' : 'text-slate-200 font-bold'"
          >
            <span>{{ baganData.final.home.nama }}</span>
            <span class="font-mono text-base font-black">{{ baganData.final.selesai ? baganData.final.home.skor : '-' }}</span>
          </div>

          <!-- Final Away -->
          <div
            class="flex items-center justify-between text-sm px-3 py-2 rounded-lg"
            :class="baganData.final.away.pemenang ? 'bg-amber-500/20 text-amber-300 font-black' : 'text-slate-200 font-bold'"
          >
            <span>{{ baganData.final.away.nama }}</span>
            <span class="font-mono text-base font-black">{{ baganData.final.selesai ? baganData.final.away.skor : '-' }}</span>
          </div>

          <div class="text-center pt-2 text-[11px] text-slate-400 border-t border-slate-800">
            {{ baganData.final.selesai ? 'Pemenang: ' + (baganData.final.home.pemenang ? baganData.final.home.nama : baganData.final.away.nama) : 'Perebutan Juara PCL' }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
