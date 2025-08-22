<script setup lang="ts">
defineOptions({
  name: 'AppFooter',
})
</script>

<template>
  <footer
    class="mt-10 bg-white/70 backdrop-blur-xl border-t border-zinc-200/70 text-zinc-600"
    role="contentinfo"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-sm flex items-center justify-between">
      <p class="text-zinc-500">© {{ new Date().getFullYear() }} Soysad</p>
      <p class="text-zinc-500">All rights reserved.</p>
    </div>
  </footer>
</template>
