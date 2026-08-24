<script setup>
import BilahNavigasi from './components/umum/BilahNavigasi.vue'
import KakiHalaman from './components/umum/KakiHalaman.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-pcl-navy text-pcl-white selection:bg-pcl-gold selection:text-slate-950 pcl-bg-pattern bg-blend-soft-light">
    <BilahNavigasi />
    <main class="flex-1">
      <router-view />
    </main>
    <KakiHalaman />
  </div>
</template>
