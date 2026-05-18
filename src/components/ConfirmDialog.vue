<script setup>
defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirmer' },
  cancelLabel: { type: String, default: 'Annuler' },
  variant: { type: String, default: 'primary' }, // primary | danger
  loading: { type: Boolean, default: false },
  icon: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
          @click="$emit('cancel')"
        />
        <div class="relative bg-white rounded-3xl tg-shadow-lg w-full max-w-md p-6">
          <div class="flex items-start gap-4">
            <div
              :class="[
                'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                variant === 'danger' ? 'bg-brand-danger/15' : 'bg-brand-yellow/30',
              ]"
            >
              <svg
                v-if="variant === 'danger'"
                class="w-6 h-6 text-brand-danger"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zm0 13.036h.008v.008H12v-.008z"/>
              </svg>
              <svg
                v-else
                class="w-6 h-6 text-brand-navy"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-extrabold leading-tight">{{ title }}</h3>
              <p v-if="message" class="mt-2 text-sm text-brand-muted leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              class="px-4 h-11 rounded-full font-bold text-sm text-brand-muted hover:text-brand-ink"
              :disabled="loading"
              @click="$emit('cancel')"
            >{{ cancelLabel }}</button>
            <button
              type="button"
              :class="[
                'tg-cta',
                variant === 'danger' ? 'is-navy' : '',
              ]"
              :style="variant === 'danger' ? 'background: var(--color-brand-danger); color: white; box-shadow: 0 8px 24px rgba(224,74,60,.35);' : ''"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <svg
                v-if="loading"
                class="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? '…' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
