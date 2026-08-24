<script setup>
const tahunSekarang = new Date().getFullYear()
</script>

<template>
  <footer class="relative w-full mt-auto hero-navy">
    <div aria-hidden="true" class="absolute inset-0 pola-bintang opacity-40 pointer-events-none"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span class="font-display text-lg font-semibold tracking-tight text-white block">
            Peak <span class="text-gold-400">Champions League</span>
          </span>
          <p class="text-xs text-blue-200/70 mt-1.5">
            Kompetisi Game Flash Peak · Musim 2026
          </p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-blue-200/60">
          <span>© {{ tahunSekarang }} PCL Tournament</span>
          <span class="hidden sm:block w-1 h-1 rounded-full bg-blue-200/40"></span>
          <span>Semua hak cipta dilindungi</span>
        </div>
      </div>
    </div>
  </footer>
</template>
