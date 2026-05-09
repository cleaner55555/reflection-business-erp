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
  Headphones, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users,
  TrendingUp, AlertCircle, MessageSquare, AlertTriangle
} from 'lucide-react'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description?: string
  customerName: string
  category: string
  priority: string
  status: string
  assignedTo?: string
  resolvedAt?: string
  createdAt: string
}

interface DashboardData {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  avgResolutionHours: number
  recentTickets: Ticket[]
  categoryBreakdown: Array<{ category: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvoren', color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  waiting: { label: 'Čeka odgovor', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Rešeno', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvoreno', color: 'bg-gray-100 text-gray-700' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700' },
}

const categoryLabels: Record<string, string> = {
  technical: 'Tehnički',
  billing: 'Naplata',
  general: 'Opšte',
  feature: 'Funkcionalnost',
  bug: 'Greška',
}

export function Support() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Ticket[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Ticket | null>(null)

  const emptyForm = {
    subject: '', description: '', customerName: '',
    category: 'general', priority: 'medium', assignedTo: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/helpdesk/tickets/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/helpdesk/tickets?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'tickets') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/helpdesk/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/helpdesk/tickets', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati tiket?')) return
    try {
      const res = await fetch(`/api/helpdesk/tickets?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Podrška</h1>
          <p className="text-sm text-muted-foreground">Upravljanje tiketima i korisničkom podrškom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi tiket
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="tickets"><Headphones className="h-4 w-4 mr-1" /> Tiketi</TabsTrigger>
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
                  <p className="text-2xl font-bold text-red-600">{dashboard.openTickets}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">U toku</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.inProgressTickets}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Rešeni</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.resolvedTickets}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prosečno rešenje</span>
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.avgResolutionHours}h</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategoriji</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.categoryBreakdown.map((c) => (
                      <div key={c.category} className="flex items-center justify-between">
                        <span className="text-sm">{categoryLabels[c.category] || c.category}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalTickets ? (c.count / dashboard.totalTickets) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{c.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Headphones className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{dashboard.totalTickets}</p>
                      <p className="text-sm text-muted-foreground mt-1">ukupno tiketa</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni tiketi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentTickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema tiketa. Kreirajte prvi tiket.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentTickets.map((tk) => {
                        const cfg = statusConfig[tk.status]
                        const pCfg = priorityConfig[tk.priority]
                        return (
                          <div key={tk.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{tk.subject}</div>
                              <div className="text-xs text-muted-foreground">{tk.customerName} · {categoryLabels[tk.category] || tk.category}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] ${pCfg?.color || ''}`}>{pCfg?.label || tk.priority}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || tk.status}</Badge>
                            </div>
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

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži tikete..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <Headphones className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema tiketa</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj tiket</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Broj</th><th className="p-3">Naslov</th><th className="p-3">Klijent</th><th className="p-3">Prioritet</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((tk) => {
                    const sCfg = statusConfig[tk.status]
                    const pCfg = priorityConfig[tk.priority]
                    return (
                      <tr key={tk.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{tk.ticketNumber}</td>
                        <td className="p-3 font-medium">{tk.subject}</td>
                        <td className="p-3">{tk.customerName}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${pCfg?.color || ''}`}>{pCfg?.label || tk.priority}</Badge></td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${sCfg?.color || ''}`}>{sCfg?.label || tk.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(tk); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {tk.status === 'open' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => handleUpdateStatus(tk.id, 'in_progress')}><Clock className="h-3.5 w-3.5" /></Button>
                            )}
                            {tk.status === 'in_progress' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(tk.id, 'resolved')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(tk.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Novi tiket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Kratak opis problema" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Klijent</Label>
                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Ime klijenta" />
              </div>
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zaduzeni</Label>
                <Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Ime agenta" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detaljan opis problema..." />
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
          <DialogHeader><DialogTitle>Detalji tiketa</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Broj:</span> <span className="font-mono">{selected.ticketNumber}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Klijent:</span> {selected.customerName}</div>
                <div><span className="text-muted-foreground">Kategorija:</span> {categoryLabels[selected.category] || selected.category}</div>
                <div><span className="text-muted-foreground">Prioritet:</span> <Badge variant="outline" className={priorityConfig[selected.priority]?.color}>{priorityConfig[selected.priority]?.label}</Badge></div>
                {selected.assignedTo && <div><span className="text-muted-foreground">Zaduzeni:</span> {selected.assignedTo}</div>}
                <div><span className="text-muted-foreground">Kreiran:</span> {new Date(selected.createdAt).toLocaleDateString('sr-RS')}</div>
                {selected.resolvedAt && <div><span className="text-muted-foreground">Rešen:</span> {new Date(selected.resolvedAt).toLocaleDateString('sr-RS')}</div>}
              </div>
              {selected.description && (
                <div className="text-sm"><span className="text-muted-foreground">Opis:</span> {selected.description}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
