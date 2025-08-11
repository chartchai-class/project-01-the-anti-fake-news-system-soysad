// src/stores/comments.ts
import { defineStore } from 'pinia'
import { getCommentsByNewsId } from '@/services/CommentService'
import type { CommentItem } from '@/types'

type PerNewsState = {
  items: CommentItem[]
  page: number
  pages: number
  total: number
  loading: boolean
  error: string | null
}

type State = {
  byNewsId: Record<number, PerNewsState>
}

export const useCommentsStore = defineStore('comments', {
  state: (): State => ({ byNewsId: {} }),

  getters: {
    listByNewsId: (state) => (newsId: number) =>
      state.byNewsId[newsId]?.items ?? [],
    metaByNewsId: (state) => (newsId: number) =>
      state.byNewsId[newsId] ?? {
        items: [],
        page: 0,
        pages: 0,
        total: 0,
        loading: false,
        error: null
      },
    hasMore: (state) => (newsId: number) => {
      const s = state.byNewsId[newsId]
      if (!s) return false
      return s.page < s.pages
    }
  },

  actions: {
    async fetchFirstPage(newsId: number, limit = 20) {
      
      if (!this.byNewsId[newsId]) {
        this.byNewsId[newsId] = {
          items: [],
          page: 0,
          pages: 0,
          total: 0,
          loading: false,
          error: null
        }
      }

      const slot = this.byNewsId[newsId]
      slot.loading = true
      slot.error = null

      try {
        const data = await getCommentsByNewsId({ newsId, page: 1, limit })
        slot.items = data.items
        slot.page = data.page
        slot.pages = data.pages
        slot.total = data.total
      } catch (e: unknown) {
        slot.error = e instanceof Error ? e.message : 'Failed to load comments'
      } finally {
        slot.loading = false
      }
    },

    async fetchNextPage(newsId: number, limit = 20) {
      const slot = this.byNewsId[newsId]
      if (!slot) return this.fetchFirstPage(newsId, limit)
      if (slot.loading) return
      if (slot.page >= slot.pages) return

      slot.loading = true
      slot.error = null

      try {
        const data = await getCommentsByNewsId({
          newsId,
          page: slot.page + 1,
          limit
        })
        slot.items = [...slot.items, ...data.items]
        slot.page = data.page
        slot.pages = data.pages
        slot.total = data.total
      } catch (e: unknown) {
        slot.error = e instanceof Error ? e.message : 'Failed to load comments'
      } finally {
        slot.loading = false
      }
    }
  }
})
