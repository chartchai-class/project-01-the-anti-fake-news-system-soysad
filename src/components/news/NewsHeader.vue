<script setup lang="ts">
defineProps<{ loading: boolean }>()
const emit = defineEmits<{ (e: 'refresh'): void }>()
</script>

<template>
  <header class="flex items-center justify-between">
    <h1 class="text-3xl font-semibold tracking-tight">Latest News</h1>
    <button
      class="px-3 py-2 rounded-full bg-white shadow-sm ring-1 ring-black/5 text-sm hover:bg-gray-100 disabled:opacity-50"
      @click="emit('refresh')"
      :disabled="loading"
    >
      {{ loading ? 'Loading…' : 'Refresh' }}
    </button>
  </header>
</template>
