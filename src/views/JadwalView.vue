<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePertandingan } from "../composables/usePertandingan.js";
import { api } from "../lib/api.js";
import { getCache, setCache } from "../lib/cache.js";
import KartuPertandingan from "../components/turnamen/KartuPertandingan.vue";
import ModalDetailPertandingan from "../components/turnamen/ModalDetailPertandingan.vue";
import TabelDaftarTim from "../components/turnamen/TabelDaftarTim.vue";
import {
  Filter,
  Calendar,
  Users,
  Search,
  Shield,
  Trophy,
  RotateCw,
  Layers,
  ChevronDown,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// === Season Selector ===
const daftarSeason = ref([]);
const seasonTerpilihId = ref(null);
const sedangMemuatSeason = ref(false);

async function muatDaftarSeason() {
  sedangMemuatSeason.value = true;
  try {
    const data = await api.getTournaments();
    daftarSeason.value = data || [];
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
    ambilSemuaPertandingan(newId, true);
    muatDaftarTim(true);
  }
});

// Tab Active ('jadwal' | 'tim')
const tabAktif = ref(route.query.tab === "tim" ? "tim" : "jadwal");

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === "tim" || newTab === "jadwal") {
      tabAktif.value = newTab;
    }
  },
);

function gantiTab(tab) {
  tabAktif.value = tab;
  router.replace({ query: { ...route.query, tab } });
}

// Logic Tab Jadwal
const {
  sedangMemuat: sedangMemuatJadwal,
  daftarPertandingan,
  lagaTerpilih,
  eventLagaTerpilih,
  ambilSemuaPertandingan,
  ambilDetailPertandingan,
} = usePertandingan();

const filterStage = ref("semua");
const modalDetailTerbuka = ref(false);

function urutkanPerSlot(a, b) {
  const numA = parseInt((a.knockout_bracket_slot || "").match(/(\d+)/)?.[1] || "0", 10);
  const numB = parseInt((b.knockout_bracket_slot || "").match(/(\d+)/)?.[1] || "0", 10);
  if (numA !== numB) return numA - numB;
  return (a.matchday || 1) - (b.matchday || 1);
}

// 1. Fase Grup
const lagaGrupPerGrup = computed(() => {
  if (filterStage.value !== "semua" && filterStage.value !== "group") return [];
  const lagaGrup = daftarPertandingan.value.filter((m) => m.stage === "group");
  if (lagaGrup.length === 0) return [];

  const grupMap = {};
  lagaGrup.forEach((m) => {
    const gName =
      m.group?.name ||
      m.home_team?.group_name ||
      m.away_team?.group_name ||
      "Grup";
    if (!grupMap[gName]) grupMap[gName] = {};
    const md = m.matchday || 1;
    if (!grupMap[gName][md]) grupMap[gName][md] = [];
    grupMap[gName][md].push(m);
  });

  return Object.keys(grupMap)
    .sort()
    .map((gName) => ({
      nama: gName,
      matchdays: Object.keys(grupMap[gName])
        .sort((a, b) => Number(a) - Number(b))
        .map((md) => ({
          matchday: Number(md),
          laga: grupMap[gName][md],
        })),
    }));
});

// 2. Seksi-seksi Fase Gugur
const seksiKnockout = computed(() => {
  const list = [];
  const matches = daftarPertandingan.value || [];

  if (filterStage.value === "semua" || filterStage.value === "round_of_32") {
    const r32 = matches.filter((m) => m.stage === "round_of_32").sort(urutkanPerSlot);
    if (r32.length > 0) {
      list.push({ key: "r32", judul: "Babak 32 Besar", laga: r32, isBo3: false, icon: Calendar, iconBg: "bg-slate-100 border-slate-300 text-slate-700" });
    }
  }

  if (filterStage.value === "semua" || filterStage.value === "round_of_16") {
    const r16 = matches.filter((m) => m.stage === "round_of_16").sort(urutkanPerSlot);
    if (r16.length > 0) {
      list.push({ key: "r16", judul: "Babak 16 Besar", laga: r16, isBo3: false, icon: Calendar, iconBg: "bg-slate-100 border-slate-300 text-slate-700" });
    }
  }

  if (filterStage.value === "semua" || filterStage.value === "quarter_final") {
    const qf = matches.filter((m) => m.stage === "quarter_final").sort(urutkanPerSlot);
    if (qf.length > 0) {
      list.push({ key: "qf", judul: "Perempat Final (8 Besar)", laga: qf, isBo3: true, labelBo3: "Format Best of 3 (BO3)", icon: Layers, iconBg: "bg-gold-50 border-gold-200 text-gold-600" });
    }
  }

  if (filterStage.value === "semua" || filterStage.value === "semi_final") {
    const sf = matches.filter((m) => m.stage === "semi_final").sort(urutkanPerSlot);
    if (sf.length > 0) {
      list.push({ key: "sf", judul: "Semi Final", laga: sf, isBo3: true, labelBo3: "Format Best of 3 (BO3)", icon: Layers, iconBg: "bg-gold-50 border-gold-200 text-gold-600" });
    }
  }

  if (filterStage.value === "semua" || filterStage.value === "final") {
    const fn = matches.filter((m) => m.stage === "final").sort(urutkanPerSlot);
    if (fn.length > 0) {
      list.push({ key: "final", judul: "Grand Final", laga: fn, isBo3: true, labelBo3: "Championship BO3", icon: Trophy, iconBg: "bg-gold-500 text-navy-950 shadow-sm" });
    }
  }

  return list;
});

const totalLagaTampil = computed(() => {
  const totalGrup = lagaGrupPerGrup.value.reduce(
    (sum, g) => sum + g.matchdays.reduce((s, m) => s + m.laga.length, 0),
    0,
  );
  const totalKnockout = seksiKnockout.value.reduce((sum, s) => sum + s.laga.length, 0);
  return totalGrup + totalKnockout;
});

async function segarkanJadwal() {
  await ambilSemuaPertandingan(seasonTerpilihId.value, true);
}

async function bukaDetail(laga) {
  if (laga.events && laga.events.length > 0) {
    lagaTerpilih.value = laga;
    eventLagaTerpilih.value = laga.events;
  } else {
    await ambilDetailPertandingan(laga.id);
  }
  modalDetailTerbuka.value = true;
}

// Logic Tab Tim
const sedangMemuatTim = ref(false);
const daftarTim = ref([]);
const cariKlub = ref("");

async function muatDaftarTim(forceFresh = false) {
  const cacheKey = `teams_list_${seasonTerpilihId.value || 'all'}`;
  if (!forceFresh) {
    const cached = getCache(cacheKey);
    if (cached) {
      daftarTim.value = cached;
      return;
    }
  }

  sedangMemuatTim.value = true;
  try {
    const params = {};
    if (seasonTerpilihId.value) params.tournament_id = seasonTerpilihId.value;
    const data = await api.getTeams(params);
    daftarTim.value = data || [];
    setCache(cacheKey, daftarTim.value, 60000);
  } catch (err) {
    daftarTim.value = [];
  } finally {
    sedangMemuatTim.value = false;
  }
}

onMounted(async () => {
  await Promise.all([muatDaftarSeason(), muatDaftarTim()]);
});
</script>

<template>
  <div
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16 space-y-6 sm:space-y-8"
  >
    <!-- Header Page & Tab Selector -->
    <div
      class="anim-muncul space-y-4 sm:space-y-5 pb-5 sm:pb-6 border-b border-slate-200"
    >
      <div>
        <span
          class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600"
          >Match &amp; Teams Center</span
        >
        <h1
          class="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 mt-1"
        >
          {{
            tabAktif === "jadwal"
              ? "Jadwal & Hasil Pertandingan"
              : "Daftar Team Kontestan"
          }}
        </h1>
        <p
          class="text-xs sm:text-sm text-ink-400 max-w-2xl mt-1 leading-relaxed"
        >
          {{
            tabAktif === "jadwal"
              ? "Saring laga berdasarkan babak dan matchday untuk melihat hasil lengkap pertandingan turnamen PCL."
              : "Informasi lengkap seluruh team peserta dan manager turnamen Peak Champions League."
          }}
        </p>
      </div>

      <!-- Controls Header: Tab Switcher & Filter -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Tab Switcher -->
          <div
            class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl flex-1 sm:flex-initial"
          >
          <button
            @click="gantiTab('jadwal')"
            class="flex-1 sm:flex-initial py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="
              tabAktif === 'jadwal'
                ? 'bg-white text-ucl-700 shadow-sm'
                : 'text-slate-600 hover:text-ink-900'
            "
          >
            <Calendar class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap">Jadwal &amp; Hasil</span>
          </button>
          <button
            @click="gantiTab('tim')"
            class="flex-1 sm:flex-initial py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="
              tabAktif === 'tim'
                ? 'bg-white text-ucl-700 shadow-sm'
                : 'text-slate-600 hover:text-ink-900'
            "
          >
            <Users class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap"
              >Daftar Team ({{ daftarTim.length }})</span
            >
          </button>
          </div>

          <!-- Season Selector -->
          <div v-if="daftarSeason.length > 1" class="relative shrink-0">
            <select
              v-model="seasonTerpilihId"
              class="appearance-none bg-white border border-slate-300 rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-ink-900 cursor-pointer hover:border-ucl-400 focus:border-ucl-500 outline-none transition-colors shadow-sm w-full sm:w-auto min-w-[160px]"
            >
              <option v-for="s in daftarSeason" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.season }}){{ s.status !== 'completed' ? ' — Aktif' : '' }}
              </option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Filter & Refresh Controls -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Filter khusus Tab Jadwal -->
          <template v-if="tabAktif === 'jadwal'">
            <div
              class="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 transition focus-within:border-ucl-500 focus-within:ring-2 focus-within:ring-ucl-500/20 flex-1 sm:flex-initial"
            >
              <Filter class="w-4 h-4 text-ucl-600 shrink-0" />
              <select
                v-model="filterStage"
                class="bg-transparent text-xs sm:text-sm font-medium text-ink-900 border-none outline-none cursor-pointer w-full sm:w-auto pr-1"
              >
                <option value="semua">Semua Babak</option>
                <option value="group">Fase Grup</option>
                <option value="quarter_final">Perempat Final (8 Besar)</option>
                <option value="semi_final">Semi Final (BO3)</option>
                <option value="final">Grand Final (BO3)</option>
              </select>
            </div>

            <!-- Tombol Refresh Data -->
            <button
              type="button"
              @click="segarkanJadwal"
              :disabled="sedangMemuatJadwal"
              title="Segarkan Jadwal Pertandingan"
              class="p-2.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-ucl-700 hover:border-ucl-400 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCw
                class="w-4 h-4"
                :class="{ 'animate-spin': sedangMemuatJadwal }"
              />
            </button>
          </template>

          <!-- Filter khusus Tab Tim -->
          <div v-else class="relative w-full sm:w-64">
            <Search
              class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              v-model="cariKlub"
              type="text"
              placeholder="Cari klub atau manager..."
              class="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 transition-all"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 1: JADWAL & HASIL -->
    <div v-if="tabAktif === 'jadwal'" class="space-y-8">
      <div
        v-if="sedangMemuatJadwal"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="h-36 rounded-xl bg-white border border-slate-200 animate-pulse"
        ></div>
      </div>

      <div
        v-else-if="totalLagaTampil === 0"
        class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2"
      >
        <Filter class="w-8 h-8 text-slate-400 mx-auto" />
        <p class="text-sm font-semibold text-ink-900">
          Tidak ada pertandingan yang sesuai.
        </p>
        <p class="text-xs text-slate-500">Coba ubah opsi filter babak di atas.</p>
      </div>

      <template v-else>
        <!-- 1. SEKSI FASE GRUP -->
        <div v-if="lagaGrupPerGrup.length > 0" class="space-y-8">
          <div
            v-for="grup in lagaGrupPerGrup"
            :key="grup.nama"
            class="space-y-4"
          >
            <!-- Header Grup -->
            <div class="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div
                class="w-8 h-8 rounded-lg bg-ucl-50 border border-ucl-200 flex items-center justify-center shrink-0"
              >
                <Shield class="w-4 h-4 text-ucl-600" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-ink-900">
                  {{ grup.nama }}
                </h3>
                <p class="text-[11px] text-slate-500">
                  {{
                    grup.matchdays.reduce((sum, md) => sum + md.laga.length, 0)
                  }}
                  pertandingan
                </p>
              </div>
            </div>

            <!-- Per Matchday -->
            <div
              v-for="md in grup.matchdays"
              :key="`${grup.nama}-md${md.matchday}`"
              class="space-y-3"
            >
              <div class="flex items-center gap-2">
                <span
                  class="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600"
                >
                  Matchday {{ md.matchday }}
                </span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <KartuPertandingan
                  v-for="laga in md.laga"
                  :key="laga.id"
                  :laga="laga"
                  :semuaLaga="daftarPertandingan"
                  @klikDetail="bukaDetail"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 2. SEKSI-SEKSI FASE GUGUR (KNOCKOUT) -->
        <div
          v-for="seksi in seksiKnockout"
          :key="seksi.key"
          class="space-y-4"
        >
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 pt-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                :class="seksi.iconBg"
              >
                <component :is="seksi.icon" class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-ink-900">{{ seksi.judul }}</h3>
                <p class="text-[11px] text-slate-500">{{ seksi.laga.length }} pertandingan</p>
              </div>
            </div>
            <span
              v-if="seksi.isBo3"
              class="px-2.5 py-1 rounded-md bg-gold-50 border border-gold-200 text-gold-800 text-[11px] font-bold"
            >
              {{ seksi.labelBo3 }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KartuPertandingan
              v-for="laga in seksi.laga"
              :key="laga.id"
              :laga="laga"
              :semuaLaga="daftarPertandingan"
              @klikDetail="bukaDetail"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- TAB 2: DAFTAR TEAM PESERTA (TABEL & KARTU) -->
    <TabelDaftarTim
      v-else
      :daftarTim="daftarTim"
      :sedangMemuat="sedangMemuatTim"
      :kataKunci="cariKlub"
    />

    <!-- Modal Detail Pertandingan -->
    <ModalDetailPertandingan
      :terbuka="modalDetailTerbuka"
      :laga="lagaTerpilih"
      :semuaLaga="daftarPertandingan"
      :events="eventLagaTerpilih"
      @tutup="modalDetailTerbuka = false"
    />
  </div>
</template>
