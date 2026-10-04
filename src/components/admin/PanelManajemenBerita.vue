<script setup>
import { ref, computed } from 'vue'
import {
  Newspaper,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Calendar,
  User,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  daftarBerita: {
    type: Array,
    default: () => []
  },
  daftarLaga: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tambahBerita', 'updateBerita', 'hapusBerita'])

const formTerbuka = ref(false)
const modeEdit = ref(false)
const idSedangDiedit = ref(null)
const cariTeks = ref('')
const filterKategori = ref('semua')
const tipeInputGambar = ref('upload') // 'upload' | 'url'
const fileInputRef = ref(null)

const form = ref({
  judul: '',
  ringkasan: '',
  konten: '',
  kategori: 'turnamen',
  tag: 'MATCH RECAP',
  penulis: 'Redaksi PCL',
  gambar_url: '',
  waktu_baca: '3 min read',
  terkait_match_id: ''
})

function handleUploadGambar(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran file gambar maksimal 2MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.gambar_url = e.target.result
  }
  reader.readAsDataURL(file)
}

function hapusGambar() {
  form.value.gambar_url = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const opsiTag = [
  'MATCH RECAP',
  'TACTICAL REVIEW',
  'DEFENSIVE MASTERCLASS',
  'TOURNAMENT PREVIEW',
  'OFFICIAL STATEMENT',
  'TRANSFER & SQUAD'
]

const opsiKategori = [
  { id: 'turnamen', label: 'Turnamen' },
  { id: 'taktik', label: 'Taktik' },
  { id: 'rekap', label: 'Rekap Laga' },
  { id: 'klub', label: 'Klub' }
]

function resetForm() {
  modeEdit.value = false
  idSedangDiedit.value = null
  formTerbuka.value = false
  form.value = {
    judul: '',
    ringkasan: '',
    konten: '',
    kategori: 'turnamen',
    tag: 'MATCH RECAP',
    penulis: 'Redaksi PCL',
    gambar_url: '',
    waktu_baca: '3 min read',
    terkait_match_id: ''
  }
}

function handleEdit(item) {
  modeEdit.value = true
  idSedangDiedit.value = item.id
  formTerbuka.value = true
  form.value = {
    judul: item.judul || '',
    ringkasan: item.ringkasan || '',
    konten: item.konten || '',
    kategori: item.kategori || 'turnamen',
    tag: item.tag || 'MATCH RECAP',
    penulis: item.penulis || 'Redaksi PCL',
    gambar_url: item.gambar_url || '',
    waktu_baca: item.waktu_baca || '3 min read',
    terkait_match_id: item.terkait_match_id || ''
  }
  window.scrollTo({ top: 300, behavior: 'smooth' })
}

function submitForm() {
  if (!form.value.judul.trim() || !form.value.konten.trim()) return

  const payload = {
    judul: form.value.judul.trim(),
    ringkasan: form.value.ringkasan.trim(),
    konten: form.value.konten.trim(),
    kategori: form.value.kategori,
    tag: form.value.tag,
    penulis: form.value.penulis.trim() || 'Redaksi PCL',
    gambar_url: form.value.gambar_url.trim() || null,
    waktu_baca: form.value.waktu_baca.trim() || '3 min read',
    terkait_match_id: form.value.terkait_match_id || null
  }

  if (modeEdit.value && idSedangDiedit.value) {
    emit('updateBerita', { id: idSedangDiedit.value, ...payload })
  } else {
    emit('tambahBerita', payload)
  }

  resetForm()
}

function konfirmasiHapus(id, judul) {
  if (confirm(`Yakin ingin menghapus berita "${judul}"?`)) {
    emit('hapusBerita', id)
  }
}

const beritaTersaring = computed(() => {
  return props.daftarBerita.filter(b => {
    const cocokKategori = filterKategori.value === 'semua' || b.kategori === filterKategori.value || b.tag === filterKategori.value
    const query = cariTeks.value.toLowerCase().trim()
    const cocokTeks = !query || b.judul?.toLowerCase().includes(query) || b.ringkasan?.toLowerCase().includes(query)
    return cocokKategori && cocokTeks
  })
})
</script>

<template>
  <div class="space-y-8">
    <!-- Form Input / Edit Berita -->
    <div v-if="formTerbuka" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 class="font-display text-base font-semibold text-ink-900 flex items-center gap-2">
            <Newspaper class="w-5 h-5 text-ucl-600" />
            {{ modeEdit ? 'Edit Publikasi Berita' : 'Tulis & Publikasikan Berita Baru' }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ modeEdit ? 'Perbarui informasi konten artikel berita turnamen.' : 'Buat artikel ulasan, preview turnamen, atau pengumuman resmi PCL.' }}
          </p>
        </div>

        <button
          @click="resetForm"
          type="button"
          class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          {{ modeEdit ? 'Batal Edit' : 'Tutup' }}
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4 text-left">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Judul Artikel Berita</label>
            <input
              v-model="form.judul"
              type="text"
              placeholder="Contoh: Real Madrid Tundukkan Man City Lewat Drama Adu Penalti"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Tag Lencana</label>
            <select
              v-model="form.tag"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
            >
              <option v-for="t in opsiTag" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Kategori</label>
            <select
              v-model="form.kategori"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
            >
              <option v-for="k in opsiKategori" :key="k.id" :value="k.id">{{ k.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Nama Penulis</label>
            <input
              v-model="form.penulis"
              type="text"
              placeholder="Redaksi PCL"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Estimasi Baca</label>
            <input
              v-model="form.waktu_baca"
              type="text"
              placeholder="3 min read"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            />
          </div>
        </div>

        <!-- Cover Image & Match Link -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Input Gambar (Upload File / URL) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-ink-600">Gambar Sampul Berita (Opsional)</label>
              <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px] font-medium">
                <button
                  type="button"
                  @click="tipeInputGambar = 'upload'"
                  class="px-2 py-0.5 rounded cursor-pointer transition-colors"
                  :class="tipeInputGambar === 'upload' ? 'bg-white text-ink-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-ink-900'"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  @click="tipeInputGambar = 'url'"
                  class="px-2 py-0.5 rounded cursor-pointer transition-colors"
                  :class="tipeInputGambar === 'url' ? 'bg-white text-ink-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-ink-900'"
                >
                  URL Link
                </button>
              </div>
            </div>

            <!-- Upload File Mode -->
            <div v-if="tipeInputGambar === 'upload'" class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg hover:border-ucl-500 hover:bg-slate-50 cursor-pointer text-xs text-slate-600 transition">
                  <Upload class="w-4 h-4 text-ucl-600" />
                  <span>Pilih Gambar (Maks 2MB)</span>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleUploadGambar"
                  />
                </label>
                <button
                  v-if="form.gambar_url"
                  type="button"
                  @click="hapusGambar"
                  class="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 cursor-pointer"
                  title="Hapus Gambar"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Input URL Mode -->
            <div v-else class="flex items-center gap-2">
              <input
                v-model="form.gambar_url"
                type="url"
                placeholder="https://images.unsplash.com/..."
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              />
              <button
                v-if="form.gambar_url"
                type="button"
                @click="hapusGambar"
                class="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 cursor-pointer"
                title="Hapus Gambar"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Preview Mini Gambar -->
            <div v-if="form.gambar_url" class="relative w-full h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
              <img :src="form.gambar_url" alt="Preview Cover" class="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5">Kaitkan Laga Terkait (Opsional)</label>
            <select
              v-model="form.terkait_match_id"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
            >
              <option value="">Tidak ada laga terkait</option>
              <option v-for="m in daftarLaga" :key="m.id" :value="m.id">
                [{{ m.group?.name || m.stage }}] {{ m.home_team?.name }} vs {{ m.away_team?.name }} ({{ m.home_score ?? 0 }}-{{ m.away_score ?? 0 }})
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Ringkasan Singkat (Lead Paragraph)</label>
          <textarea
            v-model="form.ringkasan"
            rows="2"
            placeholder="Ringkasan 1-2 kalimat pengantar artikel..."
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Konten Artikel Lengkap</label>
          <textarea
            v-model="form.konten"
            rows="6"
            placeholder="Tulis naskah lengkap berita turnamen di sini..."
            class="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 font-sans leading-relaxed"
            required
          ></textarea>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat">
            {{ modeEdit ? 'Simpan Perubahan Berita' : 'Terbitkan Berita Sekarang' }}
          </TombolDasar>
          <button
            v-if="modeEdit"
            @click="resetForm"
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
        </div>
      </form>
    </div>

    <!-- Tabel / Daftar Berita Terbit -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 class="font-display text-sm font-semibold text-ink-900">Daftar Publikasi Berita ({{ daftarBerita.length }})</h4>
          <p class="text-xs text-slate-500">Kelola artikel berita yang tayang di portal PCL.</p>
        </div>

        <!-- Tombol Buat Berita + Filter & Search -->
        <div class="flex items-center gap-2 max-w-lg w-full sm:w-auto">
          <button
            v-if="!formTerbuka"
            @click="formTerbuka = true; modeEdit = false"
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ucl-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Plus class="w-3.5 h-3.5" />
            Buat Berita
          </button>

          <div class="relative flex-1 sm:w-52">
            <input
              v-model="cariTeks"
              type="text"
              placeholder="Cari judul berita..."
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-ink-900 outline-none focus:bg-white focus:border-ucl-500"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            v-model="filterKategori"
            class="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-ink-900 outline-none focus:bg-white focus:border-ucl-500 cursor-pointer"
          >
            <option value="semua">Semua</option>
            <option value="turnamen">Turnamen</option>
            <option value="taktik">Taktik</option>
            <option value="rekap">Rekap</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <th class="py-3 px-4">Artikel Berita</th>
              <th class="py-3 px-4">Tag / Kategori</th>
              <th class="py-3 px-4">Penulis</th>
              <th class="py-3 px-4">Tanggal</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="beritaTersaring.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 text-xs">
                Tidak ada artikel berita yang cocok.
              </td>
            </tr>
            <tr v-for="b in beritaTersaring" :key="b.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3 px-4 max-w-xs sm:max-w-md">
                <div class="font-semibold text-ink-900 line-clamp-1 mb-0.5">{{ b.judul }}</div>
                <div class="text-[11px] text-slate-500 line-clamp-1">{{ b.ringkasan || b.konten }}</div>
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-ucl-50 text-ucl-700 border border-ucl-100">
                  {{ b.tag || b.kategori || 'Berita' }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-600 whitespace-nowrap">{{ b.penulis || 'Redaksi PCL' }}</td>
              <td class="py-3 px-4 text-slate-400 whitespace-nowrap">
                {{ b.diterbitkan_pada ? new Date(b.diterbitkan_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
              </td>
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                  <router-link
                    :to="`/berita/${b.id}`"
                    target="_blank"
                    class="p-1.5 text-slate-400 hover:text-ucl-600 rounded-lg hover:bg-slate-100"
                    title="Pratinjau Berita"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                  </router-link>
                  <button
                    @click="handleEdit(b)"
                    type="button"
                    class="p-1.5 text-slate-500 hover:text-navy-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Edit Berita"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="konfirmasiHapus(b.id, b.judul)"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Hapus Berita"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
