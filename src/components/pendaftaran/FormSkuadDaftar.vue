<script setup>
import { User, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  kaptenNoHp: {
    type: String,
    default: ''
  },
  kaptenGameId: {
    type: String,
    default: ''
  },
  kaptenNickname: {
    type: String,
    default: ''
  },
  kaptenRole: {
    type: String,
    default: 'CM'
  },
  daftarAnggota: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:kaptenNoHp',
  'update:kaptenGameId',
  'update:kaptenNickname',
  'update:kaptenRole',
  'tambahAnggota',
  'hapusAnggota'
])

const opsiRole = [
  { value: 'GK', label: 'GK - Goalkeeper' },
  { value: 'CB', label: 'CB - Center Back' },
  { value: 'CM', label: 'CM - Central Midfielder' },
  { value: 'WF', label: 'WF - Winger / Forward' },
  { value: 'ST', label: 'ST - Striker' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Section 2: Data Kapten -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
        <User class="w-5 h-5 text-ucl-600" />
        <h3 class="text-base font-semibold text-ink-900">2. Data Kapten Tim</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">No WhatsApp / HP *</label>
          <input
            :value="kaptenNoHp"
            @input="emit('update:kaptenNoHp', $event.target.value)"
            type="tel"
            placeholder="08123456789"
            class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">ID Game Kapten *</label>
          <input
            :value="kaptenGameId"
            @input="emit('update:kaptenGameId', $event.target.value)"
            type="text"
            placeholder="ID Akun Game"
            class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Nickname In-Game *</label>
          <input
            :value="kaptenNickname"
            @input="emit('update:kaptenNickname', $event.target.value)"
            type="text"
            placeholder="Nickname Game"
            class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-ink-600 mb-1.5">Role Kapten</label>
          <select
            :value="kaptenRole"
            @change="emit('update:kaptenRole', $event.target.value)"
            class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-ink-900 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20 cursor-pointer"
          >
            <option v-for="r in opsiRole" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section 3: Anggota Skuad (Dinamis) -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
        <User class="w-5 h-5 text-ucl-600" />
        <h3 class="text-base font-semibold text-ink-900">3. Anggota Tim ({{ daftarAnggota.length }})</h3>
      </div>

      <div
        v-if="daftarAnggota.length === 0"
        class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3"
      >
        <p>Belum ada anggota skuad tambahan. Klik tombol di bawah untuk memasukkan pemain tim.</p>
        <button
          type="button"
          @click="emit('tambahAnggota')"
          class="px-4 py-2 rounded-xl bg-ucl-600 text-white text-xs font-semibold hover:bg-ucl-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus class="w-4 h-4" />
          Tambah Anggota Pertama
        </button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(item, idx) in daftarAnggota"
          :key="item.id || idx"
          class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
        >
          <div class="sm:col-span-4">
            <label class="block text-[11px] font-semibold text-slate-500 mb-1">ID Game Pemain {{ idx + 1 }}</label>
            <input
              v-model="item.game_id"
              type="text"
              placeholder="ID Game"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-ucl-500"
              required
            />
          </div>

          <div class="sm:col-span-5">
            <label class="block text-[11px] font-semibold text-slate-500 mb-1">Nickname Pemain {{ idx + 1 }}</label>
            <input
              v-model="item.nickname"
              type="text"
              placeholder="Nickname Game"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-ucl-500"
              required
            />
          </div>

          <div class="sm:col-span-3 flex items-end gap-2">
            <div class="flex-1">
              <label class="block text-[11px] font-semibold text-slate-500 mb-1">Role</label>
              <select
                v-model="item.role"
                class="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-900 outline-none focus:border-ucl-500"
              >
                <option v-for="r in opsiRole" :key="r.value" :value="r.value">
                  {{ r.value }}
                </option>
              </select>
            </div>

            <button
              type="button"
              @click="emit('hapusAnggota', idx)"
              class="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
              title="Hapus Pemain"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="pt-2">
          <button
            type="button"
            @click="emit('tambahAnggota')"
            class="w-full py-2.5 rounded-xl border-2 border-dashed border-ucl-200 bg-ucl-50/50 hover:bg-ucl-50 text-ucl-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            Tambah Anggota Skuad Lainnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
