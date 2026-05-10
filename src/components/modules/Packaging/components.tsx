'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Eye, Trash2, CheckCircle2, ScanBarcode, AlertTriangle } from 'lucide-react'
import type { PackagingOrder, PackagingStats } from './types'
import { STATUSES, PRIORITIES, PACK_TYPES, formatCurrency } from './data'

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function getPriorityBadge(p: string) {
  const r = PRIORITIES[p]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{p}</Badge>
}

function getPackTypeBadge(t: string) {
  const r = PACK_TYPES[t]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{t}</Badge>
}

export { getStatusBadge, getPriorityBadge, getPackTypeBadge }

export function PackagingStatsCards({ stats }: { stats: PackagingStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U toku</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1">QC</div><p className="text-xl font-bold text-amber-700">{stats.qc}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Završeno</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Stavki</div><p className="text-xl font-bold">{stats.totalItems}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Troškovi</div><p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p></Card>
    </div>
  )
}

export function OrdersTableSection({
  filtered, search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter, onViewDetail, onDelete,
}: {
  filtered: PackagingOrder[]
  search: string
  setSearch: (s: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  typeFilter: string
  setTypeFilter: (s: string) => void
  onViewDetail: (item: PackagingOrder) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Pakovanje narudžbina</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj, kupac..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(PACK_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Nalog</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Narudžba</TableHead>
              <TableHead className="text-xs">Kupac</TableHead>
              <TableHead className="text-xs">Tip</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Stavke</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Kutije</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Težina</TableHead>
              <TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema naloga</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetail(item)}>
                  <TableCell className="text-xs font-mono font-bold">{item.orderNumber}</TableCell>
                  <TableCell className="text-xs font-mono hidden sm:table-cell">{item.orderId}</TableCell>
                  <TableCell><div className="text-xs font-medium">{item.customerName}</div><div className="text-xs text-muted-foreground">{item.assignedTo || 'Nije dodeljen'}</div></TableCell>
                  <TableCell>{getPackTypeBadge(item.packagingType)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.items.length} proizvoda</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.boxCount}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{item.totalWeight >= 1000 ? `${(item.totalWeight / 1000).toFixed(1)}t` : `${item.totalWeight}kg`}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetail(item)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

