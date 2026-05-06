'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Building2, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Property } from './types'
import { STATUSES, TYPES } from './data'

export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
export function formatPrice(p: number, perSqm?: boolean) { const suffix = perSqm ? '/m²' : ''; return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p) + suffix }

export function KpiCards({ totalCount, availableCount, cityCount, totalValue }: { totalCount: number; availableCount: number; cityCount: number; totalValue: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Building2 className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{totalCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Dostupnih</div><p className="text-2xl font-bold text-emerald-700">{availableCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Gradova</div><p className="text-2xl font-bold text-blue-700">{cityCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupna vrednost</div><p className="text-lg font-bold">{formatPrice(totalValue)}</p></Card>
    </div>
  )
}

export function PropertyTable({
  filtered,
  search,
  typeFilter,
  statusFilter,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onView,
  onEdit,
  onDelete,
}: {
  filtered: Property[]
  search: string
  typeFilter: string
  statusFilter: string
  onSearchChange: (v: string) => void
  onTypeFilterChange: (v: string) => void
  onStatusFilterChange: (v: string) => void
  onView: (id: string) => void
  onEdit: (item: Property) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card><CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Lista nekretnina</CardTitle><div className="flex gap-2 items-center flex-wrap"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div><Select value={typeFilter || 'all'} onValueChange={v => onTypeFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="apartment">Stan</SelectItem><SelectItem value="house">Kuća</SelectItem><SelectItem value="commercial">Lokal</SelectItem><SelectItem value="land">Zemljište</SelectItem><SelectItem value="office">Kancelarija</SelectItem></SelectContent></Select><Select value={statusFilter || 'all'} onValueChange={v => onStatusFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="available">Dostupno</SelectItem><SelectItem value="reserved">Rezervisano</SelectItem><SelectItem value="sold">Prodato</SelectItem><SelectItem value="rented">Iznajmljeno</SelectItem></SelectContent></Select></div></div></CardHeader><CardContent>
      <div className="max-h-[480px] overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Grad</TableHead><TableHead className="text-xs hidden md:table-cell">Površina</TableHead><TableHead className="text-xs hidden lg:table-cell">Cena</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>
        {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema nekretnina</TableCell></TableRow> : filtered.map(item => (
          <TableRow key={item.id}><TableCell className="text-xs font-medium">{item.title}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{TYPES[item.type]}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.city}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.area > 0 ? `${item.area} m²` : `${item.landArea} ari`}</TableCell><TableCell className="text-xs font-semibold hidden lg:table-cell">{formatPrice(item.price)}<span className="text-[10px] text-muted-foreground ml-1">({formatPrice(item.pricePerSqm, true)})</span></TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>
        ))}</TableBody></Table></div></CardContent></Card>
  )
}

export function AddForm({ form, onFormChange, onSave }: { form: Partial<Property>; onFormChange: (f: Partial<Property>) => void; onSave: () => void }) {
  return (
    <Card><CardHeader><CardTitle className="text-base">Nova nekretnina</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.title || ''} onChange={e => onFormChange({ ...form, title: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'apartment'} onValueChange={v => onFormChange({ ...form, type: v as Property['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="apartment">Stan</SelectItem><SelectItem value="house">Kuća</SelectItem><SelectItem value="commercial">Lokal</SelectItem><SelectItem value="land">Zemljište</SelectItem><SelectItem value="office">Kancelarija</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Grad *</Label><Input className="text-xs" value={form.city || ''} onChange={e => onFormChange({ ...form, city: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input className="text-xs" value={form.address || ''} onChange={e => onFormChange({ ...form, address: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Površina (m²)</Label><Input className="text-xs" type="number" value={form.area || ''} onChange={e => onFormChange({ ...form, area: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Cena (€)</Label><Input className="text-xs" type="number" value={form.price || ''} onChange={e => onFormChange({ ...form, price: Number(e.target.value), pricePerSqm: Number(e.target.value) / (form.area || 1) })} /></div><div className="grid gap-2"><Label className="text-xs">Sobe</Label><Input className="text-xs" type="number" value={form.bedrooms || ''} onChange={e => onFormChange({ ...form, bedrooms: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Sprat</Label><Input className="text-xs" value={form.floor || ''} onChange={e => onFormChange({ ...form, floor: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Godina izgradnje</Label><Input className="text-xs" type="number" value={form.yearBuilt || ''} onChange={e => onFormChange({ ...form, yearBuilt: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Agent</Label><Input className="text-xs" value={form.agent || ''} onChange={e => onFormChange({ ...form, agent: e.target.value })} /></div></div><Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Dodaj</Button></div></CardContent></Card>
  )
}

export function EditList({ data, onEdit, onDelete }: { data: Property[]; onEdit: (item: Property) => void; onDelete: (id: string) => void }) {
  return (
    <Card><CardHeader><CardTitle className="text-base">Uredi nekretnine</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-medium">{item.title}</span>{getStatusBadge(item.status)}<Badge className="text-[10px] bg-muted">{TYPES[item.type]}</Badge></div><p className="text-xs text-muted-foreground truncate">{item.address}, {item.city} — {formatPrice(item.price)}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card>
  )
}

export function DetailDialog({ detailItem, open, onClose }: { detailItem: Property | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}><DialogContent className="sm:max-w-[550px]"><DialogHeader><DialogTitle>{detailItem?.title}</DialogTitle></DialogHeader>{detailItem && (<div className="space-y-3"><div className="flex items-center gap-2">{getStatusBadge(detailItem.status)}<Badge className="text-[10px] bg-muted">{TYPES[detailItem.type]}</Badge></div><div className="grid grid-cols-2 gap-3">{[['Adresa', detailItem.address],['Grad', `${detailItem.city} — ${detailItem.neighborhood}`],['Površina', detailItem.area > 0 ? `${detailItem.area} m²` : `${detailItem.landArea} ari`],['Sobe/Bań', `${detailItem.bedrooms}/${detailItem.bathrooms}`],['Sprat', detailItem.floor],['Godina', String(detailItem.yearBuilt) || '—'],['Grejanje', detailItem.heating],['Nameštenost', detailItem.furnishing],['Cena', formatPrice(detailItem.price)],['Cena/m²', formatPrice(detailItem.pricePerSqm, true)],['Agent', detailItem.agent],['Datum', formatDate(detailItem.listedDate)],['Pregledi', String(detailItem.views)],['Upiti', String(detailItem.inquiries)]].map(([label, val]) => (<div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val || '—'}</div></div>))}</div><div className="flex flex-wrap gap-1">{detailItem.parking && <Badge className="text-[10px] bg-blue-50 text-blue-700">Parking</Badge>}{detailItem.elevator && <Badge className="text-[10px] bg-blue-50 text-blue-700">Lift</Badge>}{detailItem.terrace && <Badge className="text-[10px] bg-green-50 text-green-700">Terasa</Badge>}{detailItem.registered && <Badge className="text-[10px] bg-emerald-50 text-emerald-700">Uknjiženo</Badge>}</div></div>)}</DialogContent></Dialog>
  )
}

export function EditDialog({ editItem, form, onFormChange, open, onClose, onSave }: { editItem: Property | null; form: Partial<Property>; onFormChange: (f: Partial<Property>) => void; open: boolean; onClose: () => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Nova'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.title || ''} onChange={e => onFormChange({ ...form, title: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'available'} onValueChange={v => onFormChange({ ...form, status: v as Property['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Dostupno</SelectItem><SelectItem value="reserved">Rezervisano</SelectItem><SelectItem value="sold">Prodato</SelectItem><SelectItem value="rented">Iznajmljeno</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Cena (€)</Label><Input className="text-xs" type="number" value={form.price || ''} onChange={e => onFormChange({ ...form, price: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'apartment'} onValueChange={v => onFormChange({ ...form, type: v as Property['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="apartment">Stan</SelectItem><SelectItem value="house">Kuća</SelectItem><SelectItem value="commercial">Lokal</SelectItem><SelectItem value="land">Zemljište</SelectItem><SelectItem value="office">Kancelarija</SelectItem></SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => onFormChange({ ...form, notes: e.target.value })} /></div></div><DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
  )
}
