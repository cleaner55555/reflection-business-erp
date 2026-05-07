export interface ServiceOrder {
  id: string
  number: string
  clientName: string
  clientPhone: string
  clientEmail: string
  clientAddress: string
  productBrand: string
  productModel: string
  serialNumber: string
  category: string
  type: string
  priority: string
  status: string
  description: string
  diagnosis: string
  repairNotes: string
  assignedTechnician: string
  estimatedCost: number
  actualCost: number
  partsCost: number
  laborCost: number
  currency: string
  receivedDate: string
  promisedDate: string
  completedDate: string | null
  deliveredDate: string | null
  warranty: boolean
  warrantyMonths: number
  invoiceNumber: string
  rating: number
  timeline: ServiceEvent[]
  parts: ServicePart[]

}
export interface ServiceEvent {
  id: string
  action: string
  description: string
  performedBy: string
  timestamp: string

}
export interface ServicePart {
  id: string
  name: string
  partNumber: string
  quantity: number
  unitPrice: number
  total: number

}
export interface ServiceStats {
  total: number
  open: number
  inProgress: number
  completed: number
  delivered: number
  avgRepairDays: number
  avgCost: number
  totalRevenue: number
  byCategory: Array<{ category: string; count: number; label: string }>

}