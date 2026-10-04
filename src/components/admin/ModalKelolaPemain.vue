<script setup>
import { ref, watch } from "vue";
import { api } from "../../lib/api.js";
import { invalidateCache } from "../../lib/cache.js";
import {
  Users,
  Plus,
  X,
  Trash2,
  Check,
  AlertCircle,
  Save,
  Award,
  Shield,
  Footprints,
  Target,
  Sparkles,
  Activity,
} from "lucide-vue-next";
import ModalDialog from "../umum/ModalDialog.vue";
import TombolDasar from "../umum/TombolDasar.vue";

const props = defineProps({
  terbuka: {
    type: Boolean,
    default: false,
  },
  tim: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["tutup", "dataBerubah"]);

const daftarPemain = ref([]);
const sedangMemuat = ref(false);
const idSedangSimpan = ref(null);
const pesanSukses = ref(null);
const pesanError = ref(null);

const formTambahTerbuka = ref(false);
const pemainBaru = ref({
  name: "",
  squad_number: 10,
  position: "FW",
  goals: 0,
  assists: 0,
  passes: 0,
  defense: 0,
  mvp: 0,
});

const opsiPosisi = ["GK", "DF", "CB", "MF", "CM", "WF", "FW", "ST"];

watch(
  () => props.terbuka,
  async (buka) => {
    if (buka && props.tim?.id) {
      await muatDaftarPemain();
    } else {
      daftarPemain.value = [];
      formTambahTerbuka.value = false;
      pesanSukses.value = null;
      pesanError.value = null;
    }
  },
  { immediate: true },
);

async function muatDaftarPemain() {
  if (!props.tim?.id) return;
  sedangMemuat.value = true;
  try {
    const data = await api.getPlayers({ team_id: props.tim.id });
    daftarPemain.value = (data || []).map((p) => ({
      ...p,
      goals: Number(p.goals) || 0,
      assists: Number(p.assists) || 0,
      passes: Number(p.passes) || 0,
      defense: Number(p.defense) || 0,
      mvp: Number(p.mvp) || 0,
    }));
  } catch (err) {
    pesanError.value = `Gagal memuat pemain: ${err.message}`;
  } finally {
    sedangMemuat.value = false;
  }
}

async function simpanPemain(p) {
  idSedangSimpan.value = p.id;
  pesanSukses.value = null;
  pesanError.value = null;

  try {
    await api.updatePlayer(p.id, {
      name: p.name,
      squad_number: Number(p.squad_number) || 1,
      position: p.position,
      goals: Math.max(0, Number(p.goals) || 0),
      assists: Math.max(0, Number(p.assists) || 0),
      passes: Math.max(0, Number(p.passes) || 0),
      defense: Math.max(0, Number(p.defense) || 0),
      mvp: Math.max(0, Number(p.mvp) || 0),
    });
    invalidateCache();
    emit("dataBerubah");
    pesanSukses.value = `Statistik ${p.name} berhasil disimpan!`;
    setTimeout(() => {
      pesanSukses.value = null;
    }, 3000);
  } catch (err) {
    pesanError.value = `Gagal menyimpan: ${err.message}`;
  } finally {
    idSedangSimpan.value = null;
  }
}

async function tambahPemainBaru() {
  if (!pemainBaru.value.name.trim() || !props.tim?.id) return;
  sedangMemuat.value = true;
  pesanSukses.value = null;
  pesanError.value = null;

  try {
    await api.createPlayer({
      team_id: props.tim.id,
      name: pemainBaru.value.name.trim(),
      squad_number: Number(pemainBaru.value.squad_number) || 1,
      position: pemainBaru.value.position,
      goals: Math.max(0, Number(pemainBaru.value.goals) || 0),
      assists: Math.max(0, Number(pemainBaru.value.assists) || 0),
      passes: Math.max(0, Number(pemainBaru.value.passes) || 0),
      defense: Math.max(0, Number(pemainBaru.value.defense) || 0),
      mvp: Math.max(0, Number(pemainBaru.value.mvp) || 0),
    });
    invalidateCache();
    emit("dataBerubah");
    pemainBaru.value = {
      name: "",
      squad_number: 10,
      position: "FW",
      goals: 0,
      assists: 0,
      passes: 0,
      defense: 0,
      mvp: 0,
    };
    formTambahTerbuka.value = false;
    await muatDaftarPemain();
    pesanSukses.value = "Pemain baru berhasil ditambahkan!";
    setTimeout(() => {
      pesanSukses.value = null;
    }, 3000);
  } catch (err) {
    pesanError.value = `Gagal menambah pemain: ${err.message}`;
  } finally {
    sedangMemuat.value = false;
  }
}

async function hapusPemain(p) {
  if (!confirm(`Hapus pemain ${p.name} dari tim ${props.tim?.name}?`)) return;
  try {
    await api.deletePlayer(p.id);
    daftarPemain.value = daftarPemain.value.filter((item) => item.id !== p.id);
    invalidateCache();
    emit("dataBerubah");
    pesanSukses.value = `Pemain ${p.name} dihapus.`;
    setTimeout(() => {
      pesanSukses.value = null;
    }, 3000);
  } catch (err) {
    pesanError.value = `Gagal menghapus pemain: ${err.message}`;
  }
}
</script>

<template>
  <ModalDialog
    :terbuka="terbuka"
    :judul="`Kelola Skuad & Statistik — ${tim?.name || 'Klub'}`"
    lebarMaksimal="max-w-4xl"
    @tutup="emit('tutup')"
  >
    <div class="space-y-4 ] overflow-y-auto pr-1">
      <!-- Header Info Tim -->
      <div
        class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
      >
        <div class="flex items-center gap-2.5">
          <img
            v-if="tim?.logo_url"
            :src="tim.logo_url"
            :alt="tim.name"
            class="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div
            v-else
            class="w-8 h-8 rounded-lg bg-blue-100 text-ucl-700 font-bold text-xs flex items-center justify-center shrink-0"
          >
            {{ tim?.short_name || "TIM" }}
          </div>
          <div>
            <h4 class="text-xs font-bold text-ink-900">{{ tim?.name }}</h4>
            <p class="text-[11px] text-slate-500">
              Grup:
              <span class="font-semibold text-ucl-600">{{
                tim?.group_name || "Belum Ditentukan"
              }}</span>
              • Total: {{ daftarPemain.length }} Pemain
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="formTambahTerbuka = !formTambahTerbuka"
          class="px-2.5 py-1.5 rounded-lg bg-ucl-600 text-white text-xs font-semibold hover:bg-ucl-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <component :is="formTambahTerbuka ? X : Plus" class="w-3.5 h-3.5" />
          <span>{{ formTambahTerbuka ? "Batal" : "Tambah Pemain" }}</span>
        </button>
      </div>

      <!-- Toast Alerts -->
      <div
        v-if="pesanSukses"
        class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
      >
        <Check class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{{ pesanSukses }}</span>
      </div>

      <div
        v-if="pesanError"
        class="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
        <span>{{ pesanError }}</span>
      </div>

      <!-- Form Tambah Pemain Baru -->
      <form
        v-if="formTambahTerbuka"
        @submit.prevent="tambahPemainBaru"
        class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 anim-muncul"
      >
        <div
          class="flex items-center justify-between pb-2 border-b border-blue-200/60"
        >
          <span
            class="text-xs font-bold text-blue-900 flex items-center gap-1.5"
          >
            <Plus class="w-3.5 h-3.5 text-blue-700" />
            Tambah Pemain Baru
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div class="sm:col-span-2">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1"
              >Nama Pemain</label
            >
            <input
              v-model="pemainBaru.name"
              type="text"
              placeholder="contoh: Erling Haaland"
              class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-900 outline-none focus:border-ucl-500 focus:ring-1 focus:ring-ucl-500"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1"
                >No. Punggung</label
              >
              <input
                v-model.number="pemainBaru.squad_number"
                type="number"
                min="1"
                max="99"
                class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-900 outline-none focus:border-ucl-500"
                required
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1"
                >Posisi</label
              >
              <select
                v-model="pemainBaru.position"
                class="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-900 outline-none focus:border-ucl-500"
              >
                <option v-for="pos in opsiPosisi" :key="pos" :value="pos">
                  {{ pos }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Input Statistik Awal -->
        <div class="pt-2 border-t border-blue-200/50">
          <label class="block text-[11px] font-bold text-blue-900 mb-1.5"
            >Statistik Awal Pemain:</label
          >
          <div class="grid grid-cols-5 gap-2 text-center text-xs">
            <div>
              <span class="text-[10px] font-semibold text-emerald-700 block"
                >Gol</span
              >
              <input
                v-model.number="pemainBaru.goals"
                type="number"
                min="0"
                class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
              />
            </div>
            <div>
              <span class="text-[10px] font-semibold text-blue-700 block"
                >Assist</span
              >
              <input
                v-model.number="pemainBaru.assists"
                type="number"
                min="0"
                class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
              />
            </div>
            <div>
              <span class="text-[10px] font-semibold text-indigo-700 block"
                >Pass</span
              >
              <input
                v-model.number="pemainBaru.passes"
                type="number"
                min="0"
                class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
              />
            </div>
            <div>
              <span class="text-[10px] font-semibold text-purple-700 block"
                >Def</span
              >
              <input
                v-model.number="pemainBaru.defense"
                type="number"
                min="0"
                class="w-full bg-white border border-slate-300 rounded p-1 text-center font-bold text-xs"
              />
            </div>
            <div>
              <span class="text-[10px] font-semibold text-amber-700 block"
                >MVP</span
              >
              <input
                v-model.number="pemainBaru.mvp"
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

      <!-- Daftar Pemain Table / List -->
      <div
        v-if="sedangMemuat && daftarPemain.length === 0"
        class="py-8 text-center text-xs text-slate-400"
      >
        Memuat data pemain...
      </div>

      <div
        v-else-if="daftarPemain.length === 0"
        class="py-8 text-center text-xs text-slate-400"
      >
        Belum ada pemain di tim ini. Klik "Tambah Pemain" untuk mendaftarkan
        pemain.
      </div>

      <div v-else class="space-y-3">
        <div
          class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between"
        >
          <span>Daftar Skuad &amp; Statistik Performa</span>
          <span class="text-[10px] text-slate-400 lowercase font-normal"
            >(klik simpan untuk memperbarui)</span
          >
        </div>

        <div
          v-for="p in daftarPemain"
          :key="p.id"
          class="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-2.5"
        >
          <!-- Baris Identitas Pemain -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-1 min-w-[200px]">
              <span
                class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center shrink-0"
              >
                #{{ p.squad_number }}
              </span>
              <div class="flex-1">
                <input
                  v-model="p.name"
                  type="text"
                  class="w-full font-bold text-xs text-ink-900 border-b border-transparent hover:border-slate-300 focus:border-ucl-500 outline-none px-1 py-0.5 rounded transition"
                  placeholder="Nama Pemain"
                />
              </div>
              <select
                v-model="p.position"
                class="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 outline-none"
              >
                <option v-for="pos in opsiPosisi" :key="pos" :value="pos">
                  {{ pos }}
                </option>
              </select>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="simpanPemain(p)"
                :disabled="idSedangSimpan === p.id"
                class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Simpan Perubahan Pemain & Statistik"
              >
                <Save class="w-3 h-3" />
                <span>{{ idSedangSimpan === p.id ? "..." : "Simpan" }}</span>
              </button>
              <button
                type="button"
                @click="hapusPemain(p)"
                class="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Hapus Pemain"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Baris Input Statistik (Gol, Assist, Pass, Def, MVP) -->
          <div
            class="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center"
          >
            <!-- Gol -->
            <div
              class="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70"
            >
              <span
                class="text-[10px] font-bold text-emerald-800 flex items-center justify-center gap-1 mb-1"
              >
                <Target class="w-3 h-3 text-emerald-600" />
                Gol
              </span>
              <input
                v-model.number="p.goals"
                type="number"
                min="0"
                class="w-full bg-white border border-emerald-300 rounded px-1 py-0.5 text-center font-bold text-xs text-emerald-900 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <!-- Assist -->
            <div
              class="p-1.5 rounded-lg bg-blue-50/60 border border-blue-200/70"
            >
              <span
                class="text-[10px] font-bold text-blue-800 flex items-center justify-center gap-1 mb-1"
              >
                <Footprints class="w-3 h-3 text-blue-600" />
                Assist
              </span>
              <input
                v-model.number="p.assists"
                type="number"
                min="0"
                class="w-full bg-white border border-blue-300 rounded px-1 py-0.5 text-center font-bold text-xs text-blue-900 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <!-- Pass -->
            <div
              class="p-1.5 rounded-lg bg-indigo-50/60 border border-indigo-200/70"
            >
              <span
                class="text-[10px] font-bold text-indigo-800 flex items-center justify-center gap-1 mb-1"
              >
                <Activity class="w-3 h-3 text-indigo-600" />
                Pass
              </span>
              <input
                v-model.number="p.passes"
                type="number"
                min="0"
                class="w-full bg-white border border-indigo-300 rounded px-1 py-0.5 text-center font-bold text-xs text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <!-- Defense -->
            <div
              class="p-1.5 rounded-lg bg-purple-50/60 border border-purple-200/70"
            >
              <span
                class="text-[10px] font-bold text-purple-800 flex items-center justify-center gap-1 mb-1"
              >
                <Shield class="w-3 h-3 text-purple-600" />
                Def
              </span>
              <input
                v-model.number="p.defense"
                type="number"
                min="0"
                class="w-full bg-white border border-purple-300 rounded px-1 py-0.5 text-center font-bold text-xs text-purple-900 outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <!-- MVP -->
            <div
              class="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/70"
            >
              <span
                class="text-[10px] font-bold text-amber-800 flex items-center justify-center gap-1 mb-1"
              >
                <Award class="w-3 h-3 text-amber-600" />
                MVP
              </span>
              <input
                v-model.number="p.mvp"
                type="number"
                min="0"
                class="w-full bg-white border border-amber-300 rounded px-1 py-0.5 text-center font-bold text-xs text-amber-900 outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>
