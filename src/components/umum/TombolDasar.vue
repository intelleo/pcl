<script setup>
defineProps({
  varian: {
    type: String,
    default: 'primer',
    validator: (v) => ['primer', 'sekunder', 'bahaya', 'outline', 'aksen'].includes(v)
  },
  tipe: {
    type: String,
    default: 'button'
  },
  sedangMemuat: {
    type: Boolean,
    default: false
  },
  dinonaktifkan: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
    :type="tipe"
    :disabled="dinonaktifkan || sedangMemuat"
    class="relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-pcl-dark disabled:opacity-50 disabled:cursor-not-allowed group"
    :class="{
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold focus:ring-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/40 shadow-lg': varian === 'primer',
      'bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-600 border border-slate-700': varian === 'sekunder',
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold focus:ring-cyan-500 shadow-cyan-500/20 shadow-lg': varian === 'aksen',
      'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-red-600/20 shadow-lg': varian === 'bahaya',
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 focus:ring-slate-500': varian === 'outline'
    }"
  >
    <svg
      v-if="sedangMemuat"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <slot />
  </button>
</template>
