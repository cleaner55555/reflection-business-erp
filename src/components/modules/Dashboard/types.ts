export interface OverdueInvoice {
  id: string
  number: string
  date: string
  dueDate: string
  status: string
  totalAmount: number
  partner: { id: string; name: string }

}
export interface RecentPartner {
  id: string
  name: string
  pib: string
  type: string
  city: string | null
  createdAt: string

}
export interface RecentTransaction {
  id: string
  date: string
  type: string
  category: string
  amount: number
  description: string

}
export interface ActivityItem {
  id: string
  type: 'invoice' | 'partner' | 'transaction'
  title: string
  subtitle: string
  timestamp: Date
  amount?: number
  icon: 'invoice' | 'partner' | 'transaction'

}
export interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    unpaidInvoiceAmount: number
    unpaidInvoiceCount: number
    invoiceCount: number
    lowStockProducts: number
    partnerCount: number
    productCount: number
    revenueGrowth: number
    cashBalance: number
    cashIn: number
    cashOut: number
  }

}
export interface LowStockProduct {
  id: string
  name: string
  sku: string
  currentStock: number
  minStock: number
  category: string | null
}
