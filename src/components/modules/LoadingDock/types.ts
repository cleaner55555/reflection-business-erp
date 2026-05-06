export interface DockAppointment {
  id: string
  dockNumber: string
  dockType: 'loading' | 'unloading' | 'both'
  vehiclePlate: string
  driverName: string
  companyName: string
  appointmentDate: string
  scheduledTime: string
  actualStart: string | null
  actualEnd: string | null
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
  cargoType: string
  cargoWeight: number
  cargoUnit: string
  palletCount: number
  priority: 'urgent' | 'normal' | 'low'
  notes: string
  doorAssignment: string
  handlingInstructions: string
}

export interface DockItemInfo {
  number: string
  current: DockAppointment | null
  next: DockAppointment | null
  total: number
  completed: number
}
