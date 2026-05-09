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
  ShieldCheck, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, AlertTriangle,
  TrendingDown, AlertCircle, FileText, Award
} from 'lucide-react'

interface Inspection {
  id: string
  title: string
  type: string
  productName?: string
  batchNumber?: string
  inspectorName: string
  status: string
  result: string
  defects?: number
  notes?: string
  inspectedAt?: string
  createdAt: string
}

interface DashboardData {
  totalInspections: number
  passedInspections: number
  failedInspections: number
  pendingInspections: number
  passRate: number
  totalDefects: number
  recentInspections: Inspection[]
  typeBreakdown: Array<{ type: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'U toku', color: 'bg-blue-100 text-blue-700' },
  passed: { label: 'Prošlo', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Palo', color: 'bg-red-100 text-red-700' },
}

const typeLabels: Record<string, string> = {
  incoming: 'Dolazna kontrola',
  in_process: 'Kontrola u toku',
  final: 'Finalna kontrola',
  audit: 'Audit',
}

export function Quality() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Inspection[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Inspection | null>(null)

  const emptyForm = {
    title: '', type: 'final', productName: '', batchNumber: '',
    inspectorName: '', result: 'pending', defects: 0, notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/quality/inspections/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/quality/inspections?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'inspections') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/quality/inspections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string, result: string) => {
    try {
      const res = await fetch('/api/quality/inspections', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, result }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati inspekciju?')) return
    try {
      const res = await fetch(`/api/quality/inspections?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kvalitet</h1>
          <p className="text-sm text-muted-foreground">Upravljanje kontrolom kvaliteta i inspekcijama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova inspekcija
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="inspections"><ShieldCheck className="h-4 w-4 mr-1" /> Inspekcije</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno inspekcija</span>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalInspections}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prošlo</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.passedInspections}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Palo</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.failedInspections}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Stopa prolaza</span>
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.passRate}%</p>
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
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalInspections ? (tp.count / dashboard.totalInspections) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{tp.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno defekata</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-3xl font-bold">{dashboard.totalDefects}</p>
                      <p className="text-sm text-muted-foreground mt-1">ukupno pronađenih</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne inspekcije</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentInspections.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema inspekcija. Kreirajte prvu inspekciju.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Naslov</th><th className="pb-2 pr-4">Tip</th><th className="pb-2 pr-4">Inspektor</th><th className="pb-2 pr-4">Rezultat</th><th className="pb-2">Datum</th>
                        </tr></thead>
                        <tbody>{dashboard.recentInspections.map((i) => {
                          const cfg = statusConfig[i.status]
                          return (
                            <tr key={i.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-2 pr-4">{i.title}</td>
                              <td className="py-2 pr-4">{typeLabels[i.type] || i.type}</td>
                              <td className="py-2 pr-4">{i.inspectorName}</td>
                              <td className="py-2 pr-4"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || i.status}</Badge></td>
                              <td className="py-2 text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleDateString('sr-RS')}</td>
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

        <TabsContent value="inspections" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži inspekcije..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema inspekcija</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj inspekciju</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Naslov</th><th className="p-3">Tip</th><th className="p-3">Inspektor</th><th className="p-3">Proizvod</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((i) => {
                    const cfg = statusConfig[i.status]
                    return (
                      <tr key={i.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{i.title}</td>
                        <td className="p-3">{typeLabels[i.type] || i.type}</td>
                        <td className="p-3">{i.inspectorName}</td>
                        <td className="p-3">{i.productName || '-'}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || i.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(i); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {i.status === 'pending' && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(i.id, 'passed', 'passed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => handleUpdateStatus(i.id, 'failed', 'failed')}><AlertTriangle className="h-3.5 w-3.5" /></Button>
                              </>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Nova inspekcija</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov inspekcije</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Naslov inspekcije" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip kontrole</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Inspektor</Label>
                <Input value={form.inspectorName} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} placeholder="Ime inspektora" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proizvod</Label>
                <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="Naziv proizvoda" />
              </div>
              <div className="space-y-2">
                <Label>Batch broj</Label>
                <Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} placeholder="Broj serije" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Broj defekata</Label>
              <Input type="number" value={form.defects || ''} onChange={(e) => setForm({ ...form, defects: parseInt(e.target.value) || 0 })} />
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
          <DialogHeader><DialogTitle>Detalji inspekcije</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Naslov:</span> <span className="font-medium">{selected.title}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Tip:</span> {typeLabels[selected.type] || selected.type}</div>
                <div><span className="text-muted-foreground">Inspektor:</span> {selected.inspectorName}</div>
                <div><span className="text-muted-foreground">Proizvod:</span> {selected.productName || '-'}</div>
                <div><span className="text-muted-foreground">Batch:</span> {selected.batchNumber || '-'}</div>
                <div><span className="text-muted-foreground">Defekti:</span> {selected.defects || 0}</div>
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selected.createdAt).toLocaleDateString('sr-RS')}</div>
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
