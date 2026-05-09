'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Plus, Search, Pencil, Trash2, HeartHandshake, Phone, Mail, Building2, CheckCircle2, Clock, XCircle,
  ArrowLeft, TrendingUp, BarChart3, Target, AlertTriangle, RefreshCw, X, Activity, Calendar,
  ChevronRight, MessageSquare, User, Users, Filter, Tag, Globe, Megaphone, Handshake, Briefcase,
  CircleDot, CircleCheck, CircleX, Settings2
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { formatRSD, formatDate } from '@/lib/helpers'
import { AutomacijeTab } from '@/components/modules/CRMEnhanced'

// ============ INTERFACES ============

interface Contact {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; company: string | null; notes: string | null; tags: string | null
  isClient: boolean; isSupplier: boolean; isLead: boolean; createdAt: string
  partner?: { id: string; name: string } | null
  _count?: { activities: number; deals: number }
}

interface Partner {
  id: string; name: string; pib: string | null; type: string
}

interface Deal {
  id: string; title: string; value: number; stage: string; probability: number
  score: number; lostReason: string | null; source: string; tags: string | null
  expectedRevenue: number
  assignedTo: string | null; closeDate: string | null; notes: string | null; createdAt: string
  contact?: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null } | null
  partner?: { id: string; name: string } | null
  _count?: { activities: number }
}

interface CrmActivity {
  id: string; type: string; title: string; description: string | null
  dueDate: string | null; completed: boolean; createdAt: string
  contact?: { id: string; firstName: string; lastName: string } | null
  deal?: { id: string; title: string; stage: string } | null
}

// ============ CONSTANTS ============

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
const STAGE_BADGE: Record<string, string> = {
  lead: 'bg-slate-100 text-slate-700', kvalifikacija: 'bg-blue-100 text-blue-700',
  predlog: 'bg-amber-100 text-amber-700', pregovaranje: 'bg-orange-100 text-orange-700',
  won: 'bg-emerald-100 text-emerald-700', lost: 'bg-red-100 text-red-700'
}

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manuelno', web: 'Web sajt', referral: 'Preporuka', cold_call: 'Hladni poziv',
  email: 'Email kampanja', social: 'Društvene mreže', trade_show: 'Sajam', advertising: 'Reklama', other: 'Ostalo'
}
const SOURCE_ICONS: Record<string, string> = {
  manual: '✍️', web: '🌐', referral: '🤝', cold_call: '📞',
  email: '✉️', social: '📱', trade_show: '🎪', advertising: '📢', other: '❓'
}

const ACTIVITY_TYPES: Record<string, { icon: string; label: string }> = {
  poziv: { icon: '📞', label: 'Poziv' },
  sastanak: { icon: '🤝', label: 'Sastanak' },
  email: { icon: '✉️', label: 'Email' },
  task: { icon: '✅', label: 'Zadatak' },
  napomena: { icon: '📝', label: 'Napomena' },
  demo: { icon: '🖥️', label: 'Demo' },
  predlog: { icon: '📋', label: 'Predlog' },
  follow_up: { icon: '🔄', label: 'Follow-up' },
}

// ============ HELPERS ============

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

function avatarColor(name: string): string {
  const colors = ['bg-primary/10 text-primary', 'bg-emerald-500/10 text-emerald-600', 'bg-amber-500/10 text-amber-600', 'bg-rose-500/10 text-rose-600', 'bg-sky-500/10 text-sky-600', 'bg-violet-500/10 text-violet-600']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try { return JSON.parse(tags) } catch { return [] }
}

// ============ MAIN COMPONENT ============

export function CRM() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('crm.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('crm.subtitle')}</p>
        </div>
      </div>
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pipeline" className="gap-1.5"><HeartHandshake className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.pipeline')}</span></TabsTrigger>
          <TabsTrigger value="kontakti" className="gap-1.5"><Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.contacts')}</span></TabsTrigger>
          <TabsTrigger value="aktivnosti" className="gap-1.5"><Activity className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.activities')}</span></TabsTrigger>
          <TabsTrigger value="forecast" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.forecast')}</span></TabsTrigger>
          <TabsTrigger value="izvori" className="gap-1.5"><Megaphone className="h-3.5 w-3.5" /><span className="hidden sm:inline">Izvori</span></TabsTrigger>
          <TabsTrigger value="automacije" className="gap-1.5"><Settings2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Automacije</span></TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="kontakti"><KontaktiTab /></TabsContent>
        <TabsContent value="aktivnosti"><AktivnostiTab /></TabsContent>
        <TabsContent value="forecast"><ForecastTab /></TabsContent>
        <TabsContent value="izvori"><IzvoriTab /></TabsContent>
        <TabsContent value="automacije"><AutomacijeTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== PIPELINE (KANBAN) ====================
function PipelineTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [lostDialog, setLostDialog] = useState<{ dealId: string; reason: string } | null>(null)
  const [formSource, setFormSource] = useState('manual')
  const [formContactId, setFormContactId] = useState('')
  const [formPartnerId, setFormPartnerId] = useState('')
  const [formTags, setFormTags] = useState('')

  const fetchDeals = useCallback(async (): Promise<void> => {
    setLoading(true)
    const [dealsRes, contactsRes, partnersRes] = await Promise.all([
      fetch('/api/deals'), fetch('/api/contacts'), fetch('/api/partners')
    ])
    setDeals(await dealsRes.json())
    setContacts(await contactsRes.json())
    setPartners(await partnersRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  useEffect(() => {
    if (deals.length > 0) {
      const texts: string[] = []
      deals.forEach((d: Deal) => {
        if (d.title) texts.push(d.title)
        if (d.contact) { texts.push(d.contact.firstName, d.contact.lastName) }
      })
      translateTexts(texts)
    }
  }, [deals, translateTexts])

  const filteredDeals = useMemo(() => {
    let result = [...deals]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d: Deal) =>
        d.title.toLowerCase().includes(q) ||
        (d.contact && `${d.contact.firstName} ${d.contact.lastName}`.toLowerCase().includes(q)) ||
        (d.partner && d.partner.name.toLowerCase().includes(q))
      )
    }
    if (filterStage !== 'all') result = result.filter((d: Deal) => d.stage === filterStage)
    if (filterSource !== 'all') result = result.filter((d: Deal) => d.source === filterSource)
    switch (sortBy) {
      case 'value_desc': result.sort((a: Deal, b: Deal) => b.value - a.value); break
      case 'score_desc': result.sort((a: Deal, b: Deal) => b.score - a.score); break
      case 'probability_desc': result.sort((a: Deal, b: Deal) => b.probability - a.probability); break
      case 'closeDate_asc': result.sort((a: Deal, b: Deal) => (a.closeDate || '').localeCompare(b.closeDate || '')); break
      default: result.sort((a: Deal, b: Deal) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return result
  }, [deals, search, filterStage, filterSource, sortBy])

  const moveDeal = async (dealId: string, newStage: string): Promise<void> => {
    if (newStage === 'lost') { setLostDialog({ dealId, reason: '' }); return }
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
      setLostDialog(null); fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm(t('crm.confirmDeleteDeal'))) return
    try { await fetch(`/api/deals/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchDeals() } catch { toast.error(t('common.error')) }
  }

  const handleNew = (): void => {
    setEditingDeal(null)
    setFormContactId(''); setFormPartnerId(''); setFormSource('manual'); setFormTags('')
    setViewMode('form')
  }
  const handleEdit = (deal: Deal): void => {
    setEditingDeal(deal)
    setFormContactId(deal.contact?.id || '')
    setFormPartnerId(deal.partner?.id || '')
    setFormSource(deal.source || 'manual')
    setFormTags(parseTags(deal.tags).join(', '))
    setViewMode('form')
  }
  const handleCancel = (): void => { setViewMode('list'); setEditingDeal(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const tagsArr = formTags.split(',').map((t) => t.trim()).filter(Boolean)
    const body = {
      title: fd.get('title') as string,
      value: fd.get('value') as string,
      stage: fd.get('stage') as string,
      probability: fd.get('probability') as string,
      closeDate: fd.get('closeDate') as string,
      notes: fd.get('notes') as string,
      source: formSource,
      contactId: formContactId || null,
      partnerId: formPartnerId || null,
      tags: tagsArr.length > 0 ? JSON.stringify(tagsArr) : null,
    }
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
      return new Date(d.closeDate) <= monthEnd
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
              <div className="space-y-2">
                <Label className="text-xs">{t('crm.dealTitle')} *</Label>
                <Input name="title" defaultValue={editingDeal?.title || ''} required placeholder="npr. Implementacija ERP sistema" />
              </div>

              {/* Contact & Partner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1"><Users className="h-3 w-3" />Kontakt</Label>
                  <Select value={formContactId} onValueChange={setFormContactId}>
                    <SelectTrigger><SelectValue placeholder="Izaberi kontakt..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Bez kontakta</SelectItem>
                      {contacts.map((c: Contact) => (
                        <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.company ? ` (${c.company})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1"><Building2 className="h-3 w-3" />Kompanija</Label>
                  <Select value={formPartnerId} onValueChange={setFormPartnerId}>
                    <SelectTrigger><SelectValue placeholder="Izaberi kompaniju..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Bez kompanije</SelectItem>
                      {partners.map((p: Partner) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}{p.pib ? ` (PIB: ${p.pib})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Value, Probability, Source */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('crm.dealValue')} (RSD)</Label><Input name="value" type="number" step="0.01" defaultValue={editingDeal?.value || ''} placeholder="0.00" /></div>
                <div className="space-y-2"><Label className="text-xs">{t('crm.probability')} %</Label><Input name="probability" type="number" defaultValue={editingDeal?.probability || '10'} /></div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" />Izvor</Label>
                  <Select value={formSource} onValueChange={setFormSource}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{SOURCE_ICONS[key]} {label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stage & Close Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Stage</Label>
                  <Select name="stage" defaultValue={editingDeal?.stage || 'lead'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s: string) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">{t('crm.closeDate')}</Label><Input name="closeDate" type="date" defaultValue={editingDeal?.closeDate?.split('T')[0] || ''} /></div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" />Tagovi (odvojeno zarezom)</Label>
                <Input placeholder="npr. IT, ERP,_prioritet" value={formTags} onChange={(e) => setFormTags(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{t('common.notes')}</Label>
                <Textarea name="notes" rows={3} defaultValue={editingDeal?.notes || ''} placeholder="Dodatne napomene..." />
              </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.won')}</p><p className="text-sm font-bold text-emerald-700">{formatRSD(stats.totalWon)}</p></div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.pipeline')}</p><p className="text-sm font-bold text-blue-700">{formatRSD(stats.pipelineValue)}</p></div>
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.weightedPipeline')}</p><p className="text-sm font-bold text-purple-700">{formatRSD(stats.weightedPipeline)}</p></div>
            <div className="rounded-lg bg-sky-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.avgProbability')}</p><p className="text-sm font-bold text-sky-700">{stats.avgProbability}%</p></div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.activeDeals')}</p><p className="text-sm font-bold">{stats.activeCount}</p></div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.closingThisMonth')}</p><p className="text-sm font-bold text-amber-700">{stats.closingThisMonth}</p></div>
            <div className="rounded-lg bg-red-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">{t('crm.atRisk')}</p><p className="text-sm font-bold text-red-700">{stats.atRisk > 0 ? stats.atRisk : '✓'}</p></div>
            <div className="rounded-lg bg-teal-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">Win Rate</p><p className="text-sm font-bold text-teal-700">{stats.winRate}%</p></div>
          </div>

          {/* Filters + Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder={t('crm.searchDeals')} className="pl-8 h-8 w-48 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <Select value={filterStage} onValueChange={setFilterStage}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t('crm.allStages')}</SelectItem>{STAGES.map((s: string) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent></Select>
              <Select value={filterSource} onValueChange={setFilterSource}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi izvori</SelectItem>{Object.entries(SOURCE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{SOURCE_ICONS[k]} {v}</SelectItem>)}</SelectContent></Select>
              <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="created_desc">Najnoviji</SelectItem><SelectItem value="value_desc">Vrednost ↓</SelectItem><SelectItem value="score_desc">Score ↓</SelectItem><SelectItem value="probability_desc">Verovatnoća ↓</SelectItem><SelectItem value="closeDate_asc">Datum zatv. ↑</SelectItem>
              </SelectContent></Select>
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} /><h3 className="text-xs font-bold">{STAGE_LABELS[stage]}</h3></div>
                      <Badge variant="secondary" className="text-xs">{stageDeals.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{formatRSD(stageTotal)}</p>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                      {stageDeals.map((deal: Deal) => {
                        const days = daysUntil(deal.closeDate)
                        const expected = deal.value * deal.probability / 100
                        const isOverdue = days !== null && days < 0 && !['won', 'lost'].includes(deal.stage)
                        const tags = parseTags(deal.tags)
                        return (
                          <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow border" onClick={() => setSelectedDeal(deal)}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                {/* Title + Source */}
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-xs">{SOURCE_ICONS[deal.source] || '✍️'}</span>
                                  <span className="text-xs font-medium truncate">{tc(deal.title)}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full border ${scoreColor(deal.score)}`}>{deal.score}</span>
                                </div>
                                {/* Value */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground/80">{formatRSD(deal.value)}</span>
                                  <span>~{formatRSD(expected)}</span>
                                </div>
                                {/* Contact */}
                                <div className="flex items-center gap-2 mt-1.5">
                                  {deal.contact && (
                                    <div className="flex items-center gap-1">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(deal.contact.firstName + deal.contact.lastName)}`}>{initials(deal.contact.firstName, deal.contact.lastName)}</div>
                                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">{tc(`${deal.contact.firstName} ${deal.contact.lastName}`)}</span>
                                    </div>
                                  )}
                                  {deal.partner && !deal.contact && (
                                    <div className="flex items-center gap-1">
                                      <Building2 className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground truncate max-w-[90px]">{deal.partner.name}</span>
                                    </div>
                                  )}
                                  {deal._count && deal._count.activities > 0 && (
                                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Activity className="h-2.5 w-2.5" />{deal._count.activities}</span>
                                  )}
                                </div>
                                {/* Tags */}
                                {tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {tags.slice(0, 3).map((tag: string) => (
                                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">{tag}</Badge>
                                    ))}
                                    {tags.length > 3 && <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>}
                                  </div>
                                )}
                                {/* Overdue / Days left */}
                                {isOverdue && <p className="text-xs text-red-500 font-bold mt-1">{t('crm.overdue')}</p>}
                                {!isOverdue && days !== null && days <= 7 && days >= 0 && <p className="text-xs text-amber-600 mt-1">{days} {t('crm.daysLeft')}</p>}
                                {deal.lostReason && <p className="text-xs text-red-400 mt-1 italic">{deal.lostReason}</p>}
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
                      {stageDeals.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{t('crm.noDealsFound')}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Deal Detail Dialog */}
          <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              {selectedDeal && <DealDetail deal={selectedDeal} contacts={contacts} partners={partners} onClose={() => setSelectedDeal(null)} onEdit={() => { const d = selectedDeal; setSelectedDeal(null); handleEdit(d) }} onDelete={() => { setSelectedDeal(null); handleDelete(selectedDeal.id) }} onMove={(stage) => { setSelectedDeal(null); moveDeal(selectedDeal.id, stage) }} onRefresh={fetchDeals} />}
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
function DealDetail({ deal, contacts, partners, onClose, onEdit, onDelete, onMove, onRefresh }: {
  deal: Deal; contacts: Contact[]; partners: Partner[]; onClose: () => void; onEdit: () => void; onDelete: () => void; onMove: (stage: string) => void; onRefresh: () => void
}) {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [newActivity, setNewActivity] = useState(false)
  const [actTitle, setActTitle] = useState('')
  const [actType, setActType] = useState('napomena')
  const [actDueDate, setActDueDate] = useState('')
  const [actDescription, setActDescription] = useState('')

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
        body: JSON.stringify({ type: actType, title: actTitle, dealId: deal.id, description: actDescription, dueDate: actDueDate || null })
      })
      setActTitle(''); setActDescription(''); setActDueDate(''); setNewActivity(false)
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
      onRefresh(); toast.success(t('common.created'))
    } catch { toast.error(t('common.error')) }
  }

  const toggleActivity = async (actId: string, completed: boolean): Promise<void> => {
    try {
      await fetch(`/api/crm-activities/${actId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) })
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
    } catch { toast.error(t('common.error')) }
  }

  const deleteActivity = async (actId: string): Promise<void> => {
    try {
      await fetch(`/api/crm-activities/${actId}`, { method: 'DELETE' })
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
    } catch { toast.error(t('common.error')) }
  }

  const days = daysUntil(deal.closeDate)
  const isOverdue = days !== null && days < 0 && !['won', 'lost'].includes(deal.stage)
  const expected = deal.value * deal.probability / 100
  const tags = parseTags(deal.tags)

  const scoreItems = [
    { label: t('crm.scoreContact'), value: deal.contact ? 15 : 0 },
    { label: 'Kompanija', value: deal.partner ? 15 : 0 },
    { label: t('crm.scoreValue'), value: deal.value > 0 ? 15 : 0 },
    { label: t('crm.scoreDate'), value: deal.closeDate ? 10 : 0 },
    { label: 'Verovatnoća >50%', value: deal.probability > 50 ? 10 : 0 },
    { label: 'Verovatnoća >80%', value: deal.probability > 80 ? 10 : 0 },
    { label: t('crm.scoreNotes'), value: deal.notes && deal.notes.trim().length > 0 ? 5 : 0 },
    { label: 'Izvor (ne-manual)', value: deal.source && deal.source !== 'manual' ? 10 : 0 },
    { label: 'Vrednost >100K', value: deal.value > 100000 ? 10 : 0 },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">{tc(deal.title)}</h2>
            <span className="text-sm">{SOURCE_ICONS[deal.source] || ''}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={STAGE_BADGE[deal.stage]}>{STAGE_LABELS[deal.stage]}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreColor(deal.score)}`}>{t('crm.score')}: {deal.score}</span>
            {deal.source !== 'manual' && <Badge variant="secondary" className="text-xs">{SOURCE_ICONS[deal.source]} {SOURCE_LABELS[deal.source]}</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="text-xs" onClick={onEdit}><Pencil className="h-3 w-3 mr-1" />{t('common.edit')}</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onMove('won')} disabled={deal.stage === 'won'}><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />{t('crm.won')}</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onMove('lost')} disabled={deal.stage === 'lost'}><XCircle className="h-3 w-3 mr-1 text-red-500" />{t('crm.lost')}</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => setNewActivity(!newActivity)}><Plus className="h-3 w-3 mr-1" />Aktivnost</Button>
        <Button size="sm" variant="outline" className="text-xs text-red-500" onClick={onDelete}><Trash2 className="h-3 w-3 mr-1" />{t('common.delete')}</Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">{t('crm.dealValue')}</p><p className="text-sm font-bold">{formatRSD(deal.value)}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">{t('crm.expectedValue')}</p><p className="text-sm font-bold text-purple-700">{formatRSD(expected)}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">{t('crm.probability')}</p><p className="text-sm font-bold">{deal.probability}%</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">{t('crm.closeDate')}</p>
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
            <p className="text-xs text-muted-foreground">{t('crm.contact')}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(deal.contact.firstName + deal.contact.lastName)}`}>{initials(deal.contact.firstName, deal.contact.lastName)}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{tc(`${deal.contact.firstName} ${deal.contact.lastName}`)}</p>
                {deal.contact.email && <p className="text-xs text-muted-foreground truncate">{deal.contact.email}</p>}
              </div>
            </div>
          </Card>
        )}
        {deal.partner && (
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">{t('crm.company')}</p>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium truncate">{deal.partner.name}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs gap-1"><Tag className="h-2.5 w-2.5" />{tag}</Badge>
          ))}
        </div>
      )}

      {/* Lost Reason */}
      {deal.lostReason && (
        <Card className="p-3 border-red-200 bg-red-50"><p className="text-xs text-muted-foreground">{t('crm.lostReason')}</p><p className="text-xs text-red-700 mt-1">{deal.lostReason}</p></Card>
      )}

      {/* Score Breakdown */}
      <Card className="p-3">
        <p className="text-xs font-semibold mb-2">{t('crm.scoreDetails')} ({deal.score}/100)</p>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2"><div className={`h-2 rounded-full ${deal.score >= 67 ? 'bg-emerald-500' : deal.score >= 34 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${deal.score}%` }} /></div>
        <div className="space-y-1">
          {scoreItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={item.value > 0 ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>{item.value > 0 ? `+${item.value}` : '0'}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* New Activity Form */}
      {newActivity && (
        <Card className="p-3 border-dashed border-primary/30">
          <p className="text-xs font-semibold mb-2">{t('crm.newActivity')}</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={actType} onValueChange={setActType}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>
                {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                ))}
              </SelectContent></Select>
              <Input className="h-8 text-xs flex-1" placeholder={t('crm.activityTitle')} value={actTitle} onChange={(e) => setActTitle(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Input type="datetime-local" className="h-8 text-xs" value={actDueDate} onChange={(e) => setActDueDate(e.target.value)} />
              <Button size="sm" className="h-8 text-xs" onClick={addActivity}>{t('common.save')}</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setNewActivity(false)}>{t('common.cancel')}</Button>
            </div>
            <Textarea className="text-xs" rows={2} placeholder="Opis (opciono)..." value={actDescription} onChange={(e) => setActDescription(e.target.value)} />
          </div>
        </Card>
      )}

      {/* Activity Timeline */}
      <div>
        <p className="text-xs font-semibold mb-2">{t('crm.activityTimeline')} ({activities.length})</p>
        {activities.length === 0 ? <p className="text-xs text-muted-foreground">{t('crm.noActivities')}</p> : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {activities.map((act: CrmActivity) => {
              const typeInfo = ACTIVITY_TYPES[act.type] || { icon: '📝', label: act.type }
              const actDays = daysUntil(act.dueDate)
              const isActOverdue = actDays !== null && actDays < 0 && !act.completed
              return (
                <div key={act.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs border transition-colors ${act.completed ? 'bg-slate-50 opacity-60 border-slate-200' : 'bg-white border-slate-200 hover:border-primary/30'}`}>
                  <button className="mt-0.5 flex-shrink-0" onClick={() => toggleActivity(act.id, act.completed)}>
                    {act.completed ? <CircleCheck className="h-4 w-4 text-emerald-500" /> : <CircleDot className="h-4 w-4 text-muted-foreground hover:text-primary" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span>{typeInfo.icon}</span>
                      <p className={`font-medium truncate ${act.completed ? 'line-through' : ''}`}>{tc(act.title)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{formatDate(act.createdAt)}</span>
                      {act.dueDate && (
                        <>
                          <span>·</span>
                          <span className={isActOverdue ? 'text-red-500 font-medium' : ''}>📅 {formatDate(act.dueDate)}{actDays !== null && actDays >= 0 && actDays <= 3 && ` (${actDays}d)`}</span>
                        </>
                      )}
                      {act.deal && <span>· {STAGE_LABELS[act.deal.stage]}</span>}
                    </div>
                    {act.description && <p className="text-xs text-muted-foreground mt-1">{act.description}</p>}
                  </div>
                  <button className="flex-shrink-0 text-muted-foreground hover:text-red-500" onClick={() => deleteActivity(act.id)}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      {deal.notes && <Card className="p-3"><p className="text-xs text-muted-foreground">{t('common.notes')}</p><p className="text-xs mt-1 whitespace-pre-wrap">{deal.notes}</p></Card>}
    </div>
  )
}

// ==================== FORECAST TAB ====================
function ForecastTab() {
  const { t } = useTranslation()
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-emerald-500" /><p className="text-xs text-muted-foreground">{t('crm.winRate')}</p></div><p className="text-2xl font-bold mt-1">{winRate}%</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /><p className="text-xs text-muted-foreground">{t('crm.avgDealSize')}</p></div><p className="text-2xl font-bold mt-1">{formatRSD(avgDealSize)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-500" /><p className="text-xs text-muted-foreground">{t('crm.expectedRevenue')}</p></div><p className="text-2xl font-bold mt-1">{formatRSD(forecast.reduce((s, m) => s + m.expected, 0))}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-500" /><p className="text-xs text-muted-foreground">{t('crm.activeDeals')}</p></div><p className="text-2xl font-bold mt-1">{deals.filter((d: Deal) => !['won', 'lost'].includes(d.stage)).length}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('crm.monthlyForecast')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecast.map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="font-medium">{m.label}</span><span>{formatRSD(m.expected)}</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-3"><div className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" style={{ width: `${Math.min((m.expected / maxForecast) * 100, 100)}%` }} /></div>
                  <div className="flex gap-4 text-xs text-muted-foreground"><span>{t('crm.deals')}: {m.count}</span><span>{t('crm.won')}: {formatRSD(m.won)}</span></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('crm.topDeals')}</CardTitle></CardHeader>
          <CardContent>
            {topDeals.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">{t('crm.noDealsFound')}</p> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">{t('crm.deal')}</TableHead>
                    <TableHead className="text-xs">Izvor</TableHead>
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
                        <TableCell className="text-xs">{SOURCE_ICONS[d.source]} {SOURCE_LABELS[d.source]}</TableCell>
                        <TableCell className="text-xs"><Badge variant="outline" className={STAGE_BADGE[d.stage]}>{STAGE_LABELS[d.stage]}</Badge></TableCell>
                        <TableCell className="text-xs font-semibold">{formatRSD(d.value)}</TableCell>
                        <TableCell className="text-xs text-purple-700">{formatRSD(d.value * d.probability / 100)}</TableCell>
                        <TableCell className="text-xs"><Badge variant="outline" className={scoreColor(d.score)}>{d.score}</Badge></TableCell>
                        <TableCell className="text-xs">{d.closeDate ? formatDate(d.closeDate) : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
  const { tc } = useContentTranslation()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<Contact | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])

  const fetchContacts = useCallback(async (): Promise<void> => {
    setLoading(true)
    const [cRes, pRes] = await Promise.all([fetch('/api/contacts'), fetch('/api/partners')])
    setContacts(await cRes.json())
    setPartners(await pRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const filtered = useMemo(() => {
    let result = [...contacts]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c: Contact) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q))
    }
    if (filterType === 'lead') result = result.filter((c: Contact) => c.isLead && !c.isClient)
    if (filterType === 'client') result = result.filter((c: Contact) => c.isClient)
    if (filterType === 'supplier') result = result.filter((c: Contact) => c.isSupplier)
    return result
  }, [contacts, search, filterType])

  const handleNew = (): void => { setEditing(null); setViewMode('form') }
  const handleEdit = (c: Contact): void => { setEditing(c); setViewMode('form') }
  const handleCancel = (): void => { setViewMode('list'); setEditing(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      firstName: fd.get('firstName') as string, lastName: fd.get('lastName') as string,
      email: fd.get('email') as string, phone: fd.get('phone') as string,
      position: fd.get('position') as string, company: fd.get('company') as string,
      partnerId: fd.get('partnerId') as string || null, notes: fd.get('notes') as string,
      tags: fd.get('tags') as string, isLead: fd.get('isLead') === 'on',
      isClient: fd.get('isClient') === 'on', isSupplier: fd.get('isSupplier') === 'on',
    }
    try {
      const url = editing ? `/api/contacts/${editing.id}` : '/api/contacts'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created'))
      setViewMode('list'); setEditing(null); fetchContacts()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Obrisati kontakt?')) return
    try { await fetch(`/api/contacts/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchContacts() } catch { toast.error(t('common.error')) }
  }

  const convertToClient = async (contact: Contact): Promise<void> => {
    try {
      await fetch(`/api/contacts/${contact.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isClient: true, isLead: false }) })
      toast.success('Kontakt pretvoren u klijenta')
      fetchContacts()
    } catch { toast.error(t('common.error')) }
  }

  if (viewMode === 'form') return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
          <CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} Kontakt</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs">Ime *</Label><Input name="firstName" defaultValue={editing?.firstName || ''} required /></div>
            <div className="space-y-2"><Label className="text-xs">Prezime *</Label><Input name="lastName" defaultValue={editing?.lastName || ''} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />Email</Label><Input name="email" type="email" defaultValue={editing?.email || ''} /></div>
            <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />Telefon</Label><Input name="phone" defaultValue={editing?.phone || ''} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs">Pozicija</Label><Input name="position" defaultValue={editing?.position || ''} /></div>
            <div className="space-y-2"><Label className="text-xs">Kompanija</Label><Input name="company" defaultValue={editing?.company || ''} /></div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1"><Building2 className="h-3 w-3" />Partner</Label>
            <Select name="partnerId" defaultValue={editing?.partnerId || '__none'}>
              <SelectTrigger><SelectValue placeholder="Izaberi partnera..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Bez partnera</SelectItem>
                {partners.map((p: Partner) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs"><Checkbox name="isLead" defaultChecked={editing?.isLead ?? true} /><Users className="h-3 w-3" />Lead</label>
            <label className="flex items-center gap-2 text-xs"><Checkbox name="isClient" defaultChecked={editing?.isClient ?? false} /><User className="h-3 w-3" />Klijent</label>
            <label className="flex items-center gap-2 text-xs"><Checkbox name="isSupplier" defaultChecked={editing?.isSupplier ?? false} /><Briefcase className="h-3 w-3" />Dobavljač</label>
          </div>
          <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" />Tagovi (zarez)</Label><Input name="tags" defaultValue={editing?.tags || ''} placeholder="npr. IT, menadžer" /></div>
          <div className="space-y-2"><Label className="text-xs">Napomene</Label><Textarea name="notes" rows={2} defaultValue={editing?.notes || ''} /></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraži kontakte..." className="pl-8 h-8 w-52 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="all">Svi</SelectItem><SelectItem value="lead">Leads</SelectItem><SelectItem value="client">Klijenti</SelectItem><SelectItem value="supplier">Dobavljači</SelectItem>
          </SelectContent></Select>
        </div>
        <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Novi kontakt</Button>
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Kontakt</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Telefon</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Kompanija</TableHead>
              <TableHead className="text-xs">Tip</TableHead>
              <TableHead className="text-xs">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((c: Contact) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedContact(c)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(c.firstName + c.lastName)}`}>{initials(c.firstName, c.lastName)}</div>
                      <div className="min-w-0"><p className="text-xs font-medium truncate">{tc(`${c.firstName} ${c.lastName}`)}</p>{c.position && <p className="text-xs text-muted-foreground truncate">{c.position}</p>}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">{c.email || '-'}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{c.phone || '-'}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{c.company || c.partner?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {c.isLead && <Badge variant="outline" className="text-xs bg-slate-100">Lead</Badge>}
                      {c.isClient && <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">Klijent</Badge>}
                      {c.isSupplier && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">Dobavljač</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      {c.isLead && !c.isClient && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-600" onClick={() => convertToClient(c)} title="Pretvori u klijenta"><CheckCircle2 className="h-3 w-3" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(c.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">Nema kontakata</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-md">
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${avatarColor(selectedContact.firstName + selectedContact.lastName)}`}>{initials(selectedContact.firstName, selectedContact.lastName)}</div>
                <div>
                  <h3 className="font-bold">{tc(`${selectedContact.firstName} ${selectedContact.lastName}`)}</h3>
                  {selectedContact.position && <p className="text-xs text-muted-foreground">{selectedContact.position}</p>}
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-xs">
                {selectedContact.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{selectedContact.email}</span></div>}
                {selectedContact.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{selectedContact.phone}</span></div>}
                {(selectedContact.company || selectedContact.partner?.name) && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span>{selectedContact.company || selectedContact.partner?.name}</span></div>}
                <div className="flex gap-2 mt-2">
                  {selectedContact.isLead && <Badge variant="outline" className="text-xs">Lead</Badge>}
                  {selectedContact.isClient && <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">Klijent</Badge>}
                  {selectedContact.isSupplier && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">Dobavljač</Badge>}
                </div>
                {selectedContact._count && (
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{t('crm.deals')}: {selectedContact._count.deals || 0}</span>
                    <span>{t('crm.activities')}: {selectedContact._count.activities || 0}</span>
                  </div>
                )}
                {selectedContact.notes && <div className="mt-2 p-2 rounded bg-muted/50"><p className="text-muted-foreground">{selectedContact.notes}</p></div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== AKTIVNOSTI TAB ====================
function AktivnostiTab() {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'pending' | 'done'>('pending')
  const [newAct, setNewAct] = useState(false)
  const [actTitle, setActTitle] = useState('')
  const [actType, setActType] = useState('napomena')
  const [actDueDate, setActDueDate] = useState('')
  const [actContactId, setActContactId] = useState('')
  const [actDealId, setActDealId] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const [aRes, cRes, dRes] = await Promise.all([fetch('/api/crm-activities'), fetch('/api/contacts'), fetch('/api/deals')])
      if (cancelled) return
      setActivities(await aRes.json())
      setContacts(await cRes.json())
      setDeals(await dRes.json())
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    let result = [...activities]
    if (filterType !== 'all') result = result.filter((a: CrmActivity) => a.type === filterType)
    if (filterCompleted === 'pending') result = result.filter((a: CrmActivity) => !a.completed)
    if (filterCompleted === 'done') result = result.filter((a: CrmActivity) => a.completed)
    return result
  }, [activities, filterType, filterCompleted])

  const addActivity = async (): Promise<void> => {
    if (!actTitle.trim()) return
    try {
      await fetch('/api/crm-activities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actType, title: actTitle, dueDate: actDueDate || null, contactId: actContactId || null, dealId: actDealId || null, description: '' })
      })
      setActTitle(''); setActDueDate(''); setActContactId(''); setActDealId(''); setNewAct(false)
      fetchAll(); toast.success(t('common.created'))
    } catch { toast.error(t('common.error')) }
  }

  const toggleComplete = async (id: string, completed: boolean): Promise<void> => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) }); fetchAll() } catch { toast.error(t('common.error')) }
  }

  const deleteAct = async (id: string): Promise<void> => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'DELETE' }); fetchAll(); toast.success(t('common.deleteSuccess')) } catch { toast.error(t('common.error')) }
  }

  const pendingCount = activities.filter((a: CrmActivity) => !a.completed).length
  const overdueCount = activities.filter((a: CrmActivity) => !a.completed && a.dueDate && daysUntil(a.dueDate) !== null && daysUntil(a.dueDate)! < 0).length
  const upcomingCount = activities.filter((a: CrmActivity) => !a.completed && a.dueDate && daysUntil(a.dueDate) !== null && daysUntil(a.dueDate)! >= 0 && daysUntil(a.dueDate)! <= 7).length

  if (loading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">Ukupno</p><p className="text-sm font-bold text-blue-700">{activities.length}</p></div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">Na čekanju</p><p className="text-sm font-bold text-amber-700">{pendingCount}</p></div>
        <div className="rounded-lg bg-red-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">Kasne</p><p className="text-sm font-bold text-red-700">{overdueCount}</p></div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center"><p className="text-xs text-muted-foreground">Završene</p><p className="text-sm font-bold text-emerald-700">{activities.length - pendingCount}</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Select value={filterCompleted} onValueChange={(v) => setFilterCompleted(v as 'all' | 'pending' | 'done')}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="all">Sve</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="done">Završene</SelectItem>
          </SelectContent></Select>
          <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="all">Svi tipovi</SelectItem>
            {Object.entries(ACTIVITY_TYPES).map(([key, val]) => <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>)}
          </SelectContent></Select>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setNewAct(!newAct)}><Plus className="h-4 w-4" />Nova aktivnost</Button>
      </div>

      {/* New Activity Form */}
      {newAct && (
        <Card className="p-4 border-dashed border-primary/30">
          <p className="text-xs font-semibold mb-3">Nova aktivnost</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={actType} onValueChange={setActType}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger><SelectContent>
                {Object.entries(ACTIVITY_TYPES).map(([key, val]) => <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>)}
              </SelectContent></Select>
              <Input className="h-8 text-xs flex-1" placeholder="Naslov aktivnosti..." value={actTitle} onChange={(e) => setActTitle(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input type="datetime-local" className="h-8 text-xs w-48" value={actDueDate} onChange={(e) => setActDueDate(e.target.value)} />
              <Select value={actContactId} onValueChange={setActContactId}><SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Kontakt..." /></SelectTrigger><SelectContent>
                <SelectItem value="">Bez kontakta</SelectItem>
                {contacts.slice(0, 20).map((c: Contact) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}
              </SelectContent></Select>
              <Select value={actDealId} onValueChange={setActDealId}><SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Deal..." /></SelectTrigger><SelectContent>
                <SelectItem value="">Bez dela</SelectItem>
                {deals.filter((d: Deal) => !['won', 'lost'].includes(d.stage)).slice(0, 20).map((d: Deal) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
              </SelectContent></Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={addActivity}>{t('common.save')}</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setNewAct(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Activities List */}
      <div className="space-y-1.5">
        {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Nema aktivnosti</p>}
        {filtered.map((act: CrmActivity) => {
          const typeInfo = ACTIVITY_TYPES[act.type] || { icon: '📝', label: act.type }
          const actDays = daysUntil(act.dueDate)
          const isOverdue = actDays !== null && actDays < 0 && !act.completed
          return (
            <div key={act.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${act.completed ? 'bg-slate-50 opacity-60 border-slate-200' : 'bg-white border-slate-200 hover:border-primary/30'}`}>
              <button className="mt-0.5 flex-shrink-0" onClick={() => toggleComplete(act.id, act.completed)}>
                {act.completed ? <CircleCheck className="h-5 w-5 text-emerald-500" /> : <CircleDot className="h-5 w-5 text-muted-foreground hover:text-primary" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">{typeInfo.icon}</span>
                  <p className={`text-sm font-medium ${act.completed ? 'line-through' : ''}`}>{tc(act.title)}</p>
                  <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>{formatDate(act.createdAt)}</span>
                  {act.dueDate && (
                    <span className={isOverdue ? 'text-red-500 font-medium' : ''}>📅 {formatDate(act.dueDate)}{actDays !== null && actDays >= 0 && actDays <= 3 && ` (${actDays}d)`}</span>
                  )}
                  {act.contact && <span>👤 {tc(`${act.contact.firstName} ${act.contact.lastName}`)}</span>}
                  {act.deal && <span>💼 {tc(act.deal.title)}</span>}
                </div>
                {act.description && <p className="text-xs text-muted-foreground mt-1">{act.description}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-red-400 hover:text-red-500" onClick={() => deleteAct(act.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== IZVORI (LEAD SOURCES) TAB ====================
function IzvoriTab() {
  const { t } = useTranslation()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/deals').then((r) => r.json()).then((d: Deal[]) => { setDeals(d); setLoading(false) }) }, [])

  const sourceStats = useMemo(() => {
    const stats: Record<string, { total: number; won: number; lost: number; totalValue: number; wonValue: number; count: number }> = {}
    deals.forEach((d: Deal) => {
      const src = d.source || 'manual'
      if (!stats[src]) stats[src] = { total: 0, won: 0, lost: 0, totalValue: 0, wonValue: 0, count: 0 }
      stats[src].count++
      stats[src].totalValue += d.value
      if (d.stage === 'won') { stats[src].won++; stats[src].wonValue += d.value }
      if (d.stage === 'lost') stats[src].lost++
    })
    return Object.entries(stats).sort((a, b) => b[1].count - a[1].count)
  }, [deals])

  const totalDeals = deals.length
  const maxCount = Math.max(...sourceStats.map(([, s]) => s.count), 1)

  if (loading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Analiza izvora leadova</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sourceStats.map(([source, stat]) => {
              const winRate = stat.count > 0 ? Math.round((stat.won / stat.count) * 100) : 0
              return (
                <div key={source} className="p-3 rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SOURCE_ICONS[source] || '❓'}</span>
                      <span className="font-semibold text-sm">{SOURCE_LABELS[source] || source}</span>
                      <Badge variant="secondary" className="text-xs">{stat.count} ({totalDeals > 0 ? Math.round(stat.count / totalDeals * 100) : 0}%)</Badge>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-emerald-600 font-medium">Win: {winRate}%</span>
                      <span className="text-muted-foreground">{formatRSD(stat.totalValue)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Ukupno:</span> <span className="font-medium">{stat.count}</span></div>
                    <div><span className="text-muted-foreground">Won:</span> <span className="font-medium text-emerald-600">{stat.won}</span></div>
                    <div><span className="text-muted-foreground">Lost:</span> <span className="font-medium text-red-500">{stat.lost}</span></div>
                    <div><span className="text-muted-foreground">Vrednost:</span> <span className="font-medium">{formatRSD(stat.totalValue)}</span></div>
                    <div><span className="text-muted-foreground">Won vrednost:</span> <span className="font-medium text-emerald-600">{formatRSD(stat.wonValue)}</span></div>
                    <div><span className="text-muted-foreground">Win rate:</span> <span className="font-medium">{winRate}%</span></div>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full bg-primary/70" style={{ width: `${(stat.count / maxCount) * 100}%` }} /></div>
                </div>
              )
            })}
            {sourceStats.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Nema podataka</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
