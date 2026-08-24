<script setup>
import { ref } from 'vue'
import { Check, X, Shield, Clock, Search, User, Phone, Mail, FileText } from 'lucide-vue-next'

const props = defineProps({
  daftarPendaftaran: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['setujui', 'tolak', 'hapus'])

const filterStatus = ref('semua')
const cariTeks = ref('')

function terapkanStatus(id, statusBaru) {
  if (statusBaru === 'diterima') {
    emit('setujui', id)
  } else if (statusBaru === 'ditolak') {
    emit('tolak', id)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
      <div class="relative flex-1 max-w-sm">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="cariTeks"
          type="text"
          placeholder="Cari klub, manajer, atau kontak..."
          class="w-full pl-10 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:bg-white transition-colors"
        />
      </div>

      <!-- Filter Pills -->
      <div class="flex items-center gap-1 p-1 rounded-lg bg-slate-100 self-start sm:self-auto shrink-0">
        <button
          @click="filterStatus = 'semua'"
          class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
          :class="filterStatus === 'semua' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          Semua ({{ daftarPendaftaran.length }})
        </button>
        <button
          @click="filterStatus = 'pending'"
          class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
          :class="filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          Pending ({{ daftarPendaftaran.filter(p => p.status === 'pending').length }})
        </button>
        <button
          @click="filterStatus = 'diterima'"
          class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
          :class="filterStatus === 'diterima' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          Diterima
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6">Klub Pendaftar</th>
              <th class="py-3 px-4 sm:px-6">Manajer / Pelatih</th>
              <th class="py-3 px-4 sm:px-6 hidden md:table-cell">Kontak &amp; Email</th>
              <th class="py-3 px-4 sm:px-6 hidden lg:table-cell">Tgl Daftar</th>
              <th class="py-3 px-4 sm:px-6 text-center">Status</th>
              <th class="py-3 px-4 sm:px-6 text-right">Aksi Panitia</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="daftarPendaftaran.length === 0">
              <td colspan="6" class="py-12 text-center text-xs text-slate-400">
                Belum ada tim yang mendaftar turnamen.
              </td>
            </tr>

            <tr
              v-for="item in daftarPendaftaran.filter(p => {
                const matchStatus = filterStatus === 'semua' || p.status === filterStatus
                const q = cariTeks.toLowerCase()
                const matchQ = !q || p.nama_tim.toLowerCase().includes(q) || p.manager_name.toLowerCase().includes(q) || p.kontak.includes(q)
                return matchStatus && matchQ
              })"
              :key="item.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <!-- Nama Tim -->
              <td class="py-3.5 px-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-semibold text-xs text-navy-800 shrink-0">
                    {{ item.short_name }}
                  </div>
                  <div>
                    <div class="font-semibold text-xs text-ink-900">{{ item.nama_tim }}</div>
                    <div class="text-[11px] text-slate-400 line-clamp-1">{{ item.catatan || 'Registrasi daring' }}</div>
                  </div>
                </div>
              </td>

              <!-- Manajer -->
              <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                <div class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ item.manager_name }}</span>
                </div>
              </td>

              <!-- Kontak & Email -->
              <td class="py-3.5 px-4 sm:px-6 hidden md:table-cell text-xs text-slate-500">
                <div class="space-y-0.5">
                  <div class="flex items-center gap-1.5">
                    <Phone class="w-3 h-3 text-slate-400" />
                    <span>{{ item.kontak }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Mail class="w-3 h-3 text-slate-400" />
                    <span>{{ item.email }}</span>
                  </div>
                </div>
              </td>

              <!-- Tgl -->
              <td class="py-3.5 px-4 sm:px-6 hidden lg:table-cell text-xs text-slate-400 tabular-nums">
                {{ item.tanggal_daftar }}
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4 sm:px-6 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                  :class="{
                    'bg-amber-50 text-amber-700 border-amber-200': item.status === 'pending',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': item.status === 'diterima',
                    'bg-red-50 text-red-700 border-red-200': item.status === 'ditolak'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3.5 px-4 sm:px-6 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="item.status !== 'diterima'"
                    @click="terapkanStatus(item.id, 'diterima')"
                    class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title="Terima Klub Masuk Turnamen"
                  >
                    <Check class="w-4 h-4" />
                  </button>

                  <button
                    v-if="item.status !== 'ditolak'"
                    @click="terapkanStatus(item.id, 'ditolak')"
                    class="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Tolak Pendaftaran"
                  >
                    <X class="w-4 h-4" />
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
