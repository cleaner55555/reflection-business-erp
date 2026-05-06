export type Tuition = {
  id: string
  student: string
  indexNo: string
  program: string
  year: number
  semester: number
  amount: number
  paidAmount: number
  status: 'paid' | 'partial' | 'unpaid' | 'overdue' | 'scholarship' | 'exempt'
  dueDate: string
  paidDate: string
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'scholarship' | 'exempt'
  receiptNo: string
  installments: number
  currentInstallment: number
  discount: number
  notes: string
}
