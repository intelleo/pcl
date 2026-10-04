<script setup>
import { ref, onMounted } from 'vue'
import { useSeason } from '../../composables/useSeason.js'
import {
  Calendar,
  Plus,
  Trophy,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

const {
  daftarSeason,
  seasonAktif,
  sedangMemuat,
  pesanKesalahan,
  pesanSukses,
  muatSemuaSeason,
  buatSeasonBaru,
  perbaruiStatusSeason,
  hapusSeason
} = useSeason()

const tampilFormBuat = ref(false)
const inputNamaTurnamen = ref('Peak Champions League')
const inputLabelSeason = ref('')
const sedangMenyimpan = ref(false)

onMounted(() => {
  muatSemuaSeason()
})

async function tanganiBuatSeason() {
  if (!inputLabelSeason.value.trim()) return
  sedangMenyimpan.value = true
  const res = await buatSeasonBaru(inputNamaTurnamen.value, inputLabelSeason.value)
  sedangMenyimpan.value = false
  if (res) {
    inputLabelSeason.value = ''
    tampilFormBuat.value = false
  }
}

async function tanganiGantiStatus(season) {
  const statusTarget = season.status === 'completed' ? 'knockout' : 'completed'
  await perbaruiStatusSeason(season.id, statusTarget)
}

async function tanganiHapusSeason(season) {
  if (confirm(`Yakin ingin menghapus ${season.name} (${season.season})?`)) {
    await hapusSeason(season.id)
  }
}

function formatTanggal(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Panel -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
      <div>
        <h2 class="text-lg font-semibold text-ink-900 flex items-center gap-2">
          <Calendar class="w-5 h-5 text-ucl-600" />
          Manajemen Season Turnamen
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Kelola edisi musim turnamen (bebas dibuat kapan saja oleh panitia).
        </p>
      </div>

      <div class="flex items-center gap-2">
        <TombolDasar
          @click="tampilFormBuat = !tampilFormBuat"
          :variant="tampilFormBuat ? 'sekunder' : 'primer'"
          ukuran="kecil"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>{{ tampilFormBuat ? 'Tutup Form' : 'Buat Season Baru' }}</span>
        </TombolDasar>
      </div>
    </div>

    <!-- Alert Notifikasi -->
    <div v-if="pesanSukses" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 shrink-0" />
      <span>{{ pesanSukses }}</span>
    </div>

    <div v-if="pesanKesalahan" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ pesanKesalahan }}</span>
    </div>

    <!-- Form Buat Season Baru (Toggleable) -->
    <div
      v-if="tampilFormBuat"
      class="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4"
    >
      <h3 class="text-sm font-semibold text-ink-900">Form Season Turnamen Baru</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Nama Turnamen</label>
          <input
            v-model="inputNamaTurnamen"
            type="text"
            placeholder="Contoh: Peak Champions League"
            class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-ink-900 focus:outline-none focus:border-ucl-500"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Label / Edisi Season <span class="text-red-500">*</span>
          </label>
          <input
            v-model="inputLabelSeason"
            type="text"
            placeholder="Contoh: Season 1, Season 2, S2026-B, dll."
            class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-ink-900 focus:outline-none focus:border-ucl-500"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2">
        <TombolDasar
          @click="tampilFormBuat = false"
          variant="sekunder"
          ukuran="kecil"
        >
          Batal
        </TombolDasar>

        <TombolDasar
          @click="tanganiBuatSeason"
          variant="primer"
          ukuran="kecil"
          :disabled="sedangMenyimpan || !inputLabelSeason.trim()"
        >
          <span>{{ sedangMenyimpan ? 'Menyimpan...' : 'Simpan Season' }}</span>
        </TombolDasar>
      </div>
    </div>

    <!-- Banner Season Aktif Saat Ini -->
    <div
      v-if="seasonAktif"
      class="bg-white border border-gold-300/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 shrink-0">
          <Trophy class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-100 px-2 py-0.5 rounded">
              Season Aktif
            </span>
            <span class="text-xs text-slate-400 font-medium">{{ seasonAktif.name }}</span>
          </div>
          <h3 class="text-base font-bold text-ink-900 mt-0.5">
            {{ seasonAktif.season }}
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <span
          class="text-xs px-2.5 py-1 rounded-full font-medium"
          :class="seasonAktif.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
        >
          {{ seasonAktif.status === 'completed' ? 'Selesai' : 'Sedang Berjalan' }}
        </span>
      </div>
    </div>

    <!-- Tabel Daftar Semua Season -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <span class="text-xs font-semibold text-ink-900">Riwayat Seluruh Season ({{ daftarSeason.length }})</span>
      </div>

      <!-- Mobile List -->
      <div class="sm:hidden divide-y divide-slate-100">
        <div
          v-if="daftarSeason.length === 0"
          class="p-6 text-center text-xs text-slate-400"
        >
          Belum ada season yang dibuat.
        </div>

        <div
          v-for="s in daftarSeason"
          :key="s.id"
          class="p-4 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-ink-900">{{ s.season }}</span>
            <span
              class="text-[10px] px-2 py-0.5 rounded font-semibold uppercase"
              :class="s.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'"
            >
              {{ s.status === 'completed' ? 'Selesai' : 'Berjalan' }}
            </span>
          </div>
          <div class="text-xs text-slate-500">{{ s.name }} · {{ formatTanggal(s.created_at) }}</div>

          <div class="flex items-center gap-2 pt-1">
            <button
              @click="tanganiGantiStatus(s)"
              class="text-xs text-ucl-600 font-semibold hover:underline"
            >
              {{ s.status === 'completed' ? 'Set Berjalan' : 'Set Selesai' }}
            </button>
            <span class="text-slate-300">·</span>
            <button
              @click="tanganiHapusSeason(s)"
              class="text-xs text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <table class="hidden sm:table w-full text-left">
        <thead>
          <tr class="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th class="py-3 px-4">Season</th>
            <th class="py-3 px-4">Turnamen</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4">Tanggal Dibuat</th>
            <th class="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr v-if="daftarSeason.length === 0">
            <td colspan="5" class="py-8 text-center text-xs text-slate-400">
              Belum ada season. Buat season baru di atas.
            </td>
          </tr>

          <tr
            v-for="s in daftarSeason"
            :key="s.id"
            class="hover:bg-slate-50/60 transition-colors"
          >
            <td class="py-3.5 px-4 font-bold text-ink-900 text-xs">
              {{ s.season }}
            </td>
            <td class="py-3.5 px-4 text-xs text-slate-600">
              {{ s.name }}
            </td>
            <td class="py-3.5 px-4">
              <span
                class="text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-block"
                :class="s.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
              >
                {{ s.status === 'completed' ? 'Selesai' : 'Aktif (Knockout)' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-xs text-slate-400">
              {{ formatTanggal(s.created_at) }}
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="inline-flex items-center gap-2">
                <TombolDasar
                  @click="tanganiGantiStatus(s)"
                  variant="sekunder"
                  ukuran="kecil"
                >
                  <span>{{ s.status === 'completed' ? 'Buka Kembali' : 'Tandai Selesai' }}</span>
                </TombolDasar>

                <button
                  @click="tanganiHapusSeason(s)"
                  class="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Hapus Season"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
