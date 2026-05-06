export interface ReturnItem {
  id: string
  returnNumber: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'inspecting' | 'refunded' | 'exchanged' | 'completed'
  returnReason: 'defective' | 'wrong_item' | 'damaged' | 'not_as_described' | 'change_of_mind' | 'warranty' | 'other'
  items: { productName: string; sku: string; quantity: number; unitPrice: number; condition: 'new' | 'used' | 'damaged' | 'missing' }[]
  refundAmount: number
  refundMethod: 'original' | 'store_credit' | 'bank_transfer' | 'replacement'
  shippingCost: number
  restockingFee: number
  netRefund: number
  requestedDate: string
  receivedDate: string | null
  processedDate: string | null
  notes: string
  internalNotes: string
}
