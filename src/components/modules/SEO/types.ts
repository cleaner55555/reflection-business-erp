export interface SeoPage {
  id: string
  url: string
  title: string
  metaDescription: string
  keywords: string
  status: 'indexed' | 'not_indexed' | 'pending' | 'error'
  score: number
  lastCrawled: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
  wordCount: number
}

export interface Keyword {
  id: string
  keyword: string
  position: number
  change: number
  volume: number
  url: string
  difficulty: 'easy' | 'medium' | 'hard'
}
