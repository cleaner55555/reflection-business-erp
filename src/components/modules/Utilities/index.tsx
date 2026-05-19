'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Plus, Search, Trash2, Pencil, Eye, Zap, AlertTriangle, ArrowLeft,
  Phone, Building, MapPin, Receipt, Calendar, TrendingUp, Droplets, Flame, Wifi, Tv
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'

// ─── Types ───────────────────────────────────────────────────────────────────

type Utility = {
  id: string
  name: string
  provider: string
  accountNo: string
  type: string
  status: string
  monthlyAmount: number
  lastReading: number
  lastReadingDate: string
  lastBillDate: string
  lastBillAmount: number
  dueDate: string
  paidDate: string
  location: string
  notes: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPES: Record<string, string> = {
  electricity: 'Struja',
  water: 'Voda',
  gas: 'Gas',
  heating: 'Grejanje',
  internet: 'Internet',
  phone: 'Telefon',
  waste: 'Otpad',
  tv: 'TV'
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  electricity: <Zap className="h-3.5 w-3.5" />,
  water: <Droplets className="h-3.5 w-3.5" />,
  gas: <Flame className="h-3.5 w-3.5" />,
  heating: <TrendingUp className="h-3.5 w-3.5" />,
  internet: <Wifi className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
  waste: <MapPin className="h-3.5 w-3.5" />,
  tv: <Tv className="h-3.5 w-3.5" />
}

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  disconnected: { color: 'bg-gray-100 text-gray-800', label: 'Isključeno' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' }
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function formatRSD(p: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p)
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockUtilities: Utility[] = [
  {
    id: 'u-1', name: 'Struja - Poslovni prostor', provider: 'EPS Distribucija', accountNo: '210-123456-78',
    type: 'electricity', status: 'active', monthlyAmount: 28500,
    lastReading: 15420, lastReadingDate: '2025-01-10', lastBillDate: '2025-01-05',
    lastBillAmount: 31200, dueDate: '2025-01-20', paidDate: '2025-01-18',
    location: 'Knez Mihailova 42', notes: 'Dvofazna priključna snaga'
  },
  {
    id: 'u-2', name: 'Struja - Magacin', provider: 'EPS Distribucija', accountNo: '210-654321-90',
    type: 'electricity', status: 'active', monthlyAmount: 15200,
    lastReading: 8750, lastReadingDate: '2025-01-10', lastBillDate: '2025-01-05',
    lastBillAmount: 14800, dueDate: '2025-01-20', paidDate: '2025-01-19',
    location: 'Industrijska zona bb, Zemun', notes: ''
  },
  {
    id: 'u-3', name: 'Voda - Poslovni prostor', provider: 'Vodovod Novi Sad', accountNo: '215-001234',
    type: 'water', status: 'active', monthlyAmount: 8500,
    lastReading: 3420, lastReadingDate: '2025-01-08', lastBillDate: '2025-01-03',
    lastBillAmount: 7200, dueDate: '2025-01-18', paidDate: '2025-01-15',
    location: 'Knez Mihailova 42', notes: ''
  },
  {
    id: 'u-4', name: 'Internet FTTH', provider: 'SBB', accountNo: 'SB-908172',
    type: 'internet', status: 'overdue', monthlyAmount: 4500,
    lastReading: 0, lastReadingDate: '', lastBillDate: '2024-12-15',
    lastBillAmount: 4500, dueDate: '2025-01-01', paidDate: '',
    location: 'Knez Mihailova 42', notes: '100/100 Mbps — prekoračen rok'
  },
  {
    id: 'u-5', name: 'Gas - Centralno grejanje', provider: 'Srbijagas', accountNo: 'GS-445566',
    type: 'gas', status: 'active', monthlyAmount: 35000,
    lastReading: 5680, lastReadingDate: '2025-01-12', lastBillDate: '2025-01-06',
    lastBillAmount: 42000, dueDate: '2025-01-22', paidDate: '',
    location: 'Knez Mihailova 42', notes: 'Zimski period — veća potrošnja'
  },
  {
    id: 'u-6', name: 'Telefon - Fiksni', provider: 'Telekom Srbija', accountNo: 'TS-112233',
    type: 'phone', status: 'active', monthlyAmount: 2500,
    lastReading: 0, lastReadingDate: '', lastBillDate: '2025-01-02',
    lastBillAmount: 2800, dueDate: '2025-01-17', paidDate: '2025-01-16',
    location: 'Knez Mihailova 42', notes: 'Paket sa 100 minuta'
  },
  {
    id: 'u-7', name: 'Komunalni otpad', provider: 'JP Čistoća', accountNo: 'JC-778899',
    type: 'waste', status: 'active', monthlyAmount: 3200,
    lastReading: 0, lastReadingDate: '', lastBillDate: '2025-01-01',
    lastBillAmount: 3200, dueDate: '2025-01-15', paidDate: '2025-01-14',
    location: 'Knez Mihailova 42', notes: ''
  },
  {
    id: 'u-8', name: 'TV kablovska', provider: 'SBB', accountNo: 'SB-556677',
    type: 'tv', status: 'disconnected', monthlyAmount: 0,
    lastReading: 0, lastReadingDate: '', lastBillDate: '2024-09-15',
    lastBillAmount: 1800, dueDate: '2024-09-30', paidDate: '2024-09-28',
    location: 'Knez Mihailova 42', notes: 'Ukinut kanal — prelazak na streaming'
  }
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Utilities() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<Utility[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editItem, setEditItem] = useState<Utility | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Utility>>({})
  const [activeTab, setActiveTab] = useState('pregled')
  const [dialogOpen, setDialogOpen] = useState(false)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeCompanyId) params.set('companyId', activeCompanyId)
      if (search) params.set('search', search)
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/utilities?${params}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setData(mockUtilities)
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId, search, typeFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filtered = data.filter(item => {
    if (search) {
      const s = search.toLowerCase()
      if (!item.name.toLowerCase().includes(s) && !item.provider.toLowerCase().includes(s)) return false
    }
    if (typeFilter && item.type !== typeFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovaj račun?')) return
    try {
      const res = await fetch(`/api/utilities/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Obrisano')
      fetchData()
    } catch {
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    }
  }

  const resetForm = () => ({
    name: '', provider: '', accountNo: '', type: 'electricity', status: 'active',
    monthlyAmount: 0, location: '', notes: ''
  })

  const openCreate = () => {
    setEditItem(null)
    setForm(resetForm())
    setDialogOpen(true)
  }

  const openEdit = (item: Utility) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Unesite naziv')
      return
    }
    try {
      const url = editItem ? `/api/utilities/${editItem.id}` : '/api/utilities'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form })
      })
      if (!res.ok) throw new Error()
      toast.success(editItem ? 'Ažurirano' : 'Kreirano')
      setDialogOpen(false)
      setEditItem(null)
      fetchData()
    } catch {
      const newItem: Utility = {
        id: editItem?.id || `u-${Date.now()}`,
        ...(resetForm() as Utility),
        ...form as Utility,
        lastReading: 0, lastReadingDate: '', lastBillDate: '',
        lastBillAmount: 0, dueDate: '', paidDate: ''
      }
      if (editItem) {
        setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...newItem } : i))
        toast.success('Ažurirano')
      } else {
        setData(prev => [newItem, ...prev])
        toast.success('Kreirano')
      }
      setDialogOpen(false)
      setEditItem(null)
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
  const activeItems = data.filter(i => i.status === 'active')
  const monthlyTotal = activeItems.reduce((s, i) => s + (i.monthlyAmount || 0), 0)
  const overdueCount = data.filter(i => i.status === 'overdue').length
  const overdueTotal = data.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.lastBillAmount || 0), 0)
  const totalBills = data.reduce((s, i) => s + (i.lastBillAmount || 0), 0)
  const paidTotal = data.filter(i => i.paidDate).reduce((s, i) => s + (i.lastBillAmount || 0), 0)

  // Breakdown by type
  const typeBreakdown = Object.entries(TYPES).map(([key, label]) => {
    const items = data.filter(i => i.type === key && i.status === 'active')
    return { type: key, label, total: items.reduce((s, i) => s + i.monthlyAmount, 0), count: items.length }
  }).filter(t => t.count > 0)

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Komunalije
          </h1>
          <p className="text-sm text-muted-foreground">Upravljanje komunalnim računima i režijama</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />Novi račun
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Zap className="h-3 w-3" />Ukupno
          </div>
          <p className="text-2xl font-bold">{data.length}</p>
          <p className="text-xs text-muted-foreground">{activeItems.length} aktivnih</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Aktivnih</div>
          <p className="text-2xl font-bold text-emerald-700">{activeItems.length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-red-600 mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />Kasni
          </div>
          <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
          {overdueCount > 0 && (
            <p className="text-xs text-red-600">{formatRSD(overdueTotal)}</p>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Receipt className="h-3 w-3" />Mesečno
          </div>
          <p className="text-lg font-bold">{formatRSD(monthlyTotal)}</p>
          <p className="text-xs text-muted-foreground">procenjeno</p>
        </Card>
      </div>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Mesečni pregled po tipovima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {typeBreakdown.map(t => (
              <div key={t.type} className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <div className="text-muted-foreground">{TYPE_ICONS[t.type]}</div>
                <div>
                  <div className="text-xs text-muted-foreground">{t.label}</div>
                  <div className="text-sm font-bold">{formatRSD(t.total)}</div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ukupno mesečno</span>
            <span className="text-sm font-bold">{formatRSD(typeBreakdown.reduce((s, t) => s + t.total, 0))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v) }}>
        <TabsList>
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          <TabsTrigger value="uredi">Uredi</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista računa</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi tipovi</SelectItem>
                      {Object.entries(TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi statusi</SelectItem>
                      {Object.entries(STATUSES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
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
                      <TableHead className="text-xs">Naziv</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Dobavljač</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Tip</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Iznos računa</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Rok</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                          Nema rezultata
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(item => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-muted-foreground">{TYPE_ICONS[item.type]}</div>
                              <div>
                                <div className="text-xs font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground">{formatRSD(item.monthlyAmount)}/mes</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.provider}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">{TYPES[item.type]}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-semibold hidden md:table-cell">
                            {item.lastBillAmount > 0 ? formatRSD(item.lastBillAmount) : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                            {item.dueDate ? formatDate(item.dueDate) : '—'}
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
                        <div className="text-muted-foreground">{TYPE_ICONS[item.type]}</div>
                        <span className="text-xs font-medium">{item.name}</span>
                        {getStatusBadge(item.status)}
                        <Badge variant="outline" className="text-xs">{TYPES[item.type]}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{item.provider}</span>
                        <span className="hidden sm:inline">—</span>
                        <span className="font-semibold hidden sm:inline">{formatRSD(item.monthlyAmount)}/mes</span>
                        {item.location && <span className="hidden md:inline">— {item.location}</span>}
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
              <div className="text-muted-foreground">{TYPE_ICONS[detailItem.type]}</div>
              <CardTitle className="text-base">{detailItem.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(detailItem.status)}
                <Badge variant="outline" className="text-xs">{TYPES[detailItem.type]}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Dobavljač', value: detailItem.provider },
                  { label: 'Br. računa', value: detailItem.accountNo },
                  { label: 'Tip', value: TYPES[detailItem.type] },
                  { label: 'Mesečni iznos', value: formatRSD(detailItem.monthlyAmount) },
                  { label: 'Lokacija', value: detailItem.location || '—' },
                  { label: 'Zadnji račun', value: detailItem.lastBillAmount > 0 ? formatRSD(detailItem.lastBillAmount) : '—' },
                  { label: 'Datum računa', value: detailItem.lastBillDate ? formatDate(detailItem.lastBillDate) : '—' },
                  { label: 'Rok plaćanja', value: detailItem.dueDate ? formatDate(detailItem.dueDate) : '—' },
                  { label: 'Plaćeno', value: detailItem.paidDate ? `Da (${formatDate(detailItem.paidDate)})` : 'Ne' }
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-xs font-medium">{value}</div>
                  </div>
                ))}
              </div>

              {detailItem.lastReading > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Zadnje očitanje</div>
                      <div className="text-sm font-bold">{detailItem.lastReading.toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {detailItem.lastReadingDate ? formatDate(detailItem.lastReadingDate) : ''}
                    </div>
                  </div>
                </div>
              )}

              {detailItem.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Napomene</div>
                  <div className="text-xs">{detailItem.notes}</div>
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
            <DialogTitle>{editItem ? 'Uredi račun' : 'Novi račun'}</DialogTitle>
            <DialogDescription>
              {editItem ? 'Izmenite podatke o računu' : 'Dodajte novi komunalni račun'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Naziv *</Label>
                <Input className="text-sm" placeholder="npr. Struja - Poslovni prostor" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Dobavljač</Label>
                <Input className="text-sm" placeholder="npr. EPS Distribucija" value={form.provider || ''} onChange={e => setForm({ ...form, provider: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Tip</Label>
                <Select value={form.type || 'electricity'} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Mesečni iznos (RSD)</Label>
                <Input className="text-sm" type="number" value={form.monthlyAmount || ''} onChange={e => setForm({ ...form, monthlyAmount: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Br. računa kod dobavljača</Label>
                <Input className="text-sm" placeholder="npr. 210-123456-78" value={form.accountNo || ''} onChange={e => setForm({ ...form, accountNo: e.target.value })} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />Lokacija</Label>
                <Input className="text-sm" placeholder="npr. Knez Mihailova 42" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Napomene</Label>
              <Input className="text-sm" placeholder="Dodatne napomene..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave}>{editItem ? 'Sačuvaj izmene' : 'Dodaj račun'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Payment Summary ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Finansijski pregled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-lg font-bold">{formatRSD(totalBills)}</p>
              <p className="text-xs text-muted-foreground">Ukupno zaduženje</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-center">
              <p className="text-lg font-bold text-emerald-700">{formatRSD(paidTotal)}</p>
              <p className="text-xs text-muted-foreground">Plaćeno</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-center">
              <p className="text-lg font-bold text-red-700">{formatRSD(overdueTotal)}</p>
              <p className="text-xs text-muted-foreground">Prekoračeno</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-lg font-bold">{formatRSD(monthlyTotal)}</p>
              <p className="text-xs text-muted-foreground">Mesečno (procena)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
