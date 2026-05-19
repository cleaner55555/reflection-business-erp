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
  Plus, Search, Trash2, Pencil, Eye, Store, MapPin, Phone,
  Mail, Users, ArrowLeft, Building2, Calendar, Ruler
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ─── Types ───────────────────────────────────────────────────────────────────

type StoreItem = {
  id: string
  storeNo: string
  name: string
  code: string
  city: string
  address: string
  phone: string
  email: string
  manager: string
  type: string
  status: string
  openDate: string
  area: number
  employees: number
  monthlyRevenue: number
  notes: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPES: Record<string, string> = {
  retail: 'Prodavnica',
  warehouse: 'Magacin',
  office: 'Biro',
  factory: 'Fabrika'
}

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivna' },
  closed: { color: 'bg-red-100 text-red-800', label: 'Zatvorena' },
  renovation: { color: 'bg-amber-100 text-amber-800', label: 'Renoviranje' }
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockStores: StoreItem[] = [
  {
    id: 's-1', storeNo: 'POS-001', name: 'Prodavnica Novi Sad - Centar', code: 'NS-C',
    city: 'Novi Sad', address: 'Trg Slobode 5', phone: '+38121555123', email: 'ns-centar@shop.rs',
    manager: 'Jelena Marković', type: 'retail', status: 'active', openDate: '2020-03-15',
    area: 120, employees: 8, monthlyRevenue: 1850000, notes: 'Glavna prodavnica'
  },
  {
    id: 's-2', storeNo: 'POS-002', name: 'Prodavnica Beograd - Knez Mihailova', code: 'BG-KM',
    city: 'Beograd', address: 'Knez Mihailova 42', phone: '+38111333144', email: 'bg-km@shop.rs',
    manager: 'Marko Petrović', type: 'retail', status: 'active', openDate: '2019-06-01',
    area: 200, employees: 12, monthlyRevenue: 3200000, notes: 'Najveća prodavnica u lancu'
  },
  {
    id: 's-3', storeNo: 'MAG-001', name: 'Magacin Zemun', code: 'ZM-M',
    city: 'Beograd', address: 'Industrijska zona bb, Zemun', phone: '+38111222155', email: 'magacin@shop.rs',
    manager: 'Nikola Ilić', type: 'warehouse', status: 'active', openDate: '2018-01-10',
    area: 800, employees: 15, monthlyRevenue: 0, notes: 'Centralni magacin'
  },
  {
    id: 's-4', storeNo: 'POS-003', name: 'Prodavnica Niš - Promenada', code: 'NI-P',
    city: 'Niš', address: 'Bulevar Nemanjića 12', phone: '+38118444166', email: 'nis@shop.rs',
    manager: 'Ana Stanković', type: 'retail', status: 'active', openDate: '2021-09-20',
    area: 95, employees: 6, monthlyRevenue: 980000, notes: 'Shopping centar Promenada'
  },
  {
    id: 's-5', storeNo: 'POS-004', name: 'Prodavnica Subotica - Korzo', code: 'SU-K',
    city: 'Subotica', address: 'Korzo 18', phone: '+38124555188', email: 'subotica@shop.rs',
    manager: 'Petar Jovanović', type: 'retail', status: 'renovation', openDate: '2017-04-01',
    area: 75, employees: 0, monthlyRevenue: 0, notes: 'Renoviranje do februara 2025'
  },
  {
    id: 's-6', storeNo: 'BIR-001', name: 'Biro Beograd - Stari Grad', code: 'BG-SG',
    city: 'Beograd', address: 'Kralja Petra 15', phone: '+38111222177', email: 'biro@shop.rs',
    manager: 'Milan Đorđević', type: 'office', status: 'active', openDate: '2016-11-01',
    area: 150, employees: 20, monthlyRevenue: 0, notes: 'Centralni poslovni prostor'
  },
  {
    id: 's-7', storeNo: 'POS-005', name: 'Prodavnica Kragujevac', code: 'KG-1',
    city: 'Kragujevac', address: 'Trg kneza Miloša 8', phone: '+38134333199', email: 'kg@shop.rs',
    manager: 'Ivana Stošić', type: 'retail', status: 'closed', openDate: '2020-01-15',
    area: 65, employees: 0, monthlyRevenue: 0, notes: 'Zatvorena zbog premalog prometa'
  },
  {
    id: 's-8', storeNo: 'FAB-001', name: 'Fabrika Pirot', code: 'PI-F',
    city: 'Pirot', address: 'Industrijska zona 3', phone: '+38110555200', email: 'fabrika@shop.rs',
    manager: 'Dragan Milić', type: 'factory', status: 'active', openDate: '2015-07-01',
    area: 2000, employees: 45, monthlyRevenue: 5500000, notes: 'Proizvodnja i pakovanje'
  }
]

function formatRSD(p: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Stores() {
  const [data, setData] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<StoreItem | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<StoreItem>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  // ─── Data Loading ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/stores?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setData(mockStores)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filtered = data.filter(item => {
    if (search) {
      const s = search.toLowerCase()
      if (!item.name.toLowerCase().includes(s) && !item.city.toLowerCase().includes(s) && !item.address.toLowerCase().includes(s)) {
        return false
      }
    }
    if (statusFilter && item.status !== statusFilter) return false
    if (typeFilter && item.type !== typeFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovu lokaciju?')) return
    try {
      const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Obrisano')
      fetchData()
    } catch {
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    }
  }

  const resetForm = () => ({
    name: '', code: '', city: '', address: '', phone: '', email: '',
    manager: '', type: 'retail', status: 'active',
    openDate: new Date().toISOString().split('T')[0],
    area: 50, employees: 2, monthlyRevenue: 0, notes: ''
  })

  const openCreate = () => {
    setEditItem(null)
    setForm(resetForm())
    setDialogOpen(true)
  }

  const openEdit = (item: StoreItem) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.city) {
      toast.error('Popunite obavezna polja (naziv i grad)')
      return
    }
    try {
      const url = editItem ? `/api/stores/${editItem.id}` : '/api/stores'
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
      // Fallback to local state
      const newItem: StoreItem = {
        id: editItem?.id || `s-${Date.now()}`,
        storeNo: editItem?.storeNo || `POS-${String(data.length + 1).padStart(3, '0')}`,
        ...(resetForm() as StoreItem),
        ...form as StoreItem
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
  const activeCount = data.filter(i => i.status === 'active').length
  const totalEmployees = data.reduce((s, i) => s + i.employees, 0)
  const totalRevenue = data.reduce((s, i) => s + i.monthlyRevenue, 0)
  const uniqueCities = new Set(data.map(i => i.city)).size

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Poslovnice
          </h1>
          <p className="text-sm text-muted-foreground">Lokacije, prodavnice, magacini i fabrike</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />Nova lokacija
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Store className="h-3 w-3" />Ukupno
          </div>
          <p className="text-2xl font-bold">{data.length}</p>
          <p className="text-xs text-muted-foreground">{uniqueCities} gradova</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Aktivnih</div>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
          <p className="text-xs text-muted-foreground">{data.filter(i => i.type === 'retail' && i.status === 'active').length} prodavnica</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Users className="h-3 w-3" />Zaposlenih
          </div>
          <p className="text-2xl font-bold">{totalEmployees}</p>
          <p className="text-xs text-muted-foreground">prosek {totalEmployees > 0 ? Math.round(totalEmployees / activeCount) : 0} po lokaciji</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-blue-600 mb-1">Mesečni promet</div>
          <p className="text-lg font-bold text-blue-700">{formatRSD(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">od aktivnih lokacija</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          <TabsTrigger value="uredi">Uredi</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista lokacija</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Pretraga..."
                      className="pl-8 h-8 w-44 text-xs"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue placeholder="Tip" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi tipovi</SelectItem>
                      {Object.entries(TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
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
                      <TableHead className="text-xs hidden sm:table-cell">Tip</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Grad</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Zaposlenih</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Menadžer</TableHead>
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
                          <TableCell className="text-xs font-medium">{item.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                            {TYPES[item.type]}
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.city}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.employees}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                            {item.manager || '—'}
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
                        <span className="text-xs font-medium">{item.name}</span>
                        {getStatusBadge(item.status)}
                        <Badge className="text-xs bg-muted">{TYPES[item.type]}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{item.city} — {item.address}
                        </span>
                        {item.manager && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {item.manager}
                          </span>
                        )}
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
              <CardTitle className="text-base">{detailItem.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(detailItem.status)}
                <Badge className="text-xs bg-muted">{TYPES[detailItem.type]}</Badge>
                <Badge className="text-xs bg-muted">{detailItem.storeNo}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Šifra', value: detailItem.code, icon: <Store className="h-3 w-3" /> },
                  { label: 'Grad', value: detailItem.city, icon: <MapPin className="h-3 w-3" /> },
                  { label: 'Adresa', value: detailItem.address, icon: <MapPin className="h-3 w-3" /> },
                  { label: 'Telefon', value: detailItem.phone, icon: <Phone className="h-3 w-3" /> },
                  { label: 'Email', value: detailItem.email || '—', icon: <Mail className="h-3 w-3" /> },
                  { label: 'Menadžer', value: detailItem.manager || '—', icon: <Users className="h-3 w-3" /> },
                  { label: 'Površina', value: `${detailItem.area} m²`, icon: <Ruler className="h-3 w-3" /> },
                  { label: 'Zaposlenih', value: String(detailItem.employees), icon: <Users className="h-3 w-3" /> },
                  { label: 'Otvorena', value: formatDate(detailItem.openDate), icon: <Calendar className="h-3 w-3" /> },
                  { label: 'Mesečni promet', value: detailItem.monthlyRevenue > 0 ? formatRSD(detailItem.monthlyRevenue) : '—', icon: <Store className="h-3 w-3" /> }
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
            <DialogTitle>{editItem ? 'Uredi lokaciju' : 'Nova lokacija'}</DialogTitle>
            <DialogDescription>
              {editItem ? 'Izmenite podatke o lokaciji' : 'Popunite podatke za novu lokaciju'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Naziv *</Label>
                <Input
                  className="text-sm"
                  placeholder="npr. Prodavnica Beograd - Centar"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Grad *</Label>
                <Input
                  className="text-sm"
                  placeholder="npr. Beograd"
                  value={form.city || ''}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Adresa</Label>
                <Input
                  className="text-sm"
                  placeholder="npr. Knez Mihailova 42"
                  value={form.address || ''}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Šifra</Label>
                <Input
                  className="text-sm"
                  placeholder="npr. BG-C"
                  value={form.code || ''}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Telefon</Label>
                <Input
                  className="text-sm"
                  placeholder="+381..."
                  value={form.phone || ''}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Email</Label>
                <Input
                  className="text-sm"
                  type="email"
                  placeholder="office@shop.rs"
                  value={form.email || ''}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Menadžer</Label>
                <Input
                  className="text-sm"
                  placeholder="Ime i prezime"
                  value={form.manager || ''}
                  onChange={e => setForm({ ...form, manager: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Tip</Label>
                <Select value={form.type || 'retail'} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Površina (m²)</Label>
                <Input
                  className="text-sm"
                  type="number"
                  value={form.area || ''}
                  onChange={e => setForm({ ...form, area: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Zaposlenih</Label>
                <Input
                  className="text-sm"
                  type="number"
                  value={form.employees || ''}
                  onChange={e => setForm({ ...form, employees: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Datum otvaranja</Label>
                <Input
                  className="text-sm"
                  type="date"
                  value={form.openDate || ''}
                  onChange={e => setForm({ ...form, openDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Mesečni promet (RSD)</Label>
              <Input
                className="text-sm"
                type="number"
                value={form.monthlyAmount || form.monthlyRevenue || ''}
                onChange={e => setForm({ ...form, monthlyRevenue: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Napomene</Label>
              <Input
                className="text-sm"
                placeholder="Dodatne napomene..."
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave}>{editItem ? 'Sačuvaj izmene' : 'Kreiraj lokaciju'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
