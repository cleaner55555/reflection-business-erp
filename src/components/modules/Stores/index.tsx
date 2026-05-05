'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Store, Plus, Search, Trash2, Pencil, MapPin, Phone, Mail, Globe, Clock, Star, Package, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

interface Store {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  manager: string
  status: 'active' | 'inactive' | 'opening_soon'
  type: 'retail' | 'warehouse' | 'office' | 'pop_up'
  area: number
  products: number
  monthlyRevenue: number
  rating: number
  openTime: string
  closeTime: string
  createdAt: string
}

const INITIAL: Store[] = [
  { id: '1', name: 'Centralni objekat — Beograd', address: 'Knez Mihailova 24', city: 'Beograd', phone: '+381 11 123 456', email: 'centar@reflection.rs', manager: 'Jovan Petrović', status: 'active', type: 'retail', area: 350, products: 4500, monthlyRevenue: 5500000, rating: 4.8, openTime: '08:00', closeTime: '20:00', createdAt: '2023-01-15T10:00:00' },
  { id: '2', name: 'Novi Sad — Centar', address: 'Trg Slobode 5', city: 'Novi Sad', phone: '+381 21 456 789', email: 'ns@reflection.rs', manager: 'Ana Jovanović', status: 'active', type: 'retail', area: 280, products: 3200, monthlyRevenue: 3800000, rating: 4.6, openTime: '09:00', closeTime: '19:00', createdAt: '2023-06-01T10:00:00' },
  { id: '3', name: 'Magacin — Zemun', address: 'Industrijska zona bb', city: 'Zemun', phone: '+381 11 789 012', email: 'magacin@reflection.rs', manager: 'Marko Stanković', status: 'active', type: 'warehouse', area: 1200, products: 18000, monthlyRevenue: 0, rating: 0, openTime: '06:00', closeTime: '18:00', createdAt: '2023-01-15T10:00:00' },
  { id: '4', name: 'Niš — Trgovac', address: 'Bulevar Nemanjića 10', city: 'Niš', phone: '+381 18 234 567', email: 'nis@reflection.rs', manager: 'Nikola Nikolić', status: 'opening_soon', type: 'retail', area: 200, products: 0, monthlyRevenue: 0, rating: 0, openTime: '09:00', closeTime: '19:00', createdAt: '2024-06-01T10:00:00' },
  { id: '5', name: 'Kancelarija — Beograd', address: 'Bulevar Mihajla Pupina 10a', city: 'Beograd', phone: '+381 11 345 678', email: 'office@reflection.rs', manager: 'Jelena Popović', status: 'active', type: 'office', area: 150, products: 0, monthlyRevenue: 0, rating: 0, openTime: '08:00', closeTime: '17:00', createdAt: '2023-01-15T10:00:00' },
  { id: '6', name: 'Kragujevac — Promocija', address: 'Trg Kralja Milana 3', city: 'Kragujevac', phone: '+381 34 567 890', email: 'kg@reflection.rs', manager: '—', status: 'inactive', type: 'pop_up', area: 40, products: 0, monthlyRevenue: 0, rating: 0, openTime: '10:00', closeTime: '16:00', createdAt: '2024-03-01T10:00:00' },
]

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string }> = { active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivna' }, inactive: { color: 'bg-red-100 text-red-800', label: 'Neaktivna' }, opening_soon: { color: 'bg-amber-100 text-amber-800', label: 'Uskoro otvaranje' } }
  return <Badge className={`${map[status]?.color || ''} text-[10px]`}>{map[status]?.label || status}</Badge>
}

function getTypeLabel(t: string) {
  return { retail: 'Prodavnica', warehouse: 'Magacin', office: 'Kancelarija', pop_up: 'Pop-up' }[t] || t
}

export function ProdajnaMesta() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Store | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '', city: '', phone: '', email: '', manager: '', type: 'retail' as Store['type'], area: 0, openTime: '09:00', closeTime: '18:00' })

  useEffect(() => { setLoading(true); setTimeout(() => { setStores(INITIAL); setLoading(false) }, 200) }, [])

  const stats = { total: stores.length, active: stores.filter(s => s.status === 'active').length, warehouses: stores.filter(s => s.type === 'warehouse').length, totalRevenue: stores.reduce((s, st) => s + st.monthlyRevenue, 0), totalProducts: stores.reduce((s, st) => s + st.products, 0), totalArea: stores.reduce((s, st) => s + st.area, 0) }

  const filtered = stores.filter(s => (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase())) && (!statusFilter || s.status === statusFilter))

  const handleNew = () => { setEditing(null); setFormData({ name: '', address: '', city: '', phone: '', email: '', manager: '', type: 'retail', area: 0, openTime: '09:00', closeTime: '18:00' }); setDialogOpen(true) }
  const handleEdit = (s: Store) => { setEditing(s); setFormData({ name: s.name, address: s.address, city: s.city, phone: s.phone, email: s.email, manager: s.manager, type: s.type, area: s.area, openTime: s.openTime, closeTime: s.closeTime }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.name) { toast.error('Unesite naziv'); return }
    if (editing) { setStores(prev => prev.map(s => s.id === editing.id ? { ...s, ...formData } : s)); toast.success('Objekat ažuriran') }
    else { setStores(prev => [{ id: `store-${Date.now()}`, ...formData, status: 'opening_soon', products: 0, monthlyRevenue: 0, rating: 0, createdAt: new Date().toISOString() }, ...prev]); toast.success('Objekat kreiran') }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati objekat?')) return; setStores(prev => prev.filter(s => s.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Store className="h-6 w-6" />Продajна места</h1><p className="text-sm text-muted-foreground">Управљање продавницама, магацинима и канцеларијама</p></div>
        <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Novi objekat</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Store className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><Clock className="h-3.5 w-3.5" />Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><Package className="h-3.5 w-3.5" />Magacina</div><p className="text-2xl font-bold text-blue-700">{stats.warehouses}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BarChart3 className="h-3.5 w-3.5" />Prihodi</div><p className="text-lg font-bold">{formatRSD(stats.totalRevenue)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Package className="h-3.5 w-3.5" />Proizvodi</div><p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MapPin className="h-3.5 w-3.5" />Površina</div><p className="text-2xl font-bold">{stats.totalArea}m²</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista objekata</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem><SelectItem value="active">Aktivni</SelectItem><SelectItem value="inactive">Neaktivni</SelectItem><SelectItem value="opening_soon">Uskoro</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Grad</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Menadžer</TableHead><TableHead className="text-xs hidden sm:table-cell">Radno vreme</TableHead><TableHead className="text-xs hidden lg:table-cell">Površina</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema objekata</TableCell></TableRow> : filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell><div><p className="text-xs font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.phone}</p></div></TableCell>
                    <TableCell className="hidden sm:table-cell text-xs"><div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{s.city}</div></TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{getTypeLabel(s.type)}</Badge></TableCell>
                    <TableCell>{getStatusBadge(s.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{s.manager}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs font-mono text-muted-foreground">{s.openTime}–{s.closeTime}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{s.area}m²</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? 'Izmeni objekat' : 'Novi objekat'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Grad</Label><Input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Email</Label><Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as Store['type'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="retail">Prodavnica</SelectItem><SelectItem value="warehouse">Magacin</SelectItem><SelectItem value="office">Kancelarija</SelectItem><SelectItem value="pop_up">Pop-up</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Površina (m²)</Label><Input type="number" value={formData.area} onChange={e => setFormData(p => ({ ...p, area: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Otvaranje</Label><Input type="time" value={formData.openTime} onChange={e => setFormData(p => ({ ...p, openTime: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Zatvaranje</Label><Input type="time" value={formData.closeTime} onChange={e => setFormData(p => ({ ...p, closeTime: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
