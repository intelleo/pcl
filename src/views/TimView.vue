<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { Shield, User, Star, ChevronRight, Search, MapPin } from 'lucide-vue-next'

const router = useRouter()
const sedangMemuat = ref(false)
const daftarTim = ref([])
const cariKlub = ref('')
const filterGrup = ref('semua')

onMounted(async () => {
  sedangMemuat.value = true
  try {
    const { data } = await supabase.from('pcl_teams').select('*').order('name')
    daftarTim.value = data || []
  } catch (err) {
    daftarTim.value = []
  } finally {
    sedangMemuat.value = false
  }
})

const timTerfilter = computed(() => {
  return daftarTim.value.filter(t => {
    const matchNama = t.name.toLowerCase().includes(cariKlub.value.toLowerCase()) ||
                      (t.short_name && t.short_name.toLowerCase().includes(cariKlub.value.toLowerCase())) ||
                      (t.manager_name && t.manager_name.toLowerCase().includes(cariKlub.value.toLowerCase()))
    const matchGrup = filterGrup.value === 'semua' || t.group_name === filterGrup.value
    return matchNama && matchGrup
  })
})

function bukaDetailTim(tim) {
  router.push(`/tim/${tim.id}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Klub &amp; Skuad</span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
          Daftar klub kontestan
        </h1>
        <p class="text-sm sm:text-base text-ink-400 max-w-2xl mt-1 leading-relaxed">
          Klub peserta turnamen Peak Champions League 2026.
        </p>
      </div>

      <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-card self-start md:self-auto shrink-0">
        <Shield class="w-4 h-4 text-ucl-600" />
        <span class="text-xs font-semibold text-ink-600">{{ daftarTim.length }} Klub Peserta</span>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="cariKlub"
          type="text"
          placeholder="Cari klub, kode, atau pelatih..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500 transition-colors shadow-sm"
        />
      </div>

      <!-- Filter Grup Pills -->
      <div class="flex items-center gap-1 p-1 rounded-full bg-slate-100 overflow-x-auto scrollbar-none shrink-0">
        <button
          @click="filterGrup = 'semua'"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          :class="filterGrup === 'semua' ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
        >
          Semua
        </button>
        <button
          v-for="grup in ['Grup A', 'Grup B', 'Grup C', 'Grup D']"
          :key="grup"
          @click="filterGrup = grup"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          :class="filterGrup === grup ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
        >
          {{ grup }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="sedangMemuat" class="bg-white rounded-xl border border-slate-200 p-6 space-y-3 animate-pulse">
      <div v-for="n in 8" :key="n" class="h-12 bg-slate-100 rounded-lg"></div>
    </div>

    <!-- Table Container -->
    <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6 w-16 text-center">No</th>
              <th class="py-3 px-4 sm:px-6">Klub</th>
              <th class="py-3 px-4 sm:px-6 hidden md:table-cell">Grup</th>
              <th class="py-3 px-4 sm:px-6 hidden sm:table-cell">Pelatih</th>
              <th class="py-3 px-4 sm:px-6 hidden lg:table-cell">Stadion</th>
              <th class="py-3 px-4 sm:px-6 text-center w-24">Rating</th>
              <th class="py-3 px-4 sm:px-6 text-right w-20">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="timTerfilter.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-ink-400">
                Tidak ada klub yang sesuai pencarian "{{ cariKlub }}".
              </td>
            </tr>

            <tr
              v-for="(tim, index) in timTerfilter"
              :key="tim.id"
              @click="bukaDetailTim(tim)"
              class="hover:bg-ucl-50/50 cursor-pointer transition-colors group"
            >
              <!-- Nomor Urut -->
              <td class="py-3.5 px-4 sm:px-6 text-center font-medium text-xs text-slate-400 tabular-nums">
                {{ index + 1 }}
              </td>

              <!-- Klub & Short Name -->
              <td class="py-3.5 px-4 sm:px-6">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-ucl-500/40 flex items-center justify-center font-display font-semibold text-xs text-navy-800 shrink-0 transition-colors">
                    {{ tim.short_name || 'TIM' }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors truncate">
                      {{ tim.name }}
                    </div>
                    <div class="text-xs text-slate-400 md:hidden mt-0.5">
                      {{ tim.group_name || '-' }} · {{ tim.manager_name || 'Pelatih' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Grup -->
              <td class="py-3.5 px-4 sm:px-6 hidden md:table-cell">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  <Shield class="w-3 h-3 text-ucl-600" />
                  {{ tim.group_name || '-' }}
                </span>
              </td>

              <!-- Pelatih -->
              <td class="py-3.5 px-4 sm:px-6 hidden sm:table-cell text-xs text-slate-600">
                <div class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ tim.manager_name || '-' }}</span>
                </div>
              </td>

              <!-- Stadion -->
              <td class="py-3.5 px-4 sm:px-6 hidden lg:table-cell text-xs text-slate-500">
                <div class="flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate max-w-[180px]">{{ tim.stadium || '-' }}</span>
                </div>
              </td>

              <!-- Rating OVR -->
              <td class="py-3.5 px-4 sm:px-6 text-center">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-xs font-semibold text-ucl-600 tabular-nums">
                  <Star class="w-3 h-3 fill-ucl-100 text-ucl-500" />
                  {{ tim.rating || 90 }}
                </span>
              </td>

              <!-- Aksi Detail -->
              <td class="py-3.5 px-4 sm:px-6 text-right">
                <button
                  type="button"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 group-hover:text-ucl-600 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all"
                  aria-label="Lihat detail tim"
                >
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

