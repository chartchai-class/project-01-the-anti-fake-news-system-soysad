<!-- src/components/newsDetails/CommentItem.vue -->
<script setup lang="ts">
import type { CommentItem } from '@/types'
const props = defineProps<{ comment: CommentItem }>()
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

      <!-- Content -->
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
      </div>
    </article>
  </li>
</template>
