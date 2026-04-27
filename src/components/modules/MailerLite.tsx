'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Mail, Plus, Pencil, Trash2, Users, Send, Clock, Eye, MousePointer, FileText, Copy, Upload, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ==================== TYPES ====================
interface EmailList {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: { subscribers: number; campaigns: number }
}

interface EmailSubscriber {
  id: string
  listId: string | null
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  source: string | null
  createdAt: string
  updatedAt: string
  list?: { id: string; name: string } | null
}

interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader: string | null
  content: string
  status: string
  listId: string | null
  sentCount: number
  openRate: number
  clickRate: number
  bounceRate: number
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
  list?: { id: string; name: string } | null
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string | null
  createdAt: string
  updatedAt: string
}

// ==================== CONSTANTS ====================
const CAMPAIGN_STATUS: Record<string, { label: string; color: string }> = {
  nacrt: { label: 'Načrt', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  poslata: { label: 'Poslata', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  zakazana: { label: 'Zakazana', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  u_toku: { label: 'U toku', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  zavrsena: { label: 'Završena', color: 'bg-slate-100 text-slate-600 border-slate-300' },
}

const SUBSCRIBER_STATUS: Record<string, { label: string; color: string }> = {
  aktivan: { label: 'Aktivan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  neaktivan: { label: 'Neaktivan', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  otkazan: { label: 'Otkazan', color: 'bg-red-50 text-red-700 border-red-200' },
}

const TEMPLATE_CATEGORIES: Record<string, string> = {
  promotivno: 'Promotivno',
  transakciono: 'Transakciono',
  obavestenje: 'Obaveštenje',
}

// ==================== MAIN COMPONENT ====================
export function MailerLite() {
  const [lists, setLists] = useState<EmailList[]>([])
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [listsRes, subsRes, campsRes, tempsRes] = await Promise.all([
        fetch('/api/email-lists'),
        fetch('/api/email-subscribers'),
        fetch('/api/email-campaigns'),
        fetch('/api/email-templates'),
      ])
      setLists(await listsRes.json())
      setSubscribers(await subsRes.json())
      setCampaigns(await campsRes.json())
      setTemplates(await tempsRes.json())
    } catch {
      toast.error('Greška pri učitavanju podataka')
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => { fetchAll() })

  const totalCampaigns = campaigns.length
  const totalSubscribers = subscribers.filter(s => s.status === 'aktivan').length
  const avgOpenRate = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.length
    : 0
  const activeLists = lists.filter(l => l._count && l._count.subscribers > 0).length

  const stats = [
    { label: 'Ukupno kampanja', value: totalCampaigns, icon: Mail, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Ukupno pretplatnika', value: totalSubscribers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Prosečna stopa otvaranja', value: `${avgOpenRate.toFixed(1)}%`, icon: Eye, color: 'text-amber-600 bg-amber-50' },
    { label: 'Aktivne liste', value: activeLists, icon: FileText, color: 'text-violet-600 bg-violet-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Mail className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Email Marketing</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Kampanje, liste i šablone za email marketing</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="kampanje" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="kampanje" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kampanje</span>
          </TabsTrigger>
          <TabsTrigger value="pretplatnici" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pretplatnici</span>
          </TabsTrigger>
          <TabsTrigger value="liste" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Liste</span>
          </TabsTrigger>
          <TabsTrigger value="sabloni" className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Šablone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kampanje">
          <KampanjeTab campaigns={campaigns} lists={lists} loading={loading} onRefresh={fetchAll} />
        </TabsContent>
        <TabsContent value="pretplatnici">
          <PretplatniciTab subscribers={subscribers} lists={lists} loading={loading} onRefresh={fetchAll} />
        </TabsContent>
        <TabsContent value="liste">
          <ListeTab lists={lists} loading={loading} onRefresh={fetchAll} />
        </TabsContent>
        <TabsContent value="sabloni">
          <SabloniTab templates={templates} loading={loading} onRefresh={fetchAll} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== KAMPANJE TAB ====================
function KampanjeTab({ campaigns, lists, loading, onRefresh }: {
  campaigns: EmailCampaign[]
  lists: EmailList[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailCampaign | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati kampanju?')) return
    try {
      await fetch(`/api/email-campaigns/${id}`, { method: 'DELETE' })
      toast.success('Kampanja obrisana')
      onRefresh()
    } catch { toast.error('Greška') }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/email-campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sentAt: status === 'poslata' ? new Date().toISOString() : undefined }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success(`Status: ${CAMPAIGN_STATUS[status]?.label || status}`)
      onRefresh()
    } catch { toast.error('Greška') }
  }

  const handleDuplicate = async (campaign: EmailCampaign) => {
    try {
      const res = await fetch('/api/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${campaign.name} (kopija)`,
          subject: campaign.subject,
          preheader: campaign.preheader,
          content: campaign.content,
          listId: campaign.listId,
          status: 'nacrt',
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Kampanja duplicirana')
      onRefresh()
    } catch { toast.error('Greška') }
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
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success(editing ? 'Kampanja ažurirana' : 'Kampanja kreirana')
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? 'Izmeni' : 'Nova'} Kampanju</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Kampanje</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{campaigns.length} kampanja</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
              <Plus className="h-4 w-4" /> Nova Kampanja
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Naziv kampanje *</Label>
              <Input name="name" defaultValue={editing?.name || ''} required placeholder="npr. Novogodišnja promocija" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Predmet (Subject) *</Label>
              <Input name="subject" defaultValue={editing?.subject || ''} required placeholder="Predmet emaila" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Preheader</Label>
              <Input name="preheader" defaultValue={editing?.preheader || ''} placeholder="Kratak tekst ispred naslova" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Lista</Label>
              <Select name="listId" defaultValue={editing?.listId || ''}>
                <SelectTrigger><SelectValue placeholder="Izaberi listu" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez liste</SelectItem>
                  {lists.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sadržaj (HTML) *</Label>
              <Textarea name="content" defaultValue={editing?.content || ''} required rows={6} placeholder="<h1>Pozdrav!</h1><p>Vaš sadržaj ovde...</p>" className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">Otkaži</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Čuvanje...' : 'Sačuvaj'}
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
                <p className="text-sm">Nema kampanja</p>
                <p className="text-xs mt-1">Kreirajte prvu email kampanju</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate">{c.name}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{c.subject}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ml-2 shrink-0 ${CAMPAIGN_STATUS[c.status]?.color || ''}`}>
                          {CAMPAIGN_STATUS[c.status]?.label || c.status}
                        </Badge>
                      </div>

                      {c.list && (
                        <p className="text-[10px] text-muted-foreground mb-2">
                          <FileText className="h-3 w-3 inline mr-1" />{c.list.name}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-xs font-bold">{c.sentCount}</p>
                          <p className="text-[10px] text-muted-foreground">Poslato</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-emerald-600">{c.openRate?.toFixed(1)}%</p>
                          <p className="text-[10px] text-muted-foreground">Otvaranja</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-blue-600">{c.clickRate?.toFixed(1)}%</p>
                          <p className="text-[10px] text-muted-foreground">Klikovi</p>
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

                      <p className="text-[10px] text-muted-foreground mb-3">
                        {c.sentAt ? `Poslata: ${formatDate(c.sentAt)}` : c.scheduledAt ? `Zakazana: ${formatDate(c.scheduledAt)}` : `Kreirana: ${formatDate(c.createdAt)}`}
                      </p>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status === 'nacrt' && (
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] text-emerald-600" onClick={() => handleStatusChange(c.id, 'poslata')}>
                            <Send className="h-3 w-3" /> Pošalji
                          </Button>
                        )}
                        {c.status === 'nacrt' && (
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] text-blue-600" onClick={() => handleStatusChange(c.id, 'zakazana')}>
                            <Clock className="h-3 w-3" /> Zakaži
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px]" onClick={() => handleDuplicate(c)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setEditing(c); setViewMode('form') }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-500" onClick={() => handleDelete(c.id)}>
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

// ==================== PRETPLATNICI TAB ====================
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

  const filtered = subscribers.filter(s => {
    if (filterList && filterList !== 'all' && s.listId !== filterList) return false
    if (filterStatus && filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati pretplatnika?')) return
    try {
      await fetch(`/api/email-subscribers/${id}`, { method: 'DELETE' })
      toast.success('Pretplatnik obrisan')
      onRefresh()
    } catch { toast.error('Greška') }
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
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success(editing ? 'Pretplatnik ažuriran' : 'Pretplatnik dodat')
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? 'Izmeni' : 'Dodaj'} Pretplatnika</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Pretplatnici</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} pretplatnika</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Uvoz pretplatnika - funkcija u pripremi')}>
                <Upload className="h-4 w-4" /> Uvoz
              </Button>
              <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
                <Plus className="h-4 w-4" /> Dodaj
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mt-4">
            <Select value={filterList || 'all'} onValueChange={setFilterList}>
              <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                <SelectValue placeholder="Sve liste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve liste</SelectItem>
                {lists.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || 'all'} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                <SelectValue placeholder="Svi statusi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="aktivan">Aktivan</SelectItem>
                <SelectItem value="neaktivan">Neaktivan</SelectItem>
                <SelectItem value="otkazan">Otkazan</SelectItem>
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
                <Label className="text-xs">Ime</Label>
                <Input name="firstName" defaultValue={editing?.firstName || ''} placeholder="Ime" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prezime</Label>
                <Input name="lastName" defaultValue={editing?.lastName || ''} placeholder="Prezime" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Lista</Label>
              <Select name="listId" defaultValue={editing?.listId || ''}>
                <SelectTrigger><SelectValue placeholder="Izaberi listu" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez liste</SelectItem>
                  {lists.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">Otkaži</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Čuvanje...' : 'Sačuvaj'}
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
                    <TableHead className="text-xs hidden sm:table-cell">Ime</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Lista</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Izvor</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead>
                    <TableHead className="text-xs w-[80px]">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema pretplatnika</TableCell>
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
                          <Badge variant="outline" className={`text-[10px] ${SUBSCRIBER_STATUS[s.status]?.color || ''}`}>
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

// ==================== LISTE TAB ====================
function ListeTab({ lists, loading, onRefresh }: {
  lists: EmailList[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailList | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati listu? Obrisani će biti i svi povezani pretplatnici i kampanje.')) return
    try {
      await fetch(`/api/email-lists/${id}`, { method: 'DELETE' })
      toast.success('Lista obrisana')
      onRefresh()
    } catch { toast.error('Greška') }
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
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success(editing ? 'Lista ažurirana' : 'Lista kreirana')
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('list'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle>{editing ? 'Izmeni' : 'Nova'} Listu</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Email Liste</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{lists.length} lista</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
              <Plus className="h-4 w-4" /> Nova Lista
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Naziv liste *</Label>
              <Input name="name" defaultValue={editing?.name || ''} required placeholder="npr. Novosti, Newsletter" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Opis</Label>
              <Textarea name="description" defaultValue={editing?.description || ''} rows={3} placeholder="Opis liste..." />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">Otkaži</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Čuvanje...' : 'Sačuvaj'}
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
                <p className="text-sm">Nema listi</p>
                <p className="text-xs mt-1">Kreirajte prvu email listu</p>
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
                            <p className="text-[10px] text-muted-foreground">Kreirana: {formatDate(l.createdAt)}</p>
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
                          <span className="text-[10px] text-muted-foreground">pretplatnika</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{l._count?.campaigns || 0}</span>
                          <span className="text-[10px] text-muted-foreground">kampanja</span>
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

// ==================== ŠABLONE TAB ====================
function SabloniTab({ templates, loading, onRefresh }: {
  templates: EmailTemplate[]
  loading: boolean
  onRefresh: () => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati šablon?')) return
    try {
      await fetch(`/api/email-templates/${id}`, { method: 'DELETE' })
      toast.success('Šablon obrisan')
      onRefresh()
    } catch { toast.error('Greška') }
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
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success(editing ? 'Šablon ažuriran' : 'Šablon kreiran')
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
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
            <div><CardTitle>{editing ? 'Izmeni' : 'Novi'} Šablon</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Šablone</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{templates.length} šablona</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setViewMode('form') }}>
              <Plus className="h-4 w-4" /> Novi Šablon
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Naziv *</Label>
                <Input name="name" defaultValue={editing?.name || ''} required placeholder="Naziv šablona" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Predmet *</Label>
                <Input name="subject" defaultValue={editing?.subject || ''} required placeholder="Predmet emaila" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Kategorija</Label>
              <Select name="category" defaultValue={editing?.category || ''}>
                <SelectTrigger><SelectValue placeholder="Izaberi kategoriju" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez kategorije</SelectItem>
                  <SelectItem value="promotivno">Promotivno</SelectItem>
                  <SelectItem value="transakciono">Transakciono</SelectItem>
                  <SelectItem value="obavestenje">Obaveštenje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sadržaj (HTML) *</Label>
              <Textarea name="content" defaultValue={editing?.content || ''} required rows={8} placeholder="<h1>Pozdrav {{ime}},</h1><p>Vaš sadržaj ovde...</p>" className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setViewMode('list'); setEditing(null) }} className="flex-1">Otkaži</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Čuvanje...' : 'Sačuvaj'}
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
                <p className="text-sm">Nema šablona</p>
                <p className="text-xs mt-1">Kreirajte prvu email šablonu</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => (
                  <Card key={t.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <Copy className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate">{t.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(t); setViewMode('form') }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {t.category && (
                        <Badge variant="outline" className={`text-[10px] mb-3 ${getCategoryColor(t.category)}`}>
                          {TEMPLATE_CATEGORIES[t.category] || t.category}
                        </Badge>
                      )}

                      <div className="mt-2 rounded-md bg-muted/50 border p-2 max-h-16 overflow-hidden">
                        <p className="text-[10px] text-muted-foreground line-clamp-3 font-mono whitespace-pre-wrap break-all">
                          {t.content.replace(/<[^>]*>/g, '').substring(0, 120) || 'HTML sadržaj...'}
                        </p>
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-2">
                        Kreirana: {formatDate(t.createdAt)}
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
