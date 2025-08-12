<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '@/types'
import FeaturedNewsCard from './FeaturedNewsCard.vue'
import NewsCard from './NewsCard.vue'

const { items } = defineProps<{ items: NewsItem[] }>()

const blocks = computed(() =>
  (items || []).map((item, idx) => {
    const isFirst = idx === 0
    const isFeatured = isFirst || (idx % 5 === 0 && idx !== 0)
    const reverse = !isFirst && isFeatured && Math.floor(idx / 5) % 2 === 1
    return {
      key: `${item.id}-${isFeatured ? 'F' : 'N'}`,
      comp: isFeatured ? FeaturedNewsCard : NewsCard,
      class: isFeatured ? 'md:col-span-2' : '',
      item,
      reverse,
    }
  }),
)
</script>

<template>
  <section class="grid gap-6 md:grid-cols-2 auto-rows-auto">
    <component
      v-for="b in blocks"
      :key="b.key"
      :is="b.comp"
      :item="b.item"
      :reverse="b.reverse"
      :class="['transition hover:-translate-y-0.5 hover:shadow-md', b.class]"
    />
  </section>
</template>
