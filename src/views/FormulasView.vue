<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

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
      <h1 class="text-2xl font-extrabold tracking-tight">Formules tarifaires</h1>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nouvelle formule
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border">
      <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 border-b last:border-0 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-8"></div>
        <div class="h-4 bg-gray-200 rounded w-32"></div>
        <div class="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 text-left text-gray-500 font-medium">
              <th class="px-5 py-3">Ordre</th>
              <th class="px-5 py-3">Nom</th>
              <th class="px-5 py-3">Slug</th>
              <th class="px-5 py-3 text-right">Base</th>
              <th class="px-5 py-3 text-right">/km</th>
              <th class="px-5 py-3 text-right">Minimum</th>
              <th class="px-5 py-3 text-center">Actif</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in formulas"
              :key="f.id"
              class="border-t hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-400 font-semibold">{{ f.sort_order }}</td>
              <td class="px-5 py-3 font-semibold">{{ f.name }}</td>
              <td class="px-5 py-3 text-gray-500 font-mono text-xs">{{ f.slug }}</td>
              <td class="px-5 py-3 text-right">{{ formatPrice(f.base_fare) }} XAF</td>
              <td class="px-5 py-3 text-right">{{ formatPrice(f.per_km) }} XAF</td>
              <td class="px-5 py-3 text-right">{{ formatPrice(f.min_fare) }} XAF</td>
              <td class="px-5 py-3 text-center">
                <span
                  :class="[
                    'inline-block w-2.5 h-2.5 rounded-full',
                    f.is_active ? 'bg-emerald-500' : 'bg-gray-300',
                  ]"
                />
              </td>
              <td class="px-5 py-3 text-right">
                <button
                  @click="openEdit(f)"
                  class="text-brand-purple hover:text-brand-orange font-medium mr-3"
                >Modifier</button>
                <button
                  @click="destroy(f)"
                  class="text-red-500 hover:text-red-700 font-medium"
                >Supprimer</button>
              </td>
            </tr>
            <tr v-if="formulas.length === 0">
              <td colspan="8" class="px-5 py-12 text-center text-gray-400">
                Aucune formule tarifaire
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
          <div class="absolute inset-0 bg-black/40" @click="showModal = false" />
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <h2 class="text-lg font-bold mb-4">
                {{ editing ? 'Modifier la formule' : 'Nouvelle formule' }}
              </h2>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                    <input v-model="form.name" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                    <input v-model="form.slug" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none font-mono" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input v-model="form.description" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Prise en charge (XAF)</label>
                    <input v-model.number="form.base_fare" type="number" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Prix / km (XAF)</label>
                    <input v-model.number="form.per_km" type="number" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Minimum (XAF)</label>
                    <input v-model.number="form.min_fare" type="number" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Arrondi</label>
                    <input v-model.number="form.rounding_step" type="number" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Ordre</label>
                    <input v-model.number="form.sort_order" type="number" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Icône</label>
                    <select v-model="form.icon" class="w-full px-3 py-2 border rounded-xl text-sm focus:border-brand-orange outline-none">
                      <option value="car">Voiture (standard)</option>
                      <option value="car_luxury">Voiture (confort)</option>
                      <option value="star">Étoile (VIP)</option>
                    </select>
                  </div>
                  <div class="flex items-end">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.is_active" type="checkbox" class="w-4 h-4 rounded accent-brand-orange" />
                      <span class="text-sm font-medium">Formule active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button
                  @click="showModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >Annuler</button>
                <button
                  @click="save"
                  :disabled="saving"
                  class="px-5 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
                >
                  {{ saving ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
