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
  PenTool, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, FileSignature,
  TrendingUp, AlertCircle, Users, ArrowRight, ArrowLeft
} from 'lucide-react'

interface SigningRequest {
  id: string
  title: string
  documentType: string
  requesterId?: string
  requesterName?: string
  signerName: string
  status: string
  priority: string
  createdAt: string
  signedAt?: string
  notes?: string
}

interface DashboardData {
  totalRequests: number
  pendingRequests: number
  signedRequests: number
  rejectedRequests: number
  recentRequests: SigningRequest[]
  typeBreakdown: Array<{ documentType: string; count: number }>
  priorityBreakdown: Array<{ priority: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  signed: { label: 'Potpisano', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Isteklo', color: 'bg-gray-100 text-gray-700' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-red-100 text-red-700' },
}

const typeLabels: Record<string, string> = {
  contract: 'Ugovor',
  nda: 'NDA',
  invoice: 'Faktura',
  proposal: 'Predlog',
  policy: 'Pravilnik',
  other: 'Ostalo',
}

export function Signatures() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<SigningRequest[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<SigningRequest | null>(null)

  const emptyForm = {
    title: '', documentType: 'contract', signerName: '',
    priority: 'medium', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/signing-requests/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/signing-requests?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'requests') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/signing-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/signing-requests', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zahtev za potpis?')) return
    try {
      const res = await fetch(`/api/signing-requests?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Potpisi</h1>
          <p className="text-sm text-muted-foreground">Upravljanje zahtevima za potpisivanje dokumenata</p>
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
          <TabsTrigger value="requests"><FileSignature className="h-4 w-4 mr-1" /> Zahtevi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno zahteva</span>
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalRequests}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Na čekanju</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.pendingRequests}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Potpisano</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.signedRequests}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odbijeno</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.rejectedRequests}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu dokumenta</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.typeBreakdown.map((tp) => (
                      <div key={tp.documentType} className="flex items-center justify-between">
                        <span className="text-sm">{typeLabels[tp.documentType] || tp.documentType}</span>
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
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po prioritetu</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.priorityBreakdown.map((pr) => {
                      const cfg = priorityConfig[pr.priority]
                      return (
                        <div key={pr.priority} className="flex items-center justify-between">
                          <Badge variant="outline" className={cfg?.color || ''}>{cfg?.label || pr.priority}</Badge>
                          <span className="text-sm font-medium">{pr.count}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni zahtevi</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema zahteva. Kreirajte prvi zahtev za potpis.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentRequests.map((r) => {
                        const cfg = statusConfig[r.status]
                        return (
                          <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{r.title}</div>
                              <div className="text-xs text-muted-foreground">{typeLabels[r.documentType] || r.documentType} · {r.signerName}</div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge>
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
              <PenTool className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema zahteva za potpis</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj zahtev</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Naslov</th><th className="p-3">Tip</th><th className="p-3">Potpisnik</th><th className="p-3">Prioritet</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((r) => {
                    const sCfg = statusConfig[r.status]
                    const pCfg = priorityConfig[r.priority]
                    return (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.title}</td>
                        <td className="p-3">{typeLabels[r.documentType] || r.documentType}</td>
                        <td className="p-3">{r.signerName}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-xs ${pCfg?.color || ''}`}>{pCfg?.label || r.priority}</Badge></td>
                        <td className="p-3"><Badge variant="outline" className={`text-xs ${sCfg?.color || ''}`}>{sCfg?.label || r.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(r); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {r.status === 'pending' && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(r.id, 'signed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => handleUpdateStatus(r.id, 'rejected')}><AlertCircle className="h-3.5 w-3.5" /></Button>
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

      {/* CREATE FORM */}
      {dialogOpen && (
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle>Novi zahtev za potpis</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov dokumenta</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Naslov dokumenta" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip dokumenta</Label>
                <Select value={form.documentType} onValueChange={(v) => setForm({ ...form, documentType: v })}>
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
              <Label>Potpisnik</Label>
              <Input value={form.signerName} onChange={(e) => setForm({ ...form, signerName: e.target.value })} placeholder="Ime i prezime potpisnika" />
            </div>
            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* DETAIL VIEW */}
      {detailOpen && (
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle>Detalji zahteva</CardTitle>
          </CardHeader>
          <CardContent>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Naslov:</span> <span className="font-medium">{selected.title}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.documentType] || selected.documentType}</div>
                <div><span className="text-muted-foreground">Prioritet:</span> <Badge variant="outline" className={priorityConfig[selected.priority]?.color}>{priorityConfig[selected.priority]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Potpisnik:</span> {selected.signerName}</div>
                <div><span className="text-muted-foreground">Kreiran:</span> {new Date(selected.createdAt).toLocaleDateString('sr-RS')}</div>
                {selected.signedAt && <div><span className="text-muted-foreground">Potpisan:</span> {new Date(selected.signedAt).toLocaleDateString('sr-RS')}</div>}
              </div>
              {selected.notes && (
                <div className="text-sm"><span className="text-muted-foreground">Napomene:</span> {selected.notes}</div>
              )}
            </div>
          )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
