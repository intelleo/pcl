<script setup>
import ModalDialog from '../umum/ModalDialog.vue'
import LencanaStatus from '../umum/LencanaStatus.vue'

defineProps({
  terbuka: {
    type: Boolean,
    default: false
  },
  laga: {
    type: Object,
    default: null
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tutup'])
</script>

<template>
  <ModalDialog :terbuka="terbuka" judul="Rincian Pertandingan" @tutup="emit('tutup')" lebarMaksimal="max-w-xl">
    <div v-if="laga" class="space-y-6">
      <!-- Scoreboard Big Header -->
      <div class="bg-slate-900/80 rounded-xl p-5 border border-slate-800 flex items-center justify-between">
        <!-- Home Team -->
        <div class="flex-1 text-center">
          <div class="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-slate-200 mb-2">
            {{ laga.home_team?.short_name || 'HOM' }}
          </div>
          <h4 class="font-bold text-sm text-slate-100">{{ laga.home_team?.name }}</h4>
        </div>

        <!-- Center Score -->
        <div class="px-4 text-center">
          <div class="text-3xl font-black font-mono tracking-wider text-emerald-400">
            {{ laga.status !== 'scheduled' ? `${laga.home_score} - ${laga.away_score}` : 'VS' }}
          </div>
          <div class="mt-1">
            <LencanaStatus :status="laga.status" />
          </div>
        </div>

        <!-- Away Team -->
        <div class="flex-1 text-center">
          <div class="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-slate-200 mb-2">
            {{ laga.away_team?.short_name || 'AWY' }}
          </div>
          <h4 class="font-bold text-sm text-slate-100">{{ laga.away_team?.name }}</h4>
        </div>
      </div>

      <!-- Match Timeline Events -->
      <div>
        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <span>Event & Pencetak Gol</span>
          <span class="h-px flex-1 bg-slate-800"></span>
        </h5>

        <div v-if="events.length === 0" class="text-center py-6 text-slate-500 text-sm">
          Belum ada event / gol yang tercatat pada laga ini.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="ev in events"
            :key="ev.id"
            class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-sm"
          >
            <!-- Minute & Event Icon -->
            <div class="flex items-center gap-3">
              <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {{ ev.minute }}'
              </span>
              <span
                class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide"
                :class="{
                  'bg-emerald-500/20 text-emerald-400': ev.event_type === 'goal' || ev.event_type === 'penalty_goal',
                  'bg-amber-500/20 text-amber-400': ev.event_type === 'yellow_card',
                  'bg-red-500/20 text-red-400': ev.event_type === 'red_card',
                  'bg-purple-500/20 text-purple-400': ev.event_type === 'own_goal'
                }"
              >
                {{ ev.event_type.replace('_', ' ') }}
              </span>
              <span class="font-semibold text-slate-200">
                {{ ev.player?.name || 'Pemain' }}
              </span>
            </div>

            <!-- Team & Assist Info -->
            <div class="text-xs text-slate-400">
              <span v-if="ev.assist_player" class="mr-2 text-slate-500">
                (Ast: {{ ev.assist_player.name }})
              </span>
              <span class="font-bold text-slate-300">{{ ev.team?.short_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>
