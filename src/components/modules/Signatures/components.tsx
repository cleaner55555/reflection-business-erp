'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PenTool, Plus, Search, Eye, Trash2, RefreshCw, CheckCircle2, Clock, BarChart3, FileSignature, AlertCircle } from 'lucide-react'

export interface SigningRequest {
  id: string; title: string; documentType: string; requesterId?: string; requesterName?: string; signerName: string
  status: string; priority: string; createdAt: string; signedAt?: string; notes?: string
}
export interface DashboardData {
  totalRequests: number; pendingRequests: number; signedRequests: number; rejectedRequests: number
  recentRequests: SigningRequest[]; typeBreakdown: Array<{ documentType: string; count: number }>
  priorityBreakdown: Array<{ priority: string; count: number }>
}
export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' }, signed: { label: 'Potpisano', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' }, expired: { label: 'Isteklo', color: 'bg-gray-100 text-gray-700' },
}
export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' }, medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' }, high: { label: 'Visok', color: 'bg-red-100 text-red-700' },
}
export const typeLabels: Record<string, string> = {
  contract: 'Ugovor', nda: 'NDA', invoice: 'Faktura', proposal: 'Predlog', policy: 'Pravilnik', other: 'Ostalo',
}

export function OverviewTab({ dashboard }: { dashboard: DashboardData | null }) {
  if (!dashboard) return <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  return (<>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno zahteva</span><FileSignature className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{dashboard.totalRequests}</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Na čekanju</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{dashboard.pendingRequests}</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Potpisano</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{dashboard.signedRequests}</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Odbijeno</span><AlertCircle className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{dashboard.rejectedRequests}</p></Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu dokumenta</CardTitle></CardHeader><CardContent className="space-y-3">{dashboard.typeBreakdown.map((tp) => (<div key={tp.documentType} className="flex items-center justify-between"><span className="text-sm">{typeLabels[tp.documentType] || tp.documentType}</span><div className="flex items-center gap-3"><div className="w-24 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalRequests ? (tp.count / dashboard.totalRequests) * 100 : 0}%` }} /></div><span className="text-sm font-medium w-8 text-right">{tp.count}</span></div></div>))}</CardContent></Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Po prioritetu</CardTitle></CardHeader><CardContent className="space-y-3">{dashboard.priorityBreakdown.map((pr) => { const cfg = priorityConfig[pr.priority]; return (<div key={pr.priority} className="flex items-center justify-between"><Badge variant="outline" className={cfg?.color || ''}>{cfg?.label || pr.priority}</Badge><span className="text-sm font-medium">{pr.count}</span></div>) })}</CardContent></Card>
    </div>
    <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni zahtevi</CardTitle></CardHeader><CardContent>
      {dashboard.recentRequests.length === 0 ? (<p className="text-sm text-muted-foreground py-8 text-center">Nema zahteva.</p>) : (<div className="space-y-2 max-h-64 overflow-y-auto">{dashboard.recentRequests.map((r) => { const cfg = statusConfig[r.status]; return (<div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0"><div><div className="text-sm font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{typeLabels[r.documentType] || r.documentType} · {r.signerName}</div></div><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge></div>) })}</div>)}
    </CardContent></Card>
  </>)
}

interface RequestsTabProps { items: SigningRequest[]; loading: boolean; search: string; filter: string; onSearchChange: (v: string) => void; onFilterChange: (v: string) => void; onView: (item: SigningRequest) => void; onUpdateStatus: (id: string, status: string) => void; onDelete: (id: string) => void; onOpenCreate: () => void }
export function RequestsTab({ items, loading, search, filter, onSearchChange, onFilterChange, onView, onUpdateStatus, onDelete, onOpenCreate }: RequestsTabProps) {
  return (<>
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} /></div>
      <Select value={filter} onValueChange={onFilterChange}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
    </div>
    {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : items.length === 0 ? (
      <Card className="p-8 text-center"><PenTool className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema zahteva</p><Button variant="outline" className="mt-3" onClick={onOpenCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj zahtev</Button></Card>
    ) : (
      <div className="rounded-lg border overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground"><th className="p-3">Naslov</th><th className="p-3">Tip</th><th className="p-3">Potpisnik</th><th className="p-3">Prioritet</th><th className="p-3">Status</th><th className="p-3">Akcije</th></tr></thead>
        <tbody>{items.map((r) => { const sCfg = statusConfig[r.status]; const pCfg = priorityConfig[r.priority]; return (<tr key={r.id} className="border-t hover:bg-muted/30"><td className="p-3 font-medium">{r.title}</td><td className="p-3">{typeLabels[r.documentType] || r.documentType}</td><td className="p-3">{r.signerName}</td><td className="p-3"><Badge variant="outline" className={`text-[10px] ${pCfg?.color || ''}`}>{pCfg?.label || r.priority}</Badge></td><td className="p-3"><Badge variant="outline" className={`text-[10px] ${sCfg?.color || ''}`}>{sCfg?.label || r.status}</Badge></td><td className="p-3"><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView(r)}><Eye className="h-3.5 w-3.5" /></Button>{r.status === 'pending' && (<><Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => onUpdateStatus(r.id, 'signed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => onUpdateStatus(r.id, 'rejected')}><AlertCircle className="h-3.5 w-3.5" /></Button>) }<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>) })}</tbody></table>
      </div></div>
    )}
  </>)
}

interface CreateDialogProps { open: boolean; onOpenChange: (open: boolean) => void; form: Record<string, string>; onFormChange: (field: string, value: string) => void; onCreate: () => void }
export function CreateSigningDialog({ open, onOpenChange, form, onFormChange, onCreate }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Novi zahtev za potpis</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2"><Label>Naslov dokumenta</Label><Input value={form.title} onChange={(e) => onFormChange('title', e.target.value)} placeholder="Naslov dokumenta" /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Tip dokumenta</Label><Select value={form.documentType} onValueChange={(v) => onFormChange('documentType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label>Prioritet</Label><Select value={form.priority} onValueChange={(v) => onFormChange('priority', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(priorityConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select></div></div>
        <div className="space-y-2"><Label>Potpisnik</Label><Input value={form.signerName} onChange={(e) => onFormChange('signerName', e.target.value)} placeholder="Ime i prezime potpisnika" /></div>
        <div className="space-y-2"><Label>Napomene</Label><Textarea value={form.notes} onChange={(e) => onFormChange('notes', e.target.value)} /></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button><Button onClick={onCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button></DialogFooter>
    </DialogContent></Dialog>
  )
}

interface DetailDialogProps { open: boolean; onOpenChange: (open: boolean) => void; item: SigningRequest | null }
export function DetailDialog({ open, onOpenChange, item }: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Detalji zahteva</DialogTitle></DialogHeader>
      {item && (<div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Naslov:</span> <span className="font-medium">{item.title}</span></div>
          <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[item.status]?.color}>{statusConfig[item.status]?.label}</Badge></div>
          <div><span className="text-muted-foreground">Tip:</span> {typeLabels[item.documentType] || item.documentType}</div>
          <div><span className="text-muted-foreground">Prioritet:</span> <Badge variant="outline" className={priorityConfig[item.priority]?.color}>{priorityConfig[item.priority]?.label}</Badge></div>
          <div><span className="text-muted-foreground">Potpisnik:</span> {item.signerName}</div>
          <div><span className="text-muted-foreground">Kreiran:</span> {new Date(item.createdAt).toLocaleDateString('sr-RS')}</div>
          {item.signedAt && <div><span className="text-muted-foreground">Potpisan:</span> {new Date(item.signedAt).toLocaleDateString('sr-RS')}</div>}
        </div>
        {item.notes && (<div className="text-sm"><span className="text-muted-foreground">Napomene:</span> {item.notes}</div>)}
      </div>)}
    </DialogContent></Dialog>
  )
}
