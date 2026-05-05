export interface FieldOrder {
  id: string
  orderNumber: string
  customerName: string
  address: string
  type: string
  description?: string
  priority: string
  status: string
  assignedTo?: string
  scheduledDate?: string
  completedDate?: string
  notes?: string
  createdAt: string
}

export interface DashboardData {
  totalOrders: number
  openOrders: number
  inProgressOrders: number
  completedToday: number
  overdueOrders: number
  recentOrders: FieldOrder[]
  typeBreakdown: Array<{ type: string; count: number }
