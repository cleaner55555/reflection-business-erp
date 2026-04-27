'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, HeartHandshake, Phone, Mail, Building2, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import { formatRSD, formatDate, getStatusLabel, getStatusColor } from '@/lib/helpers'

interface Contact {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; company: string | null; notes: string | null; tags: string | null
  isClient: boolean; isSupplier: boolean; isLead: boolean; createdAt: string
  partner?: { id: string; name: string } | null
  _count?: { activities: number; deals: number }
}

interface Deal {
  id: string; title: string; value: number; stage: string; probability: number
  assignedTo: string | null; closeDate: string | null; notes: string | null; createdAt: string
  contact?: { id: string; firstName: string; lastName: string } | null
  partner?: { id: string; name: string } | null
}

interface Activity {
  id: string; type: string; title: string; description: string | null
  dueDate: string | null; completed: boolean; createdAt: string
  contact?: { id: string; firstName: string; lastName: string } | null
  deal?: { id: string; title: string } | null
}

const STAGES = ['lead', 'kvalifikacija', 'predlog', 'pregovaranje', 'won', 'lost'] as const
const STAGE_LABELS: Record<string, string> = { lead: 'Lead', kvalifikacija: 'Kvalifikacija', predlog: 'Predlog', pregovaranje: 'Pregovaranje', won: 'Dobijeno', lost: 'Izgubljeno' }
const STAGE_COLORS: Record<string, string> = { lead: 'bg-slate-100 border-slate-300', kvalifikacija: 'bg-blue-50 border-blue-300', predlog: 'bg-amber-50 border-amber-300', pregovaranje: 'bg-orange-50 border-orange-300', won: 'bg-emerald-50 border-emerald-300', lost: 'bg-red-50 border-red-300' }

export function CRM() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('crm.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('crm.subtitle')}</p>
      </div>
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline" className="gap-1.5"><HeartHandshake className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.pipeline')}</span></TabsTrigger>
          <TabsTrigger value="kontakti">{t('crm.contacts')}</TabsTrigger>
          <TabsTrigger value="aktivnosti">{t('crm.activities')}</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="kontakti"><KontaktiTab /></TabsContent>
        <TabsContent value="aktivnosti"><AktivnostiTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== PIPELINE (KANBAN) ====================
function PipelineTab() {
  const { t } = useTranslation()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/deals')
    setDeals(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const moveDeal = async (dealId: string, newStage: string) => {
    try {
      await fetch(`/api/deals/${dealId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: newStage }) })
      fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('crm.confirmDeleteDeal'))) return
    try { await fetch(`/api/deals/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchDeals() } catch { toast.error(t('common.error')) }
  }

  const handleNew = () => {
    setEditingDeal(null)
    setViewMode('form')
  }

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingDeal(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const nextStage = (stage: string) => {
    const idx = STAGES.indexOf(stage as typeof STAGES[number])
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null
  }

  const totalValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0)
  const pipelineValue = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0)

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
                    <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">{t('crm.won')}: {formatRSD(totalValue)}</div>
              <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">{t('crm.pipeline')}: {formatRSD(pipelineValue)}</div>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('crm.newDeal')}</Button>
          </div>

          {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div> : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((stage) => {
                const stageDeals = deals.filter(d => d.stage === stage)
                const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0)
                return (
                  <div key={stage} className={`min-w-[260px] w-[260px] flex-shrink-0 rounded-xl border-2 p-3 ${STAGE_COLORS[stage]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold">{STAGE_LABELS[stage]}</h3>
                      <Badge variant="secondary" className="text-[10px]">{stageDeals.length}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-3">{formatRSD(stageTotal)}</p>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {stageDeals.map((deal) => (
                        <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(deal)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{deal.title}</p>
                              <p className="text-xs text-muted-foreground">{formatRSD(deal.value)}</p>
                              <p className="text-[10px] text-muted-foreground">{deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : deal.assignedTo || ''}</p>
                            </div>
                            <div className="flex gap-1 ml-1">
                              {nextStage(stage) && (
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveDeal(deal.id, nextStage(stage)!) }}>
                                  <span className="text-xs">→</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(deal.id) }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {stageDeals.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">{t('crm.noDeals')}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ==================== KONTAKTI TAB ====================
function KontaktiTab() {
  const { t } = useTranslation()
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

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (c: Contact) => {
    setEditing(c)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('crm.confirmDeleteContact'))) return
    try { await fetch(`/api/contacts/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchContacts() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('common.name')}</TableHead><TableHead className="text-xs">{t('crm.company')}</TableHead><TableHead className="text-xs">{t('common.type')}</TableHead><TableHead className="text-xs">{t('crm.phone')}</TableHead><TableHead className="text-xs">{t('common.email')}</TableHead><TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {contacts.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">{t('crm.noContacts')}</TableCell></TableRow> : contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs font-medium">{c.firstName} {c.lastName}</TableCell>
                  <TableCell className="text-xs">{c.company || '-'}</TableCell>
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
  const [activities, setActivities] = useState<Activity[]>([])
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

  const handleNew = () => {
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) }); fetchActivities() } catch { toast.error(t('common.error')) }
  }

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'DELETE' }); fetchActivities() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
            <div><CardTitle className="text-base font-semibold">{t('crm.activities')}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{activities.filter(a => !a.completed).length} {t('crm.activeCount')}</p></div>
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
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('common.type')}</TableHead><TableHead className="text-xs">{t('common.name')}</TableHead><TableHead className="text-xs">{t('crm.contact')}</TableHead><TableHead className="text-xs">{t('crm.dueDate')}</TableHead><TableHead className="text-xs">{t('common.status')}</TableHead><TableHead className="text-xs w-[60px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {activities.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">{t('crm.noActivities')}</TableCell></TableRow> : activities.map((a) => (
                <TableRow key={a.id} className={a.completed ? 'opacity-50' : ''}>
                  <TableCell className="text-xs">{typeIcons[a.type] || '📝'}</TableCell>
                  <TableCell className="text-xs font-medium">{a.title}</TableCell>
                  <TableCell className="text-xs">{a.contact ? `${a.contact.firstName} ${a.contact.lastName}` : '-'}</TableCell>
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
