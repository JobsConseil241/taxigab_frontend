<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import EmptyState from '../components/EmptyState.vue'

const formulas = ref([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)

const form = ref(emptyForm())

function emptyForm() {
  return {
    slug: '',
    name: '',
    description: '',
    icon: 'car',
    base_fare: 500,
    per_km: 350,
    per_minute_wait: 0,
    min_fare: 1000,
    rounding_step: 100,
    sort_order: 0,
    is_active: true,
  }
}

async function fetchFormulas() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/formulas')
    formulas.value = data.formulas || []
  } catch (e) {
    console.error('Formulas load failed', e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  showModal.value = true
}

function openEdit(f) {
  editing.value = f
  form.value = { ...f }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/admin/formulas/${editing.value.id}`, form.value)
    } else {
      await api.post('/admin/formulas', form.value)
    }
    showModal.value = false
    await fetchFormulas()
  } catch (e) {
    console.error('Save failed', e)
    alert(e?.response?.data?.message || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

async function destroy(f) {
  if (!confirm(`Supprimer la formule "${f.name}" ?`)) return
  try {
    await api.delete(`/admin/formulas/${f.id}`)
    await fetchFormulas()
  } catch (e) {
    console.error('Delete failed', e)
  }
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR').format(val || 0)
}

onMounted(fetchFormulas)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Formules tarifaires</h1>
        <p class="text-brand-muted text-sm mt-1">Base, prix par km, minimum, arrondi — par type de course</p>
      </div>
      <button @click="openCreate" class="tg-cta">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nouvelle formule
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-3xl tg-shadow-sm">
      <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 border-b border-brand-line last:border-0 animate-pulse">
        <div class="h-4 bg-brand-line rounded w-8"></div>
        <div class="h-4 bg-brand-line rounded w-32"></div>
        <div class="h-4 bg-brand-line rounded w-20 ml-auto"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-3xl tg-shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-brand-line-2 text-left text-brand-muted">
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">ORDRE</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">NOM</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em]">SLUG</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em] text-right">BASE</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em] text-right">/KM</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em] text-right">MINIMUM</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em] text-center">ACTIF</th>
              <th class="px-5 py-3 text-[11px] font-extrabold tracking-[0.1em] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in formulas"
              :key="f.id"
              class="border-t border-brand-line hover:bg-brand-line-2/40 transition-colors"
            >
              <td class="px-5 py-3 tg-mono text-brand-muted font-bold">{{ f.sort_order }}</td>
              <td class="px-5 py-3 font-extrabold">{{ f.name }}</td>
              <td class="px-5 py-3 text-brand-muted tg-mono text-xs">{{ f.slug }}</td>
              <td class="px-5 py-3 text-right tg-mono font-bold whitespace-nowrap">{{ formatPrice(f.base_fare) }} <span class="text-[10px] text-brand-muted">F</span></td>
              <td class="px-5 py-3 text-right tg-mono font-bold whitespace-nowrap">{{ formatPrice(f.per_km) }} <span class="text-[10px] text-brand-muted">F</span></td>
              <td class="px-5 py-3 text-right tg-mono font-bold whitespace-nowrap">{{ formatPrice(f.min_fare) }} <span class="text-[10px] text-brand-muted">F</span></td>
              <td class="px-5 py-3 text-center">
                <span
                  :class="[
                    'inline-block w-2.5 h-2.5 rounded-full',
                    f.is_active ? 'bg-brand-success ring-4 ring-brand-success/15' : 'bg-brand-line',
                  ]"
                />
              </td>
              <td class="px-5 py-3 text-right">
                <button
                  @click="openEdit(f)"
                  class="text-brand-navy hover:text-brand-yellow-dim font-bold mr-3"
                >Modifier</button>
                <button
                  @click="destroy(f)"
                  class="text-brand-danger hover:brightness-110 font-bold"
                >Supprimer</button>
              </td>
            </tr>
            <tr v-if="formulas.length === 0">
              <td colspan="8" class="p-0">
                <EmptyState
                  icon="tag"
                  title="Aucune formule tarifaire"
                  hint="Créez votre première formule pour commencer à proposer des courses."
                >
                  <template #action>
                    <button @click="openCreate" class="tg-cta">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Créer une formule
                    </button>
                  </template>
                </EmptyState>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative bg-white rounded-3xl tg-shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between px-6 py-5 border-b border-brand-line">
              <div>
                <p class="text-[10px] font-extrabold tracking-[0.14em] text-brand-muted">{{ editing ? 'ÉDITION' : 'CRÉATION' }}</p>
                <h2 class="text-xl font-extrabold">{{ editing ? 'Modifier la formule' : 'Nouvelle formule' }}</h2>
              </div>
              <button
                @click="showModal = false"
                class="w-9 h-9 rounded-full bg-brand-line-2 hover:bg-brand-line text-brand-navy flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">NOM</label>
                  <input v-model="form.name" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">SLUG</label>
                  <input v-model="form.slug" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm font-bold tg-mono focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">DESCRIPTION</label>
                <input v-model="form.description" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">PRISE EN CHARGE · FCFA</label>
                  <input v-model.number="form.base_fare" type="number" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">PRIX / KM · FCFA</label>
                  <input v-model.number="form.per_km" type="number" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">MINIMUM</label>
                  <input v-model.number="form.min_fare" type="number" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">ARRONDI</label>
                  <input v-model.number="form.rounding_step" type="number" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">ORDRE</label>
                  <input v-model.number="form.sort_order" type="number" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm tg-mono font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-extrabold tracking-[0.1em] text-brand-muted mb-1.5">ICÔNE</label>
                  <select v-model="form.icon" class="w-full h-11 px-4 border border-brand-line rounded-xl text-sm font-bold focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition">
                    <option value="car">Voiture (standard)</option>
                    <option value="car_luxury">Voiture (confort)</option>
                    <option value="star">Étoile (VIP)</option>
                  </select>
                </div>
                <div class="flex items-end">
                  <label class="flex items-center gap-3 cursor-pointer h-11">
                    <span
                      :class="[
                        'relative w-11 h-6 rounded-full transition-colors',
                        form.is_active ? 'bg-brand-success' : 'bg-brand-line',
                      ]"
                    >
                      <span
                        :class="[
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow',
                          form.is_active ? 'translate-x-5' : '',
                        ]"
                      />
                    </span>
                    <input v-model="form.is_active" type="checkbox" class="sr-only" />
                    <span class="text-sm font-bold">Formule active</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 px-6 py-4 border-t border-brand-line bg-brand-surface-bg">
              <button
                @click="showModal = false"
                class="px-5 h-11 text-sm font-bold text-brand-muted hover:text-brand-ink rounded-full"
              >Annuler</button>
              <button
                @click="save"
                :disabled="saving"
                class="tg-cta"
              >
                {{ saving ? 'Enregistrement…' : (editing ? 'Mettre à jour' : 'Créer la formule') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
