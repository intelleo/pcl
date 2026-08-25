<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { ArrowLeft, User, Shield, Star, MapPin } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const sedangMemuat = ref(false)
const timData = ref(null)
const skuadPemain = ref([])
const filterPosisi = ref('semua')

onMounted(async () => {
  sedangMemuat.value = true

  try {
    const { data: team } = await supabase
      .from('pcl_teams')
      .select('*')
      .eq('id', route.params.id)
      .single()

    timData.value = team || null

    const { data: players } = await supabase
      .from('pcl_players')
      .select('*')
      .eq('team_id', route.params.id)
      .order('squad_number')

    skuadPemain.value = players || []
  } catch (err) {
    timData.value = null
    skuadPemain.value = []
  } finally {
    sedangMemuat.value = false
  }
})

const skuadTerfilter = computed(() => {
  if (filterPosisi.value === 'semua') return skuadPemain.value
  return skuadPemain.value.filter(p => p.position === filterPosisi.value)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Back Button -->
    <div class="anim-muncul pb-5 border-b border-slate-200">
      <button
        @click="router.push('/tim')"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-300 text-sm font-semibold text-ink-600 transition-colors hover:border-ucl-500 hover:text-ucl-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
      >
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Klub
      </button>
    </div>

    <!-- Team Hero Card -->
    <div v-if="timData" class="anim-muncul relative overflow-hidden rounded-xl bg-white border border-slate-200 shadow-card p-6 sm:p-8" style="animation-delay: 60ms">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="flex items-center gap-4 sm:gap-5 min-w-0">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-xl sm:text-2xl text-navy-800 shrink-0">
            {{ timData.short_name }}
          </div>

          <div class="space-y-1.5 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[11px] font-semibold">
                {{ timData.group_name || 'Grup A' }}
              </span>
              <span class="text-xs text-slate-500 flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5" />
                {{ timData.stadium || 'Flash Stadium' }}
              </span>
            </div>

            <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 leading-tight">
              {{ timData.name }}
            </h1>

            <div class="flex items-center gap-1.5 text-sm text-ink-400">
              <User class="w-3.5 h-3.5" />
              <span>Manajer: <strong class="text-ink-900">{{ timData.manager_name || 'Pelatih Kepala' }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Rating OVR Card -->
        <div class="flex sm:flex-col items-center justify-between sm:justify-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 sm:min-w-[120px] text-center shrink-0">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Team OVR</span>
          <div class="flex items-center gap-1 font-display font-semibold text-2xl text-navy-800 tabular-nums">
            <Star class="w-4 h-4 text-gold-500 fill-gold-400" />
            {{ timData.rating || 92 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="sedangMemuat" class="h-72 rounded-xl bg-white border border-slate-200 animate-pulse"></div>

    <!-- Squad Composition -->
    <div v-else class="rounded-xl bg-white border border-slate-200 shadow-card p-5 sm:p-6 space-y-5" style="animation-delay: 120ms">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <Shield class="w-4 h-4 text-ucl-600" />
          Komposisi skuad resmi
        </h3>

        <!-- Posisi Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-full bg-slate-100 w-fit max-w-full overflow-x-auto scrollbar-none self-start sm:self-auto">
          <button
            v-for="pos in ['semua', 'GK', 'DF', 'MF', 'FW']"
            :key="pos"
            @click="filterPosisi = pos"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
            :class="filterPosisi === pos ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-900'"
          >
            {{ pos }}
          </button>
        </div>
      </div>

      <!-- Player Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="pemain in skuadTerfilter"
          :key="pemain.id"
          class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-ucl-500/40 hover:shadow-card transition-all group space-y-2.5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-mono text-[11px] font-semibold text-navy-800 tabular-nums shrink-0">
                #{{ pemain.squad_number }}
              </span>
              <div class="min-w-0">
                <div class="font-semibold text-xs text-ink-900 group-hover:text-ucl-600 transition-colors truncate">
                  {{ pemain.name }}
                </div>
                <div class="font-mono text-[10px] text-slate-400 tabular-nums">
                  OVR {{ pemain.overall || 88 }}
                </div>
              </div>
            </div>

            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide shrink-0"
              :class="{
                'bg-amber-50 text-amber-600 border-amber-200': pemain.position === 'GK',
                'bg-ucl-50 text-ucl-600 border-ucl-100': pemain.position === 'DF',
                'bg-emerald-50 text-emerald-700 border-emerald-200': pemain.position === 'MF',
                'bg-red-50 text-red-600 border-red-200': pemain.position === 'FW'
              }"
            >
              {{ pemain.position }}
            </span>
          </div>

          <!-- Player Stats -->
          <div v-if="pemain.stats" class="grid grid-cols-4 gap-1 pt-2 border-t border-slate-200 text-center">
            <div class="p-1 rounded-md bg-white border border-slate-200">
              <div class="text-[9px] text-slate-400 uppercase tracking-wide">Gol</div>
              <div class="text-sm font-semibold text-ink-900 tabular-nums">{{ pemain.stats.goal || 0 }}</div>
            </div>
            <div class="p-1 rounded-md bg-white border border-slate-200">
              <div class="text-[9px] text-slate-400 uppercase tracking-wide">Ast</div>
              <div class="text-sm font-semibold text-ink-900 tabular-nums">{{ pemain.stats.assist || 0 }}</div>
            </div>
            <div class="p-1 rounded-md bg-white border border-slate-200">
              <div class="text-[9px] text-slate-400 uppercase tracking-wide">Pass</div>
              <div class="text-sm font-semibold text-ink-900 tabular-nums">{{ pemain.stats.pass || 0 }}</div>
            </div>
            <div class="p-1 rounded-md bg-white border border-slate-200">
              <div class="text-[9px] text-slate-400 uppercase tracking-wide">Def</div>
              <div class="text-sm font-semibold text-ink-900 tabular-nums">{{ pemain.stats.def || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
