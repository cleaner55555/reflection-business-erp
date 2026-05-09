'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Trash2, Pencil, Eye, Filter, MapPin, Truck, Clock, Fuel, Navigation, Route, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

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

// ─── Data ────────────────────────────────────────────────
const INITIAL_ROUTES: RouteItem[] = [
  {
    id: '1', name: 'Beograd - Novi Sad - Subotica', code: 'RT-2024-001', driver: 'Marko Petrović', vehicle: 'Kamion A-123',
    origin: 'Beograd', destination: 'Subotica', status: 'in_progress', priority: 'high', totalDistance: 190,
    estimatedTime: '3h 30m', actualTime: null, fuelCost: 85, tollCost: 32,
    stops: [
      { id: 's1', location: 'Novi Sad', address: 'Bulevar oslobođenja 45', estimatedArrival: '09:30', estimatedDeparture: '10:00', status: 'completed', cargo: 'Electronics', weight: 1200, notes: '' },
      { id: 's2', location: 'Subotica', address: ' Industrijska zona bb', estimatedArrival: '12:00', estimatedDeparture: '12:30', status: 'in_transit', cargo: 'Electronics', weight: 800, notes: 'Back entrance' },
    ],
    startDate: '2024-06-15', endDate: null, notes: 'Express delivery'
  },
  {
    id: '2', name: 'Niš - Skopje - Solun', code: 'RT-2024-002', driver: 'Jovan Stanković', vehicle: 'Kamion B-456',
    origin: 'Niš', destination: 'Solun', status: 'planned', priority: 'medium', totalDistance: 450,
    estimatedTime: '5h 45m', actualTime: null, fuelCost: 210, tollCost: 55,
    stops: [
      { id: 's3', location: 'Skopje', address: 'Bulevar Partizanski Odredi 12', estimatedArrival: '11:00', estimatedDeparture: '11:30', status: 'pending', cargo: 'Textiles', weight: 2500, notes: '' },
      { id: 's4', location: 'Solun', address: 'Port of Thessaloniki', estimatedArrival: '15:00', estimatedDeparture: '16:00', status: 'pending', cargo: 'Textiles', weight: 1800, notes: 'Port customs' },
    ],
    startDate: '2024-06-16', endDate: null, notes: 'International route - customs docs required'
  },
  {
    id: '3', name: 'Beograd - Pančevo - Zrenjanin', code: 'RT-2024-003', driver: 'Slobodan Nikolić', vehicle: 'Kamion C-789',
    origin: 'Beograd', destination: 'Zrenjanin', status: 'completed', priority: 'low', totalDistance: 85,
    estimatedTime: '1h 45m', actualTime: '2h 10m', fuelCost: 38, tollCost: 15,
    stops: [
      { id: 's5', location: 'Pančevo', address: 'Vojvođanska 23', estimatedArrival: '09:00', estimatedDeparture: '09:15', status: 'completed', cargo: 'Food products', weight: 600, notes: '' },
      { id: 's6', location: 'Zrenjanin', address: 'Nikole Pašića 5', estimatedArrival: '10:00', estimatedDeparture: '10:30', status: 'completed', cargo: 'Food products', weight: 400, notes: 'Cold storage required' },
    ],
    startDate: '2024-06-14', endDate: '2024-06-14', notes: 'Food transport - temperature controlled'
  },
  {
    id: '4', name: 'Kragujevac - Čačak - Užice', code: 'RT-2024-004', driver: 'Dragan Milić', vehicle: 'Kamion D-321',
    origin: 'Kragujevac', destination: 'Užice', status: 'delayed', priority: 'high', totalDistance: 130,
    estimatedTime: '2h 30m', actualTime: null, fuelCost: 62, tollCost: 20,
    stops: [
      { id: 's7', location: 'Čačak', address: 'Gavrila Principa 8', estimatedArrival: '10:30', estimatedDeparture: '10:45', status: 'completed', cargo: 'Auto parts', weight: 900, notes: '' },
      { id: 's8', location: 'Užice', address: 'Dimitrija Tucovića 15', estimatedArrival: '12:00', estimatedDeparture: '12:30', status: 'in_transit', cargo: 'Auto parts', weight: 700, notes: 'Road closure detour' },
    ],
    startDate: '2024-06-15', endDate: null, notes: 'Road construction on main road - use detour via Valjevo'
  },
  {
    id: '5', name: 'Beograd - Valjevo - Loznica', code: 'RT-2024-005', driver: 'Nebojša Jovanović', vehicle: 'Kamion E-654',
    origin: 'Beograd', destination: 'Loznica', status: 'cancelled', priority: 'low', totalDistance: 165,
    estimatedTime: '3h 00m', actualTime: null, fuelCost: 75, tollCost: 28,
    stops: [
      { id: 's9', location: 'Valjevo', address: 'Knez Miloša 1', estimatedArrival: '10:00', estimatedDeparture: '10:20', status: 'pending', cargo: 'Building materials', weight: 3500, notes: '' },
      { id: 's10', location: 'Loznica', address: 'Vuka Karadžića 30', estimatedArrival: '11:30', estimatedDeparture: '12:00', status: 'pending', cargo: 'Building materials', weight: 2000, notes: '' },
    ],
    startDate: '2024-06-15', endDate: null, notes: 'Cancelled due to client request'
  },
  {
    id: '6', name: 'Subotica - Sombor - Apatin', code: 'RT-2024-006', driver: 'Predrag Tomić', vehicle: 'Kamion F-987',
    origin: 'Subotica', destination: 'Apatin', status: 'planned', priority: 'medium', totalDistance: 95,
    estimatedTime: '1h 30m', actualTime: null, fuelCost: 42, tollCost: 10,
    stops: [
      { id: 's11', location: 'Sombor', address: 'Trg Slobode 5', estimatedArrival: '14:00', estimatedDeparture: '14:20', status: 'pending', cargo: 'Agricultural supplies', weight: 1800, notes: '' },
      { id: 's12', location: 'Apatin', address: 'Sindikat 12', estimatedArrival: '15:00', estimatedDeparture: '15:30', status: 'pending', cargo: 'Agricultural supplies', weight: 1200, notes: '' },
    ],
    startDate: '2024-06-17', endDate: null, notes: 'Seasonal agricultural transport'
  },
]

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

function calcTotalWeight(stops: Stop[]) {
  return stops.reduce((sum, s) => sum + s.weight, 0)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n)
}

// ─── Component ───────────────────────────────────────────
export function Routes() {
  const [data, setData] = useState<RouteItem[]>(INITIAL_ROUTES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<RouteItem | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({ name: '', code: '', driver: '', vehicle: '', origin: '', destination: '', priority: 'medium' as RouteItem['priority'], totalDistance: 0, estimatedTime: '', fuelCost: 0, tollCost: 0, notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

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

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati rutu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Ruta obrisana')
  }

  const handleOpenCreate = () => {
    setFormData({ name: '', code: `RT-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, driver: '', vehicle: '', origin: '', destination: '', priority: 'medium', totalDistance: 0, estimatedTime: '', fuelCost: 0, tollCost: 0, notes: '' })
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: RouteItem) => {
    setFormData({ name: item.name, code: item.code, driver: item.driver, vehicle: item.vehicle, origin: item.origin, destination: item.destination, priority: item.priority, totalDistance: item.totalDistance, estimatedTime: item.estimatedTime, fuelCost: item.fuelCost, tollCost: item.tollCost, notes: item.notes })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.origin || !formData.destination || !formData.driver) {
      toast.error('Popunite sva obavezna polja')
      return
    }
    if (editItem) {
      setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...formData } : r))
      toast.success('Ruta ažurirana')
    } else {
      const newItem: RouteItem = { ...formData, id: String(Date.now()), status: 'planned', stops: [], startDate: new Date().toISOString().split('T')[0], endDate: null, actualTime: null }
      setData(prev => [newItem, ...prev])
      toast.success('Nova ruta kreirana')
    }
    setDialogOpen(false)
    setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Navigation className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Rute</h1><p className="text-sm text-muted-foreground">Upravljanje transportnim rutama</p></div>
        </div>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji rute</DialogTitle></DialogHeader>
          {detailItem && (
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
                        {stop.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : stop.status === 'in_transit' ? <Navigation className="h-3 w-3 text-blue-600" /> : <span className="text-[8px] font-bold text-slate-500">{idx + 1}</span>}
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
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi rutu' : 'Nova ruta'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
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
          <DialogFooter><Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button><Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
