<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../lib/api.js'
import { getCache, setCache, invalidateCache } from '../lib/cache.js'
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
  Heart
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

// State & Interaksi Like Berita
const sedangLike = ref(false)
const sudahLike = ref(false)
const jumlahLike = ref(0)

function cekStatusLike(id) {
  if (!id) return
  try {
    const raw = localStorage.getItem(`pcl_news_liked_${id}`)
    sudahLike.value = raw === 'true'
  } catch {
    sudahLike.value = false
  }
}

async function handleToggleLike() {
  if (!artikel.value || sedangLike.value) return
  sedangLike.value = true

  const targetId = artikel.value.id
  const statusAwal = sudahLike.value
  const delta = statusAwal ? -1 : 1

  // Optimistic UI Update
  sudahLike.value = !statusAwal
  jumlahLike.value = Math.max(0, jumlahLike.value + delta)
  if (artikel.value) {
    artikel.value.likes_count = jumlahLike.value
  }

  try {
    localStorage.setItem(`pcl_news_liked_${targetId}`, String(!statusAwal))
  } catch {}

  // Update Cache agar saat refresh angka tidak kembali ke cache lama
  const cacheKey = `news_detail_${targetId}`
  const cached = getCache(cacheKey)
  if (cached && cached.artikel) {
    cached.artikel.likes_count = jumlahLike.value
    setCache(cacheKey, cached, 60000)
  }
  invalidateCache('news_list')

  try {
    const res = await api.likeNews(targetId, delta)
    if (res && res.likes_count !== undefined) {
      jumlahLike.value = Number(res.likes_count)
      if (artikel.value) artikel.value.likes_count = Number(res.likes_count)
      if (cached && cached.artikel) {
        cached.artikel.likes_count = Number(res.likes_count)
        setCache(cacheKey, cached, 60000)
      }
    }
  } catch (err) {
    console.error('Gagal menyimpan like ke server:', err)
    // Rollback jika request backend gagal
    sudahLike.value = statusAwal
    jumlahLike.value = Math.max(0, jumlahLike.value - delta)
    if (artikel.value) artikel.value.likes_count = jumlahLike.value
    try {
      localStorage.setItem(`pcl_news_liked_${targetId}`, String(statusAwal))
    } catch {}
    if (cached && cached.artikel) {
      cached.artikel.likes_count = jumlahLike.value
      setCache(cacheKey, cached, 60000)
    }
  } finally {
    sedangLike.value = false
  }
}

function formatTanggalIndo(isoStr) {
  if (!isoStr) return '-'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch (e) {
    return '-'
  }
}

// Helper untuk mengekstrak paragraf teks dari data konten/isi
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

    if (artikel.value) {
      jumlahLike.value = Number(artikel.value.likes_count || 0)
      cekStatusLike(artikel.value.id)
      perbaruiMetaHalaman({
        judul: artikel.value.judul,
        deskripsi: artikel.value.ringkasan || artikel.value.judul,
        gambar: artikel.value.gambar_url || '',
        tipe: 'article'
      })
    }

    // SWR background refresh agar sinkron dengan data database live
    api.getNewsDetail(route.params.id).then(liveNews => {
      if (liveNews) {
        artikel.value = liveNews
        jumlahLike.value = Number(liveNews.likes_count || 0)
        cekStatusLike(liveNews.id)
        setCache(cacheKey, {
          artikel: liveNews,
          lagaTerkait: lagaTerkait.value,
          eventLagaTerkait: eventLagaTerkait.value,
          beritaTerkaitList: beritaTerkaitList.value
        }, 60000)
      }
    }).catch(() => {})

    return
  }

  sedangMemuat.value = true

  try {
    const newsData = await api.getNewsDetail(route.params.id)
    artikel.value = newsData || null

    if (artikel.value) {
      jumlahLike.value = Number(artikel.value.likes_count || 0)
      cekStatusLike(artikel.value.id)
    }

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

    // Perbarui Open Graph Meta Tags & Title untuk Preview Share (WhatsApp, Facebook, Twitter)
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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 pb-16 space-y-5 sm:space-y-8">
    <!-- Back & Share Topbar -->
    <div class="anim-muncul flex items-center justify-between gap-2 pb-4 sm:pb-5 border-b border-slate-200">
      <TombolDasar
        varian="sekunder"
        @click="router.push('/berita')"
        class="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
      >
        <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
        <span class="hidden sm:inline">Kembali ke Berita</span>
        <span class="sm:hidden">Kembali</span>
      </TombolDasar>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          @click="handleToggleLike"
          :disabled="sedangLike"
          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 shrink-0"
          :class="
            sudahLike
              ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200'
          "
        >
          <Heart
            class="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform"
            :class="sudahLike ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'"
          />
          <span class="tabular-nums font-bold">{{ jumlahLike }}</span>
          <span class="hidden sm:inline">{{ sudahLike ? 'Disukai' : 'Suka' }}</span>
        </button>

        <TombolDasar
          varian="sekunder"
          @click="salinTautan"
          class="text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3.5"
        >
          <component :is="sudahDisalin ? Check : Share2" class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" :class="sudahDisalin ? 'text-emerald-600' : ''" />
          <span>{{ sudahDisalin ? 'Tersalin!' : 'Bagikan' }}</span>
        </TombolDasar>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="sedangMemuat" class="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>

    <div v-else-if="!artikel" class="text-center py-14 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
      <p class="text-sm font-semibold text-ink-900">Artikel tidak ditemukan.</p>
      <TombolDasar varian="primer" @click="router.push('/berita')">Lihat Semua Berita</TombolDasar>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
      <!-- Article Body -->
      <article class="anim-muncul lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden">
        <!-- Hero Cover Image -->
        <div v-if="artikel.gambar_url" class="w-full h-48 sm:h-72 md:h-80 overflow-hidden bg-slate-100 relative">
          <img
            :src="artikel.gambar_url"
            :alt="artikel.judul"
            class="w-full h-full object-cover"
            decoding="async"
          />
        </div>

        <div class="p-4 sm:p-7 md:p-8 space-y-4 sm:space-y-6">
          <div class="space-y-2.5 sm:space-y-3">
            <!-- Metadata line (Tag, Date, Read Time) -->
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                {{ artikel.tag || 'TURNAMEN' }}
              </span>
              <span class="text-slate-300">·</span>
              <span class="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-slate-400">
                <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" /> {{ formatTanggalIndo(artikel.diterbitkan_pada || artikel.tanggal) }}
              </span>
              <span class="text-slate-300">·</span>
              <span class="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" /> {{ artikel.waktu_baca || '3 mnt baca' }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-ink-900 leading-snug sm:leading-tight">
              {{ artikel.judul }}
            </h1>

            <!-- Author -->
            <div class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 pb-3 border-b border-slate-100">
              <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Ditulis oleh: <strong class="text-ink-900 font-semibold">{{ artikel.penulis || 'Redaksi PCL' }}</strong></span>
            </div>

            <!-- Summary / Lead Box -->
            <p v-if="artikel.ringkasan" class="text-xs sm:text-sm md:text-base text-ink-900 font-medium bg-ucl-50/80 border-l-4 border-ucl-600 p-3 sm:p-4 rounded-r-xl leading-relaxed">
              {{ artikel.ringkasan }}
            </p>
          </div>

          <!-- Paragraphs Content -->
          <div class="space-y-3.5 sm:space-y-4 text-xs sm:text-sm md:text-base text-ink-700 leading-relaxed sm:leading-loose">
            <template v-if="daftarParagraf.length > 0">
              <p
                v-for="(paragraf, pIdx) in daftarParagraf"
                :key="pIdx"
                class="whitespace-pre-line"
              >
                {{ paragraf }}
              </p>
            </template>
            <p v-else class="text-slate-400 italic text-xs sm:text-sm">
              {{ artikel.konten || artikel.isi || 'Belum ada isi konten artikel.' }}
            </p>
          </div>

          <!-- Blockquote -->
          <div v-if="artikel.kutipan" class="relative p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 my-4">
            <Quote class="w-5 h-5 sm:w-6 sm:h-6 text-ucl-500/30 absolute right-3 top-3" />
            <p class="text-xs sm:text-sm italic text-ink-900 leading-relaxed pr-6">
              "{{ artikel.kutipan }}"
            </p>
            <div class="text-[11px] sm:text-xs font-semibold text-ucl-600">
              — {{ artikel.narasumber }}
            </div>
          </div>

          <!-- Reaction / Like Box -->
          <div class="pt-5 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200">
            <div class="text-center sm:text-left space-y-0.5">
              <h4 class="text-xs sm:text-sm font-bold text-ink-900">Suka dengan liputan artikel ini?</h4>
              <p class="text-[11px] sm:text-xs text-slate-500">Beri dukungan dan reaksi untuk tim redaksi resmi PCL.</p>
            </div>

            <button
              type="button"
              @click="handleToggleLike"
              :disabled="sedangLike"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all transform active:scale-95 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0"
              :class="
                sudahLike
                  ? 'bg-rose-500 text-white border border-rose-600 hover:bg-rose-600'
                  : 'bg-white text-ink-900 border border-slate-200 hover:border-rose-300 hover:text-rose-600'
              "
            >
              <Heart
                class="w-4 h-4 transition-transform duration-200 shrink-0"
                :class="sudahLike ? 'fill-white scale-110' : 'text-rose-500'"
              />
              <span>{{ sudahLike ? 'Disukai' : 'Suka Artikel' }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
                :class="sudahLike ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'"
              >
                {{ jumlahLike }}
              </span>
            </button>
          </div>
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="space-y-4">
        <!-- Related Match Card -->
        <div
          v-if="lagaTerkait"
          class="rounded-2xl bg-white border border-slate-200 shadow-card p-4 sm:p-5 space-y-3 hover:shadow-lift transition-shadow"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Laga Terkait
            </span>
            <span class="font-mono text-[10px] sm:text-[11px] font-bold text-ucl-600">MD {{ lagaTerkait.matchday }}</span>
          </div>

          <div class="flex items-center justify-between py-1">
            <div class="text-center min-w-0 flex-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-navy-800 text-xs">
                {{ lagaTerkait.home_team?.short_name || 'H' }}
              </div>
              <div class="text-[10px] sm:text-[11px] font-medium text-ink-600 mt-1 truncate max-w-[80px] mx-auto">
                {{ lagaTerkait.home_team?.name || 'Home' }}
              </div>
            </div>

            <div class="font-display text-base sm:text-lg font-bold text-navy-800 tabular-nums px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
              {{ lagaTerkait.home_score ?? 0 }} – {{ lagaTerkait.away_score ?? 0 }}
            </div>

            <div class="text-center min-w-0 flex-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-navy-800 text-xs">
                {{ lagaTerkait.away_team?.short_name || 'A' }}
              </div>
              <div class="text-[10px] sm:text-[11px] font-medium text-ink-600 mt-1 truncate max-w-[80px] mx-auto">
                {{ lagaTerkait.away_team?.name || 'Away' }}
              </div>
            </div>
          </div>

          <div v-if="lagaTerkait.mvp" class="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-1.5">
            <Award class="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span class="text-ink-600 truncate">MVP: <strong class="text-ink-900 font-semibold">{{ lagaTerkait.mvp.name }}</strong></span>
          </div>

          <TombolDasar
            varian="primer"
            @click="modalLagaTerbuka = true"
            class="w-full text-xs sm:text-sm py-2"
          >
            <Activity class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Lihat Detail Laga
          </TombolDasar>
        </div>

        <!-- Related News -->
        <div v-if="beritaTerkaitList.length > 0" class="rounded-2xl bg-white border border-slate-200 shadow-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
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
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <span class="font-bold text-ucl-600 uppercase">{{ b.tag || 'BERITA' }}</span>
                <span>·</span>
                <span class="font-mono">{{ formatTanggalIndo(b.diterbitkan_pada) }}</span>
              </div>
              <h4 class="text-xs sm:text-sm font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors line-clamp-2 leading-snug">
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
