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
import { Separator } from '@/components/ui/separator'
import {
  PartyPopper, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, MapPin, CalendarDays,
  DollarSign, Ticket, TrendingUp
} from 'lucide-react'

interface Event {
  id: string
  name: string
  description?: string
  eventType: string
  startDate: string
  endDate?: string
  location?: string
  maxAttendees?: number
  registeredCount: number
  ticketPrice: number
  status: string
  createdAt: string
}

const eventTypeConfig: Record<string, { label: string; color: string }> = {
  conference: { label: 'Konferencija', color: 'bg-blue-100 text-blue-700' },
  workshop: { label: 'Radionica', color: 'bg-purple-100 text-purple-700' },
  webinar: { label: 'Webinar', color: 'bg-teal-100 text-teal-700' },
  meetup: { label: 'Okupljanje', color: 'bg-orange-100 text-orange-700' },
  training: { label: 'Obuka', color: 'bg-green-100 text-green-700' },
  social: { label: 'Druženje', color: 'bg-pink-100 text-pink-700' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  registration_open: { label: 'Registracije otvorene', color: 'bg-blue-100 text-blue-700' },
  registration_closed: { label: 'Registracije zatvorene', color: 'bg-amber-100 text-amber-700' },
  ongoing: { label: 'U toku', color: 'bg-teal-100 text-teal-700' },
  completed: { label: 'Završeno', color: 'bg-gray-200 text-gray-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

export function Događaji() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [events, setEvents] = useState<Event[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Event | null>(null)

  const emptyForm = {
    name: '', description: '', eventType: 'conference', startDate: '',
    endDate: '', location: '', maxAttendees: 50, ticketPrice: 0, status: 'draft',
  }
  const [form, setForm] = useState(emptyForm)

  const loadEvents = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/events?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadEvents() }, [activeCompanyId, loadEvents])

  const totalAttendees = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)
  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= new Date() && e.status !== 'cancelled')

  const filtered = events.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && e.eventType !== typeFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, registeredCount: 0, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadEvents() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati događaj?')) return
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadEvents()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Događaji</h1>
          <p className="text-sm text-muted-foreground">Upravljanje događajima, registracijama i kartama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadEvents}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi događaj</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="events"><PartyPopper className="h-4 w-4 mr-1" /> Događaji</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno</span><PartyPopper className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{events.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Nadolazeći</span><CalendarDays className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{upcomingEvents.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Registrovani</span><Users className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{totalAttendees}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Prihodi od karta</span><Ticket className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{events.reduce((sum, e) => sum + (e.registeredCount || 0) * (e.ticketPrice || 0), 0).toLocaleString('sr-RS')} RSD</p></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(eventTypeConfig).map(([key, cfg]) => {
                  const count = events.filter((e) => e.eventType === key).length
                  if (count === 0) return null
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Nadolazeći događaji</CardTitle></CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nema nadolazećih događaja</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {upcomingEvents.slice(0, 5).map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div><div className="text-sm font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{new Date(e.startDate).toLocaleDateString('sr-RS')}</div></div>
                        <Badge variant="outline" className="text-[10px]">{e.registeredCount}/{e.maxAttendees}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži događaje..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tip" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(eventTypeConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><PartyPopper className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema događaja</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj događaj</Button></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((e) => {
                const typeCfg = eventTypeConfig[e.eventType]
                const statCfg = statusConfig[e.status]
                const fillPercent = e.maxAttendees > 0 ? Math.min(100, (e.registeredCount / e.maxAttendees) * 100) : 0
                return (
                  <Card key={e.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{e.name}</CardTitle>
                        <div className="flex gap-1"><Badge variant="outline" className={`text-[10px] ${typeCfg?.color}`}>{typeCfg?.label}</Badge></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{new Date(e.startDate).toLocaleDateString('sr-RS')}</div>
                      {e.location && <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{e.location}</div>}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Registrovani</span>
                        <span className="font-medium">{e.registeredCount}/{e.maxAttendees || '∞'}</span>
                      </div>
                      {e.maxAttendees > 0 && <div className="w-full bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${fillPercent}%` }} /></div>}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-1"><Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge></div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(e); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
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
          <DialogHeader><DialogTitle>Novi događaj</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tip</Label><Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(eventTypeConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Lokacija</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Početak</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kraj</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Max učesnika</Label><Input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Cena karte (RSD)</Label><Input type="number" value={form.ticketPrice || ''} onChange={(e) => setForm({ ...form, ticketPrice: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji događaja</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={eventTypeConfig[selected.eventType]?.color}>{eventTypeConfig[selected.eventType]?.label}</Badge>
                <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selected.startDate).toLocaleDateString('sr-RS')}</div>
                <div><span className="text-muted-foreground">Lokacija:</span> {selected.location || '-'}</div>
                <div><span className="text-muted-foreground">Učesnici:</span> {selected.registeredCount}/{selected.maxAttendees || '∞'}</div>
                <div><span className="text-muted-foreground">Cena:</span> {selected.ticketPrice > 0 ? `${selected.ticketPrice.toLocaleString('sr-RS')} RSD` : 'Besplatno'}</div>
              </div>
              {selected.description && <p className="text-sm">{selected.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
