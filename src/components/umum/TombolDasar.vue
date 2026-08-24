<script setup>
defineProps({
  varian: {
    type: String,
    default: 'primer',
    validator: (v) => ['primer', 'sekunder', 'bahaya', 'outline', 'aksen', 'gold'].includes(v)
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
    class="relative inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-pcl-navy disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
    :class="{
      'bg-gradient-to-r from-pcl-gold via-pcl-goldLight to-pcl-gold hover:from-pcl-goldLight hover:to-pcl-gold text-slate-950 font-black shadow-pcl-gold/20 hover:shadow-pcl-gold/40 border border-pcl-goldLight/40': varian === 'primer' || varian === 'gold',
      'bg-pcl-cardLight hover:bg-pcl-royal/40 text-pcl-white border border-pcl-border hover:border-pcl-gold/40': varian === 'sekunder',
      'bg-gradient-to-r from-pcl-blueGlow to-pcl-royal hover:from-blue-400 hover:to-pcl-royal text-white shadow-pcl-blueGlow/20': varian === 'aksen',
      'bg-red-600/90 hover:bg-red-500 text-white shadow-red-600/20 border border-red-500/40': varian === 'bahaya',
      'bg-transparent hover:bg-pcl-cardLight/60 text-pcl-silver hover:text-white border border-pcl-border hover:border-pcl-gold/50': varian === 'outline'
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
