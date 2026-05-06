export interface InstallmentPlan {
  id: string; number: string; date: string; dueDate: string; partnerId: string
  totalAmount: number; installmentNumber: number; totalInstallments: number
  paidInstallments: number; status: string; currency: string
  partner: { name: string }

export interface FiscalInvoice {
  id: string; number: string; date: string; type: string; status: string
  totalAmount: number; taxAmount: number; baseAmount: number
  fiscalizedNumber: string | null; fiscalizedAt: string | null
  sefStatus: string; sefSentAt: string | null
  currency: string; incoterms: string | null
  partner: { name: string; pib: string | null }
