<!-- src/components/news/NewsLayout.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '@/types'
import FeaturedNewsCard from './FeaturedNewsCard.vue'
import NewsCard from './NewsCard.vue'

const { items } = defineProps<{ items: NewsItem[] }>()

type Block = {
  key: string
  comp: typeof FeaturedNewsCard | typeof NewsCard
  class: string
  item: NewsItem
  reverse?: boolean
}

const blocks = computed<Block[]>(() => {
  const list = items ?? []
  return list.map((item, idx) => {
    const pos = idx % 7
    const isFeatured = pos === 0
    const reverse = isFeatured ? Math.floor(idx / 7) % 2 === 1 : false

    return {
      key: `${item.id}-${isFeatured ? 'F' : 'N'}`,
      comp: isFeatured ? FeaturedNewsCard : NewsCard,

      class: isFeatured ? 'col-span-12' : 'col-span-12 sm:col-span-6 lg:col-span-4',
      item,
      reverse,
    }
  })
})
</script>

<template>
  <section class="grid grid-cols-12 gap-5 sm:gap-6">
    <component
      v-for="b in blocks"
      :key="b.key"
      :is="b.comp"
      :item="b.item"
      :reverse="b.reverse"
      :class="['h-full', b.class]"
    />
  </section>
</template>
