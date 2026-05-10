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
import { Plus, Search, Trash2, Pencil, Eye, FlaskConical, Wrench, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'

type LabEquipment = {
  id: string
  inventoryNo: string
  name: string
  category: 'measurement' | 'optical' | 'electrical' | 'chemical' | 'mechanical' | 'digital'
  manufacturer: string
  model: string
  serialNo: string
  location: string
  status: 'operational' | 'calibration' | 'maintenance' | 'out_of_order' | 'stored'
  purchaseDate: string
  purchasePrice: number
  lastCalibration: string
  nextCalibration: string
  responsible: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  notes: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  operational: { color: 'bg-emerald-100 text-emerald-800', label: 'Operativan' },
  calibration: { color: 'bg-blue-100 text-blue-800', label: 'Kalibracija' },
  maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Održavanje' },
  out_of_order: { color: 'bg-red-100 text-red-800', label: 'Kvar' },
  stored: { color: 'bg-gray-100 text-gray-800', label: 'U skladištu' },
}

const CATEGORIES: Record<string, { label: string }> = {
  measurement: { label: 'Merni' },
  optical: { label: 'Optički' },
  electrical: { label: 'Električni' },
  chemical: { label: 'Hemijski' },
  mechanical: { label: 'Mehanički' },
  digital: { label: 'Digitalni' },
}

const CONDITIONS: Record<string, { color: string; label: string }> = {
  excellent: { color: 'bg-emerald-100 text-emerald-800', label: 'Odlično' },
  good: { color: 'bg-blue-100 text-blue-800', label: 'Dobro' },
  fair: { color: 'bg-amber-100 text-amber-800', label: 'Zadovoljavajuće' },
  poor: { color: 'bg-red-100 text-red-800', label: 'Loše' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function formatPrice(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p) }

export function Lab() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<LabEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<LabEquipment | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<LabEquipment>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/lab?companyId=${activeCompanyId}`)
      if (res.ok) {
        const items = await res.json()
        setData(items)
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }, [activeCompanyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.inventoryNo, item.name, item.manufacturer, item.model, item.location, item.responsible].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Obrisati opremu?')) return
    try {
      const res = await fetch(`/api/lab/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => prev.filter(i => i.id !== id))
        toast.success('Oprema obrisana')
      }
    } catch { toast.error('Greška pri brisanju') }
  }, [activeCompanyId])

  const openCreate = useCallback(() => {
    setEditItem(null)
    setForm({ inventoryNo: `INV-LAB-${String(data.length + 1).padStart(3, '0')}`, name: '', category: 'measurement', manufacturer: '', model: '', serialNo: '', location: '', status: 'operational', purchaseDate: new Date().toISOString().split('T')[0], purchasePrice: 0, lastCalibration: '', nextCalibration: '', responsible: '', condition: 'good', notes: '' })
    setDialogOpen(true)
  }, [data.length])

  const openEdit = useCallback((item: LabEquipment) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.name || !form.manufacturer) { toast.error('Popunite obavezna polja'); return }
    try {
      const url = editItem ? `/api/lab/${editItem.id}?companyId=${activeCompanyId}` : `/api/lab?companyId=${activeCompanyId}`
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companyId: activeCompanyId }) })
      if (res.ok) {
        const saved = await res.json()
        if (editItem) {
          setData(prev => prev.map(i => i.id === editItem.id ? saved : i))
          toast.success('Oprema ažurirana')
        } else {
          setData(prev => [saved, ...prev])
          toast.success('Oprema kreirana')
        }
        setDialogOpen(false)
        setEditItem(null)
      }
    } catch { toast.error('Greška pri čuvanju') }
  }, [editItem, form, activeCompanyId])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const operationalCount = data.filter(i => i.status === 'operational').length
  const maintenanceCount = data.filter(i => i.status === 'maintenance' || i.status === 'out_of_order').length
  const totalValue = data.reduce((s, i) => s + i.purchasePrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Laboratorija</h1><p className="text-sm text-muted-foreground">Inventar laboratorijske opreme i instrumenta</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova oprema</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FlaskConical className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Operativnih</div><p className="text-2xl font-bold text-emerald-700">{operationalCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Wrench className="h-3 w-3" />Na servisu</div><p className="text-2xl font-bold text-amber-700">{maintenanceCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Vrednost</div><p className="text-xl font-bold">{formatPrice(totalValue)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista opreme</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="operational">Operativan</SelectItem><SelectItem value="calibration">Kalibracija</SelectItem><SelectItem value="maintenance">Održavanje</SelectItem><SelectItem value="out_of_order">Kvar</SelectItem><SelectItem value="stored">Skladište</SelectItem></SelectContent></Select>
                  <Select value={categoryFilter || 'all'} onValueChange={v => setCategoryFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="measurement">Merni</SelectItem><SelectItem value="optical">Optički</SelectItem><SelectItem value="electrical">Električni</SelectItem><SelectItem value="chemical">Hemijski</SelectItem><SelectItem value="mechanical">Mehanički</SelectItem><SelectItem value="digital">Digitalni</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Inv. br.</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Proizvođač</TableHead><TableHead className="text-xs hidden md:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Lokacija</TableHead><TableHead className="text-xs hidden lg:table-cell">Kalibracija</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema opreme</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-mono">{item.inventoryNo}</TableCell>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.manufacturer} {item.model}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{CATEGORIES[item.category]?.label}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{item.location}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.nextCalibration ? formatDate(item.nextCalibration) : '—'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Nova laboratorijska oprema</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Inventarni broj</Label><Input className="text-xs" value={form.inventoryNo || ''} onChange={e => setForm({ ...form, inventoryNo: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Proizvođač *</Label><Input className="text-xs" value={form.manufacturer || ''} onChange={e => setForm({ ...form, manufacturer: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Model</Label><Input className="text-xs" value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Serijski broj</Label><Input className="text-xs" value={form.serialNo || ''} onChange={e => setForm({ ...form, serialNo: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'measurement'} onValueChange={v => setForm({ ...form, category: v as LabEquipment['category'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Lokacija</Label><Input className="text-xs" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Nabavna cena (RSD)</Label><Input className="text-xs" type="number" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Datum nabavke</Label><Input className="text-xs" type="date" value={form.purchaseDate || ''} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Sledeća kalibracija</Label><Input className="text-xs" type="date" value={form.nextCalibration || ''} onChange={e => setForm({ ...form, nextCalibration: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Odgovorna osoba</Label><Input className="text-xs" value={form.responsible || ''} onChange={e => setForm({ ...form, responsible: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj opremu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi opremu</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-mono">{item.inventoryNo}</span><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.manufacturer} {item.model} — {item.location}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!!detailId && (
        <Card className="sm:max-w-[550px]">
          <CardHeader><CardTitle className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>Detalji opreme</CardTitle></CardHeader>
          <CardContent>
            {detailItem && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Inv. broj', detailItem.inventoryNo],
                    ['Naziv', detailItem.name],
                    ['Kategorija', CATEGORIES[detailItem.category]?.label],
                    ['Proizvođač', `${detailItem.manufacturer} ${detailItem.model}`],
                    ['Serijski broj', detailItem.serialNo],
                    ['Lokacija', detailItem.location],
                    ['Nabavna cena', formatPrice(detailItem.purchasePrice)],
                    ['Datum nabavke', formatDate(detailItem.purchaseDate)],
                    ['Poslednja kalibracija', detailItem.lastCalibration ? formatDate(detailItem.lastCalibration) : '—'],
                    ['Sledeća kalibracija', detailItem.nextCalibration ? formatDate(detailItem.nextCalibration) : '—'],
                    ['Odgovorna osoba', detailItem.responsible],
                  ].map(([label, val]) => (
                    <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-muted/50 flex-1"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
                  <div className="p-2 rounded-lg bg-muted/50 flex-1"><div className="text-xs text-muted-foreground mb-1">Stanje</div><Badge className={`${CONDITIONS[detailItem.condition]?.color} text-xs`}>{CONDITIONS[detailItem.condition]?.label}</Badge></div>
                </div>
                {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {dialogOpen && (
        <Card className="sm:max-w-[500px]">
          <CardHeader><CardTitle className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>{editItem ? 'Uredi opremu' : 'Nova oprema'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'operational'} onValueChange={v => setForm({ ...form, status: v as LabEquipment['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="operational">Operativan</SelectItem><SelectItem value="calibration">Kalibracija</SelectItem><SelectItem value="maintenance">Održavanje</SelectItem><SelectItem value="out_of_order">Kvar</SelectItem><SelectItem value="stored">Skladište</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label className="text-xs">Stanje</Label><Select value={form.condition || 'good'} onValueChange={v => setForm({ ...form, condition: v as LabEquipment['condition'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="excellent">Odlično</SelectItem><SelectItem value="good">Dobro</SelectItem><SelectItem value="fair">Zadovoljavajuće</SelectItem><SelectItem value="poor">Loše</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label className="text-xs">Lokacija</Label><Input className="text-xs" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
