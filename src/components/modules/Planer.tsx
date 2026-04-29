/* eslint-disable react-hooks/set-state-in-effect */
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
  CalendarRange, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, AlertCircle, X
} from 'lucide-react'

interface PlanningSlot {
  id: string
  employeeId?: string
  employeeName?: string
  projectId?: string
  projectName?: string
  date: string
  startTime: string
  endTime: string
  hours: number
  task?: string
  status: string
  notes?: string
}

interface DashboardData {
  totalSlots: number
  todaySlots: number
  busyEmployees: number
  totalHours: number
  recentSlots: PlanningSlot[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-700' },
}

export function Planer() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [slots, setSlots] = useState<PlanningSlot[]>([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<PlanningSlot | null>(null)
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])

  const emptyForm = {
    employeeId: '', projectId: '', date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '17:00', task: '', notes: '', status: 'planned',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      const res = await fetch(`/api/planning/slots?${params}`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setSlots(items)
        const today = new Date().toISOString().split('T')[0]
        const todaySlots = items.filter((s: PlanningSlot) => s.date === today)
        const uniqueEmps = new Set(items.filter((s: PlanningSlot) => s.status !== 'cancelled').map((s: PlanningSlot) => s.employeeId))
        setDashboard({
          totalSlots: items.length,
          todaySlots: todaySlots.length,
          busyEmployees: uniqueEmps.size,
          totalHours: items.reduce((sum: number, s: PlanningSlot) => sum + (s.hours || 0), 0),
          recentSlots: items.slice(0, 5),
        })
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadEmployees = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/employees?companyId=${activeCompanyId}&limit=100&isActive=true`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setEmployees(items.map((e: Record<string, string>) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })))
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadProjects = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/projects?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setProjects(items.map((p: Record<string, string>) => ({ id: p.id, name: p.name })))
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => {
    loadDashboard()
    loadEmployees()
    loadProjects()
  }, [activeCompanyId, loadDashboard, loadEmployees, loadProjects])

  useEffect(() => {
    if (activeTab === 'slots') setLoading(true)
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [activeTab, search, dateFilter, statusFilter])

  const filteredSlots = slots.filter((s) => {
    if (search && !s.employeeName?.toLowerCase().includes(search.toLowerCase()) && !s.task?.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFilter && s.date !== dateFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    const startTime = form.startTime || '09:00'
    const endTime = form.endTime || '17:00'
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const hours = Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)

    try {
      const res = await fetch('/api/planning/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, hours }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/planning/slots?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) loadDashboard()
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati planirani termin?')) return
    try {
      const res = await fetch(`/api/planning/slots?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadDashboard()
    } catch { /* silent */ }
  }

  // Weekly view data
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + i + 1)
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planer</h1>
          <p className="text-sm text-muted-foreground">Planiranje i raspoređivanje resursa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboard}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi termin
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="slots"><CalendarRange className="h-4 w-4 mr-1" /> Termini</TabsTrigger>
          <TabsTrigger value="weekly"><CalendarRange className="h-4 w-4 mr-1" /> Tjedni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno termina</span>
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalSlots}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Danas</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.todaySlots}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Angažovani</span>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{dashboard.busyEmployees}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno sati</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.totalHours.toFixed(1)}h</p>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni termini</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema planiranih termina</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentSlots.map((s) => {
                        const cfg = statusConfig[s.status]
                        return (
                          <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{s.employeeName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{s.task || s.projectName || '-'} · {s.startTime}-{s.endTime} ({s.hours}h)</div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || s.status}</Badge>
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

        <TabsContent value="slots" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži termine..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Input type="date" className="w-[160px]" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredSlots.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarRange className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema planiranih termina</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj termin</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Zaposleni</th><th className="p-3">Datum</th><th className="p-3">Vreme</th><th className="p-3">Zadatak</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{filteredSlots.map((s) => {
                    const cfg = statusConfig[s.status]
                    return (
                      <tr key={s.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{s.employeeName || '-'}</td>
                        <td className="p-3 text-xs">{new Date(s.date).toLocaleDateString('sr-RS')}</td>
                        <td className="p-3 text-xs">{s.startTime}-{s.endTime}</td>
                        <td className="p-3 text-xs">{s.task || s.projectName || '-'}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || s.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(s); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {s.status === 'planned' && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateStatus(s.id, 'in_progress')}><Edit3 className="h-3.5 w-3.5" /></Button>}
                            {s.status === 'in_progress' && <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(s.id, 'completed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Tjedni pregled</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const daySlots = slots.filter((s) => s.date === date && s.status !== 'cancelled')
                  const dayName = new Date(date).toLocaleDateString('sr-RS', { weekday: 'short', day: 'numeric' })
                  const isToday = date === new Date().toISOString().split('T')[0]
                  return (
                    <div key={date} className={`rounded-lg border p-2 ${isToday ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="text-xs font-medium text-center mb-2">{dayName}</div>
                      <div className="text-lg font-bold text-center mb-2">{daySlots.length}</div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {daySlots.slice(0, 5).map((s) => (
                          <div key={s.id} className="text-[10px] p-1 bg-muted/50 rounded truncate">
                            {s.startTime} {s.employeeName?.split(' ')[0]}
                          </div>
                        ))}
                        {daySlots.length > 5 && <div className="text-[10px] text-center text-muted-foreground">+{daySlots.length - 5}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novi planirani termin</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zaposleni</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite zaposlenog" /></SelectTrigger>
                <SelectContent>{employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Projekat</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite projekat" /></SelectTrigger>
                <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Datum</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Početak</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kraj</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Zadatak</Label><Input value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} placeholder="Opis zadatka" /></div>
            <div className="space-y-2"><Label>Napomene</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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
                <div><span className="text-muted-foreground">Zaposleni:</span> <span className="font-medium">{selected.employeeName || '-'}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selected.date).toLocaleDateString('sr-RS')}</div>
                <div><span className="text-muted-foreground">Vreme:</span> {selected.startTime} - {selected.endTime} ({selected.hours}h)</div>
                <div><span className="text-muted-foreground">Projekat:</span> {selected.projectName || '-'}</div>
              </div>
              {selected.task && <div className="text-sm"><span className="text-muted-foreground">Zadatak:</span> {selected.task}</div>}
              {selected.notes && <div className="text-sm"><span className="text-muted-foreground">Napomene:</span> {selected.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
