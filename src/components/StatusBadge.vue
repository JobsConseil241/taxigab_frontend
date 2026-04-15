<script setup>
defineProps({
  status: String,
})

const map = {
  requested: { label: 'En attente', class: 'bg-blue-50 text-blue-700' },
  accepted: { label: 'Acceptée', class: 'bg-indigo-50 text-indigo-700' },
  arriving: { label: 'En approche', class: 'bg-amber-50 text-amber-700' },
  in_progress: { label: 'En cours', class: 'bg-yellow-50 text-yellow-700' },
  completed: { label: 'Terminée', class: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulée', class: 'bg-red-50 text-red-700' },
  pending: { label: 'En attente', class: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approuvé', class: 'bg-emerald-50 text-emerald-700' },
  suspended: { label: 'Suspendu', class: 'bg-red-50 text-red-700' },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      map[status]?.class || 'bg-gray-100 text-gray-600',
    ]"
  >
    {{ map[status]?.label || status }}
  </span>
</template>
