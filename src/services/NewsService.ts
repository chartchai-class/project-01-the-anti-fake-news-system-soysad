import axios from 'axios'
import type { NewsItem } from '@/types'

const API_URL = 'https://mock-d-bnew.vercel.app/news'

export async function getAllNews(): Promise<NewsItem[]> {
  const res = await axios.get<NewsItem[]>(API_URL)
  return res.data
}
