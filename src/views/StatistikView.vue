<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from '../lib/api.js'
import { useStatistik } from '../composables/useStatistik.js'
import TabelPencetakGol from '../components/statistik/TabelPencetakGol.vue'
import TabelPengumpanGol from '../components/statistik/TabelPengumpanGol.vue'
import TabelTopPass from '../components/statistik/TabelTopPass.vue'
import TabelTopDefense from '../components/statistik/TabelTopDefense.vue'
import TabelTopMvp from '../components/statistik/TabelTopMvp.vue'
import { Activity, Flame, Compass, Award, Shield, LayoutGrid, ChevronDown } from 'lucide-vue-next'

// === Season Selector ===
const daftarSeason = ref([])
const seasonTerpilihId = ref(null)
const sedangMemuatSeason = ref(false)

const seasonTerpilih = computed(() =>
  daftarSeason.value.find((s) => s.id === seasonTerpilihId.value) || null
)

async function muatDaftarSeason() {
  sedangMemuatSeason.value = true
  try {
    const data = await api.getTournaments()
    daftarSeason.value = data || []
    const aktif = (data || []).find((s) => s.status !== 'completed')
    seasonTerpilihId.value = aktif?.id || (data || [])[0]?.id || null
  } catch {
    daftarSeason.value = []
  } finally {
    sedangMemuatSeason.value = false
  }
}

watch(seasonTerpilihId, (newId) => {
  if (newId) {
    ambilSemuaStatistik(newId, true)
  }
})

const {
  sedangMemuat,
  dataTopScorer,
  dataTopAssist,
  dataTopPass,
  dataTopDefense,
  dataTopMvp,
  ambilSemuaStatistik
} = useStatistik()

const tabAktif = ref('scorer')

const daftarTab = [
  { id: 'scorer', label: 'Top Scorer', icon: Flame },
  { id: 'assist', label: 'Top Assist', icon: Compass },
  { id: 'mvp', label: 'Top MVP', icon: Award },
  { id: 'pass', label: 'Top Pass', icon: Activity },
  { id: 'defense', label: 'Top Defense', icon: Shield },
  { id: 'semua', label: 'Semua Kategori', icon: LayoutGrid }
]

onMounted(async () => {
  await muatDaftarSeason()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Leaderboard {{ seasonTerpilih ? seasonTerpilih.season : '2026' }}
        </span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
          Statistik Individu
        </h1>
        <p class="text-xs sm:text-sm text-ink-400 mt-1">
          Peringkat performa pemain Peak Champions League
        </p>
      </div>

      <!-- Season Selector Dropdown -->
      <div v-if="daftarSeason.length > 1" class="relative shrink-0">
        <select
          v-model="seasonTerpilihId"
          class="appearance-none bg-white border border-slate-300 rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-ink-900 cursor-pointer hover:border-ucl-400 focus:border-ucl-500 outline-none transition-colors shadow-sm w-full sm:w-auto min-w-[160px]"
        >
          <option v-for="s in daftarSeason" :key="s.id" :value="s.id">
            {{ s.name }} ({{ s.season }}){{ s.status !== 'completed' ? ' — Aktif' : '' }}
          </option>
        </select>
        <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>

    <!-- Segmented Tabs -->
    <div class="flex items-center gap-1 p-1 rounded-full bg-slate-100 overflow-x-auto scrollbar-none w-fit max-w-full">
      <button
        v-for="tab in daftarTab"
        :key="tab.id"
        @click="tabAktif = tab.id"
        class="py-2 px-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
        :class="tabAktif === tab.id
          ? 'bg-white text-ink-900 shadow-card'
          : 'text-slate-500 hover:text-ink-900'"
      >
        <component :is="tab.icon" class="w-4 h-4" :class="tabAktif === tab.id ? 'text-ucl-600' : 'text-slate-400'" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="sedangMemuat" class="space-y-4 animate-pulse">
      <div class="h-96 rounded-xl bg-white border border-slate-200"></div>
    </div>

    <!-- Single Category Mode (Satu Tabel Penuh) -->
    <div v-else-if="tabAktif !== 'semua'" class="max-w-4xl mx-auto w-full anim-muncul">
      <TabelPencetakGol v-if="tabAktif === 'scorer'" :data="dataTopScorer" />
      <TabelPengumpanGol v-else-if="tabAktif === 'assist'" :data="dataTopAssist" />
      <TabelTopMvp v-else-if="tabAktif === 'mvp'" :data="dataTopMvp" />
      <TabelTopPass v-else-if="tabAktif === 'pass'" :data="dataTopPass" />
      <TabelTopDefense v-else-if="tabAktif === 'defense'" :data="dataTopDefense" />
    </div>

    <!-- Content All Grids Mode -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 anim-muncul">
      <TabelPencetakGol :data="dataTopScorer" />
      <TabelPengumpanGol :data="dataTopAssist" />
      <TabelTopMvp :data="dataTopMvp" />
      <TabelTopPass :data="dataTopPass" />
      <TabelTopDefense :data="dataTopDefense" />
    </div>
  </div>
</template>

