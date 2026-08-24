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
    class="relative bg-pcl-card/90 backdrop-blur-md rounded-xl border transition-all duration-200 overflow-hidden shadow-xl"
    :class="[
      sorotan
        ? 'border-emerald-500/50 shadow-emerald-950/30 ring-1 ring-emerald-500/20'
        : 'border-slate-800/80 hover:border-slate-700/80 shadow-slate-950/40'
    ]"
  >
    <!-- Header jika ada judul -->
    <div
      v-if="judul || $slots.aksiHeader"
      class="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/40"
    >
      <div>
        <h3 class="text-base font-bold text-slate-100 tracking-wide flex items-center gap-2">
          {{ judul }}
        </h3>
        <p v-if="subJudul" class="text-xs text-slate-400 mt-0.5">{{ subJudul }}</p>
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
      class="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30 text-xs text-slate-400"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
