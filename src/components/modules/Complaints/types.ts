export interface Complaint {
  id: string
  number: string
  partnerName: string
  partnerEmail: string
  partnerPhone: string
  productCode: string
  productName: string
  batchNumber: string
  category: string
  priority: string
  status: string
  resolutionType: string
  subject: string
  description: string
  customerNote: string
  internalNote: string
  reportedBy: string
  assignedTo: string
  requestedResolution: string
  amountRequested: number
  amountApproved: number
  currency: string
  deadline: string
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  timeline: ComplaintEvent[]
  attachments: ComplaintAttachment[]
  qualityScore: number
}

export interface ComplaintEvent {
  id: string
  type: string
  description: string
  performedBy: string
  timestamp: string
}

export interface ComplaintAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export interface ComplaintStats {
  total: number
  new: number
  inProgress: number
  resolved: number
  rejected: number
  overdueCount: number
  avgResolutionDays: number
  avgSatisfaction: number
  totalAmountRequested: number
  totalAmountApproved: number
  byCategory: Array<{ category: string; count: number; label: string; amountRequested: number; amountApproved: number }
