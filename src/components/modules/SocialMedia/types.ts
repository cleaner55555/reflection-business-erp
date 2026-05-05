export interface SocialPost {
  id: string
  platform: string
  content: string
  status: string
  scheduledDate?: string
  publishedDate?: string
  likes?: number
  comments?: number
  shares?: number
  createdAt: string
}

export interface DashboardData {
  totalPosts: number
  publishedPosts: number
  scheduledPosts: number
  totalEngagement: number
  platformBreakdown: Array<{ platform: string; count: number }
