<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import { useCommentsStore } from '@/stores/comments'
import type { CommentItem, NewsItem } from '@/types'

const props = defineProps<{ item?: NewsItem }>()

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()
const { news, newsAll } = storeToRefs(newsStore)
const commentsStore = useCommentsStore()

const coerceId = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

const routeId = computed(() => coerceId(route.params.id))
const newsId = computed(() => coerceId(props.item?.id ?? routeId.value))

const currentNews = computed<NewsItem | undefined>(() => {
  if (props.item) return props.item
  const pool = [...(newsAll.value ?? []), ...(news.value ?? [])]
  return pool.find((n) => Number(n.id) === newsId.value)
})

onMounted(async () => {
  if (!currentNews.value) {
    await newsStore.ensureAllNews?.()
  }
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
    alert('Invalid URL')
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
function submit() {
  if (!canSubmit.value) return
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
  router.push({ name: 'details', params: { id: keepId } })
}

const delta = computed(
  () => commentsStore.localVoteDeltaByNewsId?.(newsId.value) ?? { real: 0, fake: 0 },
)
const realVotesBase = computed(() => Number(currentNews.value?.realVotes ?? 0) + delta.value.real)
const fakeVotesBase = computed(() => Number(currentNews.value?.fakeVotes ?? 0) + delta.value.fake)

const previewRealVotes = computed(() => realVotesBase.value + (form.value.vote === 'real' ? 1 : 0))
const previewFakeVotes = computed(() => fakeVotesBase.value + (form.value.vote === 'fake' ? 1 : 0))
const previewTotal = computed(() => {
  const t = previewRealVotes.value + previewFakeVotes.value
  return t > 0 ? t : 1
})
const previewRealPct = computed(() => (previewRealVotes.value / previewTotal.value) * 100)

function useTween(target: { value: number }, duration = 350) {
  const v = ref(target.value)
  let raf = 0
  const animate = (to: number) => {
    const from = v.value
    const start = performance.now()
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
  <section class="max-w-3xl mx-auto">
    <h2 class="text-2xl md:text-3xl font-bold mb-6">Vote & Comment</h2>

    <div class="bg-white rounded-2xl shadow border border-zinc-200 p-5 md:p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span class="block text-sm text-zinc-600 mb-1">Voting for</span>
          <p v-if="currentNews" class="font-medium text-zinc-900">
            {{ currentNews.topic }}
          </p>
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

      <div class="pt-2">
        <div class="mb-1 flex justify-between text-xs text-zinc-600">
          <span>Real</span><span>Fake</span>
        </div>

        <div
          class="h-3 rounded-full overflow-hidden ring-1 ring-black/5 grid transition-[grid-template-columns] duration-300 ease-out will-change-[grid-template-columns]"
          :style="{ gridTemplateColumns: `${clampedRealPct}% ${clampedFakePct}%` }"
          role="progressbar"
          :aria-valuenow="clampedRealPct"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Real percentage"
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
</template>
