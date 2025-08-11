<script setup lang="ts">
import type { NewsItem } from '@/types'
import FeaturedNewsCard from './FeaturedNewsCard.vue'
import NewsCard from './NewsCard.vue'

const { items } = defineProps<{ items: NewsItem[] }>()
</script>

<template>
  <section class="grid gap-6 md:grid-cols-2">
    <FeaturedNewsCard v-if="items.length" :item="items[0]" class="md:col-span-2" />
    <NewsCard v-for="n in items.slice(1)" :key="n.id" :item="n" />
  </section>
</template>
