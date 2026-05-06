export type MedicalRecord = {
  id: string
  recordNo: string
  patientName: string
  patientNo: string
  doctor: string
  date: string
  type: 'checkup' | 'follow_up' | 'emergency' | 'lab_result' | 'surgery' | 'referral' | 'discharge'
  diagnosis: string
  diagnosisCode: string
  symptoms: string
  treatment: string
  prescribedMeds: string[]
  vitalSigns: string
  labResults: string
  nextAction: string
  notes: string
}
