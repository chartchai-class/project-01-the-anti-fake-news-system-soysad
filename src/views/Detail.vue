<!-- src/views/detailpage.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import NewsDetails from '@/components/newsDetails/FullDetailNews.vue'
import CommentsList from '@/components/newsDetails/CommentList.vue'

const router = useRouter()
const route = useRoute()

const newsStore = useNewsStore()
const { news, loading, error } = storeToRefs(newsStore)

// โหลดข่าวถ้ายังไม่มี (array ว่าง)
onMounted(async () => {
  if (!Array.isArray(news.value) || news.value.length === 0) {
    try {
      await newsStore.fetchNews()
    } catch (e) {
      // optional: handle error ที่ store แล้ว
    }
  }
})

// id ปัจจุบันจาก route
const currentNewsId = computed(() => {
  const n = Number(route.params.id)
  return Number.isFinite(n) ? n : null
})

// คำนวณข่าวปัจจุบันจาก list + id
const currentNewsItem = computed(() => {
  if (!currentNewsId.value) return null
  const list = Array.isArray(news.value) ? news.value : []
  return list.find((n) => Number(n.id) === currentNewsId.value) ?? null
})
</script>

<template>
  <div>
    <NewsDetails v-if="currentNewsItem" :item="currentNewsItem" />

    <div v-else class="p-6">
      <div v-if="loading" class="text-gray-500">Loading article…</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else class="text-gray-500">Article not found.</div>
    </div>

    <div v-if="currentNewsId && currentNewsItem" class="max-w-5xl mx-auto px-4 py-2">
      <CommentsList :news-id="currentNewsId" :page-size="10">
        <template #actions>
          <router-link
            :to="{ name: 'votes', params: { id: currentNewsId } }"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
            Votes & Comments
          </router-link>
        </template>
      </CommentsList>
    </div>
  </div>
</template>
