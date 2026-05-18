<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import EmptyState from '../components/EmptyState.vue'
import SideDrawer from '../components/SideDrawer.vue'

const route = useRoute()
const users = ref([])
const loading = ref(true)
const search = ref((route.query.q ?? '').toString())
const selectedUser = ref(null)

function formatLongDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

watch(() => route.query.q, (q) => {
  if (q !== undefined) search.value = (q ?? '').toString()
})

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users')
    users.value = data.data || data.users || data || []
  } catch (e) {
    console.error('Users load failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

const filtered = computed(() => {
  if (!search.value.trim()) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q),
  )
})

const roleLabel = {
  passenger: 'Passager',
  driver: 'Chauffeur',
  admin: 'Admin',
}

const roleColor = {
  passenger: 'bg-brand-moov/15 text-brand-moov',
  driver: 'bg-brand-yellow/30 text-brand-navy',
  admin: 'bg-brand-navy/10 text-brand-navy',
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Utilisateurs</h1>
        <p class="text-brand-muted mt-1 text-sm">Comptes passagers + chauffeurs + admin</p>
      </div>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un utilisateur…"
          class="pl-10 pr-4 h-11 rounded-xl border border-brand-line bg-white text-sm font-semibold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none w-72"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-3xl tg-shadow-sm">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 border-b border-brand-line last:border-0 animate-pulse">
        <div class="w-10 h-10 rounded-full bg-brand-line"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-brand-line rounded w-32"></div>
          <div class="h-3 bg-brand-line rounded w-40"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-3xl tg-shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-brand-line-2 text-left text-brand-muted">
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">UTILISATEUR</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">TÉLÉPHONE</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">RÔLE</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">STATUT</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">INSCRIT LE</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filtered"
              :key="user.id"
              class="border-t border-brand-line hover:bg-brand-line-2/40 transition-colors cursor-pointer"
              @click="selectedUser = user"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-xs shrink-0">
                    {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold truncate">{{ user.name }}</p>
                    <p class="text-xs text-brand-muted truncate">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 tg-mono text-brand-ink-2">{{ user.phone || '—' }}</td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'inline-flex px-2.5 py-1 rounded-full text-xs font-bold',
                    roleColor[user.role] || 'bg-brand-line-2 text-brand-muted',
                  ]"
                >
                  {{ roleLabel[user.role] || user.role }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 text-xs font-bold',
                    user.is_active ? 'text-brand-success' : 'text-brand-muted',
                  ]"
                >
                  <span
                    :class="['w-1.5 h-1.5 rounded-full', user.is_active ? 'bg-brand-success' : 'bg-brand-line']"
                  ></span>
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-5 py-3 text-brand-muted whitespace-nowrap">
                {{ formatDate(user.created_at) }}
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="p-0">
                <EmptyState
                  icon="users"
                  :title="search ? 'Aucun résultat' : 'Aucun utilisateur'"
                  :hint="search ? `Aucun nom, email ou téléphone ne correspond à « ${search} ».` : 'Les comptes apparaîtront ici une fois créés.'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User detail drawer -->
    <SideDrawer
      :open="!!selectedUser"
      :title="selectedUser?.name || 'Utilisateur'"
      subtitle="FICHE UTILISATEUR"
      width="max-w-md"
      @close="selectedUser = null"
    >
      <template v-if="selectedUser">
        <div class="relative bg-brand-navy text-white p-6 overflow-hidden">
          <div class="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-yellow/10 pointer-events-none" />
          <div class="relative flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-2xl shrink-0">
              {{ selectedUser.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-extrabold tracking-[0.12em] text-white/55">
                #{{ selectedUser.id }} · {{ (selectedUser.role || 'user').toUpperCase() }}
              </p>
              <h3 class="text-2xl font-extrabold truncate">{{ selectedUser.name }}</h3>
              <p class="text-sm text-white/70 tg-mono truncate">
                {{ selectedUser.phone || '—' }}
              </p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">RÔLE</p>
              <p class="font-extrabold mt-1 text-sm">
                <span
                  :class="[
                    'inline-block px-2 py-0.5 rounded-md',
                    roleColor[selectedUser.role] || 'bg-white/10',
                  ]"
                >
                  {{ roleLabel[selectedUser.role] || selectedUser.role }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">STATUT</p>
              <p class="text-xs font-extrabold mt-1 flex items-center gap-1.5">
                <span
                  :class="[
                    'w-2 h-2 rounded-full',
                    selectedUser.is_active ? 'bg-brand-success' : 'bg-white/30',
                  ]"
                />
                {{ selectedUser.is_active ? 'ACTIF' : 'INACTIF' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">CONTACT</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4 space-y-2 text-sm">
              <p>
                <span class="text-brand-muted">Email :</span>
                <span class="tg-mono ml-1">{{ selectedUser.email }}</span>
              </p>
              <p>
                <span class="text-brand-muted">Téléphone :</span>
                <span class="tg-mono ml-1">{{ selectedUser.phone || '—' }}</span>
              </p>
              <p>
                <span class="text-brand-muted">Langue :</span>
                <span class="font-bold ml-1">{{ (selectedUser.language || 'fr').toUpperCase() }}</span>
              </p>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">COMPTE</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4 space-y-2 text-sm">
              <p>
                <span class="text-brand-muted">Inscrit le :</span>
                <span class="font-bold ml-1">{{ formatLongDate(selectedUser.created_at) }}</span>
              </p>
              <p v-if="selectedUser.email_verified_at">
                <span class="text-brand-muted">Email vérifié :</span>
                <span class="font-bold ml-1 text-brand-success">✓ {{ formatLongDate(selectedUser.email_verified_at) }}</span>
              </p>
              <p v-else>
                <span class="text-brand-muted">Email vérifié :</span>
                <span class="font-bold ml-1 text-brand-muted">— non vérifié</span>
              </p>
            </div>
          </div>
        </div>
      </template>
    </SideDrawer>
  </div>
</template>
