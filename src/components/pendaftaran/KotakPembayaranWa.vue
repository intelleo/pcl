<script setup>
import { ref, computed } from "vue";
import { QrCode, MessageCircle, ExternalLink, Download, Maximize2, Eye } from "lucide-vue-next";
import ModalDialog from "../umum/ModalDialog.vue";
import TombolDasar from "../umum/TombolDasar.vue";

const props = defineProps({
  biayaPendaftaran: {
    type: String,
    default: "Rp 50.000 / Tim",
  },
  qrPembayaranUrl: {
    type: String,
    default: "",
  },
  kontakPanitiaWa: {
    type: String,
    default: "081234567890",
  },
  instruksiPembayaran: {
    type: String,
    default:
      "Scan QRIS pembayaran di bawah lalu kirim bukti transfer ke nomor WhatsApp panitia.",
  },
  namaTim: {
    type: String,
    default: "",
  },
  kaptenNickname: {
    type: String,
    default: "",
  },
});

const modalPreviewTerbuka = ref(false);

const linkWhatsApp = computed(() => {
  let raw = (props.kontakPanitiaWa || "").replace(/\D/g, "");
  if (raw.startsWith("0")) raw = "62" + raw.slice(1);
  const pesan = encodeURIComponent(
    `Halo Panitia PCL, saya Kapten ${props.kaptenNickname || "Pendaftar"} dari tim ${props.namaTim || "-"} sudah mengisi formulir pendaftaran turnamen PCL 2026 dan ingin konfirmasi / kirim bukti transfer pembayaran.`,
  );
  return `https://wa.me/${raw}?text=${pesan}`;
});

function bukaPreviewQR() {
  if (props.qrPembayaranUrl) {
    modalPreviewTerbuka.value = true;
  }
}

function unduhQR() {
  if (!props.qrPembayaranUrl) return;

  // Nama file unduhan rapi
  const namaFile = `qris-pcl-2026-${(props.namaTim || 'tim').toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;

  // Buat element <a> virtual untuk mengunduh base64 / URL
  const a = document.createElement("a");
  a.href = props.qrPembayaranUrl;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
</script>

<template>
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
      <span class="text-[11px] font-bold text-amber-700">
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
          class="group relative w-48 h-48 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm transition-all"
          :class="{ 'cursor-pointer hover:border-ucl-500 hover:shadow-md': qrPembayaranUrl }"
          @click="bukaPreviewQR"
          title="Klik untuk memperbesar QRIS"
        >
          <template v-if="qrPembayaranUrl">
            <img
              :src="qrPembayaranUrl"
              alt="QR Code Pembayaran"
              class="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <!-- Overlay Hover Petunjuk Klik -->
            <div class="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 rounded-xl">
              <Eye class="w-6 h-6 drop-shadow" />
              <span class="text-[11px] font-semibold drop-shadow">Klik perbesar</span>
            </div>
          </template>
          <div v-else class="text-center p-3 text-slate-400 text-xs">
            <QrCode class="w-10 h-10 mx-auto mb-1 opacity-25 text-slate-600" />
            <span>QR Code akan segera diunggah panitia</span>
          </div>
        </div>

        <!-- Tombol Aksi: Preview & Unduh -->
        <div v-if="qrPembayaranUrl" class="flex items-center justify-center gap-2 w-full pt-1">
          <TombolDasar
            varian="sekunder"
            class="!text-xs !py-1.5 !px-3 gap-1.5"
            @click="bukaPreviewQR"
          >
            <Maximize2 class="w-3.5 h-3.5" />
            <span>Perbesar</span>
          </TombolDasar>
          <TombolDasar
            varian="primer"
            class="!text-xs !py-1.5 !px-3 gap-1.5"
            @click="unduhQR"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Unduh QR</span>
          </TombolDasar>
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
              Setelah melakukan scan QRIS / transfer, kirimkan foto struk bukti
              pembayaran langsung ke nomor panitia agar diverifikasi.
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

    <!-- Modal Pratinjau QRIS Berukuran Penuh -->
    <ModalDialog
      :terbuka="modalPreviewTerbuka"
      judul="QRIS Pembayaran PCL 2026"
      lebarMaksimal="max-w-md"
      @tutup="modalPreviewTerbuka = false"
    >
      <div class="p-6 flex flex-col items-center text-center space-y-4">
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm max-w-xs w-full aspect-square flex items-center justify-center overflow-hidden">
          <img
            :src="qrPembayaranUrl"
            alt="QR Code Pembayaran Full"
            class="w-full h-full object-contain"
          />
        </div>

        <div class="space-y-1">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Biaya Registrasi</span>
          <span class="text-lg font-bold text-ucl-700 block">{{ biayaPendaftaran || "Rp 50.000 / Tim" }}</span>
          <p class="text-xs text-slate-500 max-w-sm pt-1">
            Gunakan aplikasi m-banking atau e-wallet (GoPay, OVO, Dana, ShopeePay, BCA, dll) untuk memindai QRIS di atas.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full pt-2">
          <TombolDasar
            varian="sekunder"
            class="flex-1 !py-2"
            @click="modalPreviewTerbuka = false"
          >
            Tutup
          </TombolDasar>
          <TombolDasar
            varian="primer"
            class="flex-1 !py-2 gap-1.5"
            @click="unduhQR"
          >
            <Download class="w-4 h-4" />
            <span>Unduh QR</span>
          </TombolDasar>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>
