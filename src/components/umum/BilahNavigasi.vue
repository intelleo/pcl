<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Trophy, Calendar, Users, BarChart3, Shield, Menu, X, ShieldAlert } from 'lucide-vue-next'
import logoPcl from '@/assets/img/logoo.webp'

const router = useRouter()
const route = useRoute()
const menuTerbuka = ref(false)

const daftarMenu = [
  { nama: 'Beranda', rute: '/', ikon: Trophy },
  { nama: 'Turnamen', rute: '/turnamen', ikon: Shield },
  { nama: 'Jadwal & Hasil', rute: '/jadwal', ikon: Calendar },
  { nama: 'Statistik', rute: '/statistik', ikon: BarChart3 },
  { nama: 'Tim', rute: '/tim', ikon: Users },
  { nama: 'Admin', rute: '/admin', ikon: ShieldAlert }
]

function navigasi(rute) {
  menuTerbuka.value = false
  router.push(rute)
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-pcl-border/70 bg-pcl-navy/95 backdrop-blur-md shadow-lg shadow-black/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        <!-- Logo Brand -->
        <div class="flex items-center gap-3 cursor-pointer group" @click="navigasi('/')">
          <div class="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-1 rounded-xl bg-gradient-to-b from-pcl-royal/30 to-pcl-navy/80 border border-pcl-gold/40 group-hover:border-pcl-gold transition-colors shadow-lg shadow-pcl-gold/5">
            <img :src="logoPcl" alt="PCL Logo" class="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl sm:text-2xl font-black tracking-wider text-white font-display uppercase leading-none">
                PEAK CHAMPIONS
              </span>
              <span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-pcl-gold to-pcl-bronze text-slate-950 shadow-sm uppercase font-mono">
                LEAGUE
              </span>
            </div>
            <p class="text-[10px] text-pcl-silver/70 tracking-widest uppercase font-semibold mt-0.5">Flash Soccer Tournament 2026</p>
          </div>
        </div>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center gap-1">
          <button
            v-for="item in daftarMenu"
            :key="item.rute"
            @click="navigasi(item.rute)"
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200"
            :class="[
              route.path === item.rute
                ? 'text-pcl-goldLight bg-gradient-to-r from-pcl-royal/40 to-pcl-card border border-pcl-gold/40 shadow-sm shadow-pcl-gold/10 font-black'
                : 'text-pcl-silver hover:text-white hover:bg-pcl-cardLight/50'
            ]"
          >
            <component :is="item.ikon" class="w-4 h-4 text-pcl-gold" />
            {{ item.nama }}
          </button>
        </nav>

        <!-- Mobile Menu Toggle -->
        <div class="md:hidden flex items-center">
          <button
            @click="menuTerbuka = !menuTerbuka"
            class="p-2 rounded-lg text-pcl-silver hover:text-white hover:bg-pcl-card"
          >
            <component :is="menuTerbuka ? X : Menu" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="menuTerbuka"
      class="md:hidden border-b border-pcl-border bg-pcl-card px-4 pt-2 pb-4 space-y-1 shadow-2xl"
    >
      <button
        v-for="item in daftarMenu"
        :key="item.rute"
        @click="navigasi(item.rute)"
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-colors"
        :class="[
          route.path === item.rute
            ? 'text-pcl-gold bg-pcl-royal/30 border border-pcl-gold/30'
            : 'text-pcl-silver hover:text-white hover:bg-pcl-cardLight/40'
        ]"
      >
        <component :is="item.ikon" class="w-4 h-4 text-pcl-gold" />
        {{ item.nama }}
      </button>
    </div>
  </header>
</template>
