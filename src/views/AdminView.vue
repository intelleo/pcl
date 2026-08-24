<script setup>
import { ref } from 'vue'
import { useAdmin } from '../composables/useAdmin.js'
import FormInputSkor from '../components/admin/FormInputSkor.vue'
import FormEventPertandingan from '../components/admin/FormEventPertandingan.vue'
import ManajemenTim from '../components/admin/ManajemenTim.vue'
import { ShieldCheck, Lock } from 'lucide-vue-next'
import TombolDasar from '../components/umum/TombolDasar.vue'

const pinAdmin = ref('')
const terotentikasi = ref(false)
const pesanErrorAuth = ref('')

const { sedangMemuat, pesanSukses, pesanKesalahan, perbaruiSkorPertandingan, tambahEventPertandingan } = useAdmin()

// Sample active match selected for admin
const lagaAktif = ref({
  id: 'm1',
  stage: 'group',
  home_team_id: 't1',
  away_team_id: 't2',
  home_team: { name: 'Barcelona FC', short_name: 'BAR' },
  away_team: { name: 'Real Madrid', short_name: 'RMA' },
  home_score: 3,
  away_score: 1,
  status: 'finished'
})

const daftarPemainSample = ref([
  { id: 'p1', name: 'L. Messi (Peak)', squad_number: 10, position: 'FW' },
  { id: 'p2', name: 'C. Ronaldo (Peak)', squad_number: 7, position: 'FW' },
  { id: 'p3', name: 'Pedri', squad_number: 8, position: 'MF' },
  { id: 'p4', name: 'Modric', squad_number: 10, position: 'MF' }
])

function verifikasiPin() {
  if (pinAdmin.value === '1234' || pinAdmin.value === 'pcl2026') {
    terotentikasi.value = true
    pesanErrorAuth.value = ''
  } else {
    pesanErrorAuth.value = 'PIN Admin salah. Coba: 1234'
  }
}

async function simpanSkor(payload) {
  await perbaruiSkorPertandingan(payload.matchId, payload.homeScore, payload.awayScore, payload.status)
}

async function simpanEvent(payload) {
  await tambahEventPertandingan(payload.matchId, payload.teamId, payload.playerId, payload.eventType, payload.minute)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Lock Screen jika belum login -->
    <div v-if="!terotentikasi" class="max-w-md mx-auto my-12 bg-pcl-card border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
      <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-emerald-400">
        <Lock class="w-6 h-6" />
      </div>
      <h2 class="text-xl font-bold text-white mb-2">Panel Panitia PCL</h2>
      <p class="text-xs text-slate-400 mb-6">Masukkan PIN keamanan admin untuk mengelola skor dan turnamen</p>

      <form @submit.prevent="verifikasiPin" class="space-y-4">
        <input
          v-model="pinAdmin"
          type="password"
          placeholder="Masukkan PIN (Default: 1234)"
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-center text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <div v-if="pesanErrorAuth" class="text-xs text-red-400 font-semibold">{{ pesanErrorAuth }}</div>
        <TombolDasar tipe="submit" varian="primer" class="w-full">
          Buka Panel Admin
        </TombolDasar>
      </form>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="space-y-8">
      <div class="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-wide uppercase flex items-center gap-2">
            <ShieldCheck class="w-7 h-7 text-emerald-400" />
            Panel Panitia Turnamen
          </h1>
          <p class="text-sm text-slate-400">Manajemen jadwal, input skor langsung, dan pencatatan event</p>
        </div>
        <button
          @click="terotentikasi = false"
          class="text-xs text-red-400 hover:underline"
        >
          Kunci Kembali
        </button>
      </div>

      <!-- Feedback Alerts -->
      <div v-if="pesanSukses" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
        {{ pesanSukses }}
      </div>
      <div v-if="pesanKesalahan" class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
        {{ pesanKesalahan }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Input Skor -->
        <FormInputSkor
          :laga="lagaAktif"
          :sedangMemuat="sedangMemuat"
          @simpan="simpanSkor"
        />

        <!-- Input Event Pemain -->
        <FormEventPertandingan
          :laga="lagaAktif"
          :daftarPemain="daftarPemainSample"
          :sedangMemuat="sedangMemuat"
          @tambahEvent="simpanEvent"
        />
      </div>

      <!-- Manajemen Tim & Skuad -->
      <ManajemenTim />
    </div>
  </div>
</template>
