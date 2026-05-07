export interface Partner {
  id: string
  name: string

}
export interface POItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number

}
export interface PurchaseOrder {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  totalAmount: number
  notes: string | null
  partner: { id: string; name: string }

}
export interface FullPurchaseOrder {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  totalAmount: number
  notes: string | null
  partner: {
    id: string
    name: string
    pib: string
    maticniBr: string | null
    address: string | null
    city: string | null
    zipCode: string | null
    phone: string | null
    email: string | null
    account: string | null
    bank: string | null
  }

}
export interface Product {
  id: string
  name: string
  purchasePrice: number

}
export interface OrderLineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}
