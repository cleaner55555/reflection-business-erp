export interface BankAccount {
  id: string
  name: string
  bank: string | null
  account: string
  currency: string
  isActive: boolean
  balance: number
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
  _count?: { transactions: number }

export interface BankTransaction {
  id: string
  bankAccountId: string
  date: string
  amount: number
  description: string
  reference: string | null
  counterpart: string | null
  category: string | null
  isReconciled: boolean
  invoiceId: string | null
  createdAt: string
  bankAccount: { id: string; name: string; account: string }

export interface SuggestedMatch {
  transactionId: string
  invoiceId: string
  confidence: number
  reason: string
  amount: number
  invoiceNumber: string
  partnerName: string
}

export interface ReconcileResult {
  autoApplied: SuggestedMatch[]
  suggestedMatches: SuggestedMatch[]
  unmatched: string[]
  total: number
  autoMatched: number
  manualNeeded: number
}

export interface Invoice {
  id: string
  number: string
  totalAmount: number
  status: string
  partner: { name: string }
