<script setup>
defineProps({
  status: String,
})

// All badges follow the navy/yellow/success/danger token system.
const map = {
  requested:   { label: 'En attente',  class: 'bg-brand-navy/10 text-brand-navy' },
  accepted:    { label: 'Acceptée',    class: 'bg-brand-moov/15 text-brand-moov' },
  arriving:    { label: 'En approche', class: 'bg-brand-yellow/30 text-brand-navy' },
  in_progress: { label: 'En cours',    class: 'bg-brand-yellow/30 text-brand-navy' },
  completed:   { label: 'Terminée',    class: 'bg-brand-success/15 text-brand-success' },
  cancelled:   { label: 'Annulée',     class: 'bg-brand-danger/15 text-brand-danger' },
  pending:     { label: 'En attente',  class: 'bg-brand-yellow/30 text-brand-navy' },
  approved:    { label: 'Approuvé',    class: 'bg-brand-success/15 text-brand-success' },
  suspended:   { label: 'Suspendu',    class: 'bg-brand-danger/15 text-brand-danger' },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold',
      map[status]?.class || 'bg-brand-line-2 text-brand-muted',
    ]"
  >
    {{ map[status]?.label || status }}
  </span>
</template>
