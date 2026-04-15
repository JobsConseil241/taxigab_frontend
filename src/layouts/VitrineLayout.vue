<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const sections = [
  { label: 'Accueil', id: 'accueil' },
  { label: 'Fonctionnalités', id: 'fonctionnalites' },
  { label: 'Services', id: 'services' },
  { label: 'Télécharger', id: 'telecharger' },
  { label: 'Devenir chauffeur', id: 'devenir-chauffeur' },
]

function onScroll() {
  scrolled.value = window.scrollY > 40
}

function scrollTo(id) {
  mobileMenuOpen.value = false
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <nav
      :class="[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white shadow-md' : 'bg-transparent',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <!-- Logo -->
          <button @click="scrollTo('accueil')" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8zm-4.4 5L10 7.5 11.4 11H8.6z" />
              </svg>
            </div>
            <span
              :class="[
                'text-lg font-extrabold tracking-tight transition-colors',
                scrolled ? 'text-brand-navy' : 'text-white',
              ]"
            >Taxi Gab</span>
          </button>

          <!-- Desktop links -->
          <div class="hidden lg:flex items-center gap-8">
            <button
              v-for="s in sections"
              :key="s.id"
              @click="scrollTo(s.id)"
              :class="[
                'text-sm font-medium transition-colors hover:text-brand-orange',
                scrolled ? 'text-brand-navy/70' : 'text-white/80',
              ]"
            >{{ s.label }}</button>
          </div>

          <!-- Admin link + hamburger -->
          <div class="flex items-center gap-3">
            <router-link
              to="/login"
              :class="[
                'hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                scrolled
                  ? 'bg-brand-purple text-white hover:bg-brand-navy'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur',
              ]"
            >Connexion Admin</router-link>

            <!-- Mobile menu button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="lg:hidden p-2 rounded-lg"
              :class="scrolled ? 'text-brand-navy hover:bg-gray-100' : 'text-white hover:bg-white/10'"
            >
              <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="lg:hidden bg-white shadow-lg border-t">
          <div class="px-4 py-3 space-y-1">
            <button
              v-for="s in sections"
              :key="s.id"
              @click="scrollTo(s.id)"
              class="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-brand-navy hover:bg-brand-lavande transition-colors"
            >{{ s.label }}</button>
            <router-link
              to="/login"
              class="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-brand-orange hover:bg-brand-lavande transition-colors"
              @click="mobileMenuOpen = false"
            >Connexion Admin</router-link>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-brand-navy text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          <!-- About -->
          <div>
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8zm-4.4 5L10 7.5 11.4 11H8.6z" />
                </svg>
              </div>
              <span class="text-lg font-extrabold">Taxi Gab</span>
            </div>
            <p class="text-sm text-white/60 leading-relaxed">
              La plateforme VTC de référence à Moanda, Mounana et Bakoumba. Voyagez en toute sécurité et simplicité.
            </p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Liens rapides</h4>
            <ul class="space-y-2.5">
              <li v-for="s in sections" :key="s.id">
                <button
                  @click="scrollTo(s.id)"
                  class="text-sm text-white/60 hover:text-brand-orange transition-colors"
                >{{ s.label }}</button>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Contact</h4>
            <ul class="space-y-2.5 text-sm text-white/60">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                contact@taxigab.com
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +241 XX XX XX XX
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Moanda, Haut-Ogooué, Gabon
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          &copy; {{ new Date().getFullYear() }} Taxi Gab. Tous droits réservés.
        </div>
      </div>
    </footer>
  </div>
</template>
