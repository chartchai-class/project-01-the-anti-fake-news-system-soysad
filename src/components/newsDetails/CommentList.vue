<!-- src/components/newsDetails/CommentList.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommentsStore } from '@/stores/comments'
import SingleComment from '@/components/newsDetails/CommentItem.vue'

const props = defineProps<{
  newsId: number | string
  pageSize?: number
  embedded?: boolean
}>()

const route = useRoute()
const router = useRouter()
const commentsStore = useCommentsStore()

const newsId = computed(() => Number(props.newsId))

const PER_PAGE_OPTIONS = [3, 5, 7, 10, 13, 15] as const
const key = computed(() => `comments_per_page:${newsId.value}`)
const coercePerPage = (v: unknown, fallback: number) => {
  const n = Number(v)
  return Number.isFinite(n) && (PER_PAGE_OPTIONS as readonly number[]).includes(n) ? n : fallback
}
const selectedSize = ref<number>(
  coercePerPage(
    route.query.perPage,
    coercePerPage(sessionStorage.getItem(key.value) ?? undefined, props.pageSize ?? 5),
  ),
)

const meta = computed(
  () =>
    commentsStore.combinedMetaByNewsId?.(newsId.value) ?? commentsStore.metaByNewsId(newsId.value),
)
const combined = computed(
  () =>
    commentsStore.combinedListByNewsId?.(newsId.value) ?? commentsStore.listByNewsId(newsId.value),
)

const page = computed(() => meta.value.page || 1)
const pageCount = computed(() => meta.value.pages || 1)
const total = computed(() => meta.value.total || 0)
const loading = computed(() => !!meta.value.loading)
const error = computed(() => meta.value.error)

onMounted(() => {
  if (!meta.value.items?.length) {
    commentsStore.fetchFirstPage(newsId.value, selectedSize.value)
  }
})

watch(
  () => route.query.perPage,
  (q) => {
    const next = coercePerPage(q, selectedSize.value)
    if (next !== selectedSize.value) {
      selectedSize.value = next
      commentsStore.fetchFirstPage(newsId.value, next)
    }
  },
)

watch(selectedSize, (n) => {
  sessionStorage.setItem(key.value, String(n))
  router.replace({ query: { ...route.query, perPage: String(n) } })
  commentsStore.fetchFirstPage(newsId.value, n)
})

const visibleComments = computed(() => combined.value.slice(0, selectedSize.value))

function prev() {
  if (page.value > 1 && !loading.value)
    commentsStore.fetchPage(newsId.value, page.value - 1, selectedSize.value)
}
function next() {
  if (page.value < pageCount.value && !loading.value)
    commentsStore.fetchPage(newsId.value, page.value + 1, selectedSize.value)
}
function goTo(p: number) {
  if (p >= 1 && p <= pageCount.value && !loading.value)
    commentsStore.fetchPage(newsId.value, p, selectedSize.value)
}

type PageItem = number | '…'
const pageItems = computed<PageItem[]>(() => {
  const p = page.value
  const pc = pageCount.value
  const w = 1
  if (pc <= 1) return [1]
  const set = new Set<number>([1, pc])
  for (let i = p - w; i <= p + w; i++) if (i >= 1 && i <= pc) set.add(i)
  const arr = [...set].sort((a, b) => a - b)
  const out: PageItem[] = []
  let prevNum = 0
  for (const n of arr) {
    if (prevNum && n - prevNum > 1) out.push('…')
    out.push(n)
    prevNum = n
  }
  return out
})
</script>

<template>
  <section :class="props.embedded ? 'px-8 lg:px-12 py-8' : 'mt-10'">
    <!-- Header / Controls -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h2 class="text-xl md:text-2xl font-semibold text-zinc-900">
          Comments
          <span class="text-zinc-500 font-normal">({{ total }})</span>
        </h2>
        <slot name="actions" />
      </div>

      <label class="text-sm flex items-center gap-2">
        <span class="text-zinc-600">Per page</span>
        <select
          v-model.number="selectedSize"
          class="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none hover:bg-zinc-50"
        >
          <option v-for="n in PER_PAGE_OPTIONS" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
    </div>

    <!-- States -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse rounded-xl border border-zinc-200 bg-white p-4"
      >
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-zinc-200" />
          <div class="h-3 w-40 rounded bg-zinc-200" />
        </div>
        <div class="mt-3 h-3 w-5/6 rounded bg-zinc-200" />
        <div class="mt-2 h-3 w-2/3 rounded bg-zinc-200" />
      </div>
    </div>

    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <ol v-else-if="visibleComments.length" class="space-y-4">
      <SingleComment v-for="c in visibleComments" :key="c.id" :comment="c" />
    </ol>

    <p v-else class="text-zinc-500">No comments yet.</p>

    <!-- Pagination -->
    <nav v-if="!loading && total > 0" class="mt-6 flex items-center justify-center gap-2">
      <button
        class="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
        :disabled="page <= 1"
        @click="prev"
      >
        Prev
      </button>

      <ul class="flex items-center gap-1">
        <li
          v-for="(it, idx) in pageItems"
          :key="`p-${typeof it === 'number' ? it : 'dots-' + idx}`"
        >
          <button
            v-if="typeof it === 'number'"
            class="min-w-9 rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
            :class="it === page ? 'bg-zinc-900 text-white ring-zinc-900' : ''"
            @click="goTo(it)"
          >
            {{ it }}
          </button>
          <span v-else class="px-2 text-zinc-500 select-none">…</span>
        </li>
      </ul>

      <button
        class="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
        :disabled="page >= pageCount"
        @click="next"
      >
        Next
      </button>
    </nav>
  </section>
</template>
