export interface Stop {
  id: string
  location: string
  address: string
  estimatedArrival: string
  estimatedDeparture: string
  status: 'pending' | 'in_transit' | 'completed' | 'skipped'
  cargo: string
  weight: number
  notes: string
}

export interface RouteItem {
  id: string
  name: string
  code: string
  driver: string
  vehicle: string
  origin: string
  destination: string
  status: 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  totalDistance: number
  estimatedTime: string
  actualTime: string | null
  fuelCost: number
  tollCost: number
  stops: Stop[]
  startDate: string
  endDate: string | null
  notes: string
}

export interface RouteListProps {
  filtered: RouteItem[]
  search: string
  statusFilter: string
  priorityFilter: string
  onSearch: (v: string) => void
  onStatusFilter: (v: string) => void
  onPriorityFilter: (v: string) => void
  onView: (id: string) => void
  onEdit: (item: RouteItem) => void
  onDelete: (id: string) => void
}

export interface OverviewTabProps {
  data: RouteItem[]
}

export interface DetailDialogProps {
  detailItem: RouteItem | null
  onClose: () => void
}

export interface RouteFormProps {
  open: boolean
  editItem: RouteItem | null
  formData: Record<string, unknown>
  onOpenChange: (open: boolean) => void
  onFieldChange: (f: string, v: unknown) => void
  onSave: () => void
  onEditItemChange: (item: RouteItem | null) => void
}
