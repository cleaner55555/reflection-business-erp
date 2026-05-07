export interface Partner {
  id: string
  name: string

}
export interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  total: number

}
export interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  sefStatus: string | null
  sefSentAt: string | null
  sefUuid: string | null
  partner: { id: string; name: string }

}
export interface Product {
  id: string
  name: string
  sellingPrice: number

}
export interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number

}
export interface FullInvoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
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