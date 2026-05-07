export interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  authorName: string
  authorId: string
  authorDept: string
  votesFor: number
  votesAgainst: number
  userVote: 'for' | 'against' | null
  comments: number
  createdAt: string
  updatedAt: string
  implementedAt: string | null
  estimatedSaving: number | null
  implementerName: string | null
  rejectionReason: string | null

}
export interface SuggestionStats {
  total: number
  pending: number
  approved: number
  implemented: number
  rejected: number
  totalVotes: number
  avgResolutionDays: number
  categoryBreakdown: Array<{ category: string; count: number; color: string }>

}