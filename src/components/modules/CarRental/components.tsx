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

  Car, Plus, Pencil, Trash2, Fuel, Gauge, Users, Snowflake, Navigation,
  DollarSign, CalendarDays, CheckCircle, XCircle, PlayCircle, Eye,
  CarFront, ClipboardList, MapPin, CreditCard, User, Phone, Mail, FileText,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { formatRSD, formatDate } from '@/lib/helpers'

// ============ TYPES ============

interface RentalVehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  registration: string
  fuelType: string
  transmission: string
  seats: number
  dailyRate: number
  weeklyRate?: number | null
  monthlyRate?: number | null
  mileage: number
  status: string
  ac: boolean
  gps: boolean
  notes?: string
  createdAt: string
  _count?: { rentals: number }
}

interface RentalVehicleFull {
  id: string
  name: string
  make: string
  model: string
  year: number
  registration: string
  fuelType: string
  transmission: string
  seats: number
  dailyRate: number
  weeklyRate?: number | null
  monthlyRate?: number | null
  mileage: number
  status: string
  ac: boolean
  gps: boolean
  notes?: string
  createdAt: string
  _count?: { rentals: number }
}

interface Rental {
  id: string
  number: string
  vehicleId: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  clientIdDoc?: string
  startDate: string
  endDate: string
  pickupMileage: number
  returnMileage?: number | null
  dailyRate: number
  totalDays: number
  totalAmount: number
  deposit: number
  status: string
  notes?: string
  createdAt: string
  vehicle?: { id: string; name: string; make: string; model: string; registration: string }
}

// ============ CONSTANTS ============

const VEHICLE_STATUS_BADGES: Record<string, string> = {
  dostupno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  iznajmljeno: 'bg-amber-50 text-amber-700 border-amber-200',
  na_servisu: 'bg-red-50 text-red-700 border-red-200',
  rezervisano: 'bg-blue-50 text-blue-700 border-blue-200',
  prodato: 'bg-slate-100 text-slate-500 border-slate-200',
}

const VEHICLE_STATUS_LABELS: Record<string, string> = {
  dostupno: 'Dostupno',
  iznajmljeno: 'Iznajmljeno',
  na_servisu: 'Na servisu',
  rezervisano: 'Rezervisano',
  prodato: 'Prodato',
}

const RENTAL_STATUS_BADGES: Record<string, string> = {
  rezervacija: 'bg-blue-50 text-blue-700 border-blue-200',
  aktivna: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  zavrsena: 'bg-slate-100 text-slate-600 border-slate-200',
  otkazana: 'bg-red-50 text-red-700 border-red-200',
}

const RENTAL_STATUS_LABELS: Record<string, string> = {
  rezervacija: 'Rezervacija',
  aktivna: 'Aktivna',
  zavrsena: 'Završena',
  otkazana: 'Otkazana',
}

const FUEL_TYPE_LABELS: Record<string, string> = {
  dizel: 'Dizel',
  benzin: 'Benzin',
  gas: 'Gas',
  hibrid: 'Hibrid',
  elektricni: 'Električni',
}

const FUEL_TYPE_BADGES: Record<string, string> = {
  dizel: 'bg-slate-100 text-slate-700 border-slate-200',
  benzin: 'bg-amber-50 text-amber-700 border-amber-200',
  gas: 'bg-blue-50 text-blue-700 border-blue-200',
  hibrid: 'bg-green-50 text-green-700 border-green-200',
  elektricni: 'bg-purple-50 text-purple-700 border-purple-200',
}

const TRANSMISSION_LABELS: Record<string, string> = {
  automatski: 'Automatski',
  manualni: 'Manuelni',
}

// ============ COMPONENT ============

export function RentACarContent() {
const { t } = useTranslation()
const { tc, translateTexts } = useContentTranslation()
const [vehicles, setVehicles] = useState<RentalVehicle[]>([])

// View mode state (replaces Dialog state)
const [viewMode, setViewMode] = useState<'list' | 'vehicle-form' | 'rental-form'>('list')

// Vehicle editing state
const [editingVehicle, setEditingVehicle] = useState<RentalVehicleFull | null>(null)

// Vehicle filter state
const [vehicleStatusFilter, setVehicleStatusFilter] = useState('all')

// Rental editing state
const [editingRental, setEditingRental] = useState<Rental | null>(null)

// Rental filter state
const [rentalStatusFilter, setRentalStatusFilter] = useState('all')

// ============ FETCH DATA ============

const fetchVehicles = useCallback(async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/rental-vehicles')
    if (!res.ok) throw new Error()
    const data = await res.json()
    setVehicles(data)
  } catch {
    toast.error(t('rentACar.loadVehiclesError'))
  } finally {
    setLoading(false)
  }
}, [])

const fetchRentals = useCallback(async () => {
  setRentalsLoading(true)
  try {
    const res = await fetch('/api/rentals')
    if (!res.ok) throw new Error()
    const data = await res.json()
    setRentals(data)
  } catch {
    toast.error(t('rentACar.loadRentalsError'))
  } finally {
    setRentalsLoading(false)
  }
}, [])

useEffect(() => {
  fetchVehicles()
  fetchRentals()
}, [fetchVehicles, fetchRentals])

// Batch-translate content when data loads
useEffect(() => {
  if (vehicles.length > 0 || rentals.length > 0) {
    const texts: string[] = []
    vehicles.forEach(v => { if (v.name) texts.push(v.name); if (v.make) texts.push(v.make); if (v.model) texts.push(v.model); if (v.notes) texts.push(v.notes) })
    rentals.forEach(r => { if (r.clientName) texts.push(r.clientName); if (r.notes) texts.push(r.notes); if (r.vehicle?.name) texts.push(r.vehicle.name) })
    if (texts.length > 0) translateTexts(texts)
  }
}, [vehicles, rentals, translateTexts])

// ============ COMPUTED VALUES ============

const totalVehicles = vehicles.length
const activeRentals = rentals.filter(r => r.status === 'aktivna').length
const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()
const monthlyRevenue = rentals
  .filter(r => {
    const d = new Date(r.startDate)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.status !== 'otkazana'
  })
  .reduce((s, r) => s + r.totalAmount, 0)

const filteredVehicles = vehicles.filter(v => {
  if (vehicleStatusFilter === 'all') return true
  return v.status === vehicleStatusFilter
})

const filteredRentals = rentals.filter(r => {
  if (rentalStatusFilter === 'all') return true
  return r.status === rentalStatusFilter
})

// ============ RENTAL FORM AUTO-CALC ============

const calcTotalDays = (start: string, end: string): number => {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

const rentalFormTotalDays = calcTotalDays(rentalFormStartDate, rentalFormEndDate)
const rentalFormTotalAmount = rentalFormTotalDays * rentalFormDailyRate

// ============ VEHICLE HANDLERS ============

const handleVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setSubmitting(true)
  const fd = new FormData(e.currentTarget)
  const body = {
    name: fd.get('name') as string,
    make: fd.get('make') as string,
    model: fd.get('model') as string,
    year: Number(fd.get('year')),
    registration: fd.get('registration') as string,
    fuelType: (fd.get('fuelType') as string) || 'dizel',
    transmission: (fd.get('transmission') as string) || 'automatski',
    seats: Number(fd.get('seats')) || 5,
    dailyRate: Number(fd.get('dailyRate')),
    weeklyRate: fd.get('weeklyRate') ? Number(fd.get('weeklyRate')) : null,
    monthlyRate: fd.get('monthlyRate') ? Number(fd.get('monthlyRate')) : null,
    mileage: Number(fd.get('mileage')) || 0,
    status: (fd.get('status') as string) || 'dostupno',
    ac: fd.get('ac') === 'on',
    gps: fd.get('gps') === 'on',
    notes: (fd.get('notes') as string) || null,
  }
  try {
    const url = editingVehicle ? `/api/rental-vehicles/${editingVehicle.id}` : '/api/rental-vehicles'
    const res = await fetch(url, {
      method: editingVehicle ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Greška')
    }
    toast.success(editingVehicle ? t('rentACar.vehicleUpdated') : t('rentACar.vehicleCreated'))
    setViewMode('list')
    setEditingVehicle(null)
    fetchVehicles()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : t('common.saveError')
    toast.error(message)
  } finally {
    setSubmitting(false)
  }
}

const handleDeleteVehicle = async (id: string) => {
  if (!confirm(t('rentACar.confirmDeleteVehicle'))) return
  try {
    const res = await fetch(`/api/rental-vehicles/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Greška')
    }
    toast.success(t('rentACar.vehicleDeleted'))
    fetchVehicles()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : t('common.deleteError')
    toast.error(message)
  }
}

const openEditVehicle = (vehicle: RentalVehicleFull) => {
  setEditingVehicle(vehicle)
  setViewMode('vehicle-form')
}

const openNewVehicle = () => {
  setEditingVehicle(null)
  setViewMode('vehicle-form')
}

// ============ RENTAL HANDLERS ============

const openNewRental = () => {
  setEditingRental(null)
  setRentalFormVehicle('')
  setRentalFormDailyRate(0)
  setRentalFormStartDate('')
  setRentalFormEndDate('')
  setViewMode('rental-form')
}

const handleVehicleSelectForRental = (vehicleId: string) => {
  setRentalFormVehicle(vehicleId)
  const v = vehicles.find(v => v.id === vehicleId)
  if (v) {
    setRentalFormDailyRate(v.dailyRate)
  }
}

const handleRentalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!rentalFormStartDate || !rentalFormEndDate || !rentalFormVehicle) {
    toast.error(t('rentACar.fillRequiredFields'))
    return
  }
  setSubmitting(true)
  const fd = new FormData(e.currentTarget)
  const totalDays = calcTotalDays(rentalFormStartDate, rentalFormEndDate)
  const dailyRate = Number(fd.get('dailyRate')) || rentalFormDailyRate
  const totalAmount = totalDays * dailyRate
  const body = {
    number: fd.get('number') as string,
    vehicleId: rentalFormVehicle,
    clientName: fd.get('clientName') as string,
    clientPhone: (fd.get('clientPhone') as string) || null,
    clientEmail: (fd.get('clientEmail') as string) || null,
    clientIdDoc: (fd.get('clientIdDoc') as string) || null,
    startDate: rentalFormStartDate,
    endDate: rentalFormEndDate,
    pickupMileage: Number(fd.get('pickupMileage')) || 0,
    dailyRate,
    totalDays,
    totalAmount,
    deposit: Number(fd.get('deposit')) || 0,
    status: editingRental ? editingRental.status : 'rezervacija',
    notes: (fd.get('notes') as string) || null,
  }
  try {
    if (editingRental) {
      const res = await fetch(`/api/rentals/${editingRental.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(t('rentACar.rentalUpdated'))
    } else {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(t('rentACar.rentalCreated'))
    }
    setViewMode('list')
    setEditingRental(null)
    fetchRentals()
    fetchVehicles()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : t('common.saveError')
    toast.error(message)
  } finally {
    setSubmitting(false)
  }
}

const handleUpdateRentalStatus = async (rental: Rental, newStatus: string) => {
  if (newStatus === 'otkazana' && !confirm(t('rentACar.confirmCancelRental'))) return
  try {
    const res = await fetch(`/api/rentals/${rental.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) throw new Error()
    toast.success(`Status promenjen na "${RENTAL_STATUS_LABELS[newStatus] || newStatus}"`)
    fetchRentals()
    fetchVehicles()
  } catch {
    toast.error(t('rentACar.statusChangeError'))
  }
}

const handleDeleteRental = async (id: string) => {
  if (!confirm(t('rentACar.confirmDeleteRental'))) return
  try {
    const res = await fetch(`/api/rentals/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    toast.success(t('rentACar.rentalDeleted'))
    fetchRentals()
    fetchVehicles()
  } catch {
    toast.error(t('common.deleteError'))
  }
}

const openEditRental = (rental: Rental) => {
  setEditingRental(rental)
  setRentalFormVehicle(rental.vehicleId)
  const v = vehicles.find(v => v.id === rental.vehicleId)
  setRentalFormDailyRate(v?.dailyRate || rental.dailyRate)
  setRentalFormStartDate(rental.startDate.split('T')[0])
  setRentalFormEndDate(rental.endDate.split('T')[0])
  setViewMode('rental-form')
}

const handleCancel = () => {
  setViewMode('list')
  setEditingVehicle(null)
  setEditingRental(null)
  setRentalFormVehicle('')
}

const generateRentalNumber = () => {
  const count = rentals.length + 1
  const year = new Date().getFullYear()
  return `RN-${year}-${String(count).padStart(4, '0')}`
}

// ============ RENDER ============

return (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Car className="h-6 w-6" />
        {t('rentACar.title')}
      </h1>
      <p className="text-muted-foreground text-sm mt-1">{t('rentACar.subtitle')}</p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CarFront className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('rentACar.totalVehicles')}</p>
            <p className="text-lg font-bold">{totalVehicles}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('rentACar.activeRentals')}</p>
            <p className="text-lg font-bold">{activeRentals}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <DollarSign className="h-4.5 w-4.5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('rentACar.monthlyRevenue')}</p>
            <p className="text-lg font-bold">{formatRSD(monthlyRevenue)}</p>
          </div>
        </div>
      </Card>
    </div>

    {/* Main Tabs */}
    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleCancel() }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          <TabsTrigger value="vozila" className="gap-1.5">
            <Car className="h-3.5 w-3.5" />
            {t('rentACar.vehicles')}
          </TabsTrigger>
          <TabsTrigger value="rezervacije" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t('rentACar.rentals')}
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ========== VOZILA TAB ========== */}
      <TabsContent value="vozila" className="space-y-4 mt-4">
        {viewMode === 'vehicle-form' ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
                <div><CardTitle>{editingVehicle ? t('common.edit') : t('common.new')} {t('rentACar.vehicle')}</CardTitle></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVehicleSubmit} key={editingVehicle?.id || 'new'} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.name')} *</Label>
                    <Input name="name" defaultValue={editingVehicle?.name || ''} required placeholder="npr. VW Golf 8" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.registrationPlate')} *</Label>
                    <Input name="registration" defaultValue={editingVehicle?.registration || ''} required placeholder="npr. BG-123-AB" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.make')} *</Label>
                    <Input name="make" defaultValue={editingVehicle?.make || ''} required placeholder="npr. VW" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.model')} *</Label>
                    <Input name="model" defaultValue={editingVehicle?.model || ''} required placeholder="npr. Golf 8" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.year')} *</Label>
                    <Input name="year" type="number" min={1990} max={2030} defaultValue={editingVehicle?.year || new Date().getFullYear()} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.fuelType')}</Label>
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
                    <Label className="text-xs">{t('rentACar.transmission')}</Label>
                    <Select name="transmission" defaultValue={editingVehicle?.transmission || 'automatski'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatski">Automatski</SelectItem>
                        <SelectItem value="manualni">Manuelni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.seats')}</Label>
                    <Input name="seats" type="number" min={1} max={9} defaultValue={editingVehicle?.seats || 5} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.mileage')}</Label>
                    <Input name="mileage" type="number" min={0} defaultValue={editingVehicle?.mileage || 0} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.dailyRate')} (RSD) *</Label>
                    <Input name="dailyRate" type="number" step="0.01" min={0} defaultValue={editingVehicle?.dailyRate || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.weeklyRate')}</Label>
                    <Input name="weeklyRate" type="number" step="0.01" min={0} defaultValue={editingVehicle?.weeklyRate || ''} placeholder={t('rentACar.optionalPlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.monthlyRate')}</Label>
                    <Input name="monthlyRate" type="number" step="0.01" min={0} defaultValue={editingVehicle?.monthlyRate || ''} placeholder={t('rentACar.optionalPlaceholder')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.status')}</Label>
                    <Select name="status" defaultValue={editingVehicle?.status || 'dostupno'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dostupno">Dostupno</SelectItem>
                        <SelectItem value="iznajmljeno">Iznajmljeno</SelectItem>
                        <SelectItem value="na_servisu">Na servisu</SelectItem>
                        <SelectItem value="rezervisano">Rezervisano</SelectItem>
                        <SelectItem value="prodato">Prodato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3 pt-5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ac-check"
                        name="ac"
                        defaultChecked={editingVehicle?.ac ?? true}
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                      />
                      <Label htmlFor="ac-check" className="text-xs cursor-pointer flex items-center gap-1">
                        <Snowflake className="h-3 w-3" /> {t('rentACar.airConditioning')}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="gps-check"
                        name="gps"
                        defaultChecked={editingVehicle?.gps ?? false}
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                      />
                      <Label htmlFor="gps-check" className="text-xs cursor-pointer flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> GPS
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('rentACar.notes')}</Label>
                  <Textarea name="notes" defaultValue={editingVehicle?.notes || ''} placeholder={t('rentACar.notesPlaceholder')} rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">{t('common.cancel')}</Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : viewMode === 'rental-form' ? null : (
          <>
            {/* Vehicle Filter + Add */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">{t('rentACar.all')}</TabsTrigger>
                  <TabsTrigger value="dostupno">{t('rentACar.available')}</TabsTrigger>
                  <TabsTrigger value="iznajmljeno">{t('rentACar.rented')}</TabsTrigger>
                  <TabsTrigger value="rezervisano">{t('rentACar.reserved')}</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button size="sm" className="gap-2" onClick={openNewVehicle}>
                <Plus className="h-4 w-4" />
                {t('rentACar.newVehicle')}
              </Button>
            </div>

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
              <Card className="p-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{t('rentACar.noVehicles')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="p-4 transition-all hover:shadow-md">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{tc(vehicle.name)}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{vehicle.registration}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditVehicle(vehicle as unknown as RentalVehicleFull)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-[10px] ${VEHICLE_STATUS_BADGES[vehicle.status] || ''}`}>
                        {VEHICLE_STATUS_LABELS[vehicle.status] || vehicle.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${FUEL_TYPE_BADGES[vehicle.fuelType] || ''}`}>
                        <Fuel className="h-2.5 w-2.5 mr-0.5" />
                        {FUEL_TYPE_LABELS[vehicle.fuelType] || vehicle.fuelType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                        {TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {vehicle.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {vehicle.mileage.toLocaleString('sr-RS')} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {vehicle.seats} {t('rentACar.seats')}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {formatRSD(vehicle.dailyRate)}/dan
                      </span>
                      {vehicle.ac && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Snowflake className="h-3 w-3" />
                          {t('rentACar.airConditioning')}
                        </span>
                      )}
                      {vehicle.gps && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Navigation className="h-3 w-3" />
                          GPS
                        </span>
                      )}
                      <span className="flex items-center gap-1 col-span-2">
                        <MapPin className="h-3 w-3" />
                        {vehicle._count?.rentals || 0} {t('rentACar.rentalsCount')}
                      </span>
                    </div>

                    {/* Weekly/Monthly rates */}
                    {(vehicle.weeklyRate || vehicle.monthlyRate) && (
                      <>
                        <Separator className="my-2" />
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          {vehicle.weeklyRate && (
                            <span>{t('rentACar.weekly')}: <span className="font-medium text-foreground">{formatRSD(vehicle.weeklyRate)}</span></span>
                          )}
                          {vehicle.monthlyRate && (
                            <span>{t('rentACar.monthly')}: <span className="font-medium text-foreground">{formatRSD(vehicle.monthlyRate)}</span></span>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </TabsContent>

      {/* ========== REZERVACIJE TAB ========== */}
      <TabsContent value="rezervacije" className="space-y-4 mt-4">
        {viewMode === 'rental-form' ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
                <div><CardTitle>{editingRental ? t('common.edit') : t('common.new')} {t('rentACar.rental')}</CardTitle></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRentalSubmit} key={editingRental?.id || 'new'} className="space-y-4">
                {/* Rental number + Vehicle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.rentalNumber')} *</Label>
                    <Input name="number" defaultValue={editingRental?.number || generateRentalNumber()} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.vehicle')} *</Label>
                    <Select
                      value={rentalFormVehicle}
                      onValueChange={handleVehicleSelectForRental}
                    >
                      <SelectTrigger><SelectValue placeholder={t('rentACar.selectVehicle')} /></SelectTrigger>
                      <SelectContent>
                        {vehicles.filter(v => v.status === 'dostupno' || v.id === rentalFormVehicle).map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} ({v.registration}) — {formatRSD(v.dailyRate)}/dan
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Client Info */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('rentACar.clientInfo')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.clientName')} *</Label>
                      <Input name="clientName" defaultValue={editingRental?.clientName || ''} required placeholder="npr. Marko Marković" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.phone')}</Label>
                      <Input name="clientPhone" defaultValue={editingRental?.clientPhone || ''} placeholder="+381..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Email</Label>
                      <Input name="clientEmail" type="email" defaultValue={editingRental?.clientEmail || ''} placeholder="email@primer.rs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.idDocument')}</Label>
                      <Input name="clientIdDoc" defaultValue={editingRental?.clientIdDoc || ''} placeholder="npr. 123456789" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dates + Rates */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('rentACar.dateAndPrice')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.pickupDate')} *</Label>
                      <Input
                        type="date"
                        value={rentalFormStartDate}
                        onChange={(e) => setRentalFormStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.returnDate')} *</Label>
                      <Input
                        type="date"
                        value={rentalFormEndDate}
                        onChange={(e) => setRentalFormEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.dailyRate')} (RSD) *</Label>
                      <Input name="dailyRate" type="number" step="0.01" min={0} value={rentalFormDailyRate} onChange={(e) => setRentalFormDailyRate(Number(e.target.value))} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('rentACar.pickupMileage')}</Label>
                      <Input name="pickupMileage" type="number" min={0} defaultValue={editingRental?.pickupMileage || 0} />
                    </div>
                  </div>

                  {/* Auto-calculated summary */}
                  <div className="mt-4 rounded-lg border bg-muted/30 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('rentACar.totalDays')}</span>
                      <span className="font-semibold">{rentalFormTotalDays}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('rentACar.dailyPrice')}</span>
                      <span className="font-medium">{formatRSD(rentalFormDailyRate)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{t('rentACar.totalAmount')}</span>
                      <span className="font-bold text-emerald-600">{formatRSD(rentalFormTotalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Deposit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('rentACar.deposit')} (RSD)</Label>
                    <Input name="deposit" type="number" step="0.01" min={0} defaultValue={editingRental?.deposit || 0} />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-xs">{t('rentACar.notes')}</Label>
                  <Textarea name="notes" defaultValue={editingRental?.notes || ''} placeholder={t('rentACar.rentalNotesPlaceholder')} rows={3} />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">{t('common.cancel')}</Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? t('common.saving') : t('rentACar.saveRental')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : viewMode === 'vehicle-form' ? null : (
          <>
            {/* Rental Filter + Add */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={rentalStatusFilter} onValueChange={setRentalStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">{t('rentACar.all')}</TabsTrigger>
                  <TabsTrigger value="rezervacija">{t('rentACar.reservations')}</TabsTrigger>
                  <TabsTrigger value="aktivna">{t('rentACar.activeFilter')}</TabsTrigger>
                  <TabsTrigger value="zavrsena">{t('rentACar.completedFilter')}</TabsTrigger>
                  <TabsTrigger value="otkazana">{t('rentACar.canceledFilter')}</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button size="sm" className="gap-2" onClick={openNewRental}>
                <Plus className="h-4 w-4" />
                {t('rentACar.newRental')}
              </Button>
            </div>

            {/* Rental List */}
            {rentalsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-5 w-1/3 mb-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredRentals.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{t('rentACar.noRentals')}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRentals.map((rental) => (
                  <Card key={rental.id} className="p-4 transition-all hover:shadow-md">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Top row: number + status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{rental.number}</h3>
                          <Badge variant="outline" className={`text-[10px] ${RENTAL_STATUS_BADGES[rental.status] || ''}`}>
                            {RENTAL_STATUS_LABELS[rental.status] || rental.status}
                          </Badge>
                        </div>

                        {/* Client info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate font-medium text-foreground">{rental.clientName}</span>
                          </span>
                          {rental.clientPhone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0" />
                              {rental.clientPhone}
                            </span>
                          )}
                          {rental.clientEmail && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{rental.clientEmail}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Car className="h-3 w-3 shrink-0" />
                            <span className="truncate">{rental.vehicle?.name || t('rentACar.unknownVehicle')}</span>
                            {rental.vehicle?.registration && (
                              <span className="font-mono text-[10px]">({rental.vehicle.registration})</span>
                            )}
                          </span>
                        </div>

                        {/* Dates + Mileage */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(rental.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {formatDate(rental.endDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {rental.totalDays} {t('rentACar.days')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            {rental.pickupMileage.toLocaleString('sr-RS')} km
                          </span>
                        </div>

                        {/* Amounts */}
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            <span className="text-muted-foreground">{t('common.amount')}:</span>
                            <span className="font-bold text-sm text-emerald-600">{formatRSD(rental.totalAmount)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3 text-amber-500" />
                            <span className="text-muted-foreground">{t('rentACar.deposit')}:</span>
                            <span className="font-medium">{formatRSD(rental.deposit)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{t('rentACar.daily')}:</span>
                            <span className="font-medium">{formatRSD(rental.dailyRate)}</span>
                          </span>
                        </div>

                        {rental.notes && (
                          <p className="text-xs text-muted-foreground italic">{rental.notes}</p>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0 sm:flex-col sm:gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditRental(rental)}
                          title={t('common.edit')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {rental.status === 'rezervacija' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
                            onClick={() => handleUpdateRentalStatus(rental, 'aktivna')}
                            title={t('rentACar.activate')}
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {rental.status === 'aktivna' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-600 hover:text-blue-700"
                            onClick={() => handleUpdateRentalStatus(rental, 'zavrsena')}
                            title={t('rentACar.complete')}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {rental.status !== 'otkazana' && rental.status !== 'zavrsena' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => handleUpdateRentalStatus(rental, 'otkazana')}
                            title={t('common.cancel')}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => handleDeleteRental(rental.id)}
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  </div>
)
}