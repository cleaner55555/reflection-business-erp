export interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  category: string | null
  unit: string
  purchasePrice: number
  sellingPrice: number
  minStock: number
  currentStock: number
  isActive: boolean
}

export interface StockMovement {
  id: string
  productId: string
  date: string
  type: string
  quantity: number
  documentRef: string | null
  notes: string | null
  product: { id: string; name: string; sku: string; currentStock: number }

export interface Partner {
  id: string
  name: string
  pib: string
  type: string
}

export interface DeliveryNoteItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface DeliveryNote {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  invoiceNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  partner: { id: string; name: string; pib: string }

export interface PriceListItem {
  id: string
  productId: string
  price: number
  discountPct: number
  product?: { id: string; name: string; sku: string; unit: string }

export interface PriceList {
  id: string
  name: string
  description: string | null
  validFrom: string | null
  validTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { items: number }

export interface LineItem {
  tempId: string
  productId: string
  productName: string
  quantity: string
  unitPrice: string
}

export interface PriceLineItem {
  tempId: string
  productId: string
  price: string
  discountPct: string
}

export interface WarehouseLocation {
  id: string; name: string; code: string; type: string; parentId: string | null; isActive: boolean
  parent?: { id: string; name: string; code: string }
