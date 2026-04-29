'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Plus, Search, Pencil, Trash2, HeartHandshake, Phone, Mail, Building2, CheckCircle2, Clock, XCircle,
  ArrowLeft, TrendingUp, BarChart3, Target, AlertTriangle, RefreshCw, X, Activity, Calendar,
  ChevronRight, MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { formatRSD, formatDate } from '@/lib/helpers'

interface Contact {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; company: string | null; notes: string | null; tags: string | null
  isClient: boolean; isSupplier: boolean; isLead: boolean; createdAt: string
  partner?: { id: string; name: string } | null
  _count?: { activities: number; deals: number }
}

interface Deal {
  id: string; title: string; value: number; stage: string; probability: number
  score: number; lostReason: string | null
  assignedTo: string | null; closeDate: string | null; notes: string | null; createdAt: string
  contact?: { id: string; firstName: string; lastName: string } | null
  partner?: { id: string; name: string } | null
  _count?: { activities: number }
}

interface CrmActivity {
  id: string; type: string; title: string; description: string | null
  dueDate: string | null; completed: boolean; createdAt: string
  contact?: { id: string; firstName: string; lastName: string } | null
  deal?: { id: string; title: string } | null
}

const STAGES = ['lead', 'kvalifikacija', 'predlog', 'pregovaranje', 'won', 'lost'] as const
const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', kvalifikacija: 'Kvalifikacija', predlog: 'Predlog',
  pregovaranje: 'Pregovaranje', won: 'Dobijeno', lost: 'Izgubljeno'
}
const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-slate-100 border-slate-300', kvalifikacija: 'bg-blue-50 border-blue-300',
  predlog: 'bg-amber-50 border-amber-300', pregovaranje: 'bg-orange-50 border-orange-300',
  won: 'bg-emerald-50 border-emerald-300', lost: 'bg-red-50 border-red-300'
}
const STAGE_DOT: Record<string, string> = {
  lead: 'bg-slate-400', kvalifikacija: 'bg-blue-400', predlog: 'bg-amber-400',
  pregovaranje: 'bg-orange-400', won: 'bg-emerald-500', lost: 'bg-red-400'
}

function scoreColor(score: number): string {
  if (score >= 67) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (score >= 34) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function daysUntil(date: string | null): number | null {
  if (!date) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const target = new Date(date); target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function initials(firstName?: string | null, lastName?: string | null): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Najnoviji' },
  { value: 'value_desc', label: 'Vrednost ↓' },
  { value: 'probability_desc', label: 'Verovatnoća ↓' },
  { value: 'score_desc', label: 'Score ↓' },
  { value: 'closeDate_asc', label: 'Datum zatv. ↑' },
]

export function CRM() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('crm.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('crm.subtitle')}</p>
      </div>
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pipeline" className="gap-1.5"><HeartHandshake className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.pipeline')}</span></TabsTrigger>
          <TabsTrigger value="forecast" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.forecast')}</span></TabsTrigger>
          <TabsTrigger value="kontakti">{t('crm.contacts')}</TabsTrigger>
          <TabsTrigger value="aktivnosti">{t('crm.activities')}</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="forecast"><ForecastTab /></TabsContent>
        <TabsContent value="kontakti"><KontaktiTab /></TabsContent>
        <TabsContent value="aktivnosti"><AktivnostiTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== PIPELINE (KANBAN) ====================
function PipelineTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [lostDialog, setLostDialog] = useState<{ dealId: string; reason: string } | null>(null)

  const fetchDeals = useCallback(async (): Promise<void> => {
    setLoading(true)
    const res = await fetch('/api/deals')
    const data: Deal[] = await res.json()
    setDeals(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  useEffect(() => {
    if (deals.length > 0) {
      const texts: string[] = []
      deals.forEach((d: Deal) => {
        if (d.title) texts.push(d.title)
        if (d.contact) { texts.push(d.contact.firstName, d.contact.lastName) }
        if (d.assignedTo) texts.push(d.assignedTo)
      })
      translateTexts(texts)
    }
  }, [deals, translateTexts])

  const filteredDeals = useMemo(() => {
    let result = [...deals]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d: Deal) => d.title.toLowerCase().includes(q) || (d.contact && `${d.contact.firstName} ${d.contact.lastName}`.toLowerCase().includes(q)))
    }
    if (filterStage !== 'all') result = result.filter((d: Deal) => d.stage === filterStage)
    switch (sortBy) {
      case 'value_desc': result.sort((a: Deal, b: Deal) => b.value - a.value); break
      case 'probability_desc': result.sort((a: Deal, b: Deal) => b.probability - a.probability); break
      case 'score_desc': result.sort((a: Deal, b: Deal) => b.score - a.score); break
      case 'closeDate_asc': result.sort((a: Deal, b: Deal) => (a.closeDate || '').localeCompare(b.closeDate || '')); break
      default: result.sort((a: Deal, b: Deal) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return result
  }, [deals, search, filterStage, sortBy])

  const moveDeal = async (dealId: string, newStage: string): Promise<void> => {
    if (newStage === 'lost') {
      setLostDialog({ dealId, reason: '' })
      return
    }
    try {
      await fetch(`/api/deals/${dealId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: newStage }) })
      fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

  const confirmLost = async (): Promise<void> => {
    if (!lostDialog) return
    try {
      await fetch(`/api/deals/${lostDialog.dealId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'lost', lostReason: lostDialog.reason || null })
      })
      setLostDialog(null)
      fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm(t('crm.confirmDeleteDeal'))) return
    try { await fetch(`/api/deals/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchDeals() } catch { toast.error(t('common.error')) }
  }

  const handleNew = (): void => { setEditingDeal(null); setViewMode('form') }
  const handleEdit = (deal: Deal): void => { setEditingDeal(deal); setViewMode('form') }
  const handleCancel = (): void => { setViewMode('list'); setEditingDeal(null) }
  const handleSelectDeal = (deal: Deal): void => { setSelectedDeal(deal) }
  const handleCloseDetail = (): void => { setSelectedDeal(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { title: fd.get('title') as string, value: fd.get('value') as string, stage: fd.get('stage') as string, probability: fd.get('probability') as string, closeDate: fd.get('closeDate') as string, notes: fd.get('notes') as string }
    try {
      const url = editingDeal ? `/api/deals/${editingDeal.id}` : '/api/deals'
      const res = await fetch(url, { method: editingDeal ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editingDeal ? t('common.updated') : t('common.created'))
      setViewMode('list'); setEditingDeal(null); fetchDeals()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const recalcScores = async (): Promise<void> => {
    try {
      const res = await fetch('/api/deals/recalculate-scores', { method: 'POST' })
      const data = await res.json()
      toast.success(`${t('crm.recalcScores')}: ${data.updated}/${data.total}`)
      fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

  const nextStage = (stage: string): string | null => {
    const idx = STAGES.indexOf(stage as typeof STAGES[number])
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null
  }

  const stats = useMemo(() => {
    const active = deals.filter((d: Deal) => !['won', 'lost'].includes(d.stage))
    const wonDeals = deals.filter((d: Deal) => d.stage === 'won')
    const completedDeals = deals.filter((d: Deal) => ['won', 'lost'].includes(d.stage))
    const now = new Date()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const closingThisMonth = deals.filter((d: Deal) => {
      if (['won', 'lost'].includes(d.stage) || !d.closeDate) return false
      const cd = new Date(d.closeDate)
      return cd <= monthEnd
    })
    const atRisk = deals.filter((d: Deal) => {
      if (['won', 'lost'].includes(d.stage) || !d.closeDate) return false
      return new Date(d.closeDate) < now
    })
    return {
      totalWon: wonDeals.reduce((s: number, d: Deal) => s + d.value, 0),
      pipelineValue: active.reduce((s: number, d: Deal) => s + d.value, 0),
      weightedPipeline: active.reduce((s: number, d: Deal) => s + (d.value * d.probability / 100), 0),
      avgProbability: active.length > 0 ? Math.round(active.reduce((s: number, d: Deal) => s + d.probability, 0) / active.length) : 0,
      activeCount: active.length,
      closingThisMonth: closingThisMonth.length,
      atRisk: atRisk.length,
      winRate: completedDeals.length > 0 ? Math.round((wonDeals.length / completedDeals.length) * 100) : 0,
    }
  }, [deals])

  return (
    <div className="space-y-4">
      {viewMode === 'form' ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle className="text-base font-semibold">{editingDeal ? t('common.edit') : t('common.new')} {t('crm.deal')}</CardTitle></div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label className="text-xs">{t('crm.dealTitle')} *</Label><Input name="title" defaultValue={editingDeal?.title || ''} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('crm.dealValue')} (RSD)</Label><Input name="value" type="number" step="0.01" defaultValue={editingDeal?.value || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">{t('crm.probability')} %</Label><Input name="probability" type="number" defaultValue={editingDeal?.probability || '10'} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Stage</Label>
                  <Select name="stage" defaultValue={editingDeal?.stage || 'lead'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s: string) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">{t('crm.closeDate')}</Label><Input name="closeDate" type="date" defaultValue={editingDeal?.closeDate?.split('T')[0] || ''} /></div>
              </div>
              <div className="space-y-2"><Label className="text-xs">{t('common.notes')}</Label><Input name="notes" defaultValue={editingDeal?.notes || ''} /></div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Analytics KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">{t('crm.won')}</p><p className="text-sm font-bold text-emerald-700">{formatRSD(stats.totalWon)}</p></div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">{t('crm.pipeline')}</p><p className="text-sm font-bold text-blue-700">{formatRSD(stats.pipelineValue)}</p></div>
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">{t('crm.weightedPipeline')}</p><p className="text-sm font-bold text-purple-700">{formatRSD(stats.weightedPipeline)}</p></div>
            <div className="rounded-lg bg-sky-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">{t('crm.avgProbability')}</p><p className="text-sm font-bold text-sky-700">{stats.avgProbability}%</p></div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">{t('crm.activeDeals')}</p><p className="text-sm font-bold">{stats.activeCount}</p></div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">{t('crm.closingThisMonth')}</p><p className="text-sm font-bold text-amber-700">{stats.closingThisMonth}</p></div>
            <div className="rounded-lg bg-red-50 px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">{t('crm.atRisk')}</p>
              <p className="text-sm font-bold text-red-700">{stats.atRisk > 0 ? stats.atRisk : '✓'}</p>
            </div>
          </div>

          {/* Filters + Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder={t('crm.searchDeals')} className="pl-8 h-8 w-48 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <Select value={filterStage} onValueChange={setFilterStage}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t('crm.allStages')}</SelectItem>{STAGES.map((s: string) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent></Select>
              <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger><SelectContent>{SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={recalcScores}><RefreshCw className="h-3 w-3" />{t('crm.recalcScores')}</Button>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('crm.newDeal')}</Button>
          </div>

          {/* Kanban Board */}
          {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i: number) => <Skeleton key={i} className="h-64 w-full" />)}</div> : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((stage: string) => {
                const stageDeals = filteredDeals.filter((d: Deal) => d.stage === stage)
                const stageTotal = stageDeals.reduce((s: number, d: Deal) => s + d.value, 0)
                return (
                  <div key={stage} className={`min-w-[280px] w-[280px] flex-shrink-0 rounded-xl border-2 p-3 ${STAGE_COLORS[stage]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} /><h3 className="text-xs font-bold">{STAGE_LABELS[stage]}</h3></div>
                      <Badge variant="secondary" className="text-[10px]">{stageDeals.length}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-3">{formatRSD(stageTotal)}</p>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                      {stageDeals.map((deal: Deal) => {
                        const days = daysUntil(deal.closeDate)
                        const expected = deal.value * deal.probability / 100
                        const isOverdue = days !== null && days < 0 && !['won', 'lost'].includes(deal.stage)
                        return (
                          <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow border" onClick={() => handleSelectDeal(deal)}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium truncate">{tc(deal.title)}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${scoreColor(deal.score)}`}>{deal.score}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span className="font-semibold text-foreground/80">{formatRSD(deal.value)}</span>
                                  <span className="text-muted-foreground">~{formatRSD(expected)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  {deal.contact && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">{initials(deal.contact.firstName, deal.contact.lastName)}</div>
                                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{tc(`${deal.contact.firstName} ${deal.contact.lastName}`)}</span>
                                    </div>
                                  )}
                                  {deal._count && deal._count.activities > 0 && (
                                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><Activity className="h-2.5 w-2.5" />{deal._count.activities}</span>
                                  )}
                                </div>
                                {isOverdue && <p className="text-[9px] text-red-500 font-bold mt-1">{t('crm.overdue')}</p>}
                                {!isOverdue && days !== null && days <= 7 && days >= 0 && <p className="text-[9px] text-amber-600 mt-1">{days} {t('crm.daysLeft')}</p>}
                                {deal.lostReason && <p className="text-[9px] text-red-400 mt-1 italic">{deal.lostReason}</p>}
                              </div>
                              <div className="flex gap-0.5 flex-shrink-0">
                                {nextStage(stage) && (
                                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); moveDeal(deal.id, nextStage(stage)!) }}>
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                      {stageDeals.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">{t('crm.noDealsFound')}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Deal Detail Dialog */}
          <Dialog open={!!selectedDeal} onOpenChange={() => handleCloseDetail()}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              {selectedDeal && <DealDetail deal={selectedDeal} onClose={handleCloseDetail} onEdit={() => { handleCloseDetail(); handleEdit(selectedDeal) }} onDelete={() => { handleCloseDetail(); handleDelete(selectedDeal.id) }} onMove={(stage) => { handleCloseDetail(); moveDeal(selectedDeal.id, stage) }} onRefresh={fetchDeals} />}
            </DialogContent>
          </Dialog>

          {/* Lost Reason Dialog */}
          <Dialog open={!!lostDialog} onOpenChange={() => setLostDialog(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{t('crm.lostReason')}</DialogTitle></DialogHeader>
              <Input placeholder={t('crm.lostReasonPlaceholder')} value={lostDialog?.reason || ''} onChange={(e) => setLostDialog({ dealId: lostDialog?.dealId || '', reason: e.target.value })} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setLostDialog(null)}>{t('common.cancel')}</Button>
                <Button variant="destructive" onClick={confirmLost}>{t('crm.lost')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

// ==================== DEAL DETAIL ====================
function DealDetail({ deal, onClose, onEdit, onDelete, onMove, onRefresh }: {
  deal: Deal; onClose: () => void; onEdit: () => void; onDelete: () => void; onMove: (stage: string) => void; onRefresh: () => void
}) {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [newActivity, setNewActivity] = useState(false)
  const [actTitle, setActTitle] = useState('')
  const [actType, setActType] = useState('napomena')

  useEffect(() => {
    if (deal.id) {
      fetch(`/api/deals/${deal.id}`).then((r) => r.json()).then((d: Deal) => {
        if (d.activities) setActivities(d.activities as unknown as CrmActivity[])
      })
    }
  }, [deal.id])

  const addActivity = async (): Promise<void> => {
    if (!actTitle.trim()) return
    try {
      await fetch('/api/crm-activities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actType, title: actTitle, dealId: deal.id, description: '' })
      })
      setActTitle(''); setNewActivity(false)
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
      onRefresh()
      toast.success(t('common.created'))
    } catch { toast.error(t('common.error')) }
  }

  const days = daysUntil(deal.closeDate)
  const isOverdue = days !== null && days < 0 && !['won', 'lost'].includes(deal.stage)
  const expected = deal.value * deal.probability / 100

  const scoreItems = [
    { label: t('crm.scoreContact'), value: deal.contact ? 20 : 0 },
    { label: t('crm.scoreValue'), value: deal.value > 0 ? 20 : 0 },
    { label: t('crm.scoreDate'), value: deal.closeDate ? 15 : 0 },
    { label: t('crm.scoreProbability'), value: deal.probability > 50 ? 15 : 0 },
    { label: t('crm.scoreNotes'), value: deal.notes && deal.notes.trim().length > 0 ? 10 : 0 },
    { label: t('crm.scorePartner'), value: deal.partner ? 20 : 0 },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">{tc(deal.title)}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={STAGE_COLORS[deal.stage]}>{STAGE_LABELS[deal.stage]}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreColor(deal.score)}`}>{t('crm.score')}: {deal.score}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="text-xs" onClick={onEdit}><Pencil className="h-3 w-3 mr-1" />{t('common.edit')}</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onMove('won')} disabled={deal.stage === 'won'}><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />{t('crm.won')}</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onMove('lost')} disabled={deal.stage === 'lost'}><XCircle className="h-3 w-3 mr-1 text-red-500" />{t('crm.lost')}</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => setNewActivity(!newActivity)}><Plus className="h-3 w-3 mr-1" />{t('crm.createActivity')}</Button>
        <Button size="sm" variant="outline" className="text-xs text-red-500" onClick={onDelete}><Trash2 className="h-3 w-3 mr-1" />{t('common.delete')}</Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3"><p className="text-[10px] text-muted-foreground">{t('crm.dealValue')}</p><p className="text-sm font-bold">{formatRSD(deal.value)}</p></Card>
        <Card className="p-3"><p className="text-[10px] text-muted-foreground">{t('crm.expectedValue')}</p><p className="text-sm font-bold text-purple-700">{formatRSD(expected)}</p></Card>
        <Card className="p-3"><p className="text-[10px] text-muted-foreground">{t('crm.probability')}</p><p className="text-sm font-bold">{deal.probability}%</p></Card>
        <Card className="p-3"><p className="text-[10px] text-muted-foreground">{t('crm.closeDate')}</p>
          <p className="text-sm font-bold">
            {deal.closeDate ? formatDate(deal.closeDate) : '-'}
            {isOverdue && <span className="text-red-500 ml-1">{t('crm.overdue')}</span>}
            {!isOverdue && days !== null && days >= 0 && <span className="text-muted-foreground ml-1">({days}d)</span>}
          </p>
        </Card>
      </div>

      {/* Contact & Partner */}
      <div className="grid grid-cols-2 gap-3">
        {deal.contact && (
          <Card className="p-3">
            <p className="text-[10px] text-muted-foreground">{t('crm.contact')}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initials(deal.contact.firstName, deal.contact.lastName)}</div>
              <div><p className="text-xs font-medium">{tc(`${deal.contact.firstName} ${deal.contact.lastName}`)}</p></div>
            </div>
          </Card>
        )}
        {deal.partner && (
          <Card className="p-3">
            <p className="text-[10px] text-muted-foreground">{t('crm.company')}</p>
            <p className="text-xs font-medium mt-1">{tc(deal.partner.name)}</p>
          </Card>
        )}
      </div>

      {/* Lost Reason */}
      {deal.lostReason && (
        <Card className="p-3 border-red-200 bg-red-50"><p className="text-[10px] text-muted-foreground">{t('crm.lostReason')}</p><p className="text-xs text-red-700 mt-1">{deal.lostReason}</p></Card>
      )}

      {/* Score Breakdown */}
      <Card className="p-3">
        <p className="text-xs font-semibold mb-2">{t('crm.scoreDetails')} ({deal.score}/100)</p>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2"><div className={`h-2 rounded-full ${deal.score >= 67 ? 'bg-emerald-500' : deal.score >= 34 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${deal.score}%` }} /></div>
        <div className="space-y-1">
          {scoreItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={item.value > 0 ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>{item.value > 0 ? `+${item.value}` : '0'}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* New Activity Form */}
      {newActivity && (
        <Card className="p-3 border-dashed">
          <p className="text-xs font-semibold mb-2">{t('crm.newActivity')}</p>
          <div className="flex gap-2">
            <Select value={actType} onValueChange={setActType}><SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="poziv">📞 {t('crm.typeCall')}</SelectItem><SelectItem value="sastanak">🤝 {t('crm.typeMeeting')}</SelectItem><SelectItem value="email">✉️ {t('crm.typeEmail')}</SelectItem><SelectItem value="task">✅ {t('crm.typeTask')}</SelectItem><SelectItem value="napomena">📝 {t('crm.typeNote')}</SelectItem>
            </SelectContent></Select>
            <Input className="h-8 text-xs flex-1" placeholder={t('crm.activityTitle')} value={actTitle} onChange={(e) => setActTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addActivity()} />
            <Button size="sm" className="h-8 text-xs" onClick={addActivity}>{t('common.save')}</Button>
          </div>
        </Card>
      )}

      {/* Activity Timeline */}
      <div>
        <p className="text-xs font-semibold mb-2">{t('crm.activityTimeline')} ({activities.length})</p>
        {activities.length === 0 ? <p className="text-[10px] text-muted-foreground">{t('crm.noActivities')}</p> : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map((act: CrmActivity) => {
              const icons: Record<string, string> = { poziv: '📞', sastanak: '🤝', email: '✉️', task: '✅', napomena: '📝' }
              return (
                <div key={act.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${act.completed ? 'opacity-50' : 'bg-slate-50'}`}>
                  <span>{icons[act.type] || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tc(act.title)}</p>
                    <p className="text-[9px] text-muted-foreground">{act.createdAt ? formatDate(act.createdAt) : ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      {deal.notes && <Card className="p-3"><p className="text-[10px] text-muted-foreground">{t('common.notes')}</p><p className="text-xs mt-1">{deal.notes}</p></Card>}
    </div>
  )
}

// ==================== FORECAST TAB ====================
function ForecastTab() {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/deals').then((r) => r.json()).then((d: Deal[]) => { setDeals(d); setLoading(false) }) }, [])

  const forecast = useMemo(() => {
    const months: { label: string; expected: number; won: number; count: number }[] = []
    const now = new Date()
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0)
      const monthDeals = deals.filter((d: Deal) => {
        if (!d.closeDate) return false
        const cd = new Date(d.closeDate)
        return cd >= monthDate && cd <= monthEnd
      })
      const monthLabel = t(`common.month_${monthDate.getMonth() + 1}`)
      const expected = monthDeals.filter((d: Deal) => d.stage !== 'lost').reduce((s: number, d: Deal) => s + d.value * d.probability / 100, 0)
      const won = monthDeals.filter((d: Deal) => d.stage === 'won').reduce((s: number, d: Deal) => s + d.value, 0)
      months.push({ label: monthLabel, expected, won, count: monthDeals.length })
    }
    return months
  }, [deals, t])

  const completedDeals = deals.filter((d: Deal) => ['won', 'lost'].includes(d.stage))
  const wonDeals = deals.filter((d: Deal) => d.stage === 'won')
  const winRate = completedDeals.length > 0 ? Math.round((wonDeals.length / completedDeals.length) * 100) : 0
  const avgDealSize = wonDeals.length > 0 ? wonDeals.reduce((s: number, d: Deal) => s + d.value, 0) / wonDeals.length : 0
  const topDeals = [...deals].filter((d: Deal) => !['won', 'lost'].includes(d.stage)).sort((a: Deal, b: Deal) => (b.value * b.probability) - (a.value * a.probability)).slice(0, 5)
  const maxForecast = Math.max(...forecast.map((m) => m.expected), 1)

  if (loading) return (<div className="space-y-3">{Array.from({ length: 4 }).map((_, i: number) => <Skeleton key={i} className="h-32 w-full" />)}</div>)

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-emerald-500" /><p className="text-[10px] text-muted-foreground">{t('crm.winRate')}</p></div><p className="text-2xl font-bold mt-1">{winRate}%</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /><p className="text-[10px] text-muted-foreground">{t('crm.avgDealSize')}</p></div><p className="text-2xl font-bold mt-1">{formatRSD(avgDealSize)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-500" /><p className="text-[10px] text-muted-foreground">{t('crm.expectedRevenue')}</p></div><p className="text-2xl font-bold mt-1">{formatRSD(forecast.reduce((s, m) => s + m.expected, 0))}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-500" /><p className="text-[10px] text-muted-foreground">{t('crm.activeDeals')}</p></div><p className="text-2xl font-bold mt-1">{deals.filter((d: Deal) => !['won', 'lost'].includes(d.stage)).length}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Forecast Chart */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('crm.monthlyForecast')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecast.map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="font-medium">{m.label}</span><span>{formatRSD(m.expected)}</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-3"><div className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" style={{ width: `${Math.min((m.expected / maxForecast) * 100, 100)}%` }} /></div>
                  <div className="flex gap-4 text-[9px] text-muted-foreground"><span>{t('crm.deals')}: {m.count}</span><span>{t('crm.won')}: {formatRSD(m.won)}</span></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deals by Stage */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('crm.dealsByStage')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STAGES.filter((s: string) => s !== 'won' && s !== 'lost').map((stage: string) => {
                const stageDeals = deals.filter((d: Deal) => d.stage === stage)
                const total = stageDeals.reduce((s: number, d: Deal) => s + d.value, 0)
                const maxVal = Math.max(...STAGES.filter((s: string) => s !== 'won' && s !== 'lost').map((s) => deals.filter((d: Deal) => d.stage === s).reduce((sum: number, d: Deal) => sum + d.value, 0)), 1)
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium">{STAGE_LABELS[stage]}</span><span>{formatRSD(total)} ({stageDeals.length})</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${STAGE_DOT[stage]}`} style={{ width: `${Math.min((total / maxVal) * 100, 100)}%` }} /></div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Deals */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('crm.topDeals')}</CardTitle></CardHeader>
          <CardContent>
            {topDeals.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">{t('crm.noDealsFound')}</p> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">{t('crm.deal')}</TableHead>
                  <TableHead className="text-xs">{t('crm.dealStage')}</TableHead>
                  <TableHead className="text-xs">{t('crm.dealValue')}</TableHead>
                  <TableHead className="text-xs">{t('crm.expectedValue')}</TableHead>
                  <TableHead className="text-xs">{t('crm.score')}</TableHead>
                  <TableHead className="text-xs">{t('crm.closeDate')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {topDeals.map((d: Deal) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs font-medium">{tc(d.title)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{STAGE_LABELS[d.stage]}</Badge></TableCell>
                      <TableCell className="text-xs">{formatRSD(d.value)}</TableCell>
                      <TableCell className="text-xs text-purple-700 font-medium">{formatRSD(d.value * d.probability / 100)}</TableCell>
                      <TableCell><span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${scoreColor(d.score)}`}>{d.score}</span></TableCell>
                      <TableCell className="text-xs">{d.closeDate ? formatDate(d.closeDate) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== KONTAKTI TAB ====================
function KontaktiTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/contacts?${params}`)
    setContacts(await res.json())
    setLoading(false)
  }, [search])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  useEffect(() => {
    if (contacts.length > 0) {
      const texts: string[] = []
      contacts.forEach((c: Contact) => { if (c.firstName) texts.push(c.firstName); if (c.lastName) texts.push(c.lastName); if (c.company) texts.push(c.company) })
      translateTexts(texts)
    }
  }, [contacts, translateTexts])

  const handleNew = (): void => { setEditing(null); setViewMode('form') }
  const handleEdit = (c: Contact): void => { setEditing(c); setViewMode('form') }
  const handleCancel = (): void => { setViewMode('list'); setEditing(null) }
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm(t('crm.confirmDeleteContact'))) return
    try { await fetch(`/api/contacts/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchContacts() } catch { toast.error(t('common.error')) }
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'), phone: fd.get('phone'), position: fd.get('position'), company: fd.get('company'), notes: fd.get('notes'), tags: fd.get('tags'), isLead: fd.get('isLead') === 'on', isClient: fd.get('isClient') === 'on', isSupplier: fd.get('isSupplier') === 'on' }
    try {
      const url = editing ? `/api/contacts/${editing.id}` : '/api/contacts'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created')); setViewMode('list'); setEditing(null); fetchContacts()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('crm.contact')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-base font-semibold">{t('crm.contacts')}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{contacts.length} {t('crm.contactsCount')}</p></div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('crm.newContact')}</Button>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="relative max-w-sm mt-4"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder={t('crm.searchContacts')} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('crm.firstName')} *</Label><Input name="firstName" defaultValue={editing?.firstName || ''} required /></div>
              <div className="space-y-2"><Label className="text-xs">{t('crm.lastName')} *</Label><Input name="lastName" defaultValue={editing?.lastName || ''} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('common.email')}</Label><Input name="email" type="email" defaultValue={editing?.email || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('crm.phone')}</Label><Input name="phone" defaultValue={editing?.phone || ''} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('crm.position')}</Label><Input name="position" defaultValue={editing?.position || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('crm.company')}</Label><Input name="company" defaultValue={editing?.company || ''} /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">{t('crm.tags')}</Label><Input name="tags" placeholder="vip, IT, konsalting" defaultValue={editing?.tags || ''} /></div>
            <div className="space-y-2"><Label className="text-xs">{t('common.notes')}</Label><Input name="notes" defaultValue={editing?.notes || ''} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isLead" defaultChecked={editing?.isLead ?? true} /> {t('crm.lead')}</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isClient" defaultChecked={editing?.isClient ?? false} /> {t('crm.client')}</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isSupplier" defaultChecked={editing?.isSupplier ?? false} /> {t('crm.supplier')}</label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i: number) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('common.name')}</TableHead><TableHead className="text-xs">{t('crm.company')}</TableHead><TableHead className="text-xs">{t('common.type')}</TableHead><TableHead className="text-xs">{t('crm.phone')}</TableHead><TableHead className="text-xs">{t('common.email')}</TableHead><TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {contacts.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">{t('crm.noContacts')}</TableCell></TableRow> : contacts.map((c: Contact) => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs font-medium">{tc(c.firstName)} {tc(c.lastName)}</TableCell>
                  <TableCell className="text-xs">{tc(c.company || '') || '-'}</TableCell>
                  <TableCell><div className="flex gap-1 flex-wrap">{c.isLead && <Badge variant="outline" className="text-[10px] bg-amber-50 border-amber-200">{t('crm.lead')}</Badge>}{c.isClient && <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-200">{t('crm.client')}</Badge>}{c.isSupplier && <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-200">{t('crm.supplier')}</Badge>}</div></TableCell>
                  <TableCell className="text-xs">{c.phone || '-'}</TableCell>
                  <TableCell className="text-xs">{c.email || '-'}</TableCell>
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== AKTIVNOSTI TAB ====================
function AktivnostiTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/crm-activities?completed=false')
    setActivities(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  useEffect(() => {
    if (activities.length > 0) {
      const texts: string[] = []
      activities.forEach((a: CrmActivity) => { if (a.title) texts.push(a.title); if (a.contact) { texts.push(a.contact.firstName, a.contact.lastName) } })
      translateTexts(texts)
    }
  }, [activities, translateTexts])

  const handleNew = (): void => { setViewMode('form') }
  const handleCancel = (): void => { setViewMode('list') }
  const toggleComplete = async (id: string, completed: boolean): Promise<void> => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) }); fetchActivities() } catch { toast.error(t('common.error')) }
  }
  const handleDelete = async (id: string): Promise<void> => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'DELETE' }); fetchActivities() } catch { toast.error(t('common.error')) }
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { type: fd.get('type'), title: fd.get('title'), description: fd.get('description'), dueDate: fd.get('dueDate') }
    try {
      const res = await fetch('/api/crm-activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('common.created')); setViewMode('list'); fetchActivities()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const typeIcons: Record<string, string> = { poziv: '📞', sastanak: '🤝', email: '✉️', task: '✅', napomena: '📝' }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{t('crm.newActivity')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-base font-semibold">{t('crm.activities')}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{activities.filter((a: CrmActivity) => !a.completed).length} {t('crm.activeCount')}</p></div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('crm.newActivity')}</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('common.type')}</Label>
                <Select name="type" defaultValue="napomena"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="poziv">📞 {t('crm.typeCall')}</SelectItem><SelectItem value="sastanak">🤝 {t('crm.typeMeeting')}</SelectItem><SelectItem value="email">✉️ {t('crm.typeEmail')}</SelectItem><SelectItem value="task">✅ {t('crm.typeTask')}</SelectItem><SelectItem value="napomena">📝 {t('crm.typeNote')}</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">{t('crm.dueDate')}</Label><Input name="dueDate" type="date" /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">{t('crm.activityTitle')} *</Label><Input name="title" required /></div>
            <div className="space-y-2"><Label className="text-xs">{t('common.description')}</Label><Input name="description" /></div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.create')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i: number) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('common.type')}</TableHead><TableHead className="text-xs">{t('common.name')}</TableHead><TableHead className="text-xs">{t('crm.contact')}</TableHead><TableHead className="text-xs">{t('crm.dueDate')}</TableHead><TableHead className="text-xs">{t('common.status')}</TableHead><TableHead className="text-xs w-[60px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {activities.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">{t('crm.noActivities')}</TableCell></TableRow> : activities.map((a: CrmActivity) => (
                <TableRow key={a.id} className={a.completed ? 'opacity-50' : ''}>
                  <TableCell className="text-xs">{typeIcons[a.type] || '📝'}</TableCell>
                  <TableCell className="text-xs font-medium">{tc(a.title)}</TableCell>
                  <TableCell className="text-xs">{a.contact ? `${tc(a.contact.firstName)} ${tc(a.contact.lastName)}` : '-'}</TableCell>
                  <TableCell className="text-xs">{a.dueDate ? formatDate(a.dueDate) : '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={() => toggleComplete(a.id, a.completed)}>
                      {a.completed ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
                      <span className="text-[10px]">{a.completed ? t('common.completed') : t('common.active')}</span>
                    </Button>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(a.id)}><XCircle className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
