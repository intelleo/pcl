<script setup>
import { computed } from 'vue'
import { Target, Footprints, Activity, Shield, Award } from 'lucide-vue-next'

const props = defineProps({
  daftarPemain: {
    type: Array,
    default: () => []
  }
})

const totalGolSkuad = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.goals) || 0), 0)
)
const totalAssistSkuad = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.assists) || 0), 0)
)
const totalPassSkuad = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.passes) || 0), 0)
)
const totalDefSkuad = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.defense) || 0), 0)
)
const totalMvpSkuad = computed(() =>
  props.daftarPemain.reduce((acc, p) => acc + (Number(p.mvp) || 0), 0)
)

function kelasBadgePosisi(posisi) {
  const map = {
    GK: 'bg-amber-50 text-amber-700 border-amber-200',
    DF: 'bg-blue-50 text-blue-700 border-blue-200',
    CB: 'bg-blue-50 text-blue-700 border-blue-200',
    MF: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CM: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WF: 'bg-purple-50 text-purple-700 border-purple-200',
    FW: 'bg-rose-50 text-rose-700 border-rose-200',
    ST: 'bg-rose-50 text-rose-700 border-rose-200'
  }
  return map[posisi] || 'bg-slate-50 text-slate-600 border-slate-200'
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
    <table class="w-full text-left text-xs border-collapse">
      <thead
        class="bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200"
      >
        <tr>
          <th class="py-3 px-3 text-center w-12 sm:w-14">No</th>
          <th class="py-3 px-3.5 min-w-[180px]">Nama Pemain</th>
          <th class="py-3 px-3 min-w-[110px]">ID Game</th>
          <th class="py-3 px-2 text-center w-16 sm:w-20">Pos</th>
          <th class="py-3 px-2 text-center w-14 sm:w-16 text-emerald-700">
            <span class="flex items-center justify-center gap-1" title="Gol">
              <Target class="w-3.5 h-3.5" /> Gol
            </span>
          </th>
          <th class="py-3 px-2 text-center w-14 sm:w-16 text-blue-700">
            <span class="flex items-center justify-center gap-1" title="Assist">
              <Footprints class="w-3.5 h-3.5" /> Ast
            </span>
          </th>
          <th class="py-3 px-2 text-center w-14 sm:w-16 text-indigo-700">
            <span class="flex items-center justify-center gap-1" title="Passes">
              <Activity class="w-3.5 h-3.5" /> Pas
            </span>
          </th>
          <th class="py-3 px-2 text-center w-14 sm:w-16 text-purple-700">
            <span class="flex items-center justify-center gap-1" title="Defense">
              <Shield class="w-3.5 h-3.5" /> Def
            </span>
          </th>
          <th class="py-3 px-2 text-center w-14 sm:w-16 text-amber-700">
            <span class="flex items-center justify-center gap-1" title="MVP">
              <Award class="w-3.5 h-3.5" /> MVP
            </span>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr
          v-for="(pemain, idx) in daftarPemain"
          :key="pemain.id"
          class="hover:bg-slate-50/80 transition-colors group"
        >
          <!-- 1. Nomor Urut -->
          <td class="py-3 px-3 text-center">
            <span
              class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-ucl-100 group-hover:text-ucl-700 text-slate-500 font-mono font-bold text-[11px] flex items-center justify-center mx-auto transition-colors"
            >
              {{ idx + 1 }}
            </span>
          </td>

          <!-- 2. Nama Pemain -->
          <td class="py-3 px-3.5">
            <span
              class="font-bold text-xs sm:text-sm text-ink-900 group-hover:text-ucl-600 transition-colors"
            >
              {{ pemain.name }}
            </span>
          </td>

          <!-- 3. ID Game -->
          <td class="py-3 px-3 font-mono text-slate-500 text-xs">
            {{ pemain.game_id || '-' }}
          </td>

          <!-- 4. Posisi -->
          <td class="py-3 px-2 text-center">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide"
              :class="kelasBadgePosisi(pemain.position)"
            >
              {{ pemain.position || '-' }}
            </span>
          </td>

          <!-- 5. Gol -->
          <td class="py-3 px-2 text-center font-bold text-xs text-emerald-700 font-mono">
            {{ Number(pemain.goals) || 0 }}
          </td>

          <!-- 6. Assist -->
          <td class="py-3 px-2 text-center font-bold text-xs text-blue-700 font-mono">
            {{ Number(pemain.assists) || 0 }}
          </td>

          <!-- 7. Pass -->
          <td class="py-3 px-2 text-center font-bold text-xs text-indigo-700 font-mono">
            {{ Number(pemain.passes) || 0 }}
          </td>

          <!-- 8. Defense -->
          <td class="py-3 px-2 text-center font-bold text-xs text-purple-700 font-mono">
            {{ Number(pemain.defense) || 0 }}
          </td>

          <!-- 9. MVP -->
          <td class="py-3 px-2 text-center font-bold text-xs text-amber-700 font-mono">
            {{ Number(pemain.mvp) || 0 }}
          </td>
        </tr>
      </tbody>

      <!-- Footer Total -->
      <tfoot class="bg-slate-50 font-bold text-xs text-slate-700 border-t border-slate-200">
        <tr>
          <td colspan="4" class="py-3 px-3 text-right text-[11px] text-slate-500">
            Total Skuad ({{ daftarPemain.length }} Pemain):
          </td>
          <td class="py-3 px-2 text-center font-mono text-emerald-700">
            {{ totalGolSkuad }}
          </td>
          <td class="py-3 px-2 text-center font-mono text-blue-700">
            {{ totalAssistSkuad }}
          </td>
          <td class="py-3 px-2 text-center font-mono text-indigo-700">
            {{ totalPassSkuad }}
          </td>
          <td class="py-3 px-2 text-center font-mono text-purple-700">
            {{ totalDefSkuad }}
          </td>
          <td class="py-3 px-2 text-center font-mono text-amber-700">
            {{ totalMvpSkuad }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
