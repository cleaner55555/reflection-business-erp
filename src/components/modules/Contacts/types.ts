export interface Partner {
  id: string
  name: string
  pib: string | null
  maticniBr: string | null
  address: string | null
  city: string | null
  zipCode: string | null
  phone: string | null
  email: string | null
  type: string
  account: string | null
  bank: string | null
  notes: string | null
  creditLimit: number
  paymentTerms: number
  parentId: string | null
  tags: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { invoices: number; purchaseOrders: number; projects: number; children: number; contacts: number; deals: number }

}
export interface ContactInfo {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null; position: string | null; isClient: boolean; isSupplier: boolean

}
export interface PartnerStats {
  total: number
  byType: { kupci: number; dobavljaci: number; partneri: number }

}
export interface AnalyticsSummary {
  totalInvoiceAmount: number; paidInvoiceAmount: number; unpaidInvoiceAmount: number
  totalPurchaseAmount: number; invoiceCount: number; purchaseOrderCount: number
  deliveryNoteCount: number; transactionCount: number; totalTransactionAmount: number

}
export interface PartnerAnalytics {
  partner: { id: string; name: string; pib: string; type: string; city: string; address: string; phone: string; email: string; account: string; bank: string }

}