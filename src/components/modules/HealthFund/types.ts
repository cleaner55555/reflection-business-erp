export interface Contribution {
  id: string
  employeeId: string
  employeeName: string
  month: string
  year: number
  baseAmount: number
  employerShare: number
  employeeShare: number
  totalAmount: number
  status: 'paid' | 'pending' | 'rejected'
  paymentDate: string | null
  dueDate: string
  createdAt: string

}
export interface HealthClaim {
  id: string
  employeeId: string
  employeeName: string
  claimNumber: string
  status: 'submitted' | 'approved' | 'rejected' | 'paid'
  amount: number
  approvedAmount: number | null
  serviceType: string
  diagnosisCode: string
  diagnosisName: string
  providerName: string
  serviceDate: string
  submittedDate: string
  processedDate: string | null
  notes: string

}
export interface FundStats {
  totalContributions: number
  monthlyTotal: number
  employerShare: number
  employeeShare: number
  pendingClaims: number
  totalClaims: number
  approvedClaims: number
  paidClaims: number
  rejectedClaims: number
  utilizationRate: number
  avgClaimAmount: number
  monthlyTrend: Array<{ month: string; contributions: number; claims: number }>

}