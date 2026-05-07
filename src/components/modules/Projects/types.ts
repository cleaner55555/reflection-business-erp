export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string
  endDate: string | null
  budget: number
  spent: number
  priority: string
  assignedTo: string | null
  partnerId: string | null
  partner?: { id: string; name: string }

}
export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  assignedTo: string | null
  estimatedHours: number
  loggedHours: number
  orderNum: number
  tags: string | null
  createdAt: string
  updatedAt: string
  projectName?: string

}
export interface TimesheetEntry {
  id: string
  projectId: string
  taskId: string
  employeeId: string | null
  date: string
  hours: number
  description: string | null
  project?: { id: string; name: string }

}
export interface Partner {
  id: string
  name: string
}
