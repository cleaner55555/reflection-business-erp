export interface Inspection {
  id: string
  title: string
  type: string
  productName?: string
  batchNumber?: string
  inspectorName: string
  status: string
  result: string
  defects?: number
  notes?: string
  inspectedAt?: string
  createdAt: string
}

export interface DashboardData {
  totalInspections: number
  passedInspections: number
  failedInspections: number
  pendingInspections: number
  passRate: number
  totalDefects: number
  recentInspections: Inspection[]
  typeBreakdown: Array<{ type: string; count: number }
