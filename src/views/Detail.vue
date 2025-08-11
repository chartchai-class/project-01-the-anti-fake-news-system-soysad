<!-- src/views/detailpage.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import NewsDetails from '@/components/newsDetails/FullDetailNews.vue'
import CommentsList from '@/components/newsDetails/CommentList.vue'

const router = useRouter()
const route = useRoute()

const newsStore = useNewsStore()
const { news, loading, error } = storeToRefs(newsStore)
const currentNewsItem = ref<any>()

onMounted(async () => {
  if (!news.value) await newsStore.fetchNews()
})

watch([news, () => route.params.id], ([newsArr, id]) => {
  if (newsArr && id) {
    currentNewsItem.value = newsArr.find((n) => String(n.id) === String(id))
  }
}, { immediate: true })

const currentNewsId = computed(() => currentNewsItem.value?.id ?? null)

function goBack() { router.back() }
</script>

<template>

  <NewsDetails v-if="currentNewsItem" :item="currentNewsItem" />
  <div v-else-if="loading" class="p-6 text-gray-500">Loading article…</div>
  <div v-else-if="error" class="p-6 text-red-600">{{ error }}</div>
  <div v-else class="p-6 text-gray-500">Article not found.</div>

  <router-link
      :to="{ name: 'votes', params: { id: currentNewsId } }"
      class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      Votes
    </router-link>

  <div v-if="currentNewsId" class="max-w-5xl mx-auto px-4 py-2">
    <CommentsList
      :news-id="Number(currentNewsId)"
      :page-size="10"
    />
  </div>
  
</template>
