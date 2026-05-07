export interface RestoCategory {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  items?: RestoMenuItem[]

}
export interface RestoMenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  cost: number
  image?: string
  isAvailable: boolean
  sortOrder: number
  category?: { id: string; name: string }

}
export interface RestoTable {
  id: string
  number: number
  name?: string
  capacity: number
  status: string
  location?: string
  activeOrderCount?: number

}
export interface RestoOrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
  status: string

}
export interface RestoOrder {
  id: string
  orderNumber: number
  tableId?: string
  status: string
  type: string
  totalAmount: number
  discountPct: number
  waiter?: string
  notes?: string
  createdAt: string
  updatedAt: string
  table?: { id: string; number: number; name?: string; location?: string }

}