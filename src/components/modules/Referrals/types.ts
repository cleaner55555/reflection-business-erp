export interface Referral {
  id: string
  referrerName: string
  refereeName: string
  refereeEmail?: string
  refereePhone?: string
  source: string
  status: string
  reward?: number
  notes?: string
  createdAt: string
  completedAt?: string

}
export interface DashboardData {
  totalReferrals: number
  pendingReferrals: number
  completedReferrals: number
  totalRewards: number
  topReferrers: Array<{ name: string; count: number }>

}