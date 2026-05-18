<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
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
import StatusBadge from '../components/StatusBadge.vue'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const stats = ref(null)
const loading = ref(true)
const recentRides = ref([])

// Leaflet map
const mapContainer = ref(null)
let map = null
let markersLayer = null
let pollTimer = null
const liveDriverCount = ref(0)

const MOANDA_CENTER = [-1.5660, 13.2581]

function initMap() {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value, { zoomControl: false }).setView(MOANDA_CENTER, 14)
  L.control.zoom({ position: 'topright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
  markersLayer = L.layerGroup().addTo(map)
}

// Top-down taxi silhouette — mirrors the MoandaMap TopDownCar painter.
// Yellow body, navy windows + wheels, "TAXI" roof sign, white headlights.
function carIconHtml(headingDeg = 0) {
  return `
    <div style="position:relative; width:48px; height:60px; display:flex; align-items:center; justify-content:center;">
      <span style="position:absolute; inset:0; margin:auto; width:48px; height:48px; border-radius:50%; background:rgba(255,199,0,.22); animation:tg-cab-pulse 2s ease-in-out infinite;"></span>
      <svg viewBox="-13 -17 26 34" width="34" height="44"
           style="transform: rotate(${headingDeg}deg); transform-origin: 50% 50%; position:relative; z-index:1;"
           xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="1" cy="2" rx="11" ry="16" fill="#0A2540" opacity="0.22"/>
        <rect x="-9" y="-14" width="18" height="28" rx="5" fill="#FFC700" stroke="#0A2540" stroke-width="1.2"/>
        <line x1="-9" y1="-6" x2="9" y2="-6" stroke="#0A2540" stroke-width="0.6" opacity="0.35"/>
        <path d="M-7 -10 L7 -10 L6 -4 L-6 -4 Z" fill="#0A2540" opacity="0.82"/>
        <path d="M-6 4 L6 4 L7 10 L-7 10 Z" fill="#0A2540" opacity="0.82"/>
        <rect x="-5" y="-3" width="10" height="6" rx="1.5" fill="#FFC700" stroke="#0A2540" stroke-width="0.5"/>
        <rect x="-10.5" y="-9" width="3" height="5" rx="1" fill="#0A2540"/>
        <rect x="7.5" y="-9" width="3" height="5" rx="1" fill="#0A2540"/>
        <rect x="-10.5" y="4" width="3" height="5" rx="1" fill="#0A2540"/>
        <rect x="7.5" y="4" width="3" height="5" rx="1" fill="#0A2540"/>
        <rect x="-7" y="-14" width="3" height="1.5" rx="0.5" fill="#FFF7C2"/>
        <rect x="4"  y="-14" width="3" height="1.5" rx="0.5" fill="#FFF7C2"/>
        <rect x="-7" y="12.5" width="3" height="1.5" rx="0.5" fill="#E04A3C"/>
        <rect x="4"  y="12.5" width="3" height="1.5" rx="0.5" fill="#E04A3C"/>
        <rect x="-4.5" y="-2" width="9" height="4" rx="1" fill="#0A2540"/>
        <text x="0" y="1.2" text-anchor="middle"
              font-family="'Plus Jakarta Sans', sans-serif"
              font-size="3.2" font-weight="800" fill="#FFC700"
              letter-spacing="0.3">TAXI</text>
      </svg>
    </div>
  `
}

async function fetchDriverLocations() {
  try {
    const res = await api.get('/admin/drivers/locations')
    const drivers = res.data.drivers || []
    liveDriverCount.value = drivers.length
    if (!markersLayer) return
    markersLayer.clearLayers()
    drivers.forEach((d) => {
      const heading = Number(d.heading ?? d.current_heading ?? 0)
      const icon = L.divIcon({
        className: 'tg-cab-marker',
        html: carIconHtml(heading),
        iconSize: [48, 60],
        iconAnchor: [24, 30],
        popupAnchor: [0, -28],
      })
      L.marker([d.current_lat, d.current_lng], { icon })
        .bindPopup(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;">
            <strong style="font-size:14px;color:#0A2540;">${d.name || 'Chauffeur'}</strong>
            ${d.plate_number ? `<br><span style="font-family:'JetBrains Mono',monospace;font-size:11px;background:#FFC700;color:#0A2540;padding:2px 6px;border-radius:4px;margin-top:4px;display:inline-block;font-weight:800;">${d.plate_number}</span>` : ''}
          </div>`,
        )
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

// 7-day mini-bars demo data (until backend exposes it).
const weeklyBars = [18, 22, 31, 25, 35, 42, 23]
const weeklyDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const todayIdx = computed(() => new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
const maxBar = Math.max(...weeklyBars)

const chartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      label: 'Courses',
      data: [3, 5, 4, 8, 6, 12, 9],
      borderColor: '#FFC700',
      backgroundColor: 'rgba(255, 199, 0, 0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#0A2540',
      pointBorderColor: '#FFC700',
      pointBorderWidth: 2,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0A2540',
      titleColor: '#FFC700',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 12,
      displayColors: false,
    },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#F0F2F6' }, ticks: { color: '#6B7280' } },
    x: { grid: { display: false }, ticks: { color: '#6B7280' } },
  },
}

// Today date for hero card label
const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).toUpperCase(),
)
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <p class="text-[11px] font-extrabold tracking-[0.12em] text-brand-muted mb-1">TABLEAU DE BORD</p>
        <h1 class="text-3xl font-extrabold tracking-tight">Activité du jour</h1>
        <p class="text-brand-muted text-sm mt-1">
          Moanda · Mounana · Bakoumba
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-white border border-brand-line text-xs font-bold text-brand-ink-2">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
          Synchro live · 10s
        </span>
      </div>
    </div>

    <!-- HERO: Revenue + 7-day bars (mobile earnings style) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <!-- Hero (2 cols) -->
      <div
        class="lg:col-span-2 relative overflow-hidden rounded-3xl bg-brand-navy text-white p-6 lg:p-8"
      >
        <!-- Decorative circle -->
        <div class="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-brand-yellow/10 pointer-events-none" />
        <div class="absolute -bottom-6 right-12 w-24 h-24 rounded-full bg-brand-yellow/5 pointer-events-none" />

        <div class="relative flex flex-col h-full">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[11px] font-extrabold tracking-[0.14em] text-white/55">
                REVENU · {{ todayLabel }}
              </p>
              <div v-if="loading" class="h-12 w-48 mt-2 bg-white/10 rounded animate-pulse"></div>
              <div v-else class="flex items-baseline gap-2 mt-2">
                <span class="tg-mono text-5xl lg:text-6xl font-extrabold text-brand-yellow tracking-tight">
                  {{ formatPrice(stats?.revenue_today) }}
                </span>
                <span class="text-white/70 font-bold text-lg">FCFA</span>
              </div>
              <p class="text-sm text-white/60 mt-2">
                <span class="text-brand-yellow font-bold tg-mono">+12%</span>
                vs hier · <span class="tg-mono font-bold">{{ stats?.rides_today ?? '—' }}</span> courses
              </p>
            </div>
            <div class="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-yellow text-brand-navy">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
              </svg>
            </div>
          </div>

          <!-- 7-day bars -->
          <div class="mt-6 flex items-end gap-2 h-24">
            <div v-for="(v, i) in weeklyBars" :key="i" class="flex-1 flex flex-col items-center gap-2">
              <div class="flex-1 w-full flex items-end">
                <div
                  class="w-full rounded-md transition-all"
                  :style="`height:${(v / maxBar) * 100}%; background:${i === todayIdx ? '#FFC700' : 'rgba(255,255,255,0.28)'}`"
                />
              </div>
              <span
                :class="[
                  'text-[10px] font-bold',
                  i === todayIdx ? 'text-brand-yellow' : 'text-white/40',
                ]"
              >{{ weeklyDays[i] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Live drivers chip card -->
      <div class="relative rounded-3xl bg-brand-yellow text-brand-navy p-6 overflow-hidden">
        <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-navy/10 pointer-events-none" />
        <div class="relative">
          <p class="text-[11px] font-extrabold tracking-[0.14em] opacity-70">CHAUFFEURS EN LIGNE</p>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="tg-mono text-6xl font-extrabold tracking-tight">{{ liveDriverCount }}</span>
            <span class="text-sm font-bold opacity-70">/ {{ stats?.drivers_total ?? '—' }}</span>
          </div>
          <p class="text-sm font-semibold opacity-70 mt-2">disponibles à Moanda</p>
          <router-link
            to="/dashboard/vehicles"
            class="mt-5 inline-flex items-center gap-1 px-4 h-9 rounded-full bg-brand-navy text-white text-xs font-extrabold hover:brightness-110 transition"
          >
            Voir la flotte
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mini KPI strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-if="loading" v-for="i in 4" :key="`s${i}`" class="bg-white rounded-2xl tg-shadow-sm p-4 h-20 animate-pulse">
        <div class="h-3 bg-brand-line rounded w-20 mb-2"></div>
        <div class="h-6 bg-brand-line rounded w-12"></div>
      </div>
      <template v-else>
        <div class="bg-white rounded-2xl tg-shadow-sm p-4">
          <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">UTILISATEURS</p>
          <p class="tg-mono text-2xl font-extrabold mt-1">{{ stats?.total_users ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-2xl tg-shadow-sm p-4">
          <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">CHAUFFEURS APPROUVÉS</p>
          <p class="tg-mono text-2xl font-extrabold mt-1">{{ stats?.drivers_total ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-2xl tg-shadow-sm p-4">
          <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">EN ATTENTE</p>
          <p class="tg-mono text-2xl font-extrabold mt-1 text-brand-yellow-dim">{{ stats?.drivers_pending ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-2xl tg-shadow-sm p-4">
          <p class="text-[10px] font-extrabold tracking-[0.1em] text-brand-muted">FORMULES ACTIVES</p>
          <p class="tg-mono text-2xl font-extrabold mt-1">{{ stats?.total_formulas ?? 0 }}</p>
        </div>
      </template>
    </div>

    <!-- Map: online drivers (navy header band) -->
    <div class="bg-white rounded-3xl tg-shadow-sm overflow-hidden mb-6">
      <div class="flex items-center justify-between bg-brand-navy px-6 py-4">
        <div>
          <p class="text-[11px] font-extrabold tracking-[0.12em] text-white/60">CARTE TEMPS RÉEL</p>
          <h2 class="text-base font-extrabold text-white">Chauffeurs en ligne</h2>
        </div>
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow text-brand-navy text-xs font-extrabold">
          <span class="w-2 h-2 rounded-full bg-brand-navy animate-pulse" />
          LIVE · POLL 10s
        </span>
      </div>
      <div ref="mapContainer" class="h-80 z-0"></div>
    </div>

    <!-- Chart + Recent + Hotspot -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart -->
      <div class="lg:col-span-2 bg-white rounded-3xl tg-shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.12em] text-brand-muted">7 DERNIERS JOURS</p>
            <h2 class="text-lg font-extrabold">Courses</h2>
          </div>
          <div class="hidden sm:flex items-center gap-1 bg-brand-line-2 rounded-full p-1">
            <button class="px-3 h-7 rounded-full text-xs font-extrabold bg-brand-navy text-white">7 j</button>
            <button class="px-3 h-7 rounded-full text-xs font-bold text-brand-muted hover:text-brand-ink">30 j</button>
            <button class="px-3 h-7 rounded-full text-xs font-bold text-brand-muted hover:text-brand-ink">90 j</button>
          </div>
        </div>
        <div class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Hotspot card (driver-style nudge) -->
      <div class="bg-brand-navy text-white rounded-3xl tg-shadow-sm p-6 flex flex-col">
        <p class="text-[11px] font-extrabold tracking-[0.12em] text-white/55">ZONE CHAUDE</p>
        <h2 class="text-lg font-extrabold mt-1">Demande Mounana</h2>

        <div class="flex items-center gap-3 mt-4 p-3 rounded-2xl bg-white/5">
          <div class="w-10 h-10 rounded-xl bg-brand-yellow flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold">+50% sur les tarifs</p>
            <p class="text-xs text-white/60">12 min de route · pic actuel</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">PIC HORAIRE</p>
            <p class="tg-mono font-extrabold mt-1">18 — 20 h</p>
          </div>
          <div>
            <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">COURSES / H</p>
            <p class="tg-mono font-extrabold mt-1">12</p>
          </div>
        </div>

        <router-link
          to="/dashboard/formulas"
          class="mt-auto pt-5 self-start inline-flex items-center gap-1 text-xs font-bold text-brand-yellow hover:underline"
        >
          Ajuster les tarifs
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Recent rides — full width -->
    <div class="bg-white rounded-3xl tg-shadow-sm p-6 mt-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-[11px] font-extrabold tracking-[0.12em] text-brand-muted">RÉCENT</p>
          <h2 class="text-lg font-extrabold">Courses</h2>
        </div>
        <router-link
          to="/dashboard/rides"
          class="text-xs font-bold text-brand-navy hover:text-brand-yellow-dim"
        >
          Tout voir →
        </router-link>
      </div>

      <div v-if="loading">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3 py-3 border-t border-brand-line first:border-t-0 animate-pulse">
          <div class="w-20 h-5 rounded-full bg-brand-line"></div>
          <div class="flex-1 h-4 bg-brand-line rounded"></div>
          <div class="w-16 h-4 bg-brand-line rounded"></div>
        </div>
      </div>
      <div
        v-else-if="recentRides.length === 0"
        class="text-center py-10"
      >
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-line-2 mb-3">
          <svg class="w-7 h-7 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5" />
          </svg>
        </div>
        <p class="text-sm font-bold text-brand-ink">Aucune course pour le moment</p>
        <p class="text-xs text-brand-muted mt-1">Les nouvelles réservations apparaîtront ici en temps réel.</p>
      </div>
      <ul v-else class="divide-y divide-brand-line">
        <li
          v-for="ride in recentRides.slice(0, 5)"
          :key="ride.id"
          class="flex items-center gap-3 text-sm py-3 first:pt-0 last:pb-0 hover:bg-brand-line-2/40 -mx-2 px-2 rounded-xl transition-colors"
        >
          <StatusBadge :status="ride.status" class="shrink-0" />
          <span class="flex-1 truncate text-brand-ink-2">
            <span class="font-semibold">{{ ride.pickup_address || 'Départ' }}</span>
            <span class="text-brand-muted px-1.5">→</span>
            <span class="font-semibold">{{ ride.dropoff_address || 'Arrivée' }}</span>
          </span>
          <span class="tg-mono font-extrabold whitespace-nowrap text-brand-navy">
            {{ formatPrice(ride.price_final || ride.price_estimated) }}
            <span class="text-[10px] text-brand-muted ml-0.5">F</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
