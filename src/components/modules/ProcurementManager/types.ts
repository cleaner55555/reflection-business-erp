export interface PurchaseRequisition {
  id: string
  prNumber: string
  title: string
  description: string | null
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'received' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestedBy: string
  department: string
  supplierId: string | null
  supplierName: string | null
  items: { name: string; quantity: number; unitPrice: number; unit: string }

export interface Supplier {
  id: string
  name: string
  code: string
  category: string
  contactPerson: string
  email: string
  phone: string
  address: string | null
  city: string | null
  country: string | null
  website: string | null
  rating: number
  leadTime: number
  onTimeRate: number
  totalOrders: number
  totalValue: number
  status: 'active' | 'inactive' | 'blocked'
  paymentTerms: string
  bankAccount: string | null
  notes: string | null
  performanceScore: number
  createdAt: string
}

export interface SpendingRecord {
  month: string
  category: string
  amount: number
  count: number
}

export interface ApprovalMetric {
  id: string
  step: string
  approver: string
  avgTime: number
  pending: number
  approved: number
  rejected: number
}
