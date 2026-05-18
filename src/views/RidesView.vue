<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import SideDrawer from '../components/SideDrawer.vue'

const rides = ref([])
const loading = ref(true)
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const perPage = ref(20)
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
watch(statusFilter, () => { page.value = 1; fetchRides() })
watch([dateFrom, dateTo], () => { page.value = 1 })

const filteredRides = computed(() => {
  const from = dateFrom.value ? new Date(dateFrom.value) : null
  const to = dateTo.value
    ? new Date(new Date(dateTo.value).setHours(23, 59, 59, 999))
    : null
  return rides.value.filter((r) => {
    const d = new Date(r.requested_at || r.created_at)
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRides.value.length / perPage.value)),
)

const pagedRides = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredRides.value.slice(start, start + perPage.value)
})

function resetFilters() {
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  page.value = 1
}

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
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Courses</h1>
        <p class="text-brand-muted mt-1 text-sm">
          Historique complet — {{ filteredRides.length }} {{ filteredRides.length > 1 ? 'résultats' : 'résultat' }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="statusFilter"
          class="px-4 h-11 rounded-xl border border-brand-line bg-white text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none"
        >
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <div class="flex items-center gap-2 h-11 px-3 rounded-xl border border-brand-line bg-white text-sm">
          <span class="text-[11px] font-extrabold text-brand-muted tracking-[0.1em]">DU</span>
          <input
            type="date"
            v-model="dateFrom"
            class="bg-transparent text-sm font-bold focus:outline-none w-32"
          />
          <span class="text-[11px] font-extrabold text-brand-muted tracking-[0.1em]">AU</span>
          <input
            type="date"
            v-model="dateTo"
            class="bg-transparent text-sm font-bold focus:outline-none w-32"
          />
        </div>
        <button
          v-if="statusFilter || dateFrom || dateTo"
          @click="resetFilters"
          class="h-11 px-3 rounded-xl text-sm font-bold text-brand-muted hover:text-brand-ink hover:bg-brand-line-2"
        >
          ✕ Réinitialiser
        </button>
      </div>
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
              v-for="ride in pagedRides"
              :key="ride.id"
              class="border-t border-brand-line hover:bg-brand-line-2/40 transition-colors cursor-pointer"
              @click="selectedRide = ride"
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
            <tr v-if="pagedRides.length === 0">
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

      <!-- Pagination -->
      <div
        v-if="filteredRides.length > perPage"
        class="flex items-center justify-between px-5 py-3 border-t border-brand-line bg-brand-surface-bg text-sm"
      >
        <p class="text-brand-muted">
          Page <span class="tg-mono font-bold text-brand-ink">{{ page }}</span>
          / <span class="tg-mono font-bold text-brand-ink">{{ totalPages }}</span>
          · <span class="tg-mono">{{ filteredRides.length }}</span> résultats
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="page === 1"
            @click="page = Math.max(1, page - 1)"
            class="h-9 w-9 rounded-lg bg-white border border-brand-line text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-line-2 flex items-center justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            :disabled="page === totalPages"
            @click="page = Math.min(totalPages, page + 1)"
            class="h-9 w-9 rounded-lg bg-white border border-brand-line text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-line-2 flex items-center justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail drawer -->
    <SideDrawer
      :open="!!selectedRide"
      :title="selectedRide ? `Course #${selectedRide.id}` : ''"
      subtitle="DÉTAIL COURSE"
      width="max-w-md"
      @close="selectedRide = null"
    >
      <template v-if="selectedRide">
        <!-- Hero price -->
        <div class="relative bg-brand-navy text-white p-6 overflow-hidden">
          <div class="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-yellow/10 pointer-events-none" />
          <div class="relative">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[11px] font-extrabold tracking-[0.12em] text-white/55">
                {{ formatDate(selectedRide.requested_at || selectedRide.created_at) }}
              </p>
              <StatusBadge :status="selectedRide.status" />
            </div>
            <div class="flex items-baseline gap-2">
              <span class="tg-mono text-5xl font-extrabold text-brand-yellow tracking-tight">
                {{ formatPrice(selectedRide.price_final || selectedRide.price_estimated) }}
              </span>
              <span class="text-white/70 font-bold">FCFA</span>
            </div>
            <p class="text-xs text-white/60 tg-mono mt-1">
              {{ selectedRide.distance_km }} km · {{ selectedRide.duration_minutes }} min
            </p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Route -->
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">TRAJET</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4">
              <div class="flex items-start gap-3">
                <div class="flex flex-col items-center pt-1.5">
                  <span class="w-3 h-3 rounded-full border-2 border-brand-navy bg-white" />
                  <span class="w-0.5 flex-1 bg-brand-line min-h-8 my-1" />
                  <span class="w-3.5 h-3.5 bg-brand-yellow border-2 border-brand-navy" />
                </div>
                <div class="flex-1 min-w-0 space-y-3">
                  <div>
                    <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">DÉPART</p>
                    <p class="font-bold text-sm">{{ selectedRide.pickup_address || 'Position de départ' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">ARRIVÉE</p>
                    <p class="font-bold text-sm">{{ selectedRide.dropoff_address || 'Destination' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- People -->
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">PERSONNES</p>
            <div class="space-y-2">
              <div class="bg-brand-surface-bg rounded-xl p-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy text-sm font-extrabold">
                  {{ selectedRide.passenger?.name?.charAt(0)?.toUpperCase() || 'P' }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">PASSAGER</p>
                  <p class="font-bold text-sm truncate">{{ selectedRide.passenger?.name || '—' }}</p>
                </div>
                <p class="tg-mono text-xs text-brand-muted">{{ selectedRide.passenger?.phone || '' }}</p>
              </div>
              <div v-if="selectedRide.driver" class="bg-brand-surface-bg rounded-xl p-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center text-white text-sm font-extrabold">
                  {{ (selectedRide.driver.user?.name || selectedRide.driver.name || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">CHAUFFEUR</p>
                  <p class="font-bold text-sm truncate">
                    {{ selectedRide.driver.user?.name || selectedRide.driver.name }}
                  </p>
                </div>
                <p class="tg-mono text-xs text-brand-muted">
                  {{ selectedRide.driver.user?.phone || selectedRide.driver.phone || '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">TARIFICATION</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-brand-muted">Estimé</span>
                <span class="tg-mono font-bold">{{ formatPrice(selectedRide.price_estimated) }} F</span>
              </div>
              <div class="flex justify-between">
                <span class="text-brand-muted">Final</span>
                <span class="tg-mono font-extrabold text-brand-success">{{ formatPrice(selectedRide.price_final || selectedRide.price_estimated) }} F</span>
              </div>
              <div v-if="selectedRide.formula_name" class="flex justify-between pt-1 border-t border-brand-line">
                <span class="text-brand-muted">Formule</span>
                <span class="font-bold">{{ selectedRide.formula_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-brand-muted">Paiement</span>
                <span class="font-bold">{{ selectedRide.payment_method === 'cash' ? 'Espèces' : 'Mobile Money' }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedRide.rating">
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">NOTE PASSAGER</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4">
              <p class="text-xl text-brand-yellow-dim">{{ '⭐'.repeat(selectedRide.rating) }}</p>
              <p v-if="selectedRide.review" class="text-sm text-brand-ink-2 italic mt-2">"{{ selectedRide.review }}"</p>
            </div>
          </div>
        </div>
      </template>
    </SideDrawer>
  </div>
</template>
