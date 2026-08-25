<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  Calendar,
  Search,
  ChevronRight,
  Shield,
  Star,
  MapPin
} from 'lucide-vue-next'
import pialaPcl from '@/assets/img/piala-pcl.webp'

const router = useRouter()
const cariTeks = ref('')
const tabTampilan = ref('musim') // 'musim' | 'klub'
const sedangMemuat = ref(false)

const daftarRiwayat = ref([])

onMounted(async () => {
  sedangMemuat.value = true

  try {
    const { data } = await supabase
      .from('pcl_season_champions')
      .select(`
        *,
        juara:pcl_teams!pcl_season_champions_juara_team_id_fkey(*),
        runner_up:pcl_teams!pcl_season_champions_runner_up_team_id_fkey(*)
      `)
      .order('musim', { ascending: false })

    if (data && data.length > 0) {
      daftarRiwayat.value = data.map(d => ({
        id: d.id,
        musim: d.musim,
        label_musim: d.label_musim,
        skor_final: d.skor_final,
        juara: d.juara || { name: 'Klub Juara', short_name: 'JUR' },
        runner_up: d.runner_up || { name: 'Runner-up', short_name: 'RUN' },
        top_scorer: {
          nama: d.top_scorer_nama || '-',
          klub: d.juara?.short_name || 'PCL',
          total: d.top_scorer_total || 0
        },
        mvp_turnamen: {
          nama: d.mvp_nama || '-',
          klub: d.juara?.short_name || 'PCL',
          rating: d.mvp_rating || 9.0
        }
      }))
    } else {
      daftarRiwayat.value = []
    }
  } catch (err) {
    daftarRiwayat.value = []
  } finally {
    sedangMemuat.value = false
  }
})

// Rekap Hall of Fame (Total Gelar Juara per Klub)
const rekapTrofiKlub = computed(() => {
  const mapTrofi = {}
  daftarRiwayat.value.forEach(item => {
    const juara = item.juara
    if (!mapTrofi[juara.name]) {
      mapTrofi[juara.name] = {
        id: juara.id,
        name: juara.name,
        short_name: juara.short_name,
        manager_name: juara.manager_name,
        total_juara: 0,
        total_runner_up: 0,
        musim_juara: []
      }
    }
    mapTrofi[juara.name].total_juara += 1
    mapTrofi[juara.name].musim_juara.push(item.musim)

    const runnerUp = item.runner_up
    if (!mapTrofi[runnerUp.name]) {
      mapTrofi[runnerUp.name] = {
        id: runnerUp.id,
        name: runnerUp.name,
        short_name: runnerUp.short_name,
        manager_name: runnerUp.manager_name,
        total_juara: 0,
        total_runner_up: 0,
        musim_juara: []
      }
    }
    mapTrofi[runnerUp.name].total_runner_up += 1
  })

  return Object.values(mapTrofi).sort((a, b) => {
    if (b.total_juara !== a.total_juara) return b.total_juara - a.total_juara
    return b.total_runner_up - a.total_runner_up
  })
})

const riwayatTerfilter = computed(() => {
  if (!cariTeks.value.trim()) return daftarRiwayat.value
  const q = cariTeks.value.toLowerCase()
  return daftarRiwayat.value.filter(r => {
    return (
      r.musim.toLowerCase().includes(q) ||
      r.label_musim.toLowerCase().includes(q) ||
      r.juara.name.toLowerCase().includes(q) ||
      r.juara.short_name.toLowerCase().includes(q) ||
      r.runner_up.name.toLowerCase().includes(q) ||
      r.top_scorer.nama.toLowerCase().includes(q) ||
      r.mvp_turnamen.nama.toLowerCase().includes(q)
    )
  })
})

const klubTerfilter = computed(() => {
  if (!cariTeks.value.trim()) return rekapTrofiKlub.value
  const q = cariTeks.value.toLowerCase()
  return rekapTrofiKlub.value.filter(k => {
    return k.name.toLowerCase().includes(q) || k.short_name.toLowerCase().includes(q)
  })
})

function bukaDetailTim(timId) {
  if (timId) {
    router.push(`/tim/${timId}`)
  } else {
    router.push('/tim')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header Hero Banner -->
    <div class="anim-muncul relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-card p-6 sm:p-8">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold-50 via-white to-amber-50 border border-gold-300/80 flex items-center justify-center shrink-0 p-2 shadow-sm">
            <img :src="pialaPcl" alt="Trofi PCL" class="w-full h-full object-contain drop-shadow" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Hall of Fame</span>
              <span class="text-slate-300">•</span>
              <span class="text-xs font-medium text-slate-500">Arsip Resmi PCL</span>
            </div>
            <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
              Riwayat Juara Turnamen
            </h1>
            <p class="text-xs sm:text-sm text-ink-400 mt-1 max-w-xl leading-relaxed">
              Catatan sejarah pemenang trofi, hasil laga grand final, dan peraih gelar individu setiap musim.
            </p>
          </div>
        </div>

        <!-- Metric Summary Chips -->
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div class="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Edisi Musim</div>
            <div class="font-display text-lg font-semibold text-ink-900 tabular-nums">
              {{ daftarRiwayat.length }} Musim
            </div>
          </div>
          <div class="px-4 py-2.5 rounded-xl bg-gold-50/60 border border-gold-200 text-center">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-gold-700">Klub Juara</div>
            <div class="font-display text-lg font-semibold text-gold-700 tabular-nums">
              {{ rekapTrofiKlub.filter(k => k.total_juara > 0).length }} Klub
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Mode Switcher Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="cariTeks"
          type="text"
          :placeholder="tabTampilan === 'musim' ? 'Cari musim, juara, atau pemain...' : 'Cari nama klub...'"
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500 transition-colors shadow-sm"
        />
      </div>

      <!-- Segmented Tab Switcher -->
      <div class="inline-flex p-1 rounded-full bg-slate-100 self-start sm:self-auto shrink-0">
        <button
          @click="tabTampilan = 'musim'"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
          :class="tabTampilan === 'musim' ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
        >
          <Calendar class="w-3.5 h-3.5" :class="tabTampilan === 'musim' ? 'text-ucl-600' : 'text-slate-400'" />
          Daftar Musim
        </button>
        <button
          @click="tabTampilan = 'klub'"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
          :class="tabTampilan === 'klub' ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
        >
          <Crown class="w-3.5 h-3.5" :class="tabTampilan === 'klub' ? 'text-gold-600' : 'text-slate-400'" />
          Koleksi Trofi
        </button>
      </div>
    </div>

    <!-- TABEL 1: Riwayat Per Musim -->
    <div v-if="tabTampilan === 'musim'" class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6 w-28">Musim</th>
              <th class="py-3 px-4 sm:px-6">Juara (Pemenang)</th>
              <th class="py-3 px-4 sm:px-6 text-center w-28">Skor Final</th>
              <th class="py-3 px-4 sm:px-6">Runner-up</th>
              <th class="py-3 px-4 sm:px-6 hidden lg:table-cell">Top Scorer</th>
              <th class="py-3 px-4 sm:px-6 hidden xl:table-cell">Pemain Terbaik (MVP)</th>
              <th class="py-3 px-4 sm:px-6 text-right w-20">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="riwayatTerfilter.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-ink-400">
                Tidak ada data musim yang sesuai pencarian "{{ cariTeks }}".
              </td>
            </tr>

            <tr
              v-for="item in riwayatTerfilter"
              :key="item.id"
              class="hover:bg-ucl-50/40 transition-colors group"
            >
              <!-- Musim -->
              <td class="py-4 px-4 sm:px-6 align-middle whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-ink-900 font-semibold text-xs tabular-nums">
                  <Calendar class="w-3.5 h-3.5 text-ucl-600" />
                  {{ item.musim }}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  {{ item.label_musim.split('(')[1]?.replace(')', '') || 'PCL' }}
                </div>
              </td>

              <!-- Juara 1 -->
              <td class="py-4 px-4 sm:px-6 align-middle">
                <div
                  @click="bukaDetailTim(item.juara.id)"
                  class="flex items-center gap-3 cursor-pointer group/team max-w-xs"
                >
                  <div class="w-10 h-10 rounded-xl bg-gold-50 border border-gold-300/80 flex items-center justify-center font-display font-semibold text-xs text-gold-800 shrink-0 shadow-sm group-hover/team:scale-105 transition-transform">
                    {{ item.juara.short_name }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-semibold text-ink-900 group-hover/team:text-ucl-600 transition-colors truncate">
                        {{ item.juara.name }}
                      </span>
                      <span class="inline-flex items-center px-1.5 py-0.2 rounded bg-gold-100 text-gold-800 text-[10px] font-semibold uppercase tracking-wider">
                        Juara 1
                      </span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 truncate">
                      {{ item.juara.manager_name }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Skor Final -->
              <td class="py-4 px-4 sm:px-6 align-middle text-center whitespace-nowrap">
                <span class="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 font-display font-semibold text-sm tabular-nums text-navy-800 inline-block shadow-sm">
                  {{ item.skor_final }}
                </span>
                <div class="text-[10px] text-slate-400 font-medium mt-1">Full Time</div>
              </td>

              <!-- Runner-Up -->
              <td class="py-4 px-4 sm:px-6 align-middle">
                <div
                  @click="bukaDetailTim(item.runner_up.id)"
                  class="flex items-center gap-3 cursor-pointer group/runner max-w-xs"
                >
                  <div class="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-xs text-slate-700 shrink-0 group-hover/runner:scale-105 transition-transform">
                    {{ item.runner_up.short_name }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-ink-900 group-hover/runner:text-ucl-600 transition-colors truncate">
                      {{ item.runner_up.name }}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 truncate">
                      {{ item.runner_up.manager_name }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Top Scorer -->
              <td class="py-4 px-4 sm:px-6 align-middle hidden lg:table-cell">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Flame class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-xs text-ink-900 truncate">
                      {{ item.top_scorer.nama }}
                    </div>
                    <div class="text-[11px] text-slate-400">
                      {{ item.top_scorer.klub }} · <span class="font-semibold text-red-600 tabular-nums">{{ item.top_scorer.total }} Gol</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- MVP Turnamen -->
              <td class="py-4 px-4 sm:px-6 align-middle hidden xl:table-cell">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-lg bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 shrink-0">
                    <Award class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-xs text-ink-900 truncate">
                      {{ item.mvp_turnamen.nama }}
                    </div>
                    <div class="text-[11px] text-slate-400">
                      {{ item.mvp_turnamen.klub }} · <span class="font-semibold text-gold-700 tabular-nums">{{ item.mvp_turnamen.rating }} Rtg</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Tombol Navigasi Klub Juara -->
              <td class="py-4 px-4 sm:px-6 align-middle text-right">
                <button
                  type="button"
                  @click="bukaDetailTim(item.juara.id)"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 group-hover:text-ucl-600 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all cursor-pointer"
                  title="Lihat Tim Juara"
                >
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TABEL 2: Rekap Koleksi Trofi Klub (Hall of Fame) -->
    <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th class="py-3 px-4 sm:px-6">Klub Kontestan</th>
              <th class="py-3 px-4 sm:px-6 text-center w-32">Gelar Juara</th>
              <th class="py-3 px-4 sm:px-6 text-center w-32">Runner-up</th>
              <th class="py-3 px-4 sm:px-6">Tahun Gelar Juara</th>
              <th class="py-3 px-4 sm:px-6 text-right w-24">Profil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="klubTerfilter.length === 0">
              <td colspan="6" class="py-12 text-center text-sm text-ink-400">
                Tidak ada klub yang sesuai pencarian "{{ cariTeks }}".
              </td>
            </tr>

            <tr
              v-for="(klub, idx) in klubTerfilter"
              :key="klub.name"
              @click="bukaDetailTim(klub.id)"
              class="hover:bg-ucl-50/40 cursor-pointer transition-colors group"
            >
              <!-- Rank -->
              <td class="py-3.5 px-4 sm:px-6 text-center align-middle">
                <span
                  class="w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                  :class="idx === 0 ? 'bg-gold-100 text-gold-800' : 'text-slate-400'"
                >
                  {{ idx + 1 }}
                </span>
              </td>

              <!-- Klub -->
              <td class="py-3.5 px-4 sm:px-6 align-middle">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-9 h-9 rounded-lg border flex items-center justify-center font-display font-semibold text-xs shrink-0 transition-colors"
                    :class="idx === 0
                      ? 'bg-gold-50 border-gold-300 text-gold-800'
                      : 'bg-slate-50 border-slate-200 text-navy-800 group-hover:border-ucl-500/40'"
                  >
                    {{ klub.short_name }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors truncate">
                      {{ klub.name }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Total Juara -->
              <td class="py-3.5 px-4 sm:px-6 text-center align-middle">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums border"
                  :class="klub.total_juara > 0
                    ? 'bg-gold-50 border-gold-200 text-gold-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'"
                >
                  <Trophy class="w-3.5 h-3.5" :class="klub.total_juara > 0 ? 'text-gold-600' : 'text-slate-300'" />
                  {{ klub.total_juara }} Trofi
                </span>
              </td>

              <!-- Total Runner-Up -->
              <td class="py-3.5 px-4 sm:px-6 text-center align-middle">
                <span class="text-xs font-medium tabular-nums text-slate-600">
                  {{ klub.total_runner_up }}x
                </span>
              </td>

              <!-- Tahun Juara -->
              <td class="py-3.5 px-4 sm:px-6 align-middle">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    v-for="th in klub.musim_juara"
                    :key="th"
                    class="inline-block px-2.5 py-0.5 rounded-md bg-gold-50 border border-gold-200 text-gold-800 text-xs font-semibold tabular-nums"
                  >
                    {{ th }}
                  </span>
                  <span v-if="klub.musim_juara.length === 0" class="text-xs text-slate-400 italic">
                    Belum pernah juara
                  </span>
                </div>
              </td>

              <!-- Link Profil -->
              <td class="py-3.5 px-4 sm:px-6 text-right align-middle">
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-ucl-600 group-hover:translate-x-0.5 transition-transform">
                  Detail <ChevronRight class="w-3.5 h-3.5" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
