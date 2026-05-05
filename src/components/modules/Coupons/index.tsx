'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Ticket, Plus, Search, Trash2, Pencil, Percent, Calendar, Tag, BarChart3, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

interface Coupon { id: string; code: string; type: 'percentage' | 'fixed'; value: number; minOrder: number; maxUses: number; usedCount: number; status: 'active' | 'expired' | 'draft'; validFrom: string; validTo: string; description: string }

const INITIAL: Coupon[] = [
  { id: '1', code: 'LETNI20', type: 'percentage', value: 20, minOrder: 5000, maxUses: 500, usedCount: 145, status: 'active', validFrom: '2024-06-01', validTo: '2024-08-31', description: 'Letnja popust 20%' },
  { id: '2', code: 'WELCOME500', type: 'fixed', value: 500, minOrder: 0, maxUses: 1000, usedCount: 823, status: 'active', validFrom: '2024-01-01', validTo: '2024-12-31', description: 'Welcome popust za nove kupce' },
  { id: '3', code: 'VIP15', type: 'percentage', value: 15, minOrder: 10000, maxUses: 200, usedCount: 200, status: 'expired', validFrom: '2024-01-01', validTo: '2024-03-31', description: 'VIP popust 15%' },
  { id: '4', code: 'BLACK1000', type: 'fixed', value: 1000, minOrder: 20000, maxUses: 100, usedCount: 0, status: 'draft', validFrom: '2024-11-20', validTo: '2024-11-30', description: 'Black Friday popust' },
  { id: '5', code: 'LOJAL10', type: 'percentage', value: 10, minOrder: 3000, maxUses: 0, usedCount: 567, status: 'active', validFrom: '2024-01-01', validTo: '2024-12-31', description: 'Lojalni popust za stalne kupce' },
]

function getStatusBadge(s: string) {
  const map: Record<string, { color: string; label: string }> = { active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' }, expired: { color: 'bg-red-100 text-red-800', label: 'Istekao' }, draft: { color: 'bg-slate-100 text-slate-600', label: 'Načrt' } }
  const r = map[s] || map.draft; return <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge>
}

export function Kupon() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({ code: '', type: 'percentage' as Coupon['type'], value: 0, minOrder: 0, maxUses: 100, validFrom: '', validTo: '', description: '' })

  useEffect(() => { setLoading(true); setTimeout(() => { setCoupons(INITIAL); setLoading(false) }, 200) }, [])

  const stats = { total: coupons.length, active: coupons.filter(c => c.status === 'active').length, totalUsed: coupons.reduce((s, c) => s + c.usedCount, 0), avgUsage: coupons.filter(c => c.maxUses > 0).length > 0 ? Math.round(coupons.filter(c => c.maxUses > 0).reduce((s, c) => s + (c.usedCount / c.maxUses * 100), 0) / coupons.filter(c => c.maxUses > 0).length) : 0 }

  const filtered = coupons.filter(c => (!search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())) && (!statusFilter || c.status === statusFilter))

  const handleNew = () => { setEditing(null); setFormData({ code: '', type: 'percentage', value: 0, minOrder: 0, maxUses: 100, validFrom: '', validTo: '', description: '' }); setDialogOpen(true) }
  const handleEdit = (c: Coupon) => { setEditing(c); setFormData({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxUses: c.maxUses, validFrom: c.validFrom, validTo: c.validTo, description: c.description }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.code) { toast.error('Unesite kôd'); return }
    if (editing) { setCoupons(prev => prev.map(c => c.id === editing.id ? { ...c, ...formData } : c)); toast.success('Kupon ažuriran') }
    else { setCoupons(prev => [{ id: `coup-${Date.now()}`, ...formData, usedCount: 0, status: 'draft' }, ...prev]); toast.success('Kupon kreiran') }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati kupon?')) return; setCoupons(prev => prev.filter(c => c.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Ticket className="h-6 w-6" />Купони и попусти</h1><p className="text-sm text-muted-foreground">Креирање и управљање купонским кодовима</p></div>
        <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Novi kupon</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Ticket className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Users className="h-3.5 w-3.5" />Iskorišćeno</div><p className="text-2xl font-bold">{stats.totalUsed.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BarChart3 className="h-3.5 w-3.5" />Prosek korišćenja</div><p className="text-2xl font-bold">{stats.avgUsage}%</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista kupona</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivni</SelectItem><SelectItem value="expired">Istekli</SelectItem><SelectItem value="draft">Načrti</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Kôd</TableHead><TableHead className="text-xs hidden sm:table-cell">Opis</TableHead><TableHead className="text-xs">Popust</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Korišćeno</TableHead><TableHead className="text-xs hidden lg:table-cell">Važi do</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema kupona</TableCell></TableRow> : filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell><span className="text-xs font-mono font-bold bg-muted/50 px-2 py-1 rounded">{c.code}</span></TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{c.description}</TableCell>
                    <TableCell><span className="text-xs font-bold">{c.type === 'percentage' ? `${c.value}%` : formatRSD(c.value)}</span>{c.minOrder > 0 && <p className="text-[10px] text-muted-foreground">Min: {formatRSD(c.minOrder)}</p>}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{c.maxUses > 0 ? <><span className="font-medium">{c.usedCount}</span><span className="text-muted-foreground">/{c.maxUses}</span></> : <span className="text-muted-foreground">∞</span>}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(c.validTo)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Novi'} kupon</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Kôd *</Label><Input className="font-mono uppercase" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="POPUST20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as Coupon['type'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Procenat (%)</SelectItem><SelectItem value="fixed">Fiksni iznos (RSD)</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Vrednost *</Label><Input type="number" value={formData.value} onChange={e => setFormData(p => ({ ...p, value: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Min. narudžba</Label><Input type="number" value={formData.minOrder} onChange={e => setFormData(p => ({ ...p, minOrder: parseInt(e.target.value) || 0 }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Max. korišćenja</Label><Input type="number" value={formData.maxUses} onChange={e => setFormData(p => ({ ...p, maxUses: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Važi od</Label><Input type="date" value={formData.validFrom} onChange={e => setFormData(p => ({ ...p, validFrom: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Važi do</Label><Input type="date" value={formData.validTo} onChange={e => setFormData(p => ({ ...p, validTo: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Opis</Label><Input value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
}
