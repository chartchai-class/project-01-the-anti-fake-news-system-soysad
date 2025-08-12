<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import NewsHeader from '@/components/news/NewsHeader.vue'
import NewsGrid from '@/components/news/NewsGrid.vue'
import SkeletonCard from '@/components/news/SkeletonCard.vue'
import EmptyState from '@/components/news/EmptyState.vue'
import { majorityLabel } from '@/utils/vote'

type Filter = 'all' | 'fake' | 'real'
const props = defineProps<{ page: number; perPage: number; filter: Filter }>()

const router = useRouter()
const route = useRoute()
const PER_PAGE_OPTIONS = [3, 5, 8, 10, 12, 16, 20] as const

const newsStore = useNewsStore()
const { news, total, loading, error } = storeToRefs(newsStore)

const page = ref(props.page || 1)
const perPage = ref(
  (PER_PAGE_OPTIONS as readonly number[]).includes(props.perPage) ? props.perPage : 5,
)
const filter = ref<Filter>(props.filter ?? 'all')

const pageCount = computed(() => Math.max(1, Math.ceil((total.value ?? 0) / perPage.value)))
const startIndex = computed(() => (page.value - 1) * perPage.value + (total.value ? 1 : 0))
const endIndex = computed(() => Math.min(total.value, page.value * perPage.value))

function load() {
  newsStore.fetchNews(page.value, perPage.value)
}

watch(
  () => [route.query.page, route.query.perPage, route.query.filter],
  ([qp, qps, qf]) => {
    const np = parseInt((qp as string) ?? '1', 10)
    const ns = parseInt((qps as string) ?? String(perPage.value), 10)
    const nf = (['all', 'fake', 'real'] as const).includes(qf as Filter) ? (qf as Filter) : 'all'
    const nextPage = Number.isFinite(np) && np > 0 ? np : 1
    const nextPerPage = (PER_PAGE_OPTIONS as readonly number[]).includes(ns) ? ns : perPage.value
    const changed = nextPage !== page.value || nextPerPage !== perPage.value || nf !== filter.value
    page.value = nf !== filter.value ? 1 : nextPage
    perPage.value = nextPerPage
    filter.value = nf
    if (changed) load()
  },
  { immediate: true },
)

function setQuery(p = page.value, ps = perPage.value, f = filter.value) {
  router.push({ query: { ...route.query, page: String(p), perPage: String(ps), filter: f } })
}
function prev() {
  setQuery(Math.max(1, page.value - 1), perPage.value, filter.value)
}
function next() {
  setQuery(Math.min(pageCount.value, page.value + 1), perPage.value, filter.value)
}
function goTo(p: number) {
  setQuery(p, perPage.value, filter.value)
}
function onChangePerPage(ps: number) {
  const valid = (PER_PAGE_OPTIONS as readonly number[]).includes(ps) ? ps : perPage.value
  setQuery(1, valid, filter.value)
}
function setFilter(f: Filter) {
  setQuery(1, perPage.value, f)
}

const filteredThisPage = computed(() => {
  if (filter.value === 'all') return news.value
  return (news.value || []).filter((n) => {
    const s = majorityLabel(n.fakeVotes, n.realVotes).toLowerCase()
    return (filter.value === 'fake' && s === 'fake') || (filter.value === 'real' && s === 'real')
  })
})

type PageItem = number | '…'
const pageItems = computed<PageItem[]>(() => {
  const t = pageCount.value,
    p = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => (i + 1) as PageItem)
  const out: PageItem[] = [1]
  if (p > 3) out.push('…')
  const s = Math.max(2, p - 1),
    e = Math.min(t - 1, p + 1)
  for (let i = s; i <= e; i++) out.push(i as PageItem)
  if (p < t - 2) out.push('…')
  out.push(t as PageItem)
  return out
})

const isActive = (f: Filter) => filter.value === f
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-6xl px-4 py-8">
      <NewsHeader :loading="loading" @refresh="load" />

      <p v-if="error" class="mt-4 text-red-600">⚠ {{ error }}</p>

      <div v-if="!error" class="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-xl ring-1 ring-zinc-200 p-0.5 bg-white">
            <button
              class="px-3 py-1 rounded-lg"
              :class="isActive('all') ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'"
              @click="setFilter('all')"
            >
              All
            </button>
            <button
              class="px-3 py-1 rounded-lg"
              :class="
                isActive('fake') ? 'bg-amber-600 text-white' : 'text-zinc-700 hover:bg-zinc-50'
              "
              @click="setFilter('fake')"
            >
              Fake
            </button>
            <button
              class="px-3 py-1 rounded-lg"
              :class="
                isActive('real') ? 'bg-emerald-600 text-white' : 'text-zinc-700 hover:bg-zinc-50'
              "
              @click="setFilter('real')"
            >
              Real
            </button>
          </div>

          <span class="text-zinc-600 ml-3">
            Showing <span class="font-medium text-zinc-900">{{ total ? startIndex : 0 }}</span
            >–<span class="font-medium text-zinc-900">{{ endIndex }}</span> of
            <span class="font-medium text-zinc-900">{{ total }}</span>
          </span>
        </div>

        <label class="flex items-center gap-2">
          <span class="text-zinc-600">Per page</span>
          <select
            :value="perPage"
            @change="onChangePerPage(parseInt(($event.target as HTMLSelectElement).value, 10))"
            class="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none hover:bg-zinc-50"
          >
            <option v-for="n in PER_PAGE_OPTIONS" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>

      <div v-if="loading" class="grid md:grid-cols-2 gap-6 mt-6">
        <SkeletonCard class="md:col-span-2 h-64" />
        <SkeletonCard v-for="n in 6" :key="n" />
      </div>

      <EmptyState v-else-if="!filteredThisPage || filteredThisPage.length === 0" class="mt-6" />

      <NewsGrid v-else class="mt-6" :items="filteredThisPage" />

      <nav v-if="!loading && total > 0" class="mt-6 flex items-center justify-center gap-2">
        <button
          class="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
          :disabled="page === 1"
          @click="prev"
        >
          Prev
        </button>

        <ul class="flex items-center gap-1">
          <li
            v-for="it in pageItems"
            :key="`p-${typeof it === 'number' ? it : 'dots-' + Math.random()}`"
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
          :disabled="page === pageCount"
          @click="next"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>
