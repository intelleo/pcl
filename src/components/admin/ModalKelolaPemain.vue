<script setup>
import { ref, watch } from "vue";
import { api } from "../../lib/api.js";
import { invalidateCache } from "../../lib/cache.js";
import { Plus, X, Check, AlertCircle } from "lucide-vue-next";
import ModalDialog from "../umum/ModalDialog.vue";
import FormTambahPemain from "./FormTambahPemain.vue";
import TabelKelolaPemain from "./TabelKelolaPemain.vue";

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
      game_id: p.game_id || null,
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

async function tambahPemainBaru(payload) {
  if (!payload.name?.trim() || !props.tim?.id) return;
  sedangMemuat.value = true;
  pesanSukses.value = null;
  pesanError.value = null;

  try {
    const noPunggungOtomatis = (daftarPemain.value.length || 0) + 1;
    await api.createPlayer({
      team_id: props.tim.id,
      squad_number: noPunggungOtomatis,
      ...payload,
    });
    invalidateCache();
    emit("dataBerubah");
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
    lebarMaksimal="max-w-6xl"
    @tutup="emit('tutup')"
  >
    <div class="space-y-4 overflow-y-auto pr-1">
      <!-- Header Info Tim -->
      <div
        class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
      >
        <div class="flex items-center gap-2.5">
          <img
            v-if="tim?.logo_url"
            :src="tim.logo_url"
            :alt="tim.name"
            class="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div
            v-else
            class="w-9 h-9 rounded-lg bg-blue-100 text-ucl-700 font-bold text-xs flex items-center justify-center shrink-0"
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
              •
              <span class="font-semibold text-slate-700">
                Total: {{ daftarPemain.length }} Pemain
              </span>
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

      <!-- Form Tambah Pemain Baru (Collapsible) -->
      <FormTambahPemain
        v-if="formTambahTerbuka"
        :opsiPosisi="opsiPosisi"
        :sedangMemuat="sedangMemuat"
        @tambah="tambahPemainBaru"
      />

      <!-- State Loading & Kosong -->
      <div
        v-if="sedangMemuat && daftarPemain.length === 0"
        class="py-12 text-center text-xs text-slate-400"
      >
        Memuat data pemain...
      </div>

      <div
        v-else-if="daftarPemain.length === 0"
        class="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2 p-6"
      >
        <p class="text-xs font-semibold text-slate-600">Belum ada pemain di tim ini.</p>
        <p class="text-[11px] text-slate-400">
          Klik tombol "Tambah Pemain" di atas untuk mulai menambahkan skuad tim.
        </p>
      </div>

      <!-- Tabel Skuad Pemain & Statistik -->
      <TabelKelolaPemain
        v-else
        :daftarPemain="daftarPemain"
        :opsiPosisi="opsiPosisi"
        :idSedangSimpan="idSedangSimpan"
        :sedangMemuat="sedangMemuat"
        @simpan="simpanPemain"
        @hapus="hapusPemain"
      />
    </div>
  </ModalDialog>
</template>
