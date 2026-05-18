<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import api from '../services/api'

const rides = ref([])
const drivers = ref([])
const loading = ref(true)
const filter = ref('all')
const search = ref('')

const mapContainer = ref(null)
let map = null
let driverLayer = null
let rideLayer = null
let poll = null

const MOANDA_CENTER = [-1.5660, 13.2581]

function initMap() {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value, { zoomControl: false }).setView(MOANDA_CENTER, 13)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap', maxZoom: 19,
  }).addTo(map)
  driverLayer = L.layerGroup().addTo(map)
  rideLayer = L.layerGroup().addTo(map)
}

function carIconHtml(headingDeg = 0) {
  return `
    <div style="position:relative; width:42px; height:54px; display:flex; align-items:center; justify-content:center;">
      <span style="position:absolute; inset:0; margin:auto; width:42px; height:42px; border-radius:50%; background:rgba(255,199,0,.22); animation:tg-cab-pulse 2s ease-in-out infinite;"></span>
      <svg viewBox="-13 -17 26 34" width="30" height="40"
           style="transform: rotate(${headingDeg}deg); position:relative; z-index:1;" xmlns="http://www.w3.org/2000/svg">
        <rect x="-9" y="-14" width="18" height="28" rx="5" fill="#FFC700" stroke="#0A2540" stroke-width="1.2"/>
        <path d="M-7 -10 L7 -10 L6 -4 L-6 -4 Z" fill="#0A2540" opacity="0.82"/>
        <path d="M-6 4 L6 4 L7 10 L-7 10 Z" fill="#0A2540" opacity="0.82"/>
        <rect x="-4.5" y="-2" width="9" height="4" rx="1" fill="#0A2540"/>
        <text x="0" y="1.2" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="3.2" font-weight="800" fill="#FFC700">TAXI</text>
      </svg>
    </div>
  `
}

function pinIconHtml(color, label) {
  return `
    <div style="display:flex; flex-direction:column; align-items:center;">
      <div style="background:${color}; color:#fff; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:800; font-family:'JetBrains Mono', monospace; box-shadow:0 4px 12px rgba(0,0,0,.18); white-space:nowrap;">${label}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};margin-top:-1px;"></div>
    </div>
  `
}

async function fetchAll() {
  try {
    const [rRes, dRes] = await Promise.all([
      api.get('/admin/rides'),
      api.get('/admin/drivers/locations'),
    ])
    rides.value = rRes.data.rides || rRes.data.data || []
    drivers.value = dRes.data.drivers || []
    drawDrivers()
    drawRidePins()
  } catch (e) {
    console.error('Live rides load failed', e)
  } finally {
    loading.value = false
  }
}

function drawDrivers() {
  if (!driverLayer) return
  driverLayer.clearLayers()
  drivers.value.forEach((d) => {
    const icon = L.divIcon({ className: 'tg-cab-marker', html: carIconHtml(d.heading ?? 0), iconSize: [42, 54], iconAnchor: [21, 27] })
    L.marker([d.current_lat, d.current_lng], { icon }).addTo(driverLayer)
  })
}

function drawRidePins() {
  if (!rideLayer) return
  rideLayer.clearLayers()
  const active = rides.value.filter(r => ['accepted','arriving','in_progress'].includes(r.status)).slice(0, 6)
  active.forEach((r) => {
    if (!r.driver) return
    // Pin near pickup (rough since we don't have pickup_lat in admin payload)
    const lat = MOANDA_CENTER[0] + (Math.random() - 0.5) * 0.02
    const lng = MOANDA_CENTER[1] + (Math.random() - 0.5) * 0.02
    const fare = r.price_final ? r.price_final.toLocaleString('fr-FR') + ' F' : '—'
    const icon = L.divIcon({
      className: 'tg-ride-pin',
      html: pinIconHtml('#0A2540', `TG-${String(r.id).padStart(4,'0')} · ${fare}`),
      iconAnchor: [70, 32],
    })
    L.marker([lat, lng], { icon }).addTo(rideLayer)
  })
}

onMounted(async () => {
  await nextTick()
  initMap()
  await fetchAll()
  poll = setInterval(fetchAll, 12_000)
})

onUnmounted(() => {
  if (poll) clearInterval(poll)
  if (map) { map.remove(); map = null }
})

const activeRides = computed(() =>
  rides.value.filter(r => ['accepted','arriving','in_progress','requested'].includes(r.status))
)
const filteredRides = computed(() => {
  let list = activeRides.value
  if (filter.value === 'in_progress') list = list.filter(r => r.status === 'in_progress' || r.status === 'arriving' || r.status === 'accepted')
  if (filter.value === 'waiting') list = list.filter(r => r.status === 'requested')
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(r =>
      String(r.id).includes(q) ||
      (r.passenger?.name || '').toLowerCase().includes(q) ||
      (r.driver?.name || '').toLowerCase().includes(q),
    )
  }
  return list.slice(0, 50)
})

const counts = computed(() => ({
  active: activeRides.value.filter(r => r.status !== 'requested').length,
  waiting: activeRides.value.filter(r => r.status === 'requested').length,
  free: drivers.value.length,
}))

function stateBadge(s) {
  if (s === 'requested') return { bg: '#FFE9B0', c: '#A77100', l: 'RECHERCHE CHAUFFEUR' }
  if (s === 'accepted' || s === 'arriving') return { bg: '#E0EFFF', c: '#0058B5', l: 'EN ROUTE VERS PASSAGER' }
  if (s === 'in_progress') return { bg: 'rgba(15,155,109,0.15)', c: '#0F9B6D', l: 'EN COURSE' }
  return { bg: '#F0F2F6', c: '#6B7280', l: s?.toUpperCase() || '—' }
}

function fmtETA(r) {
  if (!r.accepted_at) return '—'
  const d = Math.round((Date.now() - new Date(r.accepted_at).getTime()) / 60_000)
  return d <= 0 ? "à l'instant" : `${d} min`
}
function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('') || '?'
}
function fmtPrice(v) {
  return v ? new Intl.NumberFormat('fr-FR').format(v) + ' F' : '—'
}
</script>

<template>
  <div class="flex flex-col xl:flex-row gap-4 h-[calc(100vh-9rem)] min-h-[640px]">
    <!-- Map -->
    <div class="flex-1 bg-white rounded-2xl border border-brand-line overflow-hidden relative min-h-[400px]">
      <!-- Floating stats -->
      <div class="absolute top-4 left-4 right-4 z-[400] flex flex-wrap gap-3">
        <div class="bg-brand-navy/95 backdrop-blur rounded-xl px-4 py-3 text-white flex items-center gap-4 shadow-lg">
          <div>
            <div class="text-[10px] font-extrabold tracking-[0.1em] text-white/60">EN COURS</div>
            <div class="tg-mono text-xl font-extrabold">{{ counts.active }}</div>
          </div>
          <div class="w-px h-7 bg-white/15"/>
          <div>
            <div class="text-[10px] font-extrabold tracking-[0.1em] text-white/60">EN ATTENTE</div>
            <div class="tg-mono text-xl font-extrabold text-brand-yellow">{{ counts.waiting }}</div>
          </div>
          <div class="w-px h-7 bg-white/15"/>
          <div>
            <div class="text-[10px] font-extrabold tracking-[0.1em] text-white/60">CHAUFFEURS LIBRES</div>
            <div class="tg-mono text-xl font-extrabold">{{ counts.free }}</div>
          </div>
        </div>

        <div class="ml-auto bg-white rounded-xl p-1 flex gap-1 shadow-sm">
          <button v-for="f in [
              {k:'all', l:'Toutes'},
              {k:'in_progress', l:'En course'},
              {k:'waiting', l:'En attente'},
            ]" :key="f.k"
            :class="['h-8 px-3 rounded-lg text-xs font-bold transition-colors',
              filter === f.k ? 'bg-brand-navy text-white' : 'text-brand-ink-2 hover:bg-brand-line-2']"
            @click="filter = f.k">{{ f.l }}</button>
        </div>
      </div>

      <div ref="mapContainer" class="absolute inset-0 z-0"/>
    </div>

    <!-- Side panel -->
    <aside class="xl:w-[380px] flex flex-col bg-white rounded-2xl border border-brand-line overflow-hidden">
      <div class="px-5 py-4 border-b border-brand-line">
        <div class="text-base font-extrabold">Courses actives · {{ counts.active + counts.waiting }}</div>
        <div class="text-xs text-brand-muted">Cliquez pour suivre sur la carte</div>
        <div class="mt-3 flex gap-2">
          <div class="flex-1 h-9 bg-brand-surface-bg rounded-lg flex items-center px-3 gap-2">
            <svg class="w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input v-model="search" placeholder="ID, client, chauffeur…" class="flex-1 bg-transparent outline-none text-xs"/>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" v-for="i in 6" :key="`s${i}`" class="px-5 py-4 border-b border-brand-line">
          <div class="h-3 bg-brand-line-2 rounded w-20 mb-2 animate-pulse"/>
          <div class="h-4 bg-brand-line-2 rounded w-full mb-2 animate-pulse"/>
          <div class="h-3 bg-brand-line-2 rounded w-32 animate-pulse"/>
        </div>
        <div v-else-if="filteredRides.length === 0" class="flex flex-col items-center text-center py-16 px-6">
          <div class="w-14 h-14 rounded-2xl bg-brand-line-2 flex items-center justify-center mb-3">
            <svg class="w-7 h-7 text-brand-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5"/>
            </svg>
          </div>
          <div class="text-sm font-bold">Aucune course active</div>
          <div class="text-xs text-brand-muted mt-1">Les nouvelles courses apparaîtront ici en temps réel.</div>
        </div>
        <div v-else>
          <div v-for="(r, i) in filteredRides" :key="r.id"
               :class="['px-5 py-4 border-b border-brand-line cursor-pointer hover:bg-brand-surface-bg/60 transition-colors', i === 0 ? 'bg-brand-yellow/5' : '']">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="tg-mono font-extrabold text-xs text-brand-navy">TG-{{ String(r.id).padStart(4, '0') }}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-[0.04em]"
                    :style="`background:${stateBadge(r.status).bg}; color:${stateBadge(r.status).c}`">
                {{ stateBadge(r.status).l }}
              </span>
              <span class="ml-auto text-[11px] text-brand-muted tg-mono">{{ fmtETA(r) }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-navy font-extrabold text-[11px]">
                {{ initials(r.driver?.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold truncate">{{ r.driver?.name || 'En recherche…' }}</div>
                <div class="text-[11px] text-brand-muted tg-mono truncate">client {{ r.passenger?.name || '—' }}</div>
              </div>
              <div class="text-right">
                <div class="tg-mono font-extrabold text-sm whitespace-nowrap">{{ fmtPrice(r.price_final || r.price_estimated) }}</div>
                <div class="text-[10px] text-brand-muted capitalize">{{ r.payment_method || '—' }}</div>
              </div>
            </div>
            <div class="mt-2 text-xs text-brand-muted truncate">
              <span class="text-brand-ink">{{ r.pickup_address || '—' }}</span> →
              <span class="text-brand-ink font-bold">{{ r.dropoff_address || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
