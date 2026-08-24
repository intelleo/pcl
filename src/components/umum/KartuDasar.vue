<script setup>
defineProps({
  judul: {
    type: String,
    default: ''
  },
  subJudul: {
    type: String,
    default: ''
  },
  sorotan: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div
    class="relative bg-pcl-card/90 backdrop-blur-md rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl"
    :class="[
      sorotan
        ? 'border-pcl-gold/60 shadow-pcl-gold/10 ring-1 ring-pcl-gold/30'
        : 'border-pcl-border hover:border-pcl-gold/40 shadow-black/30'
    ]"
  >
    <!-- Header -->
    <div
      v-if="judul || $slots.aksiHeader"
      class="flex items-center justify-between px-5 py-4 border-b border-pcl-border/70 bg-gradient-to-r from-pcl-royal/20 to-pcl-card"
    >
      <div>
        <h3 class="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2 font-display text-base">
          {{ judul }}
        </h3>
        <p v-if="subJudul" class="text-xs text-pcl-silver/70 mt-0.5">{{ subJudul }}</p>
      </div>
      <div v-if="$slots.aksiHeader" class="flex items-center space-x-2">
        <slot name="aksiHeader" />
      </div>
    </div>

    <!-- Body slot -->
    <div class="p-5">
      <slot />
    </div>

    <!-- Footer slot -->
    <div
      v-if="$slots.footer"
      class="px-5 py-3 border-t border-pcl-border/70 bg-pcl-navy/40 text-xs text-pcl-silver"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
