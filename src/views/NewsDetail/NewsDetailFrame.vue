<!-- NewsDetailFrame.vue -->
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import SkeletonCard from '@/components/newsDetails/SkeletonDetail.vue'

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()
const { news, newsAll, loading, error } = storeToRefs(newsStore)

const resolving = ref(false)
const idNum = computed(() => {
  const n = Number(route.params.id)
  return Number.isFinite(n) ? n : null
})

const item = computed(() => {
  const id = idNum.value
  if (!id) return null
  const pool = [...(newsAll.value ?? []), ...(news.value ?? [])]
  return pool.find((n) => Number(n.id) === id) ?? null
})

async function ensureItem() {
  if (!idNum.value) return
  if (item.value) return
  resolving.value = true
  try {
    await newsStore.ensureAllNews?.()
  } finally {
    resolving.value = false
  }
}
onMounted(ensureItem)
watch(idNum, ensureItem)

const isDetail = computed(() => route.name === 'details-detail')
const isVote = computed(() => route.name === 'details-vote')

function goHome() {
  router.push({ name: 'home' })
}
function goDetail() {
  if (idNum.value) router.push({ name: 'details-detail', params: { id: idNum.value } })
}
function goVote() {
  if (idNum.value) router.push({ name: 'details-vote', params: { id: idNum.value } })
}
</script>

<template>
  <div class="min-h-screen antialiased">
    <div class="mx-auto max-w-7xl px-2 sm:px-3 md:px-4 py-6">
      <!-- Back (ไม่ sticky) -->
      <div class="mb-3">
        <button
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg ring-1 ring-zinc-300 text-zinc-900 hover:bg-zinc-50"
          @click="goHome"
        >
          ← Back
        </button>
      </div>

      <!-- Toggle: โปร่งใส + ไอคอน (sticky ใต้ navbar) -->
      <!-- ปรับความสูง navbar ได้ที่ --nav-h -->
      <div
        class="sticky z-40 top-[calc(var(--nav-h)+8px)] mb-6 flex justify-center"
        style="--nav-h: 64px"
      >
        <nav
          role="tablist"
          aria-label="Article view switcher"
          class="relative isolate w-full max-w-xl select-none"
        >
          <!-- กล่องแม่: โปร่งใส + blur เล็ก + เส้นขอบบาง -->
          <div
            class="relative rounded-2xl p-1 ring-1 ring-zinc-300 shadow-sm bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30"
          >
            <!-- สไลเดอร์ (ทึบไม่โปร่ง เพื่อไม่ให้ตัวหนังสือกลืน) -->
            <span
              class="pointer-events-none absolute top-1 bottom-1 left-1 rounded-xl shadow transition-transform duration-300 ease-out will-change-transform"
              :style="{ width: 'calc((100% - 0.5rem) / 2)' }"
              :class="isVote ? 'translate-x-full bg-emerald-600' : 'translate-x-0 bg-zinc-900'"
              aria-hidden="true"
            ></span>

            <!-- ปุ่ม 2 ช่อง + ไอคอน (อยู่ชั้นบนสุด) -->
            <div class="relative z-10 grid grid-cols-2 gap-2">
              <!-- Detail -->
              <button
                role="tab"
                :aria-selected="isDetail"
                :aria-pressed="isDetail"
                :aria-current="isDetail ? 'page' : undefined"
                class="h-11 md:h-12 rounded-xl px-4 md:px-5 text-sm md:text-base font-semibold leading-none tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 inline-flex items-center justify-center gap-2"
                :class="isDetail ? 'text-white' : 'text-zinc-800 hover:text-zinc-900'"
                @click="goDetail"
              >
                <!-- icon: document-text -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 9h8M8 13h8M8 17h5M6 4h7.586a2 2 0 011.414.586L19.414 8A2 2 0 0120 9.414V20a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
                <span>Detail</span>
              </button>

              <!-- Vote -->
              <button
                role="tab"
                :aria-selected="isVote"
                :aria-pressed="isVote"
                :aria-current="isVote ? 'page' : undefined"
                class="h-11 md:h-12 rounded-xl px-4 md:px-5 text-sm md:text-base font-semibold leading-none tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 inline-flex items-center justify-center gap-2"
                :class="isVote ? 'text-white' : 'text-zinc-800 hover:text-zinc-900'"
                @click="goVote"
              >
                <!-- icon: check-circle (outline, currentColor) -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9 12.75l1.5 1.5L15 10.5"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Vote</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <!-- States -->
      <div v-if="loading || resolving" class="rounded-2xl border border-zinc-200 p-6 bg-white">
        <SkeletonCard />
      </div>
      <p v-else-if="error" class="text-red-600">⚠ {{ error }}</p>
      <p v-else-if="!item" class="text-zinc-600">Article not found.</p>

      <!-- Child panels -->
      <router-view v-else v-slot="{ Component }">
        <component :is="Component" :item="item" />
      </router-view>
    </div>
  </div>
</template>
