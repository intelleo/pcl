<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import TombolDasar from "../umum/TombolDasar.vue";
import {
  Star,
  ArrowRight,
  Shield,
  Layers,
  Award,
  Activity
} from "lucide-vue-next";

const props = defineProps({
  lagaAktif: {
    type: Object,
    default: null
  },
  lagaUnggulanList: {
    type: Array,
    default: () => []
  },
  idLagaTerpilih: {
    type: String,
    default: ""
  },
  infoSeriLagaAktif: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["pilihLaga", "bukaModal"]);
const router = useRouter();

function isLive(m) {
  return !!(m && (m.status === "ongoing" || m.status === "in_progress" || m.status === "live"));
}

function isSelesai(m) {
  return !!(m && (m.status === "finished" || m.status === "completed" || m.status === "selesai"));
}

function formatWaktuLaga(dateStr) {
  if (!dateStr) return "Terjadwal";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Terjadwal";
  const jam = String(d.getHours()).padStart(2, "0");
  const menit = String(d.getMinutes()).padStart(2, "0");
  return `${jam}:${menit} WIB`;
}
</script>

<template>
  <section
    v-if="lagaAktif"
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
  >
    <div class="flex items-end justify-between gap-4">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Matchday</span>
        <h2 class="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 mt-0.5 flex items-center gap-2">
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

    <div class="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      <div class="p-4 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ucl-50 border border-ucl-100 text-ucl-600 text-[11px] font-semibold">
              <Shield class="w-3 h-3" />
              {{
                lagaAktif.knockout_bracket_slot
                  ? `${lagaAktif.stage?.replace("_", " ").toUpperCase()} · ${lagaAktif.knockout_bracket_slot}`
                  : lagaAktif.stage
                    ? lagaAktif.stage.replace("_", " ").toUpperCase()
                    : "Knockout Stage"
              }}
            </span>

            <!-- Badge Seri BO3 & Agregat jika laga BO3 -->
            <span
              v-if="infoSeriLagaAktif"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-[11px] font-semibold"
            >
              <Layers class="w-3 h-3" />
              <span>Seri BO3: <strong class="font-mono">{{ infoSeriLagaAktif.winA }} – {{ infoSeriLagaAktif.winB }}</strong> (Agg: {{ infoSeriLagaAktif.golA }}–{{ infoSeriLagaAktif.golB }})</span>
            </span>
          </div>

          <div
            v-if="lagaUnggulanList.length > 0"
            class="flex items-center gap-1 p-1 rounded-full bg-slate-100 overflow-x-auto scrollbar-none self-start"
          >
            <button
              v-for="laga in lagaUnggulanList"
              :key="laga.id"
              @click="emit('pilihLaga', laga.id)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              :class="
                idLagaTerpilih === laga.id
                  ? 'bg-white text-ink-900 shadow-card'
                  : 'text-slate-500 hover:text-ink-900'
              "
            >
              {{ laga.home_team?.short_name || "HOME" }} vs
              {{ laga.away_team?.short_name || "AWAY" }}
            </button>
          </div>
        </div>

        <!-- Scoreboard -->
        <div class="grid grid-cols-3 items-center gap-2 sm:gap-6 py-3 sm:py-5">
          <div class="flex flex-col sm:flex-row-reverse items-center gap-2 sm:gap-4 text-center min-w-0">
            <img
              v-if="lagaAktif.home_team?.logo_url"
              :src="lagaAktif.home_team.logo_url"
              :alt="lagaAktif.home_team.name"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain bg-white border border-slate-200 p-1.5 shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-bold text-xs sm:text-sm text-blue-900 tracking-wider shrink-0"
            >
              {{ lagaAktif.home_team?.short_name || "HOM" }}
            </div>
            <div class="min-w-0">
              <h3 class="text-xs sm:text-base font-semibold text-ink-900 truncate">
                {{ lagaAktif.home_team?.name || "Home Team" }}
              </h3>
              <span class="text-[11px] text-slate-400 hidden sm:inline">Tuan Rumah</span>
            </div>
          </div>

          <div class="text-center space-y-1.5">
            <div
              v-if="isSelesai(lagaAktif)"
              class="font-display text-2xl sm:text-4xl font-semibold tabular-nums tracking-tight text-navy-800"
            >
              {{ lagaAktif.home_score ?? 0 }} –
              {{ lagaAktif.away_score ?? 0 }}
            </div>
            <div
              v-else-if="isLive(lagaAktif)"
              class="font-display text-2xl sm:text-4xl font-semibold tabular-nums tracking-tight text-red-600"
            >
              {{ lagaAktif.home_score ?? 0 }} –
              {{ lagaAktif.away_score ?? 0 }}
            </div>
            <div
              v-else
              class="font-display text-xl sm:text-3xl font-bold tracking-wider text-slate-400"
            >
              VS
            </div>

            <!-- Status Badge -->
            <span
              v-if="isLive(lagaAktif)"
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[11px] font-semibold animate-pulse"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              LIVE
            </span>
            <span
              v-else-if="isSelesai(lagaAktif)"
              class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold"
            >
              Selesai
            </span>
            <span
              v-else
              class="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold"
            >
              {{ formatWaktuLaga(lagaAktif.scheduled_at) }}
            </span>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center min-w-0">
            <img
              v-if="lagaAktif.away_team?.logo_url"
              :src="lagaAktif.away_team.logo_url"
              :alt="lagaAktif.away_team.name"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain bg-white border border-slate-200 p-1.5 shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-display font-bold text-xs sm:text-sm text-amber-700 tracking-wider shrink-0"
            >
              {{ lagaAktif.away_team?.short_name || "AWY" }}
            </div>
            <div class="min-w-0">
              <h3 class="text-xs sm:text-base font-semibold text-ink-900 truncate">
                {{ lagaAktif.away_team?.name || "Away Team" }}
              </h3>
              <span class="text-[11px] text-slate-400 hidden sm:inline">Tim Tamu</span>
            </div>
          </div>
        </div>

        <!-- Footer: MVP & Detail -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div v-if="lagaAktif.mvp" class="flex items-center gap-2 text-sm">
            <Award class="w-4 h-4 text-gold-500 shrink-0" />
            <span class="text-slate-500 text-xs">
              MVP:
              <strong class="text-ink-900">{{ lagaAktif.mvp.name }}</strong>
              ({{ lagaAktif.mvp.team_short }})
            </span>
          </div>
          <div v-else></div>

          <TombolDasar
            varian="primer"
            @click="emit('bukaModal', lagaAktif)"
            class="w-full sm:w-auto"
          >
            <Activity class="w-4 h-4 mr-1.5" />
            Lihat Detail Laga
          </TombolDasar>
        </div>
      </div>
    </div>
  </section>
</template>
