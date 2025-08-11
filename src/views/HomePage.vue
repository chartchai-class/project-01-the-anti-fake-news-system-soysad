<script setup lang="ts">
import { onMounted } from 'vue'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'

const newsStore = useNewsStore()
const { news, loading, error } = storeToRefs(newsStore)
const { fetchNews } = newsStore

onMounted(() => {
  fetchNews()
})
</script>

<template>
  <div class="p-6 space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Latest News</h1>
      <button
        class="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        @click="fetchNews"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </header>

    <p v-if="error" class="text-red-600">⚠ {{ error }}</p>

    <div v-if="!error" class="grid gap-4 md:grid-cols-2">
      <article
        v-for="item in news || []"
        :key="item.id"
        class="border rounded-xl p-4 shadow-sm bg-white"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold leading-snug">
            {{ item.topic }}
          </h2>
          <span
            class="ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            :class="
              item.status === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            "
          >
            {{ item.status }}
          </span>
        </div>

        <p class="mt-2 text-gray-600 text-sm">
          {{ item.shortDetail }}
        </p>

        <p class="mt-2 text-xs text-gray-500">
          Reporter: {{ item.reporter }} • {{ item.dateTime }}
        </p>

        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          alt=""
          class="mt-3 w-full aspect-video object-cover rounded-md"
        />

        <div class="mt-3 flex items-center gap-3 text-sm text-gray-700">
          <span>🟥 Fake: {{ item.fakeVotes }}</span>
          <span>🟩 Real: {{ item.realVotes }}</span>
          <span class="text-gray-400">•</span>
          <span>💬 {{ item.comments?.length ?? 0 }} comments</span>
        </div>
      </article>
    </div>
  </div>
</template>
