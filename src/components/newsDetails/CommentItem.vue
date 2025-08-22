<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { CommentItem } from '@/types'

const props = defineProps<{ comment: CommentItem }>()

const initials = computed(() => (props.comment.user?.trim()?.[0] ?? 'U').toUpperCase())

const formattedTime = computed(() =>
  props.comment.createdAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(props.comment.createdAt),
      )
    : '',
)

const images = computed(() => props.comment.attachments ?? [])
const hasImages = computed(() => images.value.length > 0)

const isLightboxOpen = ref(false)
const currentIndex = ref(0)

function openLightbox(i: number) {
  if (!images.value.length) return
  currentIndex.value = i
  isLightboxOpen.value = true
}
function closeLightbox() {
  isLightboxOpen.value = false
}
function next() {
  if (!images.value.length) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}
function prev() {
  if (!images.value.length) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

watch(isLightboxOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

function onKey(e: KeyboardEvent) {
  if (!isLightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const votePillClass = computed(() =>
  props.comment.vote === 'real'
    ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
    : 'bg-amber-100 text-amber-800 ring-amber-200',
)
const voteLabel = computed(() => (props.comment.vote === 'real' ? 'REAL' : 'FAKE'))
</script>

<template>
  <li>
    <article
      class="w-full flex gap-4 items-start rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm hover:shadow transition-shadow"
    >
      <div
        class="shrink-0 grid place-items-center size-11 rounded-full bg-zinc-100 text-zinc-700 font-semibold ring-1 ring-inset ring-zinc-200"
        :aria-label="`Avatar of ${comment.user}`"
      >
        {{ initials }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start gap-3">
          <div class="min-w-0">
            <div
              class="text-[15px] md:text-base font-semibold tracking-tight text-zinc-900 truncate"
            >
              {{ comment.user }}
            </div>
            <div v-if="formattedTime" class="text-[11px] text-zinc-500 mt-0.5">
              {{ formattedTime }}
            </div>
          </div>

          <span
            class="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold ring-1 select-none"
            :class="votePillClass"
            aria-label="Vote result"
            title="Vote result"
          >
            <span
              class="inline-block size-1.5 rounded-full"
              :class="comment.vote === 'real' ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            {{ voteLabel }}
          </span>
        </div>

        <p class="mt-3 text-[15px] leading-relaxed text-zinc-700 whitespace-pre-line">
          {{ comment.comment }}
        </p>

        <div v-if="hasImages" class="mt-3 border-t border-zinc-200/70"></div>

        <div v-if="hasImages" class="mt-3">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <button
              v-for="(src, i) in images"
              :key="i"
              type="button"
              class="group relative w-full aspect-video rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 ring-0 hover:ring-1 hover:ring-zinc-300"
              @click="openLightbox(i)"
              title="Tap to view"
            >
              <img
                :src="src"
                class="h-full w-full object-cover transition group-hover:opacity-90"
                loading="lazy"
                alt=""
              />
            </button>
          </div>
        </div>
      </div>
    </article>

    <teleport to="body">
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
        @click="closeLightbox"
      >
        <div class="relative max-w-[92vw] max-h-[86vh]" @click.stop>
          <img
            :src="images[currentIndex]"
            class="block max-w-[92vw] max-h-[86vh] w-auto h-auto object-contain rounded-2xl ring-1 ring-zinc-700/60 bg-black/10"
            alt=""
          />

          <button
            class="absolute -top-11 right-0 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium"
            @click="closeLightbox"
            aria-label="Close"
            title="Close (Esc)"
          >
            Close
          </button>

          <button
            v-if="images.length > 1"
            class="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-10 size-9 rounded-full bg-white/15 hover:bg-white/25 text-white"
            @click="prev"
            aria-label="Previous"
            title="Previous (←)"
          >
            ‹
          </button>
          <button
            v-if="images.length > 1"
            class="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-10 size-9 rounded-full bg-white/15 hover:bg-white/25 text-white"
            @click="next"
            aria-label="Next"
            title="Next (→)"
          >
            ›
          </button>

          <div
            v-if="images.length > 1"
            class="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/80"
          >
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </div>
    </teleport>
  </li>
</template>
