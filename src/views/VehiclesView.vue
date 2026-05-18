<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import EmptyState from '../components/EmptyState.vue'

const drivers = ref([])
const loading = ref(true)
const search = ref('')

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

// Flatten all vehicles from drivers
const vehicles = computed(() => {
  const list = []
  for (const d of drivers.value) {
    const vs = d.vehicles ?? (d.active_vehicle ? [d.active_vehicle] : [])
    for (const v of vs) {
      list.push({
        ...v,
        driverName: d.user?.name || d.name || 'Inconnu',
        driverPhone: d.user?.phone || '',
        driverId: d.id,
        driverOnline: !!d.is_online,
        driverStatus: d.status,
      })
    }
  }
  return list
})

const filtered = computed(() => {
  if (!search.value.trim()) return vehicles.value
  const q = search.value.toLowerCase()
  return vehicles.value.filter(
    (v) =>
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.plate_number?.toLowerCase().includes(q) ||
      v.driverName?.toLowerCase().includes(q),
  )
})

const totalActive = computed(() =>
  vehicles.value.filter((v) => v.driverOnline).length,
)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Flotte véhicules</h1>
        <p class="text-brand-muted mt-1 text-sm">
          <span class="tg-mono font-bold">{{ vehicles.length }}</span>
          véhicule{{ vehicles.length > 1 ? 's' : '' }} ·
          <span class="tg-mono font-bold text-brand-success">{{ totalActive }}</span>
          en ligne
        </p>
      </div>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Plaque, marque, chauffeur…"
          class="pl-10 pr-4 h-11 rounded-xl border border-brand-line bg-white text-sm font-semibold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none w-72"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-3xl tg-shadow-sm p-5 animate-pulse">
        <div class="flex gap-4">
          <div class="w-14 h-14 rounded-xl bg-brand-line"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-brand-line rounded w-32"></div>
            <div class="h-3 bg-brand-line rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div v-else-if="filtered.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="v in filtered"
        :key="`${v.driverId}-${v.id || v.plate_number}`"
        class="bg-white rounded-3xl tg-shadow-sm p-5 hover:tg-shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="w-14 h-14 rounded-2xl bg-brand-yellow flex items-center justify-center">
            <svg class="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5"/>
            </svg>
          </div>
          <span
            class="tg-mono font-extrabold text-brand-navy bg-brand-yellow px-2.5 py-1 rounded border-2 border-brand-navy"
          >{{ v.plate_number }}</span>
        </div>

        <h3 class="font-extrabold text-lg leading-tight">
          {{ v.brand }} {{ v.model }}
        </h3>
        <p class="text-sm text-brand-muted">
          {{ v.color }}
          <span v-if="v.year" class="tg-mono">· {{ v.year }}</span>
          <span v-if="v.category" class="ml-1">· {{ v.category }}</span>
        </p>

        <div class="mt-4 pt-4 border-t border-brand-line flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-brand-line-2 flex items-center justify-center text-brand-navy text-xs font-extrabold">
            {{ v.driverName?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold truncate">{{ v.driverName }}</p>
            <p class="text-xs text-brand-muted tg-mono truncate">{{ v.driverPhone || '—' }}</p>
          </div>
          <span
            :class="[
              'flex items-center gap-1 text-xs font-extrabold',
              v.driverOnline ? 'text-brand-success' : 'text-brand-muted',
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                v.driverOnline ? 'bg-brand-success animate-pulse' : 'bg-brand-line',
              ]"
            />
            {{ v.driverOnline ? 'EN LIGNE' : 'HORS LIGNE' }}
          </span>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="car"
      :title="search ? 'Aucun véhicule trouvé' : 'Aucun véhicule enregistré'"
      :hint="search ? `Aucun véhicule ne correspond à « ${search} ».` : 'Les véhicules apparaîtront ici une fois les chauffeurs approuvés.'"
    />
  </div>
</template>
