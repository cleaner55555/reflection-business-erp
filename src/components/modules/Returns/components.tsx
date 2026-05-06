'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Trash2, Eye, RotateCcw, TrendingUp, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { ReturnItem } from './types'
import { STATUSES, REASONS, REFUND_METHODS, formatCurrency } from './data'

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function KpiCards({ stats }: { stats: { total: number; requested: number; inProcess: number; refunded: number; rejected: number; exchanged: number; totalRefunds: number; avgDays: string } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Zahtevi</div><p className="text-xl font-bold text-slate-700">{stats.requested}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U procesu</div><p className="text-xl font-bold text-blue-700">{stats.inProcess}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Refundirano</div><p className="text-xl font-bold text-emerald-700">{stats.refunded}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-violet-600 mb-1">Zamene</div><p className="text-xl font-bold text-violet-700">{stats.exchanged}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Odbijeni</div><p className="text-xl font-bold text-red-700">{stats.rejected}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno refund.</div><p className="text-xl font-bold">{formatCurrency(stats.totalRefunds)}</p></Card>
      <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Prosek dana</div><p className="text-xl font-bold">{stats.avgDays}</p></Card>
    </div>
  )
}

export function TableSection({ filtered, search, statusFilter, reasonFilter, onSearch, onStatusFilter, onReasonFilter, onDetail, onDelete }: {
  filtered: ReturnItem[]
  search: string
  statusFilter: string
  reasonFilter: string
  onSearch: (v: string) => void
  onStatusFilter: (v: string) => void
  onReasonFilter: (v: string) => void
  onDetail: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Povrati robe</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj, kupac..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={reasonFilter || 'all'} onValueChange={v => onReasonFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi razlozi</SelectItem>{Object.entries(REASONS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Broj</TableHead>
              <TableHead className="text-xs">Narudžba</TableHead>
              <TableHead className="text-xs">Kupac</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Razlog</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Refund</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead>
              <TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema povrata</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onDetail(item.id)}>
                  <TableCell className="text-xs font-mono">{item.returnNumber}</TableCell>
                  <TableCell className="text-xs font-mono">{item.orderNumber}</TableCell>
                  <TableCell><div className="text-xs font-medium">{item.customerName}</div><div className="text-[10px] text-muted-foreground">{item.customerEmail}</div></TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">{REASONS[item.returnReason]?.label}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.netRefund > 0 ? formatCurrency(item.netRefund) : '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.requestedDate)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDetail(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
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

export function AnalyticsTab({ data, stats }: { data: ReturnItem[]; stats: { totalRefunds: number; avgDays: string } }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-red-600" />Po razlogu povrata</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(REASONS).map(([k, v]) => {
            const count = data.filter(d => d.returnReason === k).length
            const amount = data.filter(d => d.returnReason === k).reduce((s, d) => s + d.netRefund, 0)
            return <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{v.label}</p><p className="text-[10px] text-muted-foreground">{count} povrata</p></div><p className="text-xs font-bold">{formatCurrency(amount)}</p></div>
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-amber-600" />Finansijski pregled</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ukupno refundirano</span><span className="text-xs font-bold text-red-600">{formatCurrency(stats.totalRefunds)}</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ukupno troškovi transporta</span><span className="text-xs font-bold">{formatCurrency(data.reduce((s, d) => s + d.shippingCost, 0))}</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ukupno restocking fee</span><span className="text-xs font-bold">{formatCurrency(data.reduce((s, d) => s + d.restockingFee, 0))}</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><span className="text-xs font-medium">Neto gubitak</span><span className="text-xs font-bold text-emerald-700">{formatCurrency(stats.totalRefunds + data.reduce((s, d) => s + d.shippingCost + d.restockingFee, 0))}</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Prosek obrade (dana)</span><span className="text-xs font-bold">{stats.avgDays}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DetailDialog({ detailItem, onClose, onStatusChange }: { detailItem: ReturnItem | null; onClose: () => void; onStatusChange: (id: string, status: ReturnItem['status']) => void }) {
  return (
    <Dialog open={!!detailItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Detalji povrata</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.returnNumber}</p><p className="text-xs text-muted-foreground">Narudžba: {detailItem.orderNumber}</p></div><div>{getStatusBadge(detailItem.status)}</div></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Kupac</div><p className="text-xs font-medium">{detailItem.customerName}</p><p className="text-[10px] text-muted-foreground">{detailItem.customerEmail}</p><p className="text-[10px] text-muted-foreground">{detailItem.customerPhone}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Razlog</div><p className="text-xs font-medium">{REASONS[detailItem.returnReason]?.label}</p><p className="text-[10px] text-muted-foreground">Nacin: {REFUND_METHODS[detailItem.refundMethod]?.label}</p><p className="text-[10px] text-muted-foreground">{detailItem.requestedDate && `Datum: ${formatDate(detailItem.requestedDate)}`}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Refund</div><p className="text-xs font-bold">{formatCurrency(detailItem.refundAmount)}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Transport</div><p className="text-xs font-bold">{formatCurrency(detailItem.shippingCost)}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Restocking</div><p className="text-xs font-bold">{formatCurrency(detailItem.restockingFee)}</p></div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="text-[10px] text-emerald-600 mb-1">Neto refund</div><p className="text-xs font-bold text-emerald-700">{formatCurrency(detailItem.netRefund)}</p></div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Stavke:</p>
              <Table><TableHeader><TableRow><TableHead className="text-[10px]">Proizvod</TableHead><TableHead className="text-[10px]">SKU</TableHead><TableHead className="text-[10px]">Kol.</TableHead><TableHead className="text-[10px]">Cena</TableHead><TableHead className="text-[10px]">Stanje</TableHead></TableRow></TableHeader>
              <TableBody>{detailItem.items.map((item, idx) => (
                <TableRow key={idx}><TableCell className="text-[10px]">{item.productName}</TableCell><TableCell className="text-[10px] font-mono">{item.sku}</TableCell><TableCell className="text-[10px]">{item.quantity}</TableCell><TableCell className="text-[10px]">{formatCurrency(item.unitPrice)}</TableCell><TableCell className="text-[10px]"><Badge variant="outline" className="text-[9px]">{item.condition}</Badge></TableCell></TableRow>
              ))}</TableBody></Table>
            </div>

            {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Napomena kupca</p><p className="text-xs">{detailItem.notes}</p></div>}
            {detailItem.internalNotes && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-[10px] text-blue-600 mb-1">Interna beleška</p><p className="text-xs">{detailItem.internalNotes}</p></div>}

            <div className="flex items-center gap-3">
              <Label className="text-xs">Promeni status:</Label>
              <Select value={detailItem.status} onValueChange={v => onStatusChange(detailItem.id, v as ReturnItem['status'])}><SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
