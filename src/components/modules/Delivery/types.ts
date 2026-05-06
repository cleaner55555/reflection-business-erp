export interface DeliveryItem {
  id: string
  trackingNumber: string
  senderName: string
  senderPhone: string
  senderAddress: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  priority: 'express' | 'standard' | 'economy'
  weight: number
  dimensions: string
  codAmount: number
  shippingCost: number
  estimatedDelivery: string
  actualDelivery: string | null
  assignedDriver: string
  currentLocation: string
  notes: string
  history: { date: string; status: string; location: string; note: string }[]
}

export interface DeliveryListTabProps {
  filtered: DeliveryItem[]
  search: string
  statusFilter: string
  priorityFilter: string
  onSearch: (v: string) => void
  onStatusFilter: (v: string) => void
  onPriorityFilter: (v: string) => void
  onView: (id: string) => void
  onEdit: (item: DeliveryItem) => void
  onDelete: (id: string) => void
}

export interface TrackingTabProps {
  data: DeliveryItem[]
  onStatusChange: (id: string, status: DeliveryItem['status']) => void
  onView: (id: string) => void
}

export interface OverviewTabProps {
  data: DeliveryItem[]
  stats: { total: number; pending: number; inTransit: number; delivered: number; failed: number; returned: number; totalRevenue: number; totalCOD: number }
}

export interface DetailDialogProps {
  detailItem: DeliveryItem | null
  onClose: () => void
  onStatusChange: (id: string, status: DeliveryItem['status']) => void
}

export interface DeliveryFormData {
  senderName: string
  senderPhone: string
  senderAddress: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  priority: DeliveryItem['priority']
  weight: number
  dimensions: string
  codAmount: number
  notes: string
}

export interface DeliveryFormDialogProps {
  open: boolean
  editItem: DeliveryItem | null
  formData: DeliveryFormData
  onOpenChange: (open: boolean) => void
  onFormFieldChange: (field: keyof DeliveryFormData, value: string | number) => void
  onSave: () => void
  onEditItemChange: (item: DeliveryItem | null) => void
}
