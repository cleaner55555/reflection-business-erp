export interface Rating {
  id: string
  targetType: string
  targetId: string
  targetName: string
  category: string
  quality: number
  service: number
  price: number
  time: number
  overall: number
  comment?: string
  ratedBy: string
  ratedAt: string
}

export interface Survey {
  id: string
  name: string
  description: string
  status: string
  questionCount: number
  responseCount: number
  avgRating: number
  createdAt: string
}

export interface RatingCriteria {
  id: string
  name: string
  description: string
  weight: number
  scaleMax: number
  category: string
}

export interface RatingReport {
  id: string
  period: string
  totalRatings: number
  avgOverall: number
  avgQuality: number
  avgService: number
  avgPrice: number
  avgTime: number
  trend: 'up' | 'down' | 'stable'
  topRated: Array<{ name: string; rating: number; count: number }

export interface RatingDashboard {
  totalRatings: number
  avgRating: number
  responseRate: number
  trendDirection: 'up' | 'down' | 'stable'
  trendValue: number
  distribution: Array<{ rating: number; count: number; percentage: number }
