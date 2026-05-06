export type Utility = {
  id: string; name: string; provider: string; accountNo: string
  type: 'electricity' | 'water' | 'gas' | 'heating' | 'internet' | 'phone' | 'waste' | 'tv'
  status: 'active' | 'disconnected' | 'overdue' | 'pending'
  monthlyAmount: number; lastReading: number; lastReadingDate: string
  lastBillDate: string; lastBillAmount: number; dueDate: string; paidDate: string
  location: string; notes: string
}
