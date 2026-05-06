export interface Review {
  id: string
  customerName: string
  customerEmail: string
  productName: string
  productSku: string
  category: string
  rating: number
  title: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'responded'
  source: 'website' | 'email' | 'google' | 'social'
  verified: boolean
  helpful: number
  notHelpful: number
  createdAt: string
  responseText: string | null
  respondedAt: string | null
  respondedBy: string | null
}
