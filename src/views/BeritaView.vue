<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import {
  Newspaper,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-vue-next'

const router = useRouter()

const kataKunci = ref('')
const tagTerpilih = ref('semua')
const sedangMemuat = ref(false)
const daftarBerita = ref([])

onMounted(async () => {
  sedangMemuat.value = true
  try {
    const { data } = await supabase
      .from('pcl_news')
      .select('*')
      .order('diterbitkan_pada', { ascending: false })

    daftarBerita.value = data || []
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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-3 pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Newsroom</span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
          Kabar &amp; liputan
        </h1>
      </div>
      <p class="text-sm sm:text-base text-ink-400 max-w-md md:text-right leading-relaxed">
        Ulasan pertandingan, taktik, dan kabar terbaru turnamen
      </p>
    </div>

    <!-- Featured Article -->
    <div
      v-if="beritaUtama && tagTerpilih === 'semua' && !kataKunci"
      @click="navigasiKeDetail(beritaUtama.id)"
      class="anim-muncul group relative overflow-hidden rounded-xl bg-white border border-ucl-500/40 ring-1 ring-ucl-500/20 shadow-lift p-6 sm:p-8 transition-shadow cursor-pointer space-y-4"
      style="animation-delay: 60ms"
    >
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-600 text-white text-[11px] font-semibold uppercase tracking-wide">
            Sorotan Utama
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[11px] font-semibold">
            {{ beritaUtama.tag }}
          </span>
        </div>
        <span class="font-mono text-[11px] text-slate-400 flex items-center gap-1">
          <Calendar class="w-3.5 h-3.5" /> {{ beritaUtama.tanggal }}
        </span>
      </div>

      <div class="space-y-2 max-w-3xl">
        <h2 class="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 group-hover:text-ucl-600 transition-colors leading-snug">
          {{ beritaUtama.judul }}
        </h2>
        <p class="text-sm text-ink-600 leading-relaxed line-clamp-3">
          {{ beritaUtama.ringkasan }}
        </p>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <span class="flex items-center gap-1.5">
            <User class="w-3.5 h-3.5" /> {{ beritaUtama.penulis }}
          </span>
          <span class="flex items-center gap-1">
            <Clock class="w-3.5 h-3.5" /> 3 mnt baca
          </span>
        </div>
        <span class="text-sm font-semibold text-ucl-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Baca Selengkapnya <ArrowRight class="w-4 h-4" />
        </span>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative w-full sm:w-72">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="kataKunci"
          type="text"
          placeholder="Cari artikel..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500 transition-colors shadow-sm"
        />
      </div>

      <!-- Tag Filters -->
      <div class="flex items-center gap-1 p-1 rounded-full bg-slate-100 overflow-x-auto w-full sm:w-fit scrollbar-none">
        <button
          v-for="tag in daftarTag"
          :key="tag.id"
          @click="tagTerpilih = tag.id"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500/40"
          :class="
            tagTerpilih === tag.id
              ? 'bg-white text-ink-900 shadow-card'
              : 'text-slate-500 hover:text-ink-900'
          "
        >
          {{ tag.label }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="beritaTersaring.length === 0" class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2">
      <Filter class="w-8 h-8 text-slate-400 mx-auto" />
      <p class="text-sm font-semibold text-ink-900">Tidak ada artikel yang sesuai.</p>
      <p class="text-xs text-slate-500">Coba ubah kata kunci pencarian.</p>
    </div>

    <!-- Article Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="(berita, idx) in beritaLainnya"
        :key="berita.id"
        @click="navigasiKeDetail(berita.id)"
        class="anim-muncul flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-lift transition-shadow group cursor-pointer space-y-3"
        :style="{ animationDelay: `${Math.min(idx, 6) * 60}ms` }"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[10px] font-semibold uppercase tracking-wide">
              {{ berita.tag }}
            </span>
            <span class="font-mono text-[11px] text-slate-400">{{ berita.tanggal }}</span>
          </div>

          <h3 class="font-display text-sm font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors line-clamp-2 leading-snug">
            {{ berita.judul }}
          </h3>

          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {{ berita.ringkasan }}
          </p>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500 flex items-center gap-1">
            <User class="w-3 h-3" /> {{ berita.penulis }}
          </span>
          <span class="font-semibold text-ucl-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Baca <ArrowRight class="w-3.5 h-3.5" />
          </span>
        </div>
      </article>
    </div>
  </div>
</template>
