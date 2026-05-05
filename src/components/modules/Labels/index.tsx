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
import { Tag, Plus, Search, Trash2, Pencil, Printer, Download, Package, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface LabelItem {
  id: string
  name: string
  type: 'product' | 'shipping' | 'price' | 'barcode' | 'custom'
  width: number
  height: number
  template: string
  productId: string | null
  quantity: number
  printed: number
  createdAt: string
}

const TYPES: Record<string, string> = {
  product: 'Proizvod', shipping: 'Transportna', price: 'Cenovna', barcode: 'Barkod', custom: 'Prilagođena'
}

const TEMPLATES = [
  { value: 'standard', label: 'Standardni (60×40mm)' },
  { value: 'small', label: 'Mali (40×25mm)' },
  { value: 'large', label: 'Veliki (100×70mm)' },
  { value: 'a4', label: 'A4 list' },
]

const INITIAL: LabelItem[] = [
  { id: '1', name: 'Hleb beli 500g', type: 'product', width: 60, height: 40, template: 'standard', productId: 'prod-001', quantity: 100, printed: 75, createdAt: '2024-06-10T10:00:00' },
  { id: '2', name: 'Mleko 1L', type: 'product', width: 60, height: 40, template: 'standard', productId: 'prod-002', quantity: 150, printed: 150, createdAt: '2024-06-10T10:05:00' },
  { id: '3', name: 'Isporuka BG-NS', type: 'shipping', width: 100, height: 70, template: 'large', productId: null, quantity: 20, printed: 18, createdAt: '2024-06-12T14:00:00' },
  { id: '4', name: 'Kafa zrna 250g', type: 'price', width: 40, height: 25, template: 'small', productId: 'prod-003', quantity: 50, printed: 30, createdAt: '2024-06-13T09:00:00' },
  { id: '5', name: 'Dokument paket', type: 'custom', width: 100, height: 70, template: 'a4', productId: null, quantity: 10, printed: 10, createdAt: '2024-06-14T11:00:00' },
]

export function Etikete() {
  const [items, setItems] = useState<LabelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LabelItem | null>(null)
  const [formData, setFormData] = useState({ name: '', type: 'product' as LabelItem['type'], width: 60, height: 40, template: 'standard', quantity: 100 })

  useEffect(() => { setLoading(true); setTimeout(() => { setItems(INITIAL); setLoading(false) }, 200) }, [])

  const filtered = items.filter(i => {
    return (!search || i.name.toLowerCase().includes(search.toLowerCase())) && (!typeFilter || i.type === typeFilter)
  })

  const stats = { total: items.length, product: items.filter(i => i.type === 'product').length, shipping: items.filter(i => i.type === 'shipping').length, totalPrinted: items.reduce((s, i) => s + i.printed, 0), remaining: items.reduce((s, i) => s + (i.quantity - i.printed), 0) }

  const handleNew = () => { setEditing(null); setFormData({ name: '', type: 'product', width: 60, height: 40, template: 'standard', quantity: 100 }); setDialogOpen(true) }
  const handleEdit = (item: LabelItem) => { setEditing(item); setFormData({ name: item.name, type: item.type, width: item.width, height: item.height, template: item.template, quantity: item.quantity }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.name) { toast.error('Unesite naziv'); return }
    if (editing) { setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...formData } : i)); toast.success('Etiketa ažurirana') }
    else { setItems(prev => [{ id: `lbl-${Date.now()}`, ...formData, productId: null, printed: 0, createdAt: new Date().toISOString() }, ...prev]); toast.success('Etiketa kreirana') }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati etiketu?')) return; setItems(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  const handlePrint = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, printed: Math.min(i.printed + 10, i.quantity) } : i))
    toast.success('Etikete odštampane')
  }

  const handlePrintAll = () => {
    setItems(prev => prev.map(i => ({ ...i, printed: i.quantity })))
    toast.success('Sve etikete odštampane')
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Tag className="h-6 w-6" />Етикете</h1><p className="text-sm text-muted-foreground">Генерисање и штампање етикета за производе и пошиљке</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" className="gap-2" onClick={handlePrintAll}><Printer className="h-4 w-4" />Штампај sve</Button><Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Nova etiketa</Button></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Tag className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><Package className="h-3.5 w-3.5" />Proizvodi</div><p className="text-2xl font-bold">{stats.product}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-amber-600 mb-1"><BarChart3 className="h-3.5 w-3.5" />Transportne</div><p className="text-2xl font-bold">{stats.shipping}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><Printer className="h-3.5 w-3.5" />Odštampano</div><p className="text-2xl font-bold">{stats.totalPrinted}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Download className="h-3.5 w-3.5" />Preostalo</div><p className="text-2xl font-bold">{stats.remaining}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista etiketa</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Dimenzije</TableHead><TableHead className="text-xs hidden sm:table-cell">Količina</TableHead><TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nema etiketa</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell><p className="text-xs font-medium">{item.name}</p><p className="text-[10px] text-muted-foreground">{TEMPLATES.find(t => t.value === item.template)?.label || item.template}</p></TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{TYPES[item.type]}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono">{item.width}×{item.height}mm</TableCell>
                    <TableCell className="hidden sm:table-cell"><div className="text-xs"><span className={item.printed >= item.quantity ? 'text-emerald-600 font-semibold' : ''}>{item.printed}</span><span className="text-muted-foreground"> / {item.quantity}</span></div></TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(item.id)}><Printer className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? 'Izmeni etiketu' : 'Nova etiketa'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as LabelItem['type'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Šablon</Label><Select value={formData.template} onValueChange={v => setFormData(p => ({ ...p, template: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Širina (mm)</Label><Input type="number" value={formData.width} onChange={e => setFormData(p => ({ ...p, width: parseInt(e.target.value) || 0 }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Visina (mm)</Label><Input type="number" value={formData.height} onChange={e => setFormData(p => ({ ...p, height: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Količina</Label><Input type="number" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
