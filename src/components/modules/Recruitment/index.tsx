'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  UserPlus, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users,
  TrendingUp, AlertCircle, Briefcase, MapPin, ArrowLeft
} from 'lucide-react'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: string
  salaryMin?: number
  salaryMax?: number
  status: string
  applicantCount: number
  description?: string
  requirements?: string
  publishedAt?: string
  createdAt: string
}

interface DashboardData {
  totalJobs: number
  openJobs: number
  closedJobs: number
  totalApplicants: number
  avgApplicantsPerJob: number
  recentJobs: JobPosting[]
  departmentBreakdown: Array<{ department: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  open: { label: 'Otvoren', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pauziran', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Zatvoren', color: 'bg-red-100 text-red-700' },
}

const typeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Ugovor',
  internship: 'Praksa',
  remote: 'Remote',
}

export function Recruitment() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<JobPosting[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<JobPosting | null>(null)

  const emptyForm = {
    title: '', department: '', location: '', type: 'full_time',
    salaryMin: 0, salaryMax: 0, description: '', requirements: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/recruitment/jobs/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/recruitment/jobs?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'jobs') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati oglas za posao?')) return
    try {
      const res = await fetch(`/api/recruitment/jobs?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regrutacija</h1>
          <p className="text-sm text-muted-foreground">Upravljanje oglasima za zapošljavanje i kandidatima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi oglas
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" /> Oglasi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno oglasa</span>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalJobs}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivni</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.openJobs}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno kandidata</span>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalApplicants}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prosek po oglasu</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.avgApplicantsPerJob}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po departmentu</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.departmentBreakdown.map((d) => (
                      <div key={d.department} className="flex items-center justify-between">
                        <span className="text-sm">{d.department || 'Nije navedeno'}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalJobs ? (d.count / dashboard.totalJobs) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{d.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika zapošljavanja</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <UserPlus className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{dashboard.closedJobs}</p>
                      <p className="text-sm text-muted-foreground mt-1">zatvorenih pozicija</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni oglasi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema oglasa. Kreirajte prvi oglas za posao.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentJobs.map((j) => {
                        const cfg = statusConfig[j.status]
                        return (
                          <div key={j.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{j.title}</div>
                              <div className="text-xs text-muted-foreground">{j.department} · {j.location} · {typeLabels[j.type] || j.type}</div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || j.status}</Badge>
                              <div className="text-xs text-muted-foreground mt-1">{j.applicantCount} kandidata</div>
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

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži oglase..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema oglasa za posao</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj oglas</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Naziv</th><th className="p-3">Department</th><th className="p-3">Tip</th><th className="p-3">Kandidati</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((j) => {
                    const cfg = statusConfig[j.status]
                    return (
                      <tr key={j.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{j.title}</td>
                        <td className="p-3">{j.department}</td>
                        <td className="p-3">{typeLabels[j.type] || j.type}</td>
                        <td className="p-3"><span className="font-medium">{j.applicantCount}</span></td>
                        <td className="p-3"><Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || j.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(j); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {j.status === 'draft' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(j.id, 'open')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            {j.status === 'open' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => handleUpdateStatus(j.id, 'paused')}><Clock className="h-3.5 w-3.5" /></Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(j.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

      {dialogOpen && (
        <Card className="max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle>Novi oglas za posao</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv pozicije</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="npr. Senior Developer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="npr. IT" />
              </div>
              <div className="space-y-2">
                <Label>Lokacija</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="npr. Beograd" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label>Plata od (RSD)</Label>
                <Input type="number" value={form.salaryMin || ''} onChange={(e) => setForm({ ...form, salaryMin: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Plata do (RSD)</Label>
                <Input type="number" value={form.salaryMax || ''} onChange={(e) => setForm({ ...form, salaryMax: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opis posla..." />
            </div>
            <div className="space-y-2">
              <Label>Zahtevi</Label>
              <Textarea rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Zahtevi za kandidate..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {detailOpen && selected && (
        <Card className="max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle>Detalji oglasa</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Naziv:</span> <span className="font-medium">{selected.title}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
              <div><span className="text-muted-foreground">Department:</span> {selected.department}</div>
              <div><span className="text-muted-foreground">Lokacija:</span> {selected.location}</div>
              <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.type] || selected.type}</div>
              <div><span className="text-muted-foreground">Kandidati:</span> <span className="font-bold">{selected.applicantCount}</span></div>
              {selected.salaryMin && <div><span className="text-muted-foreground">Plata:</span> {selected.salaryMin.toLocaleString()} - {selected.salaryMax?.toLocaleString()} RSD</div>}
            </div>
            {selected.description && (
              <div className="text-sm"><span className="text-muted-foreground">Opis:</span> {selected.description}</div>
            )}
            {selected.requirements && (
              <div className="text-sm"><span className="text-muted-foreground">Zahtevi:</span> {selected.requirements}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
