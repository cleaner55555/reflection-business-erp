export interface Subscription {
  id: string
  customer: string
  planId: string
  planName: string
  startDate: string
  renewalDate: string
  amount: number
  status: 'active' | 'trial' | 'paused' | 'cancelled' | 'expired'
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  trialDays: number

}
export interface Plan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  features: string[]
  subscriberCount: number
  isActive: boolean
  trialPeriod: number
  setupFee: number

}
export interface Payment {
  id: string
  date: string
  customer: string
  subscriptionId: string
  subscriptionName: string
  amount: number
  method: 'card' | 'bank' | 'stripe' | 'paypal'
  status: 'paid' | 'pending' | 'failed' | 'refunded'

}
export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number
  usedCount: number
  validFrom: string
  validTo: string
  status: 'active' | 'inactive' | 'expired'
  usageLog: Array<{ date: string; customer: string; subscription: string }>

}