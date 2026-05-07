export interface OverdueInvoice {
  id: string
  number: string
  date: string
  dueDate: string
  status: string
  totalAmount: number
  partner: { id: string; name: string } | null
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

export interface LowStockProduct {
  id: string
  name: string
  sku: string
  currentStock: number
  minStock: number
  category: string | null
}

export interface DashboardKPIs {
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
  employeeCount: number
  invoiceCountGrowth: number
  thisMonthInvoiceCount: number
  lastMonthInvoiceCount: number
  thisMonthRevenue: number
  lastMonthRevenue: number
}

export interface DashboardData {
  kpis: DashboardKPIs
  recentInvoices: Array<{
    id: string; number: string; date: string; dueDate: string
    status: string; totalAmount: number
    partner: { id: string; name: string } | null
    createdAt: string
  }>
  monthlyChart: Array<{ month: string; revenue: number; expenses: number }>
  expensesByCategory: Array<{ category: string; amount: number }>
  overdueInvoices: OverdueInvoice[]
  overdueCount: number
  overdueTotal: number
  todayDueInvoices: OverdueInvoice[]
  recentPartners: RecentPartner[]
  recentTransactions: RecentTransaction[]
  newPartnersThisMonth: number
  invoicesByStatus: Array<{ status: string; count: number; total: number }>
  topPartners: Array<{ partnerId: string; partnerName: string; totalAmount: number; invoiceCount: number }>
  dealsByStage: Array<{ stage: string; count: number; value: number }>
  activeProjects: {
    count: number; totalBudget: number; totalSpent: number; strugglingCount: number
  }
}
