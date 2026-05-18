<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'

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
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Courses</h1>
        <p class="text-brand-muted mt-1 text-sm">Historique complet — filtrable par statut</p>
      </div>
      <select
        v-model="statusFilter"
        class="px-4 h-11 rounded-xl border border-brand-line bg-white text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none"
      >
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-3xl tg-shadow-sm">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 border-b border-brand-line last:border-0 animate-pulse">
        <div class="h-4 bg-brand-line rounded w-8"></div>
        <div class="h-4 bg-brand-line rounded w-40"></div>
        <div class="h-4 bg-brand-line rounded w-20 ml-auto"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-3xl tg-shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-brand-line-2 text-left text-brand-muted">
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">#</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">PASSAGER</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">CHAUFFEUR</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">TRAJET</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">FORMULE</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">STATUT</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em] text-right">PRIX</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ride in rides"
              :key="ride.id"
              class="border-t border-brand-line hover:bg-brand-line-2/40 transition-colors cursor-pointer"
              @click="selectedRide = selectedRide?.id === ride.id ? null : ride"
            >
              <td class="px-5 py-3 tg-mono font-bold text-brand-muted">#{{ ride.id }}</td>
              <td class="px-5 py-3 font-semibold">{{ ride.passenger?.name || '—' }}</td>
              <td class="px-5 py-3 font-semibold">{{ ride.driver?.user?.name || ride.driver?.name || '—' }}</td>
              <td class="px-5 py-3 max-w-[220px] truncate text-brand-ink-2">
                {{ ride.pickup_address || '...' }} → {{ ride.dropoff_address || '...' }}
              </td>
              <td class="px-5 py-3">
                <span v-if="ride.formula_name" class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-brand-yellow/30 text-brand-navy">
                  {{ ride.formula_name }}
                </span>
                <span v-else class="text-brand-muted">—</span>
              </td>
              <td class="px-5 py-3">
                <StatusBadge :status="ride.status" />
              </td>
              <td class="px-5 py-3 text-right tg-mono font-extrabold whitespace-nowrap text-brand-navy">
                {{ formatPrice(ride.price_final || ride.price_estimated) }} <span class="text-[10px] text-brand-muted">F</span>
              </td>
              <td class="px-5 py-3 text-brand-muted whitespace-nowrap">
                {{ formatDate(ride.requested_at || ride.created_at) }}
              </td>
            </tr>
            <tr v-if="rides.length === 0">
              <td colspan="8" class="p-0">
                <EmptyState
                  icon="car"
                  title="Aucune course trouvée"
                  hint="Modifiez le filtre statut ou attendez la prochaine demande."
                />
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
      <div v-if="selectedRide" class="bg-white rounded-3xl tg-shadow-md p-6 mt-4 border-l-4 border-brand-yellow">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-lg">
            Course <span class="tg-mono text-brand-muted">#{{ selectedRide.id }}</span>
          </h3>
          <button @click="selectedRide = null" class="p-1 rounded-lg hover:bg-brand-line-2">
            <svg class="w-5 h-5 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">STATUT</span>
            <div class="mt-1"><StatusBadge :status="selectedRide.status" /></div>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">DISTANCE</span>
            <p class="tg-mono font-extrabold mt-1">{{ selectedRide.distance_km }} km</p>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">DURÉE</span>
            <p class="tg-mono font-extrabold mt-1">{{ selectedRide.duration_minutes }} min</p>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">PRIX ESTIMÉ</span>
            <p class="tg-mono font-extrabold mt-1">{{ formatPrice(selectedRide.price_estimated) }} F</p>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">PRIX FINAL</span>
            <p class="tg-mono font-extrabold mt-1 text-brand-success">{{ formatPrice(selectedRide.price_final) }} F</p>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">PAIEMENT</span>
            <p class="font-bold mt-1">{{ selectedRide.payment_method === 'cash' ? 'Espèces' : 'Mobile Money' }}</p>
          </div>
          <div v-if="selectedRide.formula_name">
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">FORMULE</span>
            <p class="font-bold mt-1">{{ selectedRide.formula_name }}</p>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">DÉPART</span>
            <p class="font-semibold mt-1">{{ selectedRide.pickup_address || '—' }}</p>
          </div>
          <div>
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">ARRIVÉE</span>
            <p class="font-semibold mt-1">{{ selectedRide.dropoff_address || '—' }}</p>
          </div>
          <div v-if="selectedRide.rating">
            <span class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted">NOTE</span>
            <p class="font-bold mt-1 text-brand-yellow-dim">{{ '⭐'.repeat(selectedRide.rating) }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
