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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm"
        @click.self="emit('tutup')"
      >
        <div
          class="relative w-full bg-white rounded-2xl shadow-lift overflow-hidden"
          :class="lebarMaksimal"
        >
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 class="text-base font-semibold text-ink-900">
              {{ judul }}
            </h3>
            <button
              @click="emit('tutup')"
              class="p-1.5 text-slate-400 hover:text-ink-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-5 max-h-[80vh] overflow-y-auto">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/70"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
