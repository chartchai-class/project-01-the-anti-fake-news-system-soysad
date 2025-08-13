<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/Footer.vue'
</script>

<template>
  <NavBar />
  <main class="mt-14">
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped></style>
