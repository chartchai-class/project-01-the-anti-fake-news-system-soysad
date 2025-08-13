<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '@/types'
import { majorityLabel } from '@/utils/vote'

const props = defineProps<{ item: NewsItem }>()

const status = computed(
  () => majorityLabel(props.item.fakeVotes, props.item.realVotes) as 'Fake' | 'Real' | 'Unclear',
)
const total = computed(() => Math.max(1, props.item.fakeVotes + props.item.realVotes))
const fakePct = computed(() => Math.round((props.item.fakeVotes / total.value) * 100))
const realPct = computed(() => 100 - fakePct.value)

const winner = computed<'fake' | 'real' | 'tie'>(() => {
  if (fakePct.value > realPct.value) return 'fake'
  if (realPct.value > fakePct.value) return 'real'
  return 'tie'
})

const badgeTone = computed(() => {
  if (status.value === 'Fake') return 'bg-amber-500 text-zinc-900 ring-amber-700/40'
  if (status.value === 'Real') return 'bg-emerald-600 text-white ring-emerald-700/60'
  return 'bg-zinc-700 text-white ring-zinc-800/60'
})

/* ซ้าย Real, ขวา Fake */
const realLabelClass = computed(() =>
  winner.value === 'real' ? 'bg-emerald-600 text-white ring-emerald-700/60' : 'text-zinc-500',
)
const fakeLabelClass = computed(() =>
  winner.value === 'fake' ? 'bg-amber-600 text-white ring-amber-700/60' : 'text-zinc-500',
)

const realBarClass = computed(() => (winner.value === 'real' ? 'bg-emerald-500' : 'bg-zinc-200'))
const fakeBarClass = computed(() => (winner.value === 'fake' ? 'bg-amber-500' : 'bg-zinc-200'))
</script>

<template>
  <router-link :to="`/details/${props.item.id}`" class="block hover:shadow-lg transition-shadow">
    <article
      class="h-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col"
    >
      <div class="relative">
        <img
          v-if="props.item.imageUrl"
          :src="props.item.imageUrl"
          class="w-full aspect-video object-cover"
          alt=""
        />
        <span
          class="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium ring-1 shadow select-none"
          :class="badgeTone"
        >
          <svg
            v-if="status === 'Real'"
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.5 2.5L16.5 9" />
          </svg>
          <svg
            v-else-if="status === 'Fake'"
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8" />
          </svg>
          <span class="tracking-tight">{{ status }}</span>
        </span>
      </div>

      <div class="p-5 flex flex-col grow">
        <h3 class="text-lg font-semibold leading-snug line-clamp-2">{{ props.item.topic }}</h3>
        <p class="mt-1 text-sm text-zinc-600 line-clamp-2">{{ props.item.shortDetail }}</p>

        <div class="mt-3 flex items-center gap-3 text-xs text-zinc-500">
          <span>{{ props.item.reporter }}</span
          ><span>•</span>
          <span>{{ new Date(props.item.dateTime).toLocaleDateString() }}</span>
        </div>

        <div class="mt-auto pt-3 border-t border-zinc-100">
          <div class="flex items-center justify-between text-[11px]">
            <span
              class="inline-flex items-center rounded-md px-2 py-0.5 ring-1 transition-colors"
              :class="realLabelClass"
              >Real</span
            >
            <span
              class="inline-flex items-center rounded-md px-2 py-0.5 ring-1 transition-colors"
              :class="fakeLabelClass"
              >Fake</span
            >
          </div>

          <div
            class="mt-2 h-2 rounded-full overflow-hidden ring-1 ring-black/5 grid"
            :style="{ gridTemplateColumns: `${realPct}% ${fakePct}%` }"
            aria-label="Real/Fake ratio"
          >
            <div
              class="relative group cursor-help transition-colors"
              :class="realBarClass"
              tabindex="0"
            >
              <div
                class="pointer-events-none absolute -top-8 left-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition bg-zinc-900 text-white text-[11px] px-2 py-1 rounded-md shadow"
              >
                Real {{ realPct }}% ({{ props.item.realVotes }} / {{ total }})
              </div>
            </div>
            <div
              class="relative group cursor-help transition-colors"
              :class="fakeBarClass"
              tabindex="0"
            >
              <div
                class="pointer-events-none absolute -top-8 right-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition bg-zinc-900 text-white text-[11px] px-2 py-1 rounded-md shadow"
              >
                Fake {{ fakePct }}% ({{ props.item.fakeVotes }} / {{ total }})
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </router-link>
</template>
