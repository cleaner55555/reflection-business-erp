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
import { List, Plus, Search, Trash2, Pencil, Tag, Users, FileText, Star, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

interface PriceList { id: string; name: string; category: string; partnerGroup: string; validFrom: string; validTo: string; status: 'active' | 'expired' | 'draft'; items: PriceListItem[]; createdAt: string }
interface PriceListItem { productName: string; sku: string; basePrice: number; price: number; discount: number; unit: string }

const CATEGORIES = ['Svi proizvodi', 'Hrana', 'Piće', 'Kozmetika', 'Elektronika', 'Ostalo']

const INITIAL: PriceList[] = [
  { id: '1', name: 'Standardni cenovnik 2024', category: 'Svi proizvodi', partnerGroup: 'Svi', validFrom: '2024-01-01', validTo: '2024-12-31', status: 'active', createdAt: '2024-01-01T10:00:00', items: [
    { productName: 'Hleb beli 500g', sku: 'HRB-001', basePrice: 100, price: 80, discount: 20, unit: 'kom' },
    { productName: 'Mleko 1L', sku: 'MLK-001', basePrice: 180, price: 150, discount: 17, unit: 'kom' },
    { productName: 'Kafa zrna 250g', sku: 'KAF-001', basePrice: 1000, price: 800, discount: 20, unit: 'pak' },
    { productName: 'Šećer 1kg', sku: 'SEC-001', basePrice: 150, price: 120, discount: 20, unit: 'kom' },
  ]},
  { id: '2', name: 'VIP cenovnik — Q2', category: 'Svi proizvodi', partnerGroup: 'VIP partneri', validFrom: '2024-04-01', validTo: '2024-06-30', status: 'active', createdAt: '2024-03-28T10:00:00', items: [
    { productName: 'Hleb beli 500g', sku: 'HRB-001', basePrice: 100, price: 70, discount: 30, unit: 'kom' },
    { productName: 'Mleko 1L', sku: 'MLK-001', basePrice: 180, price: 135, discount: 25, unit: 'kom' },
  ]},
  { id: '3', name: 'Letnja akcija', category: 'Piće', partnerGroup: 'Svi', validFrom: '2024-06-01', validTo: '2024-08-31', status: 'active', createdAt: '2024-05-25T10:00:00', items: [
    { productName: 'Sok narandža 1L', sku: 'SOK-001', basePrice: 250, price: 180, discount: 28, unit: 'kom' },
    { productName: 'Voda 1.5L', sku: 'VOD-001', basePrice: 100, price: 70, discount: 30, unit: 'kom' },
  ]},
  { id: '4', name: 'Zimski cenovnik 2023', category: 'Svi proizvodi', partnerGroup: 'Svi', validFrom: '2023-10-01', validTo: '2024-03-31', status: 'expired', createdAt: '2023-09-25T10:00:00', items: [] },
  { id: '5', name: 'Novi partneri — test', category: 'Hrana', partnerGroup: 'Novi partneri', validFrom: '2024-07-01', validTo: '2024-12-31', status: 'draft', createdAt: '2024-06-10T10:00:00', items: [] },
]

function getStatusBadge(s: string) {
  const map: Record<string, { color: string; label: string }> = { active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' }, expired: { color: 'bg-red-100 text-red-800', label: 'Istekao' }, draft: { color: 'bg-slate-100 text-slate-600', label: 'Načrt' } }
  return <Badge className={`${map[s]?.color || ''} text-[10px]`}>{map[s]?.label || s}</Badge>
}

export function Cenovnici() {
  const [lists, setLists] = useState<PriceList[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PriceList | null>(null)
  const [formData, setFormData] = useState({ name: '', category: 'Svi proizvodi', partnerGroup: 'Svi', validFrom: '', validTo: '' })
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => { setLoading(true); setTimeout(() => { setLists(INITIAL); setLoading(false) }, 200) }, [])

  const stats = { total: lists.length, active: lists.filter(l => l.status === 'active').length, totalItems: lists.reduce((s, l) => s + l.items.length, 0), avgDiscount: lists.filter(l => l.items.length > 0).length > 0 ? Math.round(lists.filter(l => l.items.length > 0).reduce((s, l) => s + (l.items.reduce((a, i) => a + i.discount, 0) / l.items.length), 0) / lists.filter(l => l.items.length > 0).length) : 0 }

  const filtered = lists.filter(l => (!search || l.name.toLowerCase().includes(search.toLowerCase())) && (!statusFilter || l.status === statusFilter))
  const detailList = detailId ? lists.find(l => l.id === detailId) : null

  const handleNew = () => { setEditing(null); setFormData({ name: '', category: 'Svi proizvodi', partnerGroup: 'Svi', validFrom: '', validTo: '' }); setDialogOpen(true) }
  const handleEdit = (l: PriceList) => { setEditing(l); setFormData({ name: l.name, category: l.category, partnerGroup: l.partnerGroup, validFrom: l.validFrom, validTo: l.validTo }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.name) { toast.error('Unesite naziv'); return }
    if (editing) { setLists(prev => prev.map(l => l.id === editing.id ? { ...l, ...formData } : l)); toast.success('Cenovnik ažuriran') }
    else { setLists(prev => [{ id: `pl-${Date.now()}`, ...formData, status: 'draft', items: [], createdAt: new Date().toISOString() }, ...prev]); toast.success('Cenovnik kreiran') }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati cenovnik?')) return; setLists(prev => prev.filter(l => l.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><List className="h-6 w-6" />Ценовници</h1><p className="text-sm text-muted-foreground">Управљање ценовницима и ценовним групама</p></div>
        <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Novi cenovnik</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><List className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><Star className="h-3.5 w-3.5" />Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><FileText className="h-3.5 w-3.5" />Stavki</div><p className="text-2xl font-bold">{stats.totalItems}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Tag className="h-3.5 w-3.5" />Prosečan popust</div><p className="text-2xl font-bold">{stats.avgDiscount}%</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista cenovnika</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivni</SelectItem><SelectItem value="expired">Istekli</SelectItem><SelectItem value="draft">Načrti</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Grupa</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden sm:table-cell">Stavki</TableHead><TableHead className="text-xs hidden lg:table-cell">Važi</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema cenovnika</TableCell></TableRow> : filtered.map(l => (
                  <TableRow key={l.id} onClick={() => setDetailId(l.id)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-xs font-medium">{l.name}</TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{l.category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{l.partnerGroup}</TableCell>
                    <TableCell>{getStatusBadge(l.status)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{l.items.length}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(l.validFrom)} – {formatDate(l.validTo)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleEdit(l) }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={e => { e.stopPropagation(); handleDelete(l.id) }}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detailList?.name}</DialogTitle></DialogHeader>
          {detailList && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><span className="text-muted-foreground">Kategorija:</span> {detailList.category}</div>
                <div><span className="text-muted-foreground">Grupa:</span> {detailList.partnerGroup}</div>
                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(detailList.status)}</div>
              </div>
              {detailList.items.length > 0 ? (
                <Table><TableHeader><TableRow><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs">Šifra</TableHead><TableHead className="text-xs text-right">Bazna cena</TableHead><TableHead className="text-xs text-right">Cena</TableHead><TableHead className="text-xs text-right">Popust</TableHead></TableRow></TableHeader><TableBody>
                  {detailList.items.map((item, i) => (<TableRow key={i}><TableCell className="text-xs">{item.productName}</TableCell><TableCell className="text-xs font-mono">{item.sku}</TableCell><TableCell className="text-xs text-right text-muted-foreground">{formatRSD(item.basePrice)}</TableCell><TableCell className="text-xs text-right font-bold">{formatRSD(item.price)}</TableCell><TableCell className="text-xs text-right text-emerald-600">{item.discount}%</TableCell></TableRow>))}
                </TableBody></Table>
              ) : <p className="text-sm text-muted-foreground text-center py-4">Nema stavki</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Novi'} cenovnik</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Grupa partnera</Label><Input value={formData.partnerGroup} onChange={e => setFormData(p => ({ ...p, partnerGroup: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Važi od</Label><Input type="date" value={formData.validFrom} onChange={e => setFormData(p => ({ ...p, validFrom: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Važi do</Label><Input type="date" value={formData.validTo} onChange={e => setFormData(p => ({ ...p, validTo: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
