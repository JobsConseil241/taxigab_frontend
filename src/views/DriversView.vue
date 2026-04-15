<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge.vue'

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
    <h1 class="text-2xl font-extrabold tracking-tight mb-6">Chauffeurs</h1>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border p-5 animate-pulse">
        <div class="flex gap-4">
          <div class="w-12 h-12 rounded-full bg-gray-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-32"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div v-else-if="drivers.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="driver in drivers"
        :key="driver.id"
        class="bg-white rounded-2xl border p-5 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0',
              driver.is_online ? 'bg-emerald-500' : 'bg-gray-300',
            ]"
          >
            {{ driver.user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm truncate">{{ driver.user?.name || 'Chauffeur' }}</h3>
              <StatusBadge :status="driver.status" />
            </div>
            <p class="text-xs text-gray-500 mt-0.5">{{ driver.user?.email }}</p>
            <p class="text-xs text-gray-500">{{ driver.user?.phone || '—' }}</p>

            <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ Number(driver.rating_avg).toFixed(1) }}
              </span>
              <span>{{ driver.total_rides }} courses</span>
              <span
                :class="['flex items-center gap-1', driver.is_online ? 'text-emerald-600' : 'text-gray-400']"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', driver.is_online ? 'bg-emerald-500' : 'bg-gray-300']"></span>
                {{ driver.is_online ? 'En ligne' : 'Hors ligne' }}
              </span>
            </div>

            <!-- Vehicle -->
            <div v-if="driver.active_vehicle || driver.vehicles?.length" class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <template v-if="driver.active_vehicle">
                {{ driver.active_vehicle.brand }} {{ driver.active_vehicle.model }}
                · {{ driver.active_vehicle.color }}
                · <span class="font-semibold text-gray-700">{{ driver.active_vehicle.plate_number }}</span>
              </template>
              <template v-else-if="driver.vehicles?.[0]">
                {{ driver.vehicles[0].brand }} {{ driver.vehicles[0].model }}
                · <span class="font-semibold text-gray-700">{{ driver.vehicles[0].plate_number }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Approve button -->
        <button
          v-if="driver.status === 'pending'"
          @click="approve(driver.id)"
          class="mt-4 w-full py-2 text-sm font-semibold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
        >
          Approuver le chauffeur
        </button>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 py-16">
      Aucun chauffeur enregistré
    </div>
  </div>
</template>
