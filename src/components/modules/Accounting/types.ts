export interface Account {
  id: string
  code: string
  name: string
  type: string
  description?: string | null
  parentCode?: string | null
  isActive: boolean
  _count?: { entries: number }

}
export interface JournalEntry {
  id: string
  date: string
  accountCode: string
  debit: number
  credit: number
  description: string
  documentRef?: string | null
  voucherNumber?: string | null
  fiscalYear?: number | null
  reconciled?: boolean
  partner?: { id: string; name: string }

}
export interface JournalRow {
  tempId: string
  accountCode: string
  debit: number
  credit: number

}
export interface BudgetItem {
  id: string
  accountCode: string
  name: string
  year: number
  january: number; february: number; march: number; april: number
  may: number; june: number; july: number; august: number
  september: number; october: number; november: number; december: number
  totalAnnual: number
  notes?: string | null
  isActive: boolean

}
export interface DashboardData {
  fiscalYear: number
  totalAssets: number
  totalLiabilities: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  totalEquity: number
  totalEntries: number
  totalAccounts: number
  totalBudget: number
  budgetCount: number
  recentEntries: JournalEntry[]

}
export interface AccountStatement {
  account: { code: string; name: string; type: string }

}