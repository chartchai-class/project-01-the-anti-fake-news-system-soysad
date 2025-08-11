<script setup lang="ts">
import type { NewsItem } from '@/types'
import { fakePercent, majorityLabel } from '@/utils/vote.ts'
const { item } = defineProps<{ item: NewsItem }>()
</script>

<template>
  <router-link :to="`/details/${item.id}`" class="block hover:shadow-lg transition-shadow">
  <article
    class="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden grid md:grid-cols-2"
  >
    <div class="bg-gray-100 aspect-video md:aspect-auto md:h-full">
      <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="w-full h-full object-cover" />
    </div>

    <div class="p-6">
      <p class="text-xs text-gray-500 line-clamp-1">
        {{ item.reporter }} · {{ new Date(item.dateTime).toLocaleDateString() }}
      </p>

      <h2 class="mt-2 text-2xl font-semibold leading-tight">
        {{ item.topic }}
      </h2>

      <p class="mt-2 text-gray-600">
        {{ item.shortDetail }}
      </p>

      <div class="mt-4 flex items-center gap-3 text-sm">
        <span class="inline-flex items-center rounded-full px-2 py-0.5 bg-gray-100">
          🟥 {{ item.fakeVotes }}
        </span>
        <span class="inline-flex items-center rounded-full px-2 py-0.5 bg-gray-100">
          🟩 {{ item.realVotes }}
        </span>
        <span class="text-gray-400">•</span>
        <span class="text-gray-600">Fake {{ fakePercent(item.fakeVotes, item.realVotes) }}%</span>
        <span class="text-gray-400">•</span>
        <span class="text-gray-600">{{ majorityLabel(item.fakeVotes, item.realVotes) }}</span>
      </div>
    </div>
  </article>
  </router-link>
</template>
