<script setup>
import { ref, onMounted } from 'vue'
import { useKlasemen } from '../composables/useKlasemen.js'
import TabelKlasemenGrup from '../components/turnamen/TabelKlasemenGrup.vue'
import BaganFaseGugur from '../components/turnamen/BaganFaseGugur.vue'
import { Shield, GitBranch } from 'lucide-vue-next'

const tabAktif = ref('grup') // 'grup' | 'knockout'
const { sedangMemuat, klasemenPerGrup, ambilKlasemenGrup } = useKlasemen()

onMounted(async () => {
  await ambilKlasemenGrup('sample-tournament-id')
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
    <!-- Header & Tab Switcher -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pcl-border">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-wide uppercase">
          Fase & Bagan Turnamen
        </h1>
        <p class="text-xs sm:text-sm text-pcl-silver">Pantau klasemen fase grup dan bagan perjalanan menuju gelar juara</p>
      </div>

      <!-- Tab Buttons -->
      <div class="inline-flex p-1 rounded-xl bg-pcl-navy border border-pcl-border w-full sm:w-auto">
        <button
          @click="tabAktif = 'grup'"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          :class="tabAktif === 'grup' ? 'bg-pcl-gold text-slate-950 shadow-md font-black' : 'text-pcl-silver hover:text-white'"
        >
          <Shield class="w-4 h-4" />
          Fase Grup
        </button>
        <button
          @click="tabAktif = 'knockout'"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          :class="tabAktif === 'knockout' ? 'bg-pcl-gold text-slate-950 shadow-md font-black' : 'text-pcl-silver hover:text-white'"
        >
          <GitBranch class="w-4 h-4" />
          Bagan Gugur
        </button>
      </div>
    </div>

    <!-- Content Tab 1: Fase Grup -->
    <div v-if="tabAktif === 'grup'" class="space-y-6">
      <div v-if="sedangMemuat" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="n in 2" :key="n" class="h-64 rounded-2xl bg-pcl-card/50 animate-pulse border border-pcl-border"></div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sample Group A & B -->
        <TabelKlasemenGrup
          namaGrup="Grup A"
          :klasemen="[
            { team_id: '1', team_name: 'Barcelona FC', team_short_name: 'BAR', played: 1, won: 1, drawn: 0, lost: 0, goals_for: 3, goals_against: 1, goal_difference: 2, points: 3 },
            { team_id: '3', team_name: 'Manchester United', team_short_name: 'MUN', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
            { team_id: '4', team_name: 'Manchester City', team_short_name: 'MCI', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
            { team_id: '2', team_name: 'Real Madrid', team_short_name: 'RMA', played: 1, won: 0, drawn: 0, lost: 1, goals_for: 1, goals_against: 3, goal_difference: -2, points: 0 }
          ]"
        />

        <TabelKlasemenGrup
          namaGrup="Grup B"
          :klasemen="[
            { team_id: '5', team_name: 'Bayern Munich', team_short_name: 'BAY', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
            { team_id: '6', team_name: 'Borussia Dortmund', team_short_name: 'DOR', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
            { team_id: '7', team_name: 'Paris Saint-Germain', team_short_name: 'PSG', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
            { team_id: '8', team_name: 'Juventus FC', team_short_name: 'JUV', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 }
          ]"
        />
      </div>
    </div>

    <!-- Content Tab 2: Bagan Knockout -->
    <div v-else-if="tabAktif === 'knockout'" class="space-y-6">
      <BaganFaseGugur />
    </div>
  </div>
</template>
