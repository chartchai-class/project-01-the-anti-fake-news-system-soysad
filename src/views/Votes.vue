<!-- src/views/VoteAndComment.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { useCommentsStore } from '@/stores/comments'
import type { CommentItem } from '@/types'
import router from '@/router'

const currentNews = computed(() => {
  const id = Number(route.params.id)
  return (newsStore.news ?? []).find((n: any) => Number(n.id) === id)
})
const route = useRoute()
const newsStore = useNewsStore()
const commentsStore = useCommentsStore()

const coerceNewsId = (x: any) => {
  const n = Number(x)
  return Number.isFinite(n) && n > 0 ? n : 0
}

const form = ref({
  newsId: coerceNewsId(route.params.id ?? route.query.newsId ?? 0),
  user: '',
  vote: 'real' as 'real' | 'fake',
  comment: '',
  attachments: [] as string[],
})
const urlInput = ref('')

onMounted(async () => {
  if (!newsStore.news) await newsStore.fetchNews?.()

  // ถ้ายังไม่ได้เลือกข่าว ให้ auto เลือกข่าวแรก
  if (!form.value.newsId && Array.isArray(newsStore.news) && newsStore.news.length) {
    form.value.newsId = Number(newsStore.news[0].id)
  }
})

// อัปเดตเมื่อเปลี่ยน route param :id
watch(
  () => route.params.id,
  (id) => {
    const n = coerceNewsId(id)
    if (n) form.value.newsId = n
  },
)

const newsOptions = computed(() =>
  (newsStore.news ?? []).map((n: any) => ({ id: Number(n.id), topic: n.topic })),
)

const isValidNewsId = computed(() => Number.isInteger(form.value.newsId) && form.value.newsId > 0)

const canSubmit = computed(
  () => isValidNewsId.value && !!form.value.user.trim() && !!form.value.comment.trim(),
)

function onPickAttachments(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  const promises = files.map(
    (f) =>
      new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(f)
      }),
  )
  Promise.all(promises).then((urls) => {
    form.value.attachments.push(...urls)
  })
  ;(e.target as HTMLInputElement).value = '' // reset เพื่อเลือกไฟล์เดิมซ้ำได้
}

function addUrlAttachment() {
  const u = urlInput.value.trim()
  try {
    const parsed = new URL(u) // invalid จะ throw
    form.value.attachments.push(parsed.toString())
    urlInput.value = ''
  } catch {
    alert('URL ไม่ถูกต้อง')
  }
}

function removeAttachment(i: number) {
  form.value.attachments.splice(i, 1)
}

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
  // ต้องมี actions.addLocal ใน store (ตามที่ผมให้เพิ่มก่อนหน้า)
  commentsStore.addLocal(payload)

  const keepId = form.value.newsId
  form.value = { newsId: keepId, user: '', vote: 'real', comment: '', attachments: [] }

  router.push({ name: 'details', params: { id: keepId } })
}
</script>

<template>
  <section class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Vote & Comment</h1>

    <div class="bg-white rounded-2xl shadow border border-gray-100 p-5 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <div>
            <span class="text-sm text-gray-600 block mb-1">Voting for:</span>
            <p v-if="currentNews" class="font-semibold text-lg text-gray-900">
              {{ currentNews.topic }}
            </p>
            <p v-else class="text-red-500 text-sm">News not found.</p>
          </div>
        </label>

        <label class="block">
          <span class="text-sm text-gray-600">Your name</span>
          <input
            v-model.trim="form.user"
            type="text"
            class="mt-1 w-full border rounded-lg px-3 py-2"
          />
        </label>
      </div>

      <div class="flex items-center gap-6">
        <label class="inline-flex items-center gap-2">
          <input type="radio" value="real" v-model="form.vote" />
          <span class="text-sm">Vote: Real</span>
        </label>
        <label class="inline-flex items-center gap-2">
          <input type="radio" value="fake" v-model="form.vote" />
          <span class="text-sm">Vote: Fake</span>
        </label>
      </div>

      <label class="block">
        <span class="text-sm text-gray-600">Comment</span>
        <textarea
          v-model.trim="form.comment"
          rows="4"
          class="mt-1 w-full border rounded-xl px-3 py-2"
          placeholder="Share your reasoning…"
        ></textarea>
      </label>

      <!-- Attachments -->
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm text-gray-600">Attach images (files)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              @change="onPickAttachments"
              class="mt-1 block w-full text-sm"
            />
          </label>

          <label class="block">
            <span class="text-sm text-gray-600">Attach image by URL</span>
            <div class="mt-1 flex gap-2">
              <input
                v-model="urlInput"
                type="url"
                placeholder="https://example.com/image.jpg"
                class="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                type="button"
                @click="addUrlAttachment"
                class="px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
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
      </div>

      <div class="flex justify-end">
        <button
          @click="submit"
          :disabled="!canSubmit"
          aria-disabled="true"
          class="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed enabled:hover:bg-zinc-900 enabled:shadow-sm transition"
          :title="!canSubmit ? 'กรอกชื่อและคอมเมนต์ก่อน' : 'บันทึกลง Local'"
        >
          Save to Local
        </button>
      </div>
    </div>
  </section>
</template>
