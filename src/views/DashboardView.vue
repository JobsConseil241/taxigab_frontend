<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import api from '../services/api'

const router = useRouter()
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
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)
  markersLayer = L.layerGroup().addTo(map)
}

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
        <rect x="-4.5" y="-2" width="9" height="4" rx="1" fill="#0A2540"/>
        <text x="0" y="1.2" text-anchor="middle"
              font-family="'Plus Jakarta Sans', sans-serif"
              font-size="3.2" font-weight="800" fill="#FFC700">TAXI</text>
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
      })
      L.marker([d.current_lat, d.current_lng], { icon }).addTo(markersLayer)
    })
  } catch (e) {
    console.error('Failed to fetch driver locations', e)
  }
}

onMounted(async () => {
  try {
    const [dashRes, ridesRes] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/rides', { params: { per_page: 8 } }),
    ])
    stats.value = dashRes.data
    recentRides.value = (ridesRes.data.rides || ridesRes.data.data || []).slice(0, 8)
  } catch (e) {
    console.error('Dashboard load failed', e)
  } finally {
    loading.value = false
  }

  await nextTick()
  initMap()
  fetchDriverLocations()
  pollTimer = setInterval(async () => {
    fetchDriverLocations()
    try {
      const { data } = await api.get('/admin/dashboard')
      stats.value = data
    } catch (_) { /* swallow */ }
  }, 15_000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (map) { map.remove(); map = null }
})

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR').format(val || 0)
}

function compactPrice(val) {
  const n = val || 0
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace('.', ',') + ' M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' k'
  return n.toString()
}

function deltaPct(today, yesterday) {
  if (!yesterday) return today > 0 ? '+100%' : '0%'
  const v = ((today - yesterday) / yesterday) * 100
  return (v >= 0 ? '+' : '') + Math.round(v) + '%'
}

const kpis = computed(() => {
  const s = stats.value || {}
  return [
    {
      label: 'Courses aujourd\'hui',
      v: (s.rides_today ?? 0).toString(),
      d: deltaPct(s.rides_today ?? 0, s.rides_yesterday ?? 0),
      up: (s.rides_today ?? 0) >= (s.rides_yesterday ?? 0),
      sub: `vs hier · ${s.rides_yesterday ?? 0}`,
    },
    {
      label: 'Revenu brut (FCFA)',
      v: compactPrice(s.revenue_today ?? 0),
      d: deltaPct(s.revenue_today ?? 0, s.revenue_yesterday ?? 0),
      up: (s.revenue_today ?? 0) >= (s.revenue_yesterday ?? 0),
      sub: `commission · ${compactPrice(Math.round((s.revenue_today ?? 0) * 0.15))}`,
    },
    {
      label: 'Chauffeurs en ligne',
      v: (s.drivers_online ?? 0).toString(),
      d: `${s.drivers_free ?? 0} libres`,
      up: true,
      sub: `sur ${s.total_drivers ?? 0} inscrits`,
    },
    {
      label: 'Note moyenne',
      v: (s.avg_rating ?? 0).toFixed(2).replace('.', ','),
      d: 'sur 7 j',
      up: true,
      sub: '★ feedback passagers',
    },
  ]
})

const hourly = computed(() => stats.value?.hourly_today ?? Array(24).fill(0))
const hMax = computed(() => Math.max(1, ...hourly.value))

const alerts = computed(() => {
  const raw = stats.value?.alerts || []
  const severities = {
    urgent: { c: 'text-brand-danger', bg: 'bg-brand-danger', tag: 'URGENT' },
    warn:   { c: 'text-brand-yellow-dim', bg: 'bg-brand-yellow-dim', tag: 'À TRAITER' },
    info:   { c: 'text-brand-success', bg: 'bg-brand-success', tag: 'KYC' },
  }
  return raw.filter(a => a.count > 0).map(a => ({ ...a, ...severities[a.severity] }))
})

const todayLabel = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
})

function statusPill(s) {
  return {
    requested: { bg: 'bg-brand-yellow/15', c: 'text-brand-yellow-dim', l: 'EN ATTENTE' },
    accepted:  { bg: 'bg-blue-100', c: 'text-blue-700', l: 'ACCEPTÉE' },
    arriving:  { bg: 'bg-blue-100', c: 'text-blue-700', l: 'EN APPROCHE' },
    in_progress: { bg: 'bg-brand-yellow/15', c: 'text-brand-yellow-dim', l: 'EN COURS' },
    completed: { bg: 'bg-brand-success/10', c: 'text-brand-success', l: 'TERMINÉE' },
    cancelled: { bg: 'bg-brand-danger/10', c: 'text-brand-danger', l: 'ANNULÉE' },
  }[s] || { bg: 'bg-brand-line-2', c: 'text-brand-muted', l: s?.toUpperCase() || '—' }
}

function payDot(method) {
  return method === 'mobile_money' ? '#E40012' : method === 'cash' ? '#0F9B6D' : '#98A2B3'
}
function payLabel(method) {
  return method === 'mobile_money' ? 'Mobile Money' : method === 'cash' ? 'Espèces' : '—'
}

function timeStr(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function goRide(id) { router.push(`/dashboard/rides?id=${id}`) }
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight">Bonjour {{ stats?.admin_name || 'Sandra' }} 👋</h1>
        <p class="text-brand-muted text-sm mt-1 capitalize">Voici ce qui se passe à Moanda · {{ todayLabel }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="h-10 px-4 rounded-lg bg-white border border-brand-line font-bold text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
          </svg>
          Aujourd'hui ▾
        </button>
        <button class="h-10 px-4 rounded-lg bg-brand-navy text-white font-bold text-sm flex items-center gap-2 hover:brightness-110 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
          Exporter
        </button>
      </div>
    </div>

    <!-- KPI grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="(k, i) in kpis" :key="i" class="bg-white rounded-2xl border border-brand-line p-5">
        <div class="text-[11px] font-extrabold tracking-[0.08em] text-brand-muted">{{ k.label.toUpperCase() }}</div>
        <div class="flex items-baseline gap-2 mt-2">
          <div class="tg-mono text-3xl font-extrabold tracking-tight">{{ k.v }}</div>
          <span :class="[
            'text-xs font-extrabold px-2 py-0.5 rounded-md',
            k.up ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger',
          ]">{{ k.d }}</span>
        </div>
        <div class="text-[11px] text-brand-muted mt-1.5">{{ k.sub }}</div>
      </div>
    </div>

    <!-- Map + 24h activity row -->
    <div class="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 mb-6">
      <!-- Live map -->
      <div class="bg-white rounded-2xl border border-brand-line overflow-hidden relative">
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <div class="text-base font-extrabold">Activité en direct · Moanda</div>
            <div class="text-xs text-brand-muted">
              {{ stats?.rides_active ?? 0 }} courses actives · {{ liveDriverCount }} chauffeurs visibles
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 h-7 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center">Courses</span>
            <span class="px-3 h-7 rounded-full bg-brand-line-2 text-brand-ink-2 text-xs font-bold flex items-center">Chauffeurs</span>
          </div>
        </div>
        <div class="relative h-[340px]">
          <div ref="mapContainer" class="absolute inset-0 z-0"></div>
          <div class="absolute top-4 right-4 z-[400] bg-brand-navy/95 backdrop-blur rounded-xl px-3.5 py-3 text-white shadow-lg">
            <div class="text-[10px] font-extrabold tracking-[0.1em] text-white/60">QUARTIER CHAUD</div>
            <div class="text-base font-extrabold mt-0.5">Centre-ville</div>
            <div class="text-[11px] text-white/70 mt-0.5">
              {{ stats?.rides_waiting ?? 0 }} demandes / {{ stats?.drivers_free ?? 0 }} libres ·
              <span class="text-brand-yellow font-bold">surge actif</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 24h activity -->
      <div class="bg-white rounded-2xl border border-brand-line p-5">
        <div class="text-base font-extrabold">Activité sur 24h</div>
        <div class="text-xs text-brand-muted">Courses par heure · aujourd'hui</div>
        <div class="flex items-end gap-1 mt-5 h-44">
          <div v-for="(h, i) in hourly" :key="i" class="flex-1 flex flex-col items-center gap-1">
            <div class="flex-1 w-full flex items-end">
              <div
                class="w-full rounded-sm transition-all"
                :style="`height:${(h / hMax) * 100}%; background:${h > hMax * 0.7 ? '#FFC700' : '#0A2540'}; opacity:${h > hMax * 0.7 ? 1 : 0.7};`"
              />
            </div>
            <span v-if="i % 4 === 0" class="text-[9px] tg-mono text-brand-muted">{{ String(i).padStart(2, '0') }}h</span>
          </div>
        </div>
        <div class="flex gap-4 mt-3 text-[11px] text-brand-muted">
          <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 bg-brand-navy rounded-sm"/>Heures creuses</div>
          <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 bg-brand-yellow rounded-sm"/>Heures de pointe</div>
        </div>
        <div class="mt-4 pt-3 border-t border-brand-line space-y-2.5 text-sm">
          <div class="flex justify-between"><span class="text-brand-muted">Temps d'attente moyen</span><span class="tg-mono font-extrabold">{{ stats?.avg_wait_minutes ?? 0 }} min</span></div>
          <div class="flex justify-between"><span class="text-brand-muted">Tarif moyen de course</span><span class="tg-mono font-extrabold">{{ formatPrice(stats?.avg_fare) }} F</span></div>
          <div class="flex justify-between"><span class="text-brand-muted">Annulations</span><span class="tg-mono font-extrabold">{{ stats?.cancellation_rate ?? 0 }}%</span></div>
        </div>
      </div>
    </div>

    <!-- Recent rides + alerts -->
    <div class="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
      <!-- Recent rides table -->
      <div class="bg-white rounded-2xl border border-brand-line overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <div class="text-base font-extrabold">Dernières courses</div>
            <div class="text-xs text-brand-muted">Mises à jour en temps réel</div>
          </div>
          <router-link to="/dashboard/rides" class="text-xs font-bold text-brand-navy hover:underline">
            Tout voir →
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-brand-surface-bg">
                <th v-for="h in ['ID','Client','Chauffeur','Trajet','Montant','Paiement','Statut','Heure']" :key="h"
                    class="text-left px-4 py-2.5 text-[11px] font-extrabold text-brand-muted tracking-[0.06em]">{{ h.toUpperCase() }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" v-for="i in 5" :key="`l${i}`" class="border-t border-brand-line">
                <td colspan="8" class="px-4 py-3"><div class="h-4 bg-brand-line-2 rounded animate-pulse"/></td>
              </tr>
              <tr v-else-if="recentRides.length === 0" class="border-t border-brand-line">
                <td colspan="8" class="px-4 py-10 text-center text-brand-muted text-sm">Aucune course récente</td>
              </tr>
              <tr v-else v-for="r in recentRides" :key="r.id"
                  class="border-t border-brand-line hover:bg-brand-surface-bg/60 cursor-pointer transition-colors"
                  @click="goRide(r.id)">
                <td class="px-4 py-3 tg-mono font-bold text-brand-navy">TG-{{ String(r.id).padStart(4, '0') }}</td>
                <td class="px-4 py-3 truncate max-w-[100px]">{{ r.passenger?.name || '—' }}</td>
                <td class="px-4 py-3 truncate max-w-[120px]">{{ r.driver?.name || '—' }}</td>
                <td class="px-4 py-3 text-brand-muted truncate max-w-[200px]">
                  {{ r.pickup_address || '—' }}
                  <span class="px-1">→</span>
                  <b class="text-brand-ink">{{ r.dropoff_address || '—' }}</b>
                </td>
                <td class="px-4 py-3 tg-mono font-extrabold whitespace-nowrap">
                  {{ r.price_final ? `${formatPrice(r.price_final)} F` : '—' }}
                </td>
                <td class="px-4 py-3">
                  <span v-if="r.payment_method" class="inline-flex items-center gap-1.5 text-xs">
                    <span class="w-2 h-2 rounded-full" :style="`background:${payDot(r.payment_method)}`"/>
                    {{ payLabel(r.payment_method) }}
                  </span>
                  <span v-else class="text-brand-muted">—</span>
                </td>
                <td class="px-4 py-3">
                  <span :class="['px-2.5 py-1 rounded-full text-[10px] font-extrabold', statusPill(r.status).bg, statusPill(r.status).c]">
                    {{ statusPill(r.status).l }}
                  </span>
                </td>
                <td class="px-4 py-3 tg-mono text-brand-muted">{{ timeStr(r.requested_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alerts panel -->
      <div class="bg-white rounded-2xl border border-brand-line p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="text-base font-extrabold">Alertes</div>
          <span class="tg-mono text-[11px] text-brand-muted">{{ alerts.length }} actives</span>
        </div>
        <div v-if="alerts.length === 0" class="text-center py-10">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-success/10 mb-3">
            <svg class="w-6 h-6 text-brand-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <p class="text-sm font-bold">Tout est sous contrôle</p>
          <p class="text-xs text-brand-muted mt-1">Aucune alerte active</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="(a, i) in alerts" :key="i" class="flex gap-3 pb-3 border-b border-brand-line last:border-0 last:pb-0">
            <div :class="['w-1 rounded-full self-stretch shrink-0', a.bg]"/>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <div :class="['text-[10px] font-extrabold tracking-[0.08em]', a.c]">{{ a.tag }}</div>
                <span class="tg-mono text-[11px] font-extrabold ml-auto">{{ a.count }}</span>
              </div>
              <div class="text-sm font-extrabold">{{ a.title }}</div>
              <div class="text-xs text-brand-muted">{{ a.sub }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
