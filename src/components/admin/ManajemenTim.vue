<script setup>
import { ref } from 'vue'
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
    <!-- Form Tambah Tim -->
    <form @submit.prevent="submit" class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div class="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
        Tambah Klub Peserta Baru
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Nama Klub</label>
          <input
            v-model="namaTim"
            type="text"
            placeholder="contoh: Chelsea FC"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Singkatan (3 Huruf)</label>
          <input
            v-model="shortName"
            type="text"
            maxlength="4"
            placeholder="CHE"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none uppercase font-mono font-bold"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Nama Manajer</label>
          <input
            v-model="managerName"
            type="text"
            placeholder="Coach Maresca"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      <TombolDasar tipe="submit" varian="primer" :sedangMemuat="sedangMemuat">
        Simpan Tim Baru
      </TombolDasar>
    </form>
  </div>
</template>
