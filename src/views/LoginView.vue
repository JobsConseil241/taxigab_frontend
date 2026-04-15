<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('admin@taxigab.com')
const password = ref('password')
const showPassword = ref(false)

async function submit() {
  try {
    await auth.login(email.value, password.value)
    await auth.fetchMe()
    router.push('/')
  } catch {
    // error is in store
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple mb-4">
          <svg class="w-8 h-8 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8zm-4.4 5L10 7.5 11.4 11H8.6z" />
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Taxi Gab Admin</h1>
        <p class="mt-1 text-sm text-gray-500">Connectez-vous au panneau d'administration</p>
      </div>

      <!-- Card -->
      <form @submit.prevent="submit" class="bg-white rounded-2xl shadow-sm border p-8 space-y-5">
        <!-- Error -->
        <div
          v-if="auth.error"
          class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm"
        >
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
          {{ auth.error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition text-sm"
            placeholder="admin@taxigab.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition text-sm"
              placeholder="Mot de passe"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="auth.loading"
          class="w-full py-3 px-4 bg-brand-purple text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <span v-if="auth.loading" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connexion...
          </span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <p class="text-center text-xs text-gray-400 mt-6">Taxi Gab &copy; 2026 — MRTECH</p>
    </div>
  </div>
</template>
