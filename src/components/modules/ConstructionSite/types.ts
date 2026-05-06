export interface ConstructionSite {
  id: string
  name: string
  code: string
  type: 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'renovation'
  status: 'planning' | 'excavation' | 'foundation' | 'structural' | 'envelope' | 'systems' | 'finishing' | 'inspection' | 'completed' | 'on_hold'
  address: string
  city: string
  investor: string
  contractor: string
  projectManager: string
  workers: number
  budget: number
  spent: number
  startDate: string
  endDate: string | null
  progress: number
  area: number
  floors: number
  units: number
  notes: string
  tasks: { name: string; status: 'pending' | 'in_progress' | 'completed'; deadline: string }[]
}
