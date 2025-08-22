<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '@/types'
import { useCommentsStore } from '@/stores/comments'
import CommentList from '@/components/newsDetails/CommentList.vue'
import { majorityLabel, fakePercent } from '@/utils/vote'

const props = defineProps<{ item: NewsItem }>()
const newsId = computed(() => Number(props.item.id))

const commentsStore = useCommentsStore()
const localDelta = computed(
  () => commentsStore.localVoteDeltaByNewsId?.(newsId.value) ?? { real: 0, fake: 0 },
)
const realVotes = computed(() => Number(props.item.realVotes ?? 0) + localDelta.value.real)
const fakeVotes = computed(() => Number(props.item.fakeVotes ?? 0) + localDelta.value.fake)

const realPct = computed(() => 100 - fakePercent(fakeVotes.value, realVotes.value))
const fakePct = computed(() => 100 - realPct.value)
const verdict = computed(
  () => majorityLabel(fakeVotes.value, realVotes.value) as 'Fake' | 'Real' | 'Unclear',
)
const hasVotes = computed(() => realVotes.value + fakeVotes.value > 0)

function formatFullDateTime(dateTimeStr: string) {
  const d = new Date(dateTimeStr)
  const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${datePart} • ${timePart}`
}

const verdictBadgeClass = computed(() => {
  const base =
    'inline-flex items-center justify-center rounded-full ring-1 ring-offset-2 ring-offset-white shadow-sm w-14 h-14 md:w-16 md:h-16 transition-colors'
  if (!hasVotes.value) return `${base} bg-zinc-100 text-zinc-500 ring-zinc-300`
  if (verdict.value === 'Real') return `${base} bg-emerald-600 text-white ring-emerald-700/60`
  if (verdict.value === 'Fake') return `${base} bg-amber-500 text-white ring-amber-700/60`
  return `${base} bg-zinc-100 text-zinc-500 ring-zinc-300`
})
</script>

<template>
  <div class="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10 py-6">
    <article
      class="relative bg-white/70 backdrop-blur rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden divide-y divide-zinc-100"
    >
      <!-- Header -->
      <section class="px-6 lg:px-10 pt-8 pb-6">
        <header>
          <h1
            class="text-[clamp(34px,4.4vw,64px)] leading-tight font-extrabold tracking-tight text-zinc-900"
          >
            {{ props.item.topic }}
          </h1>

          <div class="mt-3 flex flex-wrap items-center gap-3 text-[15px] text-zinc-600">
            <span class="font-medium text-zinc-900">{{ props.item.reporter }}</span>
            <span aria-hidden="true">•</span>
            <time :datetime="props.item.dateTime">{{
              formatFullDateTime(props.item.dateTime)
            }}</time>

            <!-- badge เมื่อไม่มีรูป (ใส่ไอคอนแล้ว) -->
            <span v-if="!props.item.imageUrl" :class="['ml-auto', verdictBadgeClass]" role="status">
              <svg
                v-if="hasVotes && verdict === 'Real'"
                class="w-8 h-8 md:w-9 md:h-9"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else-if="hasVotes && verdict === 'Fake'"
                class="w-8 h-8 md:w-9 md:h-9"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg v-else class="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>
              </svg>
              <span class="sr-only">{{ hasVotes ? verdict : 'No votes yet' }}</span>
            </span>
          </div>
        </header>

        <figure v-if="props.item.imageUrl" class="mt-6">
          <div
            class="relative rounded-2xl md:rounded-3xl ring-1 ring-black/5 shadow-sm overflow-hidden"
          >
            <img :src="props.item.imageUrl" alt="" class="w-full object-cover" />
            <div class="absolute top-3 right-3 md:top-4 md:right-4 z-10">
              <!-- badge บนรูป (ใส่ไอคอนแล้ว) -->
              <span :class="verdictBadgeClass" role="status">
                <svg
                  v-if="hasVotes && verdict === 'Real'"
                  class="w-8 h-8 md:w-9 md:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  v-else-if="hasVotes && verdict === 'Fake'"
                  class="w-8 h-8 md:w-9 md:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg v-else class="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                  <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">
                    ?
                  </text>
                </svg>
                <span class="sr-only">{{ hasVotes ? verdict : 'No votes yet' }}</span>
              </span>
            </div>
          </div>
        </figure>
      </section>

      <!-- Body -->
      <section class="px-6 lg:px-10 py-6">
        <div class="mx-auto max-w-4xl xl:max-w-5xl">
          <p class="text-[17px] md:text-xl text-zinc-700 leading-relaxed">
            {{ props.item.shortDetail }}
          </p>
          <div
            class="prose prose-zinc max-w-none prose-headings:tracking-tight prose-p:leading-relaxed mt-6"
            v-html="props.item.fullDetail"
          />
        </div>
      </section>

      <!-- Stats + CTA -->
      <section class="px-6 lg:px-10 py-6">
        <div class="mx-auto max-w-4xl xl:max-w-5xl">
          <div class="mb-3 grid grid-cols-2 select-none">
            <span
              class="justify-self-start inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-sm md:text-base font-semibold ring-1 bg-zinc-100 text-zinc-700 ring-zinc-200"
            >
              Real · {{ Math.round(realPct) }}%
            </span>
            <span
              class="justify-self-end inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-sm md:text-base font-semibold ring-1 bg-zinc-100 text-zinc-700 ring-zinc-200"
            >
              Fake · {{ Math.round(fakePct) }}%
            </span>
          </div>

          <div
            class="h-5 md:h-6 rounded-full bg-zinc-100 overflow-hidden ring-1 ring-black/5 grid"
            :style="{ gridTemplateColumns: `${Math.round(realPct)}% ${Math.round(fakePct)}%` }"
            aria-label="Real/Fake ratio"
          >
            <div class="bg-emerald-500"></div>
            <div class="bg-amber-500"></div>
          </div>

          <div class="mt-3 flex justify-between text-sm md:text-base text-zinc-700">
            <span class="font-medium">Real: {{ Math.round(realPct) }}% ({{ realVotes }})</span>
            <span class="font-medium">Fake: {{ Math.round(fakePct) }}% ({{ fakeVotes }})</span>
          </div>

          <!-- Vote now ใต้หลอดสถานะ -->
          <div class="mt-6 flex justify-center">
            <router-link
              :to="{ name: 'details-vote', params: { id: newsId } }"
              class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 md:px-6 md:py-3 bg-emerald-600 text-white ring-1 ring-emerald-700/50 shadow hover:opacity-95 transition"
            >
              Vote now →
            </router-link>
          </div>
        </div>
      </section>

      <CommentList :news-id="newsId" :page-size="5" :embedded="true" />
    </article>
  </div>
</template>
