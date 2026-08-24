<script setup>
const tahunSekarang = new Date().getFullYear()
</script>

<template>
  <footer class="w-full border-t border-slate-800/80 bg-slate-950/60 mt-auto py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-sm text-slate-400">
        <span class="font-bold text-slate-200">Peak Champions League</span>
        <span>•</span>
        <span>Kompetisi Game Flash Peak</span>
      </div>
      <div class="text-xs text-slate-500">
        © {{ tahunSekarang }} PCL Tournament. Dirancang untuk turnamen sepak bola profesional.
      </div>
    </div>
  </footer>
</template>
