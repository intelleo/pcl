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
  <div class="bg-pcl-card/90 border border-pcl-border rounded-2xl p-4 sm:p-8 overflow-x-auto shadow-2xl">
    <div class="min-w-[620px] sm:min-w-[700px] flex items-center justify-between gap-6 sm:gap-8 py-4">

      <!-- Kolom Semi Final -->
      <div class="flex-1 flex flex-col justify-around gap-8 sm:gap-12">
        <div class="text-xs font-bold uppercase tracking-wider text-pcl-silver text-center pb-2 border-b border-pcl-border font-display text-sm">
          Semi Final
        </div>

        <div v-for="match in baganData.semiFinal" :key="match.id" class="relative group">
          <!-- Card Match Bracket -->
          <div class="bg-pcl-navy border border-pcl-border group-hover:border-pcl-gold/40 transition-colors rounded-xl p-3 shadow-lg space-y-2">
            <!-- Home -->
            <div
              class="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg"
              :class="match.home.pemenang ? 'bg-pcl-gold/15 text-pcl-goldLight font-bold border border-pcl-gold/30' : 'text-slate-300'"
            >
              <span class="truncate">{{ match.home.nama }}</span>
              <span class="font-mono font-bold">{{ match.selesai ? match.home.skor : '-' }}</span>
            </div>
            <!-- Away -->
            <div
              class="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg"
              :class="match.away.pemenang ? 'bg-pcl-gold/15 text-pcl-goldLight font-bold border border-pcl-gold/30' : 'text-slate-300'"
            >
              <span class="truncate">{{ match.away.nama }}</span>
              <span class="font-mono font-bold">{{ match.selesai ? match.away.skor : '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider / Garis Visual Bracket -->
      <div class="w-8 sm:w-12 flex flex-col items-center justify-center text-pcl-border">
        <div class="h-20 sm:h-24 w-px bg-pcl-border"></div>
        <div class="w-6 sm:w-8 h-px bg-pcl-border"></div>
        <div class="h-20 sm:h-24 w-px bg-pcl-border"></div>
      </div>

      <!-- Kolom Final -->
      <div class="flex-1 flex flex-col justify-center max-w-xs sm:max-w-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-pcl-gold text-center pb-2 border-b border-pcl-gold/30 flex items-center justify-center gap-1.5 font-display text-sm">
          <Trophy class="w-4 h-4 text-pcl-gold" />
          Grand Final
        </div>

        <div class="mt-6 bg-pcl-navy/90 border-2 border-pcl-gold/50 rounded-2xl p-4 sm:p-5 shadow-xl shadow-pcl-gold/10 space-y-3">
          <!-- Final Home -->
          <div
            class="flex items-center justify-between text-xs sm:text-sm px-3 py-2 rounded-xl"
            :class="baganData.final.home.pemenang ? 'bg-pcl-gold/20 text-pcl-goldLight font-black border border-pcl-gold/40' : 'text-white font-bold'"
          >
            <span class="truncate">{{ baganData.final.home.nama }}</span>
            <span class="font-mono text-sm sm:text-base font-black">{{ baganData.final.selesai ? baganData.final.home.skor : '-' }}</span>
          </div>

          <!-- Final Away -->
          <div
            class="flex items-center justify-between text-xs sm:text-sm px-3 py-2 rounded-xl"
            :class="baganData.final.away.pemenang ? 'bg-pcl-gold/20 text-pcl-goldLight font-black border border-pcl-gold/40' : 'text-white font-bold'"
          >
            <span class="truncate">{{ baganData.final.away.nama }}</span>
            <span class="font-mono text-sm sm:text-base font-black">{{ baganData.final.selesai ? baganData.final.away.skor : '-' }}</span>
          </div>

          <div class="text-center pt-2 text-[10px] sm:text-[11px] text-pcl-silver border-t border-pcl-border font-semibold">
            {{ baganData.final.selesai ? 'Pemenang: ' + (baganData.final.home.pemenang ? baganData.final.home.nama : baganData.final.away.nama) : 'Perebutan Juara PCL' }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
