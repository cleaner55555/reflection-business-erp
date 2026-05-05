export interface ProductionOrder {
  id: string
  orderNumber: string
  productName: string
  quantityOrdered: number
  quantityProduced: number
  status: 'draft' | 'planned' | 'in_progress' | 'quality_check' | 'completed' | 'cancelled'
  priority: 'normal' | 'high' | 'urgent'
  startDate: string
  endDate: string
  bomComponents: BomComponent[]
  machineId: string
  timeTracking: number
  qualityNotes: string
  notes: string
  progress: number
}

export interface BomComponent {
  name: string
  requiredQty: number
  consumedQty: number
  unit: string
  costPerUnit: number
}

export interface Bom {
  id: string
  productName: string
  version: string
  components: BomComponent[]
  status: 'draft' | 'active' | 'archived'
  createdDate: string
}

export interface Machine {
  id: string
  name: string
  type: 'CNC' | 'Press' | 'Assembly' | 'Package' | 'Other'
  status: 'available' | 'working' | 'maintenance' | 'down'
  location: string
  capacityPerHour: number
  currentLoad: number
  totalHours: number
  downtimeLog: DowntimeEntry[]
}

export interface DowntimeEntry {
  date: string
  hours: number
  reason: string
}

export interface ScheduleItem {
  id: string
  productName: string
  startDay: number
  duration: number
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  quantity: number
}
