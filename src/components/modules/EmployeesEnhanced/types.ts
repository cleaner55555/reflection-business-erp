export interface EmployeeEval {
  id: string; period: string; year: number; rating: number; strengths: string | null
  weaknesses: string | null; goals: string | null; reviewNotes: string | null
  status: string; reviewDate: string | null; createdAt: string
  employee: { firstName: string; lastName: string; position: string | null; department: string | null }

export interface OrgEmployee {
  id: string; firstName: string; lastName: string; position: string | null; department: string | null
  isActive: boolean; managerId: string | null; baseSalary: number; contractType: string | null
  manager?: { id: string; firstName: string; lastName: string; position: string | null }
