<!-- src/components/newsDetails/CommentItem.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { CommentItem } from '@/types'

const props = defineProps<{ comment: CommentItem }>()

// --- Lightbox state ---
const isLightboxOpen = ref(false)
const currentIndex = ref(0)

const images = () => props.comment.attachments ?? []

function openLightbox(i: number) {
  if (!images().length) return
  currentIndex.value = i
  isLightboxOpen.value = true
}
function closeLightbox() {
  isLightboxOpen.value = false
}
function next() {
  if (!images().length) return
  currentIndex.value = (currentIndex.value + 1) % images().length
}
function prev() {
  if (!images().length) return
  currentIndex.value =
    (currentIndex.value - 1 + images().length) % images().length
}

// ปิด/เปิดสครอลของหน้าเมื่อ Lightbox เปิด
watch(isLightboxOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

// ปิดด้วย Esc + เลื่อนรูปด้วย ← →
function onKey(e: KeyboardEvent) {
  if (!isLightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <li>
    <article
      class="w-full flex gap-4 items-start bg-white shadow-lg rounded-xl p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-200"
    >
      <!-- Avatar -->
      <div
        class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 grid place-items-center font-bold text-white text-lg shadow-md"
      >
        {{ (comment.user?.[0] || 'U').toUpperCase() }}
      </div>

      <div class="flex-1 min-w-0">
        <header class="flex items-center gap-2 text-sm">
          <span class="font-semibold text-gray-800">{{ comment.user }}</span>
          <span class="text-gray-400">•</span>
          <span
            class="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
            :class="comment.vote === 'real' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ comment.vote }}
          </span>
        </header>

        <p class="mt-2 text-gray-700 whitespace-pre-line leading-relaxed">
          {{ comment.comment }}
        </p>

        <!-- Attachments -->
        <div v-if="comment.attachments?.length" class="mt-4">
          <p class="text-sm text-gray-500 mb-2 font-medium">
            Attachments ({{ comment.attachments.length }})
          </p>

          <!-- thumbnails: กล่องคงที่ + object-contain -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="(src, i) in comment.attachments"
              :key="i"
              type="button"
              class="group w-full h-40 bg-gray-50 border rounded-lg grid place-items-center overflow-hidden"
              @click="openLightbox(i)"
              title="Click to zoom"
            >
              <img
                :src="src"
                class="max-h-full max-w-full object-contain transition group-hover:opacity-90"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
            </button>
          </div>
          
        </div>
      </div>
    </article>

    <!-- Lightbox -->
    <teleport to="body">
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        @click="closeLightbox"
      >
        <!-- กล่องรูป -->
        <div
          class="relative max-w-[90vw] max-h-[85vh] w-auto h-auto"
          @click.stop
        >
          <!-- รูปใหญ่: ไม่ครอป พอดีจอ -->
          <img
            :src="images()[currentIndex]"
            class="block max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            alt=""
          />

          <!-- ปุ่มปิด -->
          <button
            class="absolute -top-10 right-0 text-white/90 hover:text-white text-xl"
            @click="closeLightbox"
            aria-label="Close"
            title="Close (Esc)"
          >
            ✕
          </button>

          <!-- ปุ่มเลื่อนซ้าย/ขวา -->
          <button
            v-if="images().length > 1"
            class="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white grid place-items-center text-lg"
            @click="prev"
            aria-label="Previous"
            title="Previous (←)"
          >
            ‹
          </button>
          <button
            v-if="images().length > 1"
            class="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white grid place-items-center text-lg"
            @click="next"
            aria-label="Next"
            title="Next (→)"
          >
            ›
          </button>

          <!-- ดัชนีรูป -->
          <div
            v-if="images().length > 1"
            class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-xs"
          >
            {{ currentIndex + 1 }} / {{ images().length }}
          </div>
        </div>
      </div>
    </teleport>
  </li>
</template>
