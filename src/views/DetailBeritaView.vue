<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'
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
  ArrowRight,
  MessageCircle
} from 'lucide-vue-next'
import ModalDetailPertandingan from '../components/turnamen/ModalDetailPertandingan.vue'
import TombolDasar from '../components/umum/TombolDasar.vue'
import { perbaruiMetaHalaman } from '../lib/meta.js'

const route = useRoute()
const router = useRouter()

const sudahDisalin = ref(false)
const modalLagaTerbuka = ref(false)
const sedangMemuat = ref(false)
const artikel = ref(null)
const lagaTerkait = ref(null)
const eventLagaTerkait = ref([])
const beritaTerkaitList = ref([])

function formatTanggalIndo(isoStr) {
  if (!isoStr) return '-'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch (e) {
    return '-'
  }
}

// Helper untuk mengekstrak paragraf teks dari data konten/isi Supabase
const daftarParagraf = computed(() => {
  if (!artikel.value) return []
  const teks = artikel.value.konten || artikel.value.isi || ''

  if (Array.isArray(teks)) return teks.filter(p => typeof p === 'string' && p.trim())
  if (typeof teks === 'string' && teks.trim()) {
    return teks
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(Boolean)
  }
  return []
})

async function muatArtikel() {
  const cacheKey = `news_detail_${route.params.id}`
  const cached = getCache(cacheKey)
  if (cached) {
    artikel.value = cached.artikel
    lagaTerkait.value = cached.lagaTerkait
    eventLagaTerkait.value = cached.eventLagaTerkait
    beritaTerkaitList.value = cached.beritaTerkaitList
    return
  }

  sedangMemuat.value = true

  try {
    const newsData = await api.getNewsDetail(route.params.id)
    artikel.value = newsData || null

    if (newsData?.terkait_match_id) {
      try {
        const detailMatch = await api.getMatchDetail(newsData.terkait_match_id)
        lagaTerkait.value = detailMatch.match || null
        eventLagaTerkait.value = detailMatch.events || []
      } catch (errMatch) {
        lagaTerkait.value = null
        eventLagaTerkait.value = []
      }
    } else {
      lagaTerkait.value = null
      eventLagaTerkait.value = []
    }

    const allNews = await api.getNews()
    beritaTerkaitList.value = (allNews || []).filter(n => n.id !== route.params.id).slice(0, 3)

    setCache(cacheKey, {
      artikel: artikel.value,
      lagaTerkait: lagaTerkait.value,
      eventLagaTerkait: eventLagaTerkait.value,
      beritaTerkaitList: beritaTerkaitList.value
    }, 60000)

    // Perbarui Open Graph Meta Tags & Title
    if (artikel.value) {
      perbaruiMetaHalaman({
        judul: artikel.value.judul,
        deskripsi: artikel.value.ringkasan || artikel.value.judul,
        gambar: artikel.value.gambar_url || '',
        tipe: 'article'
      })
    }
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

function bagikanKeWhatsApp() {
  if (!artikel.value) return
  const urlSekarang = window.location.href
  const teks = `*${artikel.value.judul}*\n\n${artikel.value.ringkasan || ''}\n\nBaca selengkapnya di Peak Champions League:\n${urlSekarang}`
  window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank')
}

async function handleBagikan() {
  if (!artikel.value) return
  if (navigator.share) {
    try {
      await navigator.share({
        title: artikel.value.judul,
        text: artikel.value.ringkasan || artikel.value.judul,
        url: window.location.href
      })
      return
    } catch {
      // User batal atau fallback
    }
  }
  salinTautan()
}

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
      <TombolDasar
        varian="sekunder"
        @click="router.push('/berita')"
      >
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        Kembali ke Berita
      </TombolDasar>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="bagikanKeWhatsApp"
          class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <MessageCircle class="w-4 h-4" />
          <span class="hidden sm:inline">Kirim ke</span> WhatsApp
        </button>

        <TombolDasar
          varian="sekunder"
          @click="handleBagikan"
        >
          <component :is="sudahDisalin ? Check : Share2" class="w-4 h-4 mr-1.5" :class="sudahDisalin ? 'text-emerald-600' : ''" />
          {{ sudahDisalin ? 'Tersalin!' : 'Bagikan' }}
        </TombolDasar>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="sedangMemuat" class="h-96 rounded-xl bg-white border border-slate-200 animate-pulse"></div>

    <div v-else-if="!artikel" class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2">
      <p class="text-sm font-semibold text-ink-900">Artikel tidak ditemukan.</p>
      <TombolDasar varian="primer" @click="router.push('/berita')">Lihat Semua Berita</TombolDasar>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Article Body -->
      <article class="anim-muncul lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
        <!-- Hero Cover Image -->
        <div v-if="artikel.gambar_url" class="w-full h-56 sm:h-72 overflow-hidden bg-slate-100">
          <img
            :src="artikel.gambar_url"
            :alt="artikel.judul"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="p-6 sm:p-8 space-y-6">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[11px] font-semibold">
                {{ artikel.tag || 'TURNAMEN' }}
              </span>
              <span aria-hidden="true">·</span>
              <span class="flex items-center gap-1 font-mono">
                <Calendar class="w-3.5 h-3.5" /> {{ formatTanggalIndo(artikel.diterbitkan_pada || artikel.tanggal) }}
              </span>
              <span aria-hidden="true">·</span>
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" /> {{ artikel.waktu_baca || '3 mnt baca' }}
              </span>
            </div>

            <h1 class="font-display text-xl sm:text-3xl font-semibold tracking-tight text-ink-900 leading-tight">
              {{ artikel.judul }}
            </h1>

            <div class="flex items-center gap-2 text-sm text-ink-400 pb-3 border-b border-slate-100">
              <User class="w-3.5 h-3.5" />
              <span>Ditulis oleh: <strong class="text-ink-900">{{ artikel.penulis || 'Redaksi PCL' }}</strong></span>
            </div>

            <p v-if="artikel.ringkasan" class="text-sm sm:text-base text-ink-900 font-medium bg-ucl-50 border-l-2 border-ucl-500 p-3.5 rounded-r-lg leading-relaxed">
              {{ artikel.ringkasan }}
            </p>
          </div>

          <!-- Paragraphs Content -->
          <div class="space-y-4 text-sm sm:text-base text-ink-700 leading-relaxed">
            <template v-if="daftarParagraf.length > 0">
              <p
                v-for="(paragraf, pIdx) in daftarParagraf"
                :key="pIdx"
                class="whitespace-pre-line"
              >
                {{ paragraf }}
              </p>
            </template>
            <p v-else class="text-slate-400 italic text-sm">
              {{ artikel.konten || artikel.isi || 'Belum ada isi konten artikel.' }}
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

          <!-- Bottom Share Box -->
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-0.5 text-center sm:text-left">
              <h4 class="text-xs font-bold text-ink-900">Suka artikel liputan ini?</h4>
              <p class="text-xs text-slate-500">Bagikan kabar pertandingan ini ke teman skuad atau grup WhatsApp tim.</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                @click="bagikanKeWhatsApp"
                class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageCircle class="w-4 h-4" />
                <span>Bagikan WhatsApp</span>
              </button>
              <button
                type="button"
                @click="salinTautan"
                class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <component :is="sudahDisalin ? Check : Share2" class="w-4 h-4" :class="sudahDisalin ? 'text-emerald-600' : ''" />
                <span>{{ sudahDisalin ? 'Tersalin' : 'Salin' }}</span>
              </button>
            </div>
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

          <TombolDasar
            varian="primer"
            @click="modalLagaTerbuka = true"
            class="w-full text-sm py-2"
          >
            <Activity class="w-4 h-4 mr-1.5" />
            Lihat Detail Laga
          </TombolDasar>
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

          <div class="space-y-3 divide-y divide-slate-100">
            <article
              v-for="b in beritaTerkaitList"
              :key="b.id"
              class="pt-3 first:pt-0 group cursor-pointer"
              @click="router.push(`/berita/${b.id}`)"
            >
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                <span class="font-semibold text-ucl-600">{{ b.tag || 'BERITA' }}</span>
                <span>·</span>
                <span>{{ formatTanggalIndo(b.diterbitkan_pada) }}</span>
              </div>
              <h4 class="text-xs font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors line-clamp-2 leading-snug">
                {{ b.judul }}
              </h4>
            </article>
          </div>
        </div>
      </aside>
    </div>

    <!-- Match Modal -->
    <ModalDetailPertandingan
      v-if="lagaTerkait"
      :terbuka="modalLagaTerbuka"
      :laga="lagaTerkait"
      :events="eventLagaTerkait"
      @tutup="modalLagaTerbuka = false"
    />
  </div>
</template>
