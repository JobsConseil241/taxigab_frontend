<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../services/api'

const period = ref('12w')
const data = ref(null)
const loading = ref(true)

async function fetchData() {
  loading.value = true
  try {
    const res = await api.get('/admin/revenue', { params: { period: period.value } })
    data.value = res.data
  } catch (e) {
    console.error('Revenue load failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
watch(period, fetchData)

const periods = [
  { k: '7d',  l: '7 j' },
  { k: '4w',  l: '4 sem' },
  { k: '12w', l: '12 sem' },
  { k: '1y',  l: '1 an' },
]

function compact(n) {
  n = n || 0
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace('.', ',') + ' M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' k'
  return n.toString()
}
function fmtNum(n) { return new Intl.NumberFormat('fr-FR').format(n || 0) }

const buckets = computed(() => data.value?.buckets || [])
const maxValue = computed(() => Math.max(1, ...buckets.value.map(b => b.value)))
const commissionRate = 0.15

// Donut segments
const donutSegments = computed(() => {
  const methods = (data.value?.payment_methods || []).filter(m => m.value > 0)
  let acc = 0
  return methods.map(m => {
    const start = acc; acc += m.pct
    return { ...m, start, end: acc }
  })
})

const donutPaths = computed(() => {
  return donutSegments.value.map(s => {
    const r = 60, cx = 80, cy = 80
    const a1 = (s.start / 100) * 2 * Math.PI - Math.PI / 2
    const a2 = (s.end / 100) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
    const large = s.pct > 50 ? 1 : 0
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: s.color }
  })
})

const periodLabel = computed(() => ({
  '7d': '7 derniers jours', '4w': '4 dernières semaines',
  '12w': '12 dernières semaines', '1y': '12 derniers mois',
})[period.value])
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight">Revenus</h1>
        <p class="text-brand-muted text-sm mt-1">Période · {{ periodLabel }}</p>
      </div>
      <div class="flex gap-2">
        <button v-for="p in periods" :key="p.k"
          @click="period = p.k"
          :class="['h-10 px-4 rounded-lg text-sm font-bold transition-colors',
            period === p.k ? 'bg-brand-navy text-white' : 'bg-white border border-brand-line text-brand-ink-2 hover:bg-brand-line-2']">
          {{ p.l }}
        </button>
      </div>
    </div>

    <!-- Hero KPI band -->
    <div class="relative overflow-hidden rounded-3xl bg-brand-navy text-white p-7 lg:p-9 mb-6">
      <div class="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-brand-yellow/10 pointer-events-none"/>

      <div class="relative">
        <div class="flex flex-wrap items-center gap-x-12 gap-y-6">
          <div>
            <div class="text-[11px] font-extrabold tracking-[0.14em] text-white/60">REVENU BRUT</div>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="tg-mono text-5xl lg:text-6xl font-extrabold text-brand-yellow tracking-tight">{{ compact(data?.total_revenue) }}</span>
              <span class="text-base font-bold text-white/70">FCFA</span>
            </div>
            <div class="text-sm text-white/70 mt-1.5">{{ periodLabel }}</div>
          </div>
          <div class="w-px h-14 bg-white/15 hidden md:block"/>
          <div>
            <div class="text-[11px] font-extrabold tracking-[0.14em] text-white/60">COMMISSION (15%)</div>
            <div class="tg-mono text-2xl font-extrabold mt-1">{{ compact(data?.commission) }} F</div>
          </div>
          <div class="w-px h-14 bg-white/15 hidden md:block"/>
          <div>
            <div class="text-[11px] font-extrabold tracking-[0.14em] text-white/60">COURSES</div>
            <div class="tg-mono text-2xl font-extrabold mt-1">{{ fmtNum(data?.total_rides) }}</div>
          </div>
          <div class="w-px h-14 bg-white/15 hidden md:block"/>
          <div>
            <div class="text-[11px] font-extrabold tracking-[0.14em] text-white/60">TICKET MOYEN</div>
            <div class="tg-mono text-2xl font-extrabold mt-1">{{ fmtNum(data?.avg_ticket) }} F</div>
          </div>
        </div>

        <!-- Sparkline -->
        <div class="flex items-end gap-1.5 mt-7 h-20 relative">
          <div v-for="(b, i) in buckets" :key="i" class="flex-1 h-full flex items-end">
            <div
              class="w-full rounded-md transition-all"
              :style="`height:${(b.value / maxValue) * 100}%; background:${i === buckets.length - 1 ? '#FFC700' : 'rgba(255,255,255,0.20)'}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-6">
      <!-- Bars: brut + commission -->
      <div class="bg-white rounded-2xl border border-brand-line p-6">
        <div class="flex items-start justify-between mb-5">
          <div>
            <div class="text-base font-extrabold">Revenu par {{ data?.unit === 'jours' ? 'jour' : data?.unit === 'mois' ? 'mois' : 'semaine' }}</div>
            <div class="text-xs text-brand-muted">Brut vs commission TaxiGab</div>
          </div>
          <div class="flex gap-4 text-[11px] text-brand-muted">
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 bg-brand-navy rounded-sm"/>Brut</div>
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 bg-brand-yellow rounded-sm"/>Commission</div>
          </div>
        </div>

        <div v-if="loading" class="h-52 bg-brand-line-2 rounded animate-pulse"/>
        <div v-else-if="!buckets.length" class="text-center py-16 text-sm text-brand-muted">
          Aucune donnée pour cette période
        </div>
        <div v-else>
          <div class="flex items-end gap-2 h-52 pb-1">
            <div v-for="(b, i) in buckets" :key="i" class="flex-1 flex flex-col items-center gap-1.5 group">
              <div class="flex-1 w-full flex items-end gap-0.5 relative">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-brand-navy text-white rounded text-[10px] tg-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {{ compact(b.value) }} F
                </div>
                <div class="flex-[2] rounded-t" :style="`height:${(b.value / maxValue) * 100}%; background:#0A2540;`"/>
                <div class="flex-1 rounded-t" :style="`height:${(b.value * commissionRate / maxValue) * 100}%; background:#FFC700;`"/>
              </div>
              <span class="text-[9px] tg-mono text-brand-muted">{{ b.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Donut: payment methods -->
      <div class="bg-white rounded-2xl border border-brand-line p-6">
        <div class="text-base font-extrabold">Modes de paiement</div>
        <div class="text-xs text-brand-muted">Part du volume total</div>

        <div v-if="loading" class="mt-5 h-40 bg-brand-line-2 rounded-full animate-pulse"/>
        <div v-else-if="!donutSegments.length" class="text-center py-12 text-sm text-brand-muted">
          Aucun paiement enregistré
        </div>
        <div v-else class="flex items-center gap-5 mt-5">
          <svg width="160" height="160" viewBox="0 0 160 160" class="shrink-0">
            <path v-for="(p, i) in donutPaths" :key="i" :d="p.d" :fill="p.color"/>
            <circle cx="80" cy="80" r="40" fill="#fff"/>
            <text x="80" y="74" text-anchor="middle" font-size="10" font-weight="700" fill="#6B7280" letter-spacing="0.1em">TOTAL</text>
            <text x="80" y="92" text-anchor="middle" font-size="13" font-weight="800" font-family="JetBrains Mono" fill="#0A2540">
              {{ compact(data?.total_revenue) }}
            </text>
          </svg>

          <div class="flex-1 space-y-2.5">
            <div v-for="(m, i) in donutSegments" :key="i" class="flex items-center gap-2 text-sm">
              <div class="w-2.5 h-2.5 rounded-sm shrink-0" :style="`background:${m.color}`"/>
              <div class="flex-1 truncate">{{ m.label }}</div>
              <div class="tg-mono font-extrabold">{{ m.pct }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top zones -->
    <div class="bg-white rounded-2xl border border-brand-line p-6">
      <div class="text-base font-extrabold mb-4">Top zones par revenu</div>

      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div v-for="i in 5" :key="`s${i}`" class="h-32 bg-brand-line-2 rounded-xl animate-pulse"/>
      </div>
      <div v-else-if="!data?.top_zones?.length" class="text-center py-10 text-sm text-brand-muted">
        Aucune donnée de zones
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div v-for="(z, i) in data.top_zones" :key="i" class="bg-brand-surface-bg rounded-xl p-4">
          <div class="text-[10px] font-extrabold text-brand-muted tracking-[0.08em] truncate">{{ z.name.toUpperCase() }}</div>
          <div class="tg-mono text-xl font-extrabold mt-1.5">{{ compact(z.value) }}</div>
          <div class="flex justify-between items-center mt-1.5">
            <span class="text-[11px] text-brand-muted">{{ z.share }}% · {{ z.rides }} courses</span>
          </div>
          <div class="h-1 bg-brand-line rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-brand-yellow" :style="`width:${z.share}%`"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
