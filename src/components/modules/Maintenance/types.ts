export interface MaintenanceOrder {
  id: string
  orderNumber: string
  equipmentName: string
  type: string
  description: string
  priority: string
  status: string
  assignedTo?: string
  scheduledDate?: string
  completedDate?: string
  cost?: number
  notes?: string
  createdAt: string
  category?: string
  partsNeeded?: string[]
  safetyNotes?: string
  workLog?: Array<{ date: string; note: string }

export interface DashboardData {
  totalOrders: number
  openOrders: number
  inProgressOrders: number
  completedOrders: number
  overdueOrders: number
  totalCost: number
  mtbf: number
  recentOrders: MaintenanceOrder[]
  typeBreakdown: Array<{ type: string; count: number }

export interface EquipmentItem {
  id: string
  name: string
  serialNumber: string
  category: string
  location: string
  status: string
  lastMaintenance: string
  nextMaintenance: string
  healthScore: number
  breakdowns90d: number
}

export interface MaintenancePlan {
  id: string
  equipmentId: string
  equipmentName: string
  planName: string
  frequency: string
  nextDue: string
  autoCreate: boolean
  completedDates: string[]
}

export interface SparePart {
  id: string
  name: string
  partNumber: string
  category: string
  qtyInStock: number
  minStock: number
  location: string
  unitCost: number
  usageLog: Array<{ date: string; orderNumber: string; qty: number }
