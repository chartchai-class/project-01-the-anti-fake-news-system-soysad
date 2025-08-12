// src/stores/comments.ts
import { defineStore } from 'pinia'
import { getCommentsByNewsId } from '@/services/CommentService'
import type { CommentItem } from '@/types'

type PerNewsState = {
  items: CommentItem[]
  page: number
  pages: number
  total: number
  limit: number
  loading: boolean
  error: string | null
}
type State = {
  byNewsId: Record<number, PerNewsState>
  localByNewsId: Record<number, CommentItem[]>
}

function ensureSlot(state: State, newsId: number) {
  if (!state.byNewsId[newsId]) {
    state.byNewsId[newsId] = {
      items: [],
      page: 0,
      pages: 0,
      total: 0,
      limit: 20,
      loading: false,
      error: null,
    }
  }
}

export const useCommentsStore = defineStore('comments', {
  state: (): State => ({
    byNewsId: {},
    localByNewsId: {},
  }),

  getters: {
    // เดิม: แค่ concat ตรง ๆ (ยังเก็บไว้ถ้าอยากใช้)
    listByNewsId: (state) => (newsId: number) => {
      const local = state.localByNewsId[newsId] ?? []
      const remote = state.byNewsId[newsId]?.items ?? []
      return [...local, ...remote]
    },

    metaByNewsId: (state) => (newsId: number) =>
      state.byNewsId[newsId] ?? {
        items: [],
        page: 0,
        pages: 0,
        total: 0,
        limit: 20,
        loading: false,
        error: null,
      },

    hasMore: (state) => (newsId: number) => {
      const s = state.byNewsId[newsId]
      return !!s && s.page < s.pages
    },

    localCountByNewsId: (state) => (newsId: number) => (state.localByNewsId[newsId] ?? []).length,

    combinedListByNewsId() {
      return (newsId: number) => {
        const slot = (this as any).byNewsId[newsId] as PerNewsState | undefined
        const local = (this as any).localByNewsId[newsId] ?? []
        const remote = slot?.items ?? []
        if (!slot || slot.page <= 1) {
          return [...local, ...remote]
        }
        return remote
      }
    },

    combinedMetaByNewsId() {
      return (newsId: number) => {
        const slot = (this as any).byNewsId[newsId] as PerNewsState | undefined
        const base: PerNewsState = slot ?? {
          items: [],
          page: 0,
          pages: 0,
          total: 0,
          limit: 20,
          loading: false,
          error: null,
        }
        const localCount = (this as any).localCountByNewsId(newsId) as number
        const total = base.total + localCount
        const limit = base.limit || 20
        const pages = Math.max(1, Math.ceil(total / limit))
        return { ...base, total, pages, limit }
      }
    },

    localVoteDeltaByNewsId: (state) => (newsId: number) => {
      const local = state.localByNewsId[newsId] ?? []
      let real = 0,
        fake = 0
      for (const c of local) {
        if (c.vote === 'real') real++
        else if (c.vote === 'fake') fake++
      }
      return { real, fake }
    },
  },

  actions: {
    async fetchPage(newsId: number, page: number, limit = 20) {
      ensureSlot(this.$state, newsId)
      const slot = this.byNewsId[newsId]
      if (slot.loading) return
      slot.loading = true
      slot.error = null
      try {
        const data = await getCommentsByNewsId({ newsId, page, limit })
        slot.items = data.items
        slot.page = data.page
        slot.pages = data.pages
        slot.total = data.total
        slot.limit = limit // ⭐️ จำ limit ล่าสุด
      } catch (e: unknown) {
        slot.error = e instanceof Error ? e.message : 'Failed to load comments'
      } finally {
        slot.loading = false
      }
    },

    async fetchFirstPage(newsId: number, limit = 20) {
      return this.fetchPage(newsId, 1, limit)
    },

    async fetchNextPage(newsId: number, limit = 20) {
      ensureSlot(this.$state, newsId)
      const slot = this.byNewsId[newsId]
      if (!slot) return this.fetchFirstPage(newsId, limit)
      if (slot.loading || slot.page >= slot.pages) return
      return this.fetchPage(newsId, slot.page + 1, limit)
    },

    // ------- Local-only (volatile) -------
    ensureLocalSlot(newsId: number) {
      if (!this.localByNewsId[newsId]) this.localByNewsId[newsId] = []
    },

    addLocal(comment: Omit<CommentItem, 'id'>) {
      const newsId = Number(comment.newsId)
      this.ensureLocalSlot(newsId)
      const current = this.localByNewsId[newsId]
      const minNeg = current.reduce((min, c) => Math.min(min, c.id), 0)
      const id = minNeg <= 0 ? minNeg - 1 : -1
      const payload: CommentItem = {
        id,
        ...comment,
        createdAt: new Date().toISOString(),
      }
      this.localByNewsId[newsId].unshift(payload)
      return id
    },

    removeLocal(newsId: number, id: number) {
      this.ensureLocalSlot(newsId)
      this.localByNewsId[newsId] = this.localByNewsId[newsId].filter((c) => c.id !== id)
    },

    clearLocal(newsId?: number) {
      if (typeof newsId === 'number') this.localByNewsId[newsId] = []
      else this.localByNewsId = {}
    },
  },
})
