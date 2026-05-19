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
import { Separator } from '@/components/ui/separator'
import {
  Plus, Search, Trash2, Pencil, Eye, Tag, Printer, ArrowLeft,
  ScanBarcode, QrCode, Ruler, Palette, Layers
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ─── Types ───────────────────────────────────────────────────────────────────

type LabelItem = {
  id: string
  labelNo: string
  name: string
  sku: string
  price: number
  category: string
  status: string
  size: string
  material: string
  color: string
  quantity: number
  costPerUnit: number
  printDate: string
  notes: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, string> = {
  product: 'Proizvod',
  shipping: 'Transport',
  promotion: 'Promocija',
  barcode: 'Barkod',
  qr: 'QR kod',
  price: 'Cena',
  warning: 'Upozorenje',
  ingredient: 'Sastojci'
}

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivna' },
  inactive: { color: 'bg-gray-100 text-gray-800', label: 'Neaktivna' }
}

const COLORS: Record<string, string> = {
  bela: 'Bela',
  crna: 'Crna',
  transparentna: 'Transparentna',
  zuta: 'Žuta',
  crvena: 'Crvena',
  plava: 'Plava',
  zelena: 'Zelena'
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function formatRSD(p: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 2 }).format(p)
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockLabels: LabelItem[] = [
  {
    id: 'l-1', labelNo: 'ETK-001', name: 'Barkod etiketa standard', sku: 'BAR-STD',
    price: 0, category: 'barcode', status: 'active', size: '50x30mm', material: 'Samolepljiva',
    color: 'bela', quantity: 5000, costPerUnit: 0.50, printDate: '2025-01-15', notes: 'Standardne EAN-13 etikete'
  },
  {
    id: 'l-2', labelNo: 'ETK-002', name: 'Cenovna etiketa mala', sku: 'CEN-SM',
    price: 0, category: 'price', status: 'active', size: '40x20mm', material: 'Samolepljiva',
    color: 'bela', quantity: 10000, costPerUnit: 0.30, printDate: '2025-01-10', notes: 'Za policu prodavnice'
  },
  {
    id: 'l-3', labelNo: 'ETK-003', name: 'Transportna etiketa A5', sku: 'TRN-A5',
    price: 0, category: 'shipping', status: 'active', size: '148x210mm', material: 'Papirna',
    color: 'bela', quantity: 2000, costPerUnit: 2.50, printDate: '2025-01-12', notes: 'Za kutije pošiljki'
  },
  {
    id: 'l-4', labelNo: 'ETK-004', name: 'QR kod etiketa', sku: 'QR-STD',
    price: 0, category: 'qr', status: 'active', size: '60x40mm', material: 'Samolepljiva',
    color: 'bela', quantity: 3000, costPerUnit: 0.80, printDate: '2025-01-08', notes: 'Sa QR kodom za proizvod'
  },
  {
    id: 'l-5', labelNo: 'ETK-005', name: 'Etiketa sastojaka', sku: 'ING-01',
    price: 0, category: 'ingredient', status: 'active', size: '80x50mm', material: 'Samolepljiva',
    color: 'transparentna', quantity: 1500, costPerUnit: 1.20, printDate: '2025-01-05', notes: 'Za prehrambene proizvode'
  },
  {
    id: 'l-6', labelNo: 'ETK-006', name: 'Promotivna etiketa - Leto', sku: 'PROM-L',
    price: 0, category: 'promotion', status: 'active', size: '70x40mm', material: 'Sjajna folija',
    color: 'žuta', quantity: 800, costPerUnit: 3.00, printDate: '2024-12-20', notes: 'Sezonska promocija'
  },
  {
    id: 'l-7', labelNo: 'ETK-007', name: 'Upozorenje - Lomljivo', sku: 'UPZ-LM',
    price: 0, category: 'warning', status: 'active', size: '50x30mm', material: 'Samolepljiva',
    color: 'žuta', quantity: 500, costPerUnit: 1.50, printDate: '2024-11-15', notes: 'Nalepnice za lomljivu robu'
  },
  {
    id: 'l-8', labelNo: 'ETK-008', name: 'Stara cenovna etiketa', sku: 'CEN-OLD',
    price: 0, category: 'price', status: 'inactive', size: '40x20mm', material: 'Samolepljiva',
    color: 'crna', quantity: 2000, costPerUnit: 0.25, printDate: '2024-06-01', notes: 'Zamena novim modelom'
  }
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Labels() {
  const [data, setData] = useState<LabelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [editItem, setEditItem] = useState<LabelItem | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<LabelItem>>({})
  const [activeTab, setActiveTab] = useState('pregled')
  const [previewItem, setPreviewItem] = useState<LabelItem | null>(null)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (catFilter) params.set('category', catFilter)
      const res = await fetch(`/api/labels?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setData(mockLabels)
    } finally {
      setLoading(false)
    }
  }, [search, catFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filtered = data.filter(item => {
    if (search) {
      const s = search.toLowerCase()
      if (!item.name.toLowerCase().includes(s) && !item.sku.toLowerCase().includes(s)) return false
    }
    if (catFilter && item.category !== catFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovu etiketu?')) return
    try {
      const res = await fetch(`/api/labels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Obrisano')
      fetchData()
    } catch {
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    }
  }

  const resetForm = () => ({
    name: '', sku: '', price: 0, category: 'product', status: 'active',
    size: '50x30mm', material: 'Samolepljiva', color: 'bela',
    quantity: 1000, costPerUnit: 1, printDate: new Date().toISOString().split('T')[0], notes: ''
  })

  const handleNew = () => {
    setEditItem(null)
    setForm(resetForm())
    setActiveTab('dodaj')
  }

  const handleEdit = (item: LabelItem) => {
    setEditItem(item)
    setForm({ ...item })
    setActiveTab('dodaj')
  }

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Unesite naziv etikete')
      return
    }
    try {
      const url = editItem ? `/api/labels/${editItem.id}` : '/api/labels'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      toast.success(editItem ? 'Ažurirano' : 'Kreirano')
      if (!editItem) {
        setForm(resetForm())
      } else {
        setEditItem(null)
      }
      setActiveTab('pregled')
      fetchData()
    } catch {
      const newItem: LabelItem = {
        id: editItem?.id || `l-${Date.now()}`,
        labelNo: editItem?.labelNo || `ETK-${String(data.length + 1).padStart(3, '0')}`,
        ...(resetForm() as LabelItem),
        ...form as LabelItem
      }
      if (editItem) {
        setData(prev => prev.map(i => i.id === editItem.id ? newItem : i))
        toast.success('Ažurirano')
      } else {
        setData(prev => [newItem, ...prev])
        toast.success('Kreirano')
      }
      setEditItem(null)
      setActiveTab('pregled')
    }
  }

  const handlePrint = (item: LabelItem) => {
    setPreviewItem(item)
    toast.success(`Štampa etikete: ${item.name}`)
  }

  const handleCancelEdit = () => {
    setEditItem(null)
    setActiveTab('pregled')
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
  const totalQty = data.reduce((s, i) => s + i.quantity, 0)
  const totalCost = data.reduce((s, i) => s + i.quantity * i.costPerUnit, 0)
  const activeCount = data.filter(i => i.status === 'active').length

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="h-6 w-6" />
            Etikete
          </h1>
          <p className="text-sm text-muted-foreground">Upravljanje etiketama, barkodovima i oznakama</p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleNew}>
          <Plus className="h-4 w-4" />Nova etiketa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Tag className="h-3 w-3" />Ukupno
          </div>
          <p className="text-2xl font-bold">{data.length}</p>
          <p className="text-xs text-muted-foreground">{activeCount} aktivnih</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Aktivnih</div>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Layers className="h-3 w-3" />Ukupno komada
          </div>
          <p className="text-2xl font-bold">{totalQty.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Ukupna cena</div>
          <p className="text-lg font-bold">{formatRSD(totalCost)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); if (v !== 'dodaj') setEditItem(null) }}>
        <TabsList>
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          <TabsTrigger value="dodaj">{editItem ? 'Uredi' : 'Dodaj'}</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista etiketa</CardTitle>
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
                  <Select value={catFilter || 'all'} onValueChange={v => setCatFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve kategorije</SelectItem>
                      {Object.entries(CATEGORIES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
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
                      <TableHead className="text-xs hidden sm:table-cell">SKU</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Kategorija</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Količina</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Dimenzije</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                          Nema etiketa
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(item => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="text-xs font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.labelNo}</div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{item.sku}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{CATEGORIES[item.category]}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.size} — {item.material}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(item)} title="Štampaj">
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
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

        {/* ─── Dodaj/Uredi Tab ─────────────────────────────────────────── */}
        <TabsContent value="dodaj" className="mt-4">
          <Card className="sm:max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                {editItem && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <CardTitle className="text-base">{editItem ? `Uredi: ${editItem.name}` : 'Nova etiketa'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Naziv *</Label>
                    <Input className="text-sm" placeholder="npr. Barkod etiketa" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Šifra (SKU)</Label>
                    <Input className="text-sm" placeholder="npr. BAR-STD" value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Kategorija</Label>
                    <Select value={form.category || 'product'} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORIES).map(([k, v]) => (
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
                        <SelectItem value="active">Aktivna</SelectItem>
                        <SelectItem value="inactive">Neaktivna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs flex items-center gap-1"><Ruler className="h-3 w-3" />Dimenzije</Label>
                    <Input className="text-sm" placeholder="50x30mm" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Količina</Label>
                    <Input className="text-sm" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Cena/kom (RSD)</Label>
                    <Input className="text-sm" type="number" step="0.01" value={form.costPerUnit || ''} onChange={e => setForm({ ...form, costPerUnit: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs flex items-center gap-1"><Palette className="h-3 w-3" />Boja</Label>
                    <Select value={form.color || 'bela'} onValueChange={v => setForm({ ...form, color: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(COLORS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Materijal</Label>
                    <Select value={form.material || 'Samolepljiva'} onValueChange={v => setForm({ ...form, material: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Samolepljiva">Samolepljiva</SelectItem>
                        <SelectItem value="Papirna">Papirna</SelectItem>
                        <SelectItem value="Sjajna folija">Sjajna folija</SelectItem>
                        <SelectItem value="Mat folija">Mat folija</SelectItem>
                        <SelectItem value="Termo papir">Termo papir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Datum štampe</Label>
                    <Input className="text-sm" type="date" value={form.printDate || ''} onChange={e => setForm({ ...form, printDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Napomene</Label>
                  <Input className="text-sm" placeholder="Dodatne napomene..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>

                {/* Cost summary */}
                {form.quantity && form.costPerUnit && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ukupna cena:</span>
                      <span className="font-bold">{formatRSD((form.quantity || 0) * (form.costPerUnit || 0))}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="gap-2" onClick={handleSave}>
                    <Plus className="h-4 w-4" />{editItem ? 'Sačuvaj izmene' : 'Dodaj etiketu'}
                  </Button>
                  {editItem && (
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>Otkaži</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Label Preview */}
          {(form.name || editItem) && (
            <Card className="mt-4 sm:max-w-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />Pregled etikete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 w-[280px] bg-white">
                    <div className="text-center space-y-3">
                      <div className="text-xs text-muted-foreground">{CATEGORIES[form.category || 'product']}</div>
                      <div className="text-sm font-bold">{form.name || 'Naziv etikete'}</div>
                      {form.sku && (
                        <div className="font-mono text-xs text-muted-foreground">{form.sku}</div>
                      )}
                      {form.price && form.price > 0 && (
                        <div className="text-lg font-bold">{formatRSD(form.price)}</div>
                      )}
                      <div className="flex justify-center items-center gap-1 text-muted-foreground">
                        <ScanBarcode className="h-4 w-4" />
                        <span className="text-xs">|||{String(form.sku || '000000').padEnd(13, '0').slice(0, 13)}|||</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{form.size || '—'}</span>
                        <span>{form.material || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
              <CardTitle className="text-base">Detalji: {detailItem.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(detailItem.status)}
                <Badge className="text-xs bg-muted">{CATEGORIES[detailItem.category]}</Badge>
                <Badge className="text-xs bg-muted">{detailItem.labelNo}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Šifra', value: detailItem.sku },
                  { label: 'Kategorija', value: CATEGORIES[detailItem.category] },
                  { label: 'Dimenzije', value: detailItem.size },
                  { label: 'Materijal', value: detailItem.material },
                  { label: 'Boja', value: COLORS[detailItem.color] || detailItem.color },
                  { label: 'Količina', value: detailItem.quantity.toLocaleString() },
                  { label: 'Cena/kom', value: formatRSD(detailItem.costPerUnit) },
                  { label: 'Ukupno', value: formatRSD(detailItem.quantity * detailItem.costPerUnit) },
                  { label: 'Štampano', value: formatDate(detailItem.printDate) }
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-xs font-medium">{value}</div>
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
                <Button size="sm" className="gap-2" onClick={() => handlePrint(detailItem)}>
                  <Printer className="h-3.5 w-3.5" />Štampaj
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setDetailId(null); handleEdit(detailItem) }}>
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

      {/* ─── Print Preview Dialog ──────────────────────────────────────── */}
      {previewItem && (
        <Card className="sm:max-w-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewItem(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base flex items-center gap-2">
                <Printer className="h-5 w-5" />Pregled štampe
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border-2 border-dashed rounded-lg bg-white text-center">
              <div className="space-y-2">
                <div className="text-lg font-bold">{previewItem.name}</div>
                {previewItem.sku && (
                  <div className="font-mono text-sm">{previewItem.sku}</div>
                )}
                <div className="flex justify-center items-center gap-1 text-muted-foreground">
                  <ScanBarcode className="h-8 w-8" />
                </div>
                <div className="text-xs text-muted-foreground">{previewItem.size} | {previewItem.material}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm p-3 bg-muted/50 rounded-lg">
              <span>Količina: {previewItem.quantity}</span>
              <span className="font-bold">{formatRSD(previewItem.quantity * previewItem.costPerUnit)}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" onClick={() => toast.success('Poslato na štampač!')}>
                <Printer className="h-4 w-4" />Štampaj {previewItem.quantity} kom
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPreviewItem(null)}>Zatvori</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
