'use client'

import { useCallback, useEffect, useState } from 'react'

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, ArrowLeft, BarChart3, Briefcase, Building2, CreditCard, FileText, Globe, Landmark, Mail, MapPin, Pencil, Phone, Plus, Search, Tag, Trash2, TrendingUp, UserCheck, UserX, Users, X } from 'lucide-react'
'use client'

import { useCallback, useEffect, useState } from 'react'

import type { Partner, ContactInfo, PartnerStats, AnalyticsSummary, PartnerAnalytics } from './types'

function PregledTab() {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partners/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      toast.error('Greška pri učitavanju statistike')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ukupno partnera</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.newThisMonth} novih ovog meseca</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kupci</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.byType.kupci}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.active} aktivnih</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Dobavljači</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.byType.dobavljaci}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.byType.partneri} generalnih</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Neaktivni</p>
              <p className="text-2xl font-bold mt-1 text-red-500">{stats.inactive}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.partnersWithCredit.length} sa limitom</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <UserX className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tags overview + Credit alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" /> Tagovi ({stats.allTags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.allTags.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nema tagova. Dodajte tagove u formi partnera.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {stats.allTags.map((tag) => (
                  <Badge key={tag.name} variant="outline" className={`text-[10px] px-2 py-0 ${getTagColor(stats.allTags.indexOf(tag))}`}>
                    {tag.name} <span className="ml-1 opacity-60">({tag.count})</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Kreditni limiti ({stats.partnersWithCredit.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.partnersWithCredit.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nema partnera sa kreditnim limitom.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {stats.partnersWithCredit.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate max-w-[180px]">{tc(p.name)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{p._count.invoices} fak.</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0">{formatRSD(p.creditLimit)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Partners + Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top partners */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top Partneri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Naziv</TableHead>
                    <TableHead className="text-xs text-center">Tip</TableHead>
                    <TableHead className="text-xs text-center">Fak.</TableHead>
                    <TableHead className="text-xs text-center">Nar.</TableHead>
                    <TableHead className="text-xs text-center">Kon.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topPartners.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-medium truncate max-w-[160px]">{tc(p.name)}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${TYPE_COLORS[p.type] || ''}`}>
                          {TYPE_LABELS[p.type] || p.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center">{p._count.invoices}</TableCell>
                      <TableCell className="text-xs text-center">{p._count.purchaseOrders}</TableCell>
                      <TableCell className="text-xs text-center">{p._count.contacts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Cities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Po Gradovima
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.cityGroups.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nema podataka o gradovima.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.cityGroups.map((cg, i) => {
                  const maxCount = stats.cityGroups[0]?._count?.city || 1
                  const pct = Math.round((cg._count.city / maxCount) * 100)
                  return (
                    <div key={cg.city || i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{tc(cg.city || 'Nepoznat')}</span>
                        <span className="text-muted-foreground">{cg._count.city}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PartneriListTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null)
  const [tagInput, setTagInput] = useState('')

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    if (tagFilter) params.set('tag', tagFilter)
    if (statusFilter) params.set('isActive', statusFilter)
    const res = await fetch(`/api/partners?${params.toString()}`)
    const data = await res.json()
    setPartners(data)
    setLoading(false)
  }, [search, typeFilter, tagFilter, statusFilter])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  useEffect(() => {
    if (partners.length > 0) {
      translateTexts(partners.flatMap((p) => [p.name, p.city, p.address, p.notes].filter(Boolean) as string[]))
    }
  }, [partners, translateTexts])

  const handleNew = () => {
    setEditingPartner(null)
    setTagInput('')
    setViewMode('form')
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setTagInput(formatTagsInput(partner.tags))
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingPartner(null)
  }

  const handleDeleteClick = (partner: Partner) => {
    setDeleteTarget(partner)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/partners/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('partners.deleteSuccess'))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchPartners()
    } catch {
      toast.error(t('partners.deleteError'))
    }
  }

  const handleToggleActive = async (partner: Partner) => {
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !partner.isActive }),
      })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(partner.isActive ? 'Partner deaktiviran' : 'Partner aktiviran')
      fetchPartners()
    } catch {
      toast.error('Greška')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      pib: fd.get('pib') as string || null,
      maticniBr: fd.get('maticniBr') as string || null,
      address: fd.get('address') as string || null,
      city: fd.get('city') as string || null,
      zipCode: fd.get('zipCode') as string || null,
      phone: fd.get('phone') as string || null,
      email: fd.get('email') as string || null,
      type: fd.get('type') as string,
      account: fd.get('account') as string || null,
      bank: fd.get('bank') as string || null,
      notes: fd.get('notes') as string || null,
      creditLimit: Number(fd.get('creditLimit')) || 0,
      paymentTerms: Number(fd.get('paymentTerms')) || 0,
      parentId: (fd.get('parentId') as string) || null,
      tags: tagInput || null,
    }
    if (!body.name) { toast.error('Naziv je obavezan'); setSubmitting(false); return }

    try {
      const isEditing = !!editingPartner
      const url = isEditing ? `/api/partners/${editingPartner.id}` : '/api/partners'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('partners.updateSuccess') : t('partners.createSuccess'))
      setViewMode('list')
      setEditingPartner(null)
      fetchPartners()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base font-semibold">
                  {editingPartner ? 'Izmeni partnera' : 'Novi partner'}
                </CardTitle>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{t('partners.title')}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {partners.length} {t('partners.partnersCount')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ReportDownloadButton type="partners" />
                  <Button size="sm" className="gap-2" onClick={handleNew}>
                    <Plus className="h-4 w-4" /> {t('partners.newPartner')}
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('partners.searchPartners')}
                    className="pl-8 h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Svi tipovi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    <SelectItem value="kupac">Kupac</SelectItem>
                    <SelectItem value="dobavljac">Dobavljač</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi</SelectItem>
                    <SelectItem value="true">Aktivni</SelectItem>
                    <SelectItem value="false">Neaktivni</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs h-9 px-3 flex items-center">
                  Rezultat: {partners.length}
                </Badge>
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5" key={editingPartner?.id || 'new'}>
              {/* Basic Info Section */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Osnovni podaci</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.name')} <span className="text-red-500">*</span></Label>
                    <Input name="name" placeholder="Naziv firme" required defaultValue={editingPartner?.name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">PIB</Label>
                    <Input name="pib" placeholder="123456789" defaultValue={editingPartner?.pib || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Matični broj</Label>
                    <Input name="maticniBr" placeholder="12345678" defaultValue={editingPartner?.maticniBr || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.type')}</Label>
                    <Select name="type" defaultValue={editingPartner?.type || 'kupac'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kupac">Kupac</SelectItem>
                        <SelectItem value="dobavljac">Dobavljač</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Section */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Kontakt podaci</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('partners.partnerAddress')}</Label>
                    <Input name="address" defaultValue={editingPartner?.address || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('partners.partnerCity')}</Label>
                    <Input name="city" defaultValue={editingPartner?.city || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Poštanski broj</Label>
                    <Input name="zipCode" defaultValue={editingPartner?.zipCode || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('partners.partnerPhone')}</Label>
                    <Input name="phone" defaultValue={editingPartner?.phone || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.email')}</Label>
                    <Input name="email" type="email" defaultValue={editingPartner?.email || ''} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Section */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Finansijski podaci</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('partners.bankAccount')}</Label>
                    <Input name="account" placeholder="265-00000000-00" defaultValue={editingPartner?.account || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('partners.bank')}</Label>
                    <Input name="bank" defaultValue={editingPartner?.bank || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Kreditni limit (RSD)</Label>
                    <Input name="creditLimit" type="number" step="0.01" placeholder="0" defaultValue={editingPartner?.creditLimit || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Rok plaćanja (dana)</Label>
                    <Input name="paymentTerms" type="number" min="0" placeholder="0 = odmah" defaultValue={editingPartner?.paymentTerms || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Nadređna firma</Label>
                    <Select name="parentId" defaultValue={editingPartner?.parentId || ''}>
                      <SelectTrigger><SelectValue placeholder="Bez nadređne" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Bez nadređne</SelectItem>
                        {partners.filter((p) => p.id !== (editingPartner?.id || '')).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags & Notes */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tagovi i napomene</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Tagovi <span className="text-muted-foreground font-normal">(odvojeni zarezom)</span></Label>
                    <Input
                      placeholder="npr. VIP, IT sektor, stalni"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                    {tagInput && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {tagInput.split(',').map((tag, i) => {
                          const trimmed = tag.trim()
                          if (!trimmed) return null
                          return (
                            <Badge key={i} variant="outline" className={`text-[10px] px-2 py-0 ${getTagColor(i)}`}>
                              {trimmed}
                              <button type="button" className="ml-1 hover:text-red-500" onClick={() => {
                                const parts = tagInput.split(',').filter((_, j) => j !== i)
                                setTagInput(parts.join(', '))
                              }}>
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.notes')}</Label>
                    <Textarea
                      name="notes"
                      placeholder="Napomene o partneru..."
                      rows={3}
                      defaultValue={editingPartner?.notes || ''}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? t('common.saving') : editingPartner ? t('common.saveChanges') : t('partners.createPartner')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
              </div>
            </form>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('common.name')}</TableHead>
                    <TableHead className="text-xs">PIB</TableHead>
                    <TableHead className="text-xs">{t('common.type')}</TableHead>
                    <TableHead className="text-xs">{t('partners.partnerCity')}</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Tagovi</TableHead>
                    <TableHead className="text-xs text-center">Fak.</TableHead>
                    <TableHead className="text-xs text-center hidden md:table-cell">Kon.</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                    <TableHead className="text-xs text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                        {t('partners.noPartners')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((p) => {
                      const tags = parseTags(p.tags)
                      return (
                        <TableRow key={p.id} className={!p.isActive ? 'opacity-50' : ''}>
                          <TableCell className="text-xs font-medium truncate max-w-[160px]">{tc(p.name)}</TableCell>
                          <TableCell className="text-xs font-mono">{p.pib || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${TYPE_COLORS[p.type] || ''}`}>
                              {TYPE_LABELS[p.type] || p.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{p.city ? tc(p.city) : '-'}</TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">
                            {tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={tag} variant="outline" className={`text-[9px] px-1.5 py-0 ${getTagColor(i)}`}>
                                    {tag}
                                  </Badge>
                                ))}
                                {tags.length > 3 && (
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">+{tags.length - 3}</Badge>
                                )}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">{p._count.invoices}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-center hidden md:table-cell">
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">{p._count.contacts}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <button
                              onClick={() => handleToggleActive(p)}
                              className="inline-flex"
                              title={p.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                            >
                              <div className={`w-5 h-3 rounded-full relative transition-colors ${p.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-transform ${p.isActive ? 'left-2.5' : 'left-0.5'}`} />
                              </div>
                            </button>
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(p)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> {t('common.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Obrisati partnera <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?<br />
              <span className="text-xs">{t('common.cannotUndo')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function AnalitikaTab() {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [analytics, setAnalytics] = useState<PartnerAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [partnerDetail, setPartnerDetail] = useState<Partner | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Load partner list
  useEffect(() => {
    async function load() {
      setLoadingPartners(true)
      const res = await fetch('/api/partners')
      const data = await res.json()
      setPartners(data)
      setLoadingPartners(false)
    }
    load()
  }, [])

  // Load analytics when partner selected
  const handleSelectPartner = useCallback(async (partnerId: string) => {
    setSelectedId(partnerId)
    if (!partnerId) { setAnalytics(null); setPartnerDetail(null); return }
    setAnalyticsLoading(true)
    setDetailLoading(true)
    try {
      const [analyticsRes, detailRes] = await Promise.all([
        fetch(`/api/partners/${partnerId}/analytics`),
        fetch(`/api/partners/${partnerId}`),
      ])
      const analyticsData = await analyticsRes.json()
      const detailData = await detailRes.json()
      setAnalytics(analyticsData)
      setPartnerDetail(detailData)
    } catch {
      toast.error('Greška pri učitavanju analitike')
    } finally {
      setAnalyticsLoading(false)
      setDetailLoading(false)
    }
  }, [])

  const selectedPartner = partners.find((p) => p.id === selectedId)

  return (
    <div className="space-y-4">
      {/* Partner selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Analitika partnera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedId} onValueChange={handleSelectPartner}>
            <SelectTrigger>
              <SelectValue placeholder="Izaberite partnera za analitiku..." />
            </SelectTrigger>
            <SelectContent>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} {p.pib ? `(${p.pib})` : ''} — {TYPE_LABELS[p.type] || p.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {analyticsLoading || detailLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : analytics && partnerDetail ? (
        <div className="space-y-4">
          {/* Partner Info Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-semibold">{tc(partnerDetail.name)}</span>
                    {!partnerDetail.isActive && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0 bg-red-50 text-red-600 border-red-200">Neaktivan</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {partnerDetail.pib && (
                      <span className="text-sm font-mono text-muted-foreground">PIB: {partnerDetail.pib}</span>
                    )}
                    {partnerDetail.maticniBr && (
                      <span className="text-sm font-mono text-muted-foreground">MB: {partnerDetail.maticniBr}</span>
                    )}
                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${TYPE_COLORS[partnerDetail.type] || ''}`}>
                      {TYPE_LABELS[partnerDetail.type] || partnerDetail.type}
                    </Badge>
                    {partnerDetail.parent && (
                      <span className="text-xs text-muted-foreground">→ {tc(partnerDetail.parent.name)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground mt-2">
                    {partnerDetail.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {partnerDetail.city ? `${tc(partnerDetail.address)}, ${tc(partnerDetail.city)}` : tc(partnerDetail.address)}
                      </span>
                    )}
                    {partnerDetail.phone && (
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{partnerDetail.phone}</span>
                    )}
                    {partnerDetail.email && (
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{partnerDetail.email}</span>
                    )}
                    {partnerDetail.account && (
                      <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />{partnerDetail.account}</span>
                    )}
                    {partnerDetail.bank && (
                      <span className="flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" />{tc(partnerDetail.bank)}</span>
                    )}
                  </div>
                  {partnerDetail.tags && parseTags(partnerDetail.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {parseTags(partnerDetail.tags).map((tag, i) => (
                        <Badge key={tag} variant="outline" className={`text-[10px] px-2 py-0 ${getTagColor(i)}`}>{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {partnerDetail.creditLimit > 0 && (
                    <div className="text-xs space-y-0.5">
                      <p className="text-muted-foreground">Kreditni limit</p>
                      <p className="text-base font-semibold">{formatRSD(partnerDetail.creditLimit)}</p>
                      <p className="text-muted-foreground">Rok: {partnerDetail.paymentTerms} dana</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{t('partners.totalInvoices')}</p>
              <p className="text-lg font-semibold mt-1">{formatRSD(analytics.summary.totalInvoiceAmount)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{analytics.summary.invoiceCount} {t('partners.invoicesCount')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-emerald-600 font-medium">{t('partners.paidInvoices')}</p>
              <p className="text-lg font-semibold mt-1 text-emerald-600">{formatRSD(analytics.summary.paidInvoiceAmount)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {analytics.summary.invoiceCount > 0 ? `${Math.round((analytics.summary.paidInvoiceAmount / analytics.summary.totalInvoiceAmount) * 100)}%` : '0%'} {t('partners.ofTotal')}
              </p>
            </Card>
            <Card className="p-4 border-red-200 bg-red-50/50">
              <p className="text-xs text-red-600 font-medium">{t('partners.unpaidInvoices')}</p>
              <p className="text-lg font-semibold mt-1 text-red-600">{formatRSD(analytics.summary.unpaidInvoiceAmount)}</p>
              <p className="text-[10px] text-red-500 mt-0.5">
                {analytics.summary.invoiceCount > 0 ? `${Math.round((analytics.summary.unpaidInvoiceAmount / analytics.summary.totalInvoiceAmount) * 100)}%` : '0%'} {t('partners.ofTotal')}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{t('partners.totalProcurement')}</p>
              <p className="text-lg font-semibold mt-1">{formatRSD(analytics.summary.totalPurchaseAmount)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{analytics.summary.purchaseOrderCount} {t('partners.ordersCount')}</p>
            </Card>
          </div>

          {/* Contact persons + Child companies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" /> Osobe kontakta ({partnerDetail._count.contacts})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!partnerDetail.contacts || partnerDetail.contacts.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nema kontakata. Dodajte u CRM modulu.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {partnerDetail.contacts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs font-medium">{c.firstName} {c.lastName}</p>
                          {c.position && <p className="text-[10px] text-muted-foreground">{c.position}</p>}
                        </div>
                        <div className="text-right text-[10px] text-muted-foreground">
                          {c.phone && <p>{c.phone}</p>}
                          {c.email && <p>{c.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Povezane firme ({partnerDetail._count.children})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!partnerDetail.children || partnerDetail.children.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nema podređenih firmi.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {partnerDetail.children.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs font-medium">{tc(c.name)}</p>
                          {c.city && <p className="text-[10px] text-muted-foreground">{tc(c.city)}</p>}
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${TYPE_COLORS[c.type] || ''}`}>
                          {TYPE_LABELS[c.type] || c.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> {t('partners.recentInvoices')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recentInvoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('partners.noInvoices')}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Broj</TableHead>
                        <TableHead className="text-xs">Tip</TableHead>
                        <TableHead className="text-xs">{t('common.date')}</TableHead>
                        <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                        <TableHead className="text-xs text-center">{t('common.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.recentInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="text-xs font-mono">{inv.number}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-[10px] px-2 py-0">
                              {inv.type === 'izlazna' ? 'Izlazna' : inv.type === 'ulazna' ? 'Ulazna' : 'Predračun'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(inv.date)}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatRSD(inv.totalAmount)}</TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(inv.status)}`}>
                              {getStatusLabel(inv.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchase Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" /> {t('partners.recentOrders')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recentPurchaseOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('partners.noOrders')}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Broj</TableHead>
                        <TableHead className="text-xs">{t('common.date')}</TableHead>
                        <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                        <TableHead className="text-xs text-center">{t('common.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.recentPurchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="text-xs font-mono">{po.number}</TableCell>
                          <TableCell className="text-xs">{formatDate(po.date)}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatRSD(po.totalAmount)}</TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(po.status)}`}>
                              {getStatusLabel(po.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Notes */}
          {analytics.deliveryNotes && analytics.deliveryNotes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Otpremnice ({analytics.deliveryNotes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Broj</TableHead>
                        <TableHead className="text-xs">{t('common.date')}</TableHead>
                        <TableHead className="text-xs text-center">Stavke</TableHead>
                        <TableHead className="text-xs text-right">Ukupno</TableHead>
                        <TableHead className="text-xs text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.deliveryNotes.map((dn) => (
                        <TableRow key={dn.id}>
                          <TableCell className="text-xs font-mono">{dn.number}</TableCell>
                          <TableCell className="text-xs">{formatDate(dn.date)}</TableCell>
                          <TableCell className="text-xs text-center">{dn.itemCount}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatRSD(dn.total)}</TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(dn.status)}`}>
                              {getStatusLabel(dn.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : selectedId ? null : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Izaberite partnera iznad da prikažete detaljnu analitiku</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
