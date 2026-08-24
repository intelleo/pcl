<script setup>
import { ref, onMounted } from 'vue'
import { useKlasemen } from '../composables/useKlasemen.js'
import TabelKlasemenGrup from '../components/turnamen/TabelKlasemenGrup.vue'
import BaganFaseGugur from '../components/turnamen/BaganFaseGugur.vue'
import { Shield, GitBranch } from 'lucide-vue-next'

const tabAktif = ref('grup')
const { sedangMemuat, klasemenPerGrup, ambilKlasemenGrup } = useKlasemen()

onMounted(async () => {
  await ambilKlasemenGrup('sample-tournament-id')
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Turnamen PCL 2026</span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
          Fase &amp; bagan turnamen
        </h1>
        <p class="text-sm sm:text-base text-ink-400 max-w-2xl mt-1 leading-relaxed">
          Pantau peringkat fase grup dan jalannya bagan gugur menuju grand final.
        </p>
      </div>

      <!-- Tabs -->
      <div class="inline-flex p-1 rounded-full bg-slate-100 w-full md:w-auto shrink-0 self-start md:self-auto">
        <button
          @click="tabAktif = 'grup'"
          class="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
          :class="tabAktif === 'grup' ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
        >
          <Shield class="w-4 h-4" :class="tabAktif === 'grup' ? 'text-ucl-600' : 'text-slate-400'" />
          Fase Grup
        </button>
        <button
          @click="tabAktif = 'knockout'"
          class="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
          :class="tabAktif === 'knockout' ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
        >
          <GitBranch class="w-4 h-4" :class="tabAktif === 'knockout' ? 'text-ucl-600' : 'text-slate-400'" />
          Bagan Gugur
        </button>
      </div>
    </div>

    <!-- Fase Grup -->
    <div v-if="tabAktif === 'grup'" class="space-y-6">
      <div v-if="sedangMemuat" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="n in 2" :key="n" class="h-64 rounded-xl bg-white border border-slate-200 animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TabelKlasemenGrup
          v-for="grup in klasemenPerGrup"
          :key="grup.id"
          :namaGrup="grup.nama"
          :klasemen="grup.klasemen"
        />
      </div>
    </div>

    <!-- Bagan Knockout -->
    <div v-else-if="tabAktif === 'knockout'" class="space-y-6">
      <BaganFaseGugur />
    </div>
  </div>
</template>
