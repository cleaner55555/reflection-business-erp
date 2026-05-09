'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, ChefHat, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { KitchenItem } from './types'
import { STATUSES, CATEGORIES, formatRSD } from './data'

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function KpiCards({ data }: { data: KitchenItem[] }) {
  const totalValue = data.reduce((s, i) => s + (i.quantity * i.unitPrice), 0)
  const lowStockCount = data.filter(i => i.status === 'low_stock').length
  const expiredCount = data.filter(i => i.status === 'expired').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ChefHat className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Nisko stanje</div><p className="text-2xl font-bold text-amber-700">{lowStockCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Isteklih</div><p className="text-2xl font-bold text-red-700">{expiredCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Vrednost</div><p className="text-xl font-bold">{formatRSD(totalValue)}</p></Card>
    </div>
  )
}

export function TableSection({ filtered, search, statusFilter, categoryFilter, onSearch, onStatusFilter, onCategoryFilter, onDetail, onEdit, onDelete }: {
  filtered: KitchenItem[]
  search: string
  statusFilter: string
  categoryFilter: string
  onSearch: (v: string) => void
  onStatusFilter: (v: string) => void
  onCategoryFilter: (v: string) => void
  onDetail: (id: string) => void
  onEdit: (item: KitchenItem) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base font-semibold">Lista artikala</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="in_stock">Na stanju</SelectItem><SelectItem value="low_stock">Nisko</SelectItem><SelectItem value="out_of_stock">Nema</SelectItem><SelectItem value="expired">Istekao</SelectItem></SelectContent></Select>
            <Select value={categoryFilter || 'all'} onValueChange={v => onCategoryFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDetail(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function CreateTab({ form, onFormChange, onSave }: { form: Partial<KitchenItem>; onFormChange: (f: Partial<KitchenItem>) => void; onSave: () => void }) {
  return (
    <Card>
      <CardHeader><h3 className="text-base font-semibold">Novi artikal</h3></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => onFormChange({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'ingredient'} onValueChange={v => onFormChange({ ...form, category: v as KitchenItem['category'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Količina</Label><Input className="text-xs" type="number" value={form.quantity || ''} onChange={e => onFormChange({ ...form, quantity: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Jedinica</Label><Input className="text-xs" value={form.unit || ''} onChange={e => onFormChange({ ...form, unit: e.target.value })} placeholder="kg, kom, l..." /></div>
            <div className="grid gap-2"><Label className="text-xs">Min. količina</Label><Input className="text-xs" type="number" value={form.minQuantity || ''} onChange={e => onFormChange({ ...form, minQuantity: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Cena po jedinici (RSD)</Label><Input className="text-xs" type="number" value={form.unitPrice || ''} onChange={e => onFormChange({ ...form, unitPrice: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Dobavljač</Label><Input className="text-xs" value={form.supplier || ''} onChange={e => onFormChange({ ...form, supplier: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Lokacija</Label><Input className="text-xs" value={form.storageArea || ''} onChange={e => onFormChange({ ...form, storageArea: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Rok trajanja</Label><Input className="text-xs" type="date" value={form.expiryDate || ''} onChange={e => onFormChange({ ...form, expiryDate: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Alergeni (zarez)</Label><Input className="text-xs" value={(form.allergens || []).join(', ')} onChange={e => onFormChange({ ...form, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Dodaj artikal</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function EditTab({ data, onEdit, onDelete }: { data: KitchenItem[]; onEdit: (item: KitchenItem) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><h3 className="text-base font-semibold">Uredi artikle</h3></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}<Badge className="text-xs bg-muted">{CATEGORIES[item.category]}</Badge></div>
                <p className="text-xs text-muted-foreground truncate">{item.quantity} {item.unit} — {item.supplier} — {formatRSD(item.quantity * item.unitPrice)}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DetailDialog({ detailItem, onClose }: { detailItem: KitchenItem | null; onClose: () => void }) {
  return (
    <Dialog open={!!detailItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader><DialogTitle>Detalji artikla</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{detailItem.name}</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Kategorija', CATEGORIES[detailItem.category]],
                ['Količina', `${detailItem.quantity} ${detailItem.unit}`],
                ['Min. količina', `${detailItem.minQuantity} ${detailItem.unit}`],
                ['Cena/jed', formatRSD(detailItem.unitPrice)],
                ['Ukupna vrednost', formatRSD(detailItem.quantity * detailItem.unitPrice)],
                ['Dobavljač', detailItem.supplier],
                ['Lokacija', detailItem.storageArea],
                ['Datum prijema', formatDate(detailItem.receivedDate)],
                ['Rok trajanja', formatDate(detailItem.expiryDate)],
              ] as [string, string][]).map(([label, val]) => (
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
  )
}

export function EditDialog({ editItem, form, onFormChange, onSave, onClose }: { editItem: KitchenItem | null; form: Partial<KitchenItem>; onFormChange: (f: Partial<KitchenItem>) => void; onSave: () => void; onClose: (open: boolean) => void }) {
  return (
    <Dialog open={!!editItem || false} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi artikal' : 'Novi artikal'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => onFormChange({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'in_stock'} onValueChange={v => onFormChange({ ...form, status: v as KitchenItem['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in_stock">Na stanju</SelectItem><SelectItem value="low_stock">Nisko</SelectItem><SelectItem value="out_of_stock">Nema</SelectItem><SelectItem value="expired">Istekao</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Količina</Label><Input className="text-xs" type="number" value={form.quantity || ''} onChange={e => onFormChange({ ...form, quantity: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Cena/jed</Label><Input className="text-xs" type="number" value={form.unitPrice || ''} onChange={e => onFormChange({ ...form, unitPrice: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => onFormChange({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => onClose(false)}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
