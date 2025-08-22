<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '@/types'
import { majorityLabel } from '@/utils/vote'

const props = withDefaults(defineProps<{ item: NewsItem; reverse?: boolean }>(), {
  reverse: false,
})

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
  <router-link :to="`/details/${props.item.id}`" class="block h-full">
    <article
      class="group isolate relative rounded-2xl ring-1 ring-black/5 bg-white shadow-sm overflow-hidden md:grid md:grid-cols-12 md:items-stretch hover:-translate-y-0.5 hover:shadow-md transition h-full md:h-[220px] lg:h-[450px]"
    >
      <!-- Media -->
      <figure
        class="relative col-span-12 md:col-span-7 order-1 md:order-[var(--m-order,1)] h-48 sm:h-56 md:h-full bg-zinc-100 overflow-hidden"
        :style="props.reverse ? '--m-order:2' : ''"
      >
        <img
          v-if="props.item.imageUrl"
          :src="props.item.imageUrl"
          :alt="props.item.topic"
          class="block w-full h-full object-cover"
        />
        <span
          class="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 shadow-lg select-none"
          :class="badgeTone"
        >
          {{ status }}
        </span>
      </figure>

      <!-- Content -->
      <div
        class="relative z-[1] col-span-12 md:col-span-5 order-2 md:order-[var(--c-order,2)] p-4 md:p-5 flex flex-col min-h-0 md:h-full bg-white"
        :style="props.reverse ? '--c-order:1' : ''"
      >
        <p class="text-[11px] text-zinc-500 line-clamp-1">
          {{ props.item.reporter }} · {{ new Date(props.item.dateTime).toLocaleDateString() }}
        </p>

        <h2 class="mt-1 text-lg md:text-xl font-semibold leading-tight line-clamp-2">
          {{ props.item.topic }}
        </h2>

        <p class="mt-1 text-zinc-600 text-[14px] leading-snug line-clamp-2">
          {{ props.item.shortDetail }}
        </p>

        <div class="mt-auto pt-3 border-t border-zinc-100">
          <div class="flex items-center justify-between text-[11px]">
            <span
              class="inline-flex items-center rounded-md px-2 py-0.5 ring-1"
              :class="realLabelClass"
              >Real</span
            >
            <span
              class="inline-flex items-center rounded-md px-2 py-0.5 ring-1"
              :class="fakeLabelClass"
              >Fake</span
            >
          </div>

          <div
            class="relative z-[1] mt-3 h-2.5 md:h-3 rounded-full bg-zinc-200 shadow-inner ring-1 ring-black/5 overflow-hidden flex"
            role="progressbar"
            :aria-valuenow="realPct"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Real/Fake ratio"
          >
            <div
              class="h-full transition-all duration-300 ease-out"
              :class="realBarClass"
              :style="{ width: realPct + '%' }"
            />
            <div
              class="h-full transition-all duration-300 ease-out"
              :class="fakeBarClass"
              :style="{ width: fakePct + '%' }"
            />
          </div>
        </div>
      </div>
    </article>
  </router-link>
</template>
