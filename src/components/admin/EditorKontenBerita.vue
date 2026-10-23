<script setup>
import { ref } from 'vue'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  List,
  Image as ImageIcon,
  Upload,
  Link,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-vue-next'
import { api } from '../../lib/api.js'
import { kompresGambar, validasiUkuranGambar } from '../../lib/gambar.js'
import { parseKontenBerita } from '../../lib/parserBerita.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const inputFotoRef = ref(null)
const sedangUpload = ref(false)
const dialogFotoTerbuka = ref(false)
const modePratinjau = ref(false)

const formFoto = ref({
  tipe: 'upload', // 'upload' | 'url'
  url: '',
  alt: ''
})

function sisipkanFormat(prefix, suffix = '', defaultText = '') {
  const el = textareaRef.value
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd
  const val = props.modelValue || ''
  const selected = val.substring(start, end) || defaultText

  const replacement = `${prefix}${selected}${suffix}`
  const newVal = val.substring(0, start) + replacement + val.substring(end)
  emit('update:modelValue', newVal)

  setTimeout(() => {
    el.focus()
    const newCursor = start + prefix.length + selected.length
    el.setSelectionRange(start + prefix.length, newCursor)
  }, 10)
}

function bukaDialogFoto() {
  formFoto.value = { tipe: 'upload', url: '', alt: '' }
  dialogFotoTerbuka.value = true
}

async function handleFileFotoDipilih(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const valid = validasiUkuranGambar(file, 4 * 1024 * 1024)
  if (!valid.valid) {
    alert(valid.pesan)
    return
  }

  sedangUpload.value = true
  try {
    const base64 = await kompresGambar(file, {
      maksLebar: 1200,
      maksTinggi: 900,
      kualitas: 0.85,
      format: 'image/jpeg'
    })

    const res = await api.uploadNewsImage(base64)
    if (res?.url) {
      formFoto.value.url = res.url
      if (!formFoto.value.alt) {
        formFoto.value.alt = file.name.replace(/\.[^/.]+$/, '')
      }
    }
  } catch (err) {
    alert('Gagal mengunggah foto: ' + (err.message || 'Error'))
  } finally {
    sedangUpload.value = false
    if (inputFotoRef.value) inputFotoRef.value.value = ''
  }
}

function masukkanFotoKeKonten() {
  if (!formFoto.value.url.trim()) {
    alert('Mohon pilih file foto atau masukkan tautan URL foto terlebih dahulu.')
    return
  }

  const alt = formFoto.value.alt.trim() || 'Foto Dokumentasi PCL'
  const url = formFoto.value.url.trim()
  const tagGambar = `\n\n![${alt}](${url})\n\n`

  const el = textareaRef.value
  if (!el) {
    emit('update:modelValue', (props.modelValue || '') + tagGambar)
  } else {
    const start = el.selectionStart
    const val = props.modelValue || ''
    const newVal = val.substring(0, start) + tagGambar + val.substring(start)
    emit('update:modelValue', newVal)
  }

  dialogFotoTerbuka.value = false
}
</script>

<template>
  <div class="border border-slate-300 rounded-xl overflow-hidden focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20 transition-all bg-white">
    <!-- Toolbar Format Teks & Foto -->
    <div class="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50 border-b border-slate-200">
      <div class="flex flex-wrap items-center gap-1">
        <!-- Bold -->
        <button
          type="button"
          @click="sisipkanFormat('**', '**', 'teks tebal')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Tebal / Bold (**teks**)"
        >
          <Bold class="w-4 h-4" />
        </button>

        <!-- Italic -->
        <button
          type="button"
          @click="sisipkanFormat('*', '*', 'teks miring')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Miring / Italic (*teks*)"
        >
          <Italic class="w-4 h-4" />
        </button>

        <!-- Strike -->
        <button
          type="button"
          @click="sisipkanFormat('~~', '~~', 'teks coret')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Coret / Strikethrough (~~teks~~)"
        >
          <Strikethrough class="w-4 h-4" />
        </button>

        <span class="w-px h-4 bg-slate-300 mx-1"></span>

        <!-- Heading 2 -->
        <button
          type="button"
          @click="sisipkanFormat('\n## ', '\n', 'Sub Judul Besar')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Sub Judul Utama (##)"
        >
          <Heading2 class="w-4 h-4" />
        </button>

        <!-- Heading 3 -->
        <button
          type="button"
          @click="sisipkanFormat('\n### ', '\n', 'Sub Judul Bagian')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Sub Judul Bagian (###)"
        >
          <Heading3 class="w-4 h-4" />
        </button>

        <!-- Blockquote -->
        <button
          type="button"
          @click="sisipkanFormat('\n> ', '\n', 'Kutipan penting...')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Kutipan / Blockquote (>)"
        >
          <Quote class="w-4 h-4" />
        </button>

        <!-- List -->
        <button
          type="button"
          @click="sisipkanFormat('\n- ', '\n', 'Poin catatan')"
          class="p-1.5 rounded-lg text-slate-700 hover:text-ink-900 hover:bg-slate-200/70 transition-colors"
          title="Daftar Poin (-)"
        >
          <List class="w-4 h-4" />
        </button>

        <span class="w-px h-4 bg-slate-300 mx-1"></span>

        <!-- Tombol Sisipkan Foto Fleksibel -->
        <button
          type="button"
          @click="bukaDialogFoto"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ucl-50 hover:bg-ucl-100 text-ucl-700 font-semibold text-xs transition-colors"
          title="Sisipkan Foto ke dalam berita"
        >
          <ImageIcon class="w-3.5 h-3.5" />
          <span>+ Sisipkan Foto</span>
        </button>
      </div>

      <!-- Toggle Pratinjau Teks -->
      <button
        type="button"
        @click="modePratinjau = !modePratinjau"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
      >
        <component :is="modePratinjau ? EyeOff : Eye" class="w-3.5 h-3.5" />
        <span>{{ modePratinjau ? 'Tutup Pratinjau' : 'Pratinjau' }}</span>
      </button>
    </div>

    <!-- Area Teks Editor / Pratinjau -->
    <div class="relative">
      <textarea
        v-show="!modePratinjau"
        ref="textareaRef"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        rows="9"
        placeholder="Tulis naskah lengkap berita turnamen di sini. Gunakan tombol di atas untuk menebalkan (**teks**), memiringkan (*teks*), atau menyisipkan foto..."
        class="w-full p-3.5 text-sm text-ink-900 placeholder-slate-400 outline-none font-sans leading-relaxed resize-y min-h-[180px]"
        required
      ></textarea>

      <!-- Panel Live Pratinjau Teks & Foto -->
      <div
        v-if="modePratinjau"
        class="p-4 bg-slate-50/50 min-h-[180px] max-h-[350px] overflow-y-auto space-y-3 text-sm text-ink-800 leading-relaxed"
      >
        <div v-if="!modelValue" class="text-xs text-slate-400 italic">
          Belum ada teks naskah untuk dipratinjau.
        </div>
        <template v-else>
          <div v-for="(blok, bIdx) in parseKontenBerita(modelValue)" :key="bIdx">
            <h2 v-if="blok.tipe === 'heading' && blok.level === 2" class="text-base font-bold text-ink-900 mt-2 mb-1" v-html="blok.html"></h2>
            <h3 v-else-if="blok.tipe === 'heading'" class="text-sm font-bold text-ink-900 mt-2 mb-1" v-html="blok.html"></h3>
            <blockquote v-else-if="blok.tipe === 'kutipan'" class="border-l-4 border-ucl-500 pl-3 italic text-slate-600 text-xs my-2" v-html="blok.html"></blockquote>
            <ul v-else-if="blok.tipe === 'list'" class="list-disc pl-5 space-y-1 text-xs text-ink-800">
              <li v-for="(item, iIdx) in blok.items" :key="iIdx" v-html="item"></li>
            </ul>
            <div v-else-if="blok.tipe === 'gambar'" class="my-2 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 max-w-sm">
              <img :src="blok.url" :alt="blok.alt" class="max-h-48 w-auto mx-auto rounded object-contain" />
              <div class="text-[10px] text-center text-slate-500 mt-1 italic">{{ blok.alt }}</div>
            </div>
            <p v-else class="text-xs sm:text-sm leading-relaxed" v-html="blok.html"></p>
          </div>
        </template>
      </div>
    </div>

    <!-- Modal Mini Sisipkan Foto -->
    <div
      v-if="dialogFotoTerbuka"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 class="text-sm font-bold text-ink-900 flex items-center gap-2">
            <ImageIcon class="w-4 h-4 text-ucl-600" />
            <span>Sisipkan Foto ke Konten</span>
          </h4>
          <button
            type="button"
            @click="dialogFotoTerbuka = false"
            class="text-xs font-semibold px-2 py-1 rounded text-slate-400 hover:text-ink-900 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>

        <!-- Mode Pilihan Foto: Upload vs URL -->
        <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            @click="formFoto.tipe = 'upload'"
            class="flex-1 py-1.5 rounded-lg transition-colors cursor-pointer"
            :class="formFoto.tipe === 'upload' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            Unggah Berkas
          </button>
          <button
            type="button"
            @click="formFoto.tipe = 'url'"
            class="flex-1 py-1.5 rounded-lg transition-colors cursor-pointer"
            :class="formFoto.tipe === 'url' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
          >
            Tautan URL
          </button>
        </div>

        <!-- Opsi 1: Upload File -->
        <div v-if="formFoto.tipe === 'upload'" class="space-y-3">
          <label class="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-ucl-500 hover:bg-slate-50 cursor-pointer transition">
            <Loader2 v-if="sedangUpload" class="w-6 h-6 text-ucl-600 animate-spin" />
            <Upload v-else class="w-6 h-6 text-ucl-600" />
            <span class="text-xs font-medium text-slate-600">
              {{ sedangUpload ? 'Mengunggah & mengompres gambar...' : 'Klik untuk pilih foto dari perangkat' }}
            </span>
            <input
              ref="inputFotoRef"
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="sedangUpload"
              @change="handleFileFotoDipilih"
            />
          </label>
        </div>

        <!-- Opsi 2: URL -->
        <div v-else class="space-y-2">
          <label class="block text-xs font-semibold text-ink-700">Tautan Gambar (URL Web)</label>
          <input
            v-model="formFoto.url"
            type="url"
            placeholder="https://images.unsplash.com/..."
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-ink-900 outline-none focus:border-ucl-500"
          />
        </div>

        <!-- Preview URL yang terpilih -->
        <div v-if="formFoto.url" class="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <img :src="formFoto.url" alt="Preview" class="w-12 h-12 rounded object-cover border border-slate-200 shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="text-[11px] font-semibold text-emerald-700">Gambar siap disisipkan</div>
            <div class="text-[10px] text-slate-400 truncate">{{ formFoto.url }}</div>
          </div>
        </div>

        <!-- Caption / Alt Teks -->
        <div>
          <label class="block text-xs font-semibold text-ink-700 mb-1">Keterangan Foto (Caption / Alt Text)</label>
          <input
            v-model="formFoto.alt"
            type="text"
            placeholder="Contoh: Suasana selebrasi gol menit ke-89"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-ink-900 outline-none focus:border-ucl-500"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="dialogFotoTerbuka = false"
            class="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="!formFoto.url || sedangUpload"
            @click="masukkanFotoKeKonten"
            class="px-4 py-2 rounded-xl bg-ucl-600 hover:bg-ucl-700 text-white text-xs font-bold disabled:opacity-50 transition cursor-pointer"
          >
            Sisipkan ke Naskah
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
