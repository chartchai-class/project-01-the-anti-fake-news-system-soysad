// src/services/CommentService.ts
import axios from 'axios'
import type { CommentItem } from '@/types'

const API_URL = 'https://mock-d-bnew.vercel.app/comments'

export interface CommentQuery {
  newsId: number
  page?: number
  limit?: number
}

export interface CommentPage {
  items: CommentItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export async function getCommentsByNewsId(
  { newsId, page = 1, limit = 20 }: CommentQuery
): Promise<CommentPage> {
  const res = await axios.get<CommentItem[]>(API_URL, {
    params: { newsId, _page: page, _limit: limit }
  })

  const total = Number(res.headers['x-total-count'] ?? res.data.length)
  const pages = Math.max(1, Math.ceil(total / limit))

  return {
    items: res.data,
    total,
    page,
    limit,
    pages
  }
}
