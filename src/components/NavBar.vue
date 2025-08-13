<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 h-14 bg-white/70 backdrop-blur-xl border-b border-zinc-200/70 text-zinc-700"
    role="navigation"
  >
    <nav class="h-full mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 hover:text-zinc-900">
        <span
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 ring-1 ring-zinc-200"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <path d="M4 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
            <path d="M8 8h8M8 12h8M8 16h4" />
          </svg>
        </span>
        <span class="font-semibold tracking-tight">Soysad Fake or Real</span>
      </RouterLink>

      <RouterLink
        to="/"
        class="text-sm px-3 py-1.5 rounded-lg ring-1 ring-zinc-200 bg-white/50 hover:bg-white/70 hover:text-zinc-900"
      >
        Home
      </RouterLink>
    </nav>
  </header>
</template>
