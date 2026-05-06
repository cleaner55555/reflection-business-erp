export type Payment = {
  id: string; invoiceNo: string; client: string; amount: number; currency: string
  date: string; dueDate: string; paidDate: string
  method: 'bank_transfer' | 'cash' | 'card' | 'standing_order'
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'cancelled'
  reference: string
  category: 'invoice' | 'salary' | 'rent' | 'supplier' | 'utility' | 'other'
  notes: string
}
