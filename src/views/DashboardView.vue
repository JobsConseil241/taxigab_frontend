<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js'
import L from 'leaflet'
import api from '../services/api'
import StatsCard from '../components/StatsCard.vue'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const stats = ref(null)
const loading = ref(true)
const recentRides = ref([])

// Leaflet map
const mapContainer = ref(null)
let map = null
let markersLayer = null
let pollTimer = null

const MOANDA_CENTER = [-1.5660, 13.2581]

function initMap() {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView(MOANDA_CENTER, 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
  markersLayer = L.layerGroup().addTo(map)
}

async function fetchDriverLocations() {
  try {
    const res = await api.get('/admin/drivers/locations')
    const drivers = res.data.drivers || []
    if (!markersLayer) return
    markersLayer.clearLayers()
    drivers.forEach((d) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#FA6414;border:2px solid #37286B;width:14px;height:14px;border-radius:50%;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([d.current_lat, d.current_lng], { icon })
        .bindPopup(`<strong>${d.name || 'Chauffeur'}</strong>`)
        .addTo(markersLayer)
    })
  } catch (e) {
    console.error('Failed to fetch driver locations', e)
  }
}

onMounted(async () => {
  try {
    const [dashRes, ridesRes] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/rides', { params: { per_page: 5 } }),
    ])
    stats.value = dashRes.data
    recentRides.value = ridesRes.data.data || ridesRes.data.rides || []
  } catch (e) {
    console.error('Dashboard load failed', e)
  } finally {
    loading.value = false
  }

  await nextTick()
  initMap()
  fetchDriverLocations()
  pollTimer = setInterval(fetchDriverLocations, 10_000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (map) { map.remove(); map = null }
})

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR').format(val || 0)
}

const chartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      label: 'Courses',
      data: [3, 5, 4, 8, 6, 12, 9],
      borderColor: '#FA6414',
      backgroundColor: 'rgba(250, 100, 20, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#FA6414',
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    x: { grid: { display: false } },
  },
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight mb-6">Tableau de bord</h1>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border p-5 h-24 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-20 mb-3"></div>
        <div class="h-7 bg-gray-200 rounded w-16"></div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      <StatsCard
        label="Utilisateurs"
        :value="stats?.total_users ?? 0"
        icon="users"
        color="blue"
      />
      <StatsCard
        label="Chauffeurs en ligne"
        :value="stats?.drivers_online ?? 0"
        icon="car"
        color="green"
      />
      <StatsCard
        label="Courses aujourd'hui"
        :value="stats?.rides_today ?? 0"
        icon="route"
        color="yellow"
      />
      <StatsCard
        label="Revenu du jour"
        :value="formatPrice(stats?.revenue_today)"
        icon="money"
        color="purple"
        suffix="XAF"
      />
      <StatsCard
        v-if="stats?.total_formulas != null"
        label="Formules actives"
        :value="stats?.total_formulas ?? 0"
        icon="route"
        color="orange"
      />
    </div>

    <!-- Map: online drivers -->
    <div class="bg-white rounded-2xl border p-6 mb-8">
      <h2 class="text-sm font-semibold text-gray-500 mb-4">Chauffeurs en ligne</h2>
      <div ref="mapContainer" class="h-72 rounded-xl z-0"></div>
    </div>

    <!-- Chart + Recent -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart -->
      <div class="lg:col-span-2 bg-white rounded-2xl border p-6">
        <h2 class="text-sm font-semibold text-gray-500 mb-4">Courses — 7 derniers jours</h2>
        <div class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent rides -->
      <div class="bg-white rounded-2xl border p-6">
        <h2 class="text-sm font-semibold text-gray-500 mb-4">Courses récentes</h2>
        <div v-if="recentRides.length === 0" class="text-sm text-gray-400 text-center py-8">
          Aucune course
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="ride in recentRides.slice(0, 5)"
            :key="ride.id"
            class="flex items-center gap-3 text-sm"
          >
            <span
              :class="[
                'w-2 h-2 rounded-full shrink-0',
                ride.status === 'completed' ? 'bg-emerald-500'
                  : ride.status === 'cancelled' ? 'bg-red-500'
                  : 'bg-amber-500',
              ]"
            />
            <span class="flex-1 truncate text-gray-700">
              {{ ride.pickup_address || 'Départ' }} → {{ ride.dropoff_address || 'Arrivée' }}
            </span>
            <span class="font-semibold whitespace-nowrap">
              {{ formatPrice(ride.price_final || ride.price_estimated) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
