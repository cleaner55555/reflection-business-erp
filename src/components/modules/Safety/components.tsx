'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Shield, Eye, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Incident } from './types'
import { STATUSES, SEVERITIES, TYPES } from './data'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function getSeverityBadge(s: string) {
  const r = SEVERITIES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

interface Stats {
  total: number
  reported: number
  investigating: number
  resolved: number
  closed: number
  injuries: number
  totalLostDays: number
  critical: number
}

export function KpiCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Prijavljeni</div><p className="text-xl font-bold text-slate-700">{stats.reported}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Ispitivanje</div><p className="text-xl font-bold text-amber-700">{stats.investigating}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Rešeni</div><p className="text-xl font-bold text-emerald-700">{stats.resolved}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Povrede</div><p className="text-xl font-bold text-red-700">{stats.injuries}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Kritični</div><p className="text-xl font-bold text-red-700">{stats.critical}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Izgubljeni dani</div><p className="text-xl font-bold">{stats.totalLostDays}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Zatvoreno</div><p className="text-xl font-bold">{stats.closed}</p></Card>
    </div>
  )
}

export function IncidentsTable({
  filtered,
  search,
  severityFilter,
  onSearchChange,
  onSeverityFilterChange,
  onView,
  onDelete,
}: {
  filtered: Incident[]
  search: string
  severityFilter: string
  onSearchChange: (v: string) => void
  onSeverityFilterChange: (v: string) => void
  onView: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Incidenti</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Opis, lokacija..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
            <Select value={severityFilter || 'all'} onValueChange={v => onSeverityFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(SEVERITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Broj</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs hidden sm:table-cell">Lokacija</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Opis</TableHead><TableHead className="text-xs">Ozbiljnost</TableHead><TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema incidenta</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(item.id)}>
                  <TableCell className="text-xs font-mono">{item.number}</TableCell>
                  <TableCell className="text-xs">{TYPES[item.type]?.label}</TableCell>
                  <TableCell className="text-xs hidden sm:table-cell"><div>{item.location}</div><div className="text-xs text-muted-foreground">{item.department}</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{item.description}</TableCell>
                  <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.date)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
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

export function DetailDialog({
  detailItem,
  open,
  onClose,
}: {
  detailItem: Incident | null
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Detalji incidenta</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.number}</p><p className="text-xs text-muted-foreground">{TYPES[detailItem.type]?.label} · {detailItem.department}</p></div><div className="flex gap-2">{getSeverityBadge(detailItem.severity)}{getStatusBadge(detailItem.status)}</div></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium">{detailItem.description}</p><p className="text-xs text-muted-foreground mt-1">{detailItem.location} · {formatDate(detailItem.date)} {detailItem.time}</p></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Prijavio</div><p className="text-xs font-medium">{detailItem.reporterName}</p><p className="text-xs text-muted-foreground">{detailItem.reporterRole}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Povrede</div><p className="text-xs font-bold">{detailItem.injuredWorkers}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Izgubljeni dani</div><p className="text-xs font-bold">{detailItem.lostDays}</p></div>
            </div>
            {detailItem.rootCause && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Koreni uzrok</p><p className="text-xs">{detailItem.rootCause}</p></div>}
            {detailItem.correctiveAction && <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-xs text-emerald-600 mb-1">Korektivna mera</p><p className="text-xs">{detailItem.correctiveAction}</p><p className="text-xs text-muted-foreground mt-1">Odgovoran: {detailItem.responsible} · Rok: {detailItem.deadline ? formatDate(detailItem.deadline) : 'N/A'}</p></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function HeaderSection() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><Shield className="h-5 w-5 text-red-700 dark:text-red-400" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight">Zaštita na radu</h1><p className="text-sm text-muted-foreground">Prijava i praćenje incidenta</p></div>
      </div>
    </div>
  )
}
