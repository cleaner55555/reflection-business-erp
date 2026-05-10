'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Trash2, Pencil, Eye, Filter, MapPin, Truck, Clock, Fuel, Navigation, Route, BarChart3, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'

// ─── Types ───────────────────────────────────────────────
interface Stop {
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

interface RouteItem {
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

const STATUSES: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  planned: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Planirana', icon: Route },
  in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'U toku', icon: Navigation },
  completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Završena', icon: CheckCircle2 },
  delayed: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Kasni', icon: AlertTriangle },
  cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Otkazana', icon: AlertTriangle },
}

const PRIORITIES: Record<string, { color: string; label: string }> = {
  high: { color: 'bg-red-100 text-red-700', label: 'Visok' },
  medium: { color: 'bg-amber-100 text-amber-700', label: 'Srednji' },
  low: { color: 'bg-slate-100 text-slate-600', label: 'Nizak' },
}

const DRIVERS = ['Marko Petrović', 'Jovan Stanković', 'Slobodan Nikolić', 'Dragan Milić', 'Nebojša Jovanović', 'Predrag Tomić', 'Goran Đorđević', 'Milan Stojanović']
const VEHICLES = ['Kamion A-123', 'Kamion B-456', 'Kamion C-789', 'Kamion D-321', 'Kamion E-654', 'Kamion F-987', 'Kamion G-135', 'Kamion H-246']

// ─── Helpers ─────────────────────────────────────────────
function getStatusBadge(s: string) {
  const r = STATUSES[s]
  const Icon = r?.icon || Route
  return r ? <Badge className={`${r.color} text-xs gap-1`}><Icon className="h-3 w-3" />{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function getPriorityBadge(p: string) {
  const r = PRIORITIES[p]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{p}</Badge>
}

function getStopStatusBadge(s: string) {
  const colors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    in_transit: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    skipped: 'bg-orange-100 text-orange-700',
  }
  const labels: Record<string, string> = {
    pending: 'Na čekanju', in_transit: 'U tranzitu', completed: 'Završeno', skipped: 'Preskočeno',
  }
  return <Badge className={`${colors[s] || ''} text-xs`}>{labels[s] || s}</Badge>
}

function calcRouteProgress(stops: Stop[]) {
  if (!stops.length) return 0
  const completed = stops.filter(s => s.status === 'completed' || s.status === 'skipped').length
  return Math.round((completed / stops.length) * 100)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n)
}

// ─── Component ───────────────────────────────────────────
export function Routes() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<RouteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<RouteItem | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({ name: '', code: '', driver: '', vehicle: '', origin: '', destination: '', priority: 'medium' as RouteItem['priority'], totalDistance: 0, estimatedTime: '', fuelCost: 0, tollCost: 0, notes: '' })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/routes?companyId=${activeCompanyId}`)
      if (res.ok) {
        const items = await res.json()
        setData(items)
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }, [activeCompanyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()) || item.driver.toLowerCase().includes(search.toLowerCase()) || item.origin.toLowerCase().includes(search.toLowerCase()) || item.destination.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchPriority = !priorityFilter || item.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  }), [data, search, statusFilter, priorityFilter])

  const stats = useMemo(() => ({
    total: data.length,
    planned: data.filter(r => r.status === 'planned').length,
    inProgress: data.filter(r => r.status === 'in_progress').length,
    completed: data.filter(r => r.status === 'completed').length,
    delayed: data.filter(r => r.status === 'delayed').length,
    totalDistance: data.reduce((s, r) => s + r.totalDistance, 0),
    totalCost: data.reduce((s, r) => s + r.fuelCost + r.tollCost, 0),
    totalStops: data.reduce((s, r) => s + r.stops.length, 0),
  }), [data])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Obrisati rutu?')) return
    try {
      const res = await fetch(`/api/routes/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' })
      if (res.ok) { setData(prev => prev.filter(i => i.id !== id)); toast.success('Ruta obrisana') }
    } catch { toast.error('Greška pri brisanju') }
  }, [activeCompanyId])

  const handleOpenCreate = () => {
    setFormData({ name: '', code: `RT-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, driver: '', vehicle: '', origin: '', destination: '', priority: 'medium', totalDistance: 0, estimatedTime: '', fuelCost: 0, tollCost: 0, notes: '' })
    setEditItem(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: RouteItem) => {
    setFormData({ name: item.name, code: item.code, driver: item.driver, vehicle: item.vehicle, origin: item.origin, destination: item.destination, priority: item.priority, totalDistance: item.totalDistance, estimatedTime: item.estimatedTime, fuelCost: item.fuelCost, tollCost: item.tollCost, notes: item.notes })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.origin || !formData.destination || !formData.driver) { toast.error('Popunite sva obavezna polja'); return }
    try {
      const url = editItem ? `/api/routes/${editItem.id}?companyId=${activeCompanyId}` : `/api/routes?companyId=${activeCompanyId}`
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editItem ? { ...formData, companyId: activeCompanyId } : { ...formData, companyId: activeCompanyId, stops: '[]', startDate: new Date().toISOString().split('T')[0], status: 'planned' }) })
      if (res.ok) {
        const saved = await res.json()
        if (editItem) { setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...formData } : r)) } else { setData(prev => [saved, ...prev]) }
        toast.success(editItem ? 'Ruta ažurirana' : 'Nova ruta kreirana')
        setDialogOpen(false)
        setEditItem(null)
      }
    } catch { toast.error('Greška pri čuvanju') }
  }, [editItem, formData, activeCompanyId])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Navigation className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Rute</h1><p className="text-sm text-muted-foreground">Upravljanje transportnim rutama</p></div></div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Nova ruta</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Planirane</div><p className="text-xl font-bold text-slate-700">{stats.planned}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U toku</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Završene</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Kasne</div><p className="text-xl font-bold text-amber-700">{stats.delayed}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Udaljenost</div><p className="text-xl font-bold">{stats.totalDistance} km</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Troškovi</div><p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Lista ruta</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Sve rute</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={priorityFilter || 'all'} onValueChange={v => setPriorityFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="Prioritet" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Kod</TableHead>
                    <TableHead className="text-xs">Ruta</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Vozač</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Prioritet</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Dist.</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Prog.</TableHead>
                    <TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema pronađenih ruta</TableCell></TableRow> : filtered.map(item => {
                      const progress = calcRouteProgress(item.stops)
                      return (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                          <TableCell className="text-xs font-mono">{item.code}</TableCell>
                          <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{item.origin} → {item.destination}</div></TableCell>
                          <TableCell className="text-xs hidden sm:table-cell"><div className="flex items-center gap-1"><Truck className="h-3 w-3 text-muted-foreground" />{item.driver}</div></TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="hidden md:table-cell">{getPriorityBadge(item.priority)}</TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">{item.totalDistance} km</TableCell>
                          <TableCell className="hidden lg:table-cell"><div className="w-16"><Progress value={progress} className="h-1.5" /><span className="text-xs text-muted-foreground">{progress}%</span></div></TableCell>
                          <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active routes */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Navigation className="h-4 w-4 text-blue-600" />Aktivne rute</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {data.filter(r => r.status === 'in_progress' || r.status === 'delayed').length === 0 ? <p className="text-xs text-muted-foreground">Nema aktivnih ruta</p> : data.filter(r => r.status === 'in_progress' || r.status === 'delayed').map(r => (
                  <div key={r.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">{r.code}</span>
                      {getStatusBadge(r.status)}
                    </div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3" />{r.driver}
                      <span className="mx-1">·</span>
                      <MapPin className="h-3 w-3" />{r.origin} → {r.destination}
                    </div>
                    <Progress value={calcRouteProgress(r.stops)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{r.stops.filter(s => s.status === 'completed').length}/{r.stops.length} stanica</span>
                      <span>{r.totalDistance} km</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Upcoming routes */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Route className="h-4 w-4 text-slate-600" />Nadolazeće rute</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {data.filter(r => r.status === 'planned').length === 0 ? <p className="text-xs text-muted-foreground">Nema planiranih ruta</p> : data.filter(r => r.status === 'planned').map(r => (
                  <div key={r.id} className="p-3 rounded-lg border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">{r.code}</span>
                      {getPriorityBadge(r.priority)}
                    </div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.estimatedTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.totalDistance} km</span>
                      <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{formatCurrency(r.fuelCost)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Datum: {formatDate(r.startDate)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Cost overview */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Fuel className="h-4 w-4 text-amber-600" />Troškovi po ruti</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {data.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div><p className="text-xs font-medium">{r.code}</p><p className="text-xs text-muted-foreground">{r.origin} → {r.destination}</p></div>
                    <div className="text-right"><p className="text-xs font-bold">{formatCurrency(r.fuelCost + r.tollCost)}</p><p className="text-xs text-muted-foreground">Gorivo: {formatCurrency(r.fuelCost)}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Driver workload */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" />Opterećenje vozača</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {(() => {
                  const driverMap: Record<string, { routes: number; distance: number; active: number }> = {}
                  data.forEach(r => {
                    if (!driverMap[r.driver]) driverMap[r.driver] = { routes: 0, distance: 0, active: 0 }
                    driverMap[r.driver].routes++
                    driverMap[r.driver].distance += r.totalDistance
                    if (r.status === 'in_progress') driverMap[r.driver].active++
                  })
                  return Object.entries(driverMap).sort((a, b) => b[1].routes - a[1].routes).map(([driver, info]) => (
                    <div key={driver} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div><p className="text-xs font-medium">{driver}</p><p className="text-xs text-muted-foreground">{info.routes} ruta · {info.distance} km</p></div>
                      {info.active > 0 && <Badge className="bg-blue-100 text-blue-700 text-xs">{info.active} aktivna</Badge>}
                    </div>
                  ))
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail View */}
      {detailId && detailItem && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">Detalji rute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-lg font-bold">{detailItem.name}</p><p className="text-xs text-muted-foreground">{detailItem.code}</p></div>
                <div className="flex gap-2">{getStatusBadge(detailItem.status)}{getPriorityBadge(detailItem.priority)}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Vozač</div><p className="text-xs font-medium">{detailItem.driver}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Vozilo</div><p className="text-xs font-medium">{detailItem.vehicle}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Udaljenost</div><p className="text-xs font-medium">{detailItem.totalDistance} km</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Vreme</div><p className="text-xs font-medium">{detailItem.estimatedTime}</p></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Gorivo</div><p className="text-xs font-medium">{formatCurrency(detailItem.fuelCost)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Putarine</div><p className="text-xs font-medium">{formatCurrency(detailItem.tollCost)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xs font-bold">{formatCurrency(detailItem.fuelCost + detailItem.tollCost)}</p></div>
              </div>

              {/* Route visualization */}
              <div className="p-4 rounded-lg border">
                <p className="text-xs font-medium mb-3 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Trasa: {detailItem.origin} → {detailItem.destination}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /></div>
                    <div><p className="text-xs font-medium">{detailItem.origin}</p><p className="text-xs text-muted-foreground">Polazak: {formatDate(detailItem.startDate)}</p></div>
                  </div>
                  {detailItem.stops.map((stop, idx) => (
                    <div key={stop.id} className="flex items-center gap-3 ml-2">
                      <div className="w-px h-4 bg-border" />
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${stop.status === 'completed' ? 'bg-emerald-100' : stop.status === 'in_transit' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        {stop.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : stop.status === 'in_transit' ? <Navigation className="h-3 w-3 text-blue-600" /> : <span className="text-xs font-bold text-slate-500">{idx + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><p className="text-xs font-medium">{stop.location}</p>{getStopStatusBadge(stop.status)}</div>
                        <p className="text-xs text-muted-foreground">{stop.address}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{stop.cargo} · {stop.weight}kg</span>
                          <span>{stop.estimatedArrival} - {stop.estimatedDeparture}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center"><MapPin className="h-3.5 w-3.5 text-blue-600" /></div>
                    <div><p className="text-xs font-medium">{detailItem.destination}</p><p className="text-xs text-muted-foreground">{detailItem.endDate ? `Dolazak: ${formatDate(detailItem.endDate)}` : 'Predviđeni dolazak'}</p></div>
                  </div>
                </div>
              </div>

              <Progress value={calcRouteProgress(detailItem.stops)} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Napredak: {calcRouteProgress(detailItem.stops)}% · {detailItem.stops.filter(s => s.status === 'completed').length}/{detailItem.stops.length} stanica</p>

              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {dialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setDialogOpen(false); setEditItem(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">{editItem ? 'Uredi rutu' : 'Nova ruta'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label className="text-xs">Kod rute</Label><Input placeholder="RT-2024-001" className="text-xs" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} /></div>
                <div className="grid gap-2"><Label className="text-xs">Prioritet</Label><Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v as RouteItem['priority'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid gap-2"><Label className="text-xs">Naziv rute *</Label><Input placeholder="Beograd - Novi Sad" className="text-xs" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label className="text-xs">Polazište *</Label><Input placeholder="Beograd" className="text-xs" value={formData.origin} onChange={e => setFormData(p => ({ ...p, origin: e.target.value }))} /></div>
                <div className="grid gap-2"><Label className="text-xs">Odredište *</Label><Input placeholder="Novi Sad" className="text-xs" value={formData.destination} onChange={e => setFormData(p => ({ ...p, destination: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label className="text-xs">Vozač *</Label><Select value={formData.driver} onValueChange={v => setFormData(p => ({ ...p, driver: v }))}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi vozača" /></SelectTrigger><SelectContent>{DRIVERS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-2"><Label className="text-xs">Vozilo</Label><Select value={formData.vehicle} onValueChange={v => setFormData(p => ({ ...p, vehicle: v }))}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi vozilo" /></SelectTrigger><SelectContent>{VEHICLES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2"><Label className="text-xs">Udaljenost (km)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.totalDistance || ''} onChange={e => setFormData(p => ({ ...p, totalDistance: Number(e.target.value) }))} /></div>
                <div className="grid gap-2"><Label className="text-xs">Procenjeno vreme</Label><Input placeholder="2h 30m" className="text-xs" value={formData.estimatedTime} onChange={e => setFormData(p => ({ ...p, estimatedTime: e.target.value }))} /></div>
                <div className="grid gap-2"><Label className="text-xs">Trošak goriva (RSD)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.fuelCost || ''} onChange={e => setFormData(p => ({ ...p, fuelCost: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid gap-2"><Label className="text-xs">Putarine (RSD)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.tollCost || ''} onChange={e => setFormData(p => ({ ...p, tollCost: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Beleške</Label><Textarea placeholder="Dodatne informacije..." className="text-xs" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button>
              <Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
