<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'

const drivers = ref([])
const loading = ref(true)

async function fetchDrivers() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/drivers')
    drivers.value = data.data || data.drivers || data || []
  } catch (e) {
    console.error('Drivers load failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDrivers)

async function approve(driverId) {
  try {
    await api.patch(`/admin/drivers/${driverId}/approve`)
    await fetchDrivers()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight">Chauffeurs</h1>
    <p class="text-brand-muted mt-1 mb-6 text-sm">Flotte TaxiGab — approbation, statut en ligne, véhicules</p>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-3xl tg-shadow-sm p-5 animate-pulse">
        <div class="flex gap-4">
          <div class="w-12 h-12 rounded-full bg-brand-line"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-brand-line rounded w-32"></div>
            <div class="h-3 bg-brand-line rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div v-else-if="drivers.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="driver in drivers"
        :key="driver.id"
        class="bg-white rounded-3xl tg-shadow-sm p-5 hover:tg-shadow-md transition-shadow"
      >
        <div class="flex items-start gap-4">
          <!-- Avatar (navy with yellow ring if online) -->
          <div
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center font-extrabold shrink-0',
              driver.is_online
                ? 'bg-brand-yellow text-brand-navy ring-2 ring-brand-success'
                : 'bg-brand-line-2 text-brand-navy',
            ]"
          >
            {{ driver.user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-extrabold text-sm truncate">{{ driver.user?.name || 'Chauffeur' }}</h3>
              <StatusBadge :status="driver.status" />
            </div>
            <p class="text-xs text-brand-muted mt-0.5">{{ driver.user?.email }}</p>
            <p class="text-xs text-brand-muted tg-mono">{{ driver.user?.phone || '—' }}</p>

            <div class="flex items-center gap-4 mt-3 text-xs text-brand-muted">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-brand-yellow-dim" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="tg-mono font-bold text-brand-ink">{{ Number(driver.rating_avg).toFixed(1) }}</span>
              </span>
              <span class="tg-mono font-bold text-brand-ink">{{ driver.total_rides }}<span class="text-brand-muted ml-1">courses</span></span>
              <span
                :class="['flex items-center gap-1 font-bold', driver.is_online ? 'text-brand-success' : 'text-brand-muted']"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', driver.is_online ? 'bg-brand-success animate-pulse' : 'bg-brand-line']"></span>
                {{ driver.is_online ? 'En ligne' : 'Hors ligne' }}
              </span>
            </div>

            <!-- Vehicle -->
            <div v-if="driver.active_vehicle || driver.vehicles?.length" class="mt-3 text-xs text-brand-ink-2 bg-brand-line-2 rounded-xl px-3 py-2 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-brand-navy" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5" />
              </svg>
              <template v-if="driver.active_vehicle">
                <span class="font-semibold">{{ driver.active_vehicle.brand }} {{ driver.active_vehicle.model }}</span>
                <span class="text-brand-muted">·</span>
                <span class="tg-mono font-extrabold text-brand-navy bg-brand-yellow px-1.5 py-0.5 rounded">
                  {{ driver.active_vehicle.plate_number }}
                </span>
              </template>
              <template v-else-if="driver.vehicles?.[0]">
                <span class="font-semibold">{{ driver.vehicles[0].brand }} {{ driver.vehicles[0].model }}</span>
                <span class="text-brand-muted">·</span>
                <span class="tg-mono font-extrabold text-brand-navy bg-brand-yellow px-1.5 py-0.5 rounded">
                  {{ driver.vehicles[0].plate_number }}
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- Approve button -->
        <button
          v-if="driver.status === 'pending'"
          @click="approve(driver.id)"
          class="mt-4 w-full py-2.5 text-sm font-extrabold rounded-full bg-brand-yellow text-brand-navy hover:brightness-95 transition tg-shadow-sm"
        >
          Approuver le chauffeur
        </button>
      </div>
    </div>

    <EmptyState
      v-else
      icon="users"
      title="Aucun chauffeur enregistré"
      hint="Les chauffeurs inscrits apparaîtront ici une fois leurs documents soumis."
    />
  </div>
</template>
