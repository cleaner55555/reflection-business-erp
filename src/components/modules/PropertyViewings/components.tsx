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
import { Plus, Search, Trash2, Pencil, Eye, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Viewing } from './types'
import { STATUSES, INTERESTS } from './data'

export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
export function getInterestBadge(s: string) { const r = INTERESTS[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function KpiCards({ total, upcomingCount, highInterestCount, noShowCount }: { total: number; upcomingCount: number; highInterestCount: number; noShowCount: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{total}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Predstojeći</div><p className="text-2xl font-bold text-blue-700">{upcomingCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Zainteresovani</div><p className="text-2xl font-bold text-emerald-700">{highInterestCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Nije došao</div><p className="text-2xl font-bold text-red-700">{noShowCount}</p></Card>
    </div>
  )
}

export function ViewingTable({
  filtered,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onView,
  onEdit,
  onDelete,
}: {
  filtered: Viewing[]
  search: string
  statusFilter: string
  onSearchChange: (v: string) => void
  onStatusFilterChange: (v: string) => void
  onView: (id: string) => void
  onEdit: (item: Viewing) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card><CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Lista pregleda</CardTitle><div className="flex gap-2 items-center"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div><Select value={statusFilter || 'all'} onValueChange={v => onStatusFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="scheduled">Zakazano</SelectItem><SelectItem value="completed">Obavljeno</SelectItem><SelectItem value="cancelled">Otkazano</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div></div></CardHeader><CardContent><div className="max-h-[480px] overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Nekretnina</TableHead><TableHead className="text-xs hidden sm:table-cell">Klijent</TableHead><TableHead className="text-xs hidden md:table-cell">Datum/Vreme</TableHead><TableHead className="text-xs hidden md:table-cell">Agent</TableHead><TableHead className="text-xs hidden lg:table-cell">Interes</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema pregleda</TableCell></TableRow> : filtered.map(item => (<TableRow key={item.id}><TableCell className="text-xs font-medium max-w-[160px] truncate">{item.propertyTitle}</TableCell><TableCell className="text-xs hidden sm:table-cell">{item.clientName}</TableCell><TableCell className="text-xs text-muted-foreground hidden md:table-cell">{formatDate(item.date)} {item.time}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.agent}</TableCell><TableCell className="hidden lg:table-cell">{item.status !== 'scheduled' ? getInterestBadge(item.clientInterest) : <span className="text-xs text-muted-foreground">—</span>}</TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
  )
}

export function AddForm({ form, onFormChange, onSave }: { form: Partial<Viewing>; onFormChange: (f: Partial<Viewing>) => void; onSave: () => void }) {
  return (
    <Card><CardHeader><CardTitle className="text-base">Novi pregled</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Nekretnina *</Label><Input className="text-xs" value={form.propertyTitle || ''} onChange={e => onFormChange({ ...form, propertyTitle: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Klijent *</Label><Input className="text-xs" value={form.clientName || ''} onChange={e => onFormChange({ ...form, clientName: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => onFormChange({ ...form, phone: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Agent</Label><Input className="text-xs" value={form.agent || ''} onChange={e => onFormChange({ ...form, agent: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => onFormChange({ ...form, date: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Vreme</Label><Input className="text-xs" type="time" value={form.time || ''} onChange={e => onFormChange({ ...form, time: e.target.value })} /></div></div><div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => onFormChange({ ...form, notes: e.target.value })} /></div><Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj</Button></div></CardContent></Card>
  )
}

export function EditList({ data, onEdit, onDelete }: { data: Viewing[]; onEdit: (item: Viewing) => void; onDelete: (id: string) => void }) {
  return (
    <Card><CardHeader><CardTitle className="text-base">Uredi</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-medium">{item.propertyTitle}</span>{getStatusBadge(item.status)}</div><p className="text-xs text-muted-foreground truncate">{item.clientName} — {formatDate(item.date)} {item.time}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card>
  )
}

export function DetailDialog({ detailItem, open, onClose }: { detailItem: Viewing | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Detalji pregleda</DialogTitle></DialogHeader>{detailItem && (<div className="space-y-3"><h3 className="text-sm font-semibold">{detailItem.propertyTitle}</h3><div className="grid grid-cols-2 gap-3">{[['Klijent', detailItem.clientName],['Telefon', detailItem.phone],['Agent', detailItem.agent],['Datum', formatDate(detailItem.date)],['Vreme', detailItem.time],['Trajanje', `${detailItem.duration} min`]].map(([l, v]) => (<div key={l} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{l}</div><div className="text-xs font-medium">{v}</div></div>))}</div><div className="flex gap-3"><div className="p-2 rounded-lg bg-muted/50 flex-1"><div className="text-[10px] text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div><div className="p-2 rounded-lg bg-muted/50 flex-1"><div className="text-[10px] text-muted-foreground mb-1">Interes</div>{getInterestBadge(detailItem.clientInterest)}</div></div>{detailItem.feedback && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Fidbek</div><div className="text-xs">{detailItem.feedback}</div></div>}{detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}</div>)}</DialogContent></Dialog>
  )
}

export function EditDialog({ editItem, form, onFormChange, open, onClose, onSave }: { editItem: Viewing | null; form: Partial<Viewing>; onFormChange: (f: Partial<Viewing>) => void; open: boolean; onClose: () => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Novi pregled'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'scheduled'} onValueChange={v => onFormChange({ ...form, status: v as Viewing['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Zakazano</SelectItem><SelectItem value="completed">Obavljeno</SelectItem><SelectItem value="cancelled">Otkazano</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Interes</Label><Select value={form.clientInterest || 'medium'} onValueChange={v => onFormChange({ ...form, clientInterest: v as Viewing['clientInterest'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">Visoko</SelectItem><SelectItem value="medium">Srednje</SelectItem><SelectItem value="low">Nisko</SelectItem><SelectItem value="none">Nema</SelectItem></SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Fidbek</Label><Input className="text-xs" value={form.feedback || ''} onChange={e => onFormChange({ ...form, feedback: e.target.value })} /></div></div><DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
  )
}
