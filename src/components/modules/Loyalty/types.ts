export interface LoyaltyMember {
  id: string
  cardNumber: string
  partnerName: string
  partnerId: string
  tier: string
  points: number
  totalSpent: number
  lifetimePoints: number
  joinDate: string
  lastActivity: string
  status: string
  email: string
  phone: string
  referralCode: string
  referralCount: number
  purchaseCount: number
  avgPurchase: number

}
export interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  maxPoints: number
  minSpent: number
  pointsMultiplier: number
  discountPct: number
  benefits: string[]
  color: string
  icon: string
  memberCount: number

}
export interface RewardItem {
  id: string
  name: string
  description: string
  category: string
  pointsCost: number
  pointsValue: number
  imageUrl: string
  stock: number
  claimed: number
  active: boolean
  availableFrom: string
  availableTo: string
  maxPerMember: number
  tierRequired: string

}
export interface PointsTransaction {
  id: string
  memberName: string
  cardNumber: string
  type: string
  points: number
  balance: number
  description: string
  reference: string
  date: string
  expiryDate: string | null
  status: string

}
export interface PromoCampaign {
  id: string
  name: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  pointsMultiplier: number
  bonusPoints: number
  minPurchase: number
  maxBonus: number
  participatingTiers: string[]
  redemptions: number
  totalAwarded: number
  budget: number
  budgetUsed: number

}
export interface LoyaltyStats {
  totalMembers: number
  activeMembers: number
  newThisMonth: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  totalRevenue: number
  avgOrderValue: number
  retentionRate: number
  topTierMembers: number
  tierDistribution: Array<{ tier: string; count: number; color: string }>

}