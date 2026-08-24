<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  terbuka: {
    type: Boolean,
    default: false
  },
  judul: {
    type: String,
    default: 'Detail'
  },
  lebarMaksimal: {
    type: String,
    default: 'max-w-lg'
  }
})

const emit = defineEmits(['tutup'])

function tanganiKeydown(e) {
  if (e.key === 'Escape' && props.terbuka) {
    emit('tutup')
  }
}

onMounted(() => window.addEventListener('keydown', tanganiKeydown))
onUnmounted(() => window.removeEventListener('keydown', tanganiKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="terbuka"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        @click.self="emit('tutup')"
      >
        <div
          class="relative w-full bg-pcl-card border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          :class="lebarMaksimal"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <h3 class="text-lg font-bold text-slate-100 tracking-wide">
              {{ judul }}
            </h3>
            <button
              @click="emit('tutup')"
              class="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 max-h-[80vh] overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-800 bg-slate-900/40"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
