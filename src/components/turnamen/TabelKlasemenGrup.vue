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
  <div class="bg-pcl-card/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
    <!-- Group Title Header -->
    <div class="px-4 py-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
      <h3 class="font-bold text-sm text-slate-100 tracking-wide flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        {{ namaGrup }}
      </h3>
      <span class="text-[11px] text-slate-400 font-medium">Top 2 Lolos Knockout</span>
    </div>

    <!-- Standings Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/60">
          <tr>
            <th class="py-2.5 px-3 w-8 text-center">#</th>
            <th class="py-2.5 px-3">Klub</th>
            <th class="py-2.5 px-2 text-center" title="Main">P</th>
            <th class="py-2.5 px-2 text-center" title="Menang">W</th>
            <th class="py-2.5 px-2 text-center" title="Seri">D</th>
            <th class="py-2.5 px-2 text-center" title="Kalah">L</th>
            <th class="py-2.5 px-2 text-center" title="Gol Masuk">GF</th>
            <th class="py-2.5 px-2 text-center" title="Gol Kemasukan">GA</th>
            <th class="py-2.5 px-2 text-center" title="Selisih Gol">GD</th>
            <th class="py-2.5 px-3 text-center font-black text-slate-200" title="Poin">PTS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50 text-slate-300">
          <tr
            v-for="(row, idx) in klasemen"
            :key="row.team_id"
            class="hover:bg-slate-800/40 transition-colors"
            :class="{
              'bg-emerald-500/[0.03]': idx < 2
            }"
          >
            <!-- Rank Indicator -->
            <td class="py-2.5 px-3 text-center font-bold">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px]"
                :class="[
                  idx === 0 ? 'bg-emerald-500/20 text-emerald-400 font-black' :
                  idx === 1 ? 'bg-cyan-500/20 text-cyan-400 font-black' :
                  'text-slate-500'
                ]"
              >
                {{ idx + 1 }}
              </span>
            </td>

            <!-- Team Name -->
            <td class="py-2.5 px-3 font-semibold text-slate-200 flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                {{ row.team_short_name || 'TIM' }}
              </span>
              <span class="truncate max-w-[120px] sm:max-w-none">{{ row.team_name }}</span>
            </td>

            <!-- Stats -->
            <td class="py-2.5 px-2 text-center font-mono">{{ row.played }}</td>
            <td class="py-2.5 px-2 text-center font-mono text-emerald-400">{{ row.won }}</td>
            <td class="py-2.5 px-2 text-center font-mono text-slate-400">{{ row.drawn }}</td>
            <td class="py-2.5 px-2 text-center font-mono text-red-400">{{ row.lost }}</td>
            <td class="py-2.5 px-2 text-center font-mono text-slate-400">{{ row.goals_for }}</td>
            <td class="py-2.5 px-2 text-center font-mono text-slate-400">{{ row.goals_against }}</td>
            <td
              class="py-2.5 px-2 text-center font-mono font-bold"
              :class="[
                row.goal_difference > 0 ? 'text-emerald-400' :
                row.goal_difference < 0 ? 'text-red-400' : 'text-slate-400'
              ]"
            >
              {{ row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference }}
            </td>
            <td class="py-2.5 px-3 text-center font-mono font-black text-white bg-slate-900/30">
              {{ row.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
