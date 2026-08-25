<script setup>
import { ref } from 'vue'
import { Shield } from 'lucide-vue-next'
import TombolDasar from '../umum/TombolDasar.vue'

defineProps({
  daftarTim: {
    type: Array,
    default: () => []
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tambahTim'])

const namaTim = ref('')
const shortName = ref('')
const managerName = ref('')

function submit() {
  if (!namaTim.value || !shortName.value) return
  emit('tambahTim', {
    name: namaTim.value,
    short_name: shortName.value.toUpperCase(),
    manager_name: managerName.value
  })
  namaTim.value = ''
  shortName.value = ''
  managerName.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <form @submit.prevent="submit" class="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-card">
      <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-ink-900">Tambah klub peserta baru</h3>
        <Shield class="w-4 h-4 text-ucl-600 shrink-0" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Nama klub</label>
          <input
            v-model="namaTim"
            type="text"
            placeholder="contoh: Chelsea FC"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Singkatan (3 huruf)</label>
          <input
            v-model="shortName"
            type="text"
            maxlength="4"
            placeholder="CHE"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Nama manajer</label>
          <input
            v-model="managerName"
            type="text"
            placeholder="Coach Maresca"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
          />
        </div>
      </div>

      <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat">
        Simpan tim baru
      </TombolDasar>
    </form>

    <!-- Preview Tabel Klub -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h4 class="font-semibold text-xs text-ink-900">Daftar Klub Aktif Turnamen ({{ daftarTim.length }} Tim)</h4>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
              <th class="py-2.5 px-4">Klub</th>
              <th class="py-2.5 px-4">Grup</th>
              <th class="py-2.5 px-4">Manajer</th>
              <th class="py-2.5 px-4">Stadion</th>
              <th class="py-2.5 px-4 text-right">OVR</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in daftarTim" :key="t.id" class="hover:bg-slate-50">
              <td class="py-2.5 px-4 font-semibold text-ink-900 flex items-center gap-2">
                <span class="w-6 h-6 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center text-navy-800">
                  {{ t.short_name }}
                </span>
                {{ t.name }}
              </td>
              <td class="py-2.5 px-4 text-slate-600">{{ t.group_name || '-' }}</td>
              <td class="py-2.5 px-4 text-slate-500">{{ t.manager_name || '-' }}</td>
              <td class="py-2.5 px-4 text-slate-400">{{ t.stadium || '-' }}</td>
              <td class="py-2.5 px-4 text-right font-bold text-navy-800">{{ t.rating || 90 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

