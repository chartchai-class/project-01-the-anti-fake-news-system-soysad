import { defineStore } from 'pinia'
import type { NewsItem, NewsState } from '@/types'
import { getAllNews } from '@/services/NewsService'

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    news: null,
    loading: false,
    error: null,
  }),

  actions: {
    setNews(items: NewsItem[] | null): void {
      this.news = items
    },

    async fetchNews(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const data = await getAllNews()
        this.setNews(data)
      } catch (err) {
        console.error(err)
        this.error = 'Failed to load news.'
        this.setNews(null)
      } finally {
        this.loading = false
      }
    },
  },
})
