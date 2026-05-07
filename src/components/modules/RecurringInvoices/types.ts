export interface Partner {
  id: string
  name: string

}
export interface Product {
  id: string
  name: string
  sellingPrice: number

}
export interface RecurringInvoice {
  id: string
  name: string
  partnerId: string
  frequency: string
  nextDate: string
  lastGenerated: string | null
  startDate: string
  endDate: string | null
  isActive: boolean
  items: string
  notes: string | null
  createdAt: string
  updatedAt: string
  partner: { id: string; name: string }

}
export interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
}
