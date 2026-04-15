<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

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
  passenger: 'bg-blue-50 text-blue-700',
  driver: 'bg-amber-50 text-amber-700',
  admin: 'bg-purple-50 text-purple-700',
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
      <h1 class="text-2xl font-extrabold tracking-tight">Utilisateurs</h1>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none w-64"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 border-b last:border-0 animate-pulse">
        <div class="w-10 h-10 rounded-full bg-gray-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-32"></div>
          <div class="h-3 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 text-left text-gray-500 font-medium">
              <th class="px-5 py-3">Utilisateur</th>
              <th class="px-5 py-3">Téléphone</th>
              <th class="px-5 py-3">Rôle</th>
              <th class="px-5 py-3">Statut</th>
              <th class="px-5 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filtered"
              :key="user.id"
              class="border-t hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-brand-purple font-bold text-xs shrink-0">
                    {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold truncate">{{ user.name }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-gray-500">{{ user.phone || '—' }}</td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                    roleColor[user.role] || 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ roleLabel[user.role] || user.role }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 text-xs font-medium',
                    user.is_active ? 'text-emerald-600' : 'text-gray-400',
                  ]"
                >
                  <span
                    :class="['w-1.5 h-1.5 rounded-full', user.is_active ? 'bg-emerald-500' : 'bg-gray-300']"
                  ></span>
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-500 whitespace-nowrap">
                {{ formatDate(user.created_at) }}
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="px-5 py-12 text-center text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
