<script setup>
import BilahNavigasi from './components/umum/BilahNavigasi.vue'
import KakiHalaman from './components/umum/KakiHalaman.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F5F8FD] text-ink-900 font-sans">
    <BilahNavigasi />
    <main class="flex-1">
      <router-view />
    </main>
    <KakiHalaman />
  </div>
</template>
