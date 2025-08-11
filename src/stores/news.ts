// stores/news.ts
import { defineStore } from 'pinia'
import { getAllNews } from '@/services/NewsService'
import type { NewsItem } from '@/types'

type State = { news: NewsItem[] | null; loading: boolean; error: string | null }

export const useNewsStore = defineStore('news', {
  state: (): State => ({ news: null, loading: false, error: null }),
  actions: {
    async fetchNews() {
      this.loading = true
      this.error = null
      try {
        const data = await getAllNews()
        this.news = [...data].sort((a, b) => +new Date(b.dateTime) - +new Date(a.dateTime))
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.error = e.message
        } else {
          this.error = 'Failed to load news'
        }
      } finally {
        this.loading = false
      }
    },
  },
})
