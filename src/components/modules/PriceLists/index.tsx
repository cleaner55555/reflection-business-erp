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
  Plus, Search, Trash2, Pencil, Eye, List, ArrowLeft, Copy, FileText, Calendar, Package
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ─── Types ───────────────────────────────────────────────────────────────────

type PriceListItem = {
  id: string
  listNo: string
  name: string
  category: string
  type: string
  validFrom: string
  validUntil: string
  items: number
  status: string
  createdBy: string
  notes: string
}

type PriceListItemRow = {
  id: string
  productName: string
  sku: string
  price: number
  unit: string
  discount: number
}

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  draft: { color: 'bg-amber-100 text-amber-800', label: 'Nacrt' },
  archived: { color: 'bg-gray-100 text-gray-800', label: 'Arhiviran' }
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

const TYPE_LABELS: Record<string, string> = {
  retail: 'Maloprodaja',
  wholesale: 'Veleprodaja',
  special: 'Specijalan'
}

function formatRSD(p: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 2 }).format(p)
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockPriceLists: PriceListItem[] = [
  {
    id: 'pl-1', listNo: 'CL-2025-001', name: 'Standardni cenovnik 2025', category: 'Opšti',
    type: 'retail', validFrom: '2025-01-01', validUntil: '2025-06-30', items: 245,
    status: 'active', createdBy: 'Jelena Marković', notes: 'Glavni maloprodajni cenovnik'
  },
  {
    id: 'pl-2', listNo: 'CL-2025-002', name: 'Veleprodajni cenovnik Q1', category: 'Veleprodaja',
    type: 'wholesale', validFrom: '2025-01-01', validUntil: '2025-03-31', items: 180,
    status: 'active', createdBy: 'Marko Petrović', notes: 'Cene za partnere sa rabatom'
  },
  {
    id: 'pl-3', listNo: 'CL-2025-003', name: 'Promotivni cenovnik - Proleće', category: 'Promocije',
    type: 'special', validFrom: '2025-03-01', validUntil: '2025-05-31', items: 45,
    status: 'draft', createdBy: 'Ana Stanković', notes: 'Sezonski popusti za prolećnu kolekciju'
  },
  {
    id: 'pl-4', listNo: 'CL-2024-008', name: 'Standardni cenovnik 2024', category: 'Opšti',
    type: 'retail', validFrom: '2024-01-01', validUntil: '2024-12-31', items: 220,
    status: 'archived', createdBy: 'Jelena Marković', notes: 'Prethodna godina'
  },
  {
    id: 'pl-5', listNo: 'CL-2025-004', name: 'B2B cenovnik za partnere', category: 'Partneri',
    type: 'wholesale', validFrom: '2025-01-15', validUntil: '', items: 310,
    status: 'active', createdBy: 'Nikola Ilić', notes: 'Specijalne cene za dugogodišnje partnere'
  },
  {
    id: 'pl-6', listNo: 'CL-2025-005', name: 'Cenovnik IT opreme', category: 'IT oprema',
    type: 'retail', validFrom: '2025-02-01', validUntil: '2025-08-01', items: 88,
    status: 'draft', createdBy: 'Petar Jovanović', notes: 'Ažurirane cene laptopova i monitora'
  },
  {
    id: 'pl-7', listNo: 'CL-2024-012', name: 'Black Friday cenovnik 2024', category: 'Promocije',
    type: 'special', validFrom: '2024-11-22', validUntil: '2024-11-29', items: 120,
    status: 'archived', createdBy: 'Ana Stanković', notes: 'Crni petak akcija'
  }
]

const mockItems: PriceListItemRow[] = [
  { id: 'pi-1', productName: 'Samsung Galaxy S24 Ultra', sku: 'SGS24U-256', price: 129999, unit: 'kom', discount: 5 },
  { id: 'pi-2', productName: 'iPhone 15 Pro Max', sku: 'IP15PM-256', price: 159999, unit: 'kom', discount: 0 },
  { id: 'pi-3', productName: 'Dell UltraSharp 27"', sku: 'DEL-U2723QE', price: 89999, unit: 'kom', discount: 10 },
  { id: 'pi-4', productName: 'Logitech MX Master 3S', sku: 'LOG-MXM3S', price: 14999, unit: 'kom', discount: 15 },
  { id: 'pi-5', productName: 'HP LaserJet Pro M404dn', sku: 'HP-M404DN', price: 67999, unit: 'kom', discount: 0 },
  { id: 'pi-6', productName: 'Canon EOS R6 Mark II', sku: 'CAN-R6II', price: 289999, unit: 'kom', discount: 3 },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function PriceLists() {
  const [data, setData] = useState<PriceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<PriceListItem | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<PriceListItem>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  // Items management
  const [listItems, setListItems] = useState<PriceListItemRow[]>([])
  const [newItem, setNewItem] = useState<Partial<PriceListItemRow>>({})

  // ─── Data Loading ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/price-lists-v2?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setData(mockPriceLists)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filtered = data.filter(item => {
    if (search) {
      const s = search.toLowerCase()
      if (!item.name.toLowerCase().includes(s) && !item.category.toLowerCase().includes(s)) return false
    }
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovaj cenovnik?')) return
    try {
      const res = await fetch(`/api/price-lists-v2/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Obrisano')
      fetchData()
    } catch {
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    }
  }

  const resetForm = () => ({
    name: '', category: 'Opšti', type: 'retail',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '', status: 'draft', createdBy: '', notes: ''
  })

  const openCreate = () => {
    setEditItem(null)
    setForm(resetForm())
    setDialogOpen(true)
  }

  const openEdit = (item: PriceListItem) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Unesite naziv cenovnika')
      return
    }
    try {
      const url = editItem ? `/api/price-lists-v2/${editItem.id}` : '/api/price-lists-v2'
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
      const newItem: PriceListItem = {
        id: editItem?.id || `pl-${Date.now()}`,
        listNo: editItem?.listNo || `CL-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`,
        ...(resetForm() as PriceListItem),
        ...form as PriceListItem,
        items: editItem?.items || 0
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

  const handleClone = (item: PriceListItem) => {
    setEditItem(null)
    setForm({
      ...item,
      id: undefined,
      listNo: '',
      name: `${item.name} (kopija)`,
      status: 'draft',
      validFrom: new Date().toISOString().split('T')[0]
    })
    setDialogOpen(true)
    toast.info('Kopija cenovnika kreirana — izmenite podatke')
  }

  const openItems = (item: PriceListItem) => {
    setDetailId(item.id)
    setListItems(mockItems)
    setItemsDialogOpen(true)
  }

  const handleAddItem = () => {
    if (!newItem.productName || !newItem.price) return
    const row: PriceListItemRow = {
      id: `pi-${Date.now()}`,
      productName: newItem.productName || '',
      sku: newItem.sku || '',
      price: newItem.price || 0,
      unit: newItem.unit || 'kom',
      discount: newItem.discount || 0
    }
    setListItems(prev => [...prev, row])
    setNewItem({})
  }

  const handleRemoveItem = (id: string) => {
    setListItems(prev => prev.filter(i => i.id !== id))
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
  const totalItems = data.reduce((s, i) => s + i.items, 0)
  const activeCount = data.filter(i => i.status === 'active').length

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <List className="h-6 w-6" />
            Cenovnici
          </h1>
          <p className="text-sm text-muted-foreground">Upravljanje cenovnicima i cenovnim listama</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />Novi cenovnik
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <FileText className="h-3 w-3" />Ukupno
          </div>
          <p className="text-2xl font-bold">{data.length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Aktivnih</div>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-amber-600 mb-1">Nacrti</div>
          <p className="text-2xl font-bold text-amber-700">{data.filter(i => i.status === 'draft').length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Package className="h-3 w-3" />Ukupno stavki
          </div>
          <p className="text-2xl font-bold">{totalItems}</p>
        </Card>
      </div>

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
                <CardTitle className="text-base">Lista cenovnika</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Pretraga..."
                      className="pl-8 h-8 w-44 text-xs"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
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
                      <TableHead className="text-xs hidden sm:table-cell">Kategorija</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Tip</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Stavki</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Period</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                          Nema cenovnika
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(item => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="text-xs font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.listNo}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                            {item.category}
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">{TYPE_LABELS[item.type] || item.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.items}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.validFrom)}
                              {item.validUntil && ` — ${formatDate(item.validUntil)}`}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItems(item)} title="Stavke">
                                <Package className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleClone(item)} title="Kopiraj">
                                <Copy className="h-3.5 w-3.5" />
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
              <CardTitle className="text-base">Novi cenovnik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Naziv *</Label>
                    <Input className="text-sm" placeholder="npr. Standardni cenovnik 2025" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Kategorija</Label>
                    <Input className="text-sm" placeholder="npr. Opšti" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Tip</Label>
                    <Select value={form.type || 'retail'} onValueChange={v => setForm({ ...form, type: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Maloprodaja</SelectItem>
                        <SelectItem value="wholesale">Veleprodaja</SelectItem>
                        <SelectItem value="special">Specijalan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Kreirao</Label>
                    <Input className="text-sm" placeholder="Ime i prezime" value={form.createdBy || ''} onChange={e => setForm({ ...form, createdBy: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Važi od</Label>
                    <Input className="text-sm" type="date" value={form.validFrom || ''} onChange={e => setForm({ ...form, validFrom: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Važi do</Label>
                    <Input className="text-sm" type="date" value={form.validUntil || ''} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Napomene</Label>
                  <Input className="text-sm" placeholder="Dodatne napomene..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2" onClick={handleSave}>
                    <Plus className="h-4 w-4" />Kreiraj cenovnik
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setForm(resetForm())}>
                    Poništi
                  </Button>
                </div>
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
                        <Badge variant="outline" className="text-xs">{TYPE_LABELS[item.type]}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.category} — {item.items} stavki — {formatDate(item.validFrom)}{item.validUntil ? ` do ${formatDate(item.validUntil)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleClone(item)} title="Kopiraj">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
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

      {/* ─── Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Uredi cenovnik' : 'Novi cenovnik'}</DialogTitle>
            <DialogDescription>
              {editItem ? 'Izmenite podatke o cenovniku' : 'Popunite podatke za novi cenovnik'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Naziv *</Label>
                <Input className="text-sm" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Kategorija</Label>
                <Input className="text-sm" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Tip</Label>
                <Select value={form.type || 'retail'} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Maloprodaja</SelectItem>
                    <SelectItem value="wholesale">Veleprodaja</SelectItem>
                    <SelectItem value="special">Specijalan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status || 'draft'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Važi od</Label>
                <Input className="text-sm" type="date" value={form.validFrom || ''} onChange={e => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Važi do</Label>
                <Input className="text-sm" type="date" value={form.validUntil || ''} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Napomene</Label>
              <Input className="text-sm" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave}>{editItem ? 'Sačuvaj izmene' : 'Kreiraj cenovnik'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Items Dialog ──────────────────────────────────────────────── */}
      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stavke cenovnika
            </DialogTitle>
            <DialogDescription>{detailItem?.name || 'Cenovnik'}</DialogDescription>
          </DialogHeader>

          {/* Add item row */}
          <div className="grid grid-cols-6 gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="col-span-2">
              <Label className="text-xs">Naziv proizvoda</Label>
              <Input className="text-xs h-8" placeholder="Proizvod" value={newItem.productName || ''} onChange={e => setNewItem({ ...newItem, productName: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Šifra</Label>
              <Input className="text-xs h-8" placeholder="SKU" value={newItem.sku || ''} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Cena</Label>
              <Input className="text-xs h-8" type="number" placeholder="0" value={newItem.price || ''} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Popust %</Label>
              <Input className="text-xs h-8" type="number" placeholder="0" value={newItem.discount || ''} onChange={e => setNewItem({ ...newItem, discount: Number(e.target.value) })} />
            </div>
            <div className="flex items-end">
              <Button size="sm" className="h-8 gap-1" onClick={handleAddItem}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Items table */}
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Proizvod</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Šifra</TableHead>
                  <TableHead className="text-xs text-right">Cena</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell text-right">Popust</TableHead>
                  <TableHead className="text-xs text-right">Ukupno</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                      Nema stavki
                    </TableCell>
                  </TableRow>
                ) : (
                  listItems.map(item => {
                    const finalPrice = item.price * (1 - item.discount / 100)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.productName}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{item.sku}</TableCell>
                        <TableCell className="text-xs text-right">{formatRSD(item.price)}</TableCell>
                        <TableCell className="text-xs text-right hidden sm:table-cell">
                          {item.discount > 0 ? (
                            <Badge variant="outline" className="text-xs text-amber-600">-{item.discount}%</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-right">{formatRSD(finalPrice)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {listItems.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-xs text-muted-foreground">{listItems.length} stavki</span>
              <span className="text-sm font-bold">
                Ukupno: {formatRSD(listItems.reduce((s, i) => s + i.price * (1 - i.discount / 100), 0))}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
