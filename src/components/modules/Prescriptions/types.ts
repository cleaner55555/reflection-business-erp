export type Prescription = {
  id: string
  prescriptionNo: string
  patientName: string
  doctor: string
  date: string
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  type: 'reimbursable' | 'private' | 'narcotic' | 'special'
  medications: { name: string; dosage: string; frequency: string; duration: string; quantity: string }[]
  diagnosis: string
  totalCost: number
  patientShare: number
  insuranceCoverage: number
  pharmacy: string
  validUntil: string
  notes: string
}
