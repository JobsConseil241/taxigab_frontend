<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge.vue'

const rides = ref([])
const loading = ref(true)
const statusFilter = ref('')
const selectedRide = ref(null)

const statuses = [
  { value: '', label: 'Tous les statuts' },
  { value: 'requested', label: 'En attente' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'arriving', label: 'En approche' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
]

async function fetchRides() {
  loading.value = true
  try {
    const params = {}
    if (statusFilter.value) params.status = statusFilter.value
    const { data } = await api.get('/admin/rides', { params })
    rides.value = data.data || data.rides || data || []
  } catch (e) {
    console.error('Rides load failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchRides)
watch(statusFilter, fetchRides)

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR').format(val || 0)
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-extrabold tracking-tight">Courses</h1>
      <select
        v-model="statusFilter"
        class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
      >
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 border-b last:border-0 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-8"></div>
        <div class="h-4 bg-gray-200 rounded w-40"></div>
        <div class="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 text-left text-gray-500 font-medium">
              <th class="px-5 py-3">#</th>
              <th class="px-5 py-3">Passager</th>
              <th class="px-5 py-3">Chauffeur</th>
              <th class="px-5 py-3">Trajet</th>
              <th class="px-5 py-3">Formule</th>
              <th class="px-5 py-3">Statut</th>
              <th class="px-5 py-3 text-right">Prix</th>
              <th class="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ride in rides"
              :key="ride.id"
              class="border-t hover:bg-gray-50/50 transition-colors cursor-pointer"
              @click="selectedRide = selectedRide?.id === ride.id ? null : ride"
            >
              <td class="px-5 py-3 font-semibold text-gray-400">{{ ride.id }}</td>
              <td class="px-5 py-3">{{ ride.passenger?.name || '—' }}</td>
              <td class="px-5 py-3">{{ ride.driver?.user?.name || ride.driver?.name || '—' }}</td>
              <td class="px-5 py-3 max-w-[200px] truncate text-gray-500">
                {{ ride.pickup_address || '...' }} → {{ ride.dropoff_address || '...' }}
              </td>
              <td class="px-5 py-3">
                <span v-if="ride.formula_name" class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-800">
                  {{ ride.formula_name }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-5 py-3">
                <StatusBadge :status="ride.status" />
              </td>
              <td class="px-5 py-3 text-right font-semibold whitespace-nowrap">
                {{ formatPrice(ride.price_final || ride.price_estimated) }} XAF
              </td>
              <td class="px-5 py-3 text-gray-500 whitespace-nowrap">
                {{ formatDate(ride.requested_at || ride.created_at) }}
              </td>
            </tr>
            <tr v-if="rides.length === 0">
              <td colspan="8" class="px-5 py-12 text-center text-gray-400">
                Aucune course trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail panel -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="selectedRide" class="bg-white rounded-2xl border p-6 mt-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">Course #{{ selectedRide.id }}</h3>
          <button @click="selectedRide = null" class="p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Statut</span>
            <div class="mt-1"><StatusBadge :status="selectedRide.status" /></div>
          </div>
          <div>
            <span class="text-gray-500">Distance</span>
            <p class="font-semibold mt-1">{{ selectedRide.distance_km }} km</p>
          </div>
          <div>
            <span class="text-gray-500">Durée estimée</span>
            <p class="font-semibold mt-1">{{ selectedRide.duration_minutes }} min</p>
          </div>
          <div>
            <span class="text-gray-500">Prix estimé</span>
            <p class="font-semibold mt-1">{{ formatPrice(selectedRide.price_estimated) }} XAF</p>
          </div>
          <div>
            <span class="text-gray-500">Prix final</span>
            <p class="font-semibold mt-1">{{ formatPrice(selectedRide.price_final) }} XAF</p>
          </div>
          <div>
            <span class="text-gray-500">Paiement</span>
            <p class="font-semibold mt-1">{{ selectedRide.payment_method === 'cash' ? 'Espèces' : 'Mobile Money' }}</p>
          </div>
          <div v-if="selectedRide.formula_name">
            <span class="text-gray-500">Formule</span>
            <p class="font-semibold mt-1">{{ selectedRide.formula_name }}</p>
          </div>
          <div>
            <span class="text-gray-500">Départ</span>
            <p class="font-semibold mt-1">{{ selectedRide.pickup_address || '—' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Arrivée</span>
            <p class="font-semibold mt-1">{{ selectedRide.dropoff_address || '—' }}</p>
          </div>
          <div v-if="selectedRide.rating">
            <span class="text-gray-500">Note</span>
            <p class="font-semibold mt-1">{{ '⭐'.repeat(selectedRide.rating) }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
