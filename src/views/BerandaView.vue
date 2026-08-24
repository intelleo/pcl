<script setup>
import { useRouter } from "vue-router";
import TombolDasar from "../components/umum/TombolDasar.vue";
import KartuDasar from "../components/umum/KartuDasar.vue";
import LencanaStatus from "../components/umum/LencanaStatus.vue";
import {
  Trophy,
  Calendar,
  Shield,
  ArrowRight,
  Star,
  Crown,
} from "lucide-vue-next";
import heroBannerImg from "@/assets/img/bg-pattern.webp";
import logoPcl from "@/assets/img/logoo.webp";

const router = useRouter();

const lagaUnggulan = {
  id: "m1",
  home: { nama: "Barcelona FC", short: "BAR", skor: 3 },
  away: { nama: "Real Madrid", short: "RMA", skor: 1 },
  status: "finished",
  stage: "El Clasico • Fase Grup",
};
</script>

<template>
  <div class="space-y-12 pb-16">
    <!-- Hero Banner with Background Image & Pattern -->
    <section
      class="relative overflow-hidden pt-8 pb-16 sm:py-20 border-b border-pcl-border/80 bg-pcl-navy"
    >
      <!-- Background Banner Graphic Layer -->
      <div class="absolute inset-0 z-0 opacity-25">
        <img
          :src="heroBannerImg"
          alt="PCL Hero Background"
          class="w-full h-full object-cover object-center filter blur-[1px]"
        />
      </div>
      <!-- Gradient Overlays -->
      <div
        class="absolute inset-0 z-0 bg-gradient-to-t from-pcl-navy via-pcl-navy/80 to-transparent"
      ></div>
      <div
        class="absolute top-0 right-1/4 w-96 h-96 bg-pcl-royal/20 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-1/4 w-96 h-96 bg-pcl-gold/10 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6"
      >
        <!-- Badge Title -->
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pcl-royal/60 to-pcl-card border border-pcl-gold/50 shadow-lg shadow-black/40 text-pcl-goldLight text-xs font-bold uppercase tracking-widest"
        >
          <Crown class="w-4 h-4 text-pcl-gold" />
          Turnamen Resmi Sepak Bola Flash Peak • Season 2026
        </div>

        <!-- Big Logo & Title Combination -->
        <div class="flex flex-col items-center justify-center gap-4">
          <img
            :src="logoPcl"
            alt="PCL Tournament"
            class="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain filter drop-shadow-[0_12px_28px_rgba(212,175,55,0.25)] transition-transform hover:scale-105 duration-300"
          />

          <h1
            class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display uppercase leading-tight"
          >
            PEAK CHAMPIONS
            <span class="text-gold-gradient drop-shadow-md">LEAGUE</span>
          </h1>
        </div>

        <p
          class="max-w-2xl mx-auto text-sm sm:text-base text-pcl-silver font-medium leading-relaxed"
        >
          Panggung kompetisi tertinggi mempertemukan 8 klub elit Flash Peak. Ikuti persaingan sengit fase grup, drama babak gugur, hingga penentuan raja sepak bola Flash sesungguhnya.
        </p>

        <!-- Key Metrics Bar -->
        <div class="flex items-center justify-center gap-6 sm:gap-10 pt-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-pcl-silver">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-pcl-gold"></span>
            <span><strong class="text-white font-mono text-base">8</strong> Klub Elit</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-pcl-blueGlow"></span>
            <span><strong class="text-white font-mono text-base">2</strong> Grup Sengit</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong class="text-white font-mono text-base">1</strong> Gelar Juara</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <TombolDasar varian="primer" @click="router.push('/turnamen')">
            <Trophy class="w-4 h-4 mr-2 text-slate-950" />
            Jelajahi Bagan & Klasemen
          </TombolDasar>
          <TombolDasar varian="outline" @click="router.push('/jadwal')">
            <Calendar class="w-4 h-4 mr-2 text-pcl-gold" />
            Jadwal & Hasil Laga
          </TombolDasar>
        </div>
      </div>
    </section>

    <!-- Main Dashboard Widgets -->
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <!-- Big Match Highlight -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display"
          >
            <Star class="w-4 h-4 text-pcl-gold" />
            Sorotan Pertandingan Terkini
          </h2>
          <button
            @click="router.push('/jadwal')"
            class="text-xs font-bold text-pcl-goldLight hover:text-pcl-gold transition-colors flex items-center gap-1"
          >
            Lihat Semua Jadwal <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          class="bg-gradient-to-br from-pcl-card via-pcl-cardLight to-pcl-navy border border-pcl-border/80 hover:border-pcl-gold/50 transition-colors rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group"
        >
          <div
            class="flex items-center justify-between pb-4 border-b border-pcl-border/60 text-xs text-pcl-silver font-semibold"
          >
            <span class="flex items-center gap-2">
              <Shield class="w-3.5 h-3.5 text-pcl-gold" />
              {{ lagaUnggulan.stage }}
            </span>
            <LencanaStatus :status="lagaUnggulan.status" />
          </div>

          <div class="py-6 flex items-center justify-around">
            <!-- Home -->
            <div class="text-center">
              <div
                class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-pcl-royal/40 to-pcl-navy border border-pcl-border flex items-center justify-center font-black text-lg text-pcl-gold mb-2 shadow-lg"
              >
                {{ lagaUnggulan.home.short }}
              </div>
              <div class="font-bold text-slate-100 text-sm">
                {{ lagaUnggulan.home.nama }}
              </div>
            </div>

            <!-- Score -->
            <div class="text-center">
              <div
                class="text-4xl sm:text-5xl font-black font-mono text-gold-gradient tracking-wider"
              >
                {{ lagaUnggulan.home.skor }} - {{ lagaUnggulan.away.skor }}
              </div>
              <span
                class="text-[10px] font-bold text-pcl-silver/70 uppercase tracking-widest mt-1 block"
                >Full Time</span
              >
            </div>

            <!-- Away -->
            <div class="text-center">
              <div
                class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-pcl-royal/40 to-pcl-navy border border-pcl-border flex items-center justify-center font-black text-lg text-pcl-blueGlow mb-2 shadow-lg"
              >
                {{ lagaUnggulan.away.short }}
              </div>
              <div class="font-bold text-slate-100 text-sm">
                {{ lagaUnggulan.away.nama }}
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KartuDasar judul="Format Kompetisi" subJudul="Sistem Turnamen PCL">
            <p class="text-xs text-pcl-silver leading-relaxed">
              Babak penyisihan dibagi menjadi 2 grup (masing-masing 4 tim) dengan format round-robin. Dua tim teratas setiap grup melaju ke babak Knockout (Semi Final & Grand Final) untuk memperebutkan trofi PCL 2026.
            </p>
          </KartuDasar>

          <KartuDasar judul="Pusat Data & Panitia" subJudul="Real-Time Match Operations">
            <p class="text-xs text-pcl-silver leading-relaxed">
              Sistem pencatatan skor dan statistik terintegrasi langsung: update otomatis klasemen poin, selisih gol, daftar pencetak gol (Top Scorer), assist, hingga catatan kedisiplinan kartu pemain.
            </p>
          </KartuDasar>
        </div>
      </div>

      <!-- Quick Top Scorer Widget -->
      <div class="space-y-6">
        <h2
          class="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display"
        >
          <Crown class="w-4 h-4 text-pcl-gold" />
          Pencetak Gol Terbanyak
        </h2>

        <div
          class="bg-pcl-card border border-pcl-border rounded-2xl p-5 shadow-xl space-y-4"
        >
          <div
            class="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pcl-royal/30 to-pcl-cardLight border border-pcl-gold/30"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-7 h-7 rounded-lg bg-gradient-to-br from-pcl-gold to-pcl-bronze text-slate-950 flex items-center justify-center text-xs font-black shadow-md"
                >1</span
              >
              <div>
                <div class="text-xs font-bold text-white">L. Messi (Peak)</div>
                <div class="text-[10px] text-pcl-silver">Barcelona FC</div>
              </div>
            </div>
            <span class="text-base font-black font-mono text-gold-gradient"
              >3 Gol</span
            >
          </div>

          <div
            class="flex items-center justify-between p-3 rounded-xl bg-pcl-navy/70 border border-pcl-border"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-7 h-7 rounded-lg bg-slate-800 text-pcl-silver flex items-center justify-center text-xs font-black"
                >2</span
              >
              <div>
                <div class="text-xs font-bold text-slate-200">
                  C. Ronaldo (Peak)
                </div>
                <div class="text-[10px] text-pcl-silver">Real Madrid</div>
              </div>
            </div>
            <span class="text-base font-black font-mono text-pcl-silver"
              >1 Gol</span
            >
          </div>

          <TombolDasar
            varian="outline"
            class="w-full text-xs"
            @click="router.push('/statistik')"
          >
            Papan Statistik Lengkap
          </TombolDasar>
        </div>
      </div>
    </div>
  </div>
</template>
