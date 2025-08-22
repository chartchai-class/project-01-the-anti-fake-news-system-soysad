<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import NewsHeader from '@/components/news/NewsHeader.vue'
import NewsGrid from '@/components/news/NewsLayout.vue'
import SkeletonCard from '@/components/news/SkeletonCard.vue'
import EmptyState from '@/components/news/EmptyState.vue'
import { majorityLabel } from '@/utils/vote'

type Filter = 'all' | 'fake' | 'real'
const props = defineProps<{ page: number; perPage: number; filter: Filter }>()

const router = useRouter()
const route = useRoute()
const PER_PAGE_OPTIONS = [4, 7, 14, 21] as const

const newsStore = useNewsStore()
const { news, newsAll, total, loading, error } = storeToRefs(newsStore)

const page = ref(props.page || 1)
const perPage = ref(
  (PER_PAGE_OPTIONS as readonly number[]).includes(props.perPage) ? props.perPage : 7,
)
const filter = ref<Filter>(props.filter ?? 'all')

const isClientMode = computed(() => filter.value !== 'all')

watch(
  () => [route.query.page, route.query.perPage, route.query.filter],
  async ([qp, qps, qf]) => {
    const np = parseInt((qp as string) ?? '1', 10)
    const ns = parseInt((qps as string) ?? String(perPage.value), 10)
    const nf = (['all', 'fake', 'real'] as const).includes(qf as Filter) ? (qf as Filter) : 'all'

    const nextPage = Number.isFinite(np) && np > 0 ? np : 1
    const nextPerPage = (PER_PAGE_OPTIONS as readonly number[]).includes(ns) ? ns : perPage.value

    const filterChanged = nf !== filter.value
    page.value = filterChanged ? 1 : nextPage
    perPage.value = nextPerPage
    filter.value = nf

    if (filter.value === 'all') {
      await newsStore.fetchNews(page.value, perPage.value)
    } else {
      await newsStore.ensureAllNews()
    }
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
  setQuery(page.value + 1, perPage.value, filter.value)
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

const filteredAll = computed(() => {
  if (filter.value === 'all') return []
  const data = newsAll.value ?? []
  return data.filter((n) => {
    const s = majorityLabel(n.fakeVotes, n.realVotes).toLowerCase()
    return (filter.value === 'fake' && s === 'fake') || (filter.value === 'real' && s === 'real')
  })
})

const clientTotal = computed(() => filteredAll.value.length)
const clientPageCount = computed(() => Math.max(1, Math.ceil(clientTotal.value / perPage.value)))
const clientStart = computed(() => (page.value - 1) * perPage.value)
const clientEnd = computed(() => Math.min(clientTotal.value, page.value * perPage.value))
const clientSlice = computed(() => filteredAll.value.slice(clientStart.value, clientEnd.value))

const isServerMode = computed(() => !isClientMode.value)

const pageCount = computed(() =>
  isClientMode.value
    ? clientPageCount.value
    : Math.max(1, Math.ceil((total.value ?? 0) / perPage.value)),
)
const startIndex = computed(() =>
  isClientMode.value
    ? clientTotal.value
      ? clientStart.value + 1
      : 0
    : (page.value - 1) * perPage.value + (total.value ? 1 : 0),
)
const endIndex = computed(() =>
  isClientMode.value ? clientEnd.value : Math.min(total.value, page.value * perPage.value),
)
const totalForToolbar = computed(() => (isClientMode.value ? clientTotal.value : total.value))
const itemsForGrid = computed(() => (isClientMode.value ? clientSlice.value : news.value))

const pageStats = computed(() => {
  const items = itemsForGrid.value ?? []
  let real = 0,
    fake = 0,
    unclear = 0
  for (const n of items) {
    const s = majorityLabel(n.fakeVotes, n.realVotes)
    if (s === 'Real') real++
    else if (s === 'Fake') fake++
    else unclear++
  }
  return { total: items.length, real, fake, unclear }
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
    <div class="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-8">
      <NewsHeader :loading="loading" @refresh="() => setQuery(page, perPage, filter)" />

      <div v-if="!error" class="mt-4">
        <div class="py-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div
              class="inline-flex overflow-hidden rounded-2xl ring-1 ring-zinc-200 bg-white shadow-sm"
            >
              <button
                class="h-11 px-6 flex items-center gap-2 text-sm font-medium transition-colors"
                :class="
                  isActive('all') ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                "
                @click="setFilter('all')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>All</span>
              </button>
              <button
                class="h-11 px-6 flex items-center gap-2 text-sm font-medium transition-colors"
                :class="
                  isActive('fake') ? 'bg-amber-600 text-white' : 'text-zinc-700 hover:bg-amber-50'
                "
                @click="setFilter('fake')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 9l6 6M15 9l-6 6" />
                </svg>
                <span>Fake</span>
              </button>
              <button
                class="h-11 px-6 flex items-center gap-2 text-sm font-medium transition-colors"
                :class="
                  isActive('real')
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-700 hover:bg-emerald-50'
                "
                @click="setFilter('real')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.5 2.5L16.5 9" />
                </svg>
                <span>Real</span>
              </button>
            </div>

            <span class="text-zinc-500 text-sm">
              Showing
              <span class="font-medium text-zinc-900">{{ totalForToolbar ? startIndex : 0 }}</span>
              –
              <span class="font-medium text-zinc-900">{{ endIndex }}</span>
              of
              <span class="font-medium text-zinc-900">{{ totalForToolbar }}</span>
              <span v-if="isServerMode" class="text-zinc-400">(server)</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-zinc-700 font-medium text-sm">Per page</label>
            <div class="relative">
              <select
                :value="perPage"
                @change="onChangePerPage(parseInt(($event.target as HTMLSelectElement).value, 10))"
                class="appearance-none h-11 pl-4 pr-9 rounded-xl border border-zinc-300 bg-white text-sm shadow-sm hover:border-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 transition outline-none"
              >
                <option v-for="n in PER_PAGE_OPTIONS" :key="n" :value="n">{{ n }}</option>
              </select>
              <svg
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <p v-if="error" class="mt-4 text-red-600">⚠ {{ error }}</p>

      <div v-if="!loading && !error" class="mt-4">
        <StatsBar
          :total="pageStats.total"
          :real="pageStats.real"
          :fake="pageStats.fake"
          :unclear="pageStats.unclear"
        />
      </div>

      <div v-if="loading" class="grid md:grid-cols-2 gap-6 mt-6">
        <SkeletonCard class="md:col-span-2 h-64" />
        <SkeletonCard v-for="n in 6" :key="n" />
      </div>

      <EmptyState v-else-if="!itemsForGrid || itemsForGrid.length === 0" class="mt-6" />

      <NewsGrid v-else class="mt-6" :items="itemsForGrid" />

      <nav
        v-if="!loading && (totalForToolbar || 0) > 0"
        class="mt-6 flex items-center justify-center gap-2"
      >
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
    </div>
  </div>
</template>
