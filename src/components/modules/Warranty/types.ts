export interface Warranty {
  id: string
  number: string
  productName: string
  productCode: string
  serialNumber: string
  batchNumber: string
  partnerName: string
  partnerEmail: string
  partnerPhone: string
  category: string
  warrantyType: string
  durationMonths: number
  startDate: string
  endDate: string
  extendedEndDate: string | null
  status: string
  coverageDescription: string
  exclusions: string[]
  provider: string
  providerPhone: string
  providerEmail: string
  purchaseDate: string
  purchasePrice: number
  currency: string
  invoiceNumber: string
  terms: string
  notes: string
  claims: WarrantyClaim[]
  createdAt: string
  updatedAt: string
}

export interface WarrantyClaim {
  id: string
  date: string
  description: string
  status: string
  cost: number
  resolvedDate: string | null
}

export interface WarrantyStats {
  total: number
  active: number
  expiringSoon: number
  expired: number
  totalValue: number
  avgDuration: number
  byCategory: Array<{ category: string; count: number; label: string }
