<script setup>
import { useRouter } from 'vue-router'
import TombolDasar from '../components/umum/TombolDasar.vue'
import KartuDasar from '../components/umum/KartuDasar.vue'
import LencanaStatus from '../components/umum/LencanaStatus.vue'
import { Trophy, Calendar, Flame, Shield, ArrowRight, Star } from 'lucide-vue-next'

const router = useRouter()

const lagaUnggulan = {
  id: 'm1',
  home: { nama: 'Barcelona FC', short: 'BAR', skor: 3 },
  away: { nama: 'Real Madrid', short: 'RMA', skor: 1 },
  status: 'finished',
  stage: 'El Clasico Group Stage'
}
</script>

<template>
  <div class="space-y-12 pb-16">
    <!-- Hero Banner -->
    <section class="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-pcl-dark to-pcl-dark">
      <!-- Glow Decorator -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Flame class="w-3.5 h-3.5" />
          Turnamen Game Flash Sepak Bola
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display uppercase">
          PEAK CHAMPIONS LEAGUE
        </h1>

        <p class="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Panggung tertinggi kompetisi Flash Peak. Pantau statistik tim, klasemen grup, bagan fase gugur, dan perebutan gelar juara PCL 2026.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
          <TombolDasar varian="primer" @click="router.push('/turnamen')">
            <Trophy class="w-4 h-4 mr-2 text-slate-950" />
            Lihat Bagan Turnamen
          </TombolDasar>
          <TombolDasar varian="outline" @click="router.push('/jadwal')">
            <Calendar class="w-4 h-4 mr-2" />
            Jadwal & Hasil Laga
          </TombolDasar>
        </div>
      </div>
    </section>

    <!-- Main Dashboard Widgets -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Big Match Highlight -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Star class="w-4 h-4 text-emerald-400" />
            Sorotan Laga Terkini
          </h2>
          <button @click="router.push('/jadwal')" class="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
            Semua Jadwal <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="bg-gradient-to-br from-slate-900 via-pcl-card to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400 font-semibold">
            <span>{{ lagaUnggulan.stage }}</span>
            <LencanaStatus :status="lagaUnggulan.status" />
          </div>

          <div class="py-6 flex items-center justify-around">
            <!-- Home -->
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-lg text-emerald-400 mb-2">
                {{ lagaUnggulan.home.short }}
              </div>
              <div class="font-bold text-slate-100 text-sm">{{ lagaUnggulan.home.nama }}</div>
            </div>

            <!-- Score -->
            <div class="text-center">
              <div class="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-wider">
                {{ lagaUnggulan.home.skor }} - {{ lagaUnggulan.away.skor }}
              </div>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Full Time</span>
            </div>

            <!-- Away -->
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-lg text-cyan-400 mb-2">
                {{ lagaUnggulan.away.short }}
              </div>
              <div class="font-bold text-slate-100 text-sm">{{ lagaUnggulan.away.nama }}</div>
            </div>
          </div>
        </div>

        <!-- Quick Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KartuDasar judul="Format Turnamen" subJudul="PCL Season 1">
            <p class="text-xs text-slate-300 leading-relaxed">
              2 Grup @ 4 Tim bertanding sistem round-robin. 2 Tim teratas masing-masing grup otomatis melaju ke babak Semi Final & Grand Final.
            </p>
          </KartuDasar>

          <KartuDasar judul="Manajemen Panitia" subJudul="Admin Dashboard">
            <p class="text-xs text-slate-300 leading-relaxed">
              Panel khusus admin untuk mencatat live score, gol, assist, dan kartu pemain secara terintegrasi langsung dengan database.
            </p>
          </KartuDasar>
        </div>
      </div>

      <!-- Quick Top Scorer & Standings Widget -->
      <div class="space-y-6">
        <h2 class="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy class="w-4 h-4 text-amber-400" />
          Top Scorer Sementara
        </h2>

        <div class="bg-pcl-card border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black">1</span>
              <div>
                <div class="text-xs font-bold text-slate-200">L. Messi (Peak)</div>
                <div class="text-[10px] text-slate-400">Barcelona FC</div>
              </div>
            </div>
            <span class="text-base font-black font-mono text-emerald-400">3 Gol</span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-black">2</span>
              <div>
                <div class="text-xs font-bold text-slate-200">C. Ronaldo (Peak)</div>
                <div class="text-[10px] text-slate-400">Real Madrid</div>
              </div>
            </div>
            <span class="text-base font-black font-mono text-emerald-400">1 Gol</span>
          </div>

          <TombolDasar varian="outline" class="w-full text-xs" @click="router.push('/statistik')">
            Lihat Statistik Lengkap
          </TombolDasar>
        </div>
      </div>
    </div>
  </div>
</template>
