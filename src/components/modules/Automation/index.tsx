'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bot, Plus, Search, Pencil, Trash2, Play, Pause, Clock, AlertTriangle, CheckCircle2, XCircle, Zap, RefreshCw, Settings, FileText, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

// ==================== TYPES ====================

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: string
  action: string
  status: 'active' | 'paused' | 'error' | 'draft'
  lastRun: string | null
  nextRun: string | null
  runCount: number
  successCount: number
  errorCount: number
  createdAt: string
  updatedAt: string
}

interface AutomationLog {
  id: string
  ruleId: string
  ruleName: string
  status: 'success' | 'error' | 'warning'
  message: string
  duration: number
  timestamp: string
}

// ==================== MOCK DATA ====================

const TRIGGERS = [
  { value: 'new_invoice', label: 'Nova faktura' },
  { value: 'invoice_overdue', label: 'Faktura prekoračena' },
  { value: 'payment_received', label: 'Plaćanje primljeno' },
  { value: 'new_partner', label: 'Novi partner' },
  { value: 'stock_low', label: 'Niska zaliha' },
  { value: 'schedule', label: 'Raspored (cron)' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'manual', label: 'Ručno pokretanje' },
]

const ACTIONS = [
  { value: 'send_email', label: 'Pošalji email' },
  { value: 'send_sms', label: 'Pošalji SMS' },
  { value: 'create_task', label: 'Kreiraj zadatak' },
  { value: 'update_status', label: 'Ažuriraj status' },
  { value: 'generate_report', label: 'Generiši izveštaj' },
  { value: 'notify', label: 'Obavesti korisnika' },
  { value: 'sync_data', label: 'Sinhronizuj podatke' },
  { value: 'api_call', label: 'API poziv' },
]

const INITIAL_RULES: AutomationRule[] = [
  { id: '1', name: 'Obaveštenje o prekoračenju fakture', description: 'Šalje email partneru kada faktura dostigne rok', trigger: 'invoice_overdue', action: 'send_email', status: 'active', lastRun: '2024-06-15T09:30:00', nextRun: '2024-06-15T10:30:00', runCount: 145, successCount: 142, errorCount: 3, createdAt: '2024-01-10T08:00:00', updatedAt: '2024-06-15T09:30:00' },
  { id: '2', name: 'Auto-task za novog partnera', description: 'Kreira zadatak za onboarding novog partnera', trigger: 'new_partner', action: 'create_task', status: 'active', lastRun: '2024-06-14T14:20:00', nextRun: null, runCount: 67, successCount: 65, errorCount: 2, createdAt: '2024-01-15T10:00:00', updatedAt: '2024-06-14T14:20:00' },
  { id: '3', name: 'Dnevni izveštaj prodaje', description: 'Generiše dnevni izveštaj prodaje u 08:00', trigger: 'schedule', action: 'generate_report', status: 'active', lastRun: '2024-06-15T08:00:00', nextRun: '2024-06-16T08:00:00', runCount: 165, successCount: 160, errorCount: 5, createdAt: '2024-01-01T08:00:00', updatedAt: '2024-06-15T08:00:00' },
  { id: '4', name: 'Niska zaliha - obaveštenje', description: 'Obaveštava warehouse tim kada zaliha padne ispod minimuma', trigger: 'stock_low', action: 'notify', status: 'paused', lastRun: '2024-06-10T11:00:00', nextRun: null, runCount: 23, successCount: 20, errorCount: 3, createdAt: '2024-02-05T09:00:00', updatedAt: '2024-06-10T11:00:00' },
  { id: '5', name: 'Sinhronizacija sa bankom', description: 'Sinhronizuje plaćanja sa bankovnim izvodom', trigger: 'schedule', action: 'sync_data', status: 'error', lastRun: '2024-06-15T07:00:00', nextRun: '2024-06-15T08:00:00', runCount: 89, successCount: 85, errorCount: 4, createdAt: '2024-01-20T07:00:00', updatedAt: '2024-06-15T07:00:00' },
  { id: '6', name: 'Welcome email za nove partnere', description: 'Šalje welcome email pri kreiranju novog partnera', trigger: 'new_partner', action: 'send_email', status: 'draft', lastRun: null, nextRun: null, runCount: 0, successCount: 0, errorCount: 0, createdAt: '2024-06-01T10:00:00', updatedAt: '2024-06-01T10:00:00' },
]

const INITIAL_LOGS: AutomationLog[] = [
  { id: 'log1', ruleId: '1', ruleName: 'Obaveštenje o prekoračenju fakture', status: 'success', message: 'Email poslat partneru "ACME doo" za fakturu F-2024-0234', duration: 1250, timestamp: '2024-06-15T09:30:00' },
  { id: 'log2', ruleId: '3', ruleName: 'Dnevni izveštaj prodaje', status: 'success', message: 'Izveštaj generisan — 12 faktura, 1.250.000 RSD', duration: 3400, timestamp: '2024-06-15T08:00:00' },
  { id: 'log3', ruleId: '5', ruleName: 'Sinhronizacija sa bankom', status: 'error', message: 'Greška: API konekcija sa bankom odbijena (timeout)', duration: 30000, timestamp: '2024-06-15T07:00:00' },
  { id: 'log4', ruleId: '2', ruleName: 'Auto-task za novog partnera', status: 'success', message: 'Zadatak "Onboarding — Tech Solutions" kreiran', duration: 890, timestamp: '2024-06-14T14:20:00' },
  { id: 'log5', ruleId: '1', ruleName: 'Obaveštenje o prekoračenju fakture', status: 'warning', message: 'Email poslat ali sa kašnjenjem (3.2s)', duration: 3200, timestamp: '2024-06-14T10:30:00' },
  { id: 'log6', ruleId: '4', ruleName: 'Niska zaliha - obaveštenje', status: 'success', message: 'Obaveštenje: "Mleko 1L" — preostalo 5 komada', duration: 450, timestamp: '2024-06-10T11:00:00' },
  { id: 'log7', ruleId: '3', ruleName: 'Dnevni izveštaj prodaje', status: 'success', message: 'Izveštaj generisan — 8 faktura, 890.000 RSD', duration: 2100, timestamp: '2024-06-14T08:00:00' },
  { id: 'log8', ruleId: '5', ruleName: 'Sinhronizacija sa bankom', status: 'success', message: '3 nova plaćanja sinhronizovana', duration: 5600, timestamp: '2024-06-14T07:00:00' },
]

// ==================== HELPERS ====================

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    active: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Активна', icon: CheckCircle2 },
    paused: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Паузирана', icon: Pause },
    error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Грешка', icon: AlertTriangle },
    draft: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', label: 'Нацрт', icon: FileText },
  }
  const s = map[status] || map.draft
  return <Badge className={`${s.color} gap-1 text-xs`}><s.icon className="h-3 w-3" />{s.label}</Badge>
}

function getLogStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string }> = {
    success: { color: 'bg-emerald-100 text-emerald-800', label: 'Успех' },
    error: { color: 'bg-red-100 text-red-800', label: 'Грешка' },
    warning: { color: 'bg-amber-100 text-amber-800', label: 'Упозорење' },
  }
  const s = map[status] || map.success
  return <Badge className={`${s.color} text-[10px]`}>{s.label}</Badge>
}

function getTriggerLabel(val: string) {
  return TRIGGERS.find(t => t.value === val)?.label || val
}

function getActionLabel(val: string) {
  return ACTIONS.find(a => a.value === val)?.label || val
}

// ==================== MAIN COMPONENT ====================

export function Automatizacija() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [triggerFilter, setTriggerFilter] = useState('')

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AutomationRule | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', trigger: '', action: '', status: 'draft' as AutomationRule['status'] })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/automation')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) { setRules(data); setLoading(false); return }
      }
    } catch { /* fallback */ }
    setRules(INITIAL_RULES)
    setLogs(INITIAL_LOGS)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Stats
  const stats = {
    total: rules.length,
    active: rules.filter(r => r.status === 'active').length,
    paused: rules.filter(r => r.status === 'paused').length,
    errors: rules.filter(r => r.status === 'error').length,
    totalRuns: rules.reduce((s, r) => s + r.runCount, 0),
    successRate: rules.length > 0 ? Math.round((rules.reduce((s, r) => s + r.successCount, 0) / Math.max(rules.reduce((s, r) => s + r.runCount, 0), 1)) * 100) : 0,
  }

  // Filter
  const filtered = rules.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    const matchTrigger = !triggerFilter || r.trigger === triggerFilter
    return matchSearch && matchStatus && matchTrigger
  })

  // Handlers
  const handleNew = () => { setEditing(null); setFormData({ name: '', description: '', trigger: '', action: '', status: 'draft' }); setFormOpen(true) }
  const handleEdit = (r: AutomationRule) => { setEditing(r); setFormData({ name: r.name, description: r.description, trigger: r.trigger, action: r.action, status: r.status }); setFormOpen(true) }

  const handleSave = async () => {
    if (!formData.name || !formData.trigger || !formData.action) { toast.error('Popunite sva obavezna polja'); return }
    setSubmitting(true)
    try {
      const url = editing ? `/api/automation/${editing.id}` : '/api/automation'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { toast.success(editing ? 'Pravilo ažurirano' : 'Pravilo kreirano'); setFormOpen(false); fetchData(); return }
    } catch { /* fallback */ }
    if (editing) {
      setRules(prev => prev.map(r => r.id === editing.id ? { ...r, ...formData, updatedAt: new Date().toISOString() } : r))
    } else {
      const newRule: AutomationRule = { id: `auto-${Date.now()}`, ...formData, lastRun: null, nextRun: null, runCount: 0, successCount: 0, errorCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setRules(prev => [newRule, ...prev])
    }
    toast.success(editing ? 'Pravilo ažurirano' : 'Pravilo kreirano')
    setFormOpen(false)
    setSubmitting(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati pravilo automatizacije?')) return
    setRules(prev => prev.filter(r => r.id !== id))
    toast.success('Pravilo obrisano')
  }

  const handleToggleStatus = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
    toast.success('Status promenjen')
  }

  const handleRunNow = (id: string) => {
    toast.success('Pravilo pokrenuto...')
    setTimeout(() => {
      setLogs(prev => [{ id: `log-${Date.now()}`, ruleId: id, ruleName: rules.find(r => r.id === id)?.name || '', status: 'success', message: 'Pravilo uspešno izvršeno (simulacija)', duration: Math.floor(Math.random() * 3000) + 500, timestamp: new Date().toISOString() }, ...prev])
      setRules(prev => prev.map(r => r.id === id ? { ...r, lastRun: new Date().toISOString(), runCount: r.runCount + 1, successCount: r.successCount + 1 } : r))
      toast.success('Pravilo uspešno izvršeno')
    }, 1500)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аутоматизација</h1>
          <p className="text-sm text-muted-foreground">Управљање автоматским правилима и радним tokovima</p>
        </div>
        <Button onClick={handleNew} className="gap-2"><Plus className="h-4 w-4" />Ново правило</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Bot className="h-3.5 w-3.5" />Укупно</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><Play className="h-3.5 w-3.5" />Активних</div><p className="text-2xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-amber-600 mb-1"><Pause className="h-3.5 w-3.5" />Паузираних</div><p className="text-2xl font-bold text-amber-700">{stats.paused}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><AlertTriangle className="h-3.5 w-3.5" />Грешaka</div><p className="text-2xl font-bold text-red-700">{stats.errors}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><RefreshCw className="h-3.5 w-3.5" />Ukupno izvršavanja</div><p className="text-2xl font-bold">{stats.totalRuns}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Zap className="h-3.5 w-3.5" />Uspešnost</div><p className="text-2xl font-bold">{stats.successRate}%</p></Card>
      </div>

      <Tabs defaultValue="pravila" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pravila" className="gap-1.5"><Settings className="h-3.5 w-3.5" />Правила</TabsTrigger>
          <TabsTrigger value="logovi" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Евиденција <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{logs.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="pravila">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Правила аутоматизације</CardTitle>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Претрага..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Сви" /></SelectTrigger><SelectContent><SelectItem value="all">Сви статуси</SelectItem><SelectItem value="active">Активна</SelectItem><SelectItem value="paused">Паузирана</SelectItem><SelectItem value="error">Грешка</SelectItem><SelectItem value="draft">Нацрт</SelectItem></SelectContent></Select>
                  <Select value={triggerFilter || 'all'} onValueChange={v => setTriggerFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Окидач" /></SelectTrigger><SelectContent><SelectItem value="all">Сви окидачи</SelectItem>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Назив</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Окидач</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Акција</TableHead>
                    <TableHead className="text-xs">Статус</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Извршавања</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Последње</TableHead>
                    <TableHead className="text-xs text-right">Акције</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Нема правила</TableCell></TableRow> : filtered.map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell><div><p className="text-xs font-medium">{rule.name}</p><p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{rule.description}</p></div></TableCell>
                        <TableCell className="hidden md:table-cell"><span className="text-xs">{getTriggerLabel(rule.trigger)}</span></TableCell>
                        <TableCell className="hidden lg:table-cell"><span className="text-xs">{getActionLabel(rule.action)}</span></TableCell>
                        <TableCell>{getStatusBadge(rule.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell"><div className="text-xs"><span className="font-medium">{rule.runCount}</span><span className="text-muted-foreground"> (✓{rule.successCount}</span><span className="text-red-500"> ✗{rule.errorCount}</span><span className="text-muted-foreground">)</span></div></TableCell>
                        <TableCell className="hidden lg:table-cell"><span className="text-xs text-muted-foreground">{rule.lastRun ? formatDate(rule.lastRun) : '—'}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRunNow(rule.id)} title="Покрени одмах"><Play className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleStatus(rule.id)} title="Pause/Resume"><Pause className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(rule)} title="Измени"><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(rule.id)} title="Обриши"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logovi">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Евиденција извршавања</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs w-[140px]">Време</TableHead>
                    <TableHead className="text-xs">Правило</TableHead>
                    <TableHead className="text-xs">Статус</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Порука</TableHead>
                    <TableHead className="text-xs text-right w-[80px]">Трајање</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs font-mono whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                        <TableCell className="text-xs font-medium">{log.ruleName}</TableCell>
                        <TableCell>{getLogStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[300px] truncate">{log.message}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{(log.duration / 1000).toFixed(1)}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Измени правило' : 'Ново правило аутоматизације'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Назив *</Label><Input placeholder="Унесите назив..." value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Опис</Label><Input placeholder="Опис правила..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Окидач *</Label><Select value={formData.trigger} onValueChange={v => setFormData(p => ({ ...p, trigger: v }))}><SelectTrigger><SelectValue placeholder="Изабери" /></SelectTrigger><SelectContent>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Акција *</Label><Select value={formData.action} onValueChange={v => setFormData(p => ({ ...p, action: v }))}><SelectTrigger><SelectValue placeholder="Изабери" /></SelectTrigger><SelectContent>{ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Статус</Label><Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as AutomationRule['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Нацрт</SelectItem><SelectItem value="active">Активна</SelectItem><SelectItem value="paused">Паузирана</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Откажи</Button>
            <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Чување...' : 'Сачувај'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
