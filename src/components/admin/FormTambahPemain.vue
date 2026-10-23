<script setup>
import { ref } from "vue";
import { Plus } from "lucide-vue-next";
import TombolDasar from "../umum/TombolDasar.vue";

const props = defineProps({
  opsiPosisi: {
    type: Array,
    default: () => ["GK", "DF", "CB", "MF", "CM", "WF", "FW", "ST"],
  },
  sedangMemuat: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["tambah"]);

const form = ref({
  name: "",
  game_id: "",
  position: "FW",
  goals: 0,
  assists: 0,
  passes: 0,
  defense: 0,
  mvp: 0,
});

function handleSubmit() {
  if (!form.value.name.trim()) return;
  emit("tambah", {
    name: form.value.name.trim(),
    game_id: form.value.game_id.trim() || null,
    position: form.value.position,
    goals: Math.max(0, Number(form.value.goals) || 0),
    assists: Math.max(0, Number(form.value.assists) || 0),
    passes: Math.max(0, Number(form.value.passes) || 0),
    defense: Math.max(0, Number(form.value.defense) || 0),
    mvp: Math.max(0, Number(form.value.mvp) || 0),
  });
  form.value = {
    name: "",
    game_id: "",
    position: "FW",
    goals: 0,
    assists: 0,
    passes: 0,
    defense: 0,
    mvp: 0,
  };
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 anim-muncul"
  >
    <div class="flex items-center justify-between pb-2 border-b border-blue-200/60">
      <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
        <Plus class="w-3.5 h-3.5 text-blue-700" />
        Tambah Pemain Baru
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
      <div class="sm:col-span-5">
        <label class="block text-[11px] font-semibold text-slate-700 mb-1">
          Nama Pemain *
        </label>
        <input
          v-model="form.name"
          type="text"
          placeholder="contoh: Erling Haaland"
          class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-900 outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500"
          required
        />
      </div>

      <div class="sm:col-span-4">
        <label class="block text-[11px] font-semibold text-slate-700 mb-1">
          ID Game
        </label>
        <input
          v-model="form.game_id"
          type="text"
          placeholder="contoh: 12889220"
          class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-900 outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500"
        />
      </div>

      <div class="sm:col-span-3">
        <label class="block text-[11px] font-semibold text-slate-700 mb-1">
          Posisi
        </label>
        <select
          v-model="form.position"
          class="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-900 outline-none focus:border-ucl-500"
        >
          <option v-for="pos in opsiPosisi" :key="pos" :value="pos">
            {{ pos }}
          </option>
        </select>
      </div>
    </div>

    <!-- Input Statistik Awal -->
    <div class="pt-2 border-t border-blue-200/50">
      <label class="block text-[11px] font-bold text-blue-900 mb-1.5">
        Statistik Awal Pemain:
      </label>
      <div class="grid grid-cols-5 gap-2 text-center text-xs">
        <div>
          <span class="text-[10px] font-semibold text-emerald-700 block">Gol</span>
          <input
            v-model.number="form.goals"
            type="number"
            min="0"
            class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
          />
        </div>
        <div>
          <span class="text-[10px] font-semibold text-blue-700 block">Assist</span>
          <input
            v-model.number="form.assists"
            type="number"
            min="0"
            class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
          />
        </div>
        <div>
          <span class="text-[10px] font-semibold text-indigo-700 block">Pass</span>
          <input
            v-model.number="form.passes"
            type="number"
            min="0"
            class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
          />
        </div>
        <div>
          <span class="text-[10px] font-semibold text-purple-700 block">Def</span>
          <input
            v-model.number="form.defense"
            type="number"
            min="0"
            class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
          />
        </div>
        <div>
          <span class="text-[10px] font-semibold text-amber-700 block">MVP</span>
          <input
            v-model.number="form.mvp"
            type="number"
            min="0"
            class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2 pt-2">
      <TombolDasar
        tipe="submit"
        varian="primer"
        ukuran="kecil"
        :sedangMemuat="sedangMemuat"
      >
        Simpan Pemain
      </TombolDasar>
    </div>
  </form>
</template>
