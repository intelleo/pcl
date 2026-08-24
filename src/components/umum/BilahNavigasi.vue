<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Trophy, Calendar, Users, BarChart3, Shield, Menu, X, ShieldAlert } from 'lucide-vue-next'

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
  <header class="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-pcl-dark/95 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="navigasi('/')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <Trophy class="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span class="text-xl font-black tracking-wider text-white flex items-center gap-1.5 font-display text-2xl uppercase">
              PCL <span class="text-emerald-400 font-sans text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">2026</span>
            </span>
            <p class="text-[10px] text-slate-400 tracking-widest uppercase -mt-1 font-semibold">Peak Champions League</p>
          </div>
        </div>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center gap-1">
          <button
            v-for="item in daftarMenu"
            :key="item.rute"
            @click="navigasi(item.rute)"
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200"
            :class="[
              route.path === item.rute
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            ]"
          >
            <component :is="item.ikon" class="w-4 h-4" />
            {{ item.nama }}
          </button>
        </nav>

        <!-- Mobile Menu Toggle -->
        <div class="md:hidden flex items-center">
          <button
            @click="menuTerbuka = !menuTerbuka"
            class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <component :is="menuTerbuka ? X : Menu" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="menuTerbuka"
      class="md:hidden border-b border-slate-800 bg-pcl-card px-4 pt-2 pb-4 space-y-1"
    >
      <button
        v-for="item in daftarMenu"
        :key="item.rute"
        @click="navigasi(item.rute)"
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-colors"
        :class="[
          route.path === item.rute
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        ]"
      >
        <component :is="item.ikon" class="w-4 h-4" />
        {{ item.nama }}
      </button>
    </div>
  </header>
</template>
