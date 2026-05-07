export interface StoreProduct {
  id: string
  name: string
  sku: string
  category?: string
  description?: string
  price: number
  comparePrice?: number
  costPrice?: number
  stock: number
  weight?: number
  dimensions?: string
  seoTitle?: string
  seoDescription?: string
  image?: string
  rating: number
  reviews: number
  status: 'active' | 'draft' | 'out_of_stock' | 'archived'
  featured?: boolean
  createdAt: string

}
export interface OrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number

}
export interface StoreOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  status: 'nacrt' | 'potvrđena' | 'u_pripremi' | 'poslata' | 'u_isporuci' | 'isporučena' | 'završena' | 'otkazana'
  paymentMethod: 'kartica' | 'pouzece' | 'virman' | 'paypal'
  paymentStatus: 'čekanje' | 'plaćeno' | 'delimično' | 'otkazano'
  shippingMethod?: string
  trackingNumber?: string
  couponCode?: string
  notes?: string
  timeline: { status: string; date: string; note?: string }

}
export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  description?: string
  image?: string
  productCount: number
  sortOrder: number
  isActive: boolean
  children?: Category[]

}
export interface Coupon {
  id: string
  code: string
  type: 'procenat' | 'fiksni_iznos' | 'besplatna_dostava'
  value: number
  minOrder?: number
  maxDiscount?: number
  validFrom: string
  validTo: string
  maxUses?: number
  usedCount: number
  isActive: boolean
  appliesTo?: string
  createdAt: string

}
export interface StoreSettings {
  storeName: string
  storeUrl: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  currency: string
  language: string
  taxRate: number
  freeShippingThreshold: number
  enableReviews: boolean
  enableWishlist: boolean
  enableRegistration: boolean
  enableGuestCheckout: boolean
  lowStockAlert: number
  outOfStockBehavior: string
  paymentMethods: { id: string; name: string; enabled: boolean; icon: string }

}