<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

// --- Global search ----------------------------------------------------------
const searchQuery = ref('')

// --- Quick action menu ------------------------------------------------------
const quickOpen = ref(false)
function quickGo(path) {
  quickOpen.value = false
  router.push(path)
}

function runSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ path: '/dashboard/users', query: { q } })
  searchQuery.value = ''
}

// --- Notifications ----------------------------------------------------------
const notifsOpen = ref(false)
const notifs = ref({
  drivers_pending: 0, rides_today: 0, drivers_online: 0,
  rides_active: 0, drivers_total: 0, total_users: 0,
})
let notifPoller = null

async function fetchNotifs() {
  try {
    const { data } = await api.get('/admin/dashboard')
    notifs.value = {
      drivers_pending: data.drivers_pending ?? 0,
      rides_today: data.rides_today ?? 0,
      drivers_online: data.drivers_online ?? 0,
      rides_active: data.rides_active ?? 0,
      drivers_total: data.total_drivers ?? 0,
      total_users: data.total_users ?? 0,
    }
  } catch {
    // swallow
  }
}

const notifTotal = computed(
  () => (notifs.value.drivers_pending || 0) + (notifs.value.rides_today || 0),
)

function goTo(path) {
  notifsOpen.value = false
  router.push(path)
}

function handleClickOutside(e) {
  if (notifsOpen.value && !e.target.closest('[data-notif-area]')) {
    notifsOpen.value = false
  }
  if (quickOpen.value && !e.target.closest('[data-quick-area]')) {
    quickOpen.value = false
  }
}

onMounted(() => {
  fetchNotifs()
  notifPoller = setInterval(fetchNotifs, 30_000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (notifPoller) clearInterval(notifPoller)
  document.removeEventListener('click', handleClickOutside)
})

const navGroups = computed(() => [
  {
    label: 'PILOTAGE',
    items: [
      { name: 'Tableau de bord', to: '/dashboard', icon: 'chart' },
      { name: 'Courses en direct', to: '/dashboard/live', icon: 'car',
        count: notifs.value.rides_active || null, badge: 'live' },
      { name: 'Revenus', to: '/dashboard/revenue', icon: 'wallet' },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { name: 'Chauffeurs', to: '/dashboard/drivers', icon: 'users',
        count: notifs.value.drivers_total || null },
      { name: 'Véhicules', to: '/dashboard/vehicles', icon: 'car' },
      { name: 'Passagers', to: '/dashboard/users', icon: 'user',
        count: notifs.value.total_users ? (notifs.value.total_users > 999 ? `${Math.round(notifs.value.total_users/1000)}k` : notifs.value.total_users) : null },
      { name: 'Formules', to: '/dashboard/formulas', icon: 'tag' },
      { name: 'Historique', to: '/dashboard/rides', icon: 'clock' },
    ],
  },
  {
    label: 'SYSTÈME',
    items: [
      { name: 'Administrateurs', to: '/dashboard/admins', icon: 'shield' },
      { name: 'Support', to: '/dashboard/settings#support', icon: 'chat' },
      { name: 'Paramètres', to: '/dashboard/settings', icon: 'settings' },
    ],
  },
])

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
      <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div class="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-brand-navy" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8zm-4.4 5L10 7.5 11.4 11H8.6z" />
          </svg>
        </div>
        <div class="min-w-0">
          <div class="text-lg font-extrabold tracking-tight leading-none">
            Taxi<span class="text-brand-yellow">Gab</span>
          </div>
          <div class="text-[10px] font-extrabold tracking-[0.14em] text-white/45 mt-1">
            ADMIN · MOANDA
          </div>
        </div>
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
                'group flex items-center gap-3 h-10 pr-3 rounded-lg text-sm transition-colors border-l-[3px]',
                isActive(item.to)
                  ? 'bg-brand-yellow/15 text-brand-yellow border-brand-yellow font-extrabold pl-2.5'
                  : 'text-white/70 hover:bg-white/10 hover:text-white border-transparent font-semibold pl-3',
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
              <!-- Settings icon -->
              <svg v-if="item.icon === 'settings'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Wallet icon -->
              <svg v-if="item.icon === 'wallet'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"/>
              </svg>
              <!-- Clock icon -->
              <svg v-if="item.icon === 'clock'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <!-- Chat icon -->
              <svg v-if="item.icon === 'chat'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
              </svg>
              <!-- Shield icon -->
              <svg v-if="item.icon === 'shield'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
              </svg>
              <span class="flex-1 truncate">{{ item.name }}</span>
              <span
                v-if="item.count != null"
                :class="[
                  'tg-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-md',
                  isActive(item.to)
                    ? 'bg-brand-yellow text-brand-navy'
                    : 'bg-white/10 text-white',
                ]"
              >{{ item.count }}</span>
              <span
                v-if="item.badge === 'live'"
                :class="[
                  'text-[9px] font-extrabold tracking-[0.08em] px-1.5 py-0.5 rounded-md flex items-center gap-1',
                  isActive(item.to)
                    ? 'bg-brand-navy/15 text-brand-navy'
                    : 'bg-brand-danger/20 text-brand-danger',
                ]"
              >
                <span :class="['w-1 h-1 rounded-full animate-pulse', isActive(item.to) ? 'bg-brand-navy' : 'bg-brand-danger']" />
                LIVE
              </span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- System status card -->
      <div class="px-3 mt-auto">
        <div class="bg-white/[0.06] rounded-xl px-3.5 py-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2 h-2 rounded-full bg-brand-success animate-pulse"/>
            <span class="text-[10px] font-extrabold tracking-[0.1em] text-white/85">SYSTÈME OPÉRATIONNEL</span>
          </div>
          <div class="text-[11px] text-white/50 leading-relaxed tg-mono">
            API · OK<br/>
            Cartes · OK<br/>
            Reverb · {{ notifs.drivers_online > 0 ? 'OK' : 'idle' }}
          </div>
        </div>
      </div>

      <!-- User footer -->
      <div class="px-4 py-4 mt-3 border-t border-white/10">
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
        <form @submit.prevent="runSearch" class="relative w-80">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un utilisateur (Enter)…"
            class="w-full h-10 pl-10 pr-10 rounded-full bg-brand-line-2 text-sm font-semibold placeholder:text-brand-muted focus:bg-white focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow border border-transparent outline-none transition"
          />
          <kbd class="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:inline-flex items-center px-2 py-0.5 rounded-md border border-brand-line bg-white tg-mono text-[10px] text-brand-muted">↵</kbd>
        </form>

        <div class="ml-auto flex items-center gap-2">
          <!-- Notifications -->
          <div class="relative" data-notif-area>
            <button
              @click="notifsOpen = !notifsOpen"
              class="relative w-10 h-10 rounded-full bg-brand-line-2 hover:bg-brand-line text-brand-navy flex items-center justify-center transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span
                v-if="notifTotal > 0"
                class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-danger text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white"
              >{{ notifTotal > 99 ? '99+' : notifTotal }}</span>
            </button>

            <!-- Dropdown -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="notifsOpen"
                class="absolute right-0 mt-2 w-80 bg-white rounded-2xl tg-shadow-lg border border-brand-line overflow-hidden"
              >
                <div class="px-4 py-3 bg-brand-navy text-white flex items-center justify-between">
                  <p class="text-sm font-extrabold">Notifications</p>
                  <span class="text-[10px] font-bold opacity-70">Live · 30s</span>
                </div>
                <div class="divide-y divide-brand-line">
                  <button
                    v-if="notifs.drivers_pending > 0"
                    @click="goTo('/dashboard/drivers')"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left"
                  >
                    <div class="w-10 h-10 rounded-xl bg-brand-yellow/30 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-brand-yellow-dim" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">
                        <span class="tg-mono">{{ notifs.drivers_pending }}</span> chauffeur(s) en attente
                      </p>
                      <p class="text-xs text-brand-muted">Approuver pour activer leurs courses</p>
                    </div>
                  </button>
                  <button
                    @click="goTo('/dashboard/rides')"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left"
                  >
                    <div class="w-10 h-10 rounded-xl bg-brand-success/15 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-brand-success" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">
                        <span class="tg-mono">{{ notifs.rides_today }}</span> courses aujourd'hui
                      </p>
                      <p class="text-xs text-brand-muted">Voir l'historique complet</p>
                    </div>
                  </button>
                  <button
                    @click="goTo('/dashboard')"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left"
                  >
                    <div class="w-10 h-10 rounded-xl bg-brand-moov/15 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-brand-moov" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">
                        <span class="tg-mono">{{ notifs.drivers_online }}</span> chauffeur(s) en ligne
                      </p>
                      <p class="text-xs text-brand-muted">Voir le tableau de bord</p>
                    </div>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Quick actions dropdown -->
          <div class="relative" data-quick-area>
            <button
              @click="quickOpen = !quickOpen"
              class="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-navy text-white text-sm font-extrabold hover:brightness-110 transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Actions rapides
              <svg
                :class="['w-3 h-3 transition-transform', quickOpen ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="quickOpen"
                class="absolute right-0 mt-2 w-72 bg-white rounded-2xl tg-shadow-lg border border-brand-line overflow-hidden"
              >
                <div class="px-4 py-3 bg-brand-navy text-white">
                  <p class="text-xs font-extrabold">Actions rapides</p>
                </div>
                <div class="divide-y divide-brand-line">
                  <button @click="quickGo('/dashboard/formulas')" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left">
                    <div class="w-9 h-9 rounded-xl bg-brand-yellow/30 flex items-center justify-center shrink-0 text-brand-navy">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">Nouvelle formule</p>
                      <p class="text-xs text-brand-muted">Créer un type de course</p>
                    </div>
                  </button>
                  <button @click="quickGo('/dashboard/drivers')" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left">
                    <div class="w-9 h-9 rounded-xl bg-brand-success/15 flex items-center justify-center shrink-0 text-brand-success">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">Approuver chauffeurs</p>
                      <p class="text-xs text-brand-muted">Comptes en attente</p>
                    </div>
                  </button>
                  <button @click="quickGo('/dashboard/rides')" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left">
                    <div class="w-9 h-9 rounded-xl bg-brand-moov/15 flex items-center justify-center shrink-0 text-brand-moov">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">Voir les courses</p>
                      <p class="text-xs text-brand-muted">Historique complet</p>
                    </div>
                  </button>
                  <button @click="quickGo('/dashboard/vehicles')" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-line-2 text-left">
                    <div class="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center shrink-0 text-brand-navy">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-extrabold">Flotte véhicules</p>
                      <p class="text-xs text-brand-muted">Tous les véhicules</p>
                    </div>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- User chip -->
          <router-link
            to="/dashboard/settings"
            class="flex items-center gap-3 pl-3 ml-1 border-l border-brand-line hover:opacity-80 transition"
          >
            <div class="text-right hidden xl:block">
              <p class="text-sm font-extrabold leading-tight">{{ auth.user?.name || 'Admin' }}</p>
              <p class="text-[11px] text-brand-muted leading-tight">Administrateur</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-sm">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
          </router-link>
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
