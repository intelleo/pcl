<script setup>
import { ref, computed } from 'vue'
import { Plus, Trash2, Trophy, Award, Calendar, Crown, Flame, Compass } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  daftarRiwayat: {
    type: Array,
    default: () => []
  },
  daftarTim: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tambahRiwayat', 'hapusRiwayat'])

const modalTambah = ref(false)

const form = ref({
  musim: '2027',
  label_musim: 'PCL 2027 (Season 4)',
  juara_id: '',
  runner_up_id: '',
  peringkat_3_id: '',
  skor_final: '2 – 1',
  lokasi_final: 'Stadion Utama PCL',
  top_scorer_nama: '',
  top_scorer_klub: '',
  top_scorer_total: 8,
  mvp_nama: '',
  mvp_klub: '',
  mvp_rating: 9.5
})

function submitForm() {
  const timJuara = props.daftarTim.find(t => t.id === form.value.juara_id) || { name: 'Juara Tim', short_name: 'JUR' }
  const timRunnerUp = props.daftarTim.find(t => t.id === form.value.runner_up_id) || { name: 'Runner Up Tim', short_name: 'RUN' }
  const timPeringkat3 = props.daftarTim.find(t => t.id === form.value.peringkat_3_id) || null

  const itemBaru = {
    id: `s${form.value.musim}`,
    musim: form.value.musim,
    label_musim: form.value.label_musim,
    status: 'Selesai',
    juara: {
      id: timJuara.id,
      name: timJuara.name,
      short_name: timJuara.short_name,
      manager_name: timJuara.manager_name || 'Coach',
      rating: timJuara.rating || 90
    },
    runner_up: {
      id: timRunnerUp.id,
      name: timRunnerUp.name,
      short_name: timRunnerUp.short_name,
      manager_name: timRunnerUp.manager_name || 'Coach',
      rating: timRunnerUp.rating || 90
    },
    peringkat_3: timPeringkat3 ? {
      id: timPeringkat3.id,
      name: timPeringkat3.name,
      short_name: timPeringkat3.short_name
    } : null,
    skor_final: form.value.skor_final,
    lokasi_final: form.value.lokasi_final,
    top_scorer: {
      nama: form.value.top_scorer_nama || 'Pemain Bintang',
      klub: form.value.top_scorer_klub || timJuara.short_name,
      total: Number(form.value.top_scorer_total) || 5
    },
    top_assist: {
      nama: 'Playmaker Musim',
      klub: timJuara.short_name,
      total: 4
    },
    mvp_turnamen: {
      nama: form.value.mvp_nama || 'Bintang Final',
      klub: form.value.mvp_klub || timJuara.short_name,
      rating: Number(form.value.mvp_rating) || 9.5
    },
    total_peserta: 16,
    total_gol: 48
  }

  emit('tambahRiwayat', itemBaru)
  modalTambah.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-card">
      <div>
        <h3 class="text-base font-semibold text-ink-900 flex items-center gap-2">
          <Trophy class="w-5 h-5 text-gold-600" />
          Manajemen Arsip Juara Musim
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Catat pemenang trofi dan penghargaan individu saat turnamen musim berakhir.
        </p>
      </div>

      <TombolDasar @click="modalTambah = !modalTambah" varian="primer" class="shrink-0 flex items-center gap-1.5">
        <Plus class="w-4 h-4" />
        Tambah Juara Musim Baru
      </TombolDasar>
    </div>

    <!-- Form Tambah (Collapse) -->
    <div v-if="modalTambah" class="anim-muncul bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-5">
      <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h4 class="font-semibold text-sm text-ink-900">Form Catat Juara Musim</h4>
        <span class="text-xs text-slate-400">PCL Season Archive</span>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-ink-600 mb-1">Tahun Musim</label>
            <input
              v-model="form.musim"
              type="text"
              placeholder="2027"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none"
              required
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block font-semibold text-ink-600 mb-1">Label Musim</label>
            <input
              v-model="form.label_musim"
              type="text"
              placeholder="PCL 2027 (Season 4)"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-ink-600 mb-1">Klub Juara 1</label>
            <select
              v-model="form.juara_id"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none"
              required
            >
              <option value="" disabled>Pilih Klub Juara</option>
              <option v-for="t in daftarTim" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.short_name }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-ink-600 mb-1">Skor Final</label>
            <input
              v-model="form.skor_final"
              type="text"
              placeholder="3 – 2"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none text-center font-bold"
              required
            />
          </div>

          <div>
            <label class="block font-semibold text-ink-600 mb-1">Klub Runner-up</label>
            <select
              v-model="form.runner_up_id"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none"
              required
            >
              <option value="" disabled>Pilih Klub Runner-up</option>
              <option v-for="t in daftarTim" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.short_name }})
              </option>
            </select>
          </div>
        </div>

        <!-- Awards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div class="space-y-3">
            <h5 class="font-semibold text-ink-900 flex items-center gap-1.5">
              <Flame class="w-4 h-4 text-red-500" />
              Top Scorer
            </h5>
            <input
              v-model="form.top_scorer_nama"
              type="text"
              placeholder="Nama Pemain Top Scorer"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none"
              required
            />
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="form.top_scorer_klub"
                type="text"
                placeholder="Kode Tim (mis: BAR)"
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 uppercase"
              />
              <input
                v-model.number="form.top_scorer_total"
                type="number"
                placeholder="Jumlah Gol"
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900"
              />
            </div>
          </div>

          <div class="space-y-3">
            <h5 class="font-semibold text-ink-900 flex items-center gap-1.5">
              <Award class="w-4 h-4 text-gold-600" />
              Pemain Terbaik (MVP)
            </h5>
            <input
              v-model="form.mvp_nama"
              type="text"
              placeholder="Nama Pemain MVP"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 focus:border-ucl-500 outline-none"
              required
            />
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="form.mvp_klub"
                type="text"
                placeholder="Kode Tim (mis: BAR)"
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900 uppercase"
              />
              <input
                v-model.number="form.mvp_rating"
                type="number"
                step="0.1"
                placeholder="Rating (mis: 9.8)"
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-ink-900"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="modalTambah = false"
            class="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold cursor-pointer"
          >
            Batal
          </button>
          <TombolDasar tipe="submit" varian="primer">
            Simpan Juara Musim
          </TombolDasar>
        </div>
      </form>
    </div>

    <!-- List Tabel Arsip -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6">Musim</th>
              <th class="py-3 px-4 sm:px-6">Juara 1</th>
              <th class="py-3 px-4 sm:px-6 text-center">Skor Final</th>
              <th class="py-3 px-4 sm:px-6">Runner-up</th>
              <th class="py-3 px-4 sm:px-6">Top Scorer</th>
              <th class="py-3 px-4 sm:px-6">MVP Turnamen</th>
              <th class="py-3 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in daftarRiwayat" :key="item.id" class="hover:bg-slate-50">
              <td class="py-3 px-4 sm:px-6 font-semibold text-xs text-ink-900">
                {{ item.musim }}
              </td>
              <td class="py-3 px-4 sm:px-6 font-semibold text-xs text-gold-700">
                {{ item.juara?.name || item.juara_name || 'Klub Juara' }} ({{ item.juara?.short_name || item.juara_short || 'JUR' }})
              </td>
              <td class="py-3 px-4 sm:px-6 text-center font-mono font-bold text-xs text-navy-800">
                {{ item.skor_final }}
              </td>
              <td class="py-3 px-4 sm:px-6 text-xs text-slate-600">
                {{ item.runner_up?.name || item.runner_up_name || 'Runner-up' }} ({{ item.runner_up?.short_name || item.runner_up_short || 'RUN' }})
              </td>
              <td class="py-3 px-4 sm:px-6 text-xs text-slate-600">
                <span class="font-medium text-ink-900">{{ item.top_scorer?.nama || item.top_scorer_nama || '-' }}</span>
                <span class="text-slate-400 ml-1">({{ item.top_scorer?.total ?? item.top_scorer_total ?? 0 }} gol)</span>
              </td>
              <td class="py-3 px-4 sm:px-6 text-xs text-slate-600">
                <span class="font-medium text-ink-900">{{ item.mvp_turnamen?.nama || item.mvp_nama || '-' }}</span>
                <span class="text-amber-700 font-semibold ml-1">({{ item.mvp_turnamen?.rating ?? item.mvp_rating ?? 9.0 }} Rtg)</span>
              </td>
              <td class="py-3 px-4 sm:px-6 text-right">
                <button
                  @click="emit('hapusRiwayat', item.id)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus Rekaman"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
