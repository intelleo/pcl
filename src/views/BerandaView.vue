<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import ModalDetailPertandingan from "../components/turnamen/ModalDetailPertandingan.vue";
import {
  Trophy,
  Calendar,
  Shield,
  ArrowRight,
  Star,
  Crown,
  Newspaper,
  Award,
  Activity,
  ChevronRight,
} from "lucide-vue-next";
import logoPcl from "@/assets/img/logoo.webp";
import heroBanner from "@/assets/img/hero-banner.webp";
import { mockPertandingan, mockBerita } from "../lib/mockData.js";

const router = useRouter();

// Match highlight aktif
const idLagaTerpilih = ref("m1");
const modalLagaTerbuka = ref(false);

const lagaUnggulanList = computed(() => mockPertandingan.slice(0, 3));
const lagaAktif = computed(
  () =>
    mockPertandingan.find((m) => m.id === idLagaTerpilih.value) ||
    mockPertandingan[0],
);

function bukaModalLaga(laga) {
  idLagaTerpilih.value = laga.id;
  modalLagaTerbuka.value = true;
}

function bukaBeritaLaga(berita) {
  if (berita.terkait_match_id) {
    const match = mockPertandingan.find(
      (m) => m.id === berita.terkait_match_id,
    );
    if (match) {
      bukaModalLaga(match);
      return;
    }
  }
  router.push(`/berita/${berita.id}`);
}
</script>

<template>
  <div class="space-y-10 sm:space-y-14 pb-16">
    <!-- Hero -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
      <div
        class="anim-muncul relative overflow-hidden rounded-2xl shadow-lift min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex items-center"
      >
        <img
          :src="heroBanner"
          alt="Peak Champions League Banner"
          class="absolute inset-0 w-full h-full object-cover object-center opacity-30 scale-105"
          loading="eager"
        />
        <div
          aria-hidden="true"
          class="absolute inset-0 hero-navy opacity-95"
        ></div>
        <div
          aria-hidden="true"
          class="absolute inset-0 pola-bintang opacity-60"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-transparent to-transparent"
        ></div>
        <div
          aria-hidden="true"
          class="absolute -right-12 top-1/2 -translate-y-1/2 w-64 sm:w-96 lg:w-[440px] opacity-10 pointer-events-none select-none"
        >
          <img :src="logoPcl" alt="" class="w-full h-auto object-contain" />
        </div>

        <div
          class="relative z-10 max-w-3xl px-6 sm:px-12 lg:px-16 py-12 sm:py-16 space-y-5 sm:space-y-6"
        >
          <span
            class="anim-muncul inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100"
            style="animation-delay: 40ms"
          >
            <Crown class="w-3.5 h-3.5 text-gold-400" />
            Flash Peak Tournament 2026
          </span>

          <h1
            class="anim-muncul font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-white"
            style="animation-delay: 110ms"
          >
            Peak Champions<br />
            <span class="text-gold-400">League</span>
          </h1>

          <p
            class="anim-muncul text-sm sm:text-base text-blue-100/85 leading-relaxed max-w-lg"
            style="animation-delay: 180ms"
          >
            Panggung turnamen elit 16 klub Flash Soccer. Pantau klasemen grup,
            papan skor, statistik pemain, dan bagan juara PCL 2026.
          </p>

          <div
            class="anim-muncul flex items-stretch divide-x divide-white/15 border-y border-white/15 max-w-md"
            style="animation-delay: 240ms"
          >
            <div class="flex-1 py-3 pr-4">
              <div
                class="text-xl sm:text-2xl font-semibold tabular-nums text-white"
              >
                16
              </div>
              <div
                class="text-[11px] font-semibold uppercase tracking-wider text-blue-200/70 mt-0.5"
              >
                Klub
              </div>
            </div>
            <div class="flex-1 py-3 px-4">
              <div
                class="text-xl sm:text-2xl font-semibold tabular-nums text-white"
              >
                4
              </div>
              <div
                class="text-[11px] font-semibold uppercase tracking-wider text-blue-200/70 mt-0.5"
              >
                Grup
              </div>
            </div>
            <div class="flex-1 py-3 pl-4">
              <div
                class="text-xl sm:text-2xl font-semibold tabular-nums text-gold-400"
              >
                1
              </div>
              <div
                class="text-[11px] font-semibold uppercase tracking-wider text-blue-200/70 mt-0.5"
              >
                Juara
              </div>
            </div>
          </div>

          <div
            class="anim-muncul flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
            style="animation-delay: 310ms"
          >
            <button
              @click="router.push('/turnamen')"
              class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-ucl-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-card hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 cursor-pointer"
            >
              <Trophy class="w-4 h-4 mr-2" />
              Bagan & Klasemen
            </button>
            <button
              @click="router.push('/jadwal')"
              class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white/10 border border-white/25 text-white font-semibold text-sm transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 cursor-pointer"
            >
              <Calendar class="w-4 h-4 mr-2" />
              Jadwal Pertandingan
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Sorotan Matchday -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      <div class="flex items-end justify-between gap-4">
        <div>
          <span
            class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600"
            >Matchday</span
          >
          <h2
            class="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 mt-0.5 flex items-center gap-2"
          >
            <Star class="w-5 h-5 text-gold-500 fill-gold-300" />
            Sorotan Laga
          </h2>
        </div>
        <button
          @click="router.push('/jadwal')"
          class="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-ucl-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          Semua Laga <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden"
      >
        <div class="p-4 sm:p-6 space-y-4">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[11px] font-semibold"
              >
                <Shield class="w-3 h-3" />
                {{ lagaAktif.group?.name || "Grup A" }} · Matchday
                {{ lagaAktif.matchday || 1 }}
              </span>
            </div>

            <div
              class="flex items-center gap-1 p-1 rounded-full bg-slate-100 overflow-x-auto scrollbar-none self-start"
            >
              <button
                v-for="laga in lagaUnggulanList"
                :key="laga.id"
                @click="idLagaTerpilih = laga.id"
                class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                :class="
                  idLagaTerpilih === laga.id
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-slate-500 hover:text-ink-900'
                "
              >
                {{ laga.home_team.short_name }} vs
                {{ laga.away_team.short_name }}
              </button>
            </div>
          </div>

          <!-- Scoreboard -->
          <div
            class="grid grid-cols-3 items-center gap-2 sm:gap-6 py-3 sm:py-5"
          >
            <div
              class="flex flex-col sm:flex-row-reverse items-center gap-2 sm:gap-4 text-center min-w-0"
            >
              <div
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-sm text-navy-800 shrink-0"
              >
                {{ lagaAktif.home_team.short_name }}
              </div>
              <div class="min-w-0">
                <h3
                  class="text-xs sm:text-base font-semibold text-ink-900 truncate"
                >
                  {{ lagaAktif.home_team.name }}
                </h3>
                <span class="text-[11px] text-slate-400 hidden sm:inline"
                  >Tuan Rumah</span
                >
              </div>
            </div>

            <div class="text-center space-y-1.5">
              <div
                class="font-display text-2xl sm:text-4xl font-semibold tabular-nums tracking-tight text-navy-800"
              >
                {{ lagaAktif.home_score }} – {{ lagaAktif.away_score }}
              </div>
              <span
                class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold"
              >
                Selesai
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center min-w-0"
            >
              <div
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-semibold text-sm text-navy-800 shrink-0"
              >
                {{ lagaAktif.away_team.short_name }}
              </div>
              <div class="min-w-0">
                <h3
                  class="text-xs sm:text-base font-semibold text-ink-900 truncate"
                >
                  {{ lagaAktif.away_team.name }}
                </h3>
                <span class="text-[11px] text-slate-400 hidden sm:inline"
                  >Tim Tamu</span
                >
              </div>
            </div>
          </div>

          <!-- Footer: MVP & Detail -->
          <div
            class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100"
          >
            <div v-if="lagaAktif.mvp" class="flex items-center gap-2 text-sm">
              <Award class="w-4 h-4 text-gold-500 shrink-0" />
              <span class="text-slate-500 text-xs">
                MVP:
                <strong class="text-ink-900">{{ lagaAktif.mvp.name }}</strong>
                ({{ lagaAktif.mvp.team_short }})
              </span>
            </div>

            <button
              @click="bukaModalLaga(lagaAktif)"
              class="inline-flex items-center justify-center px-5 py-2 rounded-full bg-ucl-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500 focus-visible:ring-offset-2 cursor-pointer w-full sm:w-auto"
            >
              <Activity class="w-4 h-4 mr-1.5" />
              Lihat Detail Laga
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Kabar & Liputan -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      <div class="flex items-end justify-between gap-4">
        <div>
          <span
            class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600"
            >Liputan</span
          >
          <h2
            class="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 mt-0.5 flex items-center gap-2"
          >
            <Newspaper class="w-5 h-5 text-ucl-600" />
            Kabar & Liputan
          </h2>
        </div>
        <button
          @click="router.push('/berita')"
          class="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-ucl-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          Lihat Semua <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article
          v-for="(berita, idx) in mockBerita"
          :key="berita.id"
          @click="bukaBeritaLaga(berita)"
          class="anim-muncul flex flex-col justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-lift transition-shadow group cursor-pointer space-y-3"
          :style="{ animationDelay: `${idx * 70}ms` }"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span
                class="px-2 py-0.5 rounded-full bg-ucl-50 text-ucl-600 text-[10px] font-semibold uppercase tracking-wide"
              >
                {{ berita.tag }}
              </span>
              <span class="font-mono text-[11px] text-slate-400">{{
                berita.tanggal
              }}</span>
            </div>

            <h3
              class="text-sm font-semibold text-ink-900 group-hover:text-ucl-600 transition-colors line-clamp-2 leading-snug"
            >
              {{ berita.judul }}
            </h3>

            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {{ berita.ringkasan }}
            </p>
          </div>

          <div
            class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-ucl-600"
          >
            <span>Baca Berita</span>
            <ChevronRight
              class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </article>
      </div>
    </section>

    <!-- Modal -->
    <ModalDetailPertandingan
      :terbuka="modalLagaTerbuka"
      :laga="lagaAktif"
      :events="lagaAktif.events || []"
      @tutup="modalLagaTerbuka = false"
    />
  </div>
</template>
