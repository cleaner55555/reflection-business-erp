'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Car, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  Fuel, Gauge, User, Wrench, Receipt, CarFront, ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatRSD } from '@/lib/helpers'

interface VehicleService {
  id: string
  vehicleId: string
  date: string
  type: string
  description: string
  cost: number
  mileage: number
  nextDue?: string
}

interface VehicleExpense {
  id: string
  vehicleId: string
  date: string
  type: string
  amount: number
  description: string
  mileage: number
}

interface Vehicle {
  id: string
  registration: string
  make: string
  model: string
  year: number
  fuelType: string
  mileage: number
  status: string
  assignedTo?: string
  notes?: string
  _count?: { services: number; expenses: number }
  services?: VehicleService[]
  expenses?: VehicleExpense[]
}

const STATUS_BADGES: Record<string, string> = {
  aktivno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  na_servisu: 'bg-amber-50 text-amber-700 border-amber-200',
  u_garazi: 'bg-blue-50 text-blue-700 border-blue-200',
  prodato: 'bg-slate-100 text-slate-500 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno',
  na_servisu: 'Na servisu',
  u_garazi: 'U garaži',
  prodato: 'Prodato',
}

const FUEL_TYPE_BADGES: Record<string, string> = {
  dizel: 'bg-slate-100 text-slate-700 border-slate-200',
  benzin: 'bg-amber-50 text-amber-700 border-amber-200',
  gas: 'bg-blue-50 text-blue-700 border-blue-200',
  hibrid: 'bg-green-50 text-green-700 border-green-200',
  elektricni: 'bg-purple-50 text-purple-700 border-purple-200',
}

const FUEL_TYPE_LABELS: Record<string, string> = {
  dizel: 'Dizel',
  benzin: 'Benzin',
  gas: 'Gas',
  hibrid: 'Hibrid',
  elektricni: 'Električni',
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  servis: 'Servis',
  promjena_ulja: 'Promena ulja',
  gume: 'Gume',
  tehnicki: 'Tehnički pregled',
  registracija: 'Registracija',
}

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  gorivo: 'Gorivo',
  putarina: 'Putarina',
  parking: 'Parking',
  servis: 'Servis',
  ostalo: 'Ostalo',
}

export function VozniPark() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'vehicle-form' | 'service-form' | 'expense-form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [targetVehicleId, setTargetVehicleId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vehicles')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVehicles(data)
    } catch {
      toast.error('Greška pri učitavanju vozila')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const fetchVehicleDetails = useCallback(async (vehicleId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVehicles(prev => prev.map(v => v.id === vehicleId ? data : v))
    } catch {
      toast.error('Greška pri učitavanju detalja')
    }
  }, [])

  const handleExpand = (vehicleId: string) => {
    if (expandedId === vehicleId) {
      setExpandedId(null)
    } else {
      setExpandedId(vehicleId)
      const vehicle = vehicles.find(v => v.id === vehicleId)
      if (vehicle && !vehicle.services) {
        fetchVehicleDetails(vehicleId)
      }
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Obrisati vozilo? Svi servisi i troškovi će biti obrisani.')) return
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Vozilo obrisano')
      if (expandedId === id) setExpandedId(null)
      fetchVehicles()
    } catch {
      toast.error('Greška pri brisanju')
    }
  }

  const handleDeleteService = async (serviceId: string, vehicleId: string) => {
    if (!confirm('Obrisati servis?')) return
    try {
      const res = await fetch(`/api/vehicle-services/${serviceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Servis obrisan')
      fetchVehicleDetails(vehicleId)
    } catch {
      toast.error('Greška pri brisanju')
    }
  }

  const handleDeleteExpense = async (expenseId: string, vehicleId: string) => {
    if (!confirm('Obrisati trošak?')) return
    try {
      const res = await fetch(`/api/vehicle-expenses/${expenseId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Trošak obrisan')
      fetchVehicleDetails(vehicleId)
    } catch {
      toast.error('Greška pri brisanju')
    }
  }

  const handleVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      registration: fd.get('registration') as string,
      make: fd.get('make') as string,
      model: fd.get('model') as string,
      year: Number(fd.get('year')),
      fuelType: fd.get('fuelType') as string || 'dizel',
      mileage: Number(fd.get('mileage')) || 0,
      status: fd.get('status') as string || 'aktivno',
      assignedTo: fd.get('assignedTo') as string || null,
      notes: fd.get('notes') as string || null,
    }
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : '/api/vehicles'
      const res = await fetch(url, {
        method: editingVehicle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editingVehicle ? 'Vozilo ažurirano' : 'Vozilo kreirano')
      setViewMode('list')
      setEditingVehicle(null)
      fetchVehicles()
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!targetVehicleId) return
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      vehicleId: targetVehicleId,
      date: fd.get('date') as string || new Date().toISOString().split('T')[0],
      type: fd.get('type') as string || 'servis',
      description: fd.get('description') as string,
      cost: Number(fd.get('cost')) || 0,
      mileage: Number(fd.get('mileage')) || 0,
      nextDue: fd.get('nextDue') as string || null,
    }
    try {
      const res = await fetch('/api/vehicle-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success('Servis dodat')
      const vid = targetVehicleId
      setViewMode('list')
      setTargetVehicleId(null)
      fetchVehicleDetails(vid)
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!targetVehicleId) return
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      vehicleId: targetVehicleId,
      date: fd.get('date') as string || new Date().toISOString().split('T')[0],
      type: fd.get('type') as string || 'gorivo',
      amount: Number(fd.get('amount')) || 0,
      description: fd.get('description') as string,
      mileage: Number(fd.get('mileage')) || 0,
    }
    try {
      const res = await fetch('/api/vehicle-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success('Trošak dodat')
      const vid = targetVehicleId
      setViewMode('list')
      setTargetVehicleId(null)
      fetchVehicleDetails(vid)
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setViewMode('vehicle-form')
  }

  const openNewVehicle = () => {
    setEditingVehicle(null)
    setViewMode('vehicle-form')
  }

  const openAddService = (vehicleId: string) => {
    setTargetVehicleId(vehicleId)
    setViewMode('service-form')
  }

  const openAddExpense = (vehicleId: string) => {
    setTargetVehicleId(vehicleId)
    setViewMode('expense-form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingVehicle(null)
    setTargetVehicleId(null)
  }

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'active') return v.status === 'aktivno'
    if (activeTab === 'service') return v.status === 'na_servisu'
    return true
  })

  const totalMileage = vehicles.reduce((s, v) => s + (v.mileage || 0), 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = vehicles.reduce((sum, v) => {
    if (!v.expenses) return sum
    return sum + v.expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((s, e) => s + e.amount, 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Car className="h-6 w-6" />
          Vozni Park
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljanje vozilima, servisima i troškovima</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CarFront className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ukupno vozila</p>
              <p className="text-lg font-bold">{vehicles.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Gauge className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ukupna kilometraža</p>
              <p className="text-lg font-bold">{totalMileage.toLocaleString('sr-RS')} km</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Receipt className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mesečni troškovi</p>
              <p className="text-lg font-bold">{formatRSD(monthlyExpenses)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          {viewMode === 'vehicle-form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>{editingVehicle ? 'Izmeni' : 'Novo'} Vozilo</CardTitle></div>
            </div>
          ) : viewMode === 'service-form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>Dodaj Servis</CardTitle></div>
            </div>
          ) : viewMode === 'expense-form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>Dodaj Trošak</CardTitle></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Vozila</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{vehicles.length} vozila</p>
              </div>
              <div className="flex items-center gap-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">Sva vozila</TabsTrigger>
                    <TabsTrigger value="active">Aktivna</TabsTrigger>
                    <TabsTrigger value="service">Na servisu</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button size="sm" className="gap-2" onClick={openNewVehicle}>
                  <Plus className="h-4 w-4" />
                  Novo Vozilo
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'vehicle-form' ? (
            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Registarski broj *</Label>
                  <Input name="registration" defaultValue={editingVehicle?.registration || ''} required placeholder="npr. BG-123-AB" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Godište *</Label>
                  <Input name="year" type="number" min={1990} max={2030} defaultValue={editingVehicle?.year || new Date().getFullYear()} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Marka *</Label>
                  <Input name="make" defaultValue={editingVehicle?.make || ''} required placeholder="npr. VW" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Model *</Label>
                  <Input name="model" defaultValue={editingVehicle?.model || ''} required placeholder="npr. Golf 8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Gorivo</Label>
                  <Select name="fuelType" defaultValue={editingVehicle?.fuelType || 'dizel'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dizel">Dizel</SelectItem>
                      <SelectItem value="benzin">Benzin</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="hibrid">Hibrid</SelectItem>
                      <SelectItem value="elektricni">Električni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Kilometraža</Label>
                  <Input name="mileage" type="number" min={0} defaultValue={editingVehicle?.mileage || 0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select name="status" defaultValue={editingVehicle?.status || 'aktivno'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktivno">Aktivno</SelectItem>
                      <SelectItem value="na_servisu">Na servisu</SelectItem>
                      <SelectItem value="u_garazi">U garaži</SelectItem>
                      <SelectItem value="prodato">Prodato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Dodeljeno</Label>
                  <Input name="assignedTo" defaultValue={editingVehicle?.assignedTo || ''} placeholder="Ime zaposlenog" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Napomene</Label>
                <Textarea name="notes" defaultValue={editingVehicle?.notes || ''} placeholder="Dodatne napomene..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">Otkaži</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Sačuvaj'}
                </Button>
              </div>
            </form>
          ) : viewMode === 'service-form' ? (
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Tip servisa</Label>
                  <Select name="type" defaultValue="servis">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servis">Servis</SelectItem>
                      <SelectItem value="promjena_ulja">Promena ulja</SelectItem>
                      <SelectItem value="gume">Gume</SelectItem>
                      <SelectItem value="tehnicki">Tehnički pregled</SelectItem>
                      <SelectItem value="registracija">Registracija</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Datum</Label>
                  <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Opis *</Label>
                <Textarea name="description" required placeholder="Opis servisa..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Cena (RSD)</Label>
                  <Input name="cost" type="number" step="0.01" min={0} defaultValue={0} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Kilometraža</Label>
                  <Input name="mileage" type="number" min={0} defaultValue={0} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sledeći servis</Label>
                <Input name="nextDue" type="date" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">Otkaži</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Sačuvaj servis'}
                </Button>
              </div>
            </form>
          ) : viewMode === 'expense-form' ? (
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Tip troška</Label>
                  <Select name="type" defaultValue="gorivo">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gorivo">Gorivo</SelectItem>
                      <SelectItem value="putarina">Putarina</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="servis">Servis</SelectItem>
                      <SelectItem value="ostalo">Ostalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Datum</Label>
                  <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Opis *</Label>
                <Textarea name="description" required placeholder="Opis troška..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Iznos (RSD) *</Label>
                  <Input name="amount" type="number" step="0.01" min={0} required defaultValue={0} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Kilometraža</Label>
                  <Input name="mileage" type="number" min={0} defaultValue={0} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">Otkaži</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Sačuvaj trošak'}
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Vehicle Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Nema vozila za prikaz</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredVehicles.map((vehicle) => {
                    const isExpanded = expandedId === vehicle.id
                    return (
                      <div key={vehicle.id} className="space-y-0">
                        <Card
                          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                            isExpanded ? 'ring-2 ring-primary/20 rounded-b-none' : ''
                          }`}
                          onClick={() => handleExpand(vehicle.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">{vehicle.make} {vehicle.model}</h3>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">{vehicle.registration}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); openEditVehicle(vehicle) }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(vehicle.id) }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className={`text-[10px] ${STATUS_BADGES[vehicle.status] || ''}`}>
                              {STATUS_LABELS[vehicle.status] || vehicle.status}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${FUEL_TYPE_BADGES[vehicle.fuelType] || ''}`}>
                              <Fuel className="h-2.5 w-2.5 mr-0.5" />
                              {FUEL_TYPE_LABELS[vehicle.fuelType] || vehicle.fuelType}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {vehicle.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              {vehicle.mileage.toLocaleString('sr-RS')} km
                            </span>
                            {vehicle.assignedTo && (
                              <span className="flex items-center gap-1 col-span-2 truncate" title={vehicle.assignedTo}>
                                <User className="h-3 w-3 shrink-0" />
                                {vehicle.assignedTo}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Wrench className="h-3 w-3" />
                              {vehicle._count?.services || vehicle.services?.length || 0} servisa
                            </span>
                            <span className="flex items-center gap-1">
                              <Receipt className="h-3 w-3" />
                              {vehicle._count?.expenses || vehicle.expenses?.length || 0} troškova
                            </span>
                          </div>
                        </Card>

                        {isExpanded && (
                          <Card className="rounded-t-none border-t-0 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold">Detalji vozila</h4>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 gap-1.5 text-xs"
                                  onClick={() => openAddService(vehicle.id)}
                                >
                                  <Wrench className="h-3 w-3" />
                                  Dodaj servis
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 gap-1.5 text-xs"
                                  onClick={() => openAddExpense(vehicle.id)}
                                >
                                  <Receipt className="h-3 w-3" />
                                  Dodaj trošak
                                </Button>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Wrench className="h-3.5 w-3.5" />
                                Poslednji servisi
                              </h5>
                              {!vehicle.services || vehicle.services.length === 0 ? (
                                <p className="text-xs text-muted-foreground/60 py-2">Nema servisa</p>
                              ) : (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                  {vehicle.services.slice(0, 5).map((service) => (
                                    <div key={service.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs hover:bg-accent/50 transition-colors">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-[10px] bg-slate-50">{SERVICE_TYPE_LABELS[service.type] || service.type}</Badge>
                                          <span className="text-muted-foreground">{formatDate(service.date)}</span>
                                        </div>
                                        <p className="truncate mt-0.5 text-muted-foreground">{service.description}</p>
                                        <div className="flex gap-3 mt-0.5 text-[10px] text-muted-foreground">
                                          <span>{service.mileage.toLocaleString('sr-RS')} km</span>
                                          {service.nextDue && (
                                            <span className="text-amber-600">Sledeći: {formatDate(service.nextDue)}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="font-medium text-xs">{formatRSD(service.cost)}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-500"
                                          onClick={() => handleDeleteService(service.id, vehicle.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Separator className="my-3" />

                            <div>
                              <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Receipt className="h-3.5 w-3.5" />
                                Poslednji troškovi
                              </h5>
                              {!vehicle.expenses || vehicle.expenses.length === 0 ? (
                                <p className="text-xs text-muted-foreground/60 py-2">Nema troškova</p>
                              ) : (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                  {vehicle.expenses.slice(0, 5).map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs hover:bg-accent/50 transition-colors">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-[10px] bg-slate-50">{EXPENSE_TYPE_LABELS[expense.type] || expense.type}</Badge>
                                          <span className="text-muted-foreground">{formatDate(expense.date)}</span>
                                        </div>
                                        <p className="truncate mt-0.5 text-muted-foreground">{expense.description}</p>
                                        <span className="text-[10px] text-muted-foreground">{expense.mileage.toLocaleString('sr-RS')} km</span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="font-medium text-xs">{formatRSD(expense.amount)}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-500"
                                          onClick={() => handleDeleteExpense(expense.id, vehicle.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Card>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
