<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import KartuTim from '../components/turnamen/KartuTim.vue'

const router = useRouter()
const sedangMemuat = ref(false)
const daftarTim = ref([])

onMounted(async () => {
  sedangMemuat.value = true
  try {
    const { data } = await supabase.from('teams').select('*').order('name')
    daftarTim.value = data?.length ? data : [
      { id: '1', name: 'Barcelona FC', short_name: 'BAR', manager_name: 'Coach Xavi' },
      { id: '2', name: 'Real Madrid', short_name: 'RMA', manager_name: 'Coach Ancelotti' },
      { id: '3', name: 'Manchester United', short_name: 'MUN', manager_name: 'Coach Ten Hag' },
      { id: '4', name: 'Manchester City', short_name: 'MCI', manager_name: 'Coach Pep' },
      { id: '5', name: 'Bayern Munich', short_name: 'BAY', manager_name: 'Coach Kompany' },
      { id: '6', name: 'Borussia Dortmund', short_name: 'DOR', manager_name: 'Coach Sahin' },
      { id: '7', name: 'Paris Saint-Germain', short_name: 'PSG', manager_name: 'Coach Enrique' },
      { id: '8', name: 'Juventus FC', short_name: 'JUV', manager_name: 'Coach Motta' }
    ]
  } finally {
    sedangMemuat.value = false
  }
})

function bukaDetailTim(tim) {
  router.push(`/tim/${tim.id}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-wide uppercase">
        Daftar Tim Peserta PCL
      </h1>
      <p class="text-sm text-slate-400">Daftar klub peserta dan manajer yang berlaga di Peak Champions League</p>
    </div>

    <div v-if="sedangMemuat" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="h-32 rounded-xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KartuTim
        v-for="tim in daftarTim"
        :key="tim.id"
        :tim="tim"
        @klikDetail="bukaDetailTim"
      />
    </div>
  </div>
</template>
