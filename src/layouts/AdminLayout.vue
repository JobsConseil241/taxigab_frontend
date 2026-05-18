<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

const navGroups = [
  {
    label: 'PILOTAGE',
    items: [
      { name: 'Tableau de bord', to: '/dashboard', icon: 'chart' },
      { name: 'Courses', to: '/dashboard/rides', icon: 'car', badge: 'live' },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { name: 'Chauffeurs', to: '/dashboard/drivers', icon: 'users' },
      { name: 'Utilisateurs', to: '/dashboard/users', icon: 'user' },
      { name: 'Formules', to: '/dashboard/formulas', icon: 'tag' },
    ],
  },
]

function isActive(path) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

async function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
    @click="sidebarOpen = false"
  />

  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-brand-navy text-white flex flex-col transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 h-16 border-b border-white/10">
        <div class="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center">
          <svg class="w-5 h-5 text-brand-navy" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8zm-4.4 5L10 7.5 11.4 11H8.6z" />
          </svg>
        </div>
        <span class="text-lg font-extrabold tracking-tight">
          Taxi<span class="text-brand-yellow">Gab</span>
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto">
        <div v-for="(group, gi) in navGroups" :key="group.label" :class="gi > 0 ? 'mt-6' : ''">
          <p class="px-3 mb-2 text-[10px] font-extrabold tracking-[0.14em] text-white/40">{{ group.label }}</p>
          <div class="space-y-1">
            <router-link
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :class="[
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isActive(item.to)
                  ? 'bg-brand-yellow text-brand-navy'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ]"
              @click="sidebarOpen = false"
            >
              <!-- Chart icon -->
              <svg v-if="item.icon === 'chart'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <!-- Car icon -->
              <svg v-if="item.icon === 'car'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5" />
              </svg>
              <!-- Users icon -->
              <svg v-if="item.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <!-- User icon -->
              <svg v-if="item.icon === 'user'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <!-- Tag icon -->
              <svg v-if="item.icon === 'tag'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <span class="flex-1">{{ item.name }}</span>
              <span
                v-if="item.badge === 'live'"
                :class="[
                  'text-[9px] font-extrabold tracking-[0.08em] px-1.5 py-0.5 rounded-md flex items-center gap-1',
                  isActive(item.to)
                    ? 'bg-brand-navy/15 text-brand-navy'
                    : 'bg-brand-yellow/20 text-brand-yellow',
                ]"
              >
                <span :class="['w-1 h-1 rounded-full', isActive(item.to) ? 'bg-brand-navy' : 'bg-brand-yellow animate-pulse']" />
                LIVE
              </span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- User footer -->
      <div class="px-4 py-4 border-t border-white/10">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-sm">
            {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold truncate">{{ auth.user?.name || 'Admin' }}</p>
            <p class="text-xs text-white/50 truncate">{{ auth.user?.email || '' }}</p>
          </div>
        </div>
        <button
          @click="logout"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen bg-brand-surface-bg">
      <!-- Top bar (desktop) -->
      <header class="hidden lg:flex items-center h-16 px-6 lg:px-8 border-b border-brand-line bg-white/80 backdrop-blur sticky top-0 z-20">
        <!-- Global search -->
        <div class="relative w-80">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une course, un chauffeur…"
            class="w-full h-10 pl-10 pr-10 rounded-full bg-brand-line-2 text-sm font-semibold placeholder:text-brand-muted focus:bg-white focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow border border-transparent outline-none transition"
          />
          <kbd class="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:inline-flex items-center px-2 py-0.5 rounded-md border border-brand-line bg-white tg-mono text-[10px] text-brand-muted">⌘K</kbd>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <!-- Notifications -->
          <button class="relative w-10 h-10 rounded-full bg-brand-line-2 hover:bg-brand-line text-brand-navy flex items-center justify-center transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-danger text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">3</span>
          </button>

          <!-- Quick action -->
          <button class="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-navy text-white text-sm font-extrabold hover:brightness-110 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Action rapide
          </button>

          <!-- User chip -->
          <div class="flex items-center gap-3 pl-3 ml-1 border-l border-brand-line">
            <div class="text-right hidden xl:block">
              <p class="text-sm font-extrabold leading-tight">{{ auth.user?.name || 'Admin' }}</p>
              <p class="text-[11px] text-brand-muted leading-tight">Administrateur</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-sm">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile header -->
      <header class="lg:hidden flex items-center h-14 px-4 border-b border-brand-line bg-white">
        <button @click="sidebarOpen = true" class="p-2 -ml-2 rounded-lg hover:bg-brand-line-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span class="ml-3 font-extrabold">
          Taxi<span class="text-brand-yellow-dim">Gab</span>
        </span>
        <div class="ml-auto flex items-center gap-2">
          <button class="relative w-9 h-9 rounded-full bg-brand-line-2 text-brand-navy flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-danger text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">3</span>
          </button>
        </div>
      </header>

      <main class="flex-1 p-6 lg:p-8 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
