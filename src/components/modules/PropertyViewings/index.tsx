'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Plus, Search, Trash2, Pencil, Eye, Calendar, ArrowLeft, Clock, User, Phone, MapPin, Building
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ─── Types ───────────────────────────────────────────────────────────────────

type Viewing = {
  id: string
  viewingNo: string
  propertyTitle: string
  clientName: string
  phone: string
  agent: string
  date: string
  time: string
  duration: number
  status: string
  clientInterest: string
  feedback: string
  notes: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUSES: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Zakazano', icon: <Calendar className="h-3 w-3" /> },
  completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Obavljeno', icon: <CheckIcon className="h-3 w-3" /> },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazano', icon: <XIcon className="h-3 w-3" /> },
  no_show: { color: 'bg-amber-100 text-amber-800', label: 'Nije došao', icon: <AlertIcon className="h-3 w-3" /> }
}

const INTERESTS: Record<string, { color: string; label: string }> = {
  high: { color: 'bg-emerald-100 text-emerald-800', label: 'Visoko' },
  medium: { color: 'bg-amber-100 text-amber-800', label: 'Srednje' },
  low: { color: 'bg-gray-100 text-gray-800', label: 'Nisko' },
  none: { color: 'bg-red-100 text-red-800', label: 'Nema' }
}

const AGENTS = [
  'Ana Stanković', 'Marko Petrović', 'Petar Jovanović', 'Nikola Ilić',
  'Jelena Marković', 'Milan Đorđević'
]

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function getInterestBadge(s: string) {
  const r = INTERESTS[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

// Small inline icon components to avoid import issues
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockViewings: Viewing[] = [
  {
    id: 'v-1', viewingNo: 'OB-2025-001', propertyTitle: 'Stan 3.0, Cara Dušana 15, Novi Sad',
    clientName: 'Jovan Petrović', phone: '+381631234567', agent: 'Ana Stanković',
    date: '2025-01-25', time: '17:00', duration: 45, status: 'scheduled',
    clientInterest: 'medium', feedback: '', notes: 'Prvi pregled, zainteresovan za trosoban'
  },
  {
    id: 'v-2', viewingNo: 'OB-2025-002', propertyTitle: 'Kuća 120m², Fruškogorska 8, Sremski Karlovci',
    clientName: 'Milica Jovanović', phone: '+381648765432', agent: 'Marko Petrović',
    date: '2025-01-24', time: '11:00', duration: 60, status: 'completed',
    clientInterest: 'high', feedback: 'Veoma zadovoljna, zatražila je ponudu.', notes: 'Zainteresovana za vikend kuću'
  },
  {
    id: 'v-3', viewingNo: 'OB-2025-003', propertyTitle: 'Lokal 45m², Železnička 3, Subotica',
    clientName: 'B2B Solutions d.o.o.', phone: '+38124555678', agent: 'Petar Jovanović',
    date: '2025-01-22', time: '15:00', duration: 30, status: 'completed',
    clientInterest: 'low', feedback: 'Predimenzionisan za njihove potrebe.', notes: 'Traže manji lokal'
  },
  {
    id: 'v-4', viewingNo: 'OB-2025-004', propertyTitle: 'Stan 2.0, Bul. Oslobodenja 72, Novi Sad',
    clientName: 'Sara Ilić', phone: '+381651112233', agent: 'Ana Stanković',
    date: '2025-01-26', time: '10:00', duration: 30, status: 'scheduled',
    clientInterest: 'medium', feedback: '', notes: ''
  },
  {
    id: 'v-5', viewingNo: 'OB-2025-005', propertyTitle: 'Stan 4.0, Novosadskog sajma 9, Novi Sad',
    clientName: 'Dragan Milić', phone: '+38166222334', agent: 'Nikola Ilić',
    date: '2025-01-20', time: '16:00', duration: 45, status: 'no_show',
    clientInterest: 'none', feedback: 'Klijent se nije javio na telefon.', notes: 'Pokušati ponovo kontaktirati'
  },
  {
    id: 'v-6', viewingNo: 'OB-2025-006', propertyTitle: 'Garsonjera 28m², Futoška 55, Novi Sad',
    clientName: 'Ivana Stojković', phone: '+381664445566', agent: 'Ana Stanković',
    date: '2025-01-18', time: '12:00', duration: 30, status: 'cancelled',
    clientInterest: 'none', feedback: 'Klijent otkazao zbog obaveza.', notes: 'Zakazati novi termin'
  },
  {
    id: 'v-7', viewingNo: 'OB-2025-007', propertyTitle: 'Plac 800m², Čenejski put bb, Novi Sad',
    clientName: 'Gamma Corp d.o.o.', phone: '+38111334455', agent: 'Marko Petrović',
    date: '2025-01-27', time: '09:00', duration: 90, status: 'scheduled',
    clientInterest: 'high', feedback: '', notes: 'Veliki interes za investiciju'
  },
  {
    id: 'v-8', viewingNo: 'OB-2025-008', propertyTitle: 'Stan 2.5, Temerinska 120, Novi Sad',
    clientName: 'Ljubiša Tomić', phone: '+38164555667', agent: 'Jelena Marković',
    date: '2025-01-23', time: '14:00', duration: 30, status: 'completed',
    clientInterest: 'high', feedback: 'Spreman na rezervaciju, čeka odobrenje kredita.', notes: 'Hitna rezervacija moguća'
  }
]

// ─── Component ───────────────────────────────────────────────────────────────

export function PropertyViewings() {
  const [data, setData] = useState<Viewing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Viewing | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Viewing>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  // ─── Data Loading ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (agentFilter) params.set('agent', agentFilter)
      const res = await fetch(`/api/property-viewings?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setData(mockViewings)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, agentFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filtered = data.filter(item => {
    if (search) {
      const s = search.toLowerCase()
      if (!item.propertyTitle.toLowerCase().includes(s) && !item.clientName.toLowerCase().includes(s) && !item.agent.toLowerCase().includes(s)) return false
    }
    if (statusFilter && item.status !== statusFilter) return false
    if (agentFilter && item.agent !== agentFilter) return false
    return true
  })

  // Sort by date desc
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovaj pregled?')) return
    try {
      const res = await fetch(`/api/property-viewings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Obrisano')
      fetchData()
    } catch {
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    }
  }

  const resetForm = () => ({
    propertyTitle: '', clientName: '', phone: '', agent: '',
    date: new Date().toISOString().split('T')[0], time: '17:00',
    duration: 30, status: 'scheduled', clientInterest: 'medium',
    feedback: '', notes: ''
  })

  const openCreate = () => {
    setEditItem(null)
    setForm(resetForm())
    setDialogOpen(true)
  }

  const openEdit = (item: Viewing) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.propertyTitle || !form.clientName) {
      toast.error('Popunite obavezna polja (nekretnina i klijent)')
      return
    }
    try {
      const url = editItem ? `/api/property-viewings/${editItem.id}` : '/api/property-viewings'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      toast.success(editItem ? 'Ažurirano' : 'Kreirano')
      setDialogOpen(false)
      fetchData()
    } catch {
      const newItem: Viewing = {
        id: editItem?.id || `v-${Date.now()}`,
        viewingNo: editItem?.viewingNo || `OB-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`,
        ...(resetForm() as Viewing),
        ...form as Viewing
      }
      if (editItem) {
        setData(prev => prev.map(i => i.id === editItem.id ? newItem : i))
        toast.success('Ažurirano')
      } else {
        setData(prev => [newItem, ...prev])
        toast.success('Kreirano')
      }
      setDialogOpen(false)
    }
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  // ─── Computed Stats ─────────────────────────────────────────────────────

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const upcomingCount = data.filter(i => i.status === 'scheduled').length
  const completedCount = data.filter(i => i.status === 'completed').length
  const highInterestCount = data.filter(i => i.clientInterest === 'high').length
  const noShowCount = data.filter(i => i.status === 'no_show').length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayViewings = data.filter(i => i.date === todayStr && i.status === 'scheduled')

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Pregledi nekretnina
          </h1>
          <p className="text-sm text-muted-foreground">Zakazivanje i praćenje obilazaka nekretnina</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />Novi pregled
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />Ukupno
          </div>
          <p className="text-2xl font-bold">{data.length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-blue-600 mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />Predstojeći
          </div>
          <p className="text-2xl font-bold text-blue-700">{upcomingCount}</p>
          <p className="text-xs text-muted-foreground">{todayViewings.length} danas</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Obavljeni</div>
          <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
          <p className="text-xs text-muted-foreground">{highInterestCount} zainteresovanih</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-red-600 mb-1">Nije došao</div>
          <p className="text-2xl font-bold text-red-700">{noShowCount}</p>
        </Card>
      </div>

      {/* Today's viewings banner */}
      {todayViewings.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Današnji pregledi ({todayViewings.length})</span>
            </div>
            <div className="space-y-1">
              {todayViewings.map(v => (
                <div key={v.id} className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600 font-mono text-xs">{v.time}</span>
                  <span className="font-medium">{v.propertyTitle}</span>
                  <span className="text-muted-foreground">— {v.clientName}</span>
                  <Badge variant="outline" className="text-xs">{v.agent}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          <TabsTrigger value="dodaj">Dodaj</TabsTrigger>
          <TabsTrigger value="uredi">Uredi</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista pregleda</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi</SelectItem>
                      {Object.entries(STATUSES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={agentFilter || 'all'} onValueChange={v => setAgentFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Agent" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi agenti</SelectItem>
                      {AGENTS.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Nekretnina</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Klijent</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Datum/Vreme</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Agent</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Interes</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                          Nema pregleda
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(item => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="text-xs font-medium max-w-[180px] truncate">{item.propertyTitle}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />{item.duration} min
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="text-xs">{item.clientName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />{item.phone}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                            {formatDate(item.date)} {item.time}
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">{item.agent}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {item.status !== 'scheduled' ? getInterestBadge(item.clientInterest) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Dodaj Tab ───────────────────────────────────────────────── */}
        <TabsContent value="dodaj" className="mt-4">
          <Card className="sm:max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">Novi pregled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label className="text-xs flex items-center gap-1"><Building className="h-3 w-3" />Nekretnina *</Label>
                    <Input className="text-sm" placeholder="npr. Stan 3.0, Cara Dušana 15" value={form.propertyTitle || ''} onChange={e => setForm({ ...form, propertyTitle: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs flex items-center gap-1"><User className="h-3 w-3" />Klijent *</Label>
                    <Input className="text-sm" placeholder="Ime i prezime" value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />Telefon</Label>
                    <Input className="text-sm" placeholder="+381..." value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Agent</Label>
                    <Select value={form.agent || ''} onValueChange={v => setForm({ ...form, agent: v })}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Izaberite agenta" /></SelectTrigger>
                      <SelectContent>
                        {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />Trajanje (min)</Label>
                    <Input className="text-sm" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Datum</Label>
                    <Input className="text-sm" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Vreme</Label>
                    <Input className="text-sm" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Napomene</Label>
                  <Input className="text-sm" placeholder="Dodatne napomene..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}>
                  <Plus className="h-4 w-4" />Zakaži pregled
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Uredi Tab ───────────────────────────────────────────────── */}
        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lista za uređivanje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium max-w-[200px] truncate">{item.propertyTitle}</span>
                        {getStatusBadge(item.status)}
                        {item.status !== 'scheduled' && getInterestBadge(item.clientInterest)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{item.clientName}</span>
                        <span className="hidden sm:inline">— {formatDate(item.date)} {item.time}</span>
                        <span className="hidden md:inline">— {item.agent}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Detail Panel ──────────────────────────────────────────────── */}
      {detailId && detailItem && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base">Detalji pregleda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                {detailItem.propertyTitle}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Klijent', value: detailItem.clientName, icon: <User className="h-3 w-3" /> },
                  { label: 'Telefon', value: detailItem.phone, icon: <Phone className="h-3 w-3" /> },
                  { label: 'Agent', value: detailItem.agent, icon: <User className="h-3 w-3" /> },
                  { label: 'Datum', value: formatDate(detailItem.date), icon: <Calendar className="h-3 w-3" /> },
                  { label: 'Vreme', value: detailItem.time, icon: <Clock className="h-3 w-3" /> },
                  { label: 'Trajanje', value: `${detailItem.duration} min`, icon: <Clock className="h-3 w-3" /> }
                ].map(({ label, value, icon }) => (
                  <div key={label} className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                    <div className="text-muted-foreground mt-0.5">{icon}</div>
                    <div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="text-xs font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="p-3 rounded-lg bg-muted/50 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  {getStatusBadge(detailItem.status)}
                </div>
                <div className="p-3 rounded-lg bg-muted/50 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Nivo interesovanja</div>
                  {getInterestBadge(detailItem.clientInterest)}
                </div>
              </div>

              {detailItem.feedback && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Fidbek</div>
                  <div className="text-sm">{detailItem.feedback}</div>
                </div>
              )}
              {detailItem.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Napomene</div>
                  <div className="text-sm">{detailItem.notes}</div>
                </div>
              )}

              <Separator />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setDetailId(null); openEdit(detailItem) }}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />Uredi
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { handleDelete(detailItem.id); setDetailId(null) }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Obriši
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Create/Edit Dialog ────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Uredi pregled' : 'Novi pregled'}</DialogTitle>
            <DialogDescription>
              {editItem ? 'Izmenite detalje pregleda' : 'Zakažite novi pregled nekretnine'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2 sm:col-span-2">
                <Label className="text-xs">Nekretnina *</Label>
                <Input className="text-sm" value={form.propertyTitle || ''} onChange={e => setForm({ ...form, propertyTitle: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Klijent *</Label>
                <Input className="text-sm" value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Telefon</Label>
                <Input className="text-sm" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Agent</Label>
                <Select value={form.agent || ''} onValueChange={v => setForm({ ...form, agent: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Datum</Label>
                <Input className="text-sm" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Vreme</Label>
                <Input className="text-sm" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Trajanje (min)</Label>
                <Input className="text-sm" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status || 'scheduled'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Interesovanje</Label>
                <Select value={form.clientInterest || 'medium'} onValueChange={v => setForm({ ...form, clientInterest: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(INTERESTS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Fidbek</Label>
              <Input className="text-sm" value={form.feedback || ''} onChange={e => setForm({ ...form, feedback: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Napomene</Label>
              <Input className="text-sm" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave}>{editItem ? 'Sačuvaj izmene' : 'Zakaži pregled'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
