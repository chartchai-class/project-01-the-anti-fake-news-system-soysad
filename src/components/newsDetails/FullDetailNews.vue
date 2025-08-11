<script setup lang="ts">
import type { NewsItem } from '@/types'
import { computed } from 'vue'
import { fakePercent, majorityLabel } from '@/utils/vote'
const { item } = defineProps<{ item: NewsItem }>()

const fakeVotes = computed(() => Number((item as any).fakeVotes ?? 0))
const realVotes = computed(() => Number((item as any).realVotes ?? 0))

const fakePct  = computed(() => fakePercent(fakeVotes.value, realVotes.value))
const realPct  = computed(() => 100 - fakePct.value)
const verdict  = computed(() => majorityLabel(fakeVotes.value, realVotes.value))

const verdictClass = computed(() => {
  const total = fakeVotes.value + realVotes.value
  if (!total) return 'bg-gray-100 text-gray-700 border-gray-200'
  if (verdict.value === 'Real') return 'bg-green-100 text-green-800 border-green-200'
  if (verdict.value === 'Fake') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-amber-100 text-amber-800 border-amber-200'
})
</script>

<template>
    
  <article class="max-w-5xl mx-auto px-4 py-10 pb-2">
    
    <!-- Topic -->
    <h1 class="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
      {{ item.topic }}
    </h1>
    
    <!-- ✅ Verdict + Progress ใต้หัวข้อ -->
    <section class="mb-6">
      <div class="flex items-center gap-2 mb-2">       
        <span class="px-2 py-0.5 rounded-full text-s font-semibold border" :class="verdictClass">
          {{ verdict }}
          <template v-if="fakeVotes + realVotes > 0">
            • {{ verdict === 'Real' ? realPct : fakePct }}%
          </template>
        </span>
        <span v-if="fakeVotes + realVotes === 0" class="text-sm text-gray-500">No votes yet</span>
      </div>

      <!-- แถบสัดส่วน Real/Fake -->
      <div class="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
        <div class="h-full bg-green-500" :style="{ width: realPct + '%' }"></div>
        <div class="h-full bg-red-500"   :style="{ width: fakePct + '%' }"></div>
      </div>
      <div class="mt-2 flex justify-between text-s text-gray-600">
        <span>Real: {{ realPct }}% ({{ realVotes }})</span>
        <span>Fake: {{ fakePct }}% ({{ fakeVotes }})</span>
      </div>
    </section>
    <!-- /Verdict -->

    <!-- Meta -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mb-6">
      <div class="font-medium text-xl">{{ item.reporter }}</div>
      <span aria-hidden="true">•</span>
      <time :datetime="item.dateTime" class="text-xl">{{ item.dateTime }}</time>
      <span aria-hidden="true"></span>
    </div>

    <!-- Hero image -->
    <figure v-if="item.imageUrl" class="mb-6">
      <img :src="item.imageUrl" class="w-full rounded-2xl object-cover" />
    </figure>

    <!-- Article body -->
    <p class="text-xl text-gray-700 mb-4">{{ item.shortDetail }}</p>
    <div class="prose prose-2xl prose-neutral max-w-none mb-10" v-html="item.fullDetail"></div>

    <!-- Divider -->
    <hr class="border-gray-200" />
    
    <CommentItem />


  </article>
</template>