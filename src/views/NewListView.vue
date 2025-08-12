<script setup lang="ts">
import { onMounted } from 'vue'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import NewsHeader from '@/components/news/NewsHeader.vue'
import NewsGrid from '@/components/news/NewsGrid.vue'
import SkeletonCard from '@/components/news/SkeletonCard.vue'
import EmptyState from '@/components/news/EmptyState.vue'

const newsStore = useNewsStore()
const { news, loading, error } = storeToRefs(newsStore)
const { fetchNews } = newsStore

onMounted(fetchNews)
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="mx-auto max-w-6xl px-4 py-8">
      <NewsHeader :loading="loading" @refresh="fetchNews" />
      <p v-if="error" class="mt-4 text-red-600">⚠ {{ error }}</p>

      <div v-if="loading" class="grid md:grid-cols-2 gap-6 mt-6">
        <SkeletonCard class="md:col-span-2 h-64" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <EmptyState v-else-if="!news || news.length === 0" class="mt-6" />

      <NewsGrid v-else class="mt-6" :items="news" />
    </div>
  </div>
</template>
