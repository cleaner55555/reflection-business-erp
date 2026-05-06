export interface ApprovalRequest {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  requestedBy: string
  requestedByRole: string
  assignedTo: string
  assignedToRole: string
  amount?: number
  currency: string
  startDate?: string
  endDate?: string
  comments: ApprovalComment[]
  history: ApprovalHistoryEntry[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
}

export interface ApprovalComment {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface ApprovalHistoryEntry {
  action: string
  performedBy: string
  timestamp: string
  note?: string
}

export interface ApprovalTemplate {
  id: string
  name: string
  description: string
  type: string
  requiredFields: string[]
  approverRole: string
  isActive: boolean
  usageCount: number
}

export interface ApprovalDashboard {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  avgResponseHours: number
  myPendingCount: number
  urgentPendingCount: number
  requestsByType: Array<{ type: string; count: number; label: string }
