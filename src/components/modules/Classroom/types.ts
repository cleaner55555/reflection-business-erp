export type Classroom = {
  id: string
  name: string
  building: string
  floor: string
  capacity: number
  currentOccupancy: number
  type: 'lecture' | 'lab' | 'seminar' | 'computer' | 'workshop'
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  equipment: string[]
  responsible: string
  area: number
  hasProjector: boolean
  hasAC: boolean
  hasWhiteboard: boolean
  lastInspection: string
  notes: string
}
