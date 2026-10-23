<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'
import { ArrowLeft, User, Shield, MessageCircle } from 'lucide-vue-next'
import TabelSkuadTim from '../components/turnamen/TabelSkuadTim.vue'

const route = useRoute()
const router = useRouter()
const sedangMemuat = ref(false)
const timData = ref(null)
const skuadPemain = ref([])
const filterPosisi = ref('semua')

onMounted(async () => {
  const teamId = route.params.id
  if (!teamId || teamId === 'undefined') {
    return
  }

  const cacheKey = `team_detail_${teamId}`
  const cached = getCache(cacheKey)
  if (cached) {
    timData.value = cached.team
    skuadPemain.value = cached.players
    return
  }

  sedangMemuat.value = true

  try {
    const detail = await api.getTeamDetail(teamId)
    timData.value = detail.team || (detail.id ? detail : null)
    skuadPemain.value = detail.players || []
    setCache(cacheKey, { team: timData.value, players: skuadPemain.value }, 45000)
  } catch (err) {
    timData.value = null
    skuadPemain.value = []
  } finally {
    sedangMemuat.value = false
  }
})

const skuadTerfilter = computed(() => {
  if (filterPosisi.value === 'semua') return skuadPemain.value
  return skuadPemain.value.filter((p) => p.position === filterPosisi.value)
})

const opsiFilterPosisi = computed(() => {
  const ada = new Set(skuadPemain.value.map((p) => p.position).filter(Boolean))
  const standar = ['GK', 'DF', 'CB', 'MF', 'CM', 'WF', 'FW', 'ST']
  const gabungan = standar.filter((p) => ada.has(p))
  return ['semua', ...(gabungan.length ? gabungan : standar)]
})
</script>

<template>
  <div
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8"
  >
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
    <div
      v-if="timData"
      class="anim-muncul relative overflow-hidden rounded-xl bg-white border border-slate-200 shadow-card p-6 sm:p-8"
      style="animation-delay: 60ms"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="flex items-center gap-4 sm:gap-5 min-w-0">
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-xl sm:text-2xl text-navy-800 shrink-0 overflow-hidden p-1"
          >
            <img
              v-if="timData.logo_url"
              :src="timData.logo_url"
              :alt="timData.name"
              class="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
            />
            <span v-else>{{ timData.short_name }}</span>
          </div>

          <div class="space-y-1.5 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                :class="
                  timData.group_name
                    ? 'bg-ucl-50 border border-ucl-100 text-ucl-600'
                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                "
              >
                {{ timData.group_name || 'Belum Ada Grup' }}
              </span>
            </div>

            <h1
              class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 leading-tight"
            >
              {{ timData.name }}
            </h1>

            <div
              class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-400"
            >
              <div class="flex items-center gap-1.5">
                <User class="w-3.5 h-3.5" />
                <span
                  >Manager / Kapten:
                  <strong class="text-ink-900">{{
                    timData.manager_name || '-'
                  }}</strong></span
                >
              </div>
              <div v-if="timData.contact" class="flex items-center gap-1.5">
                <MessageCircle class="w-3.5 h-3.5 text-emerald-600" />
                <span
                  >Kontak:
                  <a
                    :href="`https://wa.me/${String(timData.contact).replace(/\\D/g, '').replace(/^0/, '62')}`"
                    target="_blank"
                    class="font-mono text-emerald-700 font-semibold hover:underline"
                    title="Hubungi via WhatsApp"
                  >
                    {{ timData.contact }}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="sedangMemuat"
      class="h-72 rounded-xl bg-white border border-slate-200 animate-pulse"
    ></div>

    <!-- Squad Composition -->
    <div
      v-else
      class="rounded-xl bg-white border border-slate-200 shadow-card p-5 sm:p-6 space-y-4"
      style="animation-delay: 120ms"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100"
      >
        <div class="flex items-center gap-2.5">
          <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
            <Shield class="w-4 h-4 text-ucl-600" />
            Komposisi Skuad Resmi
          </h3>
          <span
            class="px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 font-bold text-xs font-mono"
          >
            Total: {{ skuadTerfilter.length }} Pemain
          </span>
        </div>

        <!-- Posisi Tabs -->
        <div
          class="flex items-center gap-1 p-1 rounded-full bg-slate-100 w-fit max-w-full overflow-x-auto scrollbar-none self-start sm:self-auto"
        >
          <button
            v-for="pos in opsiFilterPosisi"
            :key="pos"
            @click="filterPosisi = pos"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
            :class="
              filterPosisi === pos
                ? 'bg-white text-ink-900 shadow-card'
                : 'text-slate-500 hover:text-ink-900'
            "
          >
            {{ pos === 'semua' ? 'Semua Posisi' : pos }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="skuadTerfilter.length === 0"
        class="text-center py-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs"
      >
        Belum ada pemain terdaftar di posisi ini.
      </div>

      <!-- Ordered Player Table Component -->
      <TabelSkuadTim v-else :daftarPemain="skuadTerfilter" />
    </div>
  </div>
</template>
