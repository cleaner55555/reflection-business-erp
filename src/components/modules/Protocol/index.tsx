'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Plus, Search, Pencil, Trash2, Mail, Inbox, Send, AlertTriangle,
  FileCheck, Filter, ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProtocolEntry {
  id: string
  number: string
  date: string
  direction: string
  sender?: string
  recipient?: string
  subject: string
  description?: string
  documentType?: string
  dueDate?: string
  responsible?: string
  status: string
  priority: string
  notes?: string
  createdAt: string
}

type FormData = Omit<ProtocolEntry, 'id' | 'number' | 'date' | 'createdAt'>

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  primljen: { label: 'Primljen', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  u_radu: { label: 'U radu', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  završen: { label: 'Završen', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  proslijeđen: { label: 'Proslijeđen', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  odgovoren: { label: 'Odgovoren', className: 'bg-green-50 text-green-700 border-green-200' },
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  nizak: { label: 'Nizak', className: 'bg-muted text-muted-foreground' },
  srednji: { label: 'Srednji', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  visok: { label: 'Visok', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  hitan: { label: 'Hitan', className: 'bg-red-50 text-red-600 border-red-200' },
}

const DOC_TYPES: Record<string, string> = {
  pismo: 'Pismo',
  ugovor: 'Ugovor',
  ponuda: 'Ponuda',
  račun: 'Račun',
  rešenje: 'Rešenje',
  ostalo: 'Ostalo',
}

const EMPTY_FORM: FormData = {
  direction: 'ulaz',
  sender: '',
  recipient: '',
  subject: '',
  description: '',
  documentType: '',
  dueDate: '',
  responsible: '',
  status: 'primljen',
  priority: 'srednji',
  notes: '',
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Protocol() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  // Data state
  const [entries, setEntries] = useState<ProtocolEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Tab & filter state
  const [activeTab, setActiveTab] = useState<string>('ulaz')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<ProtocolEntry | null>(null)
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM })

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ProtocolEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'sve') params.set('direction', activeTab)
      const res = await fetch(`/api/protocol?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Greška pri učitavanju protokola')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  useEffect(() => {
    if (entries.length > 0) {
      translateTexts(entries.flatMap(e => [e.sender, e.recipient, e.subject, e.responsible, e.notes].filter(Boolean)))
    }
  }, [entries])

  // ─── Computed ─────────────────────────────────────────────────────────────

  const totalCount = entries.length
  const ulazniCount = entries.filter(e => e.direction === 'ulaz').length
  const izlazniCount = entries.filter(e => e.direction === 'izlaz').length
  const hitniCount = entries.filter(e => e.priority === 'hitan').length

  const filtered = entries.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (filterPriority !== 'all' && e.priority !== filterPriority) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        e.subject.toLowerCase().includes(q) ||
        (e.sender || '').toLowerCase().includes(q) ||
        (e.recipient || '').toLowerCase().includes(q) ||
        e.number.toLowerCase().includes(q) ||
        (e.responsible || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, direction: activeTab === 'izlaz' ? 'izlaz' : 'ulaz' })
    setViewMode('form')
  }

  const openEdit = (entry: ProtocolEntry) => {
    setEditing(entry)
    setForm({
      direction: entry.direction,
      sender: entry.sender || '',
      recipient: entry.recipient || '',
      subject: entry.subject,
      description: entry.description || '',
      documentType: entry.documentType || '',
      dueDate: entry.dueDate ? entry.dueDate.split('T')[0] : '',
      responsible: entry.responsible || '',
      status: entry.status,
      priority: entry.priority,
      notes: entry.notes || '',
    })
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
    setForm({ ...EMPTY_FORM })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim()) {
      toast.error('Predmet je obavezan')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        ...form,
        dueDate: form.dueDate || null,
      }
      const url = editing ? `/api/protocol/${editing.id}` : '/api/protocol'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editing ? 'Dopis ažuriran' : 'Dopis kreiran')
      handleCancel()
      fetchEntries()
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/protocol/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Dopis obrisan')
      setDeleteTarget(null)
      fetchEntries()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setDeleting(false)
    }
  }

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  const statusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <Badge variant="outline" className="text-[10px]">{status}</Badge>
    return <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>{cfg.label}</Badge>
  }

  const priorityBadge = (priority: string) => {
    const cfg = PRIORITY_CONFIG[priority]
    if (!cfg) return <Badge variant="secondary" className="text-[10px]">{priority}</Badge>
    return <Badge variant="secondary" className={`text-[10px] ${cfg.className}`}>{cfg.label}</Badge>
  }

  const statsCards = [
    { label: t('common.total'), value: totalCount, icon: FileCheck, color: 'text-slate-600 bg-slate-50' },
    { label: t('protocol.incoming'), value: ulazniCount, icon: Inbox, color: 'text-blue-600 bg-blue-50' },
    { label: t('protocol.outgoing'), value: izlazniCount, icon: Send, color: 'text-emerald-600 bg-emerald-50' },
    { label: t('protocol.urgent'), value: hitniCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ]

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Protokol</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evidencija ulaznih i izlaznih dopisa i dokumenta
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map(s => (
          <Card key={s.label} className="gap-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none">{loading ? <Skeleton className="h-7 w-10" /> : s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <CardTitle className="text-base font-semibold">
                  {editing ? 'Izmeni dopis' : 'Novi dopis'}
                </CardTitle>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Registar dopisa
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filtered.length} od {totalCount} zapisa
                </p>
              </div>
              <Button size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Novi dopis
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {viewMode === 'form' ? (
            /* ─── Inline Create / Edit Form ───────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Direction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Smer *</Label>
                  <Select value={form.direction} onValueChange={v => updateField('direction', v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ulaz">
                        <span className="flex items-center gap-1.5"><Inbox className="h-3.5 w-3.5" /> {t('protocol.incoming')}</span>
                      </SelectItem>
                      <SelectItem value="izlaz">
                        <span className="flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> {t('protocol.outgoing')}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Document type */}
                <div className="space-y-2">
                  <Label className="text-xs">Tip dokumenta</Label>
                  <Select value={form.documentType} onValueChange={v => updateField('documentType', v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOC_TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sender / Recipient — conditional on direction */}
              {form.direction === 'ulaz' ? (
                <div className="space-y-2">
                  <Label className="text-xs">Pošiljalac</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Ko šalje dopis..."
                    value={form.sender}
                    onChange={e => updateField('sender', e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs">Primalac</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Kom se šalje dopis..."
                    value={form.recipient}
                    onChange={e => updateField('recipient', e.target.value)}
                  />
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-xs">Predmet *</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Predmet dopisa..."
                  value={form.subject}
                  onChange={e => updateField('subject', e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs">Opis</Label>
                <Textarea
                  className="text-sm min-h-[70px] resize-none"
                  placeholder="Detaljan opis..."
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                />
              </div>

              {/* Status / Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => updateField('status', v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Prioritet</Label>
                  <Select value={form.priority} onValueChange={v => updateField('priority', v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due date / Responsible */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Rok</Label>
                  <Input
                    type="date"
                    className="h-9 text-sm"
                    value={form.dueDate}
                    onChange={e => updateField('dueDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Odgovorno lice</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Ime zaposlenog..."
                    value={form.responsible}
                    onChange={e => updateField('responsible', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-xs">Napomene</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Dodatne napomene..."
                  value={form.notes}
                  onChange={e => updateField('notes', e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                  Otkaži
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? t('common.saving') : editing ? t('common.update') : t('common.create')}
                </Button>
              </div>
            </form>
          ) : (
            /* ─── List View with Tabs & Filters ───────────────────────────── */
            <>
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="ulaz" className="gap-1.5 text-xs">
                    <Inbox className="h-3.5 w-3.5" /> t('protocol.incoming')
                  </TabsTrigger>
                  <TabsTrigger value="izlaz" className="gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" /> t('protocol.outgoing')
                  </TabsTrigger>
                  <TabsTrigger value="sve" className="gap-1.5 text-xs">
                    <FileCheck className="h-3.5 w-3.5" /> Svi
                  </TabsTrigger>
                </TabsList>

                {/* Filters */}
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pretraži dopise..."
                      className="pl-9 h-9 text-sm"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9 w-[140px] text-xs">
                        <Filter className="mr-1.5 h-3 w-3 text-muted-foreground" />
                        <SelectValue placeholder={t('common.status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="h-9 w-[140px] text-xs">
                        <Filter className="mr-1.5 h-3 w-3 text-muted-foreground" />
                        <SelectValue placeholder={t('protocol.priority')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('protocol.allPriorities')}</SelectItem>
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table */}
                <TabsContent value={activeTab} className="mt-0">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs w-[110px]">Broj</TableHead>
                            <TableHead className="text-xs w-[100px]">Datum</TableHead>
                            <TableHead className="text-xs">Od / Za</TableHead>
                            <TableHead className="text-xs min-w-[180px]">Predmet</TableHead>
                            <TableHead className="text-xs w-[100px]">Tip dok.</TableHead>
                            <TableHead className="text-xs w-[120px]">Odgov. lice</TableHead>
                            <TableHead className="text-xs w-[90px]">Rok</TableHead>
                            <TableHead className="text-xs w-[100px]">Status</TableHead>
                            <TableHead className="text-xs w-[80px]">Prioritet</TableHead>
                            <TableHead className="text-xs w-[80px] text-right">Akcije</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                                <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                Nema dopisa za prikaz
                              </TableCell>
                            </TableRow>
                          ) : (
                            filtered.map(entry => (
                              <TableRow key={entry.id} className="group">
                                <TableCell className="text-xs font-mono font-medium">
                                  {entry.number}
                                </TableCell>
                                <TableCell className="text-xs whitespace-nowrap">
                                  {formatDate(entry.date)}
                                </TableCell>
                                <TableCell className="text-xs max-w-[160px] truncate">
                                  {entry.direction === 'ulaz'
                                    ? (tc(entry.sender) || '-')
                                    : (tc(entry.recipient) || '-')}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  <span className="line-clamp-1">{tc(entry.subject)}</span>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {entry.documentType
                                    ? <Badge variant="secondary" className="text-[10px] font-normal">
                                        {DOC_TYPES[entry.documentType] || entry.documentType}
                                      </Badge>
                                    : <span className="text-muted-foreground">-</span>
                                  }
                                </TableCell>
                                <TableCell className="text-xs max-w-[110px] truncate">
                                  {tc(entry.responsible) || '-'}
                                </TableCell>
                                <TableCell className="text-xs whitespace-nowrap">
                                  {entry.dueDate ? formatDate(entry.dueDate) : '-'}
                                </TableCell>
                                <TableCell>{statusBadge(entry.status)}</TableCell>
                                <TableCell>{priorityBadge(entry.priority)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openEdit(entry)}
                                      title="Izmeni"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500 hover:text-red-600"
                                      onClick={() => setDeleteTarget(entry)}
                                      title={t("common.delete")}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Delete Confirmation (AlertDialog) ────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete dopis{' '}
              <span className="font-semibold">{deleteTarget?.number}</span>
              {' '}— <span className="italic">{tc(deleteTarget?.subject)}</span>?
              <br />
              Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
