export interface POSProduct {
  id: string
  name: string
  sku: string
  barcode?: string
  sellingPrice: number
  currentStock: number
  category?: string
  unit: string
}

export interface CartItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  maxStock: number
}

export interface POSShift {
  id: string
  number: number
  cashierName: string
  status: string
  openingBalance: number
  closingBalance?: number
  expectedCash?: number
  difference?: number
  openedAt: string
  closedAt?: string
  orders?: { totalAmount: number; paymentMethod: string; status: string }

export interface POSOrder {
  id: string
  orderNumber: string
  totalAmount: number
  paymentMethod: string
  status: string
  itemsCount: number
  createdAt: string
  shift?: { number: number; cashierName: string }

export interface SyncProduct {
  id: string
  name: string
  sku: string
  category?: string
  purchasePrice: number
  sellingPrice: number
  currentStock: number
  unit: string
  marginPct: number
  markupPct: number
}

export interface SyncCategory {
  name: string
  count: number
  totalWholesale: number
  totalRetail: number
  avgMargin: number
}
