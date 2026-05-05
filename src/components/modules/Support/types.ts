export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description?: string
  customerName: string
  category: string
  priority: string
  status: string
  assignedTo?: string
  resolvedAt?: string
  createdAt: string
}

export interface DashboardData {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  avgResolutionHours: number
  recentTickets: Ticket[]
  categoryBreakdown: Array<{ category: string; count: number }
