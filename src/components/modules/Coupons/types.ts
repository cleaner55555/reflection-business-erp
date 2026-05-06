export interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo' | 'gift_card'
  discountValue: number
  minOrder: number
  maxDiscount: number
  usageLimit: number
  usageCount: number
  perUserLimit: number
  status: 'active' | 'scheduled' | 'expired' | 'paused' | 'disabled'
  startDate: string
  endDate: string
  applicableCategories: string[]
  applicableProducts: string[]
  customerGroups: string[]
  createdAt: string
}
