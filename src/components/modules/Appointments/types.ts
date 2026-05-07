export interface Appointment {
  id: string
  title: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  date: string
  time: string
  duration: number
  type: string
  status: string
  assignedTo?: string
  notes?: string
  price?: number
  reminderStatus?: 'sent' | 'pending' | 'not_sent'
  createdAt: string

}
export interface DashboardData {
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowRate: number
  avgDuration: number
  totalRevenue: number
  weeklyTrend: Array<{ day: string; count: number }>

}
export interface Client {
  id: string
  name: string
  phone: string
  email: string
  appointmentCount: number
  totalSpent: number
  lastVisit: string
  isVip: boolean
  notes: string
  preferences: string

}
export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  bookingCount: number

}
export interface StaffMember {
  id: string
  name: string
  specialties: string
  workingDays: string[]
  maxPerDay: number
  isActive: boolean

}
export interface AppSettings {
  workStart: string
  workEnd: string
  lunchStart: string
  lunchEnd: string
  slotDuration: number
  bufferTime: number
  reminder24h: boolean
  reminder1h: boolean
  cancelMaxHours: number
  cancelPenalty: number
  bookingUrl: string
}
