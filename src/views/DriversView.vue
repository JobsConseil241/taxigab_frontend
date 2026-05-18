<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import SideDrawer from '../components/SideDrawer.vue'

const drivers = ref([])
const loading = ref(true)
const pendingApprove = ref(null) // driver being approved
const approving = ref(false)
const selectedDriver = ref(null) // driver in drawer

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR').format(val || 0)
}

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

function askApprove(driver) {
  pendingApprove.value = driver
}

async function confirmApprove() {
  if (!pendingApprove.value) return
  approving.value = true
  try {
    await api.patch(`/admin/drivers/${pendingApprove.value.id}/approve`)
    await fetchDrivers()
    pendingApprove.value = null
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  } finally {
    approving.value = false
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
        class="bg-white rounded-3xl tg-shadow-sm p-5 hover:tg-shadow-md transition-shadow cursor-pointer"
        @click="selectedDriver = driver"
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
          @click.stop="askApprove(driver)"
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

    <ConfirmDialog
      :open="!!pendingApprove"
      title="Approuver ce chauffeur ?"
      :message="pendingApprove ? `${pendingApprove.user?.name || 'Le chauffeur'} pourra recevoir des courses immédiatement.` : ''"
      confirm-label="Approuver"
      :loading="approving"
      @cancel="pendingApprove = null"
      @confirm="confirmApprove"
    />

    <!-- Driver detail drawer -->
    <SideDrawer
      :open="!!selectedDriver"
      :title="selectedDriver?.user?.name || 'Chauffeur'"
      subtitle="FICHE CHAUFFEUR"
      width="max-w-md"
      @close="selectedDriver = null"
    >
      <template v-if="selectedDriver">
        <!-- Banner -->
        <div class="relative bg-brand-navy text-white p-6 overflow-hidden">
          <div class="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-yellow/10 pointer-events-none" />
          <div class="relative flex items-center gap-4">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl shrink-0',
                selectedDriver.is_online
                  ? 'bg-brand-yellow text-brand-navy ring-2 ring-brand-success'
                  : 'bg-brand-line-2 text-brand-navy',
              ]"
            >
              {{ selectedDriver.user?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-extrabold tracking-[0.12em] text-white/55">
                #{{ selectedDriver.id }} · {{ selectedDriver.license_number || 'NO LICENSE' }}
              </p>
              <h3 class="text-2xl font-extrabold truncate">{{ selectedDriver.user?.name }}</h3>
              <p class="text-sm text-white/70 tg-mono truncate">
                {{ selectedDriver.user?.phone || '—' }}
              </p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-3 gap-3">
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">NOTE</p>
              <p class="tg-mono text-xl font-extrabold mt-1">
                {{ Number(selectedDriver.rating_avg || 0).toFixed(1) }}
                <span class="text-brand-yellow text-sm">★</span>
              </p>
            </div>
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">COURSES</p>
              <p class="tg-mono text-xl font-extrabold mt-1">{{ selectedDriver.total_rides || 0 }}</p>
            </div>
            <div>
              <p class="text-[10px] font-extrabold tracking-[0.1em] text-white/50">STATUT</p>
              <p class="text-xs font-extrabold mt-1 flex items-center gap-1.5">
                <span
                  :class="[
                    'w-2 h-2 rounded-full',
                    selectedDriver.is_online ? 'bg-brand-success animate-pulse' : 'bg-white/30',
                  ]"
                />
                {{ selectedDriver.is_online ? 'EN LIGNE' : 'HORS LIGNE' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Approval section -->
          <div v-if="selectedDriver.status === 'pending'">
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">APPROBATION</p>
            <div class="bg-brand-yellow/30 rounded-2xl p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-brand-navy shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm font-bold text-brand-navy">En attente d'approbation</p>
            </div>
          </div>
          <div v-else>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">STATUT COMPTE</p>
            <StatusBadge :status="selectedDriver.status" />
          </div>

          <!-- Vehicle -->
          <div v-if="selectedDriver.active_vehicle || selectedDriver.vehicles?.[0]">
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">VÉHICULE ACTIF</p>
            <div class="bg-brand-surface-bg rounded-2xl p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-brand-navy shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="font-bold truncate">
                  {{ (selectedDriver.active_vehicle || selectedDriver.vehicles[0]).brand }}
                  {{ (selectedDriver.active_vehicle || selectedDriver.vehicles[0]).model }}
                </p>
                <p class="text-xs text-brand-muted">
                  {{ (selectedDriver.active_vehicle || selectedDriver.vehicles[0]).color }}
                </p>
              </div>
              <span class="tg-mono font-extrabold text-brand-navy bg-brand-yellow px-2 py-1 rounded border-2 border-brand-navy">
                {{ (selectedDriver.active_vehicle || selectedDriver.vehicles[0]).plate_number }}
              </span>
            </div>
          </div>

          <!-- Location -->
          <div v-if="selectedDriver.current_lat">
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">POSITION</p>
            <p class="tg-mono text-sm text-brand-ink-2">
              {{ Number(selectedDriver.current_lat).toFixed(4) }}, {{ Number(selectedDriver.current_lng).toFixed(4) }}
            </p>
          </div>

          <!-- Account info -->
          <div>
            <p class="text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-2">COMPTE</p>
            <div class="space-y-1.5 text-sm">
              <p><span class="text-brand-muted">Email :</span> <span class="tg-mono">{{ selectedDriver.user?.email }}</span></p>
              <p><span class="text-brand-muted">Téléphone :</span> <span class="tg-mono">{{ selectedDriver.user?.phone || '—' }}</span></p>
            </div>
          </div>
        </div>
      </template>

      <template v-if="selectedDriver?.status === 'pending'" #footer>
        <button
          @click="askApprove(selectedDriver); selectedDriver = null"
          class="tg-cta w-full"
        >
          Approuver le chauffeur
        </button>
      </template>
    </SideDrawer>
  </div>
</template>
