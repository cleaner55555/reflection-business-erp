'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  RefreshCw, Plus, Search, Eye, Trash2, BarChart3,
  CheckCircle2, Clock, DollarSign, Users, TrendingUp, X
} from 'lucide-react'

interface Subscription {
  id: string
  name: string
  partnerId?: string
  partnerName?: string
  status: string
  price: number
  billingCycle: string
  startDate: string
  nextBillingDate?: string
  notes?: string
  createdAt: string
}

interface DashboardData {
  totalSubs: number
  activeSubs: number
  expiringSubs: number
  monthlyRevenue: number
  avgPrice: number
  recentSubs: Subscription[]
  statusBreakdown: Array<{ status: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pauzirana', color: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Istekla', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Otkazana', color: 'bg-gray-100 text-gray-700' },
}

const cycleLabels: Record<string, string> = { monthly: 'Mesečno', quarterly: 'Kvartalno', yearly: 'Godišnje' }

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

export function Pretplate() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Subscription[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [partners, setPartners] = useState<Array<{ id: string; name: string }>>([])

  const emptyForm = { name: '', partnerId: '', price: 0, billingCycle: 'monthly', startDate: new Date().toISOString().split('T')[0], notes: '' }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/subscriptions/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) setDashboard(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/subscriptions?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  const loadPartners = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/partners?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) setPartners(await res.json().then((d: Array<Record<string, unknown>>) => d.map((p) => ({ id: p.id as string, name: p.name as string }))))
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => { loadDashboard(); loadPartners() }, [activeCompanyId, loadDashboard, loadPartners])
  useEffect(() => { if (activeTab === 'subscriptions') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, ...form }) })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati pretplatu?')) return
    try {
      const res = await fetch(`/api/subscriptions?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadItems()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pretplate</h1>
          <p className="text-sm text-muted-foreground">Upravljanje pretplatama i periodičnim naplatama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova pretplata</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="subscriptions"><CheckCircle2 className="h-4 w-4 mr-1" /> Pretplate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno pretplata</span><Users className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{dashboard.totalSubs}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Aktivne</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{dashboard.activeSubs}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ističu uskoro</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{dashboard.expiringSubs}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Mesečni prihod</span><DollarSign className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{formatCurrency(dashboard.monthlyRevenue)}</p></Card>
              </div>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusu</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {dashboard.statusBreakdown.map((s) => {
                    const cfg = statusConfig[s.status]
                    return (
                      <div key={s.status} className="flex items-center justify-between">
                        <Badge variant="outline" className={cfg?.color || ''}>{cfg?.label || s.status}</Badge>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalSubs ? (s.count / dashboard.totalSubs) * 100 : 0}%` }} /></div>
                          <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne pretplate</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentSubs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema pretplata</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentSubs.map((s) => {
                        const cfg = statusConfig[s.status]
                        return (
                          <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div><div className="text-sm font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.partnerName} · {cycleLabels[s.billingCycle] || s.billingCycle}</div></div>
                            <div className="text-right"><div className="text-sm font-medium">{formatCurrency(s.price)}</div><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || s.status}</Badge></div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži pretplate..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : items.length === 0 ? (
            <Card className="p-8 text-center"><TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema pretplata</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj pretplatu</Button></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => {
                const cfg = statusConfig[s.status]
                return (
                  <Card key={s.id} className="relative">
                    <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-base">{s.name}</CardTitle><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || s.status}</Badge></div></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Partner</span><span>{s.partnerName || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Cena</span><span className="font-bold">{formatCurrency(s.price)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Ciklus</span><span>{cycleLabels[s.billingCycle] || s.billingCycle}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Početak</span><span className="text-xs">{new Date(s.startDate).toLocaleDateString('sr-RS')}</span></div>
                      <div className="flex justify-end gap-1 pt-2"><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova pretplata</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv pretplate</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Partner</Label><Select value={form.partnerId} onValueChange={(v) => setForm({ ...form, partnerId: v })}><SelectTrigger><SelectValue placeholder="Izaberite partnera" /></SelectTrigger><SelectContent>{partners.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cena (RSD)</Label><Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Ciklus naplate</Label><Select value={form.billingCycle} onValueChange={(v) => setForm({ ...form, billingCycle: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Mesečno</SelectItem><SelectItem value="quarterly">Kvartalno</SelectItem><SelectItem value="yearly">Godišnje</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Datum početka</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Napomene</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
