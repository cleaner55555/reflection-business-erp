export interface Company {
  id: string
  name: string
  pib?: string
  city?: string
  isActive: boolean
  _count?: {
    users: number
    partners: number
    invoices: number
    products: number
  }
