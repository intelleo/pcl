<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/api.js'
import { getCache, setCache } from '../lib/cache.js'
import {
  Newspaper,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Clock,
  Sparkles,
  Heart
} from 'lucide-vue-next'

const router = useRouter()

const kataKunci = ref('')
const tagTerpilih = ref('semua')
const sedangMemuat = ref(false)
const daftarBerita = ref([])

onMounted(async () => {
  const cached = getCache('news_list')
  if (cached) {
    daftarBerita.value = cached
    // SWR background refresh agar sinkron dengan live likes & artikel baru
    api.getNews().then(data => {
      if (data) {
        daftarBerita.value = data
        setCache('news_list', data, 60000)
      }
    }).catch(() => {})
    return
  }

  sedangMemuat.value = true
  try {
    const data = await api.getNews()
    daftarBerita.value = data || []
    setCache('news_list', daftarBerita.value, 60000)
  } catch (err) {
    daftarBerita.value = []
  } finally {
    sedangMemuat.value = false
  }
})

const daftarTag = [
  { id: 'semua', label: 'Semua' },
  { id: 'MATCH RECAP', label: 'Match Recap' },
  { id: 'TACTICAL REVIEW', label: 'Tactical Review' },
  { id: 'DEFENSIVE MASTERCLASS', label: 'Defense' },
  { id: 'TOURNAMENT PREVIEW', label: 'Preview' }
]

const beritaTersaring = computed(() => {
  return daftarBerita.value.filter(b => {
    const cocokTag = tagTerpilih.value === 'semua' || b.tag === tagTerpilih.value || b.kategori === tagTerpilih.value
    const query = kataKunci.value.toLowerCase().trim()
    const cocokKata = !query ||
      b.judul.toLowerCase().includes(query) ||
      b.ringkasan?.toLowerCase().includes(query) ||
      b.penulis?.toLowerCase().includes(query)
    return cocokTag && cocokKata
  })
})

const beritaUtama = computed(() => beritaTersaring.value[0] || null)
const beritaLainnya = computed(() => {
  if (tagTerpilih.value === 'semua' && !kataKunci.value) {
    return beritaTersaring.value.slice(1)
  }
  return beritaTersaring.value
})

function navigasiKeDetail(id) {
  router.push(`/berita/${id}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Newsroom Turnamen</span>
        <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 mt-1 flex items-center gap-2.5">
          <Newspaper class="w-7 h-7 text-ucl-600 shrink-0" />
          Kabar &amp; Liputan PCL
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Ulasan pertandingan, analisis taktik skuad, dan kabar resmi turnamen Peak Champions League.
        </p>
      </div>

      <!-- Quick Stats Count -->
      <div class="flex items-center gap-2 text-xs text-slate-500 self-start md:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
        <span>Total <strong class="text-ink-900 font-semibold">{{ daftarBerita.length }}</strong> Artikel</span>
        <span class="text-slate-300">·</span>
        <span class="text-ucl-700 font-medium">Liputan Resmi</span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="sedangMemuat" class="space-y-6">
      <div class="h-72 sm:h-96 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="n in 6" :key="n" class="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
      </div>
    </div>

    <template v-else>
      <!-- Featured Article (Sorotan Utama) -->
      <div
        v-if="beritaUtama && tagTerpilih === 'semua' && !kataKunci"
        @click="navigasiKeDetail(beritaUtama.id)"
        class="anim-muncul group relative overflow-hidden rounded-2xl bg-white border border-ucl-500/40 ring-1 ring-ucl-500/20 shadow-card hover:shadow-lift transition-all cursor-pointer"
        style="animation-delay: 60ms"
      >
        <div class="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <!-- Featured Cover Image -->
          <div class="lg:col-span-7 relative overflow-hidden bg-slate-100 aspect-[16/9] lg:aspect-auto lg:min-h-[320px]">
            <img
              v-if="beritaUtama.gambar_url"
              :src="beritaUtama.gambar_url"
              :alt="beritaUtama.judul"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              decoding="async"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-navy-900 via-ucl-900 to-ucl-700 flex items-center justify-center min-h-[220px]">
              <span class="font-display text-white/30 text-4xl sm:text-5xl font-bold tracking-tight">PCL NEWS</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent lg:hidden"></div>
          </div>

          <!-- Featured Content -->
          <div class="lg:col-span-5 p-4 sm:p-6 lg:p-7 flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <!-- Badges & Date -->
              <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-ucl-600 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    <Sparkles class="w-3 h-3 text-gold-300" />
                    Sorotan Utama
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-700 text-[10px] sm:text-[11px] font-bold">
                    {{ beritaUtama.tag }}
                  </span>
                </div>
                <span class="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-slate-400" /> {{ beritaUtama.tanggal }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-ink-900 group-hover:text-ucl-600 transition-colors leading-snug">
                {{ beritaUtama.judul }}
              </h2>

              <!-- Summary -->
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {{ beritaUtama.ringkasan }}
              </p>
            </div>

            <!-- Footer Meta & CTA -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-3 text-slate-500 text-[11px] sm:text-xs">
                <span class="flex items-center gap-1 font-medium truncate max-w-[130px]">
                  <User class="w-3.5 h-3.5 text-slate-400 shrink-0" /> {{ beritaUtama.penulis }}
                </span>
                <span class="flex items-center gap-1 text-slate-400 shrink-0">
                  <Clock class="w-3.5 h-3.5 text-slate-400" /> 3 mnt baca
                </span>
                <span v-if="Number(beritaUtama.likes_count || 0) > 0" class="flex items-center gap-1 text-rose-500 font-semibold shrink-0">
                  <Heart class="w-3.5 h-3.5 fill-rose-500" /> {{ beritaUtama.likes_count }}
                </span>
              </div>
              <span class="text-xs sm:text-sm font-bold text-ucl-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                <span>Baca Lengkap</span>
                <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative w-full sm:w-72">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="kataKunci"
            type="text"
            placeholder="Cari artikel berita..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500 transition-colors shadow-sm"
          />
        </div>

        <!-- Tag Filters (Scrollable Mobile) -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 overflow-x-auto w-full sm:w-fit scrollbar-none">
          <button
            v-for="tag in daftarTag"
            :key="tag.id"
            @click="tagTerpilih = tag.id"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40 shrink-0"
            :class="
              tagTerpilih === tag.id
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-slate-500 hover:text-ink-900'
            "
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="beritaTersaring.length === 0" class="text-center py-14 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
          <Filter class="w-6 h-6" />
        </div>
        <p class="text-sm font-semibold text-ink-900">Tidak ada artikel yang sesuai.</p>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Coba ubah kata kunci pencarian atau pilih kategori lainnya.</p>
      </div>

      <!-- Article Grid (Responsive Mobile Card Layout) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <article
          v-for="(berita, idx) in beritaLainnya"
          :key="berita.id"
          @click="navigasiKeDetail(berita.id)"
          class="anim-muncul flex flex-col justify-between rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-lift transition-all duration-300 group cursor-pointer overflow-hidden"
          :style="{ animationDelay: `${Math.min(idx, 6) * 50}ms` }"
        >
          <!-- Card Media Container -->
          <div class="relative w-full aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
            <img
              v-if="berita.gambar_url"
              :src="berita.gambar_url"
              :alt="berita.judul"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-navy-900 to-ucl-700 flex items-center justify-center">
              <span class="font-display text-white/30 text-2xl font-bold tracking-tight">PCL</span>
            </div>

            <!-- Category Pill on Image (Mobile Enhanced) -->
            <div class="absolute top-2.5 left-2.5">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-navy-950/80 backdrop-blur-sm text-gold-400 text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                {{ berita.tag }}
              </span>
            </div>
          </div>

          <!-- Card Body Content -->
          <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
            <div class="space-y-2">
              <!-- Date & Category Meta -->
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span class="font-medium text-slate-500 capitalize">{{ berita.kategori || 'Berita' }}</span>
                <span class="font-mono flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-slate-400" />
                  {{ berita.tanggal }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="font-display text-sm sm:text-base font-bold text-ink-900 group-hover:text-ucl-600 transition-colors line-clamp-2 leading-snug">
                {{ berita.judul }}
              </h3>

              <!-- Summary -->
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {{ berita.ringkasan }}
              </p>
            </div>

            <!-- Footer Card Meta -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2.5 text-slate-500 text-[11px] min-w-0">
                <span class="flex items-center gap-1 truncate max-w-[110px]">
                  <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate">{{ berita.penulis }}</span>
                </span>
                <span v-if="Number(berita.likes_count || 0) > 0" class="flex items-center gap-1 text-rose-500 font-semibold shrink-0">
                  <Heart class="w-3.5 h-3.5 fill-rose-500" /> {{ berita.likes_count }}
                </span>
              </div>
              <span class="font-semibold text-xs text-ucl-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                <span>Baca</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>
