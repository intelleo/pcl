<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'
import {
  Crown,
  Flame,
  Award,
  Calendar,
  Search,
  ChevronRight
} from 'lucide-vue-next'
import pialaPcl from '@/assets/img/piala-pcl.webp'

const router = useRouter()
const cariTeks = ref('')
const tabTampilan = ref('musim')
const sedangMemuat = ref(false)

const daftarRiwayat = ref([])

async function ambilRiwayatJuara(forceFresh = false) {
  if (!forceFresh) {
    const cached = getCache('history_champions')
    if (cached) {
      daftarRiwayat.value = cached
      return
    }
  }

  sedangMemuat.value = true

  try {
    const data = await api.getChampions()

    if (data && data.length > 0) {
      daftarRiwayat.value = data.map(d => ({
        id: d.id,
        musim: d.musim,
        label_musim: d.label_musim,
        skor_final: d.skor_final,
        juara: d.juara || { name: 'Klub Juara', short_name: 'JUR', logo_url: null },
        runner_up: d.runner_up || { name: 'Runner-up', short_name: 'RUN', logo_url: null },
        top_scorer: {
          nama: d.top_scorer?.nama || d.top_scorer_nama || '-',
          klub: d.top_scorer?.klub || d.juara?.short_name || 'PCL',
          total: Number(d.top_scorer?.total ?? d.top_scorer_total ?? 0)
        },
        mvp_turnamen: {
          nama: d.mvp_turnamen?.nama || d.mvp_nama || '-',
          klub: d.mvp_turnamen?.klub || d.juara?.short_name || 'PCL',
          rating: Number(d.mvp_turnamen?.rating ?? d.mvp_rating ?? 9.0)
        }
      }))
      setCache('history_champions', daftarRiwayat.value, 60000)
    } else {
      daftarRiwayat.value = []
    }
  } catch (err) {
    daftarRiwayat.value = []
  } finally {
    sedangMemuat.value = false
  }
}

onMounted(() => {
  ambilRiwayatJuara()
})

const rekapTrofiKlub = computed(() => {
  const mapTrofi = {}
  daftarRiwayat.value.forEach(item => {
    const j = item.juara
    if (!mapTrofi[j.name]) {
      mapTrofi[j.name] = { id: j.id, name: j.name, short_name: j.short_name, logo_url: j.logo_url, manager_name: j.manager_name, total_juara: 0, total_runner_up: 0, musim_juara: [] }
    }
    mapTrofi[j.name].total_juara += 1
    mapTrofi[j.name].musim_juara.push(item.musim)

    const r = item.runner_up
    if (!mapTrofi[r.name]) {
      mapTrofi[r.name] = { id: r.id, name: r.name, short_name: r.short_name, logo_url: r.logo_url, manager_name: r.manager_name, total_juara: 0, total_runner_up: 0, musim_juara: [] }
    }
    mapTrofi[r.name].total_runner_up += 1
  })
  return Object.values(mapTrofi).sort((a, b) => b.total_juara !== a.total_juara ? b.total_juara - a.total_juara : b.total_runner_up - a.total_runner_up)
})

const riwayatTerfilter = computed(() => {
  if (!cariTeks.value.trim()) return daftarRiwayat.value
  const q = cariTeks.value.toLowerCase()
  return daftarRiwayat.value.filter(r => (
    r.musim.toLowerCase().includes(q) ||
    r.label_musim.toLowerCase().includes(q) ||
    r.juara.name.toLowerCase().includes(q) ||
    r.juara.short_name.toLowerCase().includes(q) ||
    r.runner_up.name.toLowerCase().includes(q) ||
    r.top_scorer.nama.toLowerCase().includes(q) ||
    r.mvp_turnamen.nama.toLowerCase().includes(q)
  ))
})

const klubTerfilter = computed(() => {
  if (!cariTeks.value.trim()) return rekapTrofiKlub.value
  const q = cariTeks.value.toLowerCase()
  return rekapTrofiKlub.value.filter(k => (
    k.name.toLowerCase().includes(q) || k.short_name.toLowerCase().includes(q)
  ))
})

function bukaDetailTim(timId) {
  if (timId) router.push(`/tim/${timId}`)
  else router.push('/tim')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header Hero Banner -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
      <div class="flex items-start sm:items-center gap-3.5 sm:gap-5">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gold-50/80 border border-gold-200/60 flex items-center justify-center shrink-0 p-2 shadow-sm">
          <img :src="pialaPcl" alt="Trofi PCL" class="w-full h-full object-contain" />
        </div>
        <div>
          <div class="flex items-center gap-2 text-xs text-gold-600 font-semibold uppercase tracking-wider">
            <span>Hall of Fame</span>
            <span class="text-slate-300">·</span>
            <span class="text-slate-400 font-normal">Arsip Juara</span>
          </div>
          <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-0.5">
            Riwayat Juara
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Daftar peraih trofi dan catatan grand final setiap musim PCL.
          </p>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 self-start md:self-center bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
        <span><strong class="text-ink-900 font-semibold">{{ daftarRiwayat.length }}</strong> Musim</span>
        <span class="text-slate-300">·</span>
        <span><strong class="text-gold-700 font-semibold">{{ rekapTrofiKlub.filter(k => k.total_juara > 0).length }}</strong> Klub Juara</span>
      </div>
    </div>

    <!-- Filter & Segmented Tabs -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Tab Switcher -->
      <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 w-full sm:w-auto shrink-0 order-2 sm:order-1">
        <button
          @click="tabTampilan = 'musim'"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="tabTampilan === 'musim' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          <Calendar class="w-3.5 h-3.5" :class="tabTampilan === 'musim' ? 'text-ucl-600' : 'text-slate-400'" />
          <span>Daftar Musim</span>
        </button>
        <button
          @click="tabTampilan = 'klub'"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="tabTampilan === 'klub' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          <Crown class="w-3.5 h-3.5" :class="tabTampilan === 'klub' ? 'text-gold-600' : 'text-slate-400'" />
          <span>Koleksi Trofi</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative w-full sm:w-72 order-1 sm:order-2">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="cariTeks"
          type="text"
          :placeholder="tabTampilan === 'musim' ? 'Cari musim, juara, atau pemain...' : 'Cari nama klub...'"
          class="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500 transition-colors"
        />
      </div>
    </div>

    <!-- ===== TAB 1: RIWAYAT MUSIM ===== -->
    <div v-if="tabTampilan === 'musim'">
      <!-- Empty state -->
      <div v-if="riwayatTerfilter.length === 0" class="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
        Tidak ada data musim yang sesuai pencarian "{{ cariTeks }}".
      </div>

      <!-- Mobile View (Stacked Cards) -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="item in riwayatTerfilter"
          :key="item.id"
          class="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm"
        >
          <!-- Season Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span class="text-base font-bold text-ink-900">{{ item.musim }}</span>
              <span class="text-xs text-slate-400 ml-1.5">· {{ item.label_musim.split('(')[1]?.replace(')', '') || 'PCL' }}</span>
            </div>
            <span class="text-sm font-bold text-ucl-600 tracking-tight">{{ item.skor_final }}</span>
          </div>

          <!-- Juara (Champion) -->
          <div
            @click="bukaDetailTim(item.juara.id)"
            class="flex items-center justify-between p-2.5 rounded-lg bg-gold-50/40 cursor-pointer hover:bg-gold-50 transition-colors"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <img v-if="item.juara.logo_url" :src="item.juara.logo_url" :alt="item.juara.name" class="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" />
              <div v-else class="w-8 h-8 rounded-lg bg-gold-50 border border-gold-200/80 font-bold text-[10px] text-gold-800 flex items-center justify-center shrink-0 tracking-wider">
                {{ item.juara.short_name }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-ink-900 truncate">{{ item.juara.name }}</span>
                  <Crown class="w-3.5 h-3.5 text-gold-600 shrink-0" />
                </div>
                <span class="text-[11px] text-slate-400">{{ item.juara.manager_name }}</span>
              </div>
            </div>
            <span class="text-[10px] font-semibold uppercase text-gold-700 bg-gold-100/80 px-2 py-0.5 rounded shrink-0">Juara</span>
          </div>

          <!-- Runner-up -->
          <div
            @click="bukaDetailTim(item.runner_up.id)"
            class="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <img v-if="item.runner_up.logo_url" :src="item.runner_up.logo_url" :alt="item.runner_up.name" class="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" />
              <div v-else class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-[10px] text-navy-800 flex items-center justify-center shrink-0 tracking-wider">
                {{ item.runner_up.short_name }}
              </div>
              <div class="min-w-0">
                <span class="text-xs font-medium text-slate-700 truncate block">{{ item.runner_up.name }}</span>
                <span class="text-[11px] text-slate-400">{{ item.runner_up.manager_name }}</span>
              </div>
            </div>
            <span class="text-[10px] text-slate-400 font-medium shrink-0">Runner-up</span>
          </div>

          <!-- Individual Awards Grid -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div class="flex items-center gap-2">
              <Flame class="w-3.5 h-3.5 text-red-500 shrink-0" />
              <div class="min-w-0">
                <span class="text-slate-400 text-[10px] block">Top Scorer</span>
                <span class="font-medium text-ink-900 truncate block text-[11px]">{{ item.top_scorer.nama }}</span>
                <span class="text-[10px] text-red-600 font-semibold">{{ item.top_scorer.total }} Gol</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Award class="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <div class="min-w-0">
                <span class="text-slate-400 text-[10px] block">Pemain Terbaik</span>
                <span class="font-medium text-ink-900 truncate block text-[11px]">{{ item.mvp_turnamen.nama }}</span>
                <span class="text-[10px] text-gold-700 font-semibold">{{ item.mvp_turnamen.rating }} Rtg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop View (Clean Minimal Table) -->
      <div class="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-5 w-24">Musim</th>
              <th class="py-3.5 px-5">Juara</th>
              <th class="py-3.5 px-4 text-center w-24">Skor</th>
              <th class="py-3.5 px-5">Runner-up</th>
              <th class="py-3.5 px-5 hidden lg:table-cell">Top Scorer</th>
              <th class="py-3.5 px-5 hidden xl:table-cell">MVP</th>
              <th class="py-3.5 px-4 text-right w-16"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr
              v-for="item in riwayatTerfilter"
              :key="item.id"
              class="hover:bg-slate-50/60 transition-colors group"
            >
              <!-- Musim (Polos tanpa border) -->
              <td class="py-4 px-5 align-middle whitespace-nowrap">
                <span class="font-bold text-ink-900 text-sm block">{{ item.musim }}</span>
                <span class="text-[11px] text-slate-400">{{ item.label_musim.split('(')[1]?.replace(')', '') || 'PCL' }}</span>
              </td>

              <!-- Juara (Polos bersih) -->
              <td class="py-4 px-5 align-middle">
                <div
                  @click="bukaDetailTim(item.juara.id)"
                  class="flex items-center gap-3 cursor-pointer group/team"
                >
                  <img v-if="item.juara.logo_url" :src="item.juara.logo_url" :alt="item.juara.name" class="w-9 h-9 rounded-lg object-contain bg-white shrink-0" />
                  <div v-else class="w-9 h-9 rounded-lg bg-gold-50 font-bold text-xs text-gold-800 flex items-center justify-center shrink-0">
                    {{ item.juara.short_name }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-semibold text-ink-900 group-hover/team:text-ucl-600 transition-colors truncate">
                        {{ item.juara.name }}
                      </span>
                      <Crown class="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    </div>
                    <span class="text-xs text-slate-400 block truncate">{{ item.juara.manager_name }}</span>
                  </div>
                </div>
              </td>

              <!-- Skor Final (Polos tanpa kotak) -->
              <td class="py-4 px-4 align-middle text-center whitespace-nowrap">
                <span class="font-bold text-sm text-ink-900 tracking-tight">{{ item.skor_final }}</span>
              </td>

              <!-- Runner-up (Polos bersih) -->
              <td class="py-4 px-5 align-middle">
                <div
                  @click="bukaDetailTim(item.runner_up.id)"
                  class="flex items-center gap-3 cursor-pointer group/runner"
                >
                  <img v-if="item.runner_up.logo_url" :src="item.runner_up.logo_url" :alt="item.runner_up.name" class="w-8 h-8 rounded-lg object-contain bg-white shrink-0" />
                  <div v-else class="w-8 h-8 rounded-lg bg-slate-100 font-semibold text-xs text-slate-600 flex items-center justify-center shrink-0">
                    {{ item.runner_up.short_name }}
                  </div>
                  <div class="min-w-0">
                    <span class="font-medium text-slate-700 group-hover/runner:text-ucl-600 transition-colors truncate block">
                      {{ item.runner_up.name }}
                    </span>
                    <span class="text-xs text-slate-400 block truncate">{{ item.runner_up.manager_name }}</span>
                  </div>
                </div>
              </td>

              <!-- Top Scorer -->
              <td class="py-4 px-5 align-middle hidden lg:table-cell">
                <div class="flex items-center gap-2 min-w-0">
                  <Flame class="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <div class="min-w-0">
                    <span class="font-medium text-xs text-ink-900 truncate block">{{ item.top_scorer.nama }}</span>
                    <span class="text-[11px] text-slate-400">{{ item.top_scorer.klub }} · <strong class="text-red-600 font-semibold">{{ item.top_scorer.total }} Gol</strong></span>
                  </div>
                </div>
              </td>

              <!-- MVP -->
              <td class="py-4 px-5 align-middle hidden xl:table-cell">
                <div class="flex items-center gap-2 min-w-0">
                  <Award class="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <div class="min-w-0">
                    <span class="font-medium text-xs text-ink-900 truncate block">{{ item.mvp_turnamen.nama }}</span>
                    <span class="text-[11px] text-slate-400">{{ item.mvp_turnamen.klub }} · <strong class="text-gold-700 font-semibold">{{ item.mvp_turnamen.rating }} Rtg</strong></span>
                  </div>
                </div>
              </td>

              <!-- Action -->
              <td class="py-4 px-4 align-middle text-right">
                <button
                  type="button"
                  @click="bukaDetailTim(item.juara.id)"
                  class="p-1 rounded text-slate-400 hover:text-ucl-600 cursor-pointer"
                  title="Lihat Tim"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== TAB 2: KOLEKSI TROFI KLUB ===== -->
    <div v-else>
      <div v-if="klubTerfilter.length === 0" class="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
        Tidak ada klub yang sesuai pencarian "{{ cariTeks }}".
      </div>

      <!-- Mobile View (Klub) -->
      <div class="sm:hidden space-y-2.5">
        <div
          v-for="(klub, idx) in klubTerfilter"
          :key="klub.name"
          @click="bukaDetailTim(klub.id)"
          class="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-xs font-bold text-slate-400 w-4 text-center">{{ idx + 1 }}</span>
            <img v-if="klub.logo_url" :src="klub.logo_url" :alt="klub.name" class="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" />
            <div v-else class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 font-bold text-[10px] text-navy-800 flex items-center justify-center shrink-0 tracking-wider">
              {{ klub.short_name }}
            </div>
            <div class="min-w-0">
              <span class="text-xs font-bold text-ink-900 block truncate">{{ klub.name }}</span>
              <span class="text-[11px] text-slate-400">{{ klub.musim_juara.join(', ') || 'Belum juara' }}</span>
            </div>
          </div>

          <div class="text-right shrink-0 ml-3">
            <span class="text-xs font-bold text-gold-700 block">{{ klub.total_juara }} Trofi</span>
            <span class="text-[10px] text-slate-400">{{ klub.total_runner_up }}x Runner-up</span>
          </div>
        </div>
      </div>

      <!-- Desktop View (Klub) -->
      <div class="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-5 w-16 text-center">Rank</th>
              <th class="py-3.5 px-5">Klub</th>
              <th class="py-3.5 px-5 text-center w-28">Juara</th>
              <th class="py-3.5 px-5 text-center w-28">Runner-up</th>
              <th class="py-3.5 px-5">Tahun Juara</th>
              <th class="py-3.5 px-4 text-right w-16"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr
              v-for="(klub, idx) in klubTerfilter"
              :key="klub.name"
              @click="bukaDetailTim(klub.id)"
              class="hover:bg-slate-50/60 cursor-pointer transition-colors group"
            >
              <td class="py-3.5 px-5 text-center align-middle font-bold text-slate-400 text-xs">
                {{ idx + 1 }}
              </td>
              <td class="py-3.5 px-5 align-middle">
                <div class="flex items-center gap-3">
                  <img v-if="klub.logo_url" :src="klub.logo_url" :alt="klub.name" class="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" />
                  <div v-else class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 font-bold text-[10px] text-navy-800 flex items-center justify-center shrink-0 tracking-wider">
                    {{ klub.short_name }}
                  </div>
                  <span class="font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors truncate">
                    {{ klub.name }}
                  </span>
                </div>
              </td>
              <td class="py-3.5 px-5 text-center align-middle">
                <span class="font-bold text-sm" :class="klub.total_juara > 0 ? 'text-gold-700' : 'text-slate-300'">
                  {{ klub.total_juara }}
                </span>
              </td>
              <td class="py-3.5 px-5 text-center align-middle text-slate-500 font-medium text-xs">
                {{ klub.total_runner_up }}
              </td>
              <td class="py-3.5 px-5 align-middle text-xs text-slate-500">
                <span v-if="klub.musim_juara.length > 0" class="font-medium text-slate-700">
                  {{ klub.musim_juara.join(', ') }}
                </span>
                <span v-else class="text-slate-300 italic">Belum pernah</span>
              </td>
              <td class="py-3.5 px-4 text-right align-middle">
                <ChevronRight class="w-4 h-4 text-slate-400 group-hover:text-ucl-600 group-hover:translate-x-0.5 transition-all inline" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
