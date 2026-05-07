export interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    thisMonthRevenue: number
    lastMonthRevenue: number
  }

}
export interface Partner {
  id: string
  name: string
  type: string
  _count: { invoices: number; purchaseOrders: number }

}
export interface Product {
  id: string
  name: string
  category: string | null
  sellingPrice: number
  currentStock: number
  minStock?: number

}
export interface SavedReport {
  id: string
  name: string
  description: string
  metric: string
  dimension: string
  dateFrom: string
  dateTo: string
}
