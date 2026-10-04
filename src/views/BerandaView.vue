<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "../lib/api.js";
import ModalDetailPertandingan from "../components/turnamen/ModalDetailPertandingan.vue";
import SorotanMatchday from "../components/turnamen/SorotanMatchday.vue";
import TombolDasar from "../components/umum/TombolDasar.vue";
import {
  Calendar,
  Shield,
  ArrowRight,
  Crown,
  Newspaper,
  ChevronRight
} from "lucide-vue-next";
import { hitungStatusSeriBO3 } from "../composables/useKnockout.js";
import logoPcl from "@/assets/img/logoo.webp";
import heroBanner from "@/assets/img/hero-banner.webp";

const router = useRouter();

const idLagaTerpilih = ref("");
const modalLagaTerbuka = ref(false);
const daftarPertandingan = ref([]);
const daftarBerita = ref([]);
const eventLagaAktif = ref([]);
const sedangMemuat = ref(false);

onMounted(async () => {
  sedangMemuat.value = true;

  try {
    const [tournaments, news] = await Promise.all([
      api.getTournaments(),
      api.getNews(),
    ]);

    const activeTur = (tournaments || []).find((s) => s.status !== "completed") || (tournaments || [])[0];
    const matchParams = activeTur?.id ? { tournament_id: activeTur.id } : {};
    const matches = await api.getMatches(matchParams);

    daftarPertandingan.value = matches || [];
    daftarBerita.value = (news || []).slice(0, 4);
    if (lagaUnggulanList.value.length > 0) {
      idLagaTerpilih.value = lagaUnggulanList.value[0].id;
    }
  } catch (err) {
    daftarPertandingan.value = [];
    daftarBerita.value = [];
  } finally {
    sedangMemuat.value = false;
  }
});

const bobotTahap = {
  final: 60,
  semi_final: 50,
  quarter_final: 40,
  round_of_16: 30,
  round_of_32: 20,
  group: 10,
};

function isLive(m) {
  return !!(m && (m.status === "ongoing" || m.status === "in_progress" || m.status === "live"));
}

function isSelesai(m) {
  return !!(m && (m.status === "finished" || m.status === "completed" || m.status === "selesai"));
}

function isTerjadwal(m) {
  return !!(m && (m.status === "scheduled" || m.status === "terjadwal" || !m.status));
}

const lagaUnggulanList = computed(() => {
  const listLengkap = daftarPertandingan.value.filter(
    (m) => m.home_team && m.away_team
  );
  if (listLengkap.length === 0) return daftarPertandingan.value.slice(0, 3);

  // 1. Laga Live / Ongoing (Prioritas Tertinggi)
  const lagaLive = listLengkap.filter(isLive);

  // 2. Laga Selesai Terbaru (Babak tertinggi & Matchday tertinggi)
  const lagaSelesai = listLengkap
    .filter(isSelesai)
    .sort((a, b) => {
      const stageDiff = (bobotTahap[b.stage] || 0) - (bobotTahap[a.stage] || 0);
      if (stageDiff !== 0) return stageDiff;
      const mdDiff = (b.matchday || 1) - (a.matchday || 1);
      if (mdDiff !== 0) return mdDiff;
      if (b.scheduled_at && a.scheduled_at) {
        return new Date(b.scheduled_at) - new Date(a.scheduled_at);
      }
      return 0;
    });

  // 3. Laga Terjadwal Berikutnya (Babak aktif & waktu terdekat)
  const lagaTerjadwal = listLengkap
    .filter(isTerjadwal)
    .sort((a, b) => {
      const stageDiff = (bobotTahap[b.stage] || 0) - (bobotTahap[a.stage] || 0);
      if (stageDiff !== 0) return stageDiff;
      if (a.scheduled_at && b.scheduled_at) {
        return new Date(a.scheduled_at) - new Date(b.scheduled_at);
      }
      return (a.matchday || 1) - (b.matchday || 1);
    });

  // Susun urutan sorotan: Live -> Selesai Terbaru -> Terjadwal Berikutnya
  let hasil = [];
  if (lagaLive.length > 0) {
    hasil = [...lagaLive, ...lagaSelesai, ...lagaTerjadwal];
  } else if (lagaSelesai.length > 0) {
    hasil = [...lagaSelesai, ...lagaTerjadwal];
  } else {
    hasil = [...lagaTerjadwal];
  }

  return hasil.slice(0, 3);
});

const lagaAktif = computed(
  () =>
    daftarPertandingan.value.find((m) => m.id === idLagaTerpilih.value) ||
    lagaUnggulanList.value[0] ||
    daftarPertandingan.value[0] ||
    null,
);
const infoSeriLagaAktif = computed(() => hitungStatusSeriBO3(lagaAktif.value, daftarPertandingan.value));

async function bukaModalLaga(laga) {
  if (!laga) return;
  idLagaTerpilih.value = laga.id;
  try {
    const detail = await api.getMatchDetail(laga.id);
    eventLagaAktif.value = detail.events || [];
  } catch (e) {
    eventLagaAktif.value = [];
  }
  modalLagaTerbuka.value = true;
}

function bukaBeritaLaga(berita) {
  if (berita.terkait_match_id) {
    const match = daftarPertandingan.value.find(
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
          decoding="async"
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
          <img :src="logoPcl" alt="" class="w-full h-auto object-contain" decoding="async" />
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
            class="anim-muncul text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-lg"
            style="animation-delay: 180ms"
          >
            Turnamen kasta tertinggi Flash Peak. Daftarkan skuad terbaikmu,
            bersaing di panggung kompetisi, dan jadilah juara Peak Champions
            League!
          </p>

          <div
            class="anim-muncul flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            style="animation-delay: 240ms"
          >
            <TombolDasar
              varian="gold"
              @click="router.push('/pendaftaran')"
              class="w-full sm:w-auto px-6 py-2.5"
            >
              <Shield class="w-4 h-4 mr-2" />
              Daftar Turnamen
            </TombolDasar>
            <TombolDasar
              varian="kaca"
              @click="router.push('/jadwal')"
              class="w-full sm:w-auto px-6 py-2.5"
            >
              <Calendar class="w-4 h-4 mr-2" />
              Jadwal Pertandingan
            </TombolDasar>
          </div>
        </div>
      </div>
    </section>

    <!-- Sorotan Matchday Component -->
    <SorotanMatchday
      :lagaAktif="lagaAktif"
      :lagaUnggulanList="lagaUnggulanList"
      :idLagaTerpilih="idLagaTerpilih"
      :infoSeriLagaAktif="infoSeriLagaAktif"
      @pilihLaga="(id) => (idLagaTerpilih = id)"
      @bukaModal="bukaModalLaga"
    />

    <!-- Kabar & Liputan -->
    <section
      v-if="daftarBerita.length > 0"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
    >
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
          v-for="(berita, idx) in daftarBerita"
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
      v-if="lagaAktif"
      :terbuka="modalLagaTerbuka"
      :laga="lagaAktif"
      :semuaLaga="daftarPertandingan"
      :events="eventLagaAktif"
      @tutup="modalLagaTerbuka = false"
    />
  </div>
</template>
