<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import SkeletonCard from '@/components/newsDetails/SkeletonDetail.vue'

const route = useRoute()
const newsStore = useNewsStore()
const { news, newsAll, loading, error } = storeToRefs(newsStore)

const resolving = ref(false)

const currentId = computed(() => {
  const n = Number(route.params.id)
  return Number.isFinite(n) ? n : null
})

const item = computed(() => {
  const id = currentId.value
  if (!id) return null
  const pool = [...(newsAll.value ?? []), ...(news.value ?? [])]
  return pool.find((n) => Number(n.id) === id) ?? null
})

async function ensureItem() {
  if (!currentId.value) return
  if (item.value) return
  resolving.value = true
  try {
    await newsStore.ensureAllNews?.()
  } finally {
    resolving.value = false
  }
}
onMounted(ensureItem)
watch(currentId, ensureItem)
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div v-if="loading || resolving" class="rounded-2xl border border-zinc-200 p-6 bg-white">
        <SkeletonCard />
      </div>

      <p v-else-if="error" class="text-red-600">⚠ {{ error }}</p>
      <p v-else-if="!item" class="text-zinc-600">Article not found.</p>

      <router-view v-else v-slot="{ Component }">
        <component :is="Component" :item="item" />
      </router-view>
    </div>
  </div>
</template>
