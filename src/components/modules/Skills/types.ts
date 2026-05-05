export interface Skill {
  id: string
  name: string
  category: string
  description: string
  level: SkillLevel
  isActive: boolean
  employeeCount: number
  createdAt: string
}

export interface SkillLevel {
  id: string
  name: string
  value: number
  color: string
  description: string
}

export interface EmployeeSkill {
  id: string
  employeeId: string
  employeeName: string
  employeeDepartment: string
  skillId: string
  skillName: string
  level: number
  yearsExperience: number
  lastAssessed: string
  certification?: string
}

export interface Certification {
  id: string
  name: string
  employeeId: string
  employeeName: string
  skillId: string
  skillName: string
  issuedBy: string
  issueDate: string
  expiryDate?: string
  status: string
  certificateNumber?: string
}

export interface SkillAssessment {
  id: string
  employeeId: string
  employeeName: string
  skillId: string
  skillName: string
  previousLevel: number
  newLevel: number
  assessedBy: string
  assessmentDate: string
  notes: string
}

export interface SkillGap {
  skillName: string
  requiredLevel: number
  currentLevel: number
  gap: number
  employeeCount: number
  priority: string
}

export interface SkillsDashboard {
  totalSkills: number
  totalCategories: number
  certifiedEmployees: number
  averageSkillLevel: number
  skillCoverage: number
  totalCertifications: number
  expiringCertifications: number
  topSkills: Array<{ name: string; employeeCount: number; avgLevel: number }
