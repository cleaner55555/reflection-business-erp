export interface Contract {
  id: string
  employeeId: string
  employeeName: string
  department: string
  position: string
  type: string
  status: string
  startDate: string
  endDate?: string
  probationEndDate?: string
  salaryGross: number
  salaryNet: number
  currency: string
  workHours: number
  workLocation: string
  contractNumber: string
  notes?: string
  documents: ContractDocument[]
  createdAt: string
  updatedAt: string
}

export interface ContractDocument {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
}

export interface ContractType {
  id: string
  name: string
  description: string
  defaultDuration: string
  color: string
  contractCount: number
}

export interface ContractRenewal {
  id: string
  contractId: string
  employeeName: string
  oldEndDate: string
  newStartDate: string
  newEndDate: string
  status: string
  requestedDate: string
  notes: string
}

export interface ContractDashboard {
  activeContracts: number
  expiringSoon: number
  expiredContracts: number
  terminatedContracts: number
  totalEmployees: number
  avgSalary: number
  totalPayroll: number
  byType: Array<{ type: string; count: number; color: string }
