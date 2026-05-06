'use client'

// ============================================================
// Truck Fleet Management — Reflection Business ERP
// Sub-components for the Kamioni module
// ============================================================

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Truck, Plus, Search, Pencil, Trash2, Fuel, Wrench, AlertTriangle,
  FileCheck, ShieldCheck, CalendarDays, DollarSign, ChevronDown, ChevronUp,
  Clock, MapPin, User, Gauge, CarFront, X, Eye, Activity,
} from 'lucide-react'
import type {
  Truck, TruckFormData, MaintenanceRecord, MaintenanceFormData,
  TruckCost, CostFormData, RegistrationItem, FleetStats,
  TruckStatus, FuelType, MaintenanceType, CostType,
} from './types'
import {
  FUEL_TYPE_OPTIONS, STATUS_OPTIONS, MAKE_OPTIONS,
  MAINTENANCE_TYPE_OPTIONS, COST_TYPE_OPTIONS,
  formatRSD, formatRSDShort, formatDate, formatMileage,
  getDaysRemaining, getStatusBadgeClass, getStatusLabel,
  getFuelLabel, getMaintenanceLabel, getCostLabel,
  getRegStatusColor, getRegStatusLabel, getRegTypeLabel,
  getMaintenanceStatusColor, getMaintenanceStatusLabel,
  EMPTY_TRUCK_FORM, EMPTY_MAINTENANCE_FORM, EMPTY_COST_FORM,
} from './data'

// ────────────────────────────────────────────────────────────
// STAT CARDS (top row)
// ────────────────────────────────────────────────────────────

export function StatCards({ stats }: { stats: FleetStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Truck className="h-3.5 w-3.5" />Укупно
        </div>
        <p className="text-2xl font-bold">{stats.totalTrucks}</p>
        <p className="text-[10px] text-muted-foreground">{formatMileage(stats.totalMileage)}</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
          <Activity className="h-3.5 w-3.5" />Активних
        </div>
        <p className="text-2xl font-bold text-emerald-700">{stats.activeTrucks}</p>
        <p className="text-[10px] text-muted-foreground">на путу</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
          <Wrench className="h-3.5 w-3.5" />На сервису
        </div>
        <p className="text-2xl font-bold text-amber-700">{stats.inService + stats.inGarage}</p>
        <p className="text-[10px] text-muted-foreground">{stats.breakdowns} кварова</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
          <AlertTriangle className="h-3.5 w-3.5" />Сервис до
        </div>
        <p className="text-2xl font-bold text-orange-700">{stats.maintenanceDueCount}</p>
        <p className="text-[10px] text-muted-foreground">заказано / преkoročено</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
          <FileCheck className="h-3.5 w-3.5" />Докум.
        </div>
        <p className="text-2xl font-bold text-red-700">
          {stats.registrationDueCount + stats.insuranceDueCount}
        </p>
        <p className="text-[10px] text-muted-foreground">истиче / истекло</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <DollarSign className="h-3.5 w-3.5" />Трошкови
        </div>
        <p className="text-lg font-bold">{formatRSDShort(stats.totalCosts)}</p>
        <p className="text-[10px] text-muted-foreground">Гориво: {formatRSDShort(stats.fuelCostsTotal)}</p>
      </Card>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// MONTHLY COSTS SUMMARY
// ────────────────────────────────────────────────────────────

export function MonthlyCostsBar({ stats }: { stats: FleetStats }) {
  const maxTotal = Math.max(...stats.monthlyCosts.map((m) => m.total), 1)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Месечни трошкови (последњих 6 месеци)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {stats.monthlyCosts.map((m) => {
            const monthParts = m.month.split('-')
            const monthIdx = parseInt(monthParts[1]) - 1
            const barPct = (m.total / maxTotal) * 100
            return (
              <div key={m.month} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium w-16">
                    {monthNames[monthIdx]} {monthParts[0].slice(2)}
                  </span>
                  <span className="font-bold text-sm">{formatRSD(m.total)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all"
                    style={{ width: `${(m.fuel / maxTotal) * 100}%` }}
                    title={`Гориво: ${formatRSD(m.fuel)}`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${(m.service / maxTotal) * 100}%` }}
                    title={`Сервис: ${formatRSD(m.service)}`}
                  />
                  <div
                    className="h-full bg-slate-400 rounded-r-full transition-all"
                    style={{ width: `${(m.other / maxTotal) * 100}%` }}
                    title={`Остало: ${formatRSD(m.other)}`}
                  />
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Гориво {formatRSDShort(m.fuel)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Сервис {formatRSDShort(m.service)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Остало {formatRSDShort(m.other)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// FLEET TABLE (Vozni Park tab)
// ────────────────────────────────────────────────────────────

interface FleetTableProps {
  trucks: Truck[]
  search: string
  onSearchChange: (v: string) => void
  statusFilter: TruckStatus | ''
  onStatusFilterChange: (v: TruckStatus | '') => void
  onAdd: () => void
  onEdit: (truck: Truck) => void
  onDelete: (id: string) => void
  loading: boolean
}

export function FleetTable({
  trucks, search, onSearchChange, statusFilter, onStatusFilterChange,
  onAdd, onEdit, onDelete, loading,
}: FleetTableProps) {
  const filtered = useMemo(() => {
    return trucks.filter((t) => {
      const matchesSearch = !search ||
        t.plate.toLowerCase().includes(search.toLowerCase()) ||
        t.make.toLowerCase().includes(search.toLowerCase()) ||
        t.model.toLowerCase().includes(search.toLowerCase()) ||
        t.driver.toLowerCase().includes(search.toLowerCase()) ||
        t.vin.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [trucks, search, statusFilter])

  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />Списак камиона
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} од {trucks.length} камиона
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />Нови камион
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Претрага (табlice, марка, VIN, возач)..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter || '_all'} onValueChange={(v) => onStatusFilterChange(v === '_all' ? '' : v as TruckStatus)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Сви статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви статуси</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Нема камиона за приказ</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Таблице</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Марка / Модел</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Год.</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Гориво</TableHead>
                  <TableHead className="text-xs">Статус</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell text-right">Километража</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Возач</TableHead>
                  <TableHead className="text-xs text-right">Акције</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((truck) => (
                  <>
                    <TableRow key={truck.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === truck.id ? null : truck.id)}>
                      <TableCell className="p-1">
                        {expandedId === truck.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-xs">{truck.plate}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">
                        <span className="font-medium">{truck.make}</span>{' '}
                        <span className="text-muted-foreground">{truck.model}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{truck.year}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {getFuelLabel(truck.fuelType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 ${getStatusBadgeClass(truck.status)}`}>
                          {getStatusLabel(truck.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-right font-mono">
                        {formatMileage(truck.mileage)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{truck.driver || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(truck)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(truck.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Expanded row */}
                    {expandedId === truck.id && (
                      <TableRow key={`${truck.id}-expanded`}>
                        <TableCell colSpan={9} className="p-0">
                          <div className="bg-muted/30 p-4 border-b">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <CarFront className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">VIN</p>
                                  <p className="font-mono">{truck.vin || '—'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Гориво</p>
                                  <p>{getFuelLabel(truck.fuelType)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Регистрација до</p>
                                  <p className={getDaysRemaining(truck.registrationExpiry) <= 30 ? 'text-red-600 font-semibold' : ''}>
                                    {formatDate(truck.registrationExpiry)}
                                    {getDaysRemaining(truck.registrationExpiry) <= 30 && getDaysRemaining(truck.registrationExpiry) > 0 && (
                                      <span className="ml-1">({getDaysRemaining(truck.registrationExpiry)} дана)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Тех. преглед</p>
                                  <p className={getDaysRemaining(truck.techInspectionExpiry) <= 30 ? 'text-red-600 font-semibold' : ''}>
                                    {formatDate(truck.techInspectionExpiry)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Осигурање до</p>
                                  <p className={getDaysRemaining(truck.insuranceExpiry) <= 30 ? 'text-red-600 font-semibold' : ''}>
                                    {formatDate(truck.insuranceExpiry)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Возач</p>
                                  <p>{truck.driver || '—'}</p>
                                </div>
                              </div>
                            </div>
                            {truck.notes && (
                              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{truck.notes}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// TRUCK FORM DIALOG (add / edit)
// ────────────────────────────────────────────────────────────

interface TruckFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  truck: Truck | null
  onSave: (data: TruckFormData) => void
  submitting: boolean
}

export function TruckFormDialog({ open, onOpenChange, truck, onSave, submitting }: TruckFormDialogProps) {
  const [form, setForm] = useState<TruckFormData>(EMPTY_TRUCK_FORM)

  // Populate form when editing
  const isOpen = open
  useState(() => {
    if (isOpen && truck) {
      setForm({
        plate: truck.plate,
        make: truck.make,
        model: truck.model,
        year: truck.year,
        vin: truck.vin,
        fuelType: truck.fuelType,
        status: truck.status,
        mileage: truck.mileage,
        driver: truck.driver,
        registrationExpiry: truck.registrationExpiry?.split('T')[0] || '',
        techInspectionExpiry: truck.techInspectionExpiry?.split('T')[0] || '',
        insuranceExpiry: truck.insuranceExpiry?.split('T')[0] || '',
        notes: truck.notes,
      })
    } else if (isOpen && !truck) {
      setForm(EMPTY_TRUCK_FORM)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.plate || !form.make || !form.model) return
    onSave(form)
  }

  const updateField = <K extends keyof TruckFormData>(key: K, value: TruckFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {truck ? 'Уреди камион' : 'Нови камион'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Plate + VIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Регистарске таблице *</Label>
              <Input
                placeholder="нпр. БГ-001-AB"
                value={form.plate}
                onChange={(e) => updateField('plate', e.target.value)}
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">VIN број шасије *</Label>
              <Input
                placeholder="нпр. WDB9540121K123456"
                value={form.vin}
                onChange={(e) => updateField('vin', e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Row 2: Make + Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Марка *</Label>
              <Select value={form.make} onValueChange={(v) => updateField('make', v)} required>
                <SelectTrigger><SelectValue placeholder="Изаберите марку" /></SelectTrigger>
                <SelectContent>
                  {MAKE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Модел *</Label>
              <Input
                placeholder="нпр. Actros 1845"
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 3: Year + Fuel + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Годиште</Label>
              <Input
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(e) => updateField('year', parseInt(e.target.value) || 2024)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Гориво</Label>
              <Select value={form.fuelType} onValueChange={(v) => updateField('fuelType', v as FuelType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FUEL_TYPE_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Статус</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v as TruckStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Mileage + Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Километража</Label>
              <Input
                type="number"
                min={0}
                value={form.mileage}
                onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Возач</Label>
              <Input
                placeholder="Име возача"
                value={form.driver}
                onChange={(e) => updateField('driver', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Registration dates */}
          <div>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />Документа и рокови
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Регистрација до</Label>
                <Input
                  type="date"
                  value={form.registrationExpiry}
                  onChange={(e) => updateField('registrationExpiry', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Тех. преглед до</Label>
                <Input
                  type="date"
                  value={form.techInspectionExpiry}
                  onChange={(e) => updateField('techInspectionExpiry', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Осигурање до</Label>
                <Input
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={(e) => updateField('insuranceExpiry', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Напомене</Label>
            <Textarea
              placeholder="Додатне информације о камиону..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Откажи</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Чување...' : truck ? 'Сачувај измене' : 'Додај камион'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────
// REGISTRATION TAB (Registracija)
// ────────────────────────────────────────────────────────────

interface RegistrationTabProps {
  items: RegistrationItem[]
}

export function RegistrationTab({ items }: RegistrationTabProps) {
  const [typeFilter, setTypeFilter] = useState<'' | 'registracija' | 'tehnicki' | 'osiguranje'>('')
  const [statusFilter, setStatusFilter] = useState<'' | 'važeće' | 'ističe_uskoro' | 'isteklo'>('')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = !typeFilter || item.type === typeFilter
      const matchesStatus = !statusFilter || item.status === statusFilter
      return matchesType && matchesStatus
    })
  }, [items, typeFilter, statusFilter])

  const urgentCount = items.filter((i) => i.status === 'isteklo').length
  const warningCount = items.filter((i) => i.status === 'ističe_uskoro').length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileCheck className="h-4 w-4" />Пратиња документа
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Регистрација, технички преглед, осигурање
            </p>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <Badge className="bg-red-100 text-red-800 text-[10px]">
                {urgentCount} истекло
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                {warningCount} истиче ускоро
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-3">
          <Select value={typeFilter || '_all'} onValueChange={(v) => setTypeFilter(v === '_all' ? '' : v as RegistrationItem['type'])}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Сви типови" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви типови</SelectItem>
              <SelectItem value="registracija">Регистрација</SelectItem>
              <SelectItem value="tehnicki">Тех. преглед</SelectItem>
              <SelectItem value="osiguranje">Осигурање</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter || '_all'} onValueChange={(v) => setStatusFilter(v === '_all' ? '' : v as RegistrationItem['status'])}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Сви статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви статуси</SelectItem>
              <SelectItem value="važeće">Važeće</SelectItem>
              <SelectItem value="ističe_uskoro">Ističе uskoro</SelectItem>
              <SelectItem value="isteklo">Isteklo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Таблице</TableHead>
                <TableHead className="text-xs">Тип</TableHead>
                <TableHead className="text-xs">Истиче</TableHead>
                <TableHead className="text-xs">Преостало</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Издато</TableHead>
                <TableHead className="text-xs hidden md:table-cell text-right">Трошак</TableHead>
                <TableHead className="text-xs">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    Нема докум. за приказ
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-semibold text-xs">{item.truckPlate}</TableCell>
                    <TableCell className="text-xs">{getRegTypeLabel(item.type)}</TableCell>
                    <TableCell className="text-xs font-medium">{formatDate(item.expiryDate)}</TableCell>
                    <TableCell className="text-xs">
                      <span className={item.daysRemaining < 0 ? 'text-red-600 font-semibold' : item.daysRemaining <= 30 ? 'text-amber-600 font-semibold' : ''}>
                        {item.daysRemaining < 0
                          ? `Истекло ${Math.abs(item.daysRemaining)} дана`
                          : `${item.daysRemaining} дана`}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell text-muted-foreground">{formatDate(item.issueDate)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell text-right">{formatRSD(item.cost)}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-0 ${getRegStatusColor(item.status)}`}>
                        {getRegStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// MAINTENANCE TAB (Održavanje)
// ────────────────────────────────────────────────────────────

interface MaintenanceTabProps {
  records: MaintenanceRecord[]
  trucks: Truck[]
  onAdd: () => void
  onDelete: (id: string) => void
}

export function MaintenanceTab({ records, trucks, onAdd, onDelete }: MaintenanceTabProps) {
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | ''>('')
  const [statusFilter, setStatusFilter] = useState<MaintenanceRecord['status'] | ''>('')

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesType = !typeFilter || r.type === typeFilter
      const matchesStatus = !statusFilter || r.status === statusFilter
      return matchesType && matchesStatus
    })
  }, [records, typeFilter, statusFilter])

  const totalCost = records.reduce((s, r) => s + r.cost, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wrench className="h-4 w-4" />Одржавање и сервис
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {records.length} записа · Укупно: {formatRSD(totalCost)}
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />Нови запис
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-3">
          <Select value={typeFilter || '_all'} onValueChange={(v) => setTypeFilter(v === '_all' ? '' : v as MaintenanceType)}>
            <SelectTrigger className="w-[170px] h-8 text-xs">
              <SelectValue placeholder="Сви типови" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви типови</SelectItem>
              {MAINTENANCE_TYPE_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter || '_all'} onValueChange={(v) => setStatusFilter(v === '_all' ? '' : v as MaintenanceRecord['status'])}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Сви статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви статуси</SelectItem>
              <SelectItem value="zakazano">Заказано</SelectItem>
              <SelectItem value="u_toku">U toku</SelectItem>
              <SelectItem value="zavrseno">Завршено</SelectItem>
              <SelectItem value="otkazano">Отказано</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Таблице</TableHead>
                <TableHead className="text-xs">Тип</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Опис</TableHead>
                <TableHead className="text-xs">Датум</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Радионика</TableHead>
                <TableHead className="text-xs text-right">Трошак</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Следећи</TableHead>
                <TableHead className="text-xs">Статус</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                    Нема записа за приказ
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono font-semibold text-xs">{record.truckPlate || '—'}</TableCell>
                    <TableCell className="text-xs">{getMaintenanceLabel(record.type)}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell max-w-[200px] truncate">{record.description}</TableCell>
                    <TableCell className="text-xs">{formatDate(record.date)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{record.workshop}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatRSD(record.cost)}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell text-muted-foreground">{formatDate(record.nextDueDate)}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-0 ${getMaintenanceStatusColor(record.status)}`}>
                        {getMaintenanceStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(record.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// MAINTENANCE FORM DIALOG
// ────────────────────────────────────────────────────────────

interface MaintenanceFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  trucks: Truck[]
  onSave: (data: MaintenanceFormData) => void
  submitting: boolean
}

export function MaintenanceFormDialog({ open, onOpenChange, trucks, onSave, submitting }: MaintenanceFormDialogProps) {
  const [form, setForm] = useState<MaintenanceFormData>(EMPTY_MAINTENANCE_FORM)

  useState(() => {
    if (open) setForm(EMPTY_MAINTENANCE_FORM)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.truckId || !form.description) return
    onSave(form)
  }

  const updateField = <K extends keyof MaintenanceFormData>(key: K, value: MaintenanceFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />Нови сервисни запис
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Камион *</Label>
            <Select value={form.truckId} onValueChange={(v) => updateField('truckId', v)} required>
              <SelectTrigger><SelectValue placeholder="Изаберите камион" /></SelectTrigger>
              <SelectContent>
                {trucks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.plate} — {t.make} {t.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Тип рада *</Label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v as MaintenanceType)} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Статус</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v as MaintenanceFormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="zakazano">Заказано</SelectItem>
                  <SelectItem value="u_toku">U toku</SelectItem>
                  <SelectItem value="zavrseno">Завршено</SelectItem>
                  <SelectItem value="otkazano">Отказано</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Опис *</Label>
            <Textarea
              placeholder="Опис рада..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Датум</Label>
              <Input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Трошак (RSD)</Label>
              <Input
                type="number"
                min={0}
                value={form.cost || ''}
                onChange={(e) => updateField('cost', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Километража</Label>
              <Input
                type="number"
                min={0}
                value={form.mileage || ''}
                onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Радионика</Label>
              <Input
                placeholder="Назив сервиса"
                value={form.workshop}
                onChange={(e) => updateField('workshop', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Следећи сервис (датум)</Label>
              <Input type="date" value={form.nextDueDate} onChange={(e) => updateField('nextDueDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Следећи (km)</Label>
              <Input
                type="number"
                min={0}
                value={form.nextDueMileage || ''}
                onChange={(e) => updateField('nextDueMileage', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Откажи</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Чување...' : 'Сачувај'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────
// COSTS TAB (Troškovi)
// ────────────────────────────────────────────────────────────

interface CostsTabProps {
  costs: TruckCost[]
  trucks: Truck[]
  onAdd: () => void
  onDelete: (id: string) => void
}

export function CostsTab({ costs, trucks, onAdd, onDelete }: CostsTabProps) {
  const [typeFilter, setTypeFilter] = useState<CostType | ''>('')
  const [truckFilter, setTruckFilter] = useState<string>('')

  const filtered = useMemo(() => {
    return costs
      .filter((c) => {
        const matchesType = !typeFilter || c.type === typeFilter
        const matchesTruck = !truckFilter || c.truckId === truckFilter
        return matchesType && matchesTruck
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [costs, typeFilter, truckFilter])

  const totalFiltered = filtered.reduce((s, c) => s + c.amount, 0)
  const fuelPct = totalFiltered > 0 ? (filtered.filter((c) => c.type === 'gorivo').reduce((s, c) => s + c.amount, 0) / totalFiltered) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />Трошкови
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} трошкова · Укупно: {formatRSD(totalFiltered)}
              {fuelPct > 0 && <span className="ml-2">· Гориво: {fuelPct.toFixed(0)}%</span>}
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />Нови трошак
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-3">
          <Select value={truckFilter || '_all'} onValueChange={(v) => setTruckFilter(v === '_all' ? '' : v)}>
            <SelectTrigger className="w-[170px] h-8 text-xs">
              <SelectValue placeholder="Сви камиони" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви камиони</SelectItem>
              {trucks.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.plate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter || '_all'} onValueChange={(v) => setTypeFilter(v === '_all' ? '' : v as CostType)}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Сви типови" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Сви типови</SelectItem>
              {COST_TYPE_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Таблице</TableHead>
                <TableHead className="text-xs">Тип</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Опис</TableHead>
                <TableHead className="text-xs">Датум</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Добављач</TableHead>
                <TableHead className="text-xs text-right">Износ</TableHead>
                <TableHead className="text-xs hidden lg:table-cell text-right">km</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                    Нема трошкова за приказ
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-mono font-semibold text-xs">{cost.truckPlate || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {getCostLabel(cost.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell max-w-[200px] truncate">{cost.description}</TableCell>
                    <TableCell className="text-xs">{formatDate(cost.date)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell text-muted-foreground">{cost.supplier || '—'}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatRSD(cost.amount)}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell text-right font-mono text-muted-foreground">
                      {cost.mileage ? formatMileage(cost.mileage) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(cost.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// COST FORM DIALOG
// ────────────────────────────────────────────────────────────

interface CostFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  trucks: Truck[]
  onSave: (data: CostFormData) => void
  submitting: boolean
}

export function CostFormDialog({ open, onOpenChange, trucks, onSave, submitting }: CostFormDialogProps) {
  const [form, setForm] = useState<CostFormData>(EMPTY_COST_FORM)

  useState(() => {
    if (open) setForm(EMPTY_COST_FORM)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.truckId || !form.description) return
    onSave(form)
  }

  const updateField = <K extends keyof CostFormData>(key: K, value: CostFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />Нови трошак
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Камион *</Label>
            <Select value={form.truckId} onValueChange={(v) => updateField('truckId', v)} required>
              <SelectTrigger><SelectValue placeholder="Изаберите камион" /></SelectTrigger>
              <SelectContent>
                {trucks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.plate} — {t.make} {t.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Тип *</Label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v as CostType)} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COST_TYPE_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Износ (RSD) *</Label>
              <Input
                type="number"
                min={0}
                step={100}
                value={form.amount || ''}
                onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Опис *</Label>
            <Input
              placeholder="Опис трошка..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Датум</Label>
              <Input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Километража</Label>
              <Input
                type="number"
                min={0}
                value={form.mileage || ''}
                onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Бр. документа</Label>
              <Input
                placeholder="нпр. RAC-2024-1101"
                value={form.documentRef}
                onChange={(e) => updateField('documentRef', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Добављач</Label>
              <Input
                placeholder="Назив добављача"
                value={form.supplier}
                onChange={(e) => updateField('supplier', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Откажи</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Чување...' : 'Сачувај'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
