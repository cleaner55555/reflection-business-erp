'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Package, Hash, ClipboardCheck, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime } from '@/lib/helpers'

interface Product {
  id: string; name: string; sku: string; currentStock: number; isActive: boolean;
  purchasePrice: number; sellingPrice: number; minStock: number; category: string | null;
}

interface WarehouseLocation {
  id: string; name: string; code: string; type: string; parentId: string | null; isActive: boolean;
}

interface StockMovement {
  id: string; productId: string; type: string; quantity: number; date: string; notes: string | null;
}

interface LotData {
  id: string; lotNumber: string; quantity: number; expiryDate: string | null
  locationId: string | null; purchaseDate: string; purchasePrice: number
  supplier: string | null; notes: string | null
  product: { name: string; sku: string } | null
  location: { name: string; code: string } | null
}

interface InventoryCountData {
  id: string; name: string; status: string; startDate: string | null; endDate: string | null
  countedBy: string | null; notes: string | null; createdAt: string
  location: { name: string; code: string } | null
  items: Array<{ id: string; productId: string; productName: string; systemQty: number; countedQty: number; difference: number }>
  _count: { items: number }
}

function LotoviTab() {
  const [lots, setLots] = useState<LotData[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<WarehouseLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ productId: '', lotNumber: '', quantity: 0, expiryDate: '', locationId: '', purchasePrice: 0, supplier: '', notes: '' })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [lRes, pRes, locRes] = await Promise.all([fetch('/api/lots'), fetch('/api/products'), fetch('/api/warehouse-locations')])
      if (cancelled) return
      setLots(await lRes.json())
      setProducts(await pRes.json())
      setLocations(await locRes.json())
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async () => {
    if (editId) {
      await fetch(`/api/lots/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/lots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companyId: 'default' }) })
    }
    setShowForm(false); setEditId(null)
    setForm({ productId: '', lotNumber: '', quantity: 0, expiryDate: '', locationId: '', purchasePrice: 0, supplier: '', notes: '' })
    const res = await fetch('/api/lots'); setLots(await res.json())
    toast.success(editId ? 'Lot ažuriran' : 'Lot kreiran')
  }

  const handleEdit = (lot: LotData) => {
    setForm({
      productId: lot.product?.sku || '', lotNumber: lot.lotNumber, quantity: lot.quantity,
      expiryDate: lot.expiryDate?.split('T')[0] || '', locationId: lot.locationId || '',
      purchasePrice: lot.purchasePrice, supplier: lot.supplier || '', notes: lot.notes || ''
    })
    setEditId(lot.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/lots/${id}`, { method: 'DELETE' })
    setLots(prev => prev.filter(l => l.id !== id))
    toast.success('Lot obrisan')
  }

  const isExpiringSoon = (d: string | null) => d && new Date(d) < new Date(Date.now() + 30 * 86400000)
  const isExpired = (d: string | null) => d && new Date(d) < new Date()

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Package className="h-4 w-4" /><span>{lots.length} lotova</span>
          {lots.filter(l => isExpired(l.expiryDate)).length > 0 && (
            <Badge variant="destructive">{lots.filter(l => isExpired(l.expiryDate)).length} isteklo</Badge>
          )}
          {lots.filter(l => isExpiringSoon(l.expiryDate) && !isExpired(l.expiryDate)).length > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {lots.filter(l => isExpiringSoon(l.expiryDate) && !isExpired(l.expiryDate)).length} ističe
            </Badge>
          )}
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(true); setEditId(null); setForm({ productId: '', lotNumber: '', quantity: 0, expiryDate: '', locationId: '', purchasePrice: 0, supplier: '', notes: '' }) }}>
          <Plus className="h-3.5 w-3.5" /> Novi lot
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Proizvod</Label>
              <Select value={form.productId} onValueChange={v => setForm(p => ({ ...p, productId: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Izaberi..." /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Lot / Serijski broj</Label>
              <Input className="mt-1 h-9" value={form.lotNumber} onChange={e => setForm(p => ({ ...p, lotNumber: e.target.value }))} placeholder="LOT-2025-001" />
            </div>
            <div>
              <Label className="text-xs">Količina</Label>
              <Input className="mt-1 h-9" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label className="text-xs">Rok trajanja</Label>
              <Input className="mt-1 h-9" type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Lokacija</Label>
              <Select value={form.locationId} onValueChange={v => setForm(p => ({ ...p, locationId: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Izaberi..." /></SelectTrigger>
                <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Nabavna cena</Label>
              <Input className="mt-1 h-9" type="number" value={form.purchasePrice} onChange={e => setForm(p => ({ ...p, purchasePrice: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleSubmit}>{editId ? 'Ažuriraj' : 'Sačuvaj'}</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Otkaži</Button>
          </div>
        </Card>
      )}

      <div className="max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-xs">Lot broj</TableHead>
            <TableHead className="text-xs">Proizvod</TableHead>
            <TableHead className="text-xs">Količina</TableHead>
            <TableHead className="text-xs">Rok trajanja</TableHead>
            <TableHead className="text-xs">Lokacija</TableHead>
            <TableHead className="text-xs">Cena</TableHead>
            <TableHead className="text-xs">Akcije</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {lots.map(lot => (
              <TableRow key={lot.id}>
                <TableCell className="text-xs font-mono font-medium"><Hash className="h-3 w-3 inline mr-1" />{lot.lotNumber}</TableCell>
                <TableCell className="text-xs">{lot.product?.name || '-'}</TableCell>
                <TableCell className="text-xs font-medium">{lot.quantity}</TableCell>
                <TableCell className="text-xs">
                  {lot.expiryDate ? (
                    <Badge variant={isExpired(lot.expiryDate) ? 'destructive' : isExpiringSoon(lot.expiryDate) ? 'secondary' : 'outline'}
                      className={isExpiringSoon(lot.expiryDate) && !isExpired(lot.expiryDate) ? 'bg-amber-100 text-amber-700' : ''}>
                      {lot.expiryDate.split('T')[0]}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-xs">{lot.location?.name || '-'}</TableCell>
                <TableCell className="text-xs">{formatRSD(lot.purchasePrice)}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(lot)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(lot.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function InventuraTab() {
  const [counts, setCounts] = useState<InventoryCountData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', locationId: '', notes: '' })
  const [locations, setLocations] = useState<WarehouseLocation[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [cRes, lRes] = await Promise.all([fetch('/api/inventory-counts'), fetch('/api/warehouse-locations')])
      if (cancelled) return
      setCounts(await cRes.json())
      setLocations(await lRes.json())
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/inventory-counts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, companyId: 'default', status: 'nacrt' })
    })
    const newCount = await res.json()
    setCounts(prev => [newCount, ...prev])
    setShowForm(false); setForm({ name: '', locationId: '', notes: '' })
    toast.success('Inventura kreirana')
  }

  const handleFinalize = async (id: string) => {
    await fetch(`/api/inventory-counts/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'zavrsena', endDate: new Date().toISOString() })
    })
    setCounts(prev => prev.map(c => c.id === id ? { ...c, status: 'zavrsena' } : c))
    toast.success('Inventura završena - razlike primenjene na stanje')
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'u_toku': return <Badge className="bg-blue-100 text-blue-700">U toku</Badge>
      case 'zavrsena': return <Badge className="bg-emerald-100 text-emerald-700">Završena</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ClipboardCheck className="h-4 w-4" /><span>{counts.length} inventura</span>
          <Badge variant="outline">{counts.filter(c => c.status === 'zavrsena').length} završenih</Badge>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" /> Nova inventura
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Naziv</Label>
              <Input className="mt-1 h-9" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Inv-01-2025" />
            </div>
            <div>
              <Label className="text-xs">Lokacija</Label>
              <Select value={form.locationId} onValueChange={v => setForm(p => ({ ...p, locationId: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Sve lokacije" /></SelectTrigger>
                <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Napomene</Label>
              <Input className="mt-1 h-9" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleCreate}>Kreiraj</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Otkaži</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-3">
        {counts.map(count => {
          const totalDiff = (count.items || []).reduce((sum, i) => sum + (i.countedQty - i.systemQty), 0)
          return (
            <Card key={count.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">{count.name}</CardTitle>
                    {statusBadge(count.status)}
                    {count.location && <span className="text-xs text-muted-foreground">{count.location.name}</span>}
                  </div>
                  {count.status !== 'zavrsena' && (
                    <Button size="sm" variant="outline" onClick={() => handleFinalize(count.id)}>Završi</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-2">
                  <div><p className="text-xs text-muted-foreground">Stavki</p><p className="font-bold">{count._count?.items || count.items?.length || 0}</p></div>
                  <div><p className="text-xs text-muted-foreground">Datum</p><p className="text-sm">{formatDate(count.createdAt)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Razlika</p><p className={`font-bold ${totalDiff > 0 ? 'text-emerald-600' : totalDiff < 0 ? 'text-red-600' : ''}`}>{totalDiff > 0 ? '+' : ''}{totalDiff}</p></div>
                </div>
                {count.items && count.items.length > 0 && (
                  <div className="max-h-[150px] overflow-y-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead className="text-[10px]">Proizvod</TableHead>
                        <TableHead className="text-[10px] text-right">Sistem</TableHead>
                        <TableHead className="text-[10px] text-right">Brojeno</TableHead>
                        <TableHead className="text-[10px] text-right">Razlika</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {count.items.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">{item.productName}</TableCell>
                            <TableCell className="text-xs text-right">{item.systemQty}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{item.countedQty}</TableCell>
                            <TableCell className={`text-xs text-right font-medium ${item.difference > 0 ? 'text-emerald-600' : item.difference < 0 ? 'text-red-600' : ''}`}>
                              {item.difference > 0 ? '+' : ''}{item.difference}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function TransferiTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<WarehouseLocation[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ productId: '', fromLocationId: '', toLocationId: '', quantity: 0, notes: '' })
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [pRes, lRes, mRes] = await Promise.all([fetch('/api/products'), fetch('/api/warehouse-locations'), fetch('/api/stock')])
      if (cancelled) return
      setProducts(await pRes.json())
      setLocations(await lRes.json())
      setMovements((await mRes.json()).filter((m: StockMovement) => m.type === 'transfer'))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleTransfer = async () => {
    if (!form.productId || !form.fromLocationId || !form.toLocationId || form.quantity <= 0) {
      toast.error('Popunite sva polja'); return
    }
    setTransferring(true)
    const res = await fetch('/api/stock/transfer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, companyId: 'default' })
    })
    if (res.ok) {
      toast.success('Transfer uspešno izvršen')
      setForm({ productId: '', fromLocationId: '', toLocationId: '', quantity: 0, notes: '' })
      const mRes = await fetch('/api/stock')
      setMovements((await mRes.json()).filter((m: StockMovement) => m.type === 'transfer'))
    } else {
      toast.error('Greška pri transferu')
    }
    setTransferring(false)
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  const topLevelLocations = locations.filter(l => !l.parentId && l.isActive)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> Novi transfer</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Proizvod</Label>
              <Select value={form.productId} onValueChange={v => setForm(p => ({ ...p, productId: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Izaberi..." /></SelectTrigger>
                <SelectContent>{products.filter(p => p.isActive).map(p => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name} (Stanje: {p.currentStock})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Iz lokacije</Label>
              <Select value={form.fromLocationId} onValueChange={v => setForm(p => ({ ...p, fromLocationId: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Odakle..." /></SelectTrigger>
                <SelectContent>{topLevelLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Na lokaciju</Label>
              <Select value={form.toLocationId} onValueChange={v => setForm(p => ({ ...p, toLocationId: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Gde..." /></SelectTrigger>
                <SelectContent>{topLevelLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Količina</Label>
              <Input className="mt-1 h-9" type="number" min={1} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label className="text-xs">Napomene</Label>
              <Input className="mt-1 h-9" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Razlog transfera" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="gap-1.5" onClick={handleTransfer} disabled={transferring}>
              {transferring ? 'Transfer...' : 'Izvrši transfer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Istorija transfera</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Datum</TableHead>
                <TableHead className="text-xs">Proizvod</TableHead>
                <TableHead className="text-xs">Količina</TableHead>
                <TableHead className="text-xs">Napomene</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {movements.map(m => {
                  const prod = products.find(p => p.id === m.productId)
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">{formatDateTime(m.date)}</TableCell>
                      <TableCell className="text-xs">{prod?.name || m.productId}</TableCell>
                      <TableCell className={`text-xs font-medium ${m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.notes || '-'}</TableCell>
                    </TableRow>
                  )
                })}
                {movements.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Nema transfera</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { LotoviTab, InventuraTab, TransferiTab }
