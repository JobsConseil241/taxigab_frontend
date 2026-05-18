<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import EmptyState from '../components/EmptyState.vue'
import SideDrawer from '../components/SideDrawer.vue'

const auth = useAuthStore()
const admins = ref([])
const loading = ref(true)
const search = ref('')
const selected = ref(null)

async function fetchAdmins() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users', { params: { role: 'admin' } })
    admins.value = data.users || data.data || []
  } catch (e) {
    console.error('Admins load failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAdmins)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return admins.value
  return admins.value.filter(u =>
    (u.name || '').toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q) ||
    (u.phone || '').toLowerCase().includes(q),
  )
})

const activeCount = computed(() => admins.value.filter(a => a.is_active).length)

function formatLongDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function relativeTime(val) {
  if (!val) return '—'
  const diff = Date.now() - new Date(val).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `il y a ${hrs} h`
  const days = Math.round(hrs / 24)
  if (days < 30) return `il y a ${days} j`
  return formatDate(val)
}

const showInviteToast = ref(false)
function comingSoon() {
  showInviteToast.value = true
  setTimeout(() => (showInviteToast.value = false), 3000)
}

function isCurrent(u) {
  return auth.user?.id === u.id
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight">Administrateurs</h1>
        <p class="text-brand-muted mt-1 text-sm">
          <span class="tg-mono font-bold">{{ admins.length }}</span> compte{{ admins.length > 1 ? 's' : '' }} ·
          <span class="tg-mono font-bold text-brand-success">{{ activeCount }}</span> actif{{ activeCount > 1 ? 's' : '' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <input v-model="search" placeholder="Nom, email…" class="pl-10 pr-4 h-10 rounded-lg border border-brand-line bg-white text-sm font-semibold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none w-64"/>
        </div>
        <button @click="comingSoon"
          class="h-10 px-4 rounded-lg bg-brand-yellow text-brand-navy font-extrabold text-sm flex items-center gap-2 hover:brightness-95 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Inviter un admin
        </button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl border border-brand-line p-5">
        <div class="text-[11px] font-extrabold tracking-[0.08em] text-brand-muted">TOTAL ADMINS</div>
        <div class="tg-mono text-3xl font-extrabold mt-1">{{ admins.length }}</div>
        <div class="text-[11px] text-brand-muted mt-1">comptes super-admin</div>
      </div>
      <div class="bg-white rounded-2xl border border-brand-line p-5">
        <div class="text-[11px] font-extrabold tracking-[0.08em] text-brand-muted">CONNECTÉ</div>
        <div class="flex items-center gap-2 mt-1">
          <div class="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-xs">
            {{ auth.user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="tg-mono text-base font-extrabold truncate">{{ auth.user?.name || '—' }}</div>
        </div>
        <div class="text-[11px] text-brand-muted mt-1">vous · maintenant</div>
      </div>
      <div class="bg-white rounded-2xl border border-brand-line p-5">
        <div class="text-[11px] font-extrabold tracking-[0.08em] text-brand-muted">CRÉÉ EN</div>
        <div class="tg-mono text-3xl font-extrabold mt-1">
          {{ admins.length ? new Date(admins[admins.length - 1].created_at).getFullYear() : '—' }}
        </div>
        <div class="text-[11px] text-brand-muted mt-1">premier admin</div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="bg-white rounded-2xl border border-brand-line">
      <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-5 border-b border-brand-line last:border-0 animate-pulse">
        <div class="w-12 h-12 rounded-full bg-brand-line-2"/>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-brand-line-2 rounded w-40"/>
          <div class="h-3 bg-brand-line-2 rounded w-56"/>
        </div>
        <div class="h-7 w-20 bg-brand-line-2 rounded-full"/>
      </div>
    </div>

    <!-- Admin list -->
    <div v-else class="bg-white rounded-2xl border border-brand-line overflow-hidden">
      <div v-if="filtered.length === 0">
        <EmptyState
          icon="users"
          :title="search ? 'Aucun résultat' : 'Aucun administrateur'"
          :hint="search ? `Aucun nom ou email ne correspond à « ${search} ».` : 'Invitez votre premier admin via le bouton « Inviter un admin ».'"
        />
      </div>
      <div v-else>
        <div v-for="u in filtered" :key="u.id"
          class="flex items-center gap-4 p-5 border-b border-brand-line last:border-0 hover:bg-brand-surface-bg/60 cursor-pointer transition-colors"
          @click="selected = u">
          <div class="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-base shrink-0">
            {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-extrabold truncate">{{ u.name }}</p>
              <span v-if="isCurrent(u)" class="text-[9px] font-extrabold tracking-[0.08em] px-1.5 py-0.5 rounded-md bg-brand-yellow text-brand-navy">VOUS</span>
            </div>
            <p class="text-xs text-brand-muted truncate">
              <span class="tg-mono">{{ u.email }}</span>
              <span v-if="u.phone" class="text-brand-muted/60"> · </span>
              <span v-if="u.phone" class="tg-mono">{{ u.phone }}</span>
            </p>
            <p class="text-[11px] text-brand-muted mt-1">
              Créé {{ formatDate(u.created_at) }}
              <span v-if="u.last_seen_at" class="text-brand-muted/60"> · </span>
              <span v-if="u.last_seen_at">Vu {{ relativeTime(u.last_seen_at) }}</span>
            </p>
          </div>

          <div class="hidden md:flex items-center gap-3">
            <span :class="[
              'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full',
              u.is_active ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-line-2 text-brand-muted',
            ]">
              <span :class="['w-1.5 h-1.5 rounded-full', u.is_active ? 'bg-brand-success' : 'bg-brand-muted']"/>
              {{ u.is_active ? 'Actif' : 'Inactif' }}
            </span>
            <span class="px-2.5 py-1 rounded-full bg-brand-navy text-white text-[10px] font-extrabold tracking-[0.06em]">
              SUPER-ADMIN
            </span>
          </div>

          <svg class="w-5 h-5 text-brand-muted shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Drawer -->
    <SideDrawer
      :open="!!selected"
      :title="selected?.name || 'Administrateur'"
      subtitle="FICHE ADMINISTRATEUR"
      width="max-w-md"
      @close="selected = null"
    >
      <template v-if="selected">
        <div class="relative bg-brand-navy text-white p-6 overflow-hidden">
          <div class="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-yellow/10 pointer-events-none"/>
          <div class="relative flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-2xl shrink-0">
              {{ selected.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-extrabold tracking-[0.12em] text-white/55">
                #{{ selected.id }} · SUPER-ADMIN
              </p>
              <h3 class="text-2xl font-extrabold truncate">{{ selected.name }}</h3>
              <p class="text-sm text-white/70 tg-mono truncate">{{ selected.email }}</p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">STATUT</p>
              <p class="text-xs font-extrabold mt-1 flex items-center gap-1.5">
                <span :class="['w-2 h-2 rounded-full', selected.is_active ? 'bg-brand-success' : 'bg-white/30']"/>
                {{ selected.is_active ? 'ACTIF' : 'INACTIF' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">LANGUE</p>
              <p class="text-xs font-extrabold mt-1">{{ (selected.language || 'fr').toUpperCase() }}</p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">CONTACT</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4 space-y-2 text-sm">
              <p><span class="text-brand-muted">Email :</span><span class="tg-mono ml-1">{{ selected.email }}</span></p>
              <p><span class="text-brand-muted">Téléphone :</span><span class="tg-mono ml-1">{{ selected.phone || '—' }}</span></p>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">COMPTE</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4 space-y-2 text-sm">
              <p><span class="text-brand-muted">Créé le :</span><span class="font-bold ml-1">{{ formatLongDate(selected.created_at) }}</span></p>
              <p><span class="text-brand-muted">Dernière activité :</span><span class="font-bold ml-1">{{ relativeTime(selected.last_seen_at) }}</span></p>
            </div>
          </div>

          <div v-if="!isCurrent(selected)" class="pt-2">
            <button @click="comingSoon"
              class="w-full h-11 rounded-xl bg-brand-danger/10 text-brand-danger font-extrabold text-sm hover:bg-brand-danger/15 transition">
              Désactiver le compte
            </button>
          </div>
        </div>
      </template>
    </SideDrawer>

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showInviteToast"
        class="fixed bottom-6 right-6 bg-brand-navy text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
        <svg class="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
        </svg>
        <span class="text-sm font-bold">Invitation admin · bientôt disponible</span>
      </div>
    </Transition>
  </div>
</template>
