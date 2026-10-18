<script setup>
import { Instagram } from 'lucide-vue-next'

const tahunSekarang = new Date().getFullYear()

const tautanSosmed = [
  {
    nama: 'Instagram',
    url: 'https://www.instagram.com/peakchampionsleague?stkn=aGZhZ2JqN2M3NmMw',
    tipe: 'instagram',
    handle: '@peakchampionsleague'
  },
  {
    nama: 'TikTok',
    url: 'https://www.tiktok.com/@peakchampionsleague1?_r=1&_t=ZS-9AGeFI8uXHV',
    tipe: 'tiktok',
    handle: '@peakchampionsleague1'
  }
]
</script>

<template>
  <footer class="relative w-full mt-auto hero-navy">
    <div aria-hidden="true" class="absolute inset-0 pola-bintang opacity-40 pointer-events-none"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <span class="font-display text-lg font-semibold tracking-tight text-white block">
            Peak <span class="text-gold-400">Champions League</span>
          </span>
          <p class="text-xs text-blue-200/70 mt-1.5">
            Kompetisi Game Flash Peak · Musim 2026
          </p>
        </div>

        <!-- Tautan Sosial Media Resmi PCL -->
        <div class="flex items-center gap-3">
          <span class="text-xs text-blue-200/70 hidden sm:inline-block font-medium">Ikuti Kami:</span>

          <!-- Instagram Link -->
          <a
            :href="tautanSosmed[0].url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-blue-100 hover:text-white border border-white/10 transition-all text-xs font-semibold group cursor-pointer"
            title="Instagram Peak Champions League"
          >
            <Instagram class="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span class="text-[11px] tracking-wide">Instagram</span>
          </a>

          <!-- TikTok Link -->
          <a
            :href="tautanSosmed[1].url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-blue-100 hover:text-white border border-white/10 transition-all text-xs font-semibold group cursor-pointer"
            title="TikTok Peak Champions League"
          >
            <svg class="w-4 h-4 fill-cyan-300 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.9-4.49V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76c-.3-.02-.6-.04-.9-.07z" />
            </svg>
            <span class="text-[11px] tracking-wide">TikTok</span>
          </a>
        </div>
      </div>

      <!-- Copyright Bar -->
      <div class="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-blue-200/60">
        <div class="flex items-center gap-2 sm:gap-4">
          <span>© {{ tahunSekarang }} PCL Tournament</span>
          <span class="w-1 h-1 rounded-full bg-blue-200/40"></span>
          <span>Semua hak cipta dilindungi</span>
        </div>
        <div class="text-[11px] text-blue-200/50">
          Official Media Partner & Channel Komunitas PCL
        </div>
      </div>
    </div>
  </footer>
</template>
