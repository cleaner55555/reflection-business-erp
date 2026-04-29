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
  CalendarCheck, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users,
  TrendingUp, AlertCircle, CalendarDays, XCircle
} from 'lucide-react'

interface Appointment {
  id: string
  title: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  date: string
  time: string
  duration: number
  type: string
  status: string
  assignedTo?: string
  notes?: string
  createdAt: string
}

interface DashboardData {
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  recentAppointments: Appointment[]
  typeBreakdown: Array<{ type: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Potvrđeno', color: 'bg-green-100 text-green-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'Nije se pojavio', color: 'bg-gray-100 text-gray-700' },
}

const typeLabels: Record<string, string> = {
  consultation: 'Konsultacija',
  followup: 'Kontrola',
  initial: 'Prvi pregled',
  emergency: 'Hitno',
  online: 'Online',
}

export function Zakazivanja() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Appointment[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)

  const emptyForm = {
    title: '', clientName: '', clientPhone: '', clientEmail: '',
    date: new Date().toISOString().split('T')[0], time: '09:00',
    duration: 30, type: 'consultation', assignedTo: '', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/appointments/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/appointments?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'appointments') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zakazivanje?')) return
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zakazivanja</h1>
          <p className="text-sm text-muted-foreground">Upravljanje zakazivanjima i terminima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi termin
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="appointments"><CalendarCheck className="h-4 w-4 mr-1" /> Termini</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Danas</span>
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.todayAppointments}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Nadolazeći</span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{dashboard.upcomingAppointments}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Završeni</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.completedAppointments}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Otkazani</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.cancelledAppointments}</p>
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
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalAppointments ? (tp.count / dashboard.totalAppointments) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{tp.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno zakazivanja</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <CalendarCheck className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{dashboard.totalAppointments}</p>
                      <p className="text-sm text-muted-foreground mt-1">ukupno</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavna zakazivanja</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema zakazivanja. Kreirajte prvi termin.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentAppointments.map((a) => {
                        const cfg = statusConfig[a.status]
                        return (
                          <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{a.title}</div>
                              <div className="text-xs text-muted-foreground">{a.clientName} · {a.time} · {a.duration} min</div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || a.status}</Badge>
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

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži zakazivanja..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema zakazivanja</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj termin</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Naslov</th><th className="p-3">Klijent</th><th className="p-3">Datum</th><th className="p-3">Vreme</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((a) => {
                    const cfg = statusConfig[a.status]
                    return (
                      <tr key={a.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{a.title}</td>
                        <td className="p-3">{a.clientName}</td>
                        <td className="p-3 text-xs">{new Date(a.date).toLocaleDateString('sr-RS')}</td>
                        <td className="p-3 text-xs">{a.time} ({a.duration} min)</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || a.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(a); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {a.status === 'scheduled' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(a.id, 'confirmed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            {a.status === 'confirmed' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => handleUpdateStatus(a.id, 'in_progress')}><Clock className="h-3.5 w-3.5" /></Button>
                            )}
                            {a.status === 'in_progress' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(a.id, 'completed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Novi termin</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Naslov termina" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Klijent</Label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Ime klijenta" />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} placeholder="Broj telefona" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Vreme</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Trajanje (min)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })} />
              </div>
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
                <Label>Zaduzeni</Label>
                <Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Ime osobe" />
              </div>
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
          <DialogHeader><DialogTitle>Detalji termina</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Naslov:</span> <span className="font-medium">{selected.title}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Klijent:</span> {selected.clientName}</div>
                <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.type] || selected.type}</div>
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selected.date).toLocaleDateString('sr-RS')}</div>
                <div><span className="text-muted-foreground">Vreme:</span> {selected.time} ({selected.duration} min)</div>
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
