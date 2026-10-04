<script setup>
import { ref, computed, watch } from "vue";
import { api } from "../lib/api.js";
import {
  Shield,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  QrCode,
  MessageCircle,
  ExternalLink,
} from "lucide-vue-next";
import TombolDasar from "../components/umum/TombolDasar.vue";

// State form
const pendaftaranBuka = ref(true);
const sedangMemuatCek = ref(true);
const sedangKirim = ref(false);
const pesanSukses = ref(false);
const pesanError = ref(null);

// Form Data
const namaTim = ref("");
const logoUrl = ref("");
const previewLogo = ref(null);

// Pembayaran & WA
const qrPembayaranUrl = ref("");
const biayaPendaftaran = ref("Rp 50.000 / Tim");
const kontakPanitiaWa = ref("081234567890");
const instruksiPembayaran = ref(
  "Scan QRIS pembayaran di bawah lalu kirim bukti transfer ke nomor WhatsApp panitia.",
);

const linkWhatsApp = computed(() => {
  let raw = (kontakPanitiaWa.value || "").replace(/\D/g, "");
  if (raw.startsWith("0")) raw = "62" + raw.slice(1);
  const pesan = encodeURIComponent(
    `Halo Panitia PCL, saya Kapten ${kaptenNickname.value || "Pendaftar"} dari tim ${namaTim.value || "-"} sudah mengisi formulir pendaftaran turnamen PCL 2026 dan ingin konfirmasi / kirim bukti transfer pembayaran.`,
  );
  return `https://wa.me/${raw}?text=${pesan}`;
});

function handleUnggahLogo(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert("Ukuran gambar logo maksimal 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    logoUrl.value = e.target.result;
    previewLogo.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Kapten
const kaptenNoHp = ref("");
const kaptenGameId = ref("");
const kaptenNickname = ref("");
const kaptenRole = ref("CM");

// Anggota Tim
const daftarAnggota = ref([]);
const opsiRole = [
  { value: "GK", label: "GK - Goalkeeper" },
  { value: "CB", label: "CB - Center Back" },
  { value: "CM", label: "CM - Central Midfielder" },
  { value: "WF", label: "WF - Winger / Forward" },
  { value: "ST", label: "ST - Striker" },
];

// Auto Generate / Input Tag Tim (Maks 3 Huruf)
const tagTim = ref("");
const tagTimManual = ref(false);

watch(namaTim, (val) => {
  if (!tagTimManual.value) {
    const text = val.trim();
    if (!text) {
      tagTim.value = "";
      return;
    }
    const kata = text.split(/\s+/).filter(Boolean);
    if (kata.length >= 3) {
      tagTim.value = (kata[0][0] + kata[1][0] + kata[2][0])
        .toUpperCase()
        .slice(0, 3);
    } else if (kata.length === 2) {
      tagTim.value = (kata[0].substring(0, 2) + kata[1].substring(0, 1))
        .toUpperCase()
        .slice(0, 3);
    } else {
      tagTim.value = text.substring(0, 3).toUpperCase();
    }
  }
});

function handleInputTagTim(e) {
  tagTimManual.value = true;
  tagTim.value = e.target.value.toUpperCase().slice(0, 3);
}

function tambahAnggota() {
  daftarAnggota.value.push({
    id: Date.now(),
    game_id: "",
    nickname: "",
    role: "CM",
  });
}

function hapusAnggota(index) {
  daftarAnggota.value.splice(index, 1);
}

async function cekStatusPendaftaran() {
  sedangMemuatCek.value = true;
  try {
    const settings = await api.getSettings();
    if (settings) {
      if (settings.pendaftaran_buka !== undefined) {
        pendaftaranBuka.value =
          settings.pendaftaran_buka === "true" ||
          settings.pendaftaran_buka === true;
      }
      if (settings.qr_pembayaran_url)
        qrPembayaranUrl.value = settings.qr_pembayaran_url;
      if (settings.biaya_pendaftaran)
        biayaPendaftaran.value = settings.biaya_pendaftaran;
      if (settings.kontak_panitia_wa)
        kontakPanitiaWa.value = settings.kontak_panitia_wa;
      if (settings.instruksi_pembayaran)
        instruksiPembayaran.value = settings.instruksi_pembayaran;
    } else {
      pendaftaranBuka.value = true;
    }
  } catch (e) {
    pendaftaranBuka.value = true;
  } finally {
    sedangMemuatCek.value = false;
  }
}

async function handleKirimPendaftaran() {
  if (!namaTim.value || !kaptenNoHp.value || !kaptenNickname.value) {
    pesanError.value =
      "Harap isi semua data wajib (Nama Tim, No HP Kapten & Nickname Kapten).";
    return;
  }

  sedangKirim.value = true;
  pesanError.value = null;

  try {
    const dataPendaftar = {
      nama_tim: namaTim.value.trim(),
      short_name: (tagTim.value.trim() || "TIM").toUpperCase().slice(0, 3),
      manager_name: kaptenNickname.value.trim(),
      kontak: kaptenNoHp.value.trim(),
      email: "pendaftar@pcl.com",
      catatan: JSON.stringify({
        logo_url: logoUrl.value.trim() || null,
        metode_konfirmasi: "whatsapp",
        kapten: {
          no_hp: kaptenNoHp.value.trim(),
          game_id: kaptenGameId.value.trim(),
          nickname: kaptenNickname.value.trim(),
          role: kaptenRole.value,
        },
        anggota: daftarAnggota.value.map((a) => ({
          game_id: a.game_id.trim(),
          nickname: a.nickname.trim(),
          role: a.role,
        })),
      }),
      status: "pending",
    };

    await api.createRegistration(dataPendaftar);
    pesanSukses.value = true;
  } catch (err) {
    pesanError.value = err.message || "Gagal mengirim pendaftaran tim.";
  } finally {
    sedangKirim.value = false;
  }
}

cekStatusPendaftaran();
</script>

<template>
  <div
    class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16 space-y-6 sm:space-y-8"
  >
    <!-- Header -->
    <div
      class="anim-muncul text-center space-y-2 pb-6 border-b border-slate-200"
    >
      <span
        class="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600"
        >Registrasi Resmi</span
      >
      <h1
        class="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink-900"
      >
        Pendaftaran Tim Peak Champions League
      </h1>
      <p
        class="text-xs sm:text-sm text-ink-400 max-w-xl mx-auto leading-relaxed"
      >
        Daftarkan klub dan skuad terbaikmu untuk berlaga di turnamen PCL 2026.
      </p>
    </div>

    <!-- State Loading -->
    <div
      v-if="sedangMemuatCek"
      class="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"
    ></div>

    <!-- State Pendaftaran Ditutup -->
    <div
      v-else-if="!pendaftaranBuka"
      class="anim-muncul bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-card space-y-4"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm"
      >
        <Lock class="w-7 h-7" />
      </div>
      <h2 class="text-xl font-bold text-ink-900">
        Pendaftaran PCL 2026 Saat Ini Ditutup
      </h2>
      <p
        class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed"
      >
        Kuota pendaftaran tim telah terpenuhi atau masa pendaftaran telah
        ditutup oleh panitia. Pantau terus informasi turnamen di halaman Berita.
      </p>
    </div>

    <!-- State Sukses Mendaftar -->
    <div
      v-else-if="pesanSukses"
      class="anim-muncul bg-white border border-emerald-200 rounded-2xl p-8 sm:p-12 text-center shadow-card space-y-5"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm"
      >
        <CheckCircle2 class="w-8 h-8" />
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-ink-900">
          Pendaftaran Berhasil Dikirim!
        </h2>
        <p
          class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed"
        >
          Data tim
          <span class="font-bold text-ink-900">{{ namaTim }}</span> telah masuk
          ke sistem panitia. Langkah terakhir, silakan kirimkan bukti transfer
          ke WhatsApp panitia.
        </p>
      </div>

      <!-- WA CTA Box -->
      <div
        class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto space-y-3"
      >
        <div
          class="text-xs font-semibold text-emerald-900 flex items-center justify-center gap-1.5"
        >
          <MessageCircle class="w-4 h-4 text-emerald-600" />
          <span>Nomor WhatsApp Panitia: {{ kontakPanitiaWa }}</span>
        </div>
        <a
          :href="linkWhatsApp"
          target="_blank"
          class="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Kirim Bukti Pembayaran ke WhatsApp</span>
          <ExternalLink class="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      <div class="pt-2">
        <router-link
          to="/jadwal?tab=tim"
          class="text-xs text-slate-500 hover:text-ink-900 font-semibold underline"
        >
          Lihat Daftar Klub Peserta
        </router-link>
      </div>
    </div>

    <!-- Form Pendaftaran -->
    <form
      v-else
      @submit.prevent="handleKirimPendaftaran"
      class="anim-muncul space-y-6"
    >
      <div
        v-if="pesanError"
        class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ pesanError }}
      </div>

      <!-- Section 1: Informasi Klub -->
      <div
        class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4"
      >
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield class="w-5 h-5 text-ucl-600" />
          <h3 class="text-base font-semibold text-ink-900">
            1. Informasi Klub
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div class="sm:col-span-6">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >Nama Klub *</label
            >
            <input
              v-model="namaTim"
              type="text"
              placeholder="contoh: Real Madrid Indonesia"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >Tag Tim (Maks 3 Huruf) *</label
            >
            <input
              :value="tagTim"
              @input="handleInputTagTim"
              type="text"
              maxlength="3"
              placeholder="contoh: BAR"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ucl-700 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >Logo Klub (File Image)</label
            >
            <div class="flex items-center gap-2">
              <label
                class="flex-1 cursor-pointer bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-ink-600 hover:bg-slate-50 transition flex items-center justify-between"
              >
                <span class="truncate">{{
                  logoUrl ? "Logo Terpilih" : "Pilih File Logo..."
                }}</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleUnggahLogo"
                />
              </label>
              <div
                v-if="previewLogo"
                class="w-8 h-8 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100"
              >
                <img
                  :src="previewLogo"
                  alt="Preview"
                  class="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Data Kapten -->
      <div
        class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4"
      >
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User class="w-5 h-5 text-ucl-600" />
          <h3 class="text-base font-semibold text-ink-900">
            2. Data Kapten Tim
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >No WhatsApp / HP *</label
            >
            <input
              v-model="kaptenNoHp"
              type="tel"
              placeholder="08123456789"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >ID Game Kapten *</label
            >
            <input
              v-model="kaptenGameId"
              type="text"
              placeholder="ID Akun Game"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >Nickname In-Game *</label
            >
            <input
              v-model="kaptenNickname"
              type="text"
              placeholder="Nickname Game"
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-900 placeholder-slate-400 outline-none transition focus:border-ucl-500 focus:ring-2 focus:ring-ucl-500/20"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-600 mb-1.5"
              >Role Kapten</label
            >
            <select
              v-model="kaptenRole"
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
      <div
        class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4"
      >
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User class="w-5 h-5 text-ucl-600" />
          <h3 class="text-base font-semibold text-ink-900">
            3. Anggota Tim ({{ daftarAnggota.length }})
          </h3>
        </div>

        <div
          v-if="daftarAnggota.length === 0"
          class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3"
        >
          <p>
            Belum ada anggota skuad tambahan. Klik tombol di bawah untuk
            memasukkan pemain tim.
          </p>
          <button
            type="button"
            @click="tambahAnggota"
            class="px-4 py-2 rounded-xl bg-ucl-600 text-white text-xs font-semibold hover:bg-ucl-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus class="w-4 h-4" />
            Tambah Anggota Pertama
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(item, idx) in daftarAnggota"
            :key="item.id"
            class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            <div class="sm:col-span-4">
              <label class="block text-[11px] font-semibold text-slate-500 mb-1"
                >ID Game Pemain {{ idx + 1 }}</label
              >
              <input
                v-model="item.game_id"
                type="text"
                placeholder="ID Game"
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-ucl-500"
                required
              />
            </div>

            <div class="sm:col-span-5">
              <label class="block text-[11px] font-semibold text-slate-500 mb-1"
                >Nickname Pemain {{ idx + 1 }}</label
              >
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
                <label
                  class="block text-[11px] font-semibold text-slate-500 mb-1"
                  >Role</label
                >
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
                @click="hapusAnggota(idx)"
                class="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                title="Hapus Pemain"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Tombol Tambah Anggota di Bawah Input -->
          <div class="pt-2">
            <button
              type="button"
              @click="tambahAnggota"
              class="w-full py-2.5 rounded-xl border-2 border-dashed border-ucl-200 bg-ucl-50/50 hover:bg-ucl-50 text-ucl-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              Tambah Anggota Skuad Lainnya
            </button>
          </div>
        </div>
      </div>

      <!-- Section 4: Pembayaran & Konfirmasi WhatsApp -->
      <div
        class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4"
      >
        <div
          class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100"
        >
          <div class="flex items-center gap-2">
            <QrCode class="w-5 h-5 text-ucl-600" />
            <h3 class="text-base font-semibold text-ink-900">4. Pembayaran</h3>
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-700"
          >
            {{ biayaPendaftaran || "Biaya Registrasi" }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          <!-- QR Card Display -->
          <div
            class="sm:col-span-5 flex flex-col items-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3"
          >
            <span
              class="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >Scan QRIS Panitia</span
            >
            <div
              class="w-44 h-44 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm"
            >
              <img
                v-if="qrPembayaranUrl"
                :src="qrPembayaranUrl"
                alt="QR Code Pembayaran"
                class="w-full h-full object-contain"
              />
              <div v-else class="text-center p-3 text-slate-400 text-xs">
                <QrCode
                  class="w-10 h-10 mx-auto mb-1 opacity-25 text-slate-600"
                />
                <span>QR Code akan segera diunggah panitia</span>
              </div>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed max-w-xs">
              {{ instruksiPembayaran }}
            </p>
          </div>

          <!-- WhatsApp Confirmation Box -->
          <div
            class="sm:col-span-7 space-y-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 sm:p-5"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm"
              >
                <MessageCircle class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-emerald-950">
                  Kirim Bukti Pembayaran ke WhatsApp
                </h4>
                <p class="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                  Setelah melakukan scan QRIS / transfer, kirimkan foto struk
                  bukti pembayaran langsung ke nomor panitia agar diverifikasi.
                </p>
              </div>
            </div>

            <div
              class="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between"
            >
              <div>
                <span
                  class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block"
                  >Nomor WhatsApp Panitia</span
                >
                <span class="text-xs font-bold font-mono text-ink-900">{{
                  kontakPanitiaWa
                }}</span>
              </div>
              <a
                :href="linkWhatsApp"
                target="_blank"
                class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Chat WA</span>
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Submit -->
      <div class="pt-2">
        <TombolDasar
          tipe="submit"
          varian="primer"
          :sedangMemuat="sedangKirim"
          class="w-full text-sm py-3"
        >
          Kirim Pendaftaran Tim Sekarang
        </TombolDasar>
      </div>
    </form>
  </div>
</template>
