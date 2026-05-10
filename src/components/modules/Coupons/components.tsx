'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Eye, Pencil, Trash2, CheckCircle2, Clock, Tag } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { STATUSES, TYPES } from './data'
import type { Coupon } from './types'

export function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n) }

export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
export function getTypeLabel(t: string) { return TYPES[t]?.label || t }

export function KpiCards({ stats }: { stats: { total: number; active: number; scheduled: number; expired: number; totalUsed: number; totalDiscount: number } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivni</div><p className="text-xl font-bold text-emerald-700">{stats.active}</p></Card>
      <Card className="p-4"><div className="text-xs text-sky-600 mb-1">Zakazani</div><p className="text-xl font-bold text-sky-700">{stats.scheduled}</p></Card>
      <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Istekli</div><p className="text-xl font-bold text-slate-700">{stats.expired}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Iskorišćeno</div><p className="text-xl font-bold">{stats.totalUsed}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupan popust</div><p className="text-xl font-bold">{formatCurrency(stats.totalDiscount)}</p></Card>
    </div>
  )
}

export function TableSection({
  filtered, search, statusFilter, typeFilter,
  onSearchChange, onStatusFilterChange, onTypeFilterChange,
  onView, onEdit, onToggleStatus, onDelete
}: {
  filtered: Coupon[]
  search: string
  statusFilter: string
  typeFilter: string
  onSearchChange: (v: string) => void
  onStatusFilterChange: (v: string) => void
  onTypeFilterChange: (v: string) => void
  onView: (item: Coupon) => void
  onEdit: (item: Coupon) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Svi kuponi</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kod, naziv..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={typeFilter || 'all'} onValueChange={v => onTypeFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Kod</TableHead>
              <TableHead className="text-xs">Naziv</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Tip</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Popust</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Korišćenje</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Period</TableHead>
              <TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema kupona</TableCell></TableRow> : filtered.map(item => {
                const usagePct = item.usageLimit > 0 ? Math.round((item.usageCount / item.usageLimit) * 100) : 0
                return (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(item)}>
                    <TableCell className="text-xs font-mono font-bold text-emerald-700">{item.code}</TableCell>
                    <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground truncate max-w-[150px]">{item.description}</div></TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{getTypeLabel(item.type)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell font-medium">{item.type === 'percentage' ? `${item.discountValue}%` : item.type === 'fixed' ? formatCurrency(item.discountValue) : item.type === 'free_shipping' ? 'Besplatan' : item.type === 'bogo' ? '2 za 1' : formatCurrency(item.discountValue)}</TableCell>
                    <TableCell className="hidden md:table-cell"><div className="w-20"><div className="flex justify-between text-xs mb-1"><span>{item.usageCount}/{item.usageLimit}</span><span>{usagePct}%</span></div><Progress value={usagePct} className="h-1.5" /></div></TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.startDate)} — {formatDate(item.endDate)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={() => onToggleStatus(item.id)}>{item.status === 'active' ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}</Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

