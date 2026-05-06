export interface SigningRequest {
  id: string
  title: string
  documentType: string
  requesterId?: string
  requesterName?: string
  signerName: string
  status: string
  priority: string
  createdAt: string
  signedAt?: string
  notes?: string
}

export interface DashboardData {
  totalRequests: number
  pendingRequests: number
  signedRequests: number
  rejectedRequests: number
  recentRequests: SigningRequest[]
  typeBreakdown: Array<{ documentType: string; count: number }
