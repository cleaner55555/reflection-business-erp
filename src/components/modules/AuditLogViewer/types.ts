export interface AuditLog {
  id: string
  companyId: string
  userId?: string | null
  userName: string
  entity: string
  entityId?: string | null
  action: string
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

export interface AuditStats {
  total: number
  recentHour: number
  today: number
  byAction: Array<{ action: string; _count: number }
