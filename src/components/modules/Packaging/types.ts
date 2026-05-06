export interface PackagingOrder {
  id: string
  orderNumber: string
  orderId: string
  customerName: string
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'shipped'
  priority: 'urgent' | 'normal' | 'low'
  packagingType: 'standard' | 'fragile' | 'temperature' | 'bulk' | 'custom'
  items: PackagingItem[]
  totalWeight: number
  totalVolume: number
  boxCount: number
  packagingCost: number
  assignedTo: string
  startDate: string
  completedDate: string | null
  notes: string
}

export interface PackagingItem {
  id: string
  productName: string
  sku: string
  quantity: number
  boxType: string
  boxDimensions: string
  weight: number
  labelPrinted: boolean
  qcPassed: boolean | null
  barcode: string
}

export interface PackagingFormData {
  orderNumber: string
  orderId: string
  customerName: string
  priority: PackagingOrder['priority']
  packagingType: PackagingOrder['packagingType']
  notes: string
}

export interface PackagingStats {
  total: number
  pending: number
  inProgress: number
  qc: number
  completed: number
  totalItems: number
  totalCost: number
}
