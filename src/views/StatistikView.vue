<script setup>
import { onMounted } from 'vue'
import { useStatistik } from '../composables/useStatistik.js'
import TabelPencetakGol from '../components/statistik/TabelPencetakGol.vue'
import TabelPengumpanGol from '../components/statistik/TabelPengumpanGol.vue'
import TabelDisiplinKartu from '../components/statistik/TabelDisiplinKartu.vue'

const { sedangMemuat, dataTopScorer, dataTopAssist, dataDisiplin, ambilSemuaStatistik } = useStatistik()

onMounted(async () => {
  await ambilSemuaStatistik('sample-tournament-id')
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-wide uppercase">
        Statistik Individu Pemain
      </h1>
      <p class="text-sm text-slate-400">Papan peringkat Top Scorer, Assist, dan Akumulasi Kartu Turnamen PCL</p>
    </div>

    <div v-if="sedangMemuat" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="n in 3" :key="n" class="h-64 rounded-xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Top Scorer -->
      <TabelPencetakGol
        :data="dataTopScorer.length ? dataTopScorer : [
          { player_id: '1', name: 'L. Messi (Peak)', team_short: 'BAR', total: 3 },
          { player_id: '2', name: 'C. Ronaldo (Peak)', team_short: 'RMA', total: 1 }
        ]"
      />

      <!-- Top Assist -->
      <TabelPengumpanGol
        :data="dataTopAssist.length ? dataTopAssist : [
          { player_id: '3', name: 'Pedri', team_short: 'BAR', total: 2 },
          { player_id: '4', name: 'K. De Bruyne', team_short: 'MCI', total: 1 }
        ]"
      />

      <!-- Disiplin / Kartu -->
      <TabelDisiplinKartu
        :data="dataDisiplin.length ? dataDisiplin : [
          { player_id: '5', name: 'Modric', team_short: 'RMA', kuning: 1, merah: 0 }
        ]"
      />
    </div>
  </div>
</template>
