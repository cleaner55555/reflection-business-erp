export interface ShippingCarrier {
  id: string
  name: string
  code: string
  type: string
  website?: string
  apiUrl?: string
  contactPhone?: string
  contactEmail?: string
  isActive: boolean
  defaultWeight: number
  defaultPrice: number
  deliveryEstimate: string
  notes?: string
  _count?: { orders: number }

export interface ShippingOrder {
  id: string
  number: string
  carrierId?: string
  partnerId?: string
  status: string
  weight: number
  volume: number
  packageCount: number
  declaredValue: number
  shippingCost: number
  codAmount: number
  insurance: boolean
  senderName?: string
  senderAddress?: string
  senderCity?: string
  senderZip?: string
  senderPhone?: string
  recipientName?: string
  recipientAddress?: string
  recipientCity?: string
  recipientZip?: string
  recipientPhone?: string
  recipientEmail?: string
  trackingNumber?: string
  refNumber?: string
  notes?: string
  createdAt: string
  pickedUpAt?: string
  deliveredAt?: string
  carrier?: { id: string; name: string; code: string }

export interface DashboardData {
  totalOrders: number
  draftOrders: number
  inTransitOrders: number
  deliveredToday: number
  returnedOrders: number
  weekOrders: number
  totalShippingCost: number
  totalCodAmount: number
  activeCarriers: number
  recentOrders: ShippingOrder[]
  carrierStats: Array<{ carrierId: string; carrierName: string; carrierCode: string; count: number; totalCost: number }

export interface ShippingEvent {
  id: string
  status: string
  location?: string
  description?: string
  eventDate: string
}
