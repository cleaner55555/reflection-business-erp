export interface Incident {
  id: string
  number: string
  type: 'injury' | 'near_miss' | 'property_damage' | 'fire' | 'chemical' | 'environmental'
  severity: 'minor' | 'moderate' | 'serious' | 'critical'
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  location: string
  department: string
  reporterName: string
  reporterRole: string
  description: string
  date: string
  time: string
  injuredWorkers: number
  lostDays: number
  rootCause: string
  correctiveAction: string
  responsible: string
  deadline: string
}
