<script setup lang="ts">
import type { NewsItem } from '@/types'
import { fakePercent, majorityLabel } from '@/utils/vote'
const { item } = defineProps<{ item: NewsItem }>()
</script>

<template>
  <article class="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
    <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full aspect-video object-cover" />
    <div class="p-5">
      <h3 class="text-lg font-semibold leading-snug line-clamp-2">{{ item.topic }}</h3>
      <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ item.shortDetail }}</p>

      <div class="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span>{{ item.reporter }}</span>
        <span>•</span>
        <span>{{ new Date(item.dateTime).toLocaleDateString() }}</span>
      </div>

      <div class="mt-3 flex items-center gap-2 text-sm">
        <span class="px-2 py-0.5 rounded-full bg-gray-100">🟥 {{ item.fakeVotes }}</span>
        <span class="px-2 py-0.5 rounded-full bg-gray-100">🟩 {{ item.realVotes }}</span>
        <span class="text-gray-400">•</span>
        <span class="text-gray-600"
          >Fake {{ fakePercent(item.fakeVotes, item.realVotes) }}% —
          {{ majorityLabel(item.fakeVotes, item.realVotes) }}</span
        >
      </div>
    </div>
  </article>
</template>
