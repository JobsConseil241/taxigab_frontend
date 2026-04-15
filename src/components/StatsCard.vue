<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  color: { type: String, default: 'yellow' },
  suffix: { type: String, default: '' },
})

const colorMap = {
  yellow: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
}
</script>

<template>
  <div class="bg-white rounded-2xl border p-5 flex items-start gap-4">
    <div :class="['w-11 h-11 rounded-xl flex items-center justify-center shrink-0', colorMap[color]]">
      <!-- Users -->
      <svg v-if="icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
      <!-- Car -->
      <svg v-if="icon === 'car'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5" />
      </svg>
      <!-- Route -->
      <svg v-if="icon === 'route'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m0-8.25a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM9 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6-3.75V18m0-6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM15 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
      </svg>
      <!-- Money -->
      <svg v-if="icon === 'money'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    </div>
    <div class="min-w-0">
      <p class="text-sm text-gray-500 font-medium">{{ label }}</p>
      <p class="text-2xl font-extrabold tracking-tight mt-0.5">
        {{ value }}<span v-if="suffix" class="text-sm font-semibold text-gray-400 ml-1">{{ suffix }}</span>
      </p>
    </div>
  </div>
</template>
