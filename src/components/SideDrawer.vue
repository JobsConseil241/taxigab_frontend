<script setup>
defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  width: { type: String, default: 'max-w-md' },
})
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50">
        <div
          class="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm"
          @click="$emit('close')"
        />
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="open"
            :class="[
              'absolute top-0 right-0 h-full w-full bg-white shadow-2xl flex flex-col',
              width,
            ]"
          >
            <header class="flex items-start gap-3 px-6 py-5 border-b border-brand-line">
              <div class="flex-1 min-w-0">
                <p v-if="subtitle" class="text-[10px] font-extrabold tracking-[0.14em] text-brand-muted">
                  {{ subtitle }}
                </p>
                <h2 class="text-xl font-extrabold truncate">{{ title }}</h2>
              </div>
              <button
                @click="$emit('close')"
                class="w-9 h-9 rounded-full bg-brand-line-2 hover:bg-brand-line text-brand-navy flex items-center justify-center shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div class="flex-1 overflow-y-auto">
              <slot />
            </div>
            <footer v-if="$slots.footer" class="px-6 py-4 border-t border-brand-line bg-brand-surface-bg">
              <slot name="footer" />
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
