'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, Plus, Search, Trash2, Pencil, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Clock, Banknote, Building2, Wallet, Smartphone, QrCode, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime } from '@/lib/helpers'

interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  partnerName: string
  amount: number
  method: 'bank_transfer' | 'cash' | 'card' | 'qr' | 'other'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  reference: string
  date: string
  description: string
}

const METHODS: Record<string, { label: string; icon: typeof CreditCard }> = {
  bank_transfer: { label: 'Bankovni prenos', icon: Building2 },
  cash: { label: 'Gotovina', icon: Banknote },
  card: { label: 'Kartica', icon: CreditCard },
  qr: { label: 'QR uplatnica', icon: QrCode },
  other: { label: 'Ostalo', icon: Wallet },
}

const INITIAL: Payment[] = [
  { id: '1', invoiceId: 'inv-1', invoiceNumber: 'F-2024-0234', partnerName: 'ACME doo', amount: 125000, method: 'bank_transfer', status: 'completed', reference: '2024-06-15-001', date: '2024-06-15T10:30:00', description: 'Plaćanje fakture F-2024-0234' },
  { id: '2', invoiceId: 'inv-2', invoiceNumber: 'F-2024-0230', partnerName: 'Tech Solutions', amount: 89500, method: 'card', status: 'completed', reference: 'TXN-98765', date: '2024-06-14T14:20:00', description: 'Kartica' },
  { id: '3', invoiceId: 'inv-3', invoiceNumber: 'F-2024-0235', partnerName: 'Delta Trade', amount: 210000, method: 'bank_transfer', status: 'pending', reference: '—', date: '2024-06-16T00:00:00', description: 'Rok plaćanja: 16.06.2024' },
  { id: '4', invoiceId: 'inv-4', invoiceNumber: 'F-2024-0228', partnerName: 'Mini Market', amount: 35000, method: 'cash', status: 'completed', reference: 'RAC-1234', date: '2024-06-13T09:00:00', description: 'Gotovina u kasi' },
  { id: '5', invoiceId: 'inv-5', invoiceNumber: 'F-2024-0225', partnerName: 'Balkan Import', amount: 450000, method: 'qr', status: 'completed', reference: 'QR-5678', date: '2024-06-12T16:45:00', description: 'QR uplatnica' },
  { id: '6', invoiceId: 'inv-6', invoiceNumber: 'F-2024-0220', partnerName: 'StartUp Lab', amount: 75000, method: 'bank_transfer', status: 'failed', reference: 'REJ-001', date: '2024-06-11T08:00:00', description: 'Odbijeno: nedovoljna sredstva' },
  { id: '7', invoiceId: 'inv-7', invoiceNumber: 'F-2024-0236', partnerName: 'Green Energy', amount: 180000, method: 'bank_transfer', status: 'refunded', reference: 'REF-001', date: '2024-06-10T11:30:00', description: 'Povrat sredstava' },
]

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćeno', icon: CheckCircle2 },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju', icon: Clock },
    failed: { color: 'bg-red-100 text-red-800', label: 'Neuspešno', icon: XCircle },
    refunded: { color: 'bg-violet-100 text-violet-800', label: 'Povraćeno', icon: ArrowDownRight },
  }
  const s = map[status] || map.pending
  return <Badge className={`${s.color} gap-1 text-[10px]`}><s.icon className="h-3 w-3" />{s.label}</Badge>
}

export function Placanja() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [formData, setFormData] = useState({ partnerName: '', invoiceNumber: '', amount: '', method: 'bank_transfer' as Payment['method'], status: 'pending' as Payment['status'], reference: '', description: '' })

  useEffect(() => { setLoading(true); setTimeout(() => { setPayments(INITIAL); setLoading(false) }, 200) }, [])

  const stats = {
    total: payments.reduce((s, p) => s + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
    failed: payments.filter(p => p.status === 'failed').length,
    count: payments.length,
    avgAmount: payments.length > 0 ? payments.reduce((s, p) => s + p.amount, 0) / payments.length : 0,
  }

  const filtered = payments.filter(p => {
    return (!search || p.partnerName.toLowerCase().includes(search.toLowerCase()) || p.invoiceNumber.includes(search) || p.reference.includes(search)) && (!statusFilter || p.status === statusFilter) && (!methodFilter || p.method === methodFilter)
  })

  const handleNew = () => { setEditing(null); setFormData({ partnerName: '', invoiceNumber: '', amount: '', method: 'bank_transfer', status: 'pending', reference: '', description: '' }); setDialogOpen(true) }
  const handleEdit = (p: Payment) => { setEditing(p); setFormData({ partnerName: p.partnerName, invoiceNumber: p.invoiceNumber, amount: String(p.amount), method: p.method, status: p.status, reference: p.reference, description: p.description }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.partnerName || !formData.amount) { toast.error('Popunite polja'); return }
    const amt = parseFloat(formData.amount) || 0
    if (editing) { setPayments(prev => prev.map(p => p.id === editing.id ? { ...p, partnerName: formData.partnerName, amount: amt, method: formData.method, status: formData.status } : p)); toast.success('Plaćanje ažurirano') }
    else { setPayments(prev => [{ id: `pay-${Date.now()}`, invoiceId: '', invoiceNumber: formData.invoiceNumber, partnerName: formData.partnerName, amount: amt, method: formData.method, status: formData.status, reference: formData.reference, date: new Date().toISOString(), description: formData.description }, ...prev]); toast.success('Plaćanje kreirano') }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati plaćanje?')) return; setPayments(prev => prev.filter(p => p.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Wallet className="h-6 w-6" />Плаћања</h1><p className="text-sm text-muted-foreground">Праћење и управљање уплатама и изplatама</p></div>
        <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Novo plaćanje</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Wallet className="h-3.5 w-3.5" />Ukupno</div><p className="text-lg font-bold">{formatRSD(stats.total)}</p><p className="text-[10px] text-muted-foreground">{stats.count} plaćanja</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Plaćeno</div><p className="text-lg font-bold text-emerald-700">{formatRSD(stats.completed)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-amber-600 mb-1"><Clock className="h-3.5 w-3.5" />Na čekanju</div><p className="text-lg font-bold text-amber-700">{formatRSD(stats.pending)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><XCircle className="h-3.5 w-3.5" />Neuspešnih</div><p className="text-2xl font-bold text-red-700">{stats.failed}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><ArrowUpRight className="h-3.5 w-3.5" />Prosek</div><p className="text-lg font-bold">{formatRSD(stats.avgAmount)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Building2 className="h-3.5 w-3.5" />Bank. prenos</div><p className="text-2xl font-bold">{payments.filter(p => p.method === 'bank_transfer' && p.status === 'completed').length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista plaćanja</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem><SelectItem value="completed">Plaćeno</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="failed">Neuspešno</SelectItem><SelectItem value="refunded">Povraćeno</SelectItem></SelectContent></Select>
              <Select value={methodFilter || 'all'} onValueChange={v => setMethodFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve metode</SelectItem>{Object.entries(METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs hidden sm:table-cell">Faktura</TableHead><TableHead className="text-xs">Iznos</TableHead><TableHead className="text-xs hidden md:table-cell">Metoda</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Referenca</TableHead><TableHead className="text-xs hidden sm:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema plaćanja</TableCell></TableRow> : filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell><p className="text-xs font-medium">{p.partnerName}</p><p className="text-[10px] text-muted-foreground">{p.description}</p></TableCell>
                    <TableCell className="hidden sm:table-cell text-xs font-mono">{p.invoiceNumber || '—'}</TableCell>
                    <TableCell><span className="text-xs font-bold">{formatRSD(p.amount)}</span></TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-[10px] gap-1">{(() => { const m = METHODS[p.method]; return <><m.icon className="h-2.5 w-2.5" />{m.label}</> })()}</Badge></TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">{p.reference}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{formatDate(p.date)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? 'Izmeni plaćanje' : 'Novo plaćanje'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Partner *</Label><Input value={formData.partnerName} onChange={e => setFormData(p => ({ ...p, partnerName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Broj fakture</Label><Input value={formData.invoiceNumber} onChange={e => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Iznos (RSD) *</Label><Input type="number" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Metoda</Label><Select value={formData.method} onValueChange={v => setFormData(p => ({ ...p, method: v as Payment['method'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as Payment['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="completed">Plaćeno</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="failed">Neuspešno</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Referenca</Label><Input value={formData.reference} onChange={e => setFormData(p => ({ ...p, reference: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
