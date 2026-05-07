'use client'

// ============================================================
// Truck Fleet Management — Reflection Business ERP
// Main module component: Kamioni
// Full fleet management with tabs: Vozni park, Registracija,
// Održavanje, Troškovi
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
  Truck, FileCheck, Wrench, DollarSign,
  AlertTriangle, Fuel, MapPin, Clock, TrendingUp,
  ShieldCheck, CarFront, Zap, BarChart3, Activity,
} from 'lucide-react'
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
  StatCards,
  MonthlyCostsBar,
  FleetTable,
  TruckFormDialog,
  RegistrationTab,
  MaintenanceTab,
  MaintenanceFormDialog,
  CostsTab,
  CostFormDialog,
} from './components'

// ============================================================
// MAIN COMPONENT
// ============================================================

export function Kamioni() {
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
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // ────────────────────────────────────────────────────────
  // RENDER: MAIN
  // ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Камини — Управљање возним парком
          </h1>
          <p className="text-sm text-muted-foreground">
            Reflection Business ERP · Србија
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urgentAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 gap-1 px-3 py-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {urgentAlerts.length} упозорења
            </Badge>
          )}
        </div>
      </div>

      {/* ─── STAT CARDS ─────────────────────────────────── */}
      <StatCards stats={fleetStats} />

      {/* ─── ALERTS BANNER ──────────────────────────────── */}
      {urgentAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              Хитна упозорења ({urgentAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-32 overflow-y-auto space-y-1.5">
              {urgentAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-white dark:bg-red-950/50 border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{alert.truckPlate}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{alert.message}</span>
                  </div>
                  <span className={`font-semibold ${alert.days < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {alert.days < 0
                      ? `Истекло ${Math.abs(alert.days)} дана`
                      : alert.days === 0
                        ? 'Данас!'
                        : `${alert.days} дана`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── TABS ───────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TruckTab)}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid">
          <TabsTrigger value="vozni_park" className="text-xs sm:text-sm gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Возни парк</span>
            <span className="sm:hidden">ВП</span>
          </TabsTrigger>
          <TabsTrigger value="registracija" className="text-xs sm:text-sm gap-1.5 relative">
            <FileCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Регистрација</span>
            <span className="sm:hidden">Рег</span>
            {(fleetStats.registrationDueCount + fleetStats.insuranceDueCount) > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {fleetStats.registrationDueCount + fleetStats.insuranceDueCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="odrzavanje" className="text-xs sm:text-sm gap-1.5 relative">
            <Wrench className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Одржавање</span>
            <span className="sm:hidden">Одж</span>
            {fleetStats.maintenanceDueCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {fleetStats.maintenanceDueCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="troskovi" className="text-xs sm:text-sm gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Трошкови</span>
            <span className="sm:hidden">Тр</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: VOZNI PARK ──────────────────────────── */}
        <TabsContent value="vozni_park" className="space-y-4">
          <FleetTable
            trucks={trucks}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAdd={handleAddTruck}
            onEdit={handleEditTruck}
            onDelete={handleDeleteTruck}
            loading={false}
          />

          {/* Fleet Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonthlyCostsBar stats={fleetStats} />

            {/* Quick Fleet Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Преглед возног парка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-medium">Активних камиона</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-700">{fleetStats.activeTrucks}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        / {fleetStats.totalTrucks}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium">На сервису / У гаражи</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">
                      {fleetStats.inService + fleetStats.inGarage}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-xs font-medium">Кварова</span>
                    </div>
                    <span className="text-sm font-bold text-red-700">{fleetStats.breakdowns}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Укупна потрошња горива</span>
                    </div>
                    <span className="text-sm font-bold">{formatRSDShort(fleetStats.fuelCostsTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Укупни трошкови</span>
                    </div>
                    <span className="text-sm font-bold">{formatRSD(fleetStats.totalCosts)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <CarFront className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Просечна километража</span>
                    </div>
                    <span className="text-sm font-bold font-mono">{formatMileage(fleetStats.avgMileage)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Truck Quick Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Брзи преглед — активни камиони
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {trucks
                  .filter((t) => t.status === 'aktivan' || t.status === 'na_servisu')
                  .map((truck) => {
                    const regDays = getDaysRemaining(truck.registrationExpiry)
                    const techDays = getDaysRemaining(truck.techInspectionExpiry)
                    const insDays = getDaysRemaining(truck.insuranceExpiry)
                    const minDays = Math.min(regDays, techDays, insDays)

                    return (
                      <div
                        key={truck.id}
                        className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleEditTruck(truck)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-sm">{truck.plate}</span>
                          <Badge className={`text-[10px] px-2 py-0 ${getStatusBadgeClass(truck.status)}`}>
                            {getStatusLabel(truck.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {truck.make} {truck.model} · {truck.year}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Fuel className="h-3 w-3" />
                          <span>{getFuelLabel(truck.fuelType)}</span>
                          <span className="mx-1">·</span>
                          <span className="font-mono">{formatMileage(truck.mileage)}</span>
                        </div>
                        {truck.driver && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📍 {truck.driver}
                          </p>
                        )}
                        {/* Status indicators */}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          <MiniStatusBadge label="Рег" days={regDays} />
                          <MiniStatusBadge label="Тех" days={techDays} />
                          <MiniStatusBadge label="Осиг" days={insDays} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: REGISTRACIJA ─────────────────────────── */}
        <TabsContent value="registracija" className="space-y-4">
          <RegistrationTab items={registrationItems} />

          {/* Registration Cost Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ваžeће документа
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {registrationItems.filter((i) => i.status === 'važeće').length}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                <Clock className="h-3.5 w-3.5" />
                Истиче ускоро (≤30 дана)
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {registrationItems.filter((i) => i.status === 'ističe_uskoro').length}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Истекло
              </div>
              <p className="text-2xl font-bold text-red-700">
                {registrationItems.filter((i) => i.status === 'isteklo').length}
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB: ODRŽAVANJE ────────────────────────────── */}
        <TabsContent value="odrzavanje" className="space-y-4">
          <MaintenanceTab
            records={maintenance}
            trucks={trucks}
            onAdd={() => setMaintenanceDialogOpen(true)}
            onDelete={handleDeleteMaintenance}
          />

          {/* Maintenance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Wrench className="h-3.5 w-3.5" />
                Укупно записа
              </div>
              <p className="text-2xl font-bold">{maintenance.length}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Завршено
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {maintenance.filter((m) => m.status === 'zavrseno').length}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                <Clock className="h-3.5 w-3.5" />
                У току / Заказано
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {maintenance.filter((m) => m.status === 'u_toku' || m.status === 'zakazano').length}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Укупни трошкови сервиса
              </div>
              <p className="text-lg font-bold">
                {formatRSD(maintenance.reduce((s, m) => s + m.cost, 0))}
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB: TROŠKOVI ──────────────────────────────── */}
        <TabsContent value="troskovi" className="space-y-4">
          <CostsTab
            costs={costs}
            trucks={trucks}
            onAdd={() => setCostDialogOpen(true)}
            onDelete={handleDeleteCost}
          />

          {/* Cost Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Укупно трошкова
              </div>
              <p className="text-lg font-bold">{formatRSD(costs.reduce((s, c) => s + c.amount, 0))}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                <Fuel className="h-3.5 w-3.5" />
                Гориво
              </div>
              <p className="text-lg font-bold text-emerald-700">
                {formatRSD(costs.filter((c) => c.type === 'gorivo').reduce((s, c) => s + c.amount, 0))}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {costs.filter((c) => c.type === 'gorivo').length} чланова
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                Путарине и паркинг
              </div>
              <p className="text-lg font-bold text-amber-700">
                {formatRSD(costs.filter((c) => c.type === 'putarina' || c.type === 'parking').reduce((s, c) => s + c.amount, 0))}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Wrench className="h-3.5 w-3.5" />
                Сервис и делови
              </div>
              <p className="text-lg font-bold">
                {formatRSD(costs.filter((c) => ['servis', 'delovi', 'gume', 'podmazivanje', 'adr_oprema'].includes(c.type)).reduce((s, c) => s + c.amount, 0))}
              </p>
            </Card>
          </div>

          {/* Cost per Truck */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Трошкови по камиону
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {trucks
                  .map((truck) => {
                    const truckCosts = costs.filter((c) => c.truckId === truck.id)
                    const total = truckCosts.reduce((s, c) => s + c.amount, 0)
                    const fuelTotal = truckCosts.filter((c) => c.type === 'gorivo').reduce((s, c) => s + c.amount, 0)
                    return { truck, total, fuelTotal, count: truckCosts.length }
                  })
                  .filter((item) => item.count > 0)
                  .sort((a, b) => b.total - a.total)
                  .map(({ truck, total, fuelTotal, count }) => {
                    const maxCost = Math.max(
                      ...trucks.map((t) => costs.filter((c) => c.truckId === t.id).reduce((s, c) => s + c.amount, 0)),
                      1
                    )
                    const barPct = (total / maxCost) * 100
                    return (
                      <div key={truck.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold w-20">{truck.plate}</span>
                            <span className="text-muted-foreground">{truck.make} {truck.model}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{formatRSD(total)}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">({count})</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 rounded-l-full"
                            style={{ width: `${(fuelTotal / maxCost) * 100}%` }}
                          />
                          <div
                            className="h-full bg-amber-500 rounded-r-full"
                            style={{ width: `${((total - fuelTotal) / maxCost) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                {trucks.every((t) => costs.filter((c) => c.truckId === t.id).length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">Нема података о трошковима</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── DIALOGS ─────────────────────────────────────── */}
      <TruckFormDialog
        open={truckDialogOpen}
        onOpenChange={setTruckDialogOpen}
        truck={editingTruck}
        onSave={handleSaveTruck}
        submitting={submitting}
      />

      <MaintenanceFormDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        trucks={trucks}
        onSave={handleSaveMaintenance}
        submitting={submitting}
      />

      <CostFormDialog
        open={costDialogOpen}
        onOpenChange={setCostDialogOpen}
        trucks={trucks}
        onSave={handleSaveCost}
        submitting={submitting}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// MINI STATUS BADGE (for quick cards)
// ────────────────────────────────────────────────────────────

function MiniStatusBadge({ label, days }: { label: string; days: number }) {
  if (days <= -999) return null
  const isUrgent = days < 0
  const isWarning = days <= 30 && days > 0
  const color = isUrgent
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    : isWarning
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'

  const display = isUrgent
    ? 'IST'
    : isWarning
      ? `${days}d`
      : 'OK'

  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${color}`}>
      {label} {display}
    </span>
  )
}
