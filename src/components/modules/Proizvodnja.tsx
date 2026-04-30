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
  Factory, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, DollarSign,
  TrendingUp, AlertCircle, Package, ListChecks
} from 'lucide-react'

interface ManufactureOrder {
  id: string
  orderNumber: string
  productName: string
  quantity: number
  unit: string
  status: string
  priority: string
  startDate: string
  dueDate?: string
  assignedTo?: string
  notes?: string
  createdAt: string
}

interface BomItem {
  id: string
  productId: string
  productName: string
  componentId: string
  componentName: string
  quantity: number
  unit: string
}

interface DashboardData {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  delayedOrders: number
  totalQuantity: number
  recentOrders: ManufactureOrder[]
  statusBreakdown: Array<{ status: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normalan', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Hitno', color: 'bg-red-100 text-red-700' },
}

export function Proizvodnja() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [orders, setOrders] = useState<ManufactureOrder[]>([])
  const [bomItems, setBomItems] = useState<BomItem[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [bomDialogOpen, setBomDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<ManufactureOrder | null>(null)

  const emptyOrderForm = {
    productName: '', quantity: 1, unit: 'kom', priority: 'normal',
    startDate: new Date().toISOString().split('T')[0], dueDate: '',
    assignedTo: '', notes: '',
  }
  const [orderForm, setOrderForm] = useState(emptyOrderForm)

  const emptyBomForm = { productId: '', productName: '', componentId: '', componentName: '', quantity: 1, unit: 'kom' }
  const [bomForm, setBomForm] = useState(emptyBomForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/manufacturing/orders/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/manufacturing/orders?${params}`)
      if (res.ok) setOrders(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  const loadBom = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/manufacturing/bom?companyId=${activeCompanyId}`)
      if (res.ok) setBomItems(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => {
    if (activeTab === 'orders') loadOrders()
    if (activeTab === 'bom') loadBom()
  }, [activeTab, loadOrders, loadBom])

  const handleCreateOrder = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/manufacturing/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...orderForm }),
      })
      if (res.ok) { setOrderDialogOpen(false); setOrderForm(emptyOrderForm); loadOrders(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/manufacturing/orders', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadOrders(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Obrisati nalog za proizvodnju?')) return
    try {
      const res = await fetch(`/api/manufacturing/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadOrders(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleCreateBom = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/manufacturing/bom', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...bomForm }),
      })
      if (res.ok) { setBomDialogOpen(false); setBomForm(emptyBomForm); loadBom() }
    } catch { /* silent */ }
  }

  const handleDeleteBom = async (id: string) => {
    if (!confirm('Obrisati stavku sastava?')) return
    try {
      const res = await fetch(`/api/manufacturing/bom?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadBom()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proizvodnja</h1>
          <p className="text-sm text-muted-foreground">Upravljanje proizvodnim nalozima i sastavom proizvoda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadOrders(); loadBom() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          {activeTab === 'orders' && (
            <Button size="sm" onClick={() => setOrderDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Novi nalog
            </Button>
          )}
          {activeTab === 'bom' && (
            <Button size="sm" onClick={() => setBomDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova stavka
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="orders"><Factory className="h-4 w-4 mr-1" /> Nalozi</TabsTrigger>
          <TabsTrigger value="bom"><ListChecks className="h-4 w-4 mr-1" /> Sastav (BOM)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno naloga</span>
                    <Factory className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivni</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.activeOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Završeni</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.completedOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Kasni</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.delayedOrders}</p>
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
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupna količina</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{dashboard.totalQuantity}</p>
                      <p className="text-sm text-muted-foreground mt-1">jedinica ukupno</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni nalozi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema naloga. Kreirajte prvi proizvodni nalog.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Broj</th><th className="pb-2 pr-4">Proizvod</th><th className="pb-2 pr-4">Količina</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Rok</th>
                        </tr></thead>
                        <tbody>{dashboard.recentOrders.map((o) => {
                          const cfg = statusConfig[o.status]
                          return (
                            <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-2 pr-4 font-mono text-xs">{o.orderNumber}</td>
                              <td className="py-2 pr-4">{o.productName}</td>
                              <td className="py-2 pr-4">{o.quantity} {o.unit}</td>
                              <td className="py-2 pr-4"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge></td>
                              <td className="py-2 text-xs text-muted-foreground">{o.dueDate ? new Date(o.dueDate).toLocaleDateString('sr-RS') : '-'}</td>
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
              <Input placeholder="Pretraži naloge..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <Factory className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema proizvodnih naloga</p>
              <Button variant="outline" className="mt-3" onClick={() => setOrderDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj nalog</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Broj</th><th className="p-3">Proizvod</th><th className="p-3">Količina</th><th className="p-3">Prioritet</th><th className="p-3">Status</th><th className="p-3">Rok</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{orders.map((o) => {
                    const sCfg = statusConfig[o.status]
                    const pCfg = priorityLabels[o.priority]
                    return (
                      <tr key={o.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                        <td className="p-3">{o.productName}</td>
                        <td className="p-3">{o.quantity} {o.unit}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${pCfg?.color || ''}`}>{pCfg?.label || o.priority}</Badge></td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${sCfg?.color || ''}`}>{sCfg?.label || o.status}</Badge></td>
                        <td className="p-3 text-xs text-muted-foreground">{o.dueDate ? new Date(o.dueDate).toLocaleDateString('sr-RS') : '-'}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(o); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {o.status === 'planned' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateOrderStatus(o.id, 'in_progress')}><Clock className="h-3.5 w-3.5" /></Button>
                            )}
                            {o.status === 'in_progress' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateOrderStatus(o.id, 'completed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteOrder(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

        <TabsContent value="bom" className="space-y-4">
          {bomItems.length === 0 ? (
            <Card className="p-8 text-center">
              <ListChecks className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema stavki sastava</p>
              <Button variant="outline" className="mt-3" onClick={() => setBomDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Dodaj stavku</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Proizvod</th><th className="p-3">Komponenta</th><th className="p-3">Količina</th><th className="p-3">Jedinica</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{bomItems.map((b) => (
                    <tr key={b.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">{b.productName}</td>
                      <td className="p-3">{b.componentName}</td>
                      <td className="p-3">{b.quantity}</td>
                      <td className="p-3">{b.unit}</td>
                      <td className="p-3">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteBom(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novi proizvodni nalog</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv proizvoda</Label>
              <Input value={orderForm.productName} onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })} placeholder="Naziv proizvoda" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Količina</Label>
                <Input type="number" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Jedinica</Label>
                <Select value={orderForm.unit} onValueChange={(v) => setOrderForm({ ...orderForm, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="kom">kom</SelectItem><SelectItem value="kg">kg</SelectItem><SelectItem value="m">m</SelectItem><SelectItem value="l">l</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select value={orderForm.priority} onValueChange={(v) => setOrderForm({ ...orderForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum početka</Label>
                <Input type="date" value={orderForm.startDate} onChange={(e) => setOrderForm({ ...orderForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Rok završetka</Label>
                <Input type="date" value={orderForm.dueDate} onChange={(e) => setOrderForm({ ...orderForm, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zaduzeni</Label>
              <Input value={orderForm.assignedTo} onChange={(e) => setOrderForm({ ...orderForm, assignedTo: e.target.value })} placeholder="Ime radnika" />
            </div>
            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateOrder}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bomDialogOpen} onOpenChange={setBomDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova stavka sastava</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proizvod</Label>
                <Input value={bomForm.productName} onChange={(e) => setBomForm({ ...bomForm, productName: e.target.value })} placeholder="Naziv proizvoda" />
              </div>
              <div className="space-y-2">
                <Label>Komponenta</Label>
                <Input value={bomForm.componentName} onChange={(e) => setBomForm({ ...bomForm, componentName: e.target.value })} placeholder="Naziv komponente" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Količina</Label>
                <Input type="number" value={bomForm.quantity} onChange={(e) => setBomForm({ ...bomForm, quantity: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Jedinica</Label>
                <Select value={bomForm.unit} onValueChange={(v) => setBomForm({ ...bomForm, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="kom">kom</SelectItem><SelectItem value="kg">kg</SelectItem><SelectItem value="m">m</SelectItem><SelectItem value="l">l</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBomDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateBom}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji naloga</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Broj:</span> <span className="font-mono">{selected.orderNumber}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Proizvod:</span> {selected.productName}</div>
                <div><span className="text-muted-foreground">Količina:</span> {selected.quantity} {selected.unit}</div>
                <div><span className="text-muted-foreground">Prioritet:</span> <Badge variant="outline" className={priorityLabels[selected.priority]?.color}>{priorityLabels[selected.priority]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Početak:</span> {new Date(selected.startDate).toLocaleDateString('sr-RS')}</div>
                {selected.dueDate && <div><span className="text-muted-foreground">Rok:</span> {new Date(selected.dueDate).toLocaleDateString('sr-RS')}</div>}
                {selected.assignedTo && <div><span className="text-muted-foreground">Zaduzeni:</span> {selected.assignedTo}</div>}
              </div>
              {selected.notes && (
                <div className="text-sm"><span className="text-muted-foreground">Napomene:</span> {selected.notes}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
