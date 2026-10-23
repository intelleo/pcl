<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Users, ChevronRight, MessageCircle } from "lucide-vue-next";

const props = defineProps({
  daftarTim: {
    type: Array,
    default: () => [],
  },
  sedangMemuat: {
    type: Boolean,
    default: false,
  },
  kataKunci: {
    type: String,
    default: "",
  },
});

const router = useRouter();

const timTerfilter = computed(() => {
  if (!props.kataKunci.trim()) return props.daftarTim;
  const q = props.kataKunci.toLowerCase();
  return props.daftarTim.filter((t) => {
    return (
      (t.name || "").toLowerCase().includes(q) ||
      (t.short_name || "").toLowerCase().includes(q) ||
      (t.manager_name || "").toLowerCase().includes(q) ||
      (t.contact || "").toLowerCase().includes(q)
    );
  });
});

function bukaDetailTim(tim) {
  router.push(`/tim/${tim.id}`);
}

function formatWhatsAppLink(kontak, timName) {
  if (!kontak) return "#";
  let raw = String(kontak).replace(/\D/g, "");
  if (raw.startsWith("0")) raw = "62" + raw.slice(1);
  const pesan = encodeURIComponent(
    `Halo Kapten/Manager ${timName || ""}, saya ingin koordinasi terkait pertandingan turnamen PCL 2026.`
  );
  return `https://wa.me/${raw}?text=${pesan}`;
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="sedangMemuat"
      class="h-48 rounded-xl bg-white border border-slate-200 animate-pulse"
    ></div>

    <div
      v-else-if="daftarTim.length === 0"
      class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2"
    >
      <Users class="w-8 h-8 text-slate-400 mx-auto" />
      <p class="text-sm font-semibold text-ink-900">Belum Ada Team Terdaftar</p>
      <p class="text-xs text-slate-500">
        Team peserta turnamen akan muncul di sini setelah pendaftaran/drawing selesai.
      </p>
    </div>

    <div
      v-else-if="timTerfilter.length === 0"
      class="text-center py-14 rounded-xl bg-white border border-slate-200 shadow-card space-y-2"
    >
      <Users class="w-8 h-8 text-slate-400 mx-auto" />
      <p class="text-sm font-semibold text-ink-900">Pencarian Tidak Ditemukan</p>
      <p class="text-xs text-slate-500">
        Tidak ada team yang cocok dengan kata kunci "{{ kataKunci }}".
      </p>
    </div>

    <!-- Table & Cards View Team -->
    <div
      v-else
      class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card"
    >
      <!-- Mobile Card List View (< sm) -->
      <div class="block sm:hidden divide-y divide-slate-100">
        <div
          v-for="tim in timTerfilter"
          :key="tim.id"
          @click="bukaDetailTim(tim)"
          class="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <img
              v-if="tim.logo_url"
              :src="tim.logo_url"
              :alt="tim.name"
              class="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
              loading="lazy"
              decoding="async"
            />
            <div
              v-else
              class="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-bold text-xs text-navy-800 tracking-wider shrink-0"
            >
              {{ tim.short_name }}
            </div>

            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="font-semibold text-xs text-ink-900 truncate flex items-center gap-1.5">
                <span class="truncate">{{ tim.name }}</span>
                <span class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[9px] text-slate-600 font-bold uppercase tracking-wider shrink-0">
                  {{ tim.short_name }}
                </span>
              </div>

              <div class="text-[11px] text-slate-500 truncate">
                Manager: <span class="text-ink-800 font-medium">{{ tim.manager_name || "-" }}</span>
              </div>

              <div v-if="tim.contact" class="pt-0.5">
                <a
                  :href="formatWhatsAppLink(tim.contact, tim.name)"
                  target="_blank"
                  @click.stop
                  class="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 hover:text-emerald-700 transition-colors"
                  title="Hubungi WhatsApp Kapten"
                >
                  <MessageCircle class="w-3.5 h-3.5 shrink-0" />
                  <span class="hover:underline underline-offset-2">{{ tim.contact }}</span>
                </a>
              </div>
            </div>
          </div>

          <div class="flex items-center shrink-0 pl-1">
            <ChevronRight class="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>

      <!-- Desktop Table View (>= sm) -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4 sm:px-6">Nama Team</th>
              <th class="py-3 px-4 sm:px-6">Manager / Kapten</th>
              <th class="py-3 px-4 sm:px-6">Kontak Kapten</th>
              <th class="py-3 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="tim in timTerfilter"
              :key="tim.id"
              @click="bukaDetailTim(tim)"
              class="hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <!-- Nama & Logo Team -->
              <td class="py-3.5 px-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <img
                    v-if="tim.logo_url"
                    :src="tim.logo_url"
                    :alt="tim.name"
                    class="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-bold text-xs text-navy-800 tracking-wider shrink-0"
                  >
                    {{ tim.short_name }}
                  </div>
                  <div class="font-semibold text-xs text-ink-900 flex items-center gap-1.5">
                    <span>{{ tim.name }}</span>
                    <span class="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                      {{ tim.short_name }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Manager -->
              <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-600 font-medium">
                {{ tim.manager_name || "-" }}
              </td>

              <!-- Kontak Kapten -->
              <td class="py-3.5 px-4 sm:px-6 text-xs" @click.stop>
                <a
                  v-if="tim.contact"
                  :href="formatWhatsAppLink(tim.contact, tim.name)"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 font-mono font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors text-xs"
                  title="Hubungi WhatsApp Kapten"
                >
                  <MessageCircle class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{{ tim.contact }}</span>
                </a>
                <span v-else class="text-slate-400 font-mono text-xs">-</span>
              </td>

              <!-- Aksi Detail -->
              <td class="py-3.5 px-4 sm:px-6 text-right">
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-ucl-600 hover:text-ucl-700">
                  Lihat Skuad
                  <ChevronRight class="w-4 h-4" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
