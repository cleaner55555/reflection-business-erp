'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Eye, Trash2, Users, HardHat, DollarSign, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { STATUSES, TYPES } from './data'
import type { ConstructionSite } from './types'

export function formatCurrency(n: number) { return n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K` }
export function formatCurrencyFull(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(n) }
export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
export function getTypeBadge(t: string) { const r = TYPES[t]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{t}</Badge> }

export function KpiCards({ stats }: { stats: { total: number; active: number; completed: number; onHold: number; totalWorkers: number; totalBudget: number; totalSpent: number; avgProgress: number } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Aktivna</div><p className="text-xl font-bold text-blue-700">{stats.active}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Završena</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Pauzirana</div><p className="text-xl font-bold text-red-700">{stats.onHold}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Radnici</div><p className="text-xl font-bold">{stats.totalWorkers}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Budžet</div><p className="text-xl font-bold">{formatCurrency(stats.totalBudget)}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Potrošeno</div><p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Prosek napr.</div><p className="text-xl font-bold">{stats.avgProgress}%</p></Card>
    </div>
  )
}

export function TableSection({
  filtered, search, statusFilter,
  onSearchChange, onStatusFilterChange,
  onView, onDelete
}: {
  filtered: ConstructionSite[]
  search: string
  statusFilter: string
  onSearchChange: (v: string) => void
  onStatusFilterChange: (v: string) => void
  onView: (item: ConstructionSite) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Sva gradilišta</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naziv, grad..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Kod</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Grad</TableHead>
              <TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Napredak</TableHead><TableHead className="text-xs hidden lg:table-cell">Budžet</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Radnika</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema gradilišta</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(item)}>
                  <TableCell className="text-xs font-mono">{item.code}</TableCell>
                  <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.address}</div></TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">{item.city}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="hidden md:table-cell"><div className="w-20"><div className="flex justify-between text-xs mb-0.5"><span>{item.progress}%</span></div><Progress value={item.progress} className="h-1.5" /></div></TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{formatCurrency(item.budget)}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell"><Users className="h-3 w-3 inline mr-1" />{item.workers}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item)}><Eye className="h-3.5 w-3.5" /></Button>
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

export function OverviewTab({ data }: { data: ConstructionSite[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-600" />Budžet po projektu</CardTitle></CardHeader><CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {data.map(d => <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.city}</p></div><div className="text-right"><p className="text-xs font-bold">{formatCurrencyFull(d.spent)}</p><p className="text-xs text-muted-foreground">od {formatCurrencyFull(d.budget)}</p></div></div>)}
      </CardContent></Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Aktivni zadaci</CardTitle></CardHeader><CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {data.flatMap(d => d.tasks.filter(t => t.status !== 'completed').map(t => ({ ...t, site: d.name }))).map((t, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.site}</p></div><div className="flex items-center gap-2"><Badge className={`${t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'} text-xs`}>{t.status === 'in_progress' ? 'U toku' : 'Čeka'}</Badge><span className="text-xs text-muted-foreground">{formatDate(t.deadline)}</span></div></div>
        ))}
      </CardContent></Card>
    </div>
  )
}

export function DetailDialog({ detailItem, open, onClose }: { detailItem: ConstructionSite | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Detalji gradilišta</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-lg font-bold">{detailItem.name}</p><p className="text-xs text-muted-foreground font-mono">{detailItem.code}</p></div><div className="flex gap-2">{getStatusBadge(detailItem.status)}{getTypeBadge(detailItem.type)}</div></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Investitor</div><p className="text-xs font-medium">{detailItem.investor}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Izvođač</div><p className="text-xs font-medium">{detailItem.contractor}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Rukovodilac</div><p className="text-xs font-medium">{detailItem.projectManager}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Lokacija</div><p className="text-xs">{detailItem.city}</p><p className="text-xs text-muted-foreground">{detailItem.address}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Radnika</div><p className="text-xs font-bold">{detailItem.workers}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Površina</div><p className="text-xs font-bold">{detailItem.area > 0 ? `${detailItem.area} m²` : '-'}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Spratova</div><p className="text-xs font-bold">{detailItem.floors || '-'}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Jedinica</div><p className="text-xs font-bold">{detailItem.units || '-'}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Početak</div><p className="text-xs">{formatDate(detailItem.startDate)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Budžet</div><p className="text-sm font-bold">{formatCurrencyFull(detailItem.budget)}</p><p className="text-xs text-muted-foreground">Potrošeno: {formatCurrencyFull(detailItem.spent)}</p></div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="text-xs text-emerald-600 mb-1">Napredak</div><p className="text-sm font-bold text-emerald-700">{detailItem.progress}%</p><Progress value={detailItem.progress} className="h-2 mt-1" /></div>
            </div>
            {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
            {detailItem.tasks.length > 0 && (
              <div className="space-y-2"><p className="text-xs font-medium">Aktivni zadaci:</p>
                {detailItem.tasks.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">{t.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : t.status === 'in_progress' ? <Clock className="h-3.5 w-3.5 text-blue-600" /> : <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />}<span className="text-xs">{t.name}</span></div>
                    <span className="text-xs text-muted-foreground">{formatDate(t.deadline)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
