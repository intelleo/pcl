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
  <div class="bg-pcl-card/90 border border-pcl-border rounded-2xl overflow-hidden shadow-xl">
    <!-- Group Title Header -->
    <div class="px-4 py-3 bg-gradient-to-r from-pcl-royal/25 to-pcl-card border-b border-pcl-border flex items-center justify-between">
      <h3 class="font-bold text-sm text-white tracking-wide flex items-center gap-2 font-display text-base">
        <span class="w-2 h-2 rounded-full bg-pcl-gold"></span>
        {{ namaGrup }}
      </h3>
      <span class="text-[10px] sm:text-xs text-pcl-goldLight font-bold uppercase tracking-wider">Top 2 Lolos Knockout</span>
    </div>

    <!-- Standings Table -->
    <div class="overflow-x-auto scrollbar-thin">
      <table class="w-full text-left text-xs min-w-[340px] sm:min-w-[450px]">
        <thead class="bg-pcl-navy/60 text-pcl-silver font-bold uppercase tracking-wider border-b border-pcl-border/70 text-[10px] sm:text-xs">
          <tr>
            <th class="py-2.5 px-2 sm:px-3 w-7 sm:w-8 text-center">#</th>
            <th class="py-2.5 px-2 sm:px-3">Klub</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center" title="Main">P</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center text-emerald-400" title="Menang">W</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center" title="Seri">D</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center text-red-400" title="Kalah">L</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center hidden sm:table-cell" title="Gol Masuk">GF</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center hidden sm:table-cell" title="Gol Kemasukan">GA</th>
            <th class="py-2.5 px-1.5 sm:px-2 text-center" title="Selisih Gol">GD</th>
            <th class="py-2.5 px-2 sm:px-3 text-center font-black text-white" title="Poin">PTS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-pcl-border/50 text-slate-200">
          <tr
            v-for="(row, idx) in klasemen"
            :key="row.team_id"
            class="hover:bg-pcl-cardLight/50 transition-colors"
            :class="{
              'bg-pcl-royal/10': idx < 2
            }"
          >
            <!-- Rank Indicator -->
            <td class="py-2.5 px-2 sm:px-3 text-center font-bold">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] sm:text-xs"
                :class="[
                  idx === 0 ? 'bg-gradient-to-br from-pcl-gold to-pcl-bronze text-slate-950 font-black shadow-sm' :
                  idx === 1 ? 'bg-pcl-royal/40 text-pcl-blueGlow border border-pcl-blueGlow/30 font-black' :
                  'text-pcl-silver/60'
                ]"
              >
                {{ idx + 1 }}
              </span>
            </td>

            <!-- Team Name -->
            <td class="py-2.5 px-2 sm:px-3 font-semibold text-white flex items-center gap-1.5 sm:gap-2">
              <span class="w-6 h-6 rounded bg-pcl-navy border border-pcl-border text-[9px] sm:text-[10px] flex items-center justify-center font-bold text-pcl-gold shrink-0">
                {{ row.team_short_name || 'TIM' }}
              </span>
              <span class="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none text-xs sm:text-sm">{{ row.team_name }}</span>
            </td>

            <!-- Stats -->
            <td class="py-2.5 px-1.5 sm:px-2 text-center font-mono">{{ row.played }}</td>
            <td class="py-2.5 px-1.5 sm:px-2 text-center font-mono text-emerald-400 font-semibold">{{ row.won }}</td>
            <td class="py-2.5 px-1.5 sm:px-2 text-center font-mono text-pcl-silver">{{ row.drawn }}</td>
            <td class="py-2.5 px-1.5 sm:px-2 text-center font-mono text-red-400">{{ row.lost }}</td>
            <td class="py-2.5 px-1.5 sm:px-2 text-center font-mono text-pcl-silver hidden sm:table-cell">{{ row.goals_for }}</td>
            <td class="py-2.5 px-1.5 sm:px-2 text-center font-mono text-pcl-silver hidden sm:table-cell">{{ row.goals_against }}</td>
            <td
              class="py-2.5 px-1.5 sm:px-2 text-center font-mono font-bold"
              :class="[
                row.goal_difference > 0 ? 'text-emerald-400' :
                row.goal_difference < 0 ? 'text-red-400' : 'text-pcl-silver'
              ]"
            >
              {{ row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference }}
            </td>
            <td class="py-2.5 px-2 sm:px-3 text-center font-mono font-black text-pcl-goldLight bg-pcl-navy/50">
              {{ row.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
