'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
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
import { Plus, Search, Trash2, Pencil, Eye, ChefHat, Thermometer, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type KitchenItem = {
  id: string
  name: string
  category: 'ingredient' | 'spice' | 'dairy' | 'meat' | 'vegetable' | 'fruit' | 'grain' | 'beverage' | 'condiment' | 'frozen' | 'packaging'
  unit: string
  quantity: number
  minQuantity: number
  maxQuantity: number
  unitPrice: number
  supplier: string
  storageArea: string
  expiryDate: string
  receivedDate: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired'
  allergens: string[]
  notes: string
}

function parseAllergens(v: string): string[] { try { return JSON.parse(v || '[]') } catch { return [] } }

const INITIAL: KitchenItem[] = [
  { id: '1', name: 'Pšenično brašno tip 500', category: 'grain', unit: 'kg', quantity: 50, minQuantity: 20, maxQuantity: 100, unitPrice: 85, supplier: 'Mlin "Pećarac"', storageArea: 'Skladište S1 — Regal A', expiryDate: '2024-12-15', receivedDate: '2024-06-10', status: 'in_stock', allergens: ['Gluten'], notes: '' },
  { id: '2', name: 'Svinjsko meso — but', category: 'meat', unit: 'kg', quantity: 15, minQuantity: 10, maxQuantity: 50, unitPrice: 1200, supplier: 'Mesara "Zlatiborsko"', storageArea: 'Hladnjača H1', expiryDate: '2024-06-20', receivedDate: '2024-06-14', status: 'in_stock', allergens: [], notes: 'Kontroliši svakodnevno — lako se kvare' },
  { id: '3', name: 'Mleko 3.2% (tetrapak)', category: 'dairy', unit: 'l', quantity: 8, minQuantity: 15, maxQuantity: 60, unitPrice: 140, supplier: 'Imlek', storageArea: 'Frižider F2', expiryDate: '2024-06-25', receivedDate: '2024-06-11', status: 'low_stock', allergens: ['Mleko'], notes: 'Hitno naručiti — ispod minimuma' },
  { id: '4', name: 'Jaja (klase A)', category: 'dairy', unit: 'kom', quantity: 120, minQuantity: 60, maxQuantity: 300, unitPrice: 18, supplier: 'Farm "Dobrinje"', storageArea: 'Frižider F1', expiryDate: '2024-07-08', receivedDate: '2024-06-10', status: 'in_stock', allergens: ['Jaja'], notes: '' },
  { id: '5', name: 'Ulje za prženje (suncokretovo)', category: 'condiment', unit: 'l', quantity: 20, minQuantity: 10, maxQuantity: 50, unitPrice: 250, supplier: 'Vital', storageArea: 'Skladište S1 — Regal B', expiryDate: '2025-03-15', receivedDate: '2024-06-05', status: 'in_stock', allergens: [], notes: '' },
  { id: '6', name: 'Krastavci (sveži)', category: 'vegetable', unit: 'kg', quantity: 5, minQuantity: 5, maxQuantity: 30, unitPrice: 150, supplier: 'Zelenara "Grozda"', storageArea: 'Frižider F3', expiryDate: '2024-06-20', receivedDate: '2024-06-13', status: 'low_stock', allergens: [], notes: 'Sezonsko — svakodnevna nabavka' },
  { id: '7', name: 'Pavlača — listovo testo', category: 'frozen', unit: 'kom', quantity: 30, minQuantity: 15, maxQuantity: 60, unitPrice: 80, supplier: 'Frozen Food DOO', storageArea: 'Zamrzivač Z1', expiryDate: '2025-01-15', receivedDate: '2024-06-01', status: 'in_stock', allergens: ['Gluten'], notes: '' },
  { id: '8', name: 'Slično mleko 1.5%', category: 'beverage', unit: 'l', quantity: 0, minQuantity: 10, maxQuantity: 40, unitPrice: 180, supplier: 'Imlek', storageArea: 'Frižider F2', expiryDate: '2024-06-10', receivedDate: '2024-05-25', status: 'out_of_stock', allergens: ['Mleko'], notes: 'Isporuka očekivana 17.06.' },
  { id: '9', name: 'Kajmak (domaći)', category: 'dairy', unit: 'kg', quantity: 3, minQuantity: 5, maxQuantity: 20, unitPrice: 900, supplier: 'Sirana "Sjenica"', storageArea: 'Frižider F1', expiryDate: '2024-06-16', receivedDate: '2024-06-09', status: 'low_stock', allergens: ['Mleko'], notes: '' },
  { id: '10', name: 'Jogurt prirodni 1kg', category: 'dairy', unit: 'kom', quantity: 0, minQuantity: 10, maxQuantity: 40, unitPrice: 160, supplier: 'Imlek', storageArea: 'Frižider F2', expiryDate: '2024-06-08', receivedDate: '2024-05-28', status: 'expired', allergens: ['Mleko'], notes: 'Istekao — za uklanjanje' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  in_stock: { color: 'bg-emerald-100 text-emerald-800', label: 'Na stanju' },
  low_stock: { color: 'bg-amber-100 text-amber-800', label: 'Nisko stanje' },
  out_of_stock: { color: 'bg-red-100 text-red-800', label: 'Nema na stanju' },
  expired: { color: 'bg-gray-100 text-gray-800', label: 'Istekao' },
}

const CATEGORIES: Record<string, string> = { ingredient: 'Sirovine', spice: 'Začini', dairy: 'Mlečni', meat: 'Meso', vegetable: 'Povrće', fruit: 'Voće', grain: 'Žitarice', beverage: 'Piće', condiment: 'Zacini/Ulje', frozen: 'Smrznuto', packaging: 'Pakovanje' }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function formatRSD(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p) }

export function Kitchen() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<KitchenItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<KitchenItem | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<KitchenItem>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId, limit: '200' })
      const res = await fetch(`/api/kitchen-items?${params}`)
      if (res.ok) { const json = await res.json(); setData((json.items || []).map((i: any) => ({ ...i, allergens: parseAllergens(i.allergens) }))) }
    } catch (err) { console.error('Failed to load kitchen items:', err) }
    setLoading(false)
  }, [activeCompanyId])
  useEffect(() => { loadData() }, [loadData])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.name, item.supplier, item.storageArea].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = async (id: string) => { if (!confirm('Obrisati artikal?')) return
    try { const res = await fetch(`/api/kitchen-items/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Artikal obrisan'); loadData() } } catch { toast.error('Greška') }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', category: 'ingredient', unit: 'kom', quantity: 0, minQuantity: 5, maxQuantity: 50, unitPrice: 0, supplier: '', storageArea: '', expiryDate: '', receivedDate: new Date().toISOString().split('T')[0], status: 'in_stock', allergens: [], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: KitchenItem) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = async () => {
    if (!form.name) { toast.error('Unesite naziv'); return }
    try {
      const payload = { ...form, companyId: activeCompanyId, allergens: JSON.stringify(form.allergens || []) }
      if (editItem) {
        const res = await fetch(`/api/kitchen-items/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { toast.success('Artikal ažuriran'); loadData() }
      } else {
        const res = await fetch('/api/kitchen-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { toast.success('Artikal kreiran'); loadData() }
      }
    } catch { toast.error('Greška pri čuvanju') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalValue = data.reduce((s, i) => s + (i.quantity * i.unitPrice), 0)
  const lowStockCount = data.filter(i => i.status === 'low_stock').length
  const expiredCount = data.filter(i => i.status === 'expired').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Kuhinja — Inventar</h1><p className="text-sm text-muted-foreground">Magacinski inventar namirnica i sirovina</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi artikal</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ChefHat className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Nisko stanje</div><p className="text-2xl font-bold text-amber-700">{lowStockCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Isteklih</div><p className="text-2xl font-bold text-red-700">{expiredCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Vrednost</div><p className="text-xl font-bold">{formatRSD(totalValue)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista artikala</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="in_stock">Na stanju</SelectItem><SelectItem value="low_stock">Nisko</SelectItem><SelectItem value="out_of_stock">Nema</SelectItem><SelectItem value="expired">Istekao</SelectItem></SelectContent></Select>
                  <Select value={categoryFilter || 'all'} onValueChange={v => setCategoryFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Količina</TableHead><TableHead className="text-xs hidden md:table-cell">Cena/jed</TableHead><TableHead className="text-xs hidden lg:table-cell">Dobavljač</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok trajanja</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema artikala</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{CATEGORIES[item.category]}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell"><div className="flex items-center gap-2"><span className={item.quantity <= item.minQuantity ? 'text-amber-600 font-semibold' : ''}>{item.quantity} {item.unit}</span><span className="text-xs text-muted-foreground">(min: {item.minQuantity})</span></div></TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{formatRSD(item.unitPrice)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.supplier}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.expiryDate ? formatDate(item.expiryDate) : '—'}</TableCell>
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
            <CardHeader><CardTitle className="text-base">Novi artikal</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'ingredient'} onValueChange={v => setForm({ ...form, category: v as KitchenItem['category'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Količina</Label><Input className="text-xs" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Jedinica</Label><Input className="text-xs" value={form.unit || ''} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg, kom, l..." /></div>
                  <div className="grid gap-2"><Label className="text-xs">Min. količina</Label><Input className="text-xs" type="number" value={form.minQuantity || ''} onChange={e => setForm({ ...form, minQuantity: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Cena po jedinici (RSD)</Label><Input className="text-xs" type="number" value={form.unitPrice || ''} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Dobavljač</Label><Input className="text-xs" value={form.supplier || ''} onChange={e => setForm({ ...form, supplier: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Lokacija</Label><Input className="text-xs" value={form.storageArea || ''} onChange={e => setForm({ ...form, storageArea: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Rok trajanja</Label><Input className="text-xs" type="date" value={form.expiryDate || ''} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Alergeni (zarez)</Label><Input className="text-xs" value={(form.allergens || []).join(', ')} onChange={e => setForm({ ...form, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Dodaj artikal</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi artikle</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}<Badge className="text-xs bg-muted">{CATEGORIES[item.category]}</Badge></div>
                      <p className="text-xs text-muted-foreground truncate">{item.quantity} {item.unit} — {item.supplier} — {formatRSD(item.quantity * item.unitPrice)}</p>
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

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji artikla</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{detailItem.name}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Kategorija', CATEGORIES[detailItem.category]],
                  ['Količina', `${detailItem.quantity} ${detailItem.unit}`],
                  ['Min. količina', `${detailItem.minQuantity} ${detailItem.unit}`],
                  ['Cena/jed', formatRSD(detailItem.unitPrice)],
                  ['Ukupna vrednost', formatRSD(detailItem.quantity * detailItem.unitPrice)],
                  ['Dobavljač', detailItem.supplier],
                  ['Lokacija', detailItem.storageArea],
                  ['Datum prijema', formatDate(detailItem.receivedDate)],
                  ['Rok trajanja', formatDate(detailItem.expiryDate)],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
              {detailItem.allergens.length > 0 && <div className="p-2 rounded-lg bg-amber-50"><div className="text-xs text-amber-600 mb-1">⚠ Alergeni</div><div className="flex flex-wrap gap-1">{detailItem.allergens.map(a => <Badge key={a} className="text-xs bg-amber-100 text-amber-700">{a}</Badge>)}</div></div>}
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi artikal' : 'Novi artikal'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'in_stock'} onValueChange={v => setForm({ ...form, status: v as KitchenItem['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in_stock">Na stanju</SelectItem><SelectItem value="low_stock">Nisko</SelectItem><SelectItem value="out_of_stock">Nema</SelectItem><SelectItem value="expired">Istekao</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Količina</Label><Input className="text-xs" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Cena/jed</Label><Input className="text-xs" type="number" value={form.unitPrice || ''} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
