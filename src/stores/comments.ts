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

  // ✅ เก็บคอมเมนต์ฝั่ง local (ไม่ผ่าน API)
  localByNewsId: Record<number, CommentItem[]>
}

const LOCAL_KEY = 'local_comments_v1'

function loadLocal(): Record<number, CommentItem[]> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocal(map: Record<number, CommentItem[]>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map))
}

export const useCommentsStore = defineStore('comments', {
  state: (): State => ({ byNewsId: {}, localByNewsId: loadLocal() }),

  getters: {
    // ✅ รวม local + remote (local ขึ้นก่อน)
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
    // ===== API flow เดิม (คงไว้) =====
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
    },

    // ===== Local-only flow (ใหม่) =====
    hydrateLocal() {
      // เผื่อเรียกตอนเริ่มแอป
      this.localByNewsId = loadLocal()
    },
    ensureLocalSlot(newsId: number) {
      if (!this.localByNewsId[newsId]) this.localByNewsId[newsId] = []
    },
    // ✅ เพิ่มคอมเมนต์จากผู้ใช้ (เก็บแต่ local)
    addLocal(comment: Omit<CommentItem, 'id'>) {
      const newsId = Number(comment.newsId)
      this.ensureLocalSlot(newsId)

      // สร้าง id ติดลบกันชนกับ id จาก API
      const current = this.localByNewsId[newsId]
      const minNeg = current.reduce((min, c) => Math.min(min, c.id), 0)
      const id = minNeg <= 0 ? minNeg - 1 : -1

      const payload: CommentItem = {
        id,
        ...comment,
        // บันทึกเวลาไว้เรียงในอนาคตได้
        createdAt: new Date().toISOString()
      }
      this.localByNewsId[newsId].unshift(payload) // ใส่บนสุด
      saveLocal(this.localByNewsId)
      return id
    },
    removeLocal(newsId: number, id: number) {
      this.ensureLocalSlot(newsId)
      this.localByNewsId[newsId] = this.localByNewsId[newsId].filter(c => c.id !== id)
      saveLocal(this.localByNewsId)
    },
    clearLocal(newsId?: number) {
      if (typeof newsId === 'number') {
        this.localByNewsId[newsId] = []
      } else {
        this.localByNewsId = {}
      }
      saveLocal(this.localByNewsId)
    }
  }
})
