// src/services/CommentService.ts
import axios from 'axios'
import type { CommentQuery, CommentPage, CommentItem } from '@/types'

const api = axios.create({
  baseURL: 'https://mock-d-bnew.vercel.app',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

export async function getCommentsByNewsId({
  newsId,
  page = 1,
  limit = 20,
}: CommentQuery): Promise<CommentPage> {
  const res = await api.get<CommentItem[]>('/comments', {
    params: { newsId, _page: page, _limit: limit },
  })

  const total = Number(res.headers['x-total-count'] ?? res.data.length)
  const pages = Math.max(1, Math.ceil(total / limit))

  return {
    items: res.data,
    total,
    page,
    limit,
    pages,
  }
}
