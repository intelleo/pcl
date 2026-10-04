<script setup>
import { computed } from "vue";
import { QrCode, MessageCircle, ExternalLink } from "lucide-vue-next";

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

const linkWhatsApp = computed(() => {
  let raw = (props.kontakPanitiaWa || "").replace(/\D/g, "");
  if (raw.startsWith("0")) raw = "62" + raw.slice(1);
  const pesan = encodeURIComponent(
    `Halo Panitia PCL, saya Kapten ${props.kaptenNickname || "Pendaftar"} dari tim ${props.namaTim || "-"} sudah mengisi formulir pendaftaran turnamen PCL 2026 dan ingin konfirmasi / kirim bukti transfer pembayaran.`,
  );
  return `https://wa.me/${raw}?text=${pesan}`;
});
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
          class="w-44 h-44 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm"
        >
          <img
            v-if="qrPembayaranUrl"
            :src="qrPembayaranUrl"
            alt="QR Code Pembayaran"
            class="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="text-center p-3 text-slate-400 text-xs">
            <QrCode class="w-10 h-10 mx-auto mb-1 opacity-25 text-slate-600" />
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
  </div>
</template>
