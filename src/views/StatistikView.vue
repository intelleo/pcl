<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStatistik } from '../composables/useStatistik.js'
import TabelPencetakGol from '../components/statistik/TabelPencetakGol.vue'
import TabelPengumpanGol from '../components/statistik/TabelPengumpanGol.vue'
import TabelTopPass from '../components/statistik/TabelTopPass.vue'
import TabelTopDefense from '../components/statistik/TabelTopDefense.vue'
import TabelTopMvp from '../components/statistik/TabelTopMvp.vue'
import TabelDisiplinKartu from '../components/statistik/TabelDisiplinKartu.vue'
import { Activity, Flame, Compass, Award, Shield, AlertTriangle, LayoutGrid, Crown, Medal, TrendingUp } from 'lucide-vue-next'

const {
  sedangMemuat,
  dataTopScorer,
  dataTopAssist,
  dataTopPass,
  dataTopDefense,
  dataTopMvp,
  dataDisiplin,
  ambilSemuaStatistik
} = useStatistik()

const tabAktif = ref('scorer')

const daftarTab = [
  { id: 'scorer', label: 'Top Scorer', icon: Flame },
  { id: 'assist', label: 'Top Assist', icon: Compass },
  { id: 'mvp', label: 'Top MVP', icon: Award },
  { id: 'pass', label: 'Top Pass', icon: Activity },
  { id: 'defense', label: 'Top Defense', icon: Shield },
  { id: 'cards', label: 'Disiplin', icon: AlertTriangle },
  { id: 'semua', label: 'Semua Kategori', icon: LayoutGrid }
]

const infoKategoriAktif = computed(() => {
  if (tabAktif.value === 'scorer') {
    return {
      list: dataTopScorer.value,
      satuan: 'Gol',
      judul: 'Pencetak Gol',
      deskripsi: 'Pemain dengan insting gol paling tajam di turnamen.',
      icon: Flame
    }
  }
  if (tabAktif.value === 'assist') {
    return {
      list: dataTopAssist.value,
      satuan: 'Assist',
      judul: 'Pengumpan Gol',
      deskripsi: 'Kreator serangan dengan umpan kunci paling matang.',
      icon: Compass
    }
  }
  if (tabAktif.value === 'mvp') {
    return {
      list: dataTopMvp.value,
      satuan: 'MVP',
      judul: 'Pemain Terbaik',
      deskripsi: 'Peraih penghargaan Man of the Match terbanyak.',
      icon: Award
    }
  }
  if (tabAktif.value === 'pass') {
    return {
      list: dataTopPass.value,
      satuan: 'Umpan',
      judul: 'Akurasi Umpan',
      deskripsi: 'Gelandang jangkar pengatur ritme dan distribusi bola.',
      icon: Activity
    }
  }
  if (tabAktif.value === 'defense') {
    return {
      list: dataTopDefense.value,
      satuan: 'Tekel',
      judul: 'Benteng Pertahanan',
      deskripsi: 'Pemain dengan intersepsi dan tekel sukses terbanyak.',
      icon: Shield
    }
  }
  if (tabAktif.value === 'cards') {
    const listCards = dataDisiplin.value.length ? dataDisiplin.value : [
      { player_id: '5', name: 'Antonio Rudiger', team_short: 'RMA', kuning: 1, merah: 0 }
    ]
    return {
      list: listCards,
      satuan: 'Kartu',
      judul: 'Kedisiplinan',
      deskripsi: 'Catatan kartu kuning dan kartu merah selama turnamen.',
      icon: AlertTriangle
    }
  }
  return null
})

const juara1 = computed(() => infoKategoriAktif.value?.list?.[0] || null)
const juara2 = computed(() => infoKategoriAktif.value?.list?.[1] || null)
const juara3 = computed(() => infoKategoriAktif.value?.list?.[2] || null)

onMounted(async () => {
  await ambilSemuaStatistik('sample-tournament-id')
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-3 pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Leaderboard 2026</span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
          Statistik individu
        </h1>
      </div>
      <p class="text-sm sm:text-base text-ink-400 max-w-md md:text-right leading-relaxed">
        Peringkat performa pemain Peak Champions League
      </p>
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
    <div v-if="sedangMemuat" class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      <div class="lg:col-span-5 h-80 rounded-xl bg-white border border-slate-200"></div>
      <div class="lg:col-span-7 h-80 rounded-xl bg-white border border-slate-200"></div>
    </div>

    <!-- Single Category Mode (Split 2 Kolom di Desktop) -->
    <div v-else-if="tabAktif !== 'semua' && infoKategoriAktif" class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <!-- Kolom Kiri: Spotlight Leader & Podium -->
      <div class="lg:col-span-5 space-y-4">
        <!-- Kartu Leader Utama (Rank 1) -->
        <div
          v-if="juara1"
          class="anim-muncul relative overflow-hidden rounded-2xl bg-white border border-ucl-500/40 ring-1 ring-ucl-500/20 shadow-card p-6 space-y-5"
        >
          <!-- Background decoration -->
          <div aria-hidden="true" class="absolute -right-6 -bottom-6 w-32 h-32 bg-ucl-50 rounded-full blur-2xl pointer-events-none"></div>

          <div class="flex items-center justify-between gap-3">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 border border-gold-200/80 text-gold-700 text-xs font-semibold">
              <Crown class="w-3.5 h-3.5 text-gold-600" />
              Peringkat 1 (Pemimpin)
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              {{ juara1.team_short }}
            </span>
          </div>

          <div>
            <h2 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 leading-tight">
              {{ juara1.name }}
            </h2>
            <p class="text-xs text-ink-400 mt-1">
              {{ infoKategoriAktif.deskripsi }}
            </p>
          </div>

          <!-- Metrik Besar -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total {{ infoKategoriAktif.satuan }}
              </div>
              <div class="text-xs text-ink-400 mt-0.5">
                Kategori {{ infoKategoriAktif.judul }}
              </div>
            </div>
            <div class="font-display text-4xl font-semibold text-ucl-600 tabular-nums">
              <template v-if="tabAktif === 'cards'">
                <span class="text-yellow-600">{{ juara1.kuning || 0 }}K</span>
                <span class="text-slate-300 mx-1">/</span>
                <span class="text-red-600">{{ juara1.merah || 0 }}M</span>
              </template>
              <template v-else>
                {{ juara1.total }}
              </template>
            </div>
          </div>
        </div>

        <!-- Podium Runner-Up (Rank 2 & 3) -->
        <div v-if="juara2 || juara3" class="anim-muncul grid grid-cols-2 gap-3" style="animation-delay: 80ms">
          <!-- Rank 2 -->
          <div v-if="juara2" class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="inline-flex items-center gap-1 font-semibold text-slate-600">
                <Medal class="w-3.5 h-3.5 text-slate-400" />
                Rank 2
              </span>
              <span class="text-[11px] font-medium text-slate-400">{{ juara2.team_short }}</span>
            </div>
            <div class="font-medium text-sm text-ink-900 truncate">{{ juara2.name }}</div>
            <div class="text-xs font-semibold text-ucl-600 tabular-nums">
              {{ tabAktif === 'cards' ? `${juara2.kuning || 0}K / ${juara2.merah || 0}M` : `${juara2.total} ${infoKategoriAktif.satuan}` }}
            </div>
          </div>

          <!-- Rank 3 -->
          <div v-if="juara3" class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="inline-flex items-center gap-1 font-semibold text-amber-800">
                <Medal class="w-3.5 h-3.5 text-amber-600" />
                Rank 3
              </span>
              <span class="text-[11px] font-medium text-slate-400">{{ juara3.team_short }}</span>
            </div>
            <div class="font-medium text-sm text-ink-900 truncate">{{ juara3.name }}</div>
            <div class="text-xs font-semibold text-ucl-600 tabular-nums">
              {{ tabAktif === 'cards' ? `${juara3.kuning || 0}K / ${juara3.merah || 0}M` : `${juara3.total} ${infoKategoriAktif.satuan}` }}
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Tabel Leaderboard Lengkap -->
      <div class="lg:col-span-7">
        <TabelPencetakGol v-if="tabAktif === 'scorer'" :data="dataTopScorer" />
        <TabelPengumpanGol v-else-if="tabAktif === 'assist'" :data="dataTopAssist" />
        <TabelTopMvp v-else-if="tabAktif === 'mvp'" :data="dataTopMvp" />
        <TabelTopPass v-else-if="tabAktif === 'pass'" :data="dataTopPass" />
        <TabelTopDefense v-else-if="tabAktif === 'defense'" :data="dataTopDefense" />
        <TabelDisiplinKartu
          v-else-if="tabAktif === 'cards'"
          :data="dataDisiplin.length ? dataDisiplin : [
            { player_id: '5', name: 'Antonio Rudiger', team_short: 'RMA', kuning: 1, merah: 0 }
          ]"
        />
      </div>
    </div>

    <!-- Content All Grids Mode -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TabelPencetakGol :data="dataTopScorer" />
      <TabelPengumpanGol :data="dataTopAssist" />
      <TabelTopMvp :data="dataTopMvp" />
      <TabelTopPass :data="dataTopPass" />
      <TabelTopDefense :data="dataTopDefense" />
      <TabelDisiplinKartu
        :data="dataDisiplin.length ? dataDisiplin : [
          { player_id: '5', name: 'Antonio Rudiger', team_short: 'RMA', kuning: 1, merah: 0 }
        ]"
      />
    </div>
  </div>
</template>

