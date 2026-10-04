<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Shield, Plus, X, Edit3, Trash2, Users, Copy, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { api } from '../../lib/api.js'
import TombolDasar from '../umum/TombolDasar.vue'
import ModalDialog from '../umum/ModalDialog.vue'
import ModalKelolaPemain from './ModalKelolaPemain.vue'

const props = defineProps({
  daftarTim: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tambahTim', 'updateTim', 'hapusTim', 'dataBerubah'])

// === Season Management ===
const daftarSeason = ref([])
const seasonTerpilihId = ref(null)
const modalSalinTerbuka = ref(false)
const seasonAsalId = ref(null)
const sedangMenyalin = ref(false)
const pesanSuksesSalin = ref(null)
const pesanErrorSalin = ref(null)

async function muatDaftarSeason() {
  try {
    const data = await api.getTournaments()
    daftarSeason.value = data || []
    const aktif = (data || []).find((s) => s.status !== 'completed')
    seasonTerpilihId.value = aktif?.id || (data || [])[0]?.id || null
  } catch {
    daftarSeason.value = []
  }
}

onMounted(() => {
  muatDaftarSeason()
})

const timTerfilter = computed(() => {
  if (!seasonTerpilihId.value) return props.daftarTim
  return props.daftarTim.filter((t) => t.tournament_id === seasonTerpilihId.value)
})

const opsiSeasonAsal = computed(() => {
  return daftarSeason.value.filter((s) => s.id !== seasonTerpilihId.value)
})

async function salinTimDariMusimLain() {
  if (!seasonAsalId.value || !seasonTerpilihId.value) return
  sedangMenyalin.value = true
  pesanSuksesSalin.value = null
  pesanErrorSalin.value = null

  try {
    const res = await api.copyTeamsFromSeason({
      from_tournament_id: seasonAsalId.value,
      to_tournament_id: seasonTerpilihId.value
    })
    pesanSuksesSalin.value = res.message || 'Klub berhasil disalin!'
    emit('dataBerubah')
    setTimeout(() => {
      modalSalinTerbuka.value = false
      pesanSuksesSalin.value = null
    }, 1500)
  } catch (err) {
    pesanErrorSalin.value = `Gagal: ${err.message}`
  } finally {
    sedangMenyalin.value = false
  }
}

const formTerbuka = ref(false)
const modeEdit = ref(false)
const idTimEdit = ref(null)

const modalPemainTerbuka = ref(false)
const timTerpilihPemain = ref(null)

const namaTim = ref('')
const shortName = ref('')
const managerName = ref('')
const logoUrl = ref('')

function resetForm() {
  namaTim.value = ''
  shortName.value = ''
  managerName.value = ''
  logoUrl.value = ''
  modeEdit.value = false
  idTimEdit.value = null
  formTerbuka.value = false
}

function bukaFormBikin() {
  resetForm()
  formTerbuka.value = true
}

function editTim(t) {
  idTimEdit.value = t.id
  namaTim.value = t.name
  shortName.value = t.short_name
  managerName.value = t.manager_name || ''
  logoUrl.value = t.logo_url || ''
  modeEdit.value = true
  formTerbuka.value = true
}

function kelolaPemainTim(t) {
  timTerpilihPemain.value = t
  modalPemainTerbuka.value = true
}

function submit() {
  if (!namaTim.value || !shortName.value) return
  if (modeEdit.value && idTimEdit.value) {
    emit('updateTim', {
      id: idTimEdit.value,
      name: namaTim.value,
      short_name: shortName.value.toUpperCase(),
      manager_name: managerName.value,
      logo_url: logoUrl.value.trim() || null,
      tournament_id: seasonTerpilihId.value || null
    })
  } else {
    emit('tambahTim', {
      name: namaTim.value,
      short_name: shortName.value.toUpperCase(),
      manager_name: managerName.value,
      logo_url: logoUrl.value.trim() || null,
      tournament_id: seasonTerpilihId.value || null
    })
  }
  resetForm()
}

function konfirmasiHapus(t) {
  if (confirm(`Yakin ingin menghapus tim ${t.name}?`)) {
    emit('hapusTim', t.id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Control Bar: Filter Season & Aksi Cepat -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-ink-900 shrink-0">Musim Turnamen:</label>
        <div v-if="daftarSeason.length > 0" class="relative">
          <select
            v-model="seasonTerpilihId"
            class="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-ink-900 cursor-pointer hover:border-ucl-400 focus:border-ucl-500 outline-none transition-colors min-w-[170px]"
          >
            <option v-for="s in daftarSeason" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.season }}){{ s.status !== 'completed' ? ' — Aktif' : '' }}
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="opsiSeasonAsal.length > 0"
          type="button"
          @click="modalSalinTerbuka = true"
          class="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          title="Salin 16 Klub & Skuad dari Musim Sebelumnya"
        >
          <Copy class="w-3.5 h-3.5" />
          <span>Salin Tim dari Musim Lalu</span>
        </button>

        <button
          @click="bukaFormBikin"
          class="px-3 py-1.5 rounded-lg bg-ucl-600 text-white text-xs font-semibold hover:bg-ucl-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <component :is="formTerbuka ? X : Plus" class="w-3.5 h-3.5" />
          {{ formTerbuka ? 'Tutup Form' : 'Tambah Klub Baru' }}
        </button>
      </div>
    </div>

    <!-- Form Tambah/Edit Tim -->
    <form
      v-if="formTerbuka"
      @submit.prevent="submit"
      class="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-card anim-muncul"
    >
      <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <Shield class="w-4 h-4 text-ucl-600" />
          {{ modeEdit ? 'Edit Data Klub' : 'Tambah Klub Peserta Baru' }}
        </h3>
        <button
          type="button"
          @click="resetForm"
          class="p-1 rounded-lg text-slate-400 hover:text-ink-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Nama klub</label>
          <input
            v-model="namaTim"
            type="text"
            placeholder="contoh: Chelsea FC"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Tag Tim (Maks 3 Huruf)</label>
          <input
            v-model="shortName"
            type="text"
            maxlength="3"
            placeholder="CHE"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Manager / Kapten</label>
          <input
            v-model="managerName"
            type="text"
            placeholder="Manager / Kapten Tim"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">URL Logo Klub (Opsional)</label>
          <input
            v-model="logoUrl"
            type="url"
            placeholder="https://..."
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
        <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat">
          {{ modeEdit ? 'Perbarui Data Klub' : 'Simpan Tim Baru' }}
        </TombolDasar>
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Batal
        </button>
      </div>
    </form>

    <!-- Preview Tabel Klub -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h4 class="font-semibold text-xs text-ink-900">
          Daftar Klub Musim Terpilih ({{ timTerfilter.length }} Tim)
        </h4>
      </div>

      <div v-if="timTerfilter.length === 0" class="text-center py-12 space-y-3">
        <Shield class="w-8 h-8 text-slate-400 mx-auto" />
        <p class="text-xs font-semibold text-ink-900">Belum Ada Klub di Musim Ini</p>
        <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
          Tambahkan klub baru secara manual atau gunakan tombol "Salin Tim dari Musim Lalu" untuk mengimpor klub.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
              <th class="py-2.5 px-4">Klub</th>
              <th class="py-2.5 px-4">Grup</th>
              <th class="py-2.5 px-4">Manager / Kapten</th>
              <th class="py-2.5 px-4 text-right">Aksi &amp; Skuad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in timTerfilter" :key="t.id" class="hover:bg-slate-50 transition-colors">
              <td class="py-2.5 px-4 font-semibold text-ink-900">
                <button
                  type="button"
                  @click="kelolaPemainTim(t)"
                  class="flex items-center gap-2.5 text-left hover:text-ucl-600 transition-colors cursor-pointer"
                  title="Klik untuk kelola pemain & statistik klub ini"
                >
                  <img
                    v-if="t.logo_url"
                    :src="t.logo_url"
                    :alt="t.name"
                    class="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <span
                    v-else
                    class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-[9px] font-bold tracking-wider flex items-center justify-center text-navy-800 shrink-0"
                  >
                    {{ t.short_name }}
                  </span>
                  <span class="truncate font-semibold underline decoration-slate-300 underline-offset-2">{{ t.name }}</span>
                </button>
              </td>
              <td class="py-2.5 px-4 text-slate-600">{{ t.group_name || 'Belum Ditentukan' }}</td>
              <td class="py-2.5 px-4 text-slate-500">{{ t.manager_name || '-' }}</td>
              <td class="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button
                  type="button"
                  @click="kelolaPemainTim(t)"
                  class="px-2.5 py-1 rounded bg-blue-50 text-ucl-700 hover:bg-blue-100 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 border border-blue-200/60"
                  title="Lihat, Edit Pemain & Atur Statistik (Gol, Assist, Pass, Def, MVP)"
                >
                  <Users class="w-3.5 h-3.5 text-ucl-600" />
                  <span>Pemain &amp; Stats</span>
                </button>
                <button
                  type="button"
                  @click="editTim(t)"
                  class="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:text-ucl-600 hover:bg-ucl-50 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Edit Klub"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  @click="konfirmasiHapus(t)"
                  class="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Hapus Klub"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Salin Tim dari Musim Lain -->
    <ModalDialog
      :terbuka="modalSalinTerbuka"
      @tutup="modalSalinTerbuka = false"
      judul="Salin Klub dari Musim Sebelumnya"
      lebarMaksimal="max-w-md"
    >
      <div class="space-y-4">
        <p class="text-xs text-slate-600">
          Pilih musim asal untuk menyalin seluruh klub dan daftar pemainnya ke musim ini. Statistik gol dan assist pemain akan otomatis di-reset ke 0.
        </p>

        <div v-if="pesanSuksesSalin" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 shrink-0" />
          <span>{{ pesanSuksesSalin }}</span>
        </div>

        <div v-if="pesanErrorSalin" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ pesanErrorSalin }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-900 mb-1.5">Musim Sumber (Asal)</label>
          <select
            v-model="seasonAsalId"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-ink-900 outline-none focus:border-ucl-500"
          >
            <option :value="null" disabled>Pilih Musim Asal...</option>
            <option v-for="s in opsiSeasonAsal" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.season }})
            </option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="modalSalinTerbuka = false"
            class="px-3.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Batal
          </button>
          <TombolDasar
            varian="gold"
            :sedangMemuat="sedangMenyalin"
            :disabled="!seasonAsalId"
            @click="salinTimDariMusimLain"
          >
            <Copy class="w-3.5 h-3.5 mr-1.5" />
            Salin ke Musim Ini
          </TombolDasar>
        </div>
      </div>
    </ModalDialog>

    <!-- Modal Kelola Pemain & Statistik -->
    <ModalKelolaPemain
      :terbuka="modalPemainTerbuka"
      :tim="timTerpilihPemain"
      @tutup="modalPemainTerbuka = false"
      @dataBerubah="emit('dataBerubah')"
    />
  </div>
</template>
