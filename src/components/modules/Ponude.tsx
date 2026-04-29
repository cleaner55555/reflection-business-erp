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
  FileText, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, ArrowRight, BarChart3, DollarSign,
  TrendingUp, AlertCircle, Send, X
} from 'lucide-react'

interface SalesOrder {
  id: string
  number: string
  partnerId?: string
  partnerName?: string
  status: string
  totalAmount: number
  dateOrder: string
  validUntil?: string
  notes?: string
  createdAt: string
}

interface DashboardData {
  totalOrders: number
  draftOrders: number
  sentOrders: number
  confirmedOrders: number
  totalAmount: number
  avgAmount: number
  recentOrders: SalesOrder[]
  statusBreakdown: Array<{ status: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Poslato', color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Potvrđeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

export function Ponude() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [partners, setPartners] = useState<Array<{ id: string; name: string }>>([])

  const emptyForm = { partnerId: '', totalAmount: 0, dateOrder: new Date().toISOString().split('T')[0], validUntil: '', notes: '' }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/sales-orders/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) setDashboard(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadOrders = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/sales-orders?${params}`)
      if (res.ok) setOrders(await res.json())
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

  useEffect(() => {
    loadDashboard()
    loadPartners()
  }, [activeCompanyId, loadDashboard, loadPartners])

  useEffect(() => {
    if (activeTab === 'orders') loadOrders()
  }, [activeTab, loadOrders])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadOrders(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/sales-orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ponudu?')) return
    try {
      const res = await fetch(`/api/sales-orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ponude</h1>
          <p className="text-sm text-muted-foreground">Upravljanje prodajnim ponudama i cjenovnicima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadOrders() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova ponuda
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="orders"><FileText className="h-4 w-4 mr-1" /> Ponude</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno ponuda</span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">U pripremi</span>
                    <Edit3 className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.draftOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Potvrđene</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.confirmedOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupna vrednost</span>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(dashboard.totalAmount)}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusu</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.statusBreakdown.map((s) => {
                      const cfg = statusConfig[s.status]
                      return (
                        <div key={s.status} className="flex items-center justify-between">
                          <Badge variant="outline" className={cfg?.color || ''}>{cfg?.label || s.status}</Badge>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalOrders ? (s.count / dashboard.totalOrders) * 100 : 0}%` }} />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Prosečna ponuda</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{formatCurrency(dashboard.avgAmount)}</p>
                      <p className="text-sm text-muted-foreground mt-1">po ponudi</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne ponude</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema ponuda. Kreirajte prvu ponudu.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Broj</th><th className="pb-2 pr-4">Partner</th><th className="pb-2 pr-4">Iznos</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Datum</th>
                        </tr></thead>
                        <tbody>{dashboard.recentOrders.map((o) => {
                          const cfg = statusConfig[o.status]
                          return (
                            <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-2 pr-4 font-mono text-xs">{o.number}</td>
                              <td className="py-2 pr-4">{o.partnerName || '-'}</td>
                              <td className="py-2 pr-4">{formatCurrency(o.totalAmount)}</td>
                              <td className="py-2 pr-4"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge></td>
                              <td className="py-2 text-xs text-muted-foreground">{new Date(o.dateOrder).toLocaleDateString('sr-RS')}</td>
                            </tr>
                          )
                        })}</tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži ponude..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : orders.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema ponuda</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj ponudu</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Broj</th><th className="p-3">Partner</th><th className="p-3">Iznos</th><th className="p-3">Status</th><th className="p-3">Datum</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{orders.map((o) => {
                    const cfg = statusConfig[o.status]
                    return (
                      <tr key={o.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{o.number}</td>
                        <td className="p-3">{o.partnerName || '-'}</td>
                        <td className="p-3 font-medium">{formatCurrency(o.totalAmount)}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge></td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(o.dateOrder).toLocaleDateString('sr-RS')}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedOrder(o); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                              const next = o.status === 'draft' ? 'sent' : o.status === 'sent' ? 'confirmed' : o.status
                              handleUpdateStatus(o.id, next)
                            }}><ArrowRight className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova ponuda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Partner</Label>
              <Select value={form.partnerId} onValueChange={(v) => setForm({ ...form, partnerId: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite partnera" /></SelectTrigger>
                <SelectContent>{partners.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Iznos (RSD)</Label>
                <Input type="number" value={form.totalAmount || ''} onChange={(e) => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Datum ponude</Label>
                <Input type="date" value={form.dateOrder} onChange={(e) => setForm({ ...form, dateOrder: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Važi do</Label>
              <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji ponude</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Broj:</span> <span className="font-mono">{selectedOrder.number}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selectedOrder.status]?.color}>{statusConfig[selectedOrder.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Partner:</span> {selectedOrder.partnerName || '-'}</div>
                <div><span className="text-muted-foreground">Iznos:</span> <span className="font-bold">{formatCurrency(selectedOrder.totalAmount)}</span></div>
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selectedOrder.dateOrder).toLocaleDateString('sr-RS')}</div>
                {selectedOrder.validUntil && <div><span className="text-muted-foreground">Važi do:</span> {new Date(selectedOrder.validUntil).toLocaleDateString('sr-RS')}</div>}
              </div>
              {selectedOrder.notes && (
                <div className="text-sm"><span className="text-muted-foreground">Napomene:</span> {selectedOrder.notes}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
