export interface Employee {
  id: string
  name: string
  department: string
  position: string
}

export interface CompetencyScore {
  competencyId: string
  score: number
}

export interface Appraisal {
  id: string
  employeeId: string
  employeeName: string
  department: string
  period: string
  status: 'zatrazeno' | 'u_toku' | 'zavrseno' | 'otkazano'
  overallRating: number
  competencyScores: CompetencyScore[]
  strengths: string
  improvements: string
  goals: string
  evaluatedBy: string
  evaluatedAt: string
  createdAt: string
}

export interface Criterion {
  id: string
  name: string
  category: string
  description: string
  weight: number
  scaleMax: number
  active: boolean
}

export interface PeriodData {
  period: string
  avgRating: number
  completedCount: number
  totalCount: number
}
