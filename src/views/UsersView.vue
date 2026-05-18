<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import EmptyState from '../components/EmptyState.vue'

const users = ref([])
const loading = ref(true)
const search = ref('')

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
              class="border-t border-brand-line hover:bg-brand-line-2/40 transition-colors"
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
  </div>
</template>
