<script setup>
import { computed } from "vue";
import {
  Save,
  Trash2,
  Target,
  Footprints,
  Activity,
  Shield,
  Award,
} from "lucide-vue-next";

const props = defineProps({
  daftarPemain: {
    type: Array,
    required: true,
  },
  opsiPosisi: {
    type: Array,
    default: () => ["GK", "DF", "CB", "MF", "CM", "WF", "FW", "ST"],
  },
  idSedangSimpan: {
    type: [Number, String],
    default: null,
  },
  sedangMemuat: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["simpan", "hapus"]);

// Ringkasan Agregasi Statistik Skuad
const totalGol = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.goals) || 0), 0)
);
const totalAssist = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.assists) || 0), 0)
);
const totalPass = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.passes) || 0), 0)
);
const totalDef = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.defense) || 0), 0)
);
const totalMvp = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.mvp) || 0), 0)
);
</script>

<template>
  <div class="space-y-2">
    <!-- Header Informasi List -->
    <div class="flex items-center justify-between text-xs">
      <div class="font-bold text-slate-700 flex items-center gap-1.5">
        <span>Tabel Skuad &amp; Statistik</span>
        <span
          class="px-2 py-0.5 rounded-full bg-ucl-50 text-ucl-700 font-mono font-bold text-[10px] border border-ucl-200"
        >
          Total: {{ daftarPemain.length }} Pemain
        </span>
      </div>
      <span class="text-[11px] text-slate-400">
        Klik ikon simpan pada baris untuk memperbarui
      </span>
    </div>

    <!-- Container Tabel Responsif -->
    <div
      class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs max-h-[55vh] overflow-y-auto"
    >
      <table class="w-full text-left text-xs border-collapse">
        <thead
          class="bg-slate-50/90 backdrop-blur-xs text-[11px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200"
        >
          <tr>
            <th class="py-3 px-3 text-center w-14">No</th>
            <th class="py-3 px-3 min-w-[200px]">Nama Pemain</th>
            <th class="py-3 px-3 min-w-[130px]">ID Game</th>
            <th class="py-3 px-2 text-center w-20">Pos</th>
            <th class="py-3 px-2 text-center w-20 text-emerald-700">
              <span class="flex items-center justify-center gap-1" title="Gol">
                <Target class="w-3.5 h-3.5" /> Gol
              </span>
            </th>
            <th class="py-3 px-2 text-center w-20 text-blue-700">
              <span class="flex items-center justify-center gap-1" title="Assist">
                <Footprints class="w-3.5 h-3.5" /> Ast
              </span>
            </th>
            <th class="py-3 px-2 text-center w-20 text-indigo-700">
              <span class="flex items-center justify-center gap-1" title="Passes">
                <Activity class="w-3.5 h-3.5" /> Pas
              </span>
            </th>
            <th class="py-3 px-2 text-center w-20 text-purple-700">
              <span class="flex items-center justify-center gap-1" title="Defense">
                <Shield class="w-3.5 h-3.5" /> Def
              </span>
            </th>
            <th class="py-3 px-2 text-center w-20 text-amber-700">
              <span class="flex items-center justify-center gap-1" title="MVP">
                <Award class="w-3.5 h-3.5" /> MVP
              </span>
            </th>
            <th class="py-3 px-3 text-center w-36 min-w-[130px]">Aksi</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(p, index) in daftarPemain"
            :key="p.id"
            class="hover:bg-blue-50/30 transition-colors group"
          >
            <!-- 1. Nomor Urut -->
            <td class="py-2.5 px-3 text-center">
              <span
                class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-ucl-100 group-hover:text-ucl-700 text-slate-500 font-mono font-bold text-[11px] flex items-center justify-center mx-auto transition-colors"
              >
                {{ index + 1 }}
              </span>
            </td>

            <!-- 2. Nama Pemain -->
            <td class="py-2.5 px-3">
              <input
                v-model="p.name"
                type="text"
                placeholder="Nama Pemain"
                class="w-full font-bold text-xs text-ink-900 px-2 py-1.5 rounded bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-ucl-500 outline-none transition"
              />
            </td>

            <!-- 3. ID Game -->
            <td class="py-2.5 px-3">
              <input
                v-model="p.game_id"
                type="text"
                placeholder="ID Game"
                class="w-full text-[11px] font-mono text-slate-600 px-2 py-1.5 rounded bg-slate-50 hover:bg-white border border-slate-200 focus:border-ucl-500 outline-none transition"
              />
            </td>

            <!-- 4. Posisi -->
            <td class="py-2.5 px-2 text-center">
              <select
                v-model="p.position"
                class="text-[11px] font-bold px-2 py-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700 outline-none text-center focus:border-ucl-500 cursor-pointer"
              >
                <option v-for="pos in opsiPosisi" :key="pos" :value="pos">
                  {{ pos }}
                </option>
              </select>
            </td>

            <!-- 5. Statistik: Gol -->
            <td class="py-2.5 px-2 text-center">
              <input
                v-model.number="p.goals"
                type="number"
                min="0"
                class="w-16 text-center font-bold text-xs text-emerald-900 bg-emerald-50/70 border border-emerald-200 rounded px-2 py-1.5 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </td>

            <!-- 6. Statistik: Assist -->
            <td class="py-2.5 px-2 text-center">
              <input
                v-model.number="p.assists"
                type="number"
                min="0"
                class="w-16 text-center font-bold text-xs text-blue-900 bg-blue-50/70 border border-blue-200 rounded px-2 py-1.5 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </td>

            <!-- 7. Statistik: Pass -->
            <td class="py-2.5 px-2 text-center">
              <input
                v-model.number="p.passes"
                type="number"
                min="0"
                class="w-16 text-center font-bold text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-200 rounded px-2 py-1.5 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </td>

            <!-- 8. Statistik: Defense -->
            <td class="py-2.5 px-2 text-center">
              <input
                v-model.number="p.defense"
                type="number"
                min="0"
                class="w-16 text-center font-bold text-xs text-purple-900 bg-purple-50/70 border border-purple-200 rounded px-2 py-1.5 focus:bg-white focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </td>

            <!-- 9. Statistik: MVP -->
            <td class="py-2.5 px-2 text-center">
              <input
                v-model.number="p.mvp"
                type="number"
                min="0"
                class="w-16 text-center font-bold text-xs text-amber-900 bg-amber-50/70 border border-amber-200 rounded px-2 py-1.5 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </td>

            <!-- 10. Aksi: Simpan & Hapus -->
            <td class="py-2.5 px-3 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  @click="$emit('simpan', p)"
                  :disabled="idSedangSimpan === p.id"
                  class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-1 shrink-0"
                  title="Simpan Perubahan"
                >
                  <Save class="w-3.5 h-3.5" />
                  <span>{{ idSedangSimpan === p.id ? "..." : "Simpan" }}</span>
                </button>
                <button
                  type="button"
                  @click="$emit('hapus', p)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  title="Hapus Pemain"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Footer Ringkasan Total Skuad -->
        <tfoot
          class="bg-slate-50 font-bold text-xs text-slate-700 border-t border-slate-200 sticky bottom-0"
        >
          <tr>
            <td colspan="4" class="py-2.5 px-3 text-right text-[11px] text-slate-500">
              Total Keseluruhan ({{ daftarPemain.length }} Pemain):
            </td>
            <td class="py-2 px-1.5 text-center font-mono text-emerald-700">
              {{ totalGol }}
            </td>
            <td class="py-2 px-1.5 text-center font-mono text-blue-700">
              {{ totalAssist }}
            </td>
            <td class="py-2 px-1.5 text-center font-mono text-indigo-700">
              {{ totalPass }}
            </td>
            <td class="py-2 px-1.5 text-center font-mono text-purple-700">
              {{ totalDef }}
            </td>
            <td class="py-2 px-1.5 text-center font-mono text-amber-700">
              {{ totalMvp }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
