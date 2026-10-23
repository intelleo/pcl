<script setup>
import { ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { kompresGambar, validasiUkuranGambar } from '../../lib/gambar.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const tipeInputGambar = ref('upload') // 'upload' | 'url'
const fileInputRef = ref(null)

async function handleUploadGambar(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const cek = validasiUkuranGambar(file)
  if (!cek.valid) {
    alert(cek.pesan)
    return
  }
  try {
    const hasil = await kompresGambar(file, { maksLebar: 1200, maksTinggi: 800 })
    emit('update:modelValue', hasil)
  } catch (err) {
    alert('Gagal memproses gambar: ' + err.message)
  }
}

function hapusGambar() {
  emit('update:modelValue', '')
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
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
          v-if="modelValue"
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
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        type="url"
        placeholder="https://images.unsplash.com/..."
        class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
      />
      <button
        v-if="modelValue"
        type="button"
        @click="hapusGambar"
        class="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 cursor-pointer"
        title="Hapus Gambar"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Preview Mini Gambar -->
    <div v-if="modelValue" class="relative w-full max-h-56 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-1">
      <img :src="modelValue" alt="Preview Cover" class="max-h-52 w-auto object-contain mx-auto rounded" loading="lazy" decoding="async" />
    </div>
  </div>
</template>
