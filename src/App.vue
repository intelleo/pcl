<script setup>
import BilahNavigasi from './components/umum/BilahNavigasi.vue'
import KakiHalaman from './components/umum/KakiHalaman.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-pcl-dark text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
    <BilahNavigasi />
    <main class="flex-1">
      <router-view />
    </main>
    <KakiHalaman />
  </div>
</template>
