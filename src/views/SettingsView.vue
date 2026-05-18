<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const profile = reactive({
  name: '',
  email: '',
  phone: '',
  language: 'fr',
})
const password = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const profileMsg = ref(null)
const passwordMsg = ref(null)
const savingProfile = ref(false)
const savingPassword = ref(false)

onMounted(() => {
  const u = auth.user
  if (u) {
    profile.name = u.name || ''
    profile.email = u.email || ''
    profile.phone = u.phone || ''
    profile.language = u.language || 'fr'
  }
})

async function saveProfile() {
  savingProfile.value = true
  profileMsg.value = null
  try {
    const { data } = await api.patch('/auth/me', profile)
    if (data.user) auth.user = data.user
    profileMsg.value = { type: 'success', text: 'Profil mis à jour' }
  } catch (e) {
    profileMsg.value = {
      type: 'error',
      text: e.response?.data?.message || 'Erreur lors de la mise à jour',
    }
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (password.password !== password.password_confirmation) {
    passwordMsg.value = {
      type: 'error',
      text: 'Les mots de passe ne correspondent pas',
    }
    return
  }
  savingPassword.value = true
  passwordMsg.value = null
  try {
    await api.post('/auth/me/password', password)
    passwordMsg.value = { type: 'success', text: 'Mot de passe modifié' }
    password.current_password = ''
    password.password = ''
    password.password_confirmation = ''
  } catch (e) {
    passwordMsg.value = {
      type: 'error',
      text: e.response?.data?.message || 'Erreur',
    }
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-3xl font-extrabold tracking-tight">Paramètres</h1>
    <p class="text-brand-muted mt-1 mb-6 text-sm">Compte admin · profil et sécurité</p>

    <!-- Profile card -->
    <div class="bg-white rounded-3xl tg-shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-[11px] font-extrabold tracking-[0.12em] text-brand-muted">PROFIL</p>
          <h2 class="text-lg font-extrabold">Mes informations</h2>
        </div>
        <div class="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
        </div>
      </div>

      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">NOM COMPLET</label>
            <input
              v-model="profile.name"
              type="text"
              required
              class="w-full h-11 px-4 rounded-xl border border-brand-line bg-white text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition"
            />
          </div>
          <div>
            <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">EMAIL</label>
            <input
              v-model="profile.email"
              type="email"
              required
              class="w-full h-11 px-4 rounded-xl border border-brand-line bg-white text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition"
            />
          </div>
          <div>
            <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">TÉLÉPHONE</label>
            <input
              v-model="profile.phone"
              type="tel"
              class="w-full h-11 px-4 rounded-xl border border-brand-line bg-white text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition"
              placeholder="+241 ..."
            />
          </div>
          <div>
            <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">LANGUE</label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="profile.language = 'fr'"
                :class="[
                  'flex-1 h-11 rounded-xl text-sm font-extrabold transition',
                  profile.language === 'fr'
                    ? 'bg-brand-navy text-white'
                    : 'bg-brand-line-2 text-brand-ink hover:bg-brand-line',
                ]"
              >FR · Français</button>
              <button
                type="button"
                @click="profile.language = 'en'"
                :class="[
                  'flex-1 h-11 rounded-xl text-sm font-extrabold transition',
                  profile.language === 'en'
                    ? 'bg-brand-navy text-white'
                    : 'bg-brand-line-2 text-brand-ink hover:bg-brand-line',
                ]"
              >EN · English</button>
            </div>
          </div>
        </div>

        <div
          v-if="profileMsg"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
            profileMsg.type === 'success'
              ? 'bg-brand-success/15 text-brand-success'
              : 'bg-brand-danger/15 text-brand-danger',
          ]"
        >
          <svg v-if="profileMsg.type === 'success'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
          <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>
          {{ profileMsg.text }}
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingProfile"
            class="tg-cta"
          >
            {{ savingProfile ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Password card -->
    <div class="bg-white rounded-3xl tg-shadow-sm p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-[11px] font-extrabold tracking-[0.12em] text-brand-muted">SÉCURITÉ</p>
          <h2 class="text-lg font-extrabold">Mot de passe</h2>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-brand-line-2 flex items-center justify-center text-brand-navy">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
          </svg>
        </div>
      </div>

      <form @submit.prevent="savePassword" class="space-y-4">
        <div>
          <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">MOT DE PASSE ACTUEL</label>
          <input
            v-model="password.current_password"
            type="password"
            required
            class="w-full h-11 px-4 rounded-xl border border-brand-line bg-white text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">NOUVEAU MOT DE PASSE</label>
            <input
              v-model="password.password"
              type="password"
              required
              minlength="8"
              class="w-full h-11 px-4 rounded-xl border border-brand-line bg-white text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition"
            />
          </div>
          <div>
            <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">CONFIRMATION</label>
            <input
              v-model="password.password_confirmation"
              type="password"
              required
              minlength="8"
              class="w-full h-11 px-4 rounded-xl border border-brand-line bg-white text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition"
            />
          </div>
        </div>

        <div
          v-if="passwordMsg"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
            passwordMsg.type === 'success'
              ? 'bg-brand-success/15 text-brand-success'
              : 'bg-brand-danger/15 text-brand-danger',
          ]"
        >
          {{ passwordMsg.text }}
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingPassword"
            class="tg-cta is-navy"
            :style="'background: var(--color-brand-navy); color: white;'"
          >
            {{ savingPassword ? 'Mise à jour…' : 'Mettre à jour' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
