 
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
  Workflow, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, ArrowRight, Play,
  Pause, Zap, Target, Users
} from 'lucide-react'

interface MarketingWorkflow {
  id: string
  name: string
  trigger: string
  actions: string[]
  status: string
  executionCount: number
  lastExecuted?: string
  createdAt: string
}

const triggerConfig: Record<string, { label: string; color: string }> = {
  new_lead: { label: 'Novi lead', color: 'bg-green-100 text-green-700' },
  cart_abandoned: { label: 'Napuštena korpa', color: 'bg-amber-100 text-amber-700' },
  purchase: { label: 'Kupovina', color: 'bg-blue-100 text-blue-700' },
  invoice_overdue: { label: 'Prekoračen rok', color: 'bg-red-100 text-red-700' },
  subscription_expired: { label: 'Istek pretplate', color: 'bg-purple-100 text-purple-700' },
  birthday: { label: 'Rođendan', color: 'bg-pink-100 text-pink-700' },
  inactivity: { label: 'Neaktivnost', color: 'bg-gray-100 text-gray-700' },
  custom: { label: 'Custom', color: 'bg-teal-100 text-teal-700' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pauzirana', color: 'bg-amber-100 text-amber-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  error: { label: 'Greška', color: 'bg-red-100 text-red-700' },
}

export function MktAutomatizacija() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [workflows, setWorkflows] = useState<MarketingWorkflow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<MarketingWorkflow | null>(null)

  const emptyForm = { name: '', trigger: 'new_lead', actions: ['send_email'], status: 'draft' }
  const [form, setForm] = useState(emptyForm)

  const actionOptions = [
    { value: 'send_email', label: 'Pošalji email' },
    { value: 'send_sms', label: 'Pošalji SMS' },
    { value: 'add_tag', label: 'Dodaj tag' },
    { value: 'create_task', label: 'Kreiraj zadatak' },
    { value: 'notify_sales', label: 'Obavesti prodaju' },
    { value: 'update_field', label: 'Ažuriraj polje' },
    { value: 'wait', label: 'Sačekaj (delay)' },
    { value: 'webhook', label: 'Pozovi webhook' },
  ]

  const loadWorkflows = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/marketing/workflows?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadWorkflows() }, [activeCompanyId, loadWorkflows])

  const activeWorkflows = workflows.filter((w) => w.status === 'active').length
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0)

  const filtered = workflows.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/marketing/workflows', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, executionCount: 0 }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadWorkflows() }
    } catch { /* silent */ }
  }

  const handleToggleStatus = async (w: MarketingWorkflow) => {
    try {
      const newStatus = w.status === 'active' ? 'paused' : 'active'
      const res = await fetch(`/api/marketing/workflows?id=${w.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) loadWorkflows()
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati workflow?')) return
    try {
      const res = await fetch(`/api/marketing/workflows?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadWorkflows()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketinkg Automatizacija</h1>
          <p className="text-sm text-muted-foreground">Automatski marketing workflow-i i trigger-i</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadWorkflows}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi workflow</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="workflows"><Workflow className="h-4 w-4 mr-1" /> Workflow-i</TabsTrigger>
          <TabsTrigger value="templates"><Zap className="h-4 w-4 mr-1" /> Template</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Workflow-i</span><Workflow className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{workflows.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Aktivni</span><Play className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{activeWorkflows}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Izvršenja</span><Target className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalExecutions}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Triggeri</span><Zap className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{Object.keys(triggerConfig).length}</p></Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Kako radi automatizacija</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><Zap className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-sm font-medium mb-1">1. Trigger</h4>
                  <p className="text-xs text-muted-foreground">Događaj koji pokreće workflow</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><ArrowRight className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-sm font-medium mb-1">2. Uslovi</h4>
                  <p className="text-xs text-muted-foreground">Filtriranje i segmentacija</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><Play className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-sm font-medium mb-1">3. Akcije</h4>
                  <p className="text-xs text-muted-foreground">Email, SMS, tag, notifikacija...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Dostupni trigger-i</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(triggerConfig).map(([key, cfg]) => (
                  <div key={key} className="p-3 border rounded-lg text-center">
                    <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži workflow-e..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><Workflow className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema workflow-a</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj workflow</Button></Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((w) => {
                const trigCfg = triggerConfig[w.trigger]
                const statCfg = statusConfig[w.status]
                return (
                  <Card key={w.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Workflow className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{w.name}</span>
                              <Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className={trigCfg?.color}>{trigCfg?.label}</Badge>
                              <span>→</span>
                              <span>{w.actions.length} akcija</span>
                              <span>·</span>
                              <span>{w.executionCount} izvršenja</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(w); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggleStatus(w)}>
                            {w.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(w.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Predlošci workflow-a</p>
            <p className="text-xs text-muted-foreground mt-1">Brzo kreirajte čestice iz gotovih template-a</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novi marketing workflow</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="npr. Dobrodošlica novom lead-u" /></div>
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(triggerConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Akcije</Label>
              <div className="space-y-2">
                {form.actions.map((action, i) => {
                  const opt = actionOptions.find((o) => o.value === action)
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 p-2 border rounded-md text-sm">{opt?.label || action}</div>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setForm({ ...form, actions: form.actions.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )
                })}
                <Select onValueChange={(v) => { if (!form.actions.includes(v)) setForm({ ...form, actions: [...form.actions, v] }) }}>
                  <SelectTrigger><SelectValue placeholder="+ Dodaj akciju" /></SelectTrigger>
                  <SelectContent>{actionOptions.filter((o) => !form.actions.includes(o.value)).map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
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
          <DialogHeader><DialogTitle>Detalji workflow-a</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Naziv:</span> <span className="font-medium">{selected.name}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Trigger:</span> <Badge variant="outline" className={triggerConfig[selected.trigger]?.color}>{triggerConfig[selected.trigger]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Izvršenja:</span> {selected.executionCount}</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Akcije:</span>
                <div className="space-y-1">
                  {selected.actions.map((a, i) => {
                    const opt = actionOptions.find((o) => o.value === a)
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        {opt?.label || a}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
