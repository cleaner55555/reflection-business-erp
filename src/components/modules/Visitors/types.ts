export interface Visitor {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  purpose: string
  department?: string
  hostName?: string
  hostId?: string
  status: VisitorStatus
  badgeNumber?: string
  expectedAt?: string
  checkedInAt?: string
  checkedOutAt?: string
  notes?: string
  isPreRegistered: boolean
  visitCount: number
  totalDuration?: number
  idDocument?: string
  vehiclePlate?: string
}

export interface VisitorKPI {
  todayTotal: number
  checkedIn: number
  expected: number
  avgDuration: number
  weekTotal: number
  monthTotal: number
}

export type VisitorStatus = 'expected' | 'checked_in' | 'checked_out' | 'cancelled'

interface Visitor {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  purpose: string
  department?: string
  hostName?: string
  hostId?: string
  status: VisitorStatus
  badgeNumber?: string
  expectedAt?: string
  checkedInAt?: string
  checkedOutAt?: string
  notes?: string
  isPreRegistered: boolean
  visitCount: number
  totalDuration?: number
  idDocument?: string
  vehiclePlate?: string
}

interface VisitorKPI {
  todayTotal: number
  checkedIn: number
  expected: number
  avgDuration: number
  weekTotal: number
  monthTotal: number
}
// ============ STATUS CONFIG ============

const statusConfig: Record<VisitorStatus, { label: string;
