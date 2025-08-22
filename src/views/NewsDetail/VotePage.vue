<!-- VotePage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import { useCommentsStore } from '@/stores/comments'
import type { CommentItem, NewsItem } from '@/types'
import CommentList from '@/components/newsDetails/CommentList.vue'

const route = useRoute()
const newsStore = useNewsStore()
const { news, newsAll } = storeToRefs(newsStore)
const commentsStore = useCommentsStore()

const coerce = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}
const newsId = computed(() => coerce(route.params.id))

const currentNews = computed<NewsItem | undefined>(() => {
  const pool = [...(newsAll.value ?? []), ...(news.value ?? [])]
  return pool.find((n) => Number(n.id) === newsId.value)
})
onMounted(async () => {
  if (!currentNews.value) await newsStore.ensureAllNews?.()
})

const form = ref({
  newsId: newsId.value,
  user: '',
  vote: 'real' as 'real' | 'fake',
  comment: '',
  attachments: [] as string[],
})
watch(newsId, (n) => (form.value.newsId = n))

const urlInput = ref('')
function onPickAttachments(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  Promise.all(
    files.map(
      (f) =>
        new Promise<string>((res) => {
          const r = new FileReader()
          r.onload = () => res(String(r.result))
          r.readAsDataURL(f)
        }),
    ),
  ).then((urls) => form.value.attachments.push(...urls))
  ;(e.target as HTMLInputElement).value = ''
}
function addUrlAttachment() {
  try {
    const u = new URL(urlInput.value.trim())
    form.value.attachments.push(u.toString())
    urlInput.value = ''
  } catch {
    showFlash('Invalid URL', 'error')
  }
}
function removeAttachment(i: number) {
  form.value.attachments.splice(i, 1)
}

function setVote(v: 'real' | 'fake') {
  form.value.vote = v
}
function onCardKey(e: KeyboardEvent, v: 'real' | 'fake') {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    setVote(v)
  }
}

const canSubmit = computed(
  () => form.value.newsId > 0 && !!form.value.user.trim() && !!form.value.comment.trim(),
)

type FlashType = 'success' | 'error'
const flash = ref<{ show: boolean; type: FlashType; text: string }>({
  show: false,
  type: 'success',
  text: '',
})
const flashKey = ref(0)
let flashTimer: number | null = null

function showFlash(text: string, type: FlashType = 'success', ms = 3200) {
  flash.value = { show: true, type, text }
  flashKey.value++
  if (flashTimer) window.clearTimeout(flashTimer)
  flashTimer = window.setTimeout(() => (flash.value.show = false), ms)
}
function closeFlash() {
  flash.value.show = false
  if (flashTimer) window.clearTimeout(flashTimer)
}
onUnmounted(() => {
  if (flashTimer) window.clearTimeout(flashTimer)
})
/* --------------------------------------------------------------- */

function submit() {
  if (!canSubmit.value || !currentNews.value) {
    showFlash('Please fill your name and comment', 'error')
    return
  }
  const payload: Omit<CommentItem, 'id'> = {
    newsId: form.value.newsId,
    user: form.value.user.trim(),
    vote: form.value.vote,
    comment: form.value.comment.trim(),
    attachments: form.value.attachments,
    createdAt: new Date().toISOString(),
  }
  commentsStore.addLocal(payload)

  const keepId = form.value.newsId
  form.value = { newsId: keepId, user: '', vote: 'real', comment: '', attachments: [] }

  showFlash('Thanks! Your vote was submitted.', 'success')
}

// live preview
const delta = computed(
  () => commentsStore.localVoteDeltaByNewsId?.(newsId.value) ?? { real: 0, fake: 0 },
)
const realVotesBase = computed(() => Number(currentNews.value?.realVotes ?? 0) + delta.value.real)
const fakeVotesBase = computed(() => Number(currentNews.value?.fakeVotes ?? 0) + delta.value.fake)
const previewRealVotes = computed(() => realVotesBase.value + (form.value.vote === 'real' ? 1 : 0))
const previewFakeVotes = computed(() => fakeVotesBase.value + (form.value.vote === 'fake' ? 1 : 0))
const previewTotal = computed(() => Math.max(1, previewRealVotes.value + previewFakeVotes.value))
const previewRealPct = computed(() => (previewRealVotes.value / previewTotal.value) * 100)

function useTween(target: { value: number }, duration = 380) {
  const v = ref(target.value)
  let raf = 0
  const animate = (to: number) => {
    const from = v.value,
      start = performance.now()
    cancelAnimationFrame(raf)
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      v.value = from + ((to - from) * (1 - Math.cos(Math.PI * t))) / 2
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }
  const stop = () => cancelAnimationFrame(raf)
  watch(
    () => target.value,
    (to) => animate(to),
    { immediate: true },
  )
  onUnmounted(stop)
  return v
}
const tweenRealPct = useTween(previewRealPct, 380)
const tweenRealVotes = useTween(previewRealVotes, 380)
const tweenFakeVotes = useTween(previewFakeVotes, 380)
const tweenFakePct = computed(() => 100 - tweenRealPct.value)
const clampedRealPct = computed(() => Math.max(0, Math.min(100, Math.round(tweenRealPct.value))))
const clampedFakePct = computed(() => Math.max(0, Math.min(100, Math.round(tweenFakePct.value))))
</script>

<template>
  <div class="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10 py-6">
    <article
      class="relative bg-white/70 backdrop-blur rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden divide-y divide-zinc-100"
    >
      <section class="px-6 lg:px-10 py-8">
        <div class="mx-auto max-w-4xl xl:max-w-5xl space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="block text-sm text-zinc-600 mb-1">Voting for</span>
              <p v-if="currentNews" class="font-medium text-zinc-900">{{ currentNews.topic }}</p>
              <p v-else class="text-red-500 text-sm">News not found.</p>
            </div>

            <label class="block">
              <span class="text-sm text-zinc-600">Your name</span>
              <input
                v-model.trim="form.user"
                type="text"
                class="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </label>
          </div>

          <div
            role="radiogroup"
            aria-label="Choose your vote"
            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div
              role="radio"
              :aria-checked="form.vote === 'real'"
              tabindex="0"
              @click="setVote('real')"
              @keydown="onCardKey($event, 'real')"
              class="rounded-2xl p-5 ring-2 transition cursor-pointer select-none"
              :class="
                form.vote === 'real'
                  ? 'ring-emerald-500/70 bg-emerald-50/60 shadow-sm'
                  : 'ring-zinc-200 hover:ring-emerald-300/70 hover:bg-emerald-50/30'
              "
            >
              <div class="text-lg font-semibold tracking-tight text-zinc-900">Vote Real</div>
              <div class="text-sm text-zinc-500">Appears likely true</div>
            </div>

            <div
              role="radio"
              :aria-checked="form.vote === 'fake'"
              tabindex="0"
              @click="setVote('fake')"
              @keydown="onCardKey($event, 'fake')"
              class="rounded-2xl p-5 ring-2 transition cursor-pointer select-none"
              :class="
                form.vote === 'fake'
                  ? 'ring-amber-500/70 bg-amber-50/60 shadow-sm'
                  : 'ring-zinc-200 hover:ring-amber-300/70 hover:bg-amber-50/30'
              "
            >
              <div class="text-lg font-semibold tracking-tight text-zinc-900">Vote Fake</div>
              <div class="text-sm text-zinc-500">Appears likely false</div>
            </div>
          </div>

          <label class="block">
            <span class="text-sm text-zinc-600">Comment</span>
            <textarea
              v-model.trim="form.comment"
              rows="4"
              class="mt-1 w-full border border-zinc-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="Share your reasoning…"
            />
          </label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="block">
              <span class="text-sm text-zinc-600">Attach images (files)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="onPickAttachments"
                class="mt-1 block w-full text-sm"
              />
            </label>

            <label class="block">
              <span class="text-sm text-zinc-600">Attach image by URL</span>
              <div class="mt-1 flex gap-2">
                <input
                  v-model="urlInput"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="flex-1 border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
                <button
                  type="button"
                  @click="addUrlAttachment"
                  class="px-3 py-2 rounded-lg border bg-zinc-50 hover:bg-zinc-100"
                >
                  Add URL
                </button>
              </div>
            </label>
          </div>

          <div v-if="form.attachments.length" class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="(src, i) in form.attachments" :key="i" class="relative group">
              <img :src="src" class="w-full h-28 object-cover rounded-lg border" />
              <button
                type="button"
                @click="removeAttachment(i)"
                class="absolute top-1 right-1 text-xs px-2 py-0.5 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
              >
                Remove
              </button>
            </div>
          </div>

          <!-- Live preview -->
          <div class="pt-2">
            <div class="mb-1 flex justify-between text-xs text-zinc-600">
              <span>Real</span><span>Fake</span>
            </div>
            <div
              class="h-3 rounded-full overflow-hidden ring-1 ring-black/5 grid transition-[grid-template-columns] duration-300 ease-out"
              :style="{ gridTemplateColumns: `${clampedRealPct}% ${clampedFakePct}%` }"
              role="progressbar"
              :aria-valuenow="clampedRealPct"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div class="bg-emerald-500"></div>
              <div class="bg-amber-500"></div>
            </div>
            <div class="mt-1.5 flex justify-between text-xs text-zinc-600">
              <span>Real: {{ Math.round(tweenRealPct) }}% ({{ Math.round(tweenRealVotes) }})</span>
              <span>Fake: {{ Math.round(tweenFakePct) }}% ({{ Math.round(tweenFakeVotes) }})</span>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="submit"
              :disabled="!canSubmit || !currentNews"
              class="px-4 py-2 rounded-xl bg-zinc-900 text-white disabled:opacity-40 hover:bg-black transition"
            >
              Submit vote
            </button>
          </div>
        </div>
      </section>

      <CommentList :news-id="newsId" :page-size="5" :embedded="true" />
    </article>

    <div
      class="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 transition-all duration-300 pointer-events-none"
      :class="flash.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      role="status"
      aria-live="polite"
    >
      <div
        :key="flashKey"
        class="pointer-events-auto pop-in flex items-center gap-4 md:gap-5 rounded-3xl px-5 py-4 md:px-6 md:py-5 shadow-2xl ring-1 ring-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      >
        <span
          class="ring-pop relative inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full text-white ring-2"
          :class="
            flash.type === 'success'
              ? 'bg-emerald-600 ring-emerald-400/60'
              : 'bg-rose-600 ring-rose-400/60'
          "
          aria-hidden="true"
        >
          <svg
            v-if="flash.type === 'success'"
            :key="'ok-' + flashKey"
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 md:h-8 md:w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              class="tick"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6.5 12.5l3.2 3.2L17.5 8.9"
            />
          </svg>

          <svg
            v-else
            :key="'err-' + flashKey"
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 md:h-8 md:w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              class="tick"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M8 8l8 8m0-8l-8 8"
            />
          </svg>
        </span>

        <p class="text-base md:text-lg font-semibold text-zinc-900">
          {{ flash.text }}
        </p>

        <button
          class="ml-1 rounded-md px-2 py-1 text-sm md:text-base text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          @click="closeFlash"
          aria-label="Dismiss notification"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
