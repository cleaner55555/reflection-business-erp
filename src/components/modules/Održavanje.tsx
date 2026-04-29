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
  Wrench, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, DollarSign,
  TrendingUp, AlertCircle, Settings, AlertTriangle
} from 'lucide-react'

interface MaintenanceOrder {
  id: string
  orderNumber: string
  equipmentName: string
  type: string
  description: string
  priority: string
  status: string
  assignedTo?: string
  scheduledDate?: string
  completedDate?: string
  cost?: number
  notes?: string
  createdAt: string
}

interface DashboardData {
  totalOrders: number
  openOrders: number
  inProgressOrders: number
  completedOrders: number
  overdueOrders: number
  totalCost: number
  recentOrders: MaintenanceOrder[]
  typeBreakdown: Array<{ type: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvoren', color: 'bg-red-100 text-red-700' },
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-700' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700' },
}

const typeLabels: Record<string, string> = {
  preventive: 'Preventivno',
  corrective: 'Korektivno',
  emergency: 'Hitno',
  predictive: 'Prediktivno',
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

export function Održavanje() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<MaintenanceOrder[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<MaintenanceOrder | null>(null)

  const emptyForm = {
    equipmentName: '', type: 'preventive', description: '',
    priority: 'medium', assignedTo: '', scheduledDate: '',
    cost: 0, notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/maintenance/orders/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/maintenance/orders?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'orders') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/maintenance/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/maintenance/orders', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati nalog za održavanje?')) return
    try {
      const res = await fetch(`/api/maintenance/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Održavanje</h1>
          <p className="text-sm text-muted-foreground">Upravljanje nalozima za održavanje opreme i mašina</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi nalog
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="orders"><Wrench className="h-4 w-4 mr-1" /> Nalozi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Otvoreni</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.openOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">U toku</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.inProgressOrders}</p>
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
                    <span className="text-xs text-muted-foreground">Prekoračeni</span>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{dashboard.overdueOrders}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.typeBreakdown.map((tp) => (
                      <div key={tp.type} className="flex items-center justify-between">
                        <span className="text-sm">{typeLabels[tp.type] || tp.type}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalOrders ? (tp.count / dashboard.totalOrders) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{tp.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupni troškovi</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{formatCurrency(dashboard.totalCost)}</p>
                      <p className="text-sm text-muted-foreground mt-1">ukupno za održavanje</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni nalozi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema naloga. Kreirajte prvi nalog za održavanje.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentOrders.map((o) => {
                        const cfg = statusConfig[o.status]
                        const pCfg = priorityConfig[o.priority]
                        return (
                          <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{o.equipmentName}</div>
                              <div className="text-xs text-muted-foreground">{typeLabels[o.type] || o.type} · {pCfg?.label || o.priority}</div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge>
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
          ) : items.length === 0 ? (
            <Card className="p-8 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema naloga za održavanje</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj nalog</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Broj</th><th className="p-3">Oprema</th><th className="p-3">Tip</th><th className="p-3">Prioritet</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((o) => {
                    const sCfg = statusConfig[o.status]
                    const pCfg = priorityConfig[o.priority]
                    return (
                      <tr key={o.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                        <td className="p-3">{o.equipmentName}</td>
                        <td className="p-3">{typeLabels[o.type] || o.type}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${pCfg?.color || ''}`}>{pCfg?.label || o.priority}</Badge></td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${sCfg?.color || ''}`}>{sCfg?.label || o.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(o); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {o.status === 'open' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => handleUpdateStatus(o.id, 'in_progress')}><Clock className="h-3.5 w-3.5" /></Button>
                            )}
                            {o.status === 'in_progress' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(o.id, 'completed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
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
          <DialogHeader><DialogTitle>Novi nalog za održavanje</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Oprema / mašina</Label>
              <Input value={form.equipmentName} onChange={(e) => setForm({ ...form, equipmentName: e.target.value })} placeholder="Naziv opreme" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opis problema</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opišite problem ili rad potrebno održavanje" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zaduzeni</Label>
                <Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Ime tehničara" />
              </div>
              <div className="space-y-2">
                <Label>Zakazano za</Label>
                <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Procenjeni trošak (RSD)</Label>
              <Input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
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
          <DialogHeader><DialogTitle>Detalji naloga</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Broj:</span> <span className="font-mono">{selected.orderNumber}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Oprema:</span> {selected.equipmentName}</div>
                <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.type] || selected.type}</div>
                <div><span className="text-muted-foreground">Prioritet:</span> <Badge variant="outline" className={priorityConfig[selected.priority]?.color}>{priorityConfig[selected.priority]?.label}</Badge></div>
                {selected.assignedTo && <div><span className="text-muted-foreground">Zaduzeni:</span> {selected.assignedTo}</div>}
                {selected.scheduledDate && <div><span className="text-muted-foreground">Zakazano:</span> {new Date(selected.scheduledDate).toLocaleDateString('sr-RS')}</div>}
                {selected.completedDate && <div><span className="text-muted-foreground">Završeno:</span> {new Date(selected.completedDate).toLocaleDateString('sr-RS')}</div>}
                {selected.cost && <div><span className="text-muted-foreground">Trošak:</span> <span className="font-bold">{formatCurrency(selected.cost)}</span></div>}
              </div>
              {selected.description && (
                <div className="text-sm"><span className="text-muted-foreground">Opis:</span> {selected.description}</div>
              )}
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
