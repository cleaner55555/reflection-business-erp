import { useState, useEffect, useCallback, useMemo } from 'react'
import type { 
  Truck as TruckType,
  TruckFormData,
  MaintenanceRecord,
  MaintenanceFormData,
  TruckCost,
  CostFormData,
  RegistrationItem,
  FleetStats,
  TruckStatus,
  TruckTab,
 } from './types'
import { 
  MOCK_TRUCKS,
  MOCK_MAINTENANCE,
  MOCK_COSTS,
  generateRegistrationItems,
  calculateFleetStats,
  formatRSD,
  formatRSDShort,
  formatDate,
  formatMileage,
  getDaysRemaining,
  getStatusBadgeClass,
  getStatusLabel,
  getFuelLabel,
 } from './data'

export function useTrucks() {
  // ─── TAB STATE ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TruckTab>('vozni_park')

  // ─── DATA STATE ────────────────────────────────────────
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [costs, setCosts] = useState<TruckCost[]>([])
  const [loading, setLoading] = useState(true)

  // ─── FLEET TABLE STATE ─────────────────────────────────
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TruckStatus | ''>('')

  // ─── DIALOG STATE ──────────────────────────────────────
  const [truckDialogOpen, setTruckDialogOpen] = useState(false)
  const [editingTruck, setEditingTruck] = useState<TruckType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)
  const [costDialogOpen, setCostDialogOpen] = useState(false)

  // ────────────────────────────────────────────────────────
  // DATA FETCHING
  // ────────────────────────────────────────────────────────

  const fetchTrucks = useCallback(async () => {
    try {
      const res = await fetch('/api/trucks')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setTrucks(data)
          return
        }
      }
    } catch {
      // API not available, fall back to mock data
    }
    // Use mock data as fallback
    setTrucks(MOCK_TRUCKS)
  }, [])

  const fetchMaintenance = useCallback(async () => {
    try {
      const res = await fetch('/api/trucks/maintenance')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setMaintenance(data)
          return
        }
      }
    } catch {
      // API not available
    }
    setMaintenance(MOCK_MAINTENANCE)
  }, [])

  const fetchCosts = useCallback(async () => {
    try {
      const res = await fetch('/api/trucks/costs')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setCosts(data)
          return
        }
      }
    } catch {
      // API not available
    }
    setCosts(MOCK_COSTS)
  }, [])

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchTrucks(), fetchMaintenance(), fetchCosts()])
      setLoading(false)
    }
    loadAll()
  }, [fetchTrucks, fetchMaintenance, fetchCosts])

  // ────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ────────────────────────────────────────────────────────

  const registrationItems: RegistrationItem[] = useMemo(
    () => generateRegistrationItems(trucks),
    [trucks]
  )

  const fleetStats: FleetStats = useMemo(
    () => calculateFleetStats(trucks, maintenance, costs),
    [trucks, maintenance, costs]
  )

  // Urgent alerts
  const urgentAlerts = useMemo(() => {
    const alerts: { truckPlate: string; type: string; message: string; days: number }[] = []
    trucks.forEach((t) => {
      const regDays = getDaysRemaining(t.registrationExpiry)
      if (regDays <= 30 && regDays > -999) {
        alerts.push({ truckPlate: t.plate, type: 'registration', message: 'Регистрација', days: regDays })
      }
      const techDays = getDaysRemaining(t.techInspectionExpiry)
      if (techDays <= 30 && techDays > -999) {
        alerts.push({ truckPlate: t.plate, type: 'tech', message: 'Тех. преглед', days: techDays })
      }
      const insDays = getDaysRemaining(t.insuranceExpiry)
      if (insDays <= 30 && insDays > -999) {
        alerts.push({ truckPlate: t.plate, type: 'insurance', message: 'Осигурање', days: insDays })
      }
    })
    return alerts.sort((a, b) => a.days - b.days)
  }, [trucks])

  // ────────────────────────────────────────────────────────
  // TRUCK CRUD HANDLERS
  // ────────────────────────────────────────────────────────

  const handleAddTruck = () => {
    setEditingTruck(null)
    setTruckDialogOpen(true)
  }

  const handleEditTruck = (truck: TruckType) => {
    setEditingTruck(truck)
    setTruckDialogOpen(true)
  }

  const handleSaveTruck = async (data: TruckFormData) => {
    setSubmitting(true)
    try {
      const url = editingTruck ? `/api/trucks/${editingTruck.id}` : '/api/trucks'
      const method = editingTruck ? 'PUT' : 'POST'
      const body = editingTruck ? { ...data, id: editingTruck.id } : data

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingTruck ? 'Камион ажуриран' : 'Камион додат')
        setTruckDialogOpen(false)
        fetchTrucks()
      } else {
        // Fallback: update local state
        if (editingTruck) {
          setTrucks((prev) => prev.map((t) =>
            t.id === editingTruck.id
              ? { ...t, ...data }
              : t
          ))
          toast.success('Камион ажуриран (локално)')
        } else {
          const newTruck: TruckType = {
            id: `truck-${Date.now()}`,
            ...data,
            companyId: 'comp-001',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalCosts: 0,
          }
          setTrucks((prev) => [newTruck, ...prev])
          toast.success('Камион додат (локално)')
        }
        setTruckDialogOpen(false)
      }
    } catch {
      // Offline fallback
      if (editingTruck) {
        setTrucks((prev) => prev.map((t) =>
          t.id === editingTruck.id
            ? { ...t, ...data }
            : t
        ))
        toast.success('Камион ажуриран (локално)')
      } else {
        const newTruck: TruckType = {
          id: `truck-${Date.now()}`,
          ...data,
          companyId: 'comp-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalCosts: 0,
        }
        setTrucks((prev) => [newTruck, ...prev])
        toast.success('Камион додат (локално)')
      }
      setTruckDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTruck = async (id: string) => {
    const truck = trucks.find((t) => t.id === id)
    if (!truck) return
    if (!confirm(`Обрисати камион ${truck.plate}?`)) return

    try {
      const res = await fetch(`/api/trucks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Камион обрисан')
        fetchTrucks()
      } else {
        // Fallback
        setTrucks((prev) => prev.filter((t) => t.id !== id))
        toast.success('Камион обрисан (локално)')
      }
    } catch {
      setTrucks((prev) => prev.filter((t) => t.id !== id))
      toast.success('Камион обрисан (локално)')
    }
  }

  // ────────────────────────────────────────────────────────
  // MAINTENANCE CRUD HANDLERS
  // ────────────────────────────────────────────────────────

  const handleSaveMaintenance = async (data: MaintenanceFormData) => {
    setSubmitting(true)
    const truck = trucks.find((t) => t.id === data.truckId)
    const newRecord: MaintenanceRecord = {
      id: `mnt-${Date.now()}`,
      ...data,
      truckPlate: truck?.plate || '',
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/trucks/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Сервисни запис додат')
        setMaintenanceDialogOpen(false)
        fetchMaintenance()
      } else {
        setMaintenance((prev) => [newRecord, ...prev])
        toast.success('Сервисни запис додат (локално)')
        setMaintenanceDialogOpen(false)
      }
    } catch {
      setMaintenance((prev) => [newRecord, ...prev])
      toast.success('Сервисни запис додат (локално)')
      setMaintenanceDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('Обрисати сервисни запис?')) return
    try {
      const res = await fetch(`/api/trucks/maintenance/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Запис обрисан')
        fetchMaintenance()
      } else {
        setMaintenance((prev) => prev.filter((m) => m.id !== id))
        toast.success('Запис обрисан (локално)')
      }
    } catch {
      setMaintenance((prev) => prev.filter((m) => m.id !== id))
      toast.success('Запис обрисан (локално)')
    }
  }

  // ────────────────────────────────────────────────────────
  // COST CRUD HANDLERS
  // ────────────────────────────────────────────────────────

  const handleSaveCost = async (data: CostFormData) => {
    setSubmitting(true)
    const truck = trucks.find((t) => t.id === data.truckId)
    const newCost: TruckCost = {
      id: `cost-${Date.now()}`,
      ...data,
      truckPlate: truck?.plate || '',
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/trucks/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Трошак додат')
        setCostDialogOpen(false)
        fetchCosts()
      } else {
        setCosts((prev) => [newCost, ...prev])
        toast.success('Трошак додат (локално)')
        setCostDialogOpen(false)
      }
    } catch {
      setCosts((prev) => [newCost, ...prev])
      toast.success('Трошак додат (локално)')
      setCostDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCost = async (id: string) => {
    if (!confirm('Обрисати трошак?')) return
    try {
      const res = await fetch(`/api/trucks/costs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Трошак обрисан')
        fetchCosts()
      } else {
        setCosts((prev) => prev.filter((c) => c.id !== id))
        toast.success('Трошак обрисан (локално)')
      }
    } catch {
      setCosts((prev) => prev.filter((c) => c.id !== id))
      toast.success('Трошак обрисан (локално)')
    }
  }

  // ────────────────────────────────────────────────────────
  // RENDER: LOADING SKELETON
  // ────────────────────────────────────────────────────────

  if (loading) {

  return {
    activeTab,
    costDialogOpen,
    costs,
    editingTruck,
    fleetStats,
    handleAddTruck,
    handleDeleteCost,
    handleDeleteMaintenance,
    handleDeleteTruck,
    handleEditTruck,
    handleSaveCost,
    handleSaveMaintenance,
    handleSaveTruck,
    i,
    maintenance,
    maintenanceDialogOpen,
    registrationItems,
    setCostDialogOpen,
    setMaintenanceDialogOpen,
    setSearch,
    setStatusFilter,
    setTruckDialogOpen,
    submitting,
    truckDialogOpen,
    trucks,
    urgentAlerts,
  }
}
