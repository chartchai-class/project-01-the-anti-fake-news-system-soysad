<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommentsStore } from '@/stores/comments'
import SingleComment from '@/components/newsDetails/CommentItem.vue'

const props = defineProps<{ newsId: number | string; pageSize?: number }>()

const route = useRoute()
const router = useRouter()
const commentsStore = useCommentsStore()

const idNum = computed(() => Number(props.newsId))

// อ่าน perPage จาก query → sessionStorage → prop → default
const PER_PAGE_OPTIONS = [3, 5, 7, 10, 13, 15] as const
const key = computed(() => `comments_per_page:${idNum.value}`)

function coercePerPage(v: unknown, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) && PER_PAGE_OPTIONS.includes(n as any) ? n : fallback
}

const selectedSize = ref<number>(
  coercePerPage(
    route.query.perPage,
    coercePerPage(sessionStorage.getItem(key.value) ?? undefined, props.pageSize ?? 10),
  ),
)

// meta/list (ใช้ combined ถ้าคุณมี, ถ้าไม่มีก็ใช้ของเดิมได้)
const meta = computed(
  () =>
    commentsStore.combinedMetaByNewsId?.(idNum.value) ?? commentsStore.metaByNewsId(idNum.value),
)
const combined = computed(
  () =>
    commentsStore.combinedListByNewsId?.(idNum.value) ?? commentsStore.listByNewsId(idNum.value),
)

const page = computed(() => meta.value.page || 1)
const pageCount = computed(() => meta.value.pages || 1)
const total = computed(() => meta.value.total || 0)
const loading = computed(() => !!meta.value.loading)
const error = computed(() => meta.value.error)

// initial load
onMounted(() => {
  if (!meta.value.items?.length) {
    commentsStore.fetchFirstPage(idNum.value, selectedSize.value)
  }
})

// ✅ ถ้า query เปลี่ยน (เช่นกด back/forward) → sync selectedSize และ refetch
watch(
  () => route.query.perPage,
  (q) => {
    const next = coercePerPage(q, selectedSize.value)
    if (next !== selectedSize.value) {
      selectedSize.value = next
      commentsStore.fetchFirstPage(idNum.value, next)
    }
  },
)

// ✅ เมื่อผู้ใช้เลือก per-page ใหม่ → อัปเดต both: route query + sessionStorage + refetch
watch(selectedSize, (n) => {
  sessionStorage.setItem(key.value, String(n))
  router.replace({ query: { ...route.query, perPage: String(n) } })
  commentsStore.fetchFirstPage(idNum.value, n)
})

// (ถ้ามี visibleComments ที่ slice ไม่ให้เกิน limit ให้คงไว้)
const visibleComments = computed(() => {
  const limit = selectedSize.value
  // หน้า 1: local + remote (ถ้าใช้ combined) แล้วตัดไม่เกิน limit
  if (page.value <= 1) return combined.value.slice(0, limit)
  // หน้าอื่น ๆ ก็กันไว้ด้วย
  return combined.value.slice(0, limit)
})

function prev() {
  if (page.value > 1 && !loading.value)
    commentsStore.fetchPage?.(idNum.value, page.value - 1, selectedSize.value)
}
function next() {
  if (page.value < pageCount.value && !loading.value)
    commentsStore.fetchPage?.(idNum.value, page.value + 1, selectedSize.value)
}
function goTo(p: number) {
  if (p >= 1 && p <= pageCount.value && !loading.value)
    commentsStore.fetchPage?.(idNum.value, p, selectedSize.value)
}

const pageItems = computed<(number | '…')[]>(() => {
  const p = page.value,
    pc = pageCount.value,
    w = 1
  if (pc <= 1) return [1]
  const set = new Set<number>([1, pc])
  for (let i = p - w; i <= p + w; i++) if (i >= 1 && i <= pc) set.add(i)
  const arr = [...set].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of arr) {
    if (prev && n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
})
</script>

<template>
  <section class="mt-10">
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-semibold">
          Comments
          <span class="text-gray-500 font-large">({{ total }})</span>
        </h2>
        <slot name="actions"></slot>
      </div>

      <div class="flex items-center gap-3">
        <label class="text-sm flex items-center gap-2">
          <span class="text-gray-600">Per page</span>
          <select v-model.number="selectedSize" class="border rounded-lg px-2 py-1 text-sm">
            <option v-for="n in PER_PAGE_OPTIONS" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500 mb-3">Loading comments…</div>
    <div v-if="error" class="text-red-600 mb-3">{{ error }}</div>

    <ol v-if="visibleComments.length" class="space-y-6">
      <SingleComment v-for="c in visibleComments" :key="c.id" :comment="c" />
    </ol>
    <p v-else-if="!loading && !error" class="text-gray-500">No comments yet.</p>

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
