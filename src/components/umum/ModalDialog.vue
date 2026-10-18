<script setup>
import { onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

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
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="terbuka"
        class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-navy-950/60 backdrop-blur-sm"
        @click.self="emit('tutup')"
      >
        <div
          class="relative w-full max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-lift overflow-hidden"
          :class="lebarMaksimal"
        >
          <div class="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 shrink-0">
            <h3 class="text-sm sm:text-base font-semibold text-ink-900 truncate pr-2">
              {{ judul }}
            </h3>
            <button
              @click="emit('tutup')"
              class="p-1.5 text-slate-400 hover:text-ink-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-3.5 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
