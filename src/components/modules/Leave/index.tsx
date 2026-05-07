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
  CalendarOff, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users,
  TrendingUp, AlertCircle, CalendarDays, XCircle
} from 'lucide-react'

interface LeaveRequest {
  id: string
  employeeName: string
  type: string
  startDate: string
  endDate: string
  daysCount: number
  status: string
  reason?: string
  approvedBy?: string
  createdAt: string
}

interface DashboardData {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  currentMonthAbsences: number
  recentRequests: LeaveRequest[]
  typeBreakdown: Array<{ type: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-700' },
}

const typeLabels: Record<string, string> = {
  vacation: 'Godišnji odmor',
  sick: 'Bolovanje',
  personal: 'Slobodan dan',
  maternity: 'Porodiljsko',
  unpaid: 'Neplaćeni',
  education: 'Edukacija',
}

export function Odsustva() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<LeaveRequest[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<LeaveRequest | null>(null)

  const emptyForm = {
    employeeName: '', type: 'vacation',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', reason: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/leave-requests/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/leave-requests?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'requests') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zahtev za odsustvo?')) return
    try {
      const res = await fetch(`/api/leave-requests?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Odsustva</h1>
          <p className="text-sm text-muted-foreground">Upravljanje zahtevima za odsustvo i godišnjim odmorom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi zahtev
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="requests"><CalendarOff className="h-4 w-4 mr-1" /> Zahtevi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Na čekanju</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.pendingRequests}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odobreno</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.approvedRequests}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odbijeno</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.rejectedRequests}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odsustva ovog meseca</span>
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.currentMonthAbsences}</p>
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
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalRequests ? (tp.count / dashboard.totalRequests) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{tp.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno zahteva</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <CalendarOff className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{dashboard.totalRequests}</p>
                      <p className="text-sm text-muted-foreground mt-1">ukupno</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni zahtevi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema zahteva. Kreirajte prvi zahtev za odsustvo.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentRequests.map((r) => {
                        const cfg = statusConfig[r.status]
                        return (
                          <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{r.employeeName}</div>
                              <div className="text-xs text-muted-foreground">{typeLabels[r.type] || r.type} · {r.daysCount} dana · {new Date(r.startDate).toLocaleDateString('sr-RS')}</div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge>
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

        <TabsContent value="requests" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <CalendarOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema zahteva za odsustvo</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj zahtev</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Zaposleni</th><th className="p-3">Tip</th><th className="p-3">Period</th><th className="p-3">Dani</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((r) => {
                    const cfg = statusConfig[r.status]
                    return (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.employeeName}</td>
                        <td className="p-3">{typeLabels[r.type] || r.type}</td>
                        <td className="p-3 text-xs">{new Date(r.startDate).toLocaleDateString('sr-RS')} - {new Date(r.endDate).toLocaleDateString('sr-RS')}</td>
                        <td className="p-3">{r.daysCount}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(r); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {r.status === 'pending' && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(r.id, 'approved')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => handleUpdateStatus(r.id, 'rejected')}><XCircle className="h-3.5 w-3.5" /></Button>
                              </>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Novi zahtev za odsustvo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zaposleni</Label>
              <Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="Ime i prezime zaposlenog" />
            </div>
            <div className="space-y-2">
              <Label>Tip odsustva</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum početka</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Datum završetka</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Razlog</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Razlog odsustva..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Podnesi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji zahteva</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Zaposleni:</span> <span className="font-medium">{selected.employeeName}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.type] || selected.type}</div>
                <div><span className="text-muted-foreground">Dani:</span> <span className="font-bold">{selected.daysCount}</span></div>
                <div><span className="text-muted-foreground">Od:</span> {new Date(selected.startDate).toLocaleDateString('sr-RS')}</div>
                <div><span className="text-muted-foreground">Do:</span> {new Date(selected.endDate).toLocaleDateString('sr-RS')}</div>
                {selected.approvedBy && <div><span className="text-muted-foreground">Odobrio:</span> {selected.approvedBy}</div>}
              </div>
              {selected.reason && (
                <div className="text-sm"><span className="text-muted-foreground">Razlog:</span> {selected.reason}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
