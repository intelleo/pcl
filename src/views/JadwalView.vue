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
}
= usePertandingan()

const filterStage = ref('semua')
const filterMatchday = ref('semua')
const modalDetailTerbuka = ref(false)

onMounted(async () => {
  // Ambil sample/real tournament ID jika ada
  await ambilSemuaPertandingan('sample-tournament-id')
})

const pertandinganTerfilter = computed(() => {
  return daftarPertandingan.value.filter(laga => {
    if (filterStage.value !== 'semua' && laga.stage !== filterStage.value) return false
    if (filterMatchday.value !== 'semua' && laga.matchday !== Number(filterMatchday.value)) return false
    return true
  })
})

async function bukaDetail(laga) {
  await ambilDetailPertandingan(laga.id)
  modalDetailTerbuka.value = true
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Title -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-wide uppercase">
          Jadwal & Hasil Pertandingan
        </h1>
        <p class="text-sm text-slate-400">Daftar lengkap jadwal, skor akhir, dan pencetak gol PCL</p>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <Filter class="w-3.5 h-3.5 text-emerald-400" />
          <select v-model="filterStage" class="bg-transparent border-none focus:outline-none cursor-pointer">
            <option value="semua">Semua Fase</option>
            <option value="group">Fase Grup</option>
            <option value="round_of_16">16 Besar</option>
            <option value="quarter_final">Perempat Final</option>
            <option value="semi_final">Semi Final</option>
            <option value="final">Final</option>
          </select>
        </div>

        <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <select v-model="filterMatchday" class="bg-transparent border-none focus:outline-none cursor-pointer">
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
      <div v-for="n in 6" :key="n" class="h-36 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
    </div>

    <div v-else-if="pertandinganTerfilter.length === 0" class="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/60">
      <p class="text-slate-400 text-sm">Tidak ada jadwal pertandingan yang sesuai kriteria.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <KartuPertandingan
        v-for="laga in pertandinganTerfilter"
        :key="laga.id"
        :laga="laga"
        @klikDetail="bukaDetail"
      />
    </div>

    <!-- Modal Detail Match -->
    <ModalDetailPertandingan
      :terbuka="modalDetailTerbuka"
      :laga="lagaTerpilih"
      :events="eventLagaTerpilih"
      @tutup="modalDetailTerbuka = false"
    />
  </div>
</template>
