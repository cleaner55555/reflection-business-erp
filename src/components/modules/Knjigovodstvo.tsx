'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  Landmark,
  FilePenLine,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  PiggyBank,
  Scale,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Account {
  id: string
  code: string
  name: string
  type: string
  description?: string | null
  parentCode?: string | null
  isActive: boolean
  _count?: { entries: number }
}

interface JournalEntry {
  id: string
  date: string
  accountCode: string
  debit: number
  credit: number
  description: string
  documentRef?: string | null
  account: { code: string; name: string }
}

interface JournalRow {
  tempId: string
  accountCode: string
  debit: number
  credit: number
}

const ACCOUNT_TYPES = [
  { value: 'aktivna', label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pasivna', label: 'Pasivna', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prihodka', label: 'Prihodna', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'rashodna', label: 'Rashodna', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'kontna', label: 'Kontna', color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const

function getAccountTypeBadge(type: string) {
  const found = ACCOUNT_TYPES.find((t) => t.value === type)
  return found || { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200' }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Knjigovodstvo() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('accounting.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('accounting.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="glavna-knjiga" className="space-y-4">
        <TabsList>
          <TabsTrigger value="glavna-knjiga" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('accounting.generalLedger')}</span>
          </TabsTrigger>
          <TabsTrigger value="kontni-plan" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('accounting.chartOfAccounts')}</span>
          </TabsTrigger>
          <TabsTrigger value="nalog" className="gap-1.5">
            <FilePenLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('accounting.journalEntries')}</span>
          </TabsTrigger>
          <TabsTrigger value="budzeti" className="gap-1.5">
            <PiggyBank className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Budžeti</span>
          </TabsTrigger>
          <TabsTrigger value="bruto-bilans" className="gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bruto Bilans</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glavna-knjiga">
          <GlavnaKnjigaTab />
        </TabsContent>
        <TabsContent value="kontni-plan">
          <KontniPlanTab />
        </TabsContent>
        <TabsContent value="nalog">
          <NalogTab />
        </TabsContent>
        <TabsContent value="budzeti">
          <BudzetiTab />
        </TabsContent>
        <TabsContent value="bruto-bilans">
          <BrutoBilansTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Tab 1: Glavna Knjiga ────────────────────────────────────────────────────

function GlavnaKnjigaTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  const fetchAccounts = useCallback(async () => {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data)
  }, [])

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (accountFilter) params.set('accountCode', accountFilter)
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    const res = await fetch(`/api/journal-entries?${params.toString()}`)
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }, [search, accountFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    if (entries.length > 0) {
      translateTexts(entries.flatMap(e => [e.description].filter(Boolean)))
    }
  }, [entries])

  useEffect(() => {
    if (accounts.length > 0) {
      translateTexts(accounts.map(a => a.name).filter(Boolean))
    }
  }, [accounts])

  const totalDebit = entries.reduce((acc, e) => acc + (e.debit || 0), 0)
  const totalCredit = entries.reduce((acc, e) => acc + (e.credit || 0), 0)

  const handleNew = () => {
    setEditingEntry(null)
    setViewMode('form')
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingEntry(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('accounting.confirmDeleteEntry'))) return
    try {
      const res = await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('accounting.entryDeleted'))
      fetchEntries()
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      accountCode: fd.get('accountCode') as string,
      debit: Number(fd.get('debit')) || 0,
      credit: Number(fd.get('credit')) || 0,
      description: fd.get('description') as string,
      documentRef: (fd.get('documentRef') as string) || null,
      date: fd.get('date') as string,
    }

    if (!body.accountCode || !body.description) {
      toast.error(t('accounting.accountAndDescriptionRequired'))
      setSubmitting(false)
      return
    }

    try {
      const isEditing = !!editingEntry
      const url = isEditing ? `/api/journal-entries/${editingEntry.id}` : '/api/journal-entries'
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
      toast.success(isEditing ? t('accounting.entryUpdated') : t('accounting.entryCreated'))
      setViewMode('list')
      setEditingEntry(null)
      fetchEntries()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {editingEntry ? t('common.edit') : t('accounting.newEntry')}
              </CardTitle>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t('accounting.generalLedger')}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('accounting.ledgerSubtitle')}
                </p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}>
                <Plus className="h-4 w-4" /> {t('common.new')} {t('accounting.entry')}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('accounting.searchPlaceholder')}
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={accountFilter || 'all'}
                onValueChange={(v) => setAccountFilter(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder={t('accounting.allAccounts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('accounting.allAccounts')}</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.code} value={acc.code}>
                      {acc.code} — {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="w-[150px] h-9"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Od"
              />
              <Input
                type="date"
                className="w-[150px] h-9"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Do"
              />
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form
            onSubmit={handleSubmit}
            key={editingEntry?.id || 'new'}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.date')}</Label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={editingEntry ? editingEntry.date.split('T')[0] : today}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.account')}</Label>
                <Select
                  name="accountCode"
                  defaultValue={editingEntry?.accountCode || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('accounting.selectAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.code} value={acc.code}>
                        {acc.code} — {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.debit')} (RSD)</Label>
                <Input
                  name="debit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  defaultValue={editingEntry?.debit || ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.credit')} (RSD)</Label>
                <Input
                  name="credit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  defaultValue={editingEntry?.credit || ''}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.description')}</Label>
              <Input
                name="description"
                placeholder={t('accounting.entryDescription')}
                required
                defaultValue={editingEntry?.description || ''}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('accounting.document')} ({t('common.optional').toLowerCase()})</Label>
              <Input
                name="documentRef"
                placeholder={t('accounting.documentNumber')}
                defaultValue={editingEntry?.documentRef || ''}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting
                  ? t('common.saving')
                  : editingEntry
                    ? t('common.saveChanges')
                    : t('accounting.createEntry')}
              </Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[100px]">{t('common.date')}</TableHead>
                  <TableHead className="text-xs w-[90px]">{t('accounting.account')}</TableHead>
                  <TableHead className="text-xs">{t('accounting.accountName')}</TableHead>
                  <TableHead className="text-xs text-right w-[130px]">{t('accounting.debit')}</TableHead>
                  <TableHead className="text-xs text-right w-[130px]">{t('accounting.credit')}</TableHead>
                  <TableHead className="text-xs">{t('common.description')}</TableHead>
                  <TableHead className="text-xs w-[100px]">{t('accounting.document')}</TableHead>
                  <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground text-sm"
                    >
                      Nema stavki za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium">
                          {entry.accountCode}
                        </TableCell>
                        <TableCell className="text-xs max-w-[160px] truncate">
                          {tc(entry.account?.name || entry.accountCode)}
                        </TableCell>
                        <TableCell
                          className={`text-xs text-right font-medium whitespace-nowrap ${
                            entry.debit > 0
                              ? 'text-emerald-700'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {entry.debit > 0 ? formatRSD(entry.debit) : '-'}
                        </TableCell>
                        <TableCell
                          className={`text-xs text-right font-medium whitespace-nowrap ${
                            entry.credit > 0
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {entry.credit > 0 ? formatRSD(entry.credit) : '-'}
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {tc(entry.description)}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {entry.documentRef || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(entry)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow className="bg-muted/50 font-semibold border-t-2">
                      <TableCell
                        colSpan={3}
                        className="text-xs text-right font-bold"
                      >
                        {t('common.total')}:
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-emerald-700 whitespace-nowrap">
                        {totalDebit > 0 ? formatRSD(totalDebit) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-red-600 whitespace-nowrap">
                        {totalCredit > 0 ? formatRSD(totalCredit) : '-'}
                      </TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Tab 2: Kontni Plan ──────────────────────────────────────────────────────

function KontniPlanTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    if (accounts.length > 0) {
      translateTexts(accounts.flatMap(a => [a.name, a.description].filter(Boolean)))
    }
  }, [accounts])

  const filtered = accounts.filter((acc) => {
    const matchSearch =
      !search ||
      acc.code.toLowerCase().includes(search.toLowerCase()) ||
      acc.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || acc.type === typeFilter
    return matchSearch && matchType
  })

  const handleNew = () => {
    setEditingAccount(null)
    setViewMode('form')
  }

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingAccount(null)
  }

  const handleDeleteClick = (acc: Account) => {
    setDeleteTarget(acc)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/accounts/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('accounting.accountDeleted', { code: deleteTarget.code }))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchAccounts()
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      description: (fd.get('description') as string) || null,
      parentCode: (fd.get('parentCode') as string) || null,
    }

    if (!body.code || !body.name) {
      toast.error(t('accounting.codeAndNameRequired'))
      setSubmitting(false)
      return
    }

    try {
      const isEditing = !!editingAccount
      const url = isEditing ? `/api/accounts/${editingAccount.id}` : '/api/accounts'
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
      toast.success(
        isEditing
          ? t('accounting.accountUpdated', { code: body.code })
          : t('accounting.accountCreated', { code: body.code })
      )
      setViewMode('list')
      setEditingAccount(null)
      fetchAccounts()
    } catch {
      toast.error(t('common.saveError'))
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
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <CardTitle className="text-base font-semibold">
                  {editingAccount ? t('accounting.editAccount') : t('accounting.newAccount')}
                </CardTitle>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    {t('accounting.chartOfAccounts')}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('accounting.chartOfAccountsSubtitle')}
                  </p>
                </div>
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> {t('accounting.newAccount')}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('accounting.searchAccounts')}
                    className="pl-8 h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={typeFilter || 'all'}
                  onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder={t('accounting.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('accounting.allTypes')}</SelectItem>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs h-9 px-3 flex items-center">
                  {t('common.total')}: {filtered.length} {t('accounting.accounts')}
                </Badge>
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form
              onSubmit={handleSubmit}
              key={editingAccount?.id || 'new'}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('accounting.accountCode')}</Label>
                  <Input
                    name="code"
                    placeholder="npr. 020, 110, 200"
                    required
                    defaultValue={editingAccount?.code || ''}
                    disabled={!!editingAccount}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('accounting.accountType')}</Label>
                  <Select
                    name="type"
                    defaultValue={editingAccount?.type || 'aktivna'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.accountName')}</Label>
                <Input
                  name="name"
                  placeholder={t('accounting.accountName')}
                  required
                  defaultValue={editingAccount?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.parentAccount')} ({t('common.optional').toLowerCase()})</Label>
                <Input
                  name="parentCode"
                  placeholder={t('accounting.parentAccountCode')}
                  defaultValue={editingAccount?.parentCode || ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.description')} ({t('common.optional').toLowerCase()})</Label>
                <Input
                  name="description"
                  placeholder={t('accounting.accountDescription')}
                  defaultValue={editingAccount?.description || ''}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting
                    ? t('common.saving')
                    : editingAccount
                      ? t('common.saveChanges')
                      : t('accounting.createAccount')}
                </Button>
              </div>
            </form>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[90px]">{t('accounting.code')}</TableHead>
                    <TableHead className="text-xs">{t('common.name')}</TableHead>
                    <TableHead className="text-xs w-[100px]">{t('common.type')}</TableHead>
                    <TableHead className="text-xs">{t('common.description')}</TableHead>
                    <TableHead className="text-xs w-[60px] text-center">
                      {t('accounting.entries')}
                    </TableHead>
                    <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground text-sm"
                      >
                        {t('accounting.noAccounts')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((acc) => {
                      const typeBadge = getAccountTypeBadge(acc.type)
                      return (
                        <TableRow key={acc.id}>
                          <TableCell className="text-xs font-mono font-medium">
                            {acc.code}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {tc(acc.name)}
                            {acc.parentCode && (
                              <span className="text-muted-foreground ml-1.5">
                                (→ {acc.parentCode})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0 ${typeBadge.color}`}
                            >
                              {typeBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {tc(acc.description) || '-'}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">
                              {acc._count?.entries || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEdit(acc)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(acc)}
                              >
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

      {/* Delete confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t('common.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('accounting.confirmDeleteAccount')}{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.code} — {tc(deleteTarget?.name)}
              </span>
              ?<br />
              {t('common.cannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t('accounting.deleteAccount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Tab 3: Nalog za Knjiženje ───────────────────────────────────────────────

function NalogTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  // Form state
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [documentRef, setDocumentRef] = useState('')
  const [rows, setRows] = useState<JournalRow[]>([
    { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
    { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
  ])

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true)
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data)
    setLoadingAccounts(false)
  }, [])

  const fetchRecentEntries = useCallback(async () => {
    setLoadingRecent(true)
    const res = await fetch('/api/journal-entries?_limit=20')
    const data = await res.json()
    setRecentEntries(data)
    setLoadingRecent(false)
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchRecentEntries()
  }, [fetchAccounts, fetchRecentEntries])

  useEffect(() => {
    if (recentEntries.length > 0) {
      translateTexts(recentEntries.flatMap(e => [e.description, e.account?.name].filter(Boolean)))
    }
  }, [recentEntries])

  // Row management
  const addRow = () => {
    setRows([
      ...rows,
      { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
    ])
  }

  const removeRow = (tempId: string) => {
    if (rows.length <= 2) {
      toast.error(t('accounting.minTwoRows'))
      return
    }
    setRows(rows.filter((r) => r.tempId !== tempId))
  }

  const updateRow = (tempId: string, field: keyof JournalRow, value: string | number) => {
    setRows(
      rows.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    )
  }

  // Totals
  const totalDebit = rows.reduce((acc, r) => acc + (r.debit || 0), 0)
  const totalCredit = rows.reduce((acc, r) => acc + (r.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0
  const difference = Math.abs(totalDebit - totalCredit)

  // Validation
  const hasEmptyAccount = rows.some((r) => !r.accountCode)
  const hasNoValues = rows.every((r) => r.debit === 0 && r.credit === 0)

  const canSubmit =
    isBalanced &&
    !hasEmptyAccount &&
    !hasNoValues &&
    description.trim() !== ''

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!isBalanced) {
        toast.error(
          `t('accounting.totalDebit') i potražuje moraju biti jednaki. ${t('accounting.difference')}: ${formatRSD(difference)}`
        )
      } else if (hasEmptyAccount) {
        toast.error(t('accounting.allRowsNeedAccount'))
      } else if (hasNoValues) {
        toast.error(t('accounting.enterAmounts'))
      } else if (!description.trim()) {
        toast.error(t('accounting.descriptionRequired'))
      }
      return
    }

    setSubmitting(true)
    try {
      const entries = rows
        .filter((r) => r.debit > 0 || r.credit > 0)
        .map((r) => ({
          accountCode: r.accountCode,
          debit: r.debit,
          credit: r.credit,
          description,
          documentRef: documentRef || null,
          date: new Date(date).toISOString(),
        }))

      // Create entries one by one
      for (const entry of entries) {
        const res = await fetch('/api/journal-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.error || t('common.saveError'))
          setSubmitting(false)
          return
        }
      }

      toast.success(
        `t('accounting.entryPosted') + ' — ' + entries.length + ' ' + t('accounting.entries').toLowerCase()`
      )

      // Reset form
      setDescription('')
      setDocumentRef('')
      setDate(today)
      setRows([
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
      ])

      fetchRecentEntries()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Journal Entry Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FilePenLine className="h-4 w-4" />
            {t('accounting.journalEntries')}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('accounting.journalEntryHint')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('accounting.entryDate')}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                {t('accounting.entryDescription')} <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={t('accounting.entryDescriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('accounting.documentRefOptional')}</Label>
              <Input
                placeholder="npr. FAK-001/2025"
                value={documentRef}
                onChange={(e) => setDocumentRef(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Dynamic rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('accounting.entryItems')}
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={addRow}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('common.addRow')}
              </Button>
            </div>

            {/* Table header for mobile-friendly list */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_40px] gap-2 px-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('accounting.account')}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                {t('accounting.debit')} (RSD)
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                {t('accounting.credit')} (RSD)
              </span>
              <span />
            </div>

            <div className="space-y-2">
              {loadingAccounts ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                rows.map((row, idx) => (
                  <div
                    key={row.tempId}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_40px] gap-2 items-start"
                  >
                    <div className="space-y-1">
                      <span className="sm:hidden text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Konto
                      </span>
                      <Select
                        value={row.accountCode}
                        onValueChange={(v) =>
                          updateRow(row.tempId, 'accountCode', v)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue
                            placeholder={
                              idx === 0
                                ? t('accounting.debitSide')
                                : idx === 1
                                  ? t('accounting.creditSide')
                                  : t('accounting.selectAccount')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.code} value={acc.code}>
                              <span className="font-mono text-xs mr-1.5">
                                {acc.code}
                              </span>
                              — {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="sm:hidden text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        {t('accounting.debit')} (RSD)
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10 text-emerald-700 font-medium"
                        value={row.debit || ''}
                        onChange={(e) =>
                          updateRow(
                            row.tempId,
                            'debit',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="sm:hidden text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        {t('accounting.credit')} (RSD)
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10 text-red-600 font-medium"
                        value={row.credit || ''}
                        onChange={(e) =>
                          updateRow(
                            row.tempId,
                            'credit',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end sm:items-start pt-1 sm:pt-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => removeRow(row.tempId)}
                        disabled={rows.length <= 2}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals bar */}
            <div className="rounded-lg border bg-muted/30 p-4 mt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-6">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      t('accounting.totalDebit')
                    </span>
                    <p className="text-sm font-bold text-emerald-700">
                      {formatRSD(totalDebit)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Ukupno potražuje
                    </span>
                    <p className="text-sm font-bold text-red-600">
                      {formatRSD(totalCredit)}
                    </p>
                  </div>
                </div>

                {/* Balance indicator */}
                <div className="flex items-center gap-2">
                  {totalDebit === 0 && totalCredit === 0 ? (
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 border-slate-300 text-slate-500"
                    >
                      t('accounting.enterAmounts')
                    </Badge>
                  ) : isBalanced ? (
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      t('accounting.balanceOk')
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      t('accounting.difference') + ': ' + formatRSD(difference)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="gap-2 min-w-[200px]"
              size="lg"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  t('accounting.posting')
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  t('accounting.postEntry')
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recently posted entries */}
      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              t('accounting.recentEntries')
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              t('accounting.recentEntriesSubtitle')
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[100px]">{t('common.date')}</TableHead>
                    <TableHead className="text-xs w-[90px]">{t('accounting.account')}</TableHead>
                    <TableHead className="text-xs">Naziv konta</TableHead>
                    <TableHead className="text-xs text-right w-[130px]">
                      {t('accounting.debit')}
                    </TableHead>
                    <TableHead className="text-xs text-right w-[130px]">
                      {t('accounting.credit')}
                    </TableHead>
                    <TableHead className="text-xs">{t('common.description')}</TableHead>
                    <TableHead className="text-xs w-[100px]">{t('accounting.document')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground text-sm"
                      >
                        t('accounting.noEntries')
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentEntries.slice(0, 15).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium">
                          {entry.accountCode}
                        </TableCell>
                        <TableCell className="text-xs max-w-[140px] truncate">
                          {tc(entry.account?.name || entry.accountCode)}
                        </TableCell>
                        <TableCell
                          className={`text-xs text-right font-medium whitespace-nowrap ${
                            entry.debit > 0
                              ? 'text-emerald-700'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {entry.debit > 0 ? formatRSD(entry.debit) : '-'}
                        </TableCell>
                        <TableCell
                          className={`text-xs text-right font-medium whitespace-nowrap ${
                            entry.credit > 0
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {entry.credit > 0 ? formatRSD(entry.credit) : '-'}
                        </TableCell>
                        <TableCell className="text-xs max-w-[180px] truncate">
                          {tc(entry.description)}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {entry.documentRef || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab 4: Budžeti ──────────────────────────────────────────────────────────

interface BudgetItem {
  id: string; accountCode: string; accountName: string
  january: number; february: number; march: number; april: number
  may: number; june: number; july: number; august: number
  september: number; october: number; november: number; december: number
}

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const

function BudzetiTab() {
  const { t } = useTranslation()
  const [items, setItems] = useState<BudgetItem[]>([
    { id: crypto.randomUUID(), accountCode: '200', accountName: 'Prihodi od prodaje', january: 0, february: 0, march: 0, april: 0, may: 0, june: 0, july: 0, august: 0, september: 0, october: 0, november: 0, december: 0 },
    { id: crypto.randomUUID(), accountCode: '410', accountName: 'Troškovi materijala', january: 0, february: 0, march: 0, april: 0, may: 0, june: 0, july: 0, august: 0, september: 0, october: 0, november: 0, december: 0 },
    { id: crypto.randomUUID(), accountCode: '420', accountName: 'Troškovi zarada', january: 0, february: 0, march: 0, april: 0, may: 0, june: 0, july: 0, august: 0, september: 0, october: 0, november: 0, december: 0 },
  ])
  const [actuals, setActuals] = useState<Record<string, Record<string, number>>>({})

  const updateItem = (id: string, month: string, value: number): void => {
    setItems(items.map((item) => item.id === id ? { ...item, [month]: value } : item))
  }

  const addRow = (): void => {
    setItems([...items, { id: crypto.randomUUID(), accountCode: '', accountName: 'Novi kont', january: 0, february: 0, march: 0, april: 0, may: 0, june: 0, july: 0, august: 0, september: 0, october: 0, november: 0, december: 0 }])
  }

  const removeRow = (id: string): void => {
    setItems(items.filter((i) => i.id !== id))
  }

  const totals = MONTH_KEYS.reduce((acc: Record<string, number>, m: string) => {
    acc[m] = items.reduce((s: number, i: BudgetItem) => s + (i[m] || 0), 0)
    return acc
  }, {})

  const yearlyTotal = Object.values(totals).reduce((s: number, v) => s + v, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-sm font-semibold flex items-center gap-2"><PiggyBank className="h-4 w-4" />Budžeti - Plan vs Realizacija</h3><p className="text-[10px] text-muted-foreground">Godišnji budžetski plan po kontima i mesecima</p></div>
        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={addRow}><Plus className="h-3 w-3" />Dodaj kont</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sticky left-0 bg-background min-w-[140px]">Konto</TableHead>
                  {MONTH_KEYS.map((m: string, idx: number) => (
                    <TableHead key={m} className="text-[10px] min-w-[90px] text-center">{t(`common.month_${idx + 1}`)}</TableHead>
                  ))}
                  <TableHead className="text-[10px] min-w-[90px] text-center font-bold">Ukupno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: BudgetItem) => {
                  const rowTotal = MONTH_KEYS.reduce((s: number, m: string) => s + (item[m] || 0), 0)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs sticky left-0 bg-background">
                        <div className="font-medium">{item.accountName}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">{item.accountCode}</div>
                      </TableCell>
                      {MONTH_KEYS.map((m: string) => (
                        <TableCell key={m} className="text-xs text-center p-1">
                          <Input type="number" className="h-7 text-xs text-center w-[80px] mx-auto" value={item[m] || ''} onChange={(e) => updateItem(item.id, m, Number(e.target.value) || 0)} />
                        </TableCell>
                      ))}
                      <TableCell className="text-xs text-center font-bold p-1">{formatRSD(rowTotal)}</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="bg-muted/50 font-bold border-t-2">
                  <TableCell className="text-xs sticky left-0 bg-muted/50">Ukupno</TableCell>
                  {MONTH_KEYS.map((m: string) => (
                    <TableCell key={m} className="text-xs text-center">{formatRSD(totals[m])}</TableCell>
                  ))}
                  <TableCell className="text-xs text-center">{formatRSD(yearlyTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab 5: Bruto Bilans (Trial Balance) ──────────────────────────────────────

function BrutoBilansTab() {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
      const [accRes, entryRes] = await Promise.all([fetch('/api/accounts'), fetch('/api/journal-entries')])
      const accData: Account[] = await accRes.json()
      const entryData: JournalEntry[] = await entryRes.json()

      const enriched = accData.map((acc) => {
        const accEntries = entryData.filter((e) => e.accountCode === acc.code)
        const debit = accEntries.reduce((s, e) => s + (e.debit || 0), 0)
        const credit = accEntries.reduce((s, e) => s + (e.credit || 0), 0)
        return { ...acc, debit, credit, balance: debit - credit }
      })
      setAccounts(enriched)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const totalDebit = accounts.reduce((s, a) => s + (a.debit || 0), 0)
  const totalCredit = accounts.reduce((s, a) => s + (a.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-sm font-semibold flex items-center gap-2"><Scale className="h-4 w-4" />Bruto Bilans (Trial Balance)</h3><p className="text-[10px] text-muted-foreground">Pregled stanja svih konta - saldo duguje/potražuje</p></div>
        <Badge variant={isBalanced ? 'default' : 'destructive'} className="text-xs">{isBalanced ? 'Bilans je u ravnoteži ✓' : 'Nije u ravnoteži!'}</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i: number) => <Skeleton key={i} className="h-8 w-full" />)}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] w-[80px]">Konto</TableHead>
                    <TableHead className="text-[10px]">Naziv</TableHead>
                    <TableHead className="text-[10px] w-[80px]">Tip</TableHead>
                    <TableHead className="text-[10px] text-right w-[120px]">Duguje</TableHead>
                    <TableHead className="text-[10px] text-right w-[120px]">Potražuje</TableHead>
                    <TableHead className="text-[10px] text-right w-[120px]">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => {
                    const typeBadge = getAccountTypeBadge(acc.type)
                    const hasData = (acc.debit || 0) > 0 || (acc.credit || 0) > 0
                    return (
                      <TableRow key={acc.id} className={hasData ? '' : 'opacity-50'}>
                        <TableCell className="text-xs font-mono">{acc.code}</TableCell>
                        <TableCell className="text-xs">{tc(acc.name)}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[9px] px-1.5 ${typeBadge.color}`}>{typeBadge.label}</Badge></TableCell>
                        <TableCell className="text-xs text-right text-emerald-700 font-medium">{(acc.debit || 0) > 0 ? formatRSD(acc.debit) : '-'}</TableCell>
                        <TableCell className="text-xs text-right text-red-600 font-medium">{(acc.credit || 0) > 0 ? formatRSD(acc.credit) : '-'}</TableCell>
                        <TableCell className={`text-xs text-right font-bold ${((acc.debit || 0) - (acc.credit || 0)) > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {formatRSD((acc.debit || 0) - (acc.credit || 0))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell colSpan={3} className="text-xs text-right">UKUPNO:</TableCell>
                    <TableCell className="text-xs text-right text-emerald-700">{formatRSD(totalDebit)}</TableCell>
                    <TableCell className="text-xs text-right text-red-600">{formatRSD(totalCredit)}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(totalDebit - totalCredit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
