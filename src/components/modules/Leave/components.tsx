'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Eye, Trash2, CheckCircle2, XCircle, CalendarDays, CalendarOff, RefreshCw } from 'lucide-react'

export interface LeaveRequest {
  id: string; employeeName: string; type: string; startDate: string; endDate: string
  daysCount: number; status: string; reason?: string; approvedBy?: string; createdAt: string
}

export interface DashboardData {
  totalRequests: number; pendingRequests: number; approvedRequests: number; rejectedRequests: number
  currentMonthAbsences: number; recentRequests: LeaveRequest[]; typeBreakdown: Array<{ type: string; count: number }>
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-700' },
}

export const typeLabels: Record<string, string> = {
  vacation: 'Godišnji odmor', sick: 'Bolovanje', personal: 'Slobodan dan', maternity: 'Porodiljsko', unpaid: 'Neplaćeni', education: 'Edukacija',
}

export function OverviewContent({ dashboard, loading }: { dashboard: DashboardData | null; loading: boolean }) {
  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  if (!dashboard) return null
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Na čekanju</span><CalendarOff className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{dashboard.pendingRequests}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Odobreno</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{dashboard.approvedRequests}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Odbijeno</span><XCircle className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{dashboard.rejectedRequests}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Odsustva ovog meseca</span><CalendarDays className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold">{dashboard.currentMonthAbsences}</p></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.typeBreakdown.map((tp) => (
              <div key={tp.type} className="flex items-center justify-between">
                <span className="text-sm">{typeLabels[tp.type] || tp.type}</span>
                <div className="flex items-center gap-3"><div className="w-24 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalRequests ? (tp.count / dashboard.totalRequests) * 100 : 0}%` }} /></div><span className="text-sm font-medium w-8 text-right">{tp.count}</span></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno zahteva</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center"><CalendarOff className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="text-3xl font-bold">{dashboard.totalRequests}</p><p className="text-sm text-muted-foreground mt-1">ukupno</p></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni zahtevi</CardTitle></CardHeader>
        <CardContent>
          {dashboard.recentRequests.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Nema zahteva.</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboard.recentRequests.map((r) => {
                const cfg = statusConfig[r.status]
                return (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div><div className="text-sm font-medium">{r.employeeName}</div><div className="text-xs text-muted-foreground">{typeLabels[r.type] || r.type} · {r.daysCount} dana · {new Date(r.startDate).toLocaleDateString('sr-RS')}</div></div>
                    <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export function RequestsList({ items, loading, search, filter, onSearch, onFilter, onView, onApprove, onReject, onDelete, onCreate }: {
  items: LeaveRequest[]; loading: boolean; search: string; filter: string
  onSearch: (v: string) => void; onFilter: (v: string) => void; onView: (r: LeaveRequest) => void
  onApprove: (id: string) => void; onReject: (id: string) => void; onDelete: (id: string) => void; onCreate: () => void
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={e => onSearch(e.target.value)} /></div>
        <Select value={filter} onValueChange={onFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
      </div>
      {loading ? <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div> : items.length === 0 ? (
        <Card className="p-8 text-center"><CalendarOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema zahteva</p><Button variant="outline" className="mt-3" onClick={onCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj zahtev</Button></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground"><th className="p-3">Zaposleni</th><th className="p-3">Tip</th><th className="p-3">Period</th><th className="p-3">Dani</th><th className="p-3">Status</th><th className="p-3">Akcije</th></tr></thead>
            <tbody>{items.map((r) => {
              const cfg = statusConfig[r.status]
              return (<tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-medium">{r.employeeName}</td><td className="p-3">{typeLabels[r.type] || r.type}</td>
                <td className="p-3 text-xs">{new Date(r.startDate).toLocaleDateString('sr-RS')} - {new Date(r.endDate).toLocaleDateString('sr-RS')}</td>
                <td className="p-3">{r.daysCount}</td>
                <td className="p-3"><Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge></td>
                <td className="p-3"><div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView(r)}><Eye className="h-3.5 w-3.5" /></Button>
                  {r.status === 'pending' && (<><Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => onApprove(r.id)}><CheckCircle2 className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => onReject(r.id)}><XCircle className="h-3.5 w-3.5" /></Button></>)}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></td>
              </tr>)
            })}</tbody>
          </table>
        </div></div>
      )}
    </>
  )
}

export function CreateDialog({ open, onOpenChange, form, onFormChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; form: Record<string, unknown>; onFormChange: (f: string, v: unknown) => void; onSubmit: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Novi zahtev za odsustvo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Zaposleni</Label><Input value={form.employeeName as string} onChange={e => onFormChange('employeeName', e.target.value)} placeholder="Ime i prezime zaposlenog" /></div>
          <div className="space-y-2"><Label>Tip odsustva</Label><Select value={form.type as string} onValueChange={v => onFormChange('type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Datum početka</Label><Input type="date" value={form.startDate as string} onChange={e => onFormChange('startDate', e.target.value)} /></div><div className="space-y-2"><Label>Datum završetka</Label><Input type="date" value={form.endDate as string} onChange={e => onFormChange('endDate', e.target.value)} /></div></div>
          <div className="space-y-2"><Label>Razlog</Label><Textarea value={form.reason as string} onChange={e => onFormChange('reason', e.target.value)} placeholder="Razlog odsustva..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button><Button onClick={onSubmit}><Plus className="h-4 w-4 mr-1" /> Podnesi</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DetailDialog({ open, onOpenChange, selected }: { open: boolean; onOpenChange: (v: boolean) => void; selected: LeaveRequest | null }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Detalji zahteva</DialogTitle></DialogHeader>
        {selected && (<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Zaposleni:</span> <span className="font-medium">{selected.employeeName}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
            <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.type] || selected.type}</div>
            <div><span className="text-muted-foreground">Dani:</span> <span className="font-bold">{selected.daysCount}</span></div>
            <div><span className="text-muted-foreground">Od:</span> {new Date(selected.startDate).toLocaleDateString('sr-RS')}</div>
            <div><span className="text-muted-foreground">Do:</span> {new Date(selected.endDate).toLocaleDateString('sr-RS')}</div>
            {selected.approvedBy && <div><span className="text-muted-foreground">Odobrio:</span> {selected.approvedBy}</div>}
          </div>
          {selected.reason && <div className="text-sm"><span className="text-muted-foreground">Razlog:</span> {selected.reason}</div>}
        </div>)}
      </DialogContent>
    </Dialog>
  )
}
