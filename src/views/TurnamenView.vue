<script setup>
import { ref, onMounted, computed } from 'vue'
import { useKlasemen } from '../composables/useKlasemen.js'
import { supabase } from '../lib/supabase.js'
import TabelKlasemenGrup from '../components/turnamen/TabelKlasemenGrup.vue'
import BaganFaseGugur from '../components/turnamen/BaganFaseGugur.vue'
import { Shield, GitBranch } from 'lucide-vue-next'

const tabAktif = ref('grup')
const { sedangMemuat, klasemenPerGrup, ambilKlasemenGrup } = useKlasemen()
const sedangMemuatBagan = ref(false)
const lagaKnockout = ref([])

async function ambilBaganGugur() {
  sedangMemuatBagan.value = true
  try {
    const { data, error } = await supabase
      .from('pcl_matches')
      .select(`
        *,
        home_team:pcl_teams!pcl_matches_home_team_id_fkey(*),
        away_team:pcl_teams!pcl_matches_away_team_id_fkey(*)
      `)
      .in('stage', ['quarter_final', 'semi_final', 'final'])
      .order('created_at', { ascending: true })

    if (!error && data) {
      lagaKnockout.value = data
    }
  } catch (err) {
    lagaKnockout.value = []
  } finally {
    sedangMemuatBagan.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    ambilKlasemenGrup('sample-tournament-id'),
    ambilBaganGugur()
  ])
})

const dataBaganDinamic = computed(() => {
  const qfMatches = lagaKnockout.value.filter(m => m.stage === 'quarter_final')
  const sfMatches = lagaKnockout.value.filter(m => m.stage === 'semi_final')
  const finalMatch = lagaKnockout.value.find(m => m.stage === 'final')

  const formatLaga = (m, defaultLabel) => {
    if (!m) return null
    const homeScore = Number(m.home_score || 0)
    const awayScore = Number(m.away_score || 0)
    const selesai = m.status === 'finished'
    return {
      id: m.id,
      label: m.knockout_bracket_slot || defaultLabel,
      home: {
        nama: m.home_team?.name || 'TBD',
        short: m.home_team?.short_name || '-',
        skor: homeScore,
        pemenang: selesai && homeScore > awayScore
      },
      away: {
        nama: m.away_team?.name || 'TBD',
        short: m.away_team?.short_name || '-',
        skor: awayScore,
        pemenang: selesai && awayScore > homeScore
      },
      selesai
    }
  }

  const qfList = [0, 1, 2, 3].map(i => formatLaga(qfMatches[i], `QF ${i + 1}`) || {
    id: `qf-${i + 1}`,
    label: `QF ${i + 1}`,
    home: { nama: `Juara Grup ${String.fromCharCode(65 + i)}`, short: `1${String.fromCharCode(65 + i)}`, skor: 0, pemenang: false },
    away: { nama: `Runner-up Grup ${String.fromCharCode(65 + ((i + 1) % 4))}`, short: `2${String.fromCharCode(65 + ((i + 1) % 4))}`, skor: 0, pemenang: false },
    selesai: false
  })

  const sfList = [0, 1].map(i => formatLaga(sfMatches[i], `Semi Final ${i + 1}`) || {
    id: `sf-${i + 1}`,
    label: `Semi Final ${i + 1}`,
    home: { nama: `Pemenang QF ${i * 2 + 1}`, short: `W${i * 2 + 1}`, skor: 0, pemenang: false },
    away: { nama: `Pemenang QF ${i * 2 + 2}`, short: `W${i * 2 + 2}`, skor: 0, pemenang: false },
    selesai: false
  })

  let fin = formatLaga(finalMatch, 'Grand Final PCL 2026')
  if (!fin) {
    fin = {
      id: 'fin',
      label: 'Grand Final PCL 2026',
      home: { nama: 'Pemenang SF 1', short: 'F1', skor: 0, pemenang: false },
      away: { nama: 'Pemenang SF 2', short: 'F2', skor: 0, pemenang: false },
      selesai: false,
      juara: null
    }
  } else {
    const homeMenang = fin.home.pemenang
    const awayMenang = fin.away.pemenang
    const timJuara = homeMenang ? finalMatch.home_team : awayMenang ? finalMatch.away_team : null
    fin.juara = timJuara ? {
      nama: timJuara.name,
      short: timJuara.short_name,
      trofi: 'Peak Champions League Trophy 2026'
    } : null
  }

  return {
    perempatFinal: qfList,
    semiFinal: sfList,
    final: fin
  }
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
      <BaganFaseGugur :baganData="dataBaganDinamic" />
    </div>
  </div>
</template>
