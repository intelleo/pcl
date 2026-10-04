<script setup>
defineProps({
  varian: {
    type: String,
    default: "primer",
    validator: (v) =>
      [
        "primer",
        "sekunder",
        "bahaya",
        "outline",
        "aksen",
        "gold",
        "kaca",
      ].includes(v),
  },
  tipe: {
    type: String,
    default: "button",
  },
  sedangMemuat: {
    type: Boolean,
    default: false,
  },
  dinonaktifkan: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <button
    :type="tipe"
    :disabled="dinonaktifkan || sedangMemuat"
    class="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ucl-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    :class="{
      'bg-ucl-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-card hover:shadow-lift':
        varian === 'primer',
      'bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-white/90 shadow-card hover:shadow-lift focus-visible:ring-gold-400':
        varian === 'gold',
      'bg-white border border-slate-300 text-ink-600 hover:border-ucl-500 hover:text-ucl-600':
        varian === 'sekunder',
      'bg-navy-800 hover:bg-navy-700 text-white': varian === 'aksen',
      'bg-red-600 hover:bg-red-700 text-white': varian === 'bahaya',
      'bg-white/10 hover:bg-white/20 border border-white/25 text-white':
        varian === 'kaca',
      'bg-transparent border border-slate-300 text-slate-500 hover:text-ucl-600 hover:border-ucl-500':
        varian === 'outline',
    }"
  >
    <svg
      v-if="sedangMemuat"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
