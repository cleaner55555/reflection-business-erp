'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScanBarcode, Plus, Search, Trash2, Pencil, Printer, Barcode, QrCode, Tag, Package } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { BarcodeItem } from './types'

// ==================== HELPERS ====================

export function getTypeBadge(type: string) {
  const map: Record<string, { color: string; label: string }> = {
    EAN13: { color: 'bg-blue-100 text-blue-800', label: 'EAN-13' },
    EAN8: { color: 'bg-emerald-100 text-emerald-800', label: 'EAN-8' },
    QR: { color: 'bg-violet-100 text-violet-800', label: 'QR Code' },
    CODE128: { color: 'bg-amber-100 text-amber-800', label: 'Code 128' },
    UPC: { color: 'bg-rose-100 text-rose-800', label: 'UPC-A' },
  }
  const s = map[type] || map.EAN13
  return <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
}

// ==================== SCAN CARD ====================

interface BarcodeScanCardProps {
  scanInput: string
  setScanInput: (v: string) => void
  onScan: () => void
}

export function BarcodeScanCard({ scanInput, setScanInput, onScan }: BarcodeScanCardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><ScanBarcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Skeniraj ili unesi barkod..." className="pl-8 h-10 text-sm font-mono" value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onScan()} /></div>
          <Button onClick={onScan} variant="secondary">Skeniraj</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== KPI CARDS ====================

interface BarcodeKpiCardsProps {
  items: BarcodeItem[]
  categories: string[]
}

export function BarcodeKpiCards({ items, categories }: BarcodeKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Barcode className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{items.length}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><Barcode className="h-3.5 w-3.5" />EAN-13</div><p className="text-2xl font-bold">{items.filter(i => i.type === 'EAN13').length}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-violet-600 mb-1"><QrCode className="h-3.5 w-3.5" />QR kodovi</div><p className="text-2xl font-bold">{items.filter(i => i.type === 'QR').length}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Tag className="h-3.5 w-3.5" />Kategorije</div><p className="text-2xl font-bold">{categories.length}</p></Card>
    </div>
  )
}

// ==================== TABLE SECTION ====================

interface BarcodeTableProps {
  filtered: BarcodeItem[]
  categories: string[]
  search: string
  typeFilter: string
  catFilter: string
  setSearch: (v: string) => void
  setTypeFilter: (v: string) => void
  setCatFilter: (v: string) => void
  selectedForPrint: Set<string>
  onTogglePrint: (id: string) => void
  onPrint: () => void
  onEdit: (item: BarcodeItem) => void
  onDelete: (id: string) => void
  onPrintItem: () => void
}

export function BarcodeTableSection({ filtered, categories, search, typeFilter, catFilter, setSearch, setTypeFilter, setCatFilter, selectedForPrint, onTogglePrint, onPrint, onEdit, onDelete, onPrintItem }: BarcodeTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Lista barkodova</CardTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem><SelectItem value="EAN13">EAN-13</SelectItem><SelectItem value="EAN8">EAN-8</SelectItem><SelectItem value="QR">QR</SelectItem><SelectItem value="CODE128">Code 128</SelectItem></SelectContent></Select>
            <Select value={catFilter || 'all'} onValueChange={v => setCatFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-8"></TableHead><TableHead className="text-xs">Barkod</TableHead><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema barkodova</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell><input type="checkbox" checked={selectedForPrint.has(item.id)} onChange={() => onTogglePrint(item.id)} className="h-4 w-4 rounded" /></TableCell>
                  <TableCell><span className="text-xs font-mono font-bold">{item.code}</span></TableCell>
                  <TableCell><div><p className="text-xs font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{item.productId}</p></div></TableCell>
                  <TableCell className="hidden sm:table-cell">{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs"><Package className="h-2.5 w-2.5 mr-1" />{item.category}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrintItem} title="Stampaj"><Printer className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== FORM DIALOG ====================

interface BarcodeFormData {
  code: string
  type: BarcodeItem['type']
  productName: string
  productId: string
  category: string
}

interface BarcodeFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: BarcodeItem | null
  formData: BarcodeFormData
  setFormData: React.Dispatch<React.SetStateAction<BarcodeFormData>>
  onSave: () => void
  onGenerate: (type: BarcodeItem['type']) => void
}

export function BarcodeFormDialog({ open, onOpenChange, editing, formData, setFormData, onSave, onGenerate }: BarcodeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle>{editing ? 'Izmeni barkod' : 'Novi barkod'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label className="text-xs">Barkod *</Label><div className="flex gap-2"><Input placeholder="8601234567890" className="font-mono" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} /><Select value={formData.type} onValueChange={v => { setFormData(p => ({ ...p, type: v as BarcodeItem['type'] })); onGenerate(v as BarcodeItem['type']) }}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EAN13">EAN-13</SelectItem><SelectItem value="EAN8">EAN-8</SelectItem><SelectItem value="QR">QR</SelectItem><SelectItem value="CODE128">Code 128</SelectItem></SelectContent></Select></div></div>
          <div className="grid gap-2"><Label className="text-xs">Naziv proizvoda *</Label><Input placeholder="Naziv..." value={formData.productName} onChange={e => setFormData(p => ({ ...p, productName: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Šifra proizvoda</Label><Input placeholder="prod-xxx" value={formData.productId} onChange={e => setFormData(p => ({ ...p, productId: e.target.value }))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Input placeholder="Kategorija" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} /></div>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button><Button onClick={onSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== HEADER ====================

interface BarcodeHeaderProps {
  selectedForPrint: Set<string>
  onNew: () => void
  onPrint: () => void
}

export function BarcodeHeader({ selectedForPrint, onNew, onPrint }: BarcodeHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ScanBarcode className="h-6 w-6" />Баркод и QR код</h1><p className="text-sm text-muted-foreground">Генерисање, управљање и штампање баркодова</p></div>
      <div className="flex gap-2">
        {selectedForPrint.size > 0 && <Button variant="outline" size="sm" className="gap-2" onClick={onPrint}><Printer className="h-4 w-4" />Штампај ({selectedForPrint.size})</Button>}
        <Button size="sm" className="gap-2" onClick={onNew}><Plus className="h-4 w-4" />Novi barkod</Button>
      </div>
    </div>
  )
}
