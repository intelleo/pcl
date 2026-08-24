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
    class="relative bg-white rounded-xl border transition-shadow duration-200 overflow-hidden shadow-card"
    :class="
      sorotan
        ? 'border-ucl-500/40 ring-1 ring-ucl-500/20'
        : 'border-slate-200 hover:shadow-lift'
    "
  >
    <div
      v-if="judul || $slots.aksiHeader"
      class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100"
    >
      <div>
        <h3 class="text-sm font-semibold text-ink-900 flex items-center gap-2">
          {{ judul }}
        </h3>
        <p v-if="subJudul" class="text-xs text-ink-400 mt-0.5">{{ subJudul }}</p>
      </div>
      <div v-if="$slots.aksiHeader" class="flex items-center space-x-2">
        <slot name="aksiHeader" />
      </div>
    </div>

    <div class="p-5">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="px-5 py-3 border-t border-slate-100 bg-slate-50/70 text-xs text-ink-400"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
