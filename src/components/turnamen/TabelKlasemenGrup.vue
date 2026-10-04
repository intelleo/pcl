<script setup>
defineProps({
  namaGrup: {
    type: String,
    required: true
  },
  klasemen: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-card">
    <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
      <h3 class="text-sm font-semibold tracking-tight text-ink-900 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-ucl-500"></span>
        {{ namaGrup }}
      </h3>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ucl-50 border border-ucl-100 text-[11px] font-semibold text-ucl-600">
        Top 2 Lolos
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs min-w-[340px] sm:min-w-[420px]">
        <thead class="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            <th class="py-2.5 px-3 w-8 text-center font-semibold">#</th>
            <th class="py-2.5 px-3 font-semibold">Klub</th>
            <th class="py-2.5 px-2 text-center font-semibold" title="Main">P</th>
            <th class="py-2.5 px-2 text-center font-semibold" title="Menang">W</th>
            <th class="py-2.5 px-2 text-center font-semibold" title="Seri">D</th>
            <th class="py-2.5 px-2 text-center font-semibold" title="Kalah">L</th>
            <th class="py-2.5 px-2 text-center font-semibold hidden sm:table-cell" title="Gol Masuk">GF</th>
            <th class="py-2.5 px-2 text-center font-semibold hidden sm:table-cell" title="Gol Kemasukan">GA</th>
            <th class="py-2.5 px-2 text-center font-semibold" title="Selisih Gol">GD</th>
            <th class="py-2.5 px-3 text-center font-semibold text-ucl-600" title="Poin">PTS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-ink-600">
          <tr
            v-for="(row, idx) in klasemen"
            :key="row.team_id"
            class="hover:bg-ucl-50/50 transition-colors"
          >
            <td
              class="py-2.5 px-3 text-center border-l-2"
              :class="idx < 2 ? 'border-ucl-500' : 'border-l-transparent'"
            >
              <span
                class="inline-flex items-center justify-center w-5 h-5 text-[11px]"
                :class="idx < 3 ? 'font-semibold text-ucl-600' : 'text-slate-400'"
              >
                {{ idx + 1 }}
              </span>
            </td>

            <td class="py-2.5 px-3">
              <div class="flex items-center gap-2.5">
                <img
                  v-if="row.logo_url"
                  :src="row.logo_url"
                  :alt="row.team_name"
                  class="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  v-else
                  class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-[9px] font-bold text-navy-800 tracking-wider flex items-center justify-center shrink-0"
                >
                  {{ row.team_short_name || 'TIM' }}
                </span>
                <span class="truncate max-w-[100px] sm:max-w-none text-xs sm:text-sm font-medium text-ink-900">{{ row.team_name }}</span>
              </div>
            </td>

            <td class="py-2.5 px-2 text-center tabular-nums">{{ row.played }}</td>
            <td class="py-2.5 px-2 text-center tabular-nums text-emerald-600 font-medium">{{ row.won }}</td>
            <td class="py-2.5 px-2 text-center tabular-nums text-slate-400">{{ row.drawn }}</td>
            <td class="py-2.5 px-2 text-center tabular-nums text-red-500">{{ row.lost }}</td>
            <td class="py-2.5 px-2 text-center tabular-nums text-slate-400 hidden sm:table-cell">{{ row.goals_for }}</td>
            <td class="py-2.5 px-2 text-center tabular-nums text-slate-400 hidden sm:table-cell">{{ row.goals_against }}</td>
            <td class="py-2.5 px-2 text-center tabular-nums" :class="row.goal_difference > 0 ? 'text-emerald-600' : row.goal_difference < 0 ? 'text-red-500' : 'text-slate-400'">
              {{ row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference }}
            </td>
            <td class="py-2.5 px-3 text-center tabular-nums font-semibold text-ucl-600">{{ row.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
