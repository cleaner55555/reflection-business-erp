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
  Share2, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users,
  TrendingUp, AlertCircle, Gift, DollarSign
} from 'lucide-react'

interface Referral {
  id: string
  referrerName: string
  refereeName: string
  refereeEmail?: string
  refereePhone?: string
  source: string
  status: string
  reward?: number
  notes?: string
  createdAt: string
  completedAt?: string
}

interface DashboardData {
  totalReferrals: number
  pendingReferrals: number
  completedReferrals: number
  totalRewards: number
  topReferrers: Array<{ name: string; count: number }>
  recentReferrals: Referral[]
  sourceBreakdown: Array<{ source: string; count: number }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  contacted: { label: 'Kontaktiran', color: 'bg-blue-100 text-blue-700' },
  converted: { label: 'Konvertovan', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Istekao', color: 'bg-gray-100 text-gray-700' },
}

const sourceLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Telefon',
  social: 'Društvene mreže',
  direct: 'Lično',
  website: 'Veb sajt',
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

export function Referrals() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Referral[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Referral | null>(null)

  const emptyForm = {
    referrerName: '', refereeName: '', refereeEmail: '',
    refereePhone: '', source: 'direct', reward: 0, notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/referrals/dashboard?companyId=${activeCompanyId}`)
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
      const res = await fetch(`/api/referrals?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'referrals') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/referrals', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati preporuku?')) return
    try {
      const res = await fetch(`/api/referrals?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preporuke</h1>
          <p className="text-sm text-muted-foreground">Upravljanje preporukama i partnerskim programom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova preporuka
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="referrals"><Share2 className="h-4 w-4 mr-1" /> Preporuke</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno preporuka</span>
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalReferrals}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Na čekanju</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.pendingReferrals}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Konvertovane</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.completedReferrals}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupne nagrade</span>
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(dashboard.totalRewards)}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po izvoru</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.sourceBreakdown.map((s) => (
                      <div key={s.source} className="flex items-center justify-between">
                        <span className="text-sm">{sourceLabels[s.source] || s.source}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalReferrals ? (s.count / dashboard.totalReferrals) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Top preporučivači</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.topReferrers.map((r, idx) => (
                      <div key={r.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                          <span className="text-sm">{r.name}</span>
                        </div>
                        <Badge variant="outline">{r.count} preporuka</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne preporuke</CardTitle></CardHeader>
                <CardContent>
                  {dashboard.recentReferrals.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nema preporuka. Kreirajte prvu preporuku.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentReferrals.map((r) => {
                        const cfg = statusConfig[r.status]
                        return (
                          <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{r.refereeName}</div>
                              <div className="text-xs text-muted-foreground">od {r.referrerName} · {sourceLabels[r.source] || r.source}</div>
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

        <TabsContent value="referrals" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži preporuke..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <Share2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema preporuka</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj preporuku</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Preporučeni</th><th className="p-3">Preporučilac</th><th className="p-3">Izvor</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                  </tr></thead>
                  <tbody>{items.map((r) => {
                    const cfg = statusConfig[r.status]
                    return (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.refereeName}</td>
                        <td className="p-3">{r.referrerName}</td>
                        <td className="p-3">{sourceLabels[r.source] || r.source}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || r.status}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(r); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                            {r.status === 'pending' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" onClick={() => handleUpdateStatus(r.id, 'contacted')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                            )}
                            {r.status === 'contacted' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(r.id, 'converted')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Nova preporuka</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preporučilac</Label>
                <Input value={form.referrerName} onChange={(e) => setForm({ ...form, referrerName: e.target.value })} placeholder="Ko preporučuje" />
              </div>
              <div className="space-y-2">
                <Label>Preporučeni</Label>
                <Input value={form.refereeName} onChange={(e) => setForm({ ...form, refereeName: e.target.value })} placeholder="Ko je preporučen" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.refereeEmail} onChange={(e) => setForm({ ...form, refereeEmail: e.target.value })} placeholder="Email adresa" />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.refereePhone} onChange={(e) => setForm({ ...form, refereePhone: e.target.value })} placeholder="Broj telefona" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Izvor</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(sourceLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nagrada (RSD)</Label>
                <Input type="number" value={form.reward || ''} onChange={(e) => setForm({ ...form, reward: parseFloat(e.target.value) || 0 })} />
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
          <DialogHeader><DialogTitle>Detalji preporuke</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Preporučeni:</span> <span className="font-medium">{selected.refereeName}</span></div>
                <div><span className="text-muted-foreground">Preporučilac:</span> {selected.referrerName}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Izvor:</span> {sourceLabels[selected.source] || selected.source}</div>
                {selected.refereeEmail && <div><span className="text-muted-foreground">Email:</span> {selected.refereeEmail}</div>}
                {selected.refereePhone && <div><span className="text-muted-foreground">Telefon:</span> {selected.refereePhone}</div>}
                {selected.reward && <div><span className="text-muted-foreground">Nagrada:</span> <span className="font-bold">{formatCurrency(selected.reward)}</span></div>}
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
