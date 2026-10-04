<script setup>
import { ref, computed } from "vue";
import {
  Trophy,
  Crown,
  Flame,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
} from "lucide-vue-next";
import pialaPcl from "@/assets/img/piala-pcl.webp";

const props = defineProps({
  baganData: {
    type: Object,
    default: () => ({
      r32: [],
      r16: [],
      perempatFinal: [],
      semiFinal: [],
      final: {
        id: "fin",
        label: "Grand Final (BO3)",
        home: { nama: "Pemenang SF 1", short: "F1", skor: 0, pemenang: false },
        away: { nama: "Pemenang SF 2", short: "F2", skor: 0, pemenang: false },
        selesai: false,
        juara: null,
      },
    }),
  },
});

const tingkatZoom = ref(1);
const kontainerBagan = ref(null);

const adaR32 = computed(
  () => props.baganData.r32 && props.baganData.r32.length > 0,
);
const adaR16 = computed(
  () => props.baganData.r16 && props.baganData.r16.length > 0,
);
const adaQF = computed(
  () =>
    props.baganData.perempatFinal && props.baganData.perempatFinal.length > 0,
);

const daftarKolom = computed(() => {
  const kolom = [];
  if (adaR32.value) {
    kolom.push({
      id: "r32",
      label: "32 Besar",
      icon: Shield,
      matches: props.baganData.r32,
    });
  }
  if (adaR16.value) {
    kolom.push({
      id: "r16",
      label: "16 Besar",
      icon: Shield,
      matches: props.baganData.r16,
    });
  }
  if (adaQF.value) {
    kolom.push({
      id: "qf",
      label: "Perempat Final (BO3)",
      icon: Flame,
      matches: props.baganData.perempatFinal,
    });
  }
  kolom.push({
    id: "sf",
    label: "Semi Final (BO3)",
    icon: Flame,
    matches: props.baganData.semiFinal || [],
  });
  return kolom;
});

const formatKapasitasLabel = computed(() => {
  if (adaR32.value) return "32 Klub Knockout";
  if (adaR16.value) return "16 Klub Knockout";
  if (adaQF.value) return "8 Klub Knockout";
  return "4 Klub Knockout";
});

function adalahKolomTerakhir(kolomId) {
  const kol = daftarKolom.value;
  return kol.length > 0 && kol[kol.length - 1].id === kolomId;
}

function perbesar() {
  if (tingkatZoom.value < 1.4) {
    tingkatZoom.value = Number((tingkatZoom.value + 0.15).toFixed(2));
  }
}

function perkecil() {
  if (tingkatZoom.value > 0.5) {
    tingkatZoom.value = Number((tingkatZoom.value - 0.15).toFixed(2));
  }
}

function aturUlangZoom() {
  tingkatZoom.value = 1;
}

function pasUkuranMobile() {
  tingkatZoom.value = 0.6;
}

function geserKeFase(faseId) {
  if (!kontainerBagan.value) return;
  const kolomIndex = daftarKolom.value.findIndex((k) => k.id === faseId);
  let offset = 0;
  if (kolomIndex !== -1) {
    offset = kolomIndex * 280;
  } else if (faseId === "final") {
    offset = daftarKolom.value.length * 280;
  } else if (faseId === "juara") {
    offset = (daftarKolom.value.length + 1) * 280;
  }
  kontainerBagan.value.scrollTo({ left: offset, behavior: "smooth" });
}
</script>

<template>
  <div class="space-y-4">
    <!-- Controls Header -->
    <div
      class="flex items-center justify-between gap-2 sm:gap-3 bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3.5 shadow-sm"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="px-2.5 py-1 rounded-full bg-ucl-50 border border-ucl-200 text-ucl-700 text-xs font-semibold whitespace-nowrap shrink-0"
        >
          {{ formatKapasitasLabel }}
        </span>
        <span class="text-xs text-slate-500 hidden sm:inline truncate">
          SF &amp; Final Sistem Best of 3 (BO3)
        </span>
      </div>

      <!-- Fase Jumper & Zoom Controls -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- Quick Jump Buttons -->
        <div
          class="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 p-1 rounded-lg"
        >
          <button
            v-for="k in daftarKolom"
            :key="k.id"
            @click="geserKeFase(k.id)"
            class="px-2 py-1 rounded hover:bg-white transition-colors cursor-pointer"
          >
            {{ k.label.replace(" (BO3)", "") }}
          </button>
          <button
            @click="geserKeFase('final')"
            class="px-2 py-1 rounded hover:bg-white text-gold-700 transition-colors cursor-pointer font-bold"
          >
            Final
          </button>
          <button
            @click="geserKeFase('juara')"
            class="px-2 py-1 rounded hover:bg-white text-amber-700 transition-colors cursor-pointer font-bold"
          >
            Juara
          </button>
        </div>

        <!-- Zoom Controls -->
        <div
          class="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs"
        >
          <button
            @click="perkecil"
            class="p-1 rounded text-slate-500 hover:text-ink-900 hover:bg-white transition-colors cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut class="w-3.5 h-3.5" />
          </button>

          <span
            class="text-[10px] font-mono px-0.5 sm:px-1 font-semibold text-slate-600 min-w-[28px] sm:min-w-[34px] text-center"
          >
            {{ Math.round(tingkatZoom * 100) }}%
          </span>

          <button
            @click="perbesar"
            class="p-1 rounded text-slate-500 hover:text-ink-900 hover:bg-white transition-colors cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn class="w-3.5 h-3.5" />
          </button>

          <button
            @click="aturUlangZoom"
            class="p-1 ml-0.5 rounded text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer border-l border-slate-300"
            title="Reset (100%)"
          >
            <RotateCcw class="w-3 h-3" />
          </button>

          <button
            @click="pasUkuranMobile"
            class="p-1 rounded text-slate-500 hover:text-ucl-600 hover:bg-white transition-colors cursor-pointer"
            title="Fit Mobile"
          >
            <Maximize2 class="w-3 h-3 text-ucl-600" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Scroll Hint -->
    <div
      class="sm:hidden flex items-center justify-between px-3 py-2 rounded-xl bg-ucl-50 border border-ucl-100 text-[11px] text-ucl-600"
    >
      <span class="flex items-center gap-1.5">
        <Move class="w-3.5 h-3.5" />
        Geser horizontal untuk menelusuri bagan
      </span>
      <button @click="pasUkuranMobile" class="font-semibold underline">
        Fit (60%)
      </button>
    </div>

    <!-- Interactive Bracket Board Container -->
    <div
      ref="kontainerBagan"
      class="bg-slate-50/50 border border-slate-200 rounded-xl p-4 sm:p-6 overflow-x-auto shadow-card relative"
    >
      <div
        class="origin-top-left transition-transform duration-150"
        :style="{
          transform: `scale(${tingkatZoom})`,
          width: `${100 / tingkatZoom}%`,
        }"
      >
        <div class="flex items-stretch min-w-max">
          <!-- ===== Rounds Columns (R32, R16, QF, SF) ===== -->
          <template v-for="kolom in daftarKolom" :key="kolom.id">
            <div
              class="bracket-kolom flex flex-col"
              :style="{ width: '230px' }"
            >
              <!-- Stage Header -->
              <div
                class="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-ink-600 flex items-center justify-center gap-1.5 mb-3 text-center shadow-sm mx-1"
              >
                <component :is="kolom.icon" class="w-3.5 h-3.5 text-ucl-600" />
                <span>{{ kolom.label }}</span>
              </div>

              <!-- Match Cards -->
              <div class="flex flex-col justify-around flex-1 gap-1">
                <div
                  v-for="match in kolom.matches"
                  :key="match.id"
                  class="bracket-kartu bg-white border border-slate-200 hover:border-ucl-400/60 transition-all rounded-lg p-2 shadow-sm space-y-1"
                >
                  <!-- Slot Header -->
                  <div
                    class="flex items-center justify-between text-[10px] text-slate-400 pb-0.5 border-b border-slate-100"
                  >
                    <span class="font-mono font-semibold text-ucl-700">{{
                      match.label
                    }}</span>
                    <span
                      :class="
                        match.selesai
                          ? 'text-emerald-600 font-bold'
                          : 'font-medium'
                      "
                    >
                      {{
                        match.isBo3
                          ? match.selesai
                            ? match.viaAgregatGol
                              ? `FT (Agg ${match.golTeam1}–${match.golTeam2})`
                              : "FT (BO3)"
                            : "BO3 Seri"
                          : match.selesai
                            ? "FT"
                            : "—"
                      }}
                    </span>
                  </div>

                  <!-- Home -->
                  <div
                    class="flex items-center justify-between px-1.5 py-0.5 rounded text-xs"
                    :class="
                      match.home.pemenang
                        ? 'text-ucl-600 font-bold bg-ucl-50/50'
                        : 'text-slate-600'
                    "
                  >
                    <div class="flex items-center gap-1.5 min-w-0">
                      <img
                        v-if="match.home.logo_url"
                        :src="match.home.logo_url"
                        :alt="match.home.nama"
                        class="w-4 h-4 rounded-full object-contain bg-white border border-slate-200 shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        v-else
                        class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[8px] text-blue-800 font-bold flex items-center justify-center shrink-0"
                        >{{ match.home.short }}</span
                      >
                      <span class="truncate text-[11px]">{{
                        match.home.nama
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-1.5">
                      <span
                        v-if="match.viaAgregatGol"
                        class="text-[9px] text-slate-400 font-normal tabular-nums"
                        title="Total Gol"
                      >
                        ({{ match.home.totalGol ?? match.golTeam1 }})
                      </span>
                      <span
                        class="tabular-nums text-xs"
                        :class="
                          match.home.pemenang ? 'text-ucl-600' : 'text-slate-400'
                        "
                      >
                        {{ match.selesai || match.isBo3 ? match.home.skor : "-" }}
                      </span>
                    </div>
                  </div>

                  <!-- Away -->
                  <div
                    class="flex items-center justify-between px-1.5 py-0.5 rounded text-xs"
                    :class="
                      match.away.pemenang
                        ? 'text-ucl-600 font-bold bg-ucl-50/50'
                        : 'text-slate-600'
                    "
                  >
                    <div class="flex items-center gap-1.5 min-w-0">
                      <img
                        v-if="match.away.logo_url"
                        :src="match.away.logo_url"
                        :alt="match.away.nama"
                        class="w-4 h-4 rounded-full object-contain bg-white border border-slate-200 shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        v-else
                        class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[8px] font-bold flex items-center justify-center text-gold-500 shrink-0"
                        >{{ match.away.short }}</span
                      >
                      <span class="truncate text-[11px]">{{
                        match.away.nama
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-1.5">
                      <span
                        v-if="match.viaAgregatGol"
                        class="text-[9px] text-slate-400 font-normal tabular-nums"
                        title="Total Gol"
                      >
                        ({{ match.away.totalGol ?? match.golTeam2 }})
                      </span>
                      <span
                        class="tabular-nums text-xs"
                        :class="
                          match.away.pemenang ? 'text-ucl-600' : 'text-slate-400'
                        "
                      >
                        {{ match.selesai || match.isBo3 ? match.away.skor : "-" }}
                      </span>
                    </div>
                  </div>

                  <!-- Rincian Skor Game BO3 jika ada -->
                  <div
                    v-if="
                      match.isBo3 &&
                      match.rincianGames &&
                      match.rincianGames.length > 0
                    "
                    class="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400"
                  >
                    <span
                      v-for="rg in match.rincianGames"
                      :key="`g-${rg.game}`"
                      class="px-1 rounded bg-slate-50 font-mono"
                      :class="
                        rg.selesai
                          ? 'text-slate-700 font-semibold'
                          : 'text-slate-400'
                      "
                    >
                      G{{ rg.game }}:
                      {{ rg.selesai ? `${rg.skorT1}-${rg.skorT2}` : "—" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== Connector Lines between columns ===== -->
            <div
              v-if="!adalahKolomTerakhir(kolom.id)"
              class="bracket-konektor flex flex-col"
              :style="{ width: '32px' }"
            >
              <div class="h-[34px] shrink-0"></div>
              <div class="flex flex-col justify-around flex-1">
                <div
                  v-for="pIdx in Math.ceil(kolom.matches.length / 2)"
                  :key="`conn-${kolom.id}-${pIdx}`"
                  class="flex-1 flex items-center"
                >
                  <svg
                    class="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 32 100"
                  >
                    <line
                      x1="0"
                      y1="25"
                      x2="16"
                      y2="25"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                    <line
                      x1="0"
                      y1="75"
                      x2="16"
                      y2="75"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                    <line
                      x1="16"
                      y1="25"
                      x2="16"
                      y2="75"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                    <line
                      x1="16"
                      y1="50"
                      x2="32"
                      y2="50"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Connector dari SF ke Final -->
            <div
              v-if="adalahKolomTerakhir(kolom.id)"
              class="bracket-konektor flex flex-col"
              :style="{ width: '32px' }"
            >
              <div class="h-[34px] shrink-0"></div>
              <div class="flex flex-col justify-around flex-1">
                <div class="flex-1 flex items-center">
                  <svg
                    class="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 32 100"
                  >
                    <line
                      x1="0"
                      y1="25"
                      x2="16"
                      y2="25"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                    <line
                      x1="0"
                      y1="75"
                      x2="16"
                      y2="75"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                    <line
                      x1="16"
                      y1="25"
                      x2="16"
                      y2="75"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                    <line
                      x1="16"
                      y1="50"
                      x2="32"
                      y2="50"
                      stroke="#cbd5e1"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <!-- ===== Grand Final Column ===== -->
          <div class="bracket-kolom flex flex-col" :style="{ width: '250px' }">
            <div
              class="px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/40 text-[11px] font-semibold text-amber-700 flex items-center justify-center gap-1.5 mb-3 text-center shadow-sm mx-1"
            >
              <Trophy class="w-3.5 h-3.5 text-gold-500" />
              <span>Grand Final (BO3)</span>
            </div>

            <div class="flex flex-col justify-center flex-1">
              <div
                class="bg-white border border-gold-400/40 rounded-xl shadow-md overflow-hidden"
              >
                <div class="p-3.5 space-y-2">
                  <div
                    class="flex items-center justify-between pb-1 border-b border-gold-400/20"
                  >
                    <span
                      class="flex items-center gap-1 text-[11px] font-semibold text-amber-700 truncate"
                    >
                      <Trophy class="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      {{ baganData.final.label }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full bg-gold-400/15 border border-gold-400/40 text-amber-700 font-semibold text-[9px] uppercase tracking-wider shrink-0"
                    >
                      {{
                        baganData.final.selesai
                          ? baganData.final.viaAgregatGol
                            ? `FT (Agg ${baganData.final.golTeam1}–${baganData.final.golTeam2})`
                            : "FT (BO3)"
                          : "BO3"
                      }}
                    </span>
                  </div>

                  <!-- Final Home -->
                  <div
                    class="flex items-center justify-between px-2 py-1 rounded-md transition-all"
                    :class="
                      baganData.final.home.pemenang
                        ? 'text-ucl-600 font-bold bg-ucl-50/50'
                        : 'text-slate-600'
                    "
                  >
                    <div class="flex items-center gap-2 truncate">
                      <img
                        v-if="baganData.final.home.logo_url"
                        :src="baganData.final.home.logo_url"
                        :alt="baganData.final.home.nama"
                        class="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        v-else
                        class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-[8px] font-bold text-blue-800 flex items-center justify-center shrink-0"
                        >{{ baganData.final.home.short }}</span
                      >
                      <span class="truncate text-xs">{{
                        baganData.final.home.nama
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-2">
                      <span
                        v-if="baganData.final.viaAgregatGol"
                        class="text-[9px] text-slate-400 font-normal tabular-nums"
                        title="Total Gol"
                      >
                        ({{ baganData.final.home.totalGol ?? baganData.final.golTeam1 }})
                      </span>
                      <span
                        class="text-sm tabular-nums font-bold"
                        :class="
                          baganData.final.home.pemenang
                            ? 'text-ucl-600'
                            : 'text-slate-500'
                        "
                      >
                        {{
                          baganData.final.selesai || baganData.final.home.skor > 0
                            ? baganData.final.home.skor
                            : "-"
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- VS divider -->
                  <div
                    class="text-center text-[9px] font-semibold text-slate-300 tracking-widest"
                  >
                    VS
                  </div>

                  <!-- Final Away -->
                  <div
                    class="flex items-center justify-between px-2 py-1 rounded-md transition-all"
                    :class="
                      baganData.final.away.pemenang
                        ? 'text-ucl-600 font-bold bg-ucl-50/50'
                        : 'text-slate-600'
                    "
                  >
                    <div class="flex items-center gap-2 truncate">
                      <img
                        v-if="baganData.final.away.logo_url"
                        :src="baganData.final.away.logo_url"
                        :alt="baganData.final.away.nama"
                        class="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        v-else
                        class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-[8px] font-bold text-amber-700 flex items-center justify-center shrink-0"
                        >{{ baganData.final.away.short }}</span
                      >
                      <span class="truncate text-xs">{{
                        baganData.final.away.nama
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-2">
                      <span
                        v-if="baganData.final.viaAgregatGol"
                        class="text-[9px] text-slate-400 font-normal tabular-nums"
                        title="Total Gol"
                      >
                        ({{ baganData.final.away.totalGol ?? baganData.final.golTeam2 }})
                      </span>
                      <span
                        class="text-sm tabular-nums font-bold"
                        :class="
                          baganData.final.away.pemenang
                            ? 'text-ucl-600'
                            : 'text-slate-500'
                        "
                      >
                        {{
                          baganData.final.selesai || baganData.final.away.skor > 0
                            ? baganData.final.away.skor
                            : "-"
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- Rincian Game Final -->
                  <div
                    v-if="
                      baganData.final.rincianGames &&
                      baganData.final.rincianGames.length > 0
                    "
                    class="pt-1.5 border-t border-slate-100 flex items-center justify-around text-[9px]"
                  >
                    <span
                      v-for="rg in baganData.final.rincianGames"
                      :key="`fin-g-${rg.game}`"
                      class="px-1.5 py-0.5 rounded bg-slate-50 font-mono"
                      :class="
                        rg.selesai
                          ? 'text-slate-700 font-semibold'
                          : 'text-slate-400'
                      "
                    >
                      G{{ rg.game }}:
                      {{ rg.selesai ? `${rg.skorT1}-${rg.skorT2}` : "—" }}
                    </span>
                  </div>

                  <div
                    class="text-center pt-1 text-[10px] text-slate-400 border-t border-slate-100"
                  >
                    {{
                      baganData.final.selesai
                        ? "BO3 Selesai · Juara Ditentukan"
                        : "Best of 3 Series"
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector Final → Trophy -->
          <div class="flex flex-col" :style="{ width: '32px' }">
            <div class="h-[34px] shrink-0"></div>
            <div class="flex flex-col justify-center flex-1 items-center">
              <div
                class="w-full h-[2px] bg-gradient-to-r from-slate-300 to-gold-400"
              ></div>
            </div>
          </div>

          <!-- ===== Trophy / Winner Column ===== -->
          <div class="bracket-kolom flex flex-col" :style="{ width: '210px' }">
            <div
              class="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-[11px] font-semibold text-navy-950 flex items-center justify-center gap-1.5 mb-3 text-center shadow-sm mx-1"
            >
              <Crown class="w-3.5 h-3.5" />
              <span>Juara</span>
            </div>

            <div class="flex flex-col justify-center flex-1">
              <div
                class="bg-white border border-gold-400/40 rounded-xl shadow-lift overflow-hidden"
              >
                <div class="p-4 text-center space-y-2.5">
                  <div
                    class="mx-auto w-14 h-14 flex items-center justify-center"
                  >
                    <img
                      :src="pialaPcl"
                      alt="Piala PCL"
                      class="w-full h-full object-contain drop-shadow-md"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div>
                    <span
                      class="inline-block px-2 py-0.5 rounded-full bg-gold-400/15 border border-gold-400/40 text-amber-700 text-[9px] font-semibold uppercase tracking-wider"
                    >
                      Juara PCL
                    </span>
                    <h3
                      class="font-display text-sm font-semibold tracking-tight text-ink-900 mt-1 line-clamp-2"
                    >
                      {{ baganData.final.juara?.nama || "Menunggu Juara" }}
                    </h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">
                      Peak Champions League 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
