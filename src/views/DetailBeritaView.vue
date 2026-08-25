<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import {
  Calendar,
  User,
  ArrowLeft,
  Quote,
  Activity,
  Award,
  Share2,
  Check,
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-vue-next'
import ModalDetailPertandingan from '../components/turnamen/ModalDetailPertandingan.vue'
import TombolDasar from '../components/umum/TombolDasar.vue'

const route = useRoute()
const router = useRouter()

const sudahDisalin = ref(false)
const modalLagaTerbuka = ref(false)
const sedangMemuat = ref(false)
const artikel = ref(null)
const lagaTerkait = ref(null)
const eventLagaTerkait = ref([])
const beritaTerkaitList = ref([])

async function muatArtikel() {
  sedangMemuat.value = true

  try {
    const { data: newsData } = await supabase
      .from('pcl_news')
      .select('*')
      .eq('id', route.params.id)
      .single()

    artikel.value = newsData || null

    if (newsData?.terkait_match_id) {
      const [resMatch, resEvents] = await Promise.all([
        supabase
          .from('pcl_matches')
          .select(`
            *,
            home_team:pcl_teams!pcl_matches_home_team_id_fkey(*),
            away_team:pcl_teams!pcl_matches_away_team_id_fkey(*),
            group:pcl_tournament_groups(*)
          `)
          .eq('id', newsData.terkait_match_id)
          .single(),
        supabase
          .from('pcl_match_events')
          .select(`
            *,
            player:pcl_players!pcl_match_events_player_id_fkey(*),
            assist_player:pcl_players!pcl_match_events_assist_player_id_fkey(*),
            team:pcl_teams(*)
          `)
          .eq('match_id', newsData.terkait_match_id)
          .order('minute', { ascending: true })
      ])

      lagaTerkait.value = resMatch.data || null
      eventLagaTerkait.value = resEvents.data || []
    } else {
      lagaTerkait.value = null
      eventLagaTerkait.value = []
    }

    const { data: relatedNews } = await supabase
      .from('pcl_news')
      .select('*')
      .neq('id', route.params.id)
      .limit(3)

    beritaTerkaitList.value = relatedNews || []
  } catch (err) {
    artikel.value = null
    lagaTerkait.value = null
    eventLagaTerkait.value = []
    beritaTerkaitList.value = []
  } finally {
    sedangMemuat.value = false
  }
}

onMounted(muatArtikel)
watch(() => route.params.id, muatArtikel)

function salinTautan() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    sudahDisalin.value = true
    setTimeout(() => {
      sudahDisalin.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Back & Share -->
    <div class="anim-muncul flex items-center justify-between gap-3 pb-5 border-b border-slate-200">
      <button
        @click="router.push('/berita')"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-300 text-sm font-semibold text-ink-600 transition-colors hover:border-ucl-500 hover:text-ucl-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
      >
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Berita
      </button>

      <button
        @click="salinTautan"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-300 text-sm font-semibold text-ink-600 transition-colors hover:border-ucl-500 hover:text-ucl-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
      >
        <component :is="sudahDisalin ? Check : Share2" class="w-4 h-4" :class="sudahDisalin ? 'text-emerald-600' : ''" />
        {{ sudahDisalin ? 'Tersalin!' : 'Bagikan' }}
      </button>
    </div>

    <!-- Layout: 2 col article, 1 col sidebar -->
    <div v-if="sedangMemuat" class="h-96 rounded-xl bg-white border border-slate-200 animate-pulse"></div>

    <div v-else-if="!artikel" class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2">
      <p class="text-sm font-semibold text-ink-900">Artikel tidak ditemukan.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Article Body -->
      <article class="anim-muncul lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[11px] font-semibold">
              {{ artikel.tag }}
            </span>
            <span aria-hidden="true">·</span>
            <span class="flex items-center gap-1 font-mono">
              <Calendar class="w-3.5 h-3.5" /> {{ artikel.tanggal }}
            </span>
            <span aria-hidden="true">·</span>
            <span class="flex items-center gap-1">
              <Clock class="w-3.5 h-3.5" /> 3 mnt baca
            </span>
          </div>

          <h1 class="font-display text-xl sm:text-3xl font-semibold tracking-tight text-ink-900 leading-tight">
            {{ artikel.judul }}
          </h1>

          <div class="flex items-center gap-2 text-sm text-ink-400 pb-3 border-b border-slate-100">
            <User class="w-3.5 h-3.5" />
            <span>Ditulis oleh: <strong class="text-ink-900">{{ artikel.penulis }}</strong></span>
          </div>

          <p class="text-sm sm:text-base text-ink-900 font-medium bg-ucl-50 border-l-2 border-ucl-500 p-3.5 rounded-r-lg leading-relaxed">
            {{ artikel.ringkasan }}
          </p>
        </div>

        <!-- Paragraphs -->
        <div class="space-y-4 text-sm sm:text-base text-ink-600 leading-relaxed">
          <p v-for="(paragraf, pIdx) in (Array.isArray(artikel.isi) ? artikel.isi : [artikel.isi])" :key="pIdx">
            {{ paragraf }}
          </p>
        </div>

        <!-- Blockquote -->
        <div v-if="artikel.kutipan" class="relative p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <Quote class="w-6 h-6 text-ucl-500/30 absolute right-3 top-3" />
          <p class="text-sm italic text-ink-900 leading-relaxed">
            "{{ artikel.kutipan }}"
          </p>
          <div class="text-xs font-semibold text-ucl-600">
            — {{ artikel.narasumber }}
          </div>
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="space-y-4">
        <!-- Related Match Card -->
        <div
          v-if="lagaTerkait"
          class="rounded-xl bg-white border border-slate-200 shadow-card p-5 space-y-3 hover:shadow-lift transition-shadow"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Laga Terkait
            </span>
            <span class="font-mono text-[11px] font-semibold text-ucl-600">MD {{ lagaTerkait.matchday }}</span>
          </div>

          <div class="flex items-center justify-between py-1">
            <div class="text-center min-w-0">
              <div class="w-10 h-10 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-navy-800 text-xs">
                {{ lagaTerkait.home_team?.short_name || 'H' }}
              </div>
              <div class="text-[11px] font-medium text-ink-600 mt-1 truncate max-w-[70px]">
                {{ lagaTerkait.home_team?.name || 'Home' }}
              </div>
            </div>

            <div class="font-display text-lg font-semibold text-navy-800 tabular-nums px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
              {{ lagaTerkait.home_score ?? 0 }} – {{ lagaTerkait.away_score ?? 0 }}
            </div>

            <div class="text-center min-w-0">
              <div class="w-10 h-10 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-navy-800 text-xs">
                {{ lagaTerkait.away_team?.short_name || 'A' }}
              </div>
              <div class="text-[11px] font-medium text-ink-600 mt-1 truncate max-w-[70px]">
                {{ lagaTerkait.away_team?.name || 'Away' }}
              </div>
            </div>
          </div>

          <div v-if="lagaTerkait.mvp" class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-1.5">
            <Award class="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span class="text-ink-600">MVP: <strong class="text-ink-900">{{ lagaTerkait.mvp.name }}</strong></span>
          </div>

          <button
            @click="modalLagaTerbuka = true"
            class="w-full inline-flex items-center justify-center px-3 py-2 rounded-full bg-ucl-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500 focus-visible:ring-offset-2"
          >
            <Activity class="w-4 h-4 mr-1.5" />
            Lihat Detail Laga
          </button>
        </div>

        <!-- Related News -->
        <div v-if="beritaTerkaitList.length > 0" class="rounded-xl bg-white border border-slate-200 shadow-card p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen class="w-3.5 h-3.5 text-ucl-600" />
              Berita Terkait
            </h3>
            <button
              @click="router.push('/berita')"
              class="text-xs font-semibold text-ucl-600 hover:text-blue-700 transition-colors cursor-pointer focus:outline-none focus-visible:text-blue-700"
            >
              Semua
            </button>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="b in beritaTerkaitList"
              :key="b.id"
              @click="router.push(`/berita/${b.id}`)"
              class="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-ucl-500/50 hover:bg-ucl-50/40 transition-colors cursor-pointer group space-y-1"
            >
              <div class="flex items-center justify-between text-[10px] text-slate-400">
                <span class="font-semibold uppercase tracking-wide">{{ b.tag }}</span>
                <span class="font-mono">{{ b.tanggal }}</span>
              </div>
              <h4 class="text-xs font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors line-clamp-2 leading-snug">
                {{ b.judul }}
              </h4>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Modal -->
    <ModalDetailPertandingan
      v-if="lagaTerkait"
      :terbuka="modalLagaTerbuka"
      :laga="lagaTerkait"
      :events="eventLagaTerkait"
      @tutup="modalLagaTerbuka = false"
    />
  </div>
</template>
