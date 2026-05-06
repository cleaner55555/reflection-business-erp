export interface CustomsDocument {
  id: string
  declarationNumber: string
  docType: 'import' | 'export' | 'transit'
  status: 'draft' | 'submitted' | 'processing' | 'cleared' | 'held' | 'rejected' | 'released'
  country: string
  borderCrossing: string
  declarantName: string
  declarantPIB: string
  goodsDescription: string
  hsCode: string
  totalValue: number
  totalWeight: number
  currency: string
  customsValue: number
  dutiesAmount: number
  vatAmount: number
  totalDues: number
  vehiclePlate: string
  submissionDate: string
  clearanceDate: string | null
  referenceNumber: string
  notes: string
  items: { hsCode: string; description: string; origin: string; quantity: number; unit: string; unitValue: number; totalValue: number; weight: number; dutyRate: number }[]
}
