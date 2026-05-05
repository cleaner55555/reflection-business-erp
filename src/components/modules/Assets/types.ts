export interface Asset {
  id: string; name: string; category: string | null; serialNumber: string | null
  purchaseDate: string | null; purchasePrice: number; currentValue: number; depreciation: number
  usefulLife: number; location: string | null; status: string; notes: string | null; createdAt: string
  responsible?: string | null; insurance?: string | null; maintenanceDate?: string | null
  maintenanceCost?: number; warrantyExpiry?: string | null
}
