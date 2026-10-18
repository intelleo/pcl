<script setup>
import { ref, computed, onMounted } from 'vue'
import { KeyRound, Plus, Trash2, CheckCircle2, Copy, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { api } from '../../lib/api.js'
import TombolDasar from '../umum/TombolDasar.vue'

const daftarKeys = ref([])
const sedangMemuat = ref(false)
const sedangGenerate = ref(false)
const pesanSukses = ref(null)
const pesanError = ref(null)

// Form generate
const jumlahBuat = ref(1)
const catatanKey = ref('')
const keyBaruDibuat = ref([])
const kodeTersalin = ref(null)

async function muatDaftarKeys() {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    const data = await api.getBookingKeys()
    daftarKeys.value = data || []
  } catch (err) {
    pesanError.value = 'Gagal memuat booking keys: ' + err.message
  } finally {
    sedangMemuat.value = false
  }
}

async function handleGenerateKeys() {
  sedangGenerate.value = true
  pesanSukses.value = null
  pesanError.value = null
  keyBaruDibuat.value = []

  try {
    const res = await api.generateBookingKeys({
      jumlah: jumlahBuat.value,
      catatan: catatanKey.value
    })
    pesanSukses.value = res.message || 'Key berhasil dibuat!'
    keyBaruDibuat.value = res.keys || []
    catatanKey.value = ''
    jumlahBuat.value = 1
    await muatDaftarKeys()
  } catch (err) {
    pesanError.value = 'Gagal generate key: ' + err.message
  } finally {
    sedangGenerate.value = false
  }
}

async function handleHapusKey(id, key_code) {
  if (!confirm(`Yakin ingin menghapus booking key ${key_code}?`)) return
  try {
    await api.deleteBookingKey(id)
    daftarKeys.value = daftarKeys.value.filter(k => k.id !== id)
  } catch (err) {
    alert('Gagal menghapus key: ' + err.message)
  }
}

async function salinKeClipboard(teks) {
  try {
    await navigator.clipboard.writeText(teks)
    kodeTersalin.value = teks
    setTimeout(() => {
      if (kodeTersalin.value === teks) kodeTersalin.value = null
    }, 2500)
  } catch (e) {
    // Fallback
    const input = document.createElement('input')
    input.value = teks
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    kodeTersalin.value = teks
    setTimeout(() => {
      if (kodeTersalin.value === teks) kodeTersalin.value = null
    }, 2500)
  }
}

function formatTanggal(isoStr) {
  if (!isoStr) return '-'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoStr
  }
}

const totalTersedia = computed(() => daftarKeys.value.filter(k => !k.is_used).length)
const totalTerpakai = computed(() => daftarKeys.value.filter(k => k.is_used).length)

onMounted(muatDaftarKeys)
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-card space-y-5 anim-muncul">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
      <div class="space-y-0.5">
        <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          <KeyRound class="w-4 h-4 text-gold-600" />
          <span>Manajemen Booking Key (Slot Khusus)</span>
        </h3>
        <p class="text-[11px] text-slate-500">
          Buat key rahasia untuk tim yang sudah booking slot agar bisa mendaftar meski form publik ditutup.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Tersedia: {{ totalTersedia }}
        </span>
        <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Terpakai: {{ totalTerpakai }}
        </span>
        <button
          type="button"
          @click="muatDaftarKeys"
          :disabled="sedangMemuat"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-ink-900 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh data"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': sedangMemuat }" />
        </button>
      </div>
    </div>

    <!-- Form Generate Key Baru -->
    <form @submit.prevent="handleGenerateKeys" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div class="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
        <Plus class="w-3.5 h-3.5 text-ucl-600" />
        <span>Buat Key Baru</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div class="sm:col-span-3">
          <label class="block text-[11px] font-semibold text-ink-600 mb-1">Jumlah Key</label>
          <input
            v-model.number="jumlahBuat"
            type="number"
            min="1"
            max="32"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:border-ucl-500 outline-none"
            required
          />
        </div>

        <div class="sm:col-span-6">
          <label class="block text-[11px] font-semibold text-ink-600 mb-1">Catatan / Pemesan (Opsional)</label>
          <input
            v-model="catatanKey"
            type="text"
            placeholder="Contoh: Booking WA Mas Budi / Slot Tim A"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-ink-900 focus:border-ucl-500 outline-none"
          />
        </div>

        <div class="sm:col-span-3">
          <TombolDasar
            tipe="submit"
            varian="gold"
            class="w-full justify-center"
            :sedangMemuat="sedangGenerate"
          >
            Generate Key
          </TombolDasar>
        </div>
      </div>

      <!-- Hasil Generate Baru -->
      <div v-if="keyBaruDibuat.length > 0" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
        <div class="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
          <span>{{ pesanSukses }} Silakan salin dan kirim ke pemesan:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="k in keyBaruDibuat"
            :key="k.id"
            class="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg shadow-2xs"
          >
            <span class="font-mono font-bold text-xs text-emerald-800 tracking-wider">{{ k.key_code }}</span>
            <button
              type="button"
              @click="salinKeClipboard(k.key_code)"
              class="text-emerald-600 hover:text-emerald-800 transition cursor-pointer text-xs"
              title="Salin Key"
            >
              <Copy v-if="kodeTersalin !== k.key_code" class="w-3.5 h-3.5" />
              <span v-else class="text-[10px] font-bold text-emerald-700">Tersalin!</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- Feedback Error -->
    <div v-if="pesanError" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ pesanError }}</span>
    </div>

    <!-- Tabel Daftar Booking Keys -->
    <div class="overflow-x-auto rounded-lg border border-slate-200">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <th class="py-2.5 px-3">Kode Key</th>
            <th class="py-2.5 px-3">Status</th>
            <th class="py-2.5 px-3">Catatan / Pemesan</th>
            <th class="py-2.5 px-3">Digunakan Oleh</th>
            <th class="py-2.5 px-3">Tgl Dibuat</th>
            <th class="py-2.5 px-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="daftarKeys.length === 0">
            <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
              Belum ada key booking yang dibuat. Silakan generate di atas.
            </td>
          </tr>

          <tr
            v-for="item in daftarKeys"
            :key="item.id"
            class="hover:bg-slate-50/70 transition-colors"
          >
            <!-- Kode Key -->
            <td class="py-2.5 px-3">
              <div class="inline-flex items-center gap-2 font-mono font-bold text-xs" :class="item.is_used ? 'text-slate-400 line-through' : 'text-navy-900'">
                <span>{{ item.key_code }}</span>
                <button
                  type="button"
                  @click="salinKeClipboard(item.key_code)"
                  class="text-slate-400 hover:text-ink-900 transition cursor-pointer"
                  title="Salin Key"
                >
                  <Copy v-if="kodeTersalin !== item.key_code" class="w-3.5 h-3.5" />
                  <span v-else class="text-[10px] font-bold text-emerald-600">Tersalin</span>
                </button>
              </div>
            </td>

            <!-- Status -->
            <td class="py-2.5 px-3">
              <span
                v-if="!item.is_used"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"
              >
                Tersedia
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600"
              >
                Sudah Digunakan
              </span>
            </td>

            <!-- Catatan -->
            <td class="py-2.5 px-3 text-slate-600">
              {{ item.catatan || '-' }}
            </td>

            <!-- Digunakan Oleh -->
            <td class="py-2.5 px-3">
              <div v-if="item.is_used" class="space-y-0.5">
                <div class="font-semibold text-ink-900">{{ item.used_by_team_name || 'Tim Pendaftar' }}</div>
                <div class="text-[10px] text-slate-400">{{ formatTanggal(item.used_at) }}</div>
              </div>
              <span v-else class="text-slate-400">-</span>
            </td>

            <!-- Tgl Dibuat -->
            <td class="py-2.5 px-3 text-slate-500 text-[11px]">
              {{ formatTanggal(item.created_at) }}
            </td>

            <!-- Aksi Hapus -->
            <td class="py-2.5 px-3 text-right">
              <button
                type="button"
                @click="handleHapusKey(item.id, item.key_code)"
                class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="Hapus Key"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
