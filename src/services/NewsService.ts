import axios from 'axios'
import type { NewsItem } from '@/types'
import type { NewsPage } from '@/types'

const api = axios.create({
  baseURL: 'https://mock-d-bnew.vercel.app',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

export async function getNewsPage(page = 1, perPage = 8): Promise<NewsPage> {
  const res = await api.get<NewsItem[]>('/news', {
    params: { _page: page, _limit: perPage, _sort: 'dateTime', _order: 'desc' },
  })
  const total = Number(res.headers['x-total-count'] ?? res.data.length ?? 0)
  return { items: res.data, total, page, perPage }
}

export async function getAllNewsSorted(): Promise<NewsItem[]> {
  const res = await api.get<NewsItem[]>('/news', { params: { _sort: 'dateTime', _order: 'desc' } })
  return res.data
}
