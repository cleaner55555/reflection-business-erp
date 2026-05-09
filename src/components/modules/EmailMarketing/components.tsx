'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
'use client'

import { useState } from 'react'

import { ArrowLeft, Clock, Copy, Eye, FileText, Mail, MousePointer, Pencil, Plus, Send, Trash2, Upload, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import type { EmailList, EmailSubscriber, EmailCampaign, EmailTemplate } from './types'

function KampanjeTab({ campaigns, lists, loading, onRefresh }: {
  campaigns: EmailCampaign[]
  lists: EmailList[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailCampaign | null>(null)
  const { t } = useTranslation()
  const { tc } = useContentTranslation()

  const CAMPAIGN_STATUS = getCampaignStatuses(t)

  const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteCampaign'))) return
    try {
      await fetch(`/api/email-campaigns/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.campaignDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/email-campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sentAt: status === 'poslata' ? new Date().toISOString() : undefined }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(`${t('common.status')}: ${CAMPAIGN_STATUS[status]?.label || status}`)
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

  const handleDuplicate = async (campaign: EmailCampaign) => {
    try {
      const res = await fetch('/api/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${campaign.name} ${t('emailMarketing.copy')}`,
          subject: campaign.subject,
          preheader: campaign.preheader,
          content: campaign.content,
          listId: campaign.listId,
          status: 'nacrt',
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('emailMarketing.campaignDuplicated'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      subject: fd.get('subject') as string,
      preheader: (fd.get('preheader') as string) || null,
      content: fd.get('content') as string,
      listId: (fd.get('listId') as string) || null,
    }
    try {
      const url = editing ? `/api/email-campaigns/${editing.id}` : '/api/email-campaigns'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.campaignUpdated') : t('emailMarketing.campaignCreated'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? t('common.edit') : t('emailMarketing.new')} {t('emailMarketing.campaignAcc')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('emailMarketing.campaigns')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{campaigns.length} {t('emailMarketing.campaignsCount')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
              <Plus className="h-4 w-4" /> {t('emailMarketing.newCampaign')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.campaignName')} *</Label>
              <Input name="name" defaultValue={editing?.name || ''} required placeholder="npr. Novogodišnja promocija" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.subject')} *</Label>
              <Input name="subject" defaultValue={editing?.subject || ''} required placeholder="Predmet emaila" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.preheader')}</Label>
              <Input name="preheader" defaultValue={editing?.preheader || ''} placeholder={t('emailMarketing.preheaderPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.list')}</Label>
              <Select name="listId" defaultValue={editing?.listId || ''}>
                <SelectTrigger><SelectValue placeholder={t('emailMarketing.selectList')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('emailMarketing.noList')}</SelectItem>
                  {lists.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.contentHtml')} *</Label>
              <Textarea name="content" defaultValue={editing?.content || ''} required rows={6} placeholder="<h1>Pozdrav!</h1><p>Vaš sadržaj ovde...</p>" className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Mail className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{t('emailMarketing.noCampaigns')}</p>
                <p className="text-xs mt-1">{t('emailMarketing.createFirstCampaign')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate">{tc(c.name)}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{tc(c.subject)}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ml-2 shrink-0 ${CAMPAIGN_STATUS[c.status]?.color || ''}`}>
                          {CAMPAIGN_STATUS[c.status]?.label || c.status}
                        </Badge>
                      </div>

                      {c.list && (
                        <p className="text-xs text-muted-foreground mb-2">
                          <FileText className="h-3 w-3 inline mr-1" />{c.list.name}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-xs font-bold">{c.sentCount}</p>
                          <p className="text-xs text-muted-foreground">{t('emailMarketing.sentCount')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-emerald-600">{c.openRate?.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">{t('emailMarketing.openings')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-blue-600">{c.clickRate?.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">{t('emailMarketing.clicks')}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Progress value={c.openRate || 0} className="h-1.5 flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Progress value={c.clickRate || 0} className="h-1.5 flex-1" />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {c.sentAt ? `${t('emailMarketing.sent')}: ${formatDate(c.sentAt)}` : c.scheduledAt ? `${t('emailMarketing.scheduled')}: ${formatDate(c.scheduledAt)}` : `${t('emailMarketing.created')}: ${formatDate(c.createdAt)}`}
                      </p>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status === 'nacrt' && (
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600" onClick={() => handleStatusChange(c.id, 'poslata')}>
                            <Send className="h-3 w-3" /> {t('emailMarketing.send')}
                          </Button>
                        )}
                        {c.status === 'nacrt' && (
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-blue-600" onClick={() => handleStatusChange(c.id, 'zakazana')}>
                            <Clock className="h-3 w-3" /> {t('emailMarketing.schedule')}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleDuplicate(c)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(c); setViewMode('form') }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function PretplatniciTab({ subscribers, lists, loading, onRefresh }: {
  subscribers: EmailSubscriber[]
  lists: EmailList[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailSubscriber | null>(null)
  const [filterList, setFilterList] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const { t } = useTranslation()

  const SUBSCRIBER_STATUS = getSubscriberStatuses(t)

  const filtered = subscribers.filter(s => {
    if (filterList && filterList !== 'all' && s.listId !== filterList) return false
    if (filterStatus && filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteSubscriber'))) return
    try {
      await fetch(`/api/email-subscribers/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.subscriberDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      email: fd.get('email') as string,
      firstName: (fd.get('firstName') as string) || null,
      lastName: (fd.get('lastName') as string) || null,
      listId: (fd.get('listId') as string) || null,
      source: 'ručno',
    }
    try {
      const url = editing ? `/api/email-subscribers/${editing.id}` : '/api/email-subscribers'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.subscriberUpdated') : t('emailMarketing.subscriberAdded'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? t('common.edit') : t('common.add')} {t('emailMarketing.subscriberAcc')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('emailMarketing.subscribers')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} {t('emailMarketing.subscribersCount')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info(t('emailMarketing.importSubscribersInfo'))}>
                <Upload className="h-4 w-4" /> {t('emailMarketing.import')}
              </Button>
              <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
                <Plus className="h-4 w-4" /> {t('common.add')}
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mt-4">
            <Select value={filterList || 'all'} onValueChange={setFilterList}>
              <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                <SelectValue placeholder={t('emailMarketing.allLists')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('emailMarketing.allLists')}</SelectItem>
                {lists.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || 'all'} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                <SelectValue placeholder={t('emailMarketing.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('emailMarketing.allStatuses')}</SelectItem>
                <SelectItem value="aktivan">{t('common.aktivan_sub')}</SelectItem>
                <SelectItem value="neaktivan">{t('common.neaktivan')}</SelectItem>
                <SelectItem value="otkazan">{t('common.otkazan')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Email *</Label>
              <Input name="email" type="email" defaultValue={editing?.email || ''} required placeholder="email@primer.rs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('emailMarketing.firstName')}</Label>
                <Input name="firstName" defaultValue={editing?.firstName || ''} placeholder={t('emailMarketing.firstName')} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('emailMarketing.lastName')}</Label>
                <Input name="lastName" defaultValue={editing?.lastName || ''} placeholder={t('emailMarketing.lastName')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.list')}</Label>
              <Select name="listId" defaultValue={editing?.listId || ''}>
                <SelectTrigger><SelectValue placeholder={t('emailMarketing.selectList')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('emailMarketing.noList')}</SelectItem>
                  {lists.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">{t('emailMarketing.firstName')}</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">{t('emailMarketing.list')}</TableHead>
                    <TableHead className="text-xs">{t('common.status')}</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">{t('emailMarketing.source')}</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">{t('common.date')}</TableHead>
                    <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">{t('emailMarketing.noSubscribers')}</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.email}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          {s.firstName || s.lastName ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '-'}
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{s.list?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${SUBSCRIBER_STATUS[s.status]?.color || ''}`}>
                            {SUBSCRIBER_STATUS[s.status]?.label || s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell capitalize">{s.source || '-'}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatDate(s.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(s); setViewMode('form') }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(s.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ListeTab({ lists, loading, onRefresh }: {
  lists: EmailList[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailList | null>(null)
  const { t } = useTranslation()

  const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteList'))) return
    try {
      await fetch(`/api/email-lists/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.listDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      description: (fd.get('description') as string) || null,
    }
    try {
      const url = editing ? `/api/email-lists/${editing.id}` : '/api/email-lists'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.listUpdated') : t('emailMarketing.listCreated'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? t('common.edit') : t('emailMarketing.new')} {t('emailMarketing.listAcc')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('emailMarketing.emailLists')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{lists.length} {t('emailMarketing.listsCount')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
              <Plus className="h-4 w-4" /> {t('emailMarketing.newList')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.listName')} *</Label>
              <Input name="name" defaultValue={editing?.name || ''} required placeholder="npr. Novosti, Newsletter" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.description')}</Label>
              <Textarea name="description" defaultValue={editing?.description || ''} rows={3} placeholder={t('emailMarketing.listDescriptionPlaceholder')} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
              </div>
            ) : lists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{t('emailMarketing.noLists')}</p>
                <p className="text-xs mt-1">{t('emailMarketing.createFirstList')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lists.map((l) => (
                  <Card key={l.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                            <FileText className="h-4 w-4 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">{l.name}</h3>
                            <p className="text-xs text-muted-foreground">{t('emailMarketing.created')}: {formatDate(l.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(l); setViewMode('form') }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(l.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {l.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{l.description}</p>
                      )}
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{l._count?.subscribers || 0}</span>
                          <span className="text-xs text-muted-foreground">{t('emailMarketing.subscribersCount')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{l._count?.campaigns || 0}</span>
                          <span className="text-xs text-muted-foreground">{t('emailMarketing.campaignsCount')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SabloniTab({ templates, loading, onRefresh }: {
  templates: EmailTemplate[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const { t } = useTranslation()

  const TEMPLATE_CATEGORIES = getTemplateCategories(t)

  const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteTemplate'))) return
    try {
      await fetch(`/api/email-templates/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.templateDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      subject: fd.get('subject') as string,
      content: fd.get('content') as string,
      category: (fd.get('category') as string) || null,
    }
    try {
      const url = editing ? `/api/email-templates/${editing.id}` : '/api/email-templates'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.templateUpdated') : t('emailMarketing.templateCreated'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const getCategoryColor = (cat: string | null) => {
    switch (cat) {
      case 'promotivno': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'transakciono': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'obavestenje': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? t('common.edit') : t('emailMarketing.newM')} {t('emailMarketing.template')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('emailMarketing.templates')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{templates.length} {t('emailMarketing.templatesCount')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
              <Plus className="h-4 w-4" /> {t('emailMarketing.newTemplate')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.name')} *</Label>
                <Input name="name" defaultValue={editing?.name || ''} required placeholder={t('emailMarketing.templateNamePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('emailMarketing.subject')} *</Label>
                <Input name="subject" defaultValue={editing?.subject || ''} required placeholder="Predmet emaila" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.category')}</Label>
              <Select name="category" defaultValue={editing?.category || ''}>
                <SelectTrigger><SelectValue placeholder={t('emailMarketing.selectCategory')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('emailMarketing.noCategory')}</SelectItem>
                  <SelectItem value="promotivno">{t('emailMarketing.promotional')}</SelectItem>
                  <SelectItem value="transakciono">{t('emailMarketing.transactional')}</SelectItem>
                  <SelectItem value="obavestenje">{t('emailMarketing.notification')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('emailMarketing.contentHtml')} *</Label>
              <Textarea name="content" defaultValue={editing?.content || ''} required rows={8} placeholder="<h1>Pozdrav {{ime}},</h1><p>Vaš sadržaj ovde...</p>" className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Copy className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{t('emailMarketing.noTemplates')}</p>
                <p className="text-xs mt-1">{t('emailMarketing.createFirstTemplate')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((tmpl) => (
                  <Card key={tmpl.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <Copy className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate">{tmpl.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{tmpl.subject}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(tmpl); setViewMode('form') }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(tmpl.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {tmpl.category && (
                        <Badge variant="outline" className={`text-xs mb-3 ${getCategoryColor(tmpl.category)}`}>
                          {TEMPLATE_CATEGORIES[tmpl.category] || tmpl.category}
                        </Badge>
                      )}

                      <div className="mt-2 rounded-md bg-muted/50 border p-2 max-h-16 overflow-hidden">
                        <p className="text-xs text-muted-foreground line-clamp-3 font-mono whitespace-pre-wrap break-all">
                          {tmpl.content.replace(/<[^>]*>/g, '').substring(0, 120) || t('emailMarketing.htmlContent')}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        {t('emailMarketing.created')}: {formatDate(tmpl.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
