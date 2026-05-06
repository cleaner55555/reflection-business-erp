export interface Requirement {
  id: string
  number: string
  title: string
  regulation: string
  category: string
  priority: string
  status: string
  owner: string
  department: string
  dueDate: string
  description: string
  evidence: string
  compliant: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Audit {
  id: string
  number: string
  title: string
  type: string
  status: string
  auditor: string
  department: string
  scheduledDate: string
  completedDate: string | null
  score: number | null
  maxScore: number
  findings: number
  criticalFindings: number
  description: string
  scope: string
  checklist: AuditCheckItem[]
}

export interface AuditCheckItem {
  id: string
  clause: string
  requirement: string
  status: 'pass' | 'fail' | 'na' | 'partial'
  notes: string
  evidence: string
}

export interface NonConformance {
  id: string
  number: string
  title: string
  type: string
  severity: string
  status: string
  source: string
  department: string
  detectedBy: string
  detectedDate: string
  rootCause: string
  description: string
  correctiveAction: string
  responsible: string
  dueDate: string
  closedDate: string | null
  verification: string
  linkedAudit: string
  costImpact: number
}

export interface CAPA {
  id: string
  number: string
  title: string
  type: string
  priority: string
  status: string
  source: string
  linkedNc: string
  department: string
  owner: string
  description: string
  rootCause: string
  actionPlan: string
  implementationDate: string
  verificationDate: string
  effectiveness: string
  dueDate: string
  completedDate: string | null
}

export interface RiskAssessment {
  id: string
  number: string
  title: string
  category: string
  department: string
  owner: string
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: string
  existingControls: string
  mitigationPlan: string
  residualLikelihood: number
  residualImpact: number
  residualScore: number
  residualLevel: string
  status: string
  reviewDate: string
  createdAt: string
}

export interface ComplianceStats {
  totalRequirements: number
  compliantRequirements: number
  pendingRequirements: number
  nonCompliantRequirements: number
  complianceRate: number
  totalAudits: number
  openAudits: number
  completedAudits: number
  avgAuditScore: number
  totalNC: number
  openNC: number
  criticalNC: number
  closedNC: number
  totalCAPA: number
  openCAPA: number
  overdueCAPA: number
  totalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  overdueRequirements: number
  byCategory: Array<{ category: string; total: number; compliant: number; rate: number }
