export interface SalesOrder {
  id: string
  number: string
  partnerId?: string
  partnerName?: string
  status: string
  totalAmount: number
  dateOrder: string
  validUntil?: string
  notes?: string
  createdAt: string

}
export interface LineItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  lineTotal: number

}
export interface DashboardData {
  totalOrders: number
  draftOrders: number
  sentOrders: number
  confirmedOrders: number
  totalAmount: number
  avgAmount: number
  recentOrders: SalesOrder[]
  statusBreakdown: Array<{ status: string; count: number }>

}
export interface PriceList {
  id: string
  name: string
  description: string
  type: string
  margin: number
  rounding: number
  isActive: boolean
  createdAt: string

}
export interface OfferTemplate {
  id: string
  name: string
  description: string
  lineItems: Omit<LineItem, 'id'>[]
  paymentTerms: string
  defaultNotes: string
  defaultDiscount: number
  useCount: number
  createdAt: string

}
export interface AuditEntry {
  id: string
  orderId: string
  orderNumber: string
  userName: string
  timestamp: string
  oldStatus: string
  newStatus: string
  description: string

}
export interface Product {
  id: string
  name: string
  price: number
  category?: string

}
export interface Partner {
  id: string
  name: string

}
export type PaymentTerms = 'cod' | '15days' | '30days' | '60days' | 'advance'

// ==================== CONSTANTS ====================

const STATUS_CONFIG: Record<string, { labelKey: string;
}>
