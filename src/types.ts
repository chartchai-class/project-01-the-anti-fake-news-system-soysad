export type VoteStatus = 'Fake' | 'Real'

export interface CommentItem {
  id: number
  newsId: number
  user: string
  vote: 'fake' | 'real'
  comment: string
  attachments?: string[]
  createdAt?: string
}

export interface NewsItem {
  id: number
  topic: string
  shortDetail: string
  fullDetail: string
  status: VoteStatus
  reporter: string
  dateTime: string
  imageUrl: string
  fakeVotes: number
  realVotes: number
  comments: CommentItem[]
}

export interface NewsState {
  news: NewsItem[] | null
  loading: boolean
  error: string | null
}
