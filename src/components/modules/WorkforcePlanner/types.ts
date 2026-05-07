export interface Employee {
  id: string
  name: string
  department: string
  position: string
  email: string
  phone: string
  skills: string[]
  availability: string
  maxHours: number
  currentHours: number
  hourlyRate: number
  status: string

}
export interface Shift {
  id: string
  employeeId: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  type: string
  location: string
  department: string
  status: string
  notes: string
  breakMinutes: number
  overtimeMinutes: number

}
export interface ScheduleTemplate {
  id: string
  name: string
  description: string
  department: string
  shifts: TemplateShift[]
  isDefault: boolean

}
export interface TemplateShift {
  day: string
  startTime: string
  endTime: string
  breakMinutes: number

}
export interface WorkforceStats {
  totalEmployees: number
  activeEmployees: number
  departments: Array<{ name: string; count: number; avgHours: number }>

}