<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { ArrowLeft, User, Shield } from 'lucide-vue-next'
import TombolDasar from '../components/umum/TombolDasar.vue'

const route = useRoute()
const router = useRouter()
const sedangMemuat = ref(false)
const timData = ref(null)
const skuadPemain = ref([])

onMounted(async () => {
  sedangMemuat.value = true
  try {
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', route.params.id)
      .single()

    timData.value = team || {
      id: route.params.id,
      name: 'Barcelona FC',
      short_name: 'BAR',
      manager_name: 'Coach Xavi'
    }

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', route.params.id)
      .order('squad_number')

    skuadPemain.value = players?.length ? players : [
      { id: '1', name: 'Ter Stegen', squad_number: 1, position: 'GK' },
      { id: '2', name: 'Ronald Araujo', squad_number: 4, position: 'DF' },
      { id: '3', name: 'Pedri', squad_number: 8, position: 'MF' },
      { id: '4', name: 'L. Messi (Peak)', squad_number: 10, position: 'FW' }
    ]
  } finally {
    sedangMemuat.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <TombolDasar varian="outline" @click="router.push('/tim')">
      <ArrowLeft class="w-4 h-4 mr-2" />
      Kembali ke Daftar Tim
    </TombolDasar>

    <!-- Header Profil Tim -->
    <div v-if="timData" class="bg-pcl-card border border-slate-800 rounded-2xl p-6 sm:p-8 flex items-center gap-6 shadow-2xl">
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xl sm:text-2xl text-emerald-400">
        {{ timData.short_name }}
      </div>

      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-wide uppercase">
          {{ timData.name }}
        </h1>
        <div class="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mt-1">
          <User class="w-4 h-4 text-emerald-400" />
          <span>Manajer: {{ timData.manager_name || 'Tidak diketahui' }}</span>
        </div>
      </div>
    </div>

    <!-- Skuad Pemain -->
    <div class="bg-pcl-card border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 class="text-base font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Shield class="w-4 h-4 text-emerald-400" />
        Daftar Skuad Pemain
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div
          v-for="pemain in skuadPemain"
          :key="pemain.id"
          class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
        >
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
              #{{ pemain.squad_number }}
            </span>
            <span class="font-bold text-sm text-slate-200">{{ pemain.name }}</span>
          </div>

          <span
            class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
            :class="{
              'bg-amber-500/10 text-amber-400': pemain.position === 'GK',
              'bg-blue-500/10 text-blue-400': pemain.position === 'DF',
              'bg-emerald-500/10 text-emerald-400': pemain.position === 'MF',
              'bg-red-500/10 text-red-400': pemain.position === 'FW'
            }"
          >
            {{ pemain.position }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
