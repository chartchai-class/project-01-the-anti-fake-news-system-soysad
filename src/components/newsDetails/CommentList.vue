<!-- src/components/newsDetails/CommentsList.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommentsStore } from '@/stores/comments'
import SingleComment from '@/components/newsDetails/CommentItem.vue'

const props = defineProps<{
  newsId: number | string
  pageSize?: number
}>()

const commentsStore = useCommentsStore()
const { listByNewsId, metaByNewsId, hasMore } = commentsStore

const idNum = computed(() => Number(props.newsId))
const meta = computed(() => metaByNewsId(idNum.value))
const comments = computed(() => listByNewsId(idNum.value))
const canLoadMore = computed(() => hasMore(idNum.value))

const size = computed(() => props.pageSize ?? 20)

onMounted(() => {
  if (!meta.value.items?.length) {
    commentsStore.fetchFirstPage(idNum.value, size.value)
  }
})

function loadMore() {
  commentsStore.fetchNextPage(idNum.value, size.value)
}
</script>

<template>
  <section class="mt-10">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h2 class="text-2xl font-semibold mb-4">
      Comments
      <span class="text-gray-500 font-large">({{ meta.total }})</span>
      </h2>

      <label class="text-sm flex items-center gap-2">
        <span class="text-gray-600">Show</span>
        <select class="border rounded-lg px-2 py-1 text-sm">
          <option value="top">Highest Rated</option>
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
        </select>
      </label>
    </div>
    
    <div v-if="meta.loading" class="text-gray-500 mb-3">Loading comments…</div>
    <div v-if="meta.error" class="text-red-600 mb-3">{{ meta.error }}</div>

    <ol v-if="comments.length" class="space-y-6 ">
      <SingleComment v-for="c in comments" :key="c.id" :comment="c" />
    </ol>

    <p v-else-if="!meta.loading && !meta.error" class="text-gray-500">
      No comments yet.
    </p>

    <div class="mt-4">
      <button
        v-if="canLoadMore && !meta.loading"
        class="px-4 py-2 rounded-xl bg-black text-white"
        @click="loadMore"
      >
        Load more
      </button>
    </div>
  </section>
</template>
