export interface LeaveRequest {
  id: string
  employeeName: string
  type: string
  startDate: string
  endDate: string
  daysCount: number
  status: string
  reason?: string
  approvedBy?: string
  createdAt: string

}
export interface DashboardData {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  currentMonthAbsences: number
  recentRequests: LeaveRequest[]
  typeBreakdown: Array<{ type: string; count: number }>

}