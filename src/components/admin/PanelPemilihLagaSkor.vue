<script setup>
import { ref, computed } from 'vue'
import { Filter, Search, CheckCircle2, Clock, Edit3, Calendar } from 'lucide-vue-next'
import LencanaStatus from '../umum/LencanaStatus.vue'
import TombolDasar from '../umum/TombolDasar.vue'

const props = defineProps({
  daftarLaga: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'bukaModalSkor'])

const filterStatus = ref('pending') // 'pending' default agar fokus laga yang perlu diisi
const filterFase = ref('semua')
const kataKunci = ref('')

const lagaTerfilter = computed(() => {
  return props.daftarLaga.filter(m => {
    // Filter status
    if (filterStatus.value === 'pending' && m.status === 'finished') return false
    if (filterStatus.value === 'finished' && m.status !== 'finished') return false

    // Filter fase
    if (filterFase.value !== 'semua' && m.stage !== filterFase.value) return false

    // Filter search text
    if (kataKunci.value.trim()) {
      const q = kataKunci.value.toLowerCase()
      const home = (m.home_team?.name || '').toLowerCase()
      const away = (m.away_team?.name || '').toLowerCase()
      const shortHome = (m.home_team?.short_name || '').toLowerCase()
      const shortAway = (m.away_team?.short_name || '').toLowerCase()
      if (!home.includes(q) && !away.includes(q) && !shortHome.includes(q) && !shortAway.includes(q)) {
        return false
      }
    }

    return true
  })
})

function formatWaktu(isoStr) {
  if (!isoStr) return '-'
  try {
    const d = new Date(isoStr)
    const hariStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    const jamStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return `${hariStr}, ${jamStr} WIB`
  } catch (e) {
    return '-'
  }
}

function ambilPlaceholderNama(laga, posisi) {
  const team = posisi === 'home' ? laga.home_team : laga.away_team
  if (team?.name) return team.name
  const stage = laga.stage
  const slot = laga.knockout_bracket_slot || ''
  if (stage === 'semi_final') {
    const isSF1 = /SF[- ]?1/i.test(slot)
    if (posisi === 'home') return isSF1 ? 'Pemenang QF 1' : 'Pemenang QF 3'
    return isSF1 ? 'Pemenang QF 2' : 'Pemenang QF 4'
  }
  if (stage === 'final') {
    return posisi === 'home' ? 'Pemenang SF 1' : 'Pemenang SF 2'
  }
  return posisi === 'home' ? 'Home' : 'Away'
}

function ambilPlaceholderShort(laga, posisi) {
  const team = posisi === 'home' ? laga.home_team : laga.away_team
  if (team?.short_name) return team.short_name
  const stage = laga.stage
  const slot = laga.knockout_bracket_slot || ''
  if (stage === 'semi_final') {
    const isSF1 = /SF[- ]?1/i.test(slot)
    if (posisi === 'home') return isSF1 ? 'W1' : 'W3'
    return isSF1 ? 'W2' : 'W4'
  }
  if (stage === 'final') {
    return posisi === 'home' ? 'F1' : 'F2'
  }
  return posisi === 'home' ? 'H' : 'A'
}

function pilihLaga(id) {
  emit('update:modelValue', id)
  emit('bukaModalSkor', id)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden space-y-4 p-4 sm:p-5">
    <!-- Header & Filter Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <div>
        <h3 class="text-sm font-semibold text-ink-900">Tabel Jadwal &amp; Hasil Pertandingan</h3>
        <p class="text-[11px] text-slate-500">Klik baris atau tombol pada tabel untuk membuka popup input skor laga.</p>
      </div>

      <!-- Quick Filter Status Tabs -->
      <div class="inline-flex p-1 rounded-lg bg-slate-100 text-xs font-semibold self-start md:self-auto">
        <button
          type="button"
          @click="filterStatus = 'pending'"
          class="px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5"
          :class="filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          <Clock class="w-3.5 h-3.5 text-amber-500" />
          Belum Selesai ({{ daftarLaga.filter(m => m.status !== 'finished').length }})
        </button>
        <button
          type="button"
          @click="filterStatus = 'finished'"
          class="px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5"
          :class="filterStatus === 'finished' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          Selesai ({{ daftarLaga.filter(m => m.status === 'finished').length }})
        </button>
        <button
          type="button"
          @click="filterStatus = 'semua'"
          class="px-3 py-1.5 rounded-md transition cursor-pointer"
          :class="filterStatus === 'semua' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'"
        >
          Semua ({{ daftarLaga.length }})
        </button>
      </div>
    </div>

    <!-- Secondary Filters: Fase & Live Search -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-ucl-500 focus-within:bg-white transition">
        <Filter class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <select
          v-model="filterFase"
          class="w-full bg-transparent text-xs font-semibold text-ink-900 border-none outline-none cursor-pointer"
        >
          <option value="semua">Semua Babak</option>
          <option value="group">Fase Grup</option>
          <option value="round_of_32">Babak 32 Besar</option>
          <option value="round_of_16">Babak 16 Besar</option>
          <option value="quarter_final">Perempat Final / 8 Besar (BO3)</option>
          <option value="semi_final">Semi Final (BO3)</option>
          <option value="final">Grand Final (BO3)</option>
        </select>
      </div>

      <div class="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-ucl-500 focus-within:bg-white transition">
        <Search class="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
        <input
          v-model="kataKunci"
          type="text"
          placeholder="Cari klub peserta..."
          class="w-full bg-transparent text-xs font-medium text-ink-900 placeholder-slate-400 outline-none"
        />
      </div>
    </div>

    <!-- Table Section -->
    <div class="border border-slate-200 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[640px]">
          <thead class="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3">Fase &amp; MD</th>
              <th class="py-2.5 px-3">Pertandingan</th>
              <th class="py-2.5 px-3 text-center">Skor</th>
              <th class="py-2.5 px-3 hidden sm:table-cell">Waktu Laga</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="lagaTerfilter.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                Tidak ada data pertandingan yang sesuai dengan filter.
              </td>
            </tr>

            <tr
              v-for="laga in lagaTerfilter"
              :key="laga.id"
              @click="pilihLaga(laga.id)"
              class="transition-colors cursor-pointer"
              :class="modelValue === laga.id ? 'bg-ucl-50/70' : 'hover:bg-slate-50/80'"
            >
              <!-- Fase & Slot -->
              <td class="py-3 px-3 whitespace-nowrap">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    v-if="laga.stage === 'quarter_final' || laga.stage === 'semi_final' || laga.stage === 'final'"
                    class="px-1.5 py-0.2 rounded bg-gold-100 text-gold-800 border border-gold-300 font-bold text-[9px] uppercase tracking-wider"
                  >
                    BO3
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {{
                      laga.stage === 'group'
                        ? (laga.knockout_bracket_slot || laga.group?.name || laga.home_team?.group_name || 'Fase Grup')
                        : (laga.stage === 'quarter_final' || laga.stage === 'semi_final' || laga.stage === 'final')
                          ? `${laga.stage === 'quarter_final' ? '8 Besar' : laga.stage === 'semi_final' ? 'Semi Final' : 'Grand Final'} · ${laga.knockout_bracket_slot || `Game ${laga.matchday || 1}`}`
                          : (laga.knockout_bracket_slot ? `${laga.stage?.replace('_', ' ').toUpperCase()} · ${laga.knockout_bracket_slot}` : (laga.stage ? laga.stage.replace('_', ' ').toUpperCase() : 'KNOCKOUT'))
                    }}
                  </span>
                </div>
                <span v-if="laga.stage === 'group' && laga.matchday" class="ml-1 text-[10px] text-slate-400 font-medium">
                  MD {{ laga.matchday }}
                </span>
              </td>

              <!-- Match Teams -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1.5 font-medium text-ink-900 truncate max-w-[140px] sm:max-w-none">
                    <img
                      v-if="laga.home_team?.logo_url"
                      :src="laga.home_team.logo_url"
                      :alt="laga.home_team.name"
                      class="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                      loading="lazy"
                      decoding="async"
                    />
                    <span
                      v-else
                      class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-[8px] flex items-center justify-center font-bold text-blue-900 tracking-wider shrink-0"
                    >
                      {{ ambilPlaceholderShort(laga, 'home') }}
                    </span>
                    <span class="truncate">{{ ambilPlaceholderNama(laga, 'home') }}</span>
                  </div>

                  <span class="text-slate-400 font-semibold text-[10px]">vs</span>

                  <div class="flex items-center gap-1.5 font-medium text-ink-900 truncate max-w-[140px] sm:max-w-none">
                    <img
                      v-if="laga.away_team?.logo_url"
                      :src="laga.away_team.logo_url"
                      :alt="laga.away_team.name"
                      class="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                      loading="lazy"
                      decoding="async"
                    />
                    <span
                      v-else
                      class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-[8px] flex items-center justify-center font-bold text-amber-700 tracking-wider shrink-0"
                    >
                      {{ ambilPlaceholderShort(laga, 'away') }}
                    </span>
                    <span class="truncate">{{ ambilPlaceholderNama(laga, 'away') }}</span>
                  </div>
                </div>
              </td>

              <!-- Score -->
              <td class="py-3 px-3 text-center tabular-nums font-semibold whitespace-nowrap">
                <span
                  v-if="laga.status !== 'scheduled'"
                  class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-ucl-700 shadow-sm"
                >
                  {{ laga.home_score ?? 0 }} – {{ laga.away_score ?? 0 }}
                </span>
                <span v-else class="text-slate-400 font-normal">- : -</span>
              </td>

              <!-- Scheduled Time -->
              <td class="py-3 px-3 text-slate-500 whitespace-nowrap hidden sm:table-cell">
                <div class="flex items-center gap-1 text-[11px]">
                  <Calendar class="w-3 h-3 text-slate-400 shrink-0" />
                  {{ formatWaktu(laga.scheduled_at) }}
                </div>
              </td>

              <!-- Status -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <LencanaStatus :status="laga.status" />
              </td>

              <!-- Action Button -->
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <TombolDasar
                  varian="primer"
                  class="!px-3 !py-1 text-xs"
                  @click.stop="pilihLaga(laga.id)"
                >
                  <Edit3 class="w-3 h-3 mr-1" />
                  {{ laga.status === 'finished' ? 'Edit Skor' : 'Input Skor' }}
                </TombolDasar>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
