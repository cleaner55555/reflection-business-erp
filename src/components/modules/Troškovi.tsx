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
  Receipt, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, DollarSign,
  TrendingDown, AlertCircle, FileText, CalendarDays
} from 'lucide-react'

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  dueDate?: string
  vendor?: string
  projectId?: string
  projectName?: string
  status: string
  notes?: string
  createdAt: string
}

interface DashboardData {
  totalExpenses: number
  pendingExpenses: number
  approvedExpenses: number
  rejectedExpenses: number
  totalAmount: number
  monthlyAverage: number
  recentExpenses: Expense[]
  categoryBreakdown: Array<{ category: string; count: number; total: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  paid: { label: 'Plaćeno', color: 'bg-blue-100 text-blue-700' },
}

const categoryLabels: Record<string, string> = {
  office: 'Kancelarija',
  travel: 'Putovanja',
  equipment: 'Oprema',
  utilities: 'Komunalije',
  marketing: 'Marketing',
  salary: 'Plate',
  other: 'Ostalo',
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

export function Troškovi() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Expense[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Expense | null>(null)

  const emptyForm = {
    description: '', category: 'office', amount: 0,
    date: new Date().toISOString().split('T')[0], dueDate: '',
    vendor: '', notes: '', status: 'pending',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/expenses/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) setDashboard(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filter !== 'all') params.set('status', filter)
      if (catFilter !== 'all') params.set('category', catFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/expenses?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, catFilter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'expenses') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) loadItems()
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati trošak?')) return
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Troškovi</h1>
          <p className="text-sm text-muted-foreground">Praćenje i upravljanje poslovnim troškovima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi trošak
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="expenses"><Receipt className="h-4 w-4 mr-1" /> Troškovi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno troškova</span>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalExpenses}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Na čekanju</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.pendingExpenses}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odobreno</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.approvedExpenses}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupan iznos</span>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(dashboard.totalAmount)}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.categoryBreakdown.map((c) => (
                      <div key={c.category} className="flex items-center justify-between">
                        <span className="text-sm">{categoryLabels[c.category] || c.category}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalExpenses ? (c.count / dashboard.totalExpenses) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-20 text-right">{formatCurrency(c.total)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Prosečni mesečni trošak</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <TrendingDown className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{formatCurrency(dashboard.monthlyAverage)}</p>
                      <p className="text-sm text-muted-foreground mt-1">po mesecu</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni troškovi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema troškova. Kreirajte prvi trošak.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Opis</th><th className="pb-2 pr-4">Kategorija</th><th className="pb-2 pr-4">Iznos</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Datum</th>
                        </tr></thead>
                        <tbody>{dashboard.recentExpenses.map((e) => {
                          const cfg = statusConfig[e.status]
                          return (
                            <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-2 pr-4">{e.description}</td>
                              <td className="py-2 pr-4">{categoryLabels[e.category] || e.category}</td>
                              <td className="py-2 pr-4">{formatCurrency(e.amount)}</td>
                              <td className="py-2 pr-4"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || e.status}</Badge></td>
                              <td className="py-2 text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString('sr-RS')}</td>
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

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži troškove..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sve kategorije" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <Card className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema troškova</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj trošak</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Opis</th><th className="p-3">Kategorija</th><th className="p-3">Iznos</th><th className="p-3">Status</th><th className="p-3">Datum</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((e) => {
                    const cfg = statusConfig[e.status]
                    return (
                      <tr key={e.id} className="border-t hover:bg-muted/30">
                        <td className="p-3">{e.description}</td>
                        <td className="p-3">{categoryLabels[e.category] || e.category}</td>
                        <td className="p-3 font-medium">{formatCurrency(e.amount)}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || e.status}</Badge></td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString('sr-RS')}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(e); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {e.status === 'pending' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(e.id, 'approved')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Novi trošak</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opis troška" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Iznos (RSD)</Label>
                <Input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Rok plaćanja</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dobavljač</Label>
              <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Naziv dobavljača" />
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
          <DialogHeader><DialogTitle>Detalji troška</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Opis:</span> <span className="font-medium">{selected.description}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Kategorija:</span> {categoryLabels[selected.category] || selected.category}</div>
                <div><span className="text-muted-foreground">Iznos:</span> <span className="font-bold">{formatCurrency(selected.amount)}</span></div>
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selected.date).toLocaleDateString('sr-RS')}</div>
                {selected.dueDate && <div><span className="text-muted-foreground">Rok plaćanja:</span> {new Date(selected.dueDate).toLocaleDateString('sr-RS')}</div>}
                {selected.vendor && <div><span className="text-muted-foreground">Dobavljač:</span> {selected.vendor}</div>}
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
