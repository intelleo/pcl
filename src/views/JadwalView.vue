<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePertandingan } from '../composables/usePertandingan.js'
import KartuPertandingan from '../components/turnamen/KartuPertandingan.vue'
import ModalDetailPertandingan from '../components/turnamen/ModalDetailPertandingan.vue'
import { Filter } from 'lucide-vue-next'

const {
  sedangMemuat,
  daftarPertandingan,
  lagaTerpilih,
  eventLagaTerpilih,
  ambilSemuaPertandingan,
  ambilDetailPertandingan
} = usePertandingan()

const filterStage = ref('semua')
const filterMatchday = ref('semua')
const modalDetailTerbuka = ref(false)

onMounted(async () => {
  await ambilSemuaPertandingan()
})

const pertandinganTerfilter = computed(() => {
  return daftarPertandingan.value.filter(laga => {
    if (filterStage.value !== 'semua' && laga.stage !== filterStage.value) return false
    if (filterMatchday.value !== 'semua' && laga.matchday !== Number(filterMatchday.value)) return false
    return true
  })
})

async function bukaDetail(laga) {
  if (laga.events && laga.events.length > 0) {
    lagaTerpilih.value = laga
    eventLagaTerpilih.value = laga.events
  } else {
    await ambilDetailPertandingan(laga.id)
  }
  modalDetailTerbuka.value = true
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Match Center</span>
        <h1 class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1">
          Jadwal &amp; hasil pertandingan
        </h1>
        <p class="text-sm sm:text-base text-ink-400 max-w-2xl mt-1 leading-relaxed">
          Saring laga berdasarkan fase dan matchday untuk melihat hasil lengkap.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 transition focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20">
          <Filter class="w-4 h-4 text-ucl-600 shrink-0" />
          <select
            v-model="filterStage"
            class="bg-transparent text-sm font-medium text-ink-900 border-none outline-none cursor-pointer pr-1"
          >
            <option value="semua">Semua Fase</option>
            <option value="group">Fase Grup</option>
            <option value="semi_final">Semi Final</option>
            <option value="final">Grand Final</option>
          </select>
        </div>

        <div class="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 transition focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20">
          <select
            v-model="filterMatchday"
            class="bg-transparent text-sm font-medium text-ink-900 border-none outline-none cursor-pointer pr-1"
          >
            <option value="semua">Semua Matchday</option>
            <option value="1">Matchday 1</option>
            <option value="2">Matchday 2</option>
            <option value="3">Matchday 3</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Match Grid -->
    <div v-if="sedangMemuat" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-36 rounded-xl bg-white border border-slate-200 animate-pulse"></div>
    </div>

    <div v-else-if="pertandinganTerfilter.length === 0" class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2">
      <Filter class="w-8 h-8 text-slate-400 mx-auto" />
      <p class="text-sm font-semibold text-ink-900">Tidak ada pertandingan yang sesuai.</p>
      <p class="text-xs text-slate-500">Coba ubah opsi filter di atas.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <KartuPertandingan
        v-for="laga in pertandinganTerfilter"
        :key="laga.id"
        :laga="laga"
        @klikDetail="bukaDetail"
      />
    </div>

    <!-- Modal -->
    <ModalDetailPertandingan
      :terbuka="modalDetailTerbuka"
      :laga="lagaTerpilih"
      :events="eventLagaTerpilih"
      @tutup="modalDetailTerbuka = false"
    />
  </div>
</template>
