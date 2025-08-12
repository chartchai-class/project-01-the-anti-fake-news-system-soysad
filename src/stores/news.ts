import { defineStore } from 'pinia'
import { getNewsPage, getAllNewsSorted } from '@/services/NewsService'
import type { NewsItem } from '@/types'

type State = {
  // server mode
  news: NewsItem[]
  total: number

  // client mode cache
  newsAll: NewsItem[] | null

  loading: boolean
  error: string | null
}

export const useNewsStore = defineStore('news', {
  state: (): State => ({
    news: [],
    total: 0,
    newsAll: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchNews(page = 1, perPage = 8) {
      this.loading = true
      this.error = null
      try {
        const { items, total } = await getNewsPage(page, perPage)
        this.news = items
        this.total = total
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load news'
      } finally {
        this.loading = false
      }
    },

    async ensureAllNews() {
      if (this.newsAll && this.newsAll.length) return
      this.loading = true
      this.error = null
      try {
        const all = await getAllNewsSorted()
        this.newsAll = all
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load all news'
      } finally {
        this.loading = false
      }
    },
  },
})
