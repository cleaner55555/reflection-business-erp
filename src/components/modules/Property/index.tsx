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
import { Plus, Search, Trash2, Pencil, Eye, Building2, MapPin, Euro, Home, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Property = {
  id: string
  propertyNo: string
  title: string
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'office'
  transactionType: 'sale' | 'rent' | 'both'
  status: 'available' | 'reserved' | 'sold' | 'rented' | 'off_market'
  address: string
  city: string
  neighborhood: string
  area: number
  landArea: number
  price: number
  pricePerSqm: number
  bedrooms: number
  bathrooms: number
  floor: string
  yearBuilt: number
  heating: 'central' | 'gas' | 'electric' | 'wood' | 'ac' | 'none'
  furnishing: 'furnished' | 'semi_furnished' | 'unfurnished'
  parking: boolean
  elevator: boolean
  terrace: boolean
  registered: boolean
  agent: string
  listedDate: string
  views: number
  inquiries: number
  notes: string
}

const STATUSES: Record<string, { color: string; label: string }> = { available: { color: 'bg-emerald-100 text-emerald-800', label: 'Dostupno' }, reserved: { color: 'bg-amber-100 text-amber-800', label: 'Rezervisano' }, sold: { color: 'bg-gray-100 text-gray-800', label: 'Prodato' }, rented: { color: 'bg-blue-100 text-blue-800', label: 'Iznajmljeno' }, off_market: { color: 'bg-red-100 text-red-800', label: 'Uklonjeno' } }
const TYPES: Record<string, string> = { apartment: 'Stan', house: 'Kuća', commercial: 'Lokal', land: 'Zemljište', garage: 'Garaža', office: 'Kancelarija' }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function formatPrice(p: number, perSqm?: boolean) { const suffix = perSqm ? '/m²' : ''; return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p) + suffix }

export function Property() {
  const [data, setData] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Property | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Property>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(json)
    } catch { toast.error('Greška pri učitavanju') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.title, item.address, item.city, item.neighborhood].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Obrisati?')) return
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    } catch { toast.error('Greška pri brisanju') }
  }, [])

  const openCreate = useCallback(() => {
    setEditItem(null)
    setForm({ propertyNo: `NEK-${String(data.length + 1).padStart(3, '0')}`, title: '', type: 'apartment', transactionType: 'sale', status: 'available', address: '', city: '', neighborhood: '', area: 60, landArea: 0, price: 0, pricePerSqm: 0, bedrooms: 2, bathrooms: 1, floor: '', yearBuilt: 2000, heating: 'gas', furnishing: 'unfurnished', parking: false, elevator: false, terrace: false, registered: true, agent: '', listedDate: new Date().toISOString().split('T')[0], views: 0, inquiries: 0, notes: '' })
    setDialogOpen(true)
  }, [data.length])

  const openEdit = useCallback((item: Property) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }, [])

  const handleSave = useCallback(async () => {
    if (!form.title || !form.city) { toast.error('Popunite obavezna polja'); return }
    try {
      const pricePerSqm = form.area ? form.price / form.area : form.pricePerSqm
      const payload = { ...form, pricePerSqm: pricePerSqm || 0 }
      if (editItem) {
        const res = await fetch(`/api/properties/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setData(prev => prev.map(i => i.id === editItem.id ? updated : i))
        toast.success('Ažurirano')
      } else {
        const res = await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setData(prev => [created, ...prev])
        toast.success('Kreirano')
      }
      setDialogOpen(false)
    } catch { toast.error('Greška pri čuvanju') }
  }, [form, editItem])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalCount = data.length
  const availableCount = data.filter(i => i.status === 'available').length
  const totalValue = data.reduce((s, i) => s + i.price, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Nekretnine</h1><p className="text-sm text-muted-foreground">Baza nekretnina — prodaja i zakup</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova nekretnina</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Building2 className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{totalCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Dostupnih</div><p className="text-2xl font-bold text-emerald-700">{availableCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Gradova</div><p className="text-2xl font-bold text-blue-700">{new Set(data.map(i => i.city)).size}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupna vrednost</div><p className="text-lg font-bold">{formatPrice(totalValue)}</p></Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <Card><CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Lista nekretnina</CardTitle><div className="flex gap-2 items-center flex-wrap"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="apartment">Stan</SelectItem><SelectItem value="house">Kuća</SelectItem><SelectItem value="commercial">Lokal</SelectItem><SelectItem value="land">Zemljište</SelectItem><SelectItem value="office">Kancelarija</SelectItem></SelectContent></Select><Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="available">Dostupno</SelectItem><SelectItem value="reserved">Rezervisano</SelectItem><SelectItem value="sold">Prodato</SelectItem><SelectItem value="rented">Iznajmljeno</SelectItem></SelectContent></Select></div></div></CardHeader><CardContent>
            <div className="max-h-[480px] overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Grad</TableHead><TableHead className="text-xs hidden md:table-cell">Površina</TableHead><TableHead className="text-xs hidden lg:table-cell">Cena</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema nekretnina</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}><TableCell className="text-xs font-medium">{item.title}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{TYPES[item.type]}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.city}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.area > 0 ? `${item.area} m²` : `${item.landArea} ari`}</TableCell><TableCell className="text-xs font-semibold hidden lg:table-cell">{formatPrice(item.price)}<span className="text-xs text-muted-foreground ml-1">({formatPrice(item.pricePerSqm, true)})</span></TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>
              ))}</TableBody></Table></div></CardContent></Card>
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Nova nekretnina</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'apartment'} onValueChange={v => setForm({ ...form, type: v as Property['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="apartment">Stan</SelectItem><SelectItem value="house">Kuća</SelectItem><SelectItem value="commercial">Lokal</SelectItem><SelectItem value="land">Zemljište</SelectItem><SelectItem value="office">Kancelarija</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Grad *</Label><Input className="text-xs" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input className="text-xs" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Površina (m²)</Label><Input className="text-xs" type="number" value={form.area || ''} onChange={e => setForm({ ...form, area: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Cena (€)</Label><Input className="text-xs" type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value), pricePerSqm: Number(e.target.value) / (form.area || 1) })} /></div><div className="grid gap-2"><Label className="text-xs">Sobe</Label><Input className="text-xs" type="number" value={form.bedrooms || ''} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Sprat</Label><Input className="text-xs" value={form.floor || ''} onChange={e => setForm({ ...form, floor: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Godina izgradnje</Label><Input className="text-xs" type="number" value={form.yearBuilt || ''} onChange={e => setForm({ ...form, yearBuilt: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Agent</Label><Input className="text-xs" value={form.agent || ''} onChange={e => setForm({ ...form, agent: e.target.value })} /></div></div><Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Dodaj</Button></div></CardContent></Card></TabsContent>
        <TabsContent value="uredi" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Uredi nekretnine</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-medium">{item.title}</span>{getStatusBadge(item.status)}<Badge className="text-xs bg-muted">{TYPES[item.type]}</Badge></div><p className="text-xs text-muted-foreground truncate">{item.address}, {item.city} — {formatPrice(item.price)}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card></TabsContent>
      </Tabs>
      {!!detailId && detailItem && (<Card><CardHeader className="pb-3"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{detailItem.title}</CardTitle></div></CardHeader><CardContent><div className="space-y-3"><div className="flex items-center gap-2">{getStatusBadge(detailItem.status)}<Badge className="text-xs bg-muted">{TYPES[detailItem.type]}</Badge></div><div className="grid grid-cols-2 gap-3">{[['Adresa', detailItem.address],['Grad', `${detailItem.city} — ${detailItem.neighborhood}`],['Površina', detailItem.area > 0 ? `${detailItem.area} m²` : `${detailItem.landArea} ari`],['Sobe/Bań', `${detailItem.bedrooms}/${detailItem.bathrooms}`],['Sprat', detailItem.floor],['Godina', String(detailItem.yearBuilt) || '—'],['Grejanje', detailItem.heating],['Nameštenost', detailItem.furnishing],['Cena', formatPrice(detailItem.price)],['Cena/m²', formatPrice(detailItem.pricePerSqm, true)],['Agent', detailItem.agent],['Datum', formatDate(detailItem.listedDate)],['Pregledi', String(detailItem.views)],['Upiti', String(detailItem.inquiries)]].map(([label, val]) => (<div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val || '—'}</div></div>))}</div><div className="flex flex-wrap gap-1">{detailItem.parking && <Badge className="text-xs bg-blue-50 text-blue-700">Parking</Badge>}{detailItem.elevator && <Badge className="text-xs bg-blue-50 text-blue-700">Lift</Badge>}{detailItem.terrace && <Badge className="text-xs bg-green-50 text-green-700">Terasa</Badge>}{detailItem.registered && <Badge className="text-xs bg-emerald-50 text-emerald-700">Uknjiženo</Badge>}</div></div></CardContent></Card>)}
      {dialogOpen && (<Card><CardHeader className="pb-3"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{editItem ? 'Uredi' : 'Nova'}</CardTitle></div></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'available'} onValueChange={v => setForm({ ...form, status: v as Property['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Dostupno</SelectItem><SelectItem value="reserved">Rezervisano</SelectItem><SelectItem value="sold">Prodato</SelectItem><SelectItem value="rented">Iznajmljeno</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Cena (€)</Label><Input className="text-xs" type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'apartment'} onValueChange={v => setForm({ ...form, type: v as Property['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="apartment">Stan</SelectItem><SelectItem value="house">Kuća</SelectItem><SelectItem value="commercial">Lokal</SelectItem><SelectItem value="land">Zemljište</SelectItem><SelectItem value="office">Kancelarija</SelectItem></SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></div></div></CardContent></Card>)}
    </div>
  )
}
