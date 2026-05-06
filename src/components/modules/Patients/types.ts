export type Patient = {
  id: string
  patientNo: string
  firstName: string
  lastName: string
  jmbg: string
  dateOfBirth: string
  age: number
  gender: 'male' | 'female'
  phone: string
  email: string
  address: string
  city: string
  bloodType: string
  insuranceNo: string
  insuranceStatus: 'active' | 'expired' | 'pending'
  primaryDoctor: string
  status: 'active' | 'discharged' | 'in_treatment' | 'critical'
  allergies: string[]
  chronicConditions: string[]
  lastVisit: string
  nextAppointment: string
  totalVisits: number
  notes: string
}
