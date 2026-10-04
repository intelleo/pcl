<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../lib/api.js";
import { getCache, setCache } from "../lib/cache.js";
import { useKlasemen } from "../composables/useKlasemen.js";
import { bentukDataBagan } from "../composables/useKnockout.js";
import BaganFaseGugur from "../components/turnamen/BaganFaseGugur.vue";
import TabelKlasemenGrup from "../components/turnamen/TabelKlasemenGrup.vue";
import {
  Trophy,
  LayoutGrid,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Calendar,
  ChevronDown,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// === Season Selector ===
const daftarSeason = ref([]);
const seasonTerpilihId = ref(null);
const sedangMemuatSeason = ref(false);

const seasonTerpilih = computed(
  () => daftarSeason.value.find((s) => s.id === seasonTerpilihId.value) || null,
);

async function muatDaftarSeason() {
  sedangMemuatSeason.value = true;
  try {
    const data = await api.getTournaments();
    daftarSeason.value = data || [];
    // Default: season aktif (belum completed) atau terbaru
    const aktif = (data || []).find((s) => s.status !== "completed");
    seasonTerpilihId.value = aktif?.id || (data || [])[0]?.id || null;
  } catch {
    daftarSeason.value = [];
  } finally {
    sedangMemuatSeason.value = false;
  }
}

watch(seasonTerpilihId, (newId) => {
  if (newId) {
    ambilKlasemenGrup(newId, true);
    ambilBaganGugur(true);
  }
});

// Tab: 'grup' | 'knockout'
const tabAktif = ref(route.query.tab === "knockout" ? "knockout" : "grup");

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === "grup" || newTab === "knockout") {
      tabAktif.value = newTab;
    }
    if (newTab === "knockout") {
      ambilBaganGugur(true);
    }
  },
);

function gantiTab(tab) {
  tabAktif.value = tab;
  router.replace({ query: { ...route.query, tab } });
  if (tab === "knockout") {
    ambilBaganGugur(true);
  }
}

// 1. Logika Klasemen Fase Grup
const {
  sedangMemuat: sedangMemuatKlasemen,
  klasemenPerGrup,
  ambilKlasemenGrup,
} = useKlasemen();

const grupTersedia = computed(() => {
  return Object.values(klasemenPerGrup.value || {}).filter(
    (g) => g && g.klasemen && g.klasemen.length > 0,
  );
});

// 2. Logika Bagan Knockout
const sedangMemuatBagan = ref(false);
const lagaKnockout = ref([]);

async function ambilBaganGugur(forceFresh = false) {
  if (!forceFresh) {
    const cached = getCache(
      `knockout_matches_${seasonTerpilihId.value || "all"}`,
    );
    if (cached) {
      lagaKnockout.value = cached;
      return;
    }
  }

  sedangMemuatBagan.value = true;
  try {
    const params = {};
    if (seasonTerpilihId.value) params.tournament_id = seasonTerpilihId.value;
    const data = await api.getMatches(params);
    const knockoutStages = [
      "round_of_32",
      "round_of_16",
      "quarter_final",
      "semi_final",
      "final",
    ];
    const filtered = (data || []).filter((m) =>
      knockoutStages.includes(m.stage),
    );

    lagaKnockout.value = filtered;
    setCache(
      `knockout_matches_${seasonTerpilihId.value || "all"}`,
      filtered,
      30000,
    );
  } catch (err) {
    lagaKnockout.value = [];
  } finally {
    sedangMemuatBagan.value = false;
  }
}

onMounted(async () => {
  await muatDaftarSeason();
});

const dataBaganDinamic = computed(() => bentukDataBagan(lagaKnockout.value));
</script>

<template>
  <div
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8"
  >
    <!-- Header Hero Turnamen -->
    <div
      class="anim-muncul flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200"
    >
      <div>
        <span
          class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600"
          >Turnamen PCL</span
        >
        <h1
          class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1 flex items-center gap-2.5"
        >
          Format &amp; Bagan Turnamen
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          16 Klub bersaing di 4 Grup. 2 tim teratas lolos ke Perempat Final (8
          Besar) hingga Grand Final.
        </p>
      </div>

      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0"
      >
        <!-- Season Selector -->
        <div v-if="daftarSeason.length > 1" class="relative">
          <select
            v-model="seasonTerpilihId"
            class="appearance-none bg-white border border-slate-300 rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-ink-900 cursor-pointer hover:border-ucl-400 focus:border-ucl-500 outline-none transition-colors shadow-sm w-full sm:w-auto min-w-[180px]"
          >
            <option v-for="s in daftarSeason" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.season }}){{
                s.status !== "completed" ? " — Aktif" : ""
              }}
            </option>
          </select>
          <ChevronDown
            class="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        <!-- Tab Switcher (Fase Grup vs Bagan Knockout) -->
        <div
          class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto"
        >
          <button
            @click="gantiTab('grup')"
            class="flex-1 sm:flex-initial py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all text-center cursor-pointer"
            :class="
              tabAktif === 'grup'
                ? 'bg-white text-ucl-700 shadow-sm'
                : 'text-slate-600 hover:text-ink-900'
            "
          >
            Fase Grup (4 Grup)
          </button>

          <button
            @click="gantiTab('knockout')"
            class="flex-1 sm:flex-initial py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all text-center cursor-pointer"
            :class="
              tabAktif === 'knockout'
                ? 'bg-white text-ucl-700 shadow-sm'
                : 'text-slate-600 hover:text-ink-900'
            "
          >
            Bagan Fase Gugur
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 1: KLASEMEN FASE GRUP -->
    <div v-if="tabAktif === 'grup'" class="space-y-6">
      <!-- Info Format Banner -->
      <div
        class="p-4 rounded-xl bg-gradient-to-r from-ucl-50 via-white to-gold-50/40 border border-ucl-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div class="flex items-center gap-2.5 text-ink-900 font-medium">
          <Sparkles class="w-4 h-4 text-gold-600 shrink-0" />
          <span
            >Format: <strong class="text-ucl-700">4 Grup x 4 Klub</strong>.
            Setiap tim bertanding 3 laga (Round Robin).</span
          >
        </div>
        <div
          class="inline-flex items-center gap-1.5 text-ucl-700 font-semibold px-2.5 py-1 rounded-lg bg-ucl-100/70 border border-ucl-200 shrink-0"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
          <span>Top 2 Tiap Grup Maju ke Babak 8 Besar</span>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="sedangMemuatKlasemen"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="h-64 rounded-xl bg-white border border-slate-200 animate-pulse"
        ></div>
      </div>

      <!-- Empty State jika belum ada grup yang diundi -->
      <div
        v-else-if="grupTersedia.length === 0"
        class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-card space-y-3"
      >
        <div
          class="w-12 h-12 rounded-full bg-ucl-50 border border-ucl-200 text-ucl-600 flex items-center justify-center mx-auto"
        >
          <LayoutGrid class="w-6 h-6" />
        </div>
        <h3 class="text-base font-semibold text-ink-900">
          Fase Grup Belum Diundi
        </h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          Panitia turnamen belum mengocok pembagian grup untuk musim ini.
          Klasemen akan aktif segera setelah proses drawing grup diterapkan.
        </p>
      </div>

      <!-- Grid 4 Klasemen Grup -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="grup in grupTersedia" :key="grup.id" class="anim-muncul">
          <TabelKlasemenGrup :namaGrup="grup.nama" :klasemen="grup.klasemen" />
        </div>
      </div>
    </div>

    <!-- TAB 2: BAGAN FASE GUGUR KNOCKOUT -->
    <div v-else-if="tabAktif === 'knockout'" class="space-y-6">
      <!-- Empty State jika belum ada laga yang di-generate -->
      <div
        v-if="!sedangMemuatBagan && lagaKnockout.length === 0"
        class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-card space-y-3"
      >
        <div
          class="w-12 h-12 rounded-full bg-ucl-50 border border-ucl-200 text-ucl-600 flex items-center justify-center mx-auto"
        >
          <Trophy class="w-6 h-6" />
        </div>
        <h3 class="text-base font-semibold text-ink-900">
          Bagan Turnamen Belum Diundi
        </h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          Panitia belum melakukan pengundian bagan knockout untuk musim ini.
          Jadwal akan muncul otomatis setelah drawing selesai.
        </p>
      </div>

      <!-- Interactive Tree Bracket Component -->
      <div v-else class="anim-muncul space-y-6">
        <BaganFaseGugur :baganData="dataBaganDinamic" />
      </div>
    </div>
  </div>
</template>
