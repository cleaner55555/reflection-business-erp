export type Homework = {
  id: string
  title: string
  subject: string
  classGroup: string
  teacher: string
  type: 'essay' | 'problem_set' | 'lab_report' | 'project' | 'presentation' | 'reading'
  status: 'assigned' | 'submitted' | 'graded' | 'overdue' | 'returned'
  dueDate: string
  assignedDate: string
  maxPoints: number
  avgScore: number
  submittedCount: number
  totalStudents: number
  description: string
  instructions: string
}
