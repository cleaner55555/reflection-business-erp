'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'
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
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
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

interface TrialBalanceAccount {
  id: string
  code: string
  name: string
  type: string
  parentCode?: string | null
  entryCount: number
  totalDebit: number
  totalCredit: number
  saldo: number
}

interface BudgetItem {
  id: string
  accountCode: string
  accountName: string
  january: number; february: number; march: number; april: number
  may: number; june: number; july: number; august: number
  september: number; october: number; november: number; december: number
}

const ACCOUNT_TYPES = [
  { value: 'aktivna', label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pasivna', label: 'Pasivna', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prihodka', label: 'Prihodna', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'rashodna', label: 'Rashodna', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'kontna', label: 'Kontna', color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const

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
        <TabsList className="flex-wrap h-auto gap-1">
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
  }, [entries, translateTexts])

  useEffect(() => {
    if (accounts.length > 0) {
      translateTexts(accounts.map(a => a.name).filter(Boolean))
    }
  }, [accounts, translateTexts])

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
          <form onSubmit={handleSubmit} key={editingEntry?.id || 'new'} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.date')}</Label>
                <Input name="date" type="date" required
                  defaultValue={editingEntry ? editingEntry.date.split('T')[0] : today} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.account')}</Label>
                <Select name="accountCode" defaultValue={editingEntry?.accountCode || ''}>
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
                <Input name="debit" type="number" step="0.01" min="0" placeholder="0.00"
                  defaultValue={editingEntry?.debit || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.credit')} (RSD)</Label>
                <Input name="credit" type="number" step="0.01" min="0" placeholder="0.00"
                  defaultValue={editingEntry?.credit || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.description')}</Label>
              <Input name="description" placeholder={t('accounting.entryDescription')} required
                defaultValue={editingEntry?.description || ''} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('accounting.document')} ({t('common.optional').toLowerCase()})</Label>
              <Input name="documentRef" placeholder={t('accounting.documentNumber')}
                defaultValue={editingEntry?.documentRef || ''} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t('common.saving') : editingEntry ? t('common.saveChanges') : t('accounting.createEntry')}
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
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                      Nema stavki za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-xs font-mono font-medium">{entry.accountCode}</TableCell>
                        <TableCell className="text-xs max-w-[160px] truncate">{tc(entry.account?.name || entry.accountCode)}</TableCell>
                        <TableCell className={`text-xs text-right font-medium whitespace-nowrap ${entry.debit > 0 ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                          {entry.debit > 0 ? formatRSD(entry.debit) : '-'}
                        </TableCell>
                        <TableCell className={`text-xs text-right font-medium whitespace-nowrap ${entry.credit > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {entry.credit > 0 ? formatRSD(entry.credit) : '-'}
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{tc(entry.description)}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.documentRef || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(entry)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold border-t-2">
                      <TableCell colSpan={3} className="text-xs text-right font-bold">{t('common.total')}:</TableCell>
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
  const [importing, setImporting] = useState(false)

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
  }, [accounts, translateTexts])

  const filtered = accounts.filter((acc) => {
    const matchSearch = !search || acc.code.toLowerCase().includes(search.toLowerCase()) || acc.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || acc.type === typeFilter
    return matchSearch && matchType
  })

  // Group by type
  const grouped = filtered.reduce<Record<string, Account[]>>((acc, item) => {
    const type = item.type || 'nepoznato'
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {})

  const handleNew = () => { setEditingAccount(null); setViewMode('form') }
  const handleEdit = (acc: Account) => { setEditingAccount(acc); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditingAccount(null) }

  const handleDeleteClick = (acc: Account) => { setDeleteTarget(acc); setDeleteDialogOpen(true) }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/accounts/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.deleteError')); return }
      toast.success(`${deleteTarget.code} obrisan`)
      setDeleteDialogOpen(false); setDeleteTarget(null); fetchAccounts()
    } catch { toast.error(t('common.deleteError')) }
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
    if (!body.code || !body.name) { toast.error('Šifra i naziv su obavezni'); setSubmitting(false); return }
    try {
      const isEditing = !!editingAccount
      const url = isEditing ? `/api/accounts/${editingAccount.id}` : '/api/accounts'
      const res = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(isEditing ? `Konto ${body.code} ažuriran` : `Konto ${body.code} kreiran`)
      setViewMode('list'); setEditingAccount(null); fetchAccounts()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

  const handleImportSerbian = async () => {
    setImporting(true)
    try {
      const res = await fetch('/api/accounts/import-serbian', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skipExisting: true }) })
      const data = await res.json()
      if (data.imported > 0) {
        toast.success(`Uvezeno ${data.imported} konta iz srpskog kontnog plana`)
        fetchAccounts()
      } else {
        toast.info(data.message || 'Svi kontovi su već uvezeni')
      }
    } catch { toast.error('Greška pri uvozu') } finally { setImporting(false) }
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
                  {editingAccount ? 'Izmeni konto' : 'Novi konto'}
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
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={handleImportSerbian} disabled={importing}>
                    {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {importing ? 'Uvoz...' : 'Uvezi srpski kontni plan'}
                  </Button>
                  <Button size="sm" className="gap-2" onClick={handleNew}>
                    <Plus className="h-4 w-4" /> Novi konto
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Pretraži konta..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Svi tipovi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    {ACCOUNT_TYPES.map((at) => (
                      <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs h-9 px-3 flex items-center">
                  Ukupno: {filtered.length} konta
                </Badge>
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} key={editingAccount?.id || 'new'} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Šifra konta</Label>
                  <Input name="code" placeholder="npr. 020, 110, 200" required defaultValue={editingAccount?.code || ''} disabled={!!editingAccount} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tip konta</Label>
                  <Select name="type" defaultValue={editingAccount?.type || 'aktivna'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((at) => (
                        <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Naziv konta</Label>
                <Input name="name" placeholder="Naziv konta" required defaultValue={editingAccount?.name || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Nadređeni konto (opciono)</Label>
                  <Input name="parentCode" placeholder="npr. 200" defaultValue={editingAccount?.parentCode || ''} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Opis (opciono)</Label>
                  <Input name="description" placeholder="Opis konta" defaultValue={editingAccount?.description || ''} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? t('common.saving') : editingAccount ? t('common.saveChanges') : 'Kreiraj konto'}
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
            <div className="max-h-[520px] overflow-y-auto space-y-4">
              {Object.entries(grouped).map(([type, accs]) => {
                const typeBadge = getAccountTypeBadge(type)
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeBadge.color}`}>{typeBadge.label}</Badge>
                      <span className="text-xs text-muted-foreground">({accs.length})</span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs w-[80px]">Šifra</TableHead>
                          <TableHead className="text-xs">Naziv</TableHead>
                          <TableHead className="text-xs w-[60px] text-center">Stavke</TableHead>
                          <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accs.map((acc) => (
                          <TableRow key={acc.id}>
                            <TableCell className="text-xs font-mono font-medium">{acc.code}</TableCell>
                            <TableCell className="text-xs font-medium">
                              {tc(acc.name)}
                              {acc.parentCode && (
                                <span className="text-muted-foreground ml-1.5">→ {acc.parentCode}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-center">
                              <Badge variant="secondary" className="text-[10px] px-2 py-0">{acc._count?.entries || 0}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(acc)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDeleteClick(acc)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nema konta za prikaz. Kliknite &quot;Uvezi srpski kontni plan&quot; da započnete.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" /> {t('common.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Obrisati konto <span className="font-semibold text-foreground">{deleteTarget?.code} — {tc(deleteTarget?.name)}</span>?<br />{t('common.cannotUndo')}
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

  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [documentRef, setDocumentRef] = useState('')
  const [partnerId, setPartnerId] = useState('')
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([])
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

  const fetchPartners = useCallback(async () => {
    const res = await fetch('/api/partners')
    const data = await res.json()
    setPartners((data || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
  }, [])

  const fetchRecentEntries = useCallback(async () => {
    setLoadingRecent(true)
    const res = await fetch('/api/journal-entries?_limit=30')
    const data = await res.json()
    setRecentEntries(data)
    setLoadingRecent(false)
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchRecentEntries()
    fetchPartners()
  }, [fetchAccounts, fetchRecentEntries, fetchPartners])

  useEffect(() => {
    if (recentEntries.length > 0) {
      translateTexts(recentEntries.flatMap(e => [e.description, e.account?.name].filter(Boolean)))
    }
  }, [recentEntries, translateTexts])

  const addRow = () => {
    setRows([...rows, { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 }])
  }

  const removeRow = (tempId: string) => {
    if (rows.length <= 2) { toast.error('Minimum 2 stavke'); return }
    setRows(rows.filter((r) => r.tempId !== tempId))
  }

  const updateRow = (tempId: string, field: keyof JournalRow, value: string | number) => {
    setRows(rows.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)))
  }

  const totalDebit = rows.reduce((acc, r) => acc + (r.debit || 0), 0)
  const totalCredit = rows.reduce((acc, r) => acc + (r.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0
  const difference = Math.abs(totalDebit - totalCredit)
  const hasEmptyAccount = rows.some((r) => !r.accountCode)
  const hasNoValues = rows.every((r) => r.debit === 0 && r.credit === 0)
  const canSubmit = isBalanced && !hasEmptyAccount && !hasNoValues && description.trim() !== ''

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!isBalanced) toast.error(`Duguje i potražuje moraju biti jednaki. Razlika: ${formatRSD(difference)}`)
      else if (hasEmptyAccount) toast.error('Sve stavke moraju imati konto')
      else if (hasNoValues) toast.error('Unesite iznose')
      else if (!description.trim()) toast.error('Opis je obavezan')
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
          partnerId: partnerId || null,
          date: new Date(date).toISOString(),
        }))

      const res = await fetch('/api/journal-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.saveError'))
        setSubmitting(false)
        return
      }

      toast.success(`Nalog knjižen — ${entries.length} stavki`)

      setDescription('')
      setDocumentRef('')
      setPartnerId('')
      setDate(today)
      setRows([
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
      ])
      fetchRecentEntries()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      {/* Journal Entry Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FilePenLine className="h-4 w-4" />
            Nalog za knjiženje
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kreirajte višestruke stavke knjiženja sa automatskom proverom ravnoteže
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Datum nalogu</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Opis <span className="text-red-500">*</span></Label>
              <Input placeholder="npr. Knjiženje fakture FAK-001/2025" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Dokument (opciono)</Label>
              <Input placeholder="npr. FAK-001/2025" value={documentRef} onChange={(e) => setDocumentRef(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Partner (opciono)</Label>
              <Select value={partnerId || 'none'} onValueChange={(v) => setPartnerId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberi partnera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez partnera</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dynamic rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Stavke naloga
              </Label>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={addRow}>
                <Plus className="h-3.5 w-3.5" /> Dodaj stavku
              </Button>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_40px] gap-2 px-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Konto</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">Duguje (RSD)</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">Potražuje (RSD)</span>
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
                  <div key={row.tempId} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_40px] gap-2 items-start">
                    <div className="space-y-1">
                      <span className="sm:hidden text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Konto</span>
                      <Select value={row.accountCode} onValueChange={(v) => updateRow(row.tempId, 'accountCode', v)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={idx === 0 ? 'Duguje strana' : idx === 1 ? 'Potražuje strana' : 'Izaberi konto'} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.code} value={acc.code}>
                              <span className="font-mono text-xs mr-1.5">{acc.code}</span> — {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="sm:hidden text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Duguje (RSD)</span>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" className="h-10 text-emerald-700 font-medium"
                        value={row.debit || ''} onChange={(e) => updateRow(row.tempId, 'debit', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-1">
                      <span className="sm:hidden text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Potražuje (RSD)</span>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" className="h-10 text-red-600 font-medium"
                        value={row.credit || ''} onChange={(e) => updateRow(row.tempId, 'credit', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="flex items-end sm:items-start pt-1 sm:pt-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => removeRow(row.tempId)} disabled={rows.length <= 2}>
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
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Ukupno duguje</span>
                    <p className="text-sm font-bold text-emerald-700">{formatRSD(totalDebit)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Ukupno potražuje</span>
                    <p className="text-sm font-bold text-red-600">{formatRSD(totalCredit)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {totalDebit === 0 && totalCredit === 0 ? (
                    <Badge variant="outline" className="text-xs px-3 py-1 border-slate-300 text-slate-500">Unesite iznose</Badge>
                  ) : isBalanced ? (
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> U ravnoteži ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 gap-1">
                      <AlertCircle className="h-3 w-3" /> Razlika: {formatRSD(difference)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting || !canSubmit} className="gap-2 min-w-[200px]" size="lg">
              {submitting ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Knjiženje...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Knjiži nalog</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recently posted entries */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Poslednje knjižene stavke</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Pregled nedavno knjiženih naloga</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fetchRecentEntries}>
              <RefreshCw className="h-3 w-3" /> Osveži
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[100px]">{t('common.date')}</TableHead>
                    <TableHead className="text-xs w-[80px]">Konto</TableHead>
                    <TableHead className="text-xs">Naziv konta</TableHead>
                    <TableHead className="text-xs text-right w-[120px]">Duguje</TableHead>
                    <TableHead className="text-xs text-right w-[120px]">Potražuje</TableHead>
                    <TableHead className="text-xs">{t('common.description')}</TableHead>
                    <TableHead className="text-xs w-[90px]">Dokument</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-sm">Nema knjiženih stavki</TableCell>
                    </TableRow>
                  ) : (
                    recentEntries.slice(0, 20).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-xs font-mono font-medium">{entry.accountCode}</TableCell>
                        <TableCell className="text-xs max-w-[140px] truncate">{tc(entry.account?.name || entry.accountCode)}</TableCell>
                        <TableCell className={`text-xs text-right font-medium whitespace-nowrap ${entry.debit > 0 ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                          {entry.debit > 0 ? formatRSD(entry.debit) : '-'}
                        </TableCell>
                        <TableCell className={`text-xs text-right font-medium whitespace-nowrap ${entry.credit > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {entry.credit > 0 ? formatRSD(entry.credit) : '-'}
                        </TableCell>
                        <TableCell className="text-xs max-w-[180px] truncate">{tc(entry.description)}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.documentRef || '-'}</TableCell>
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

function BudzetiTab() {
  const { t } = useTranslation()
  const { tc } = useContentTranslation()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      const res = await fetch('/api/accounts')
      const data = await res.json()
      setAccounts(data)
      // Initialize budget items from prihodna and rashodna accounts
      const budgetAccs = data.filter((a: Account) => a.type === 'prihodka' || a.type === 'rashodna')
      setBudgets(budgetAccs.map((a: Account) => ({
        id: crypto.randomUUID(),
        accountCode: a.code,
        accountName: a.name,
        january: 0, february: 0, march: 0, april: 0,
        may: 0, june: 0, july: 0, august: 0,
        september: 0, october: 0, november: 0, december: 0,
      })))
      setLoading(false)
    }
    fetchAccounts()
  }, [])

  const updateBudget = (id: string, month: string, value: number) => {
    setBudgets(budgets.map((b) => b.id === id ? { ...b, [month]: value } : b))
  }

  const addAccountRow = () => {
    const available = accounts.filter((a) => a.type === 'prihodka' || a.type === 'rashodna')
      .filter((a) => !budgets.some((b) => b.accountCode === a.code))
    if (available.length > 0) {
      const a = available[0]
      setBudgets([...budgets, {
        id: crypto.randomUUID(), accountCode: a.code, accountName: a.name,
        january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
        july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
      }])
    } else {
      toast.info('Svi prihodni/rashodni konti su već dodati')
    }
    setShowAddDialog(false)
  }

  const removeRow = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  const totals = MONTH_KEYS.reduce((acc: Record<string, number>, m: string) => {
    acc[m] = budgets.reduce((s: number, i: BudgetItem) => s + (i[m] || 0), 0)
    return acc
  }, {})

  const yearlyTotal = Object.values(totals).reduce((s: number, v) => s + v, 0)

  // Split into income and expense
  const incomeBudgets = budgets.filter((b) => {
    const acc = accounts.find((a) => a.code === b.accountCode)
    return acc?.type === 'prihodka'
  })
  const expenseBudgets = budgets.filter((b) => {
    const acc = accounts.find((a) => a.code === b.accountCode)
    return acc?.type === 'rashodna'
  })

  const incomeTotal = incomeBudgets.reduce((s, b) => s + MONTH_KEYS.reduce((ms, m) => ms + (b[m] || 0), 0), 0)
  const expenseTotal = expenseBudgets.reduce((s, b) => s + MONTH_KEYS.reduce((ms, m) => ms + (b[m] || 0), 0), 0)
  const netProfit = incomeTotal - expenseTotal

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2"><PiggyBank className="h-4 w-4" />Budžetski plan — Plan vs Realizacija</h3>
          <p className="text-[10px] text-muted-foreground">Godišnji budžet po kontima i mesecima</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={addAccountRow}>
            <Plus className="h-3 w-3" /> Dodaj kont
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Planirani prihodi
          </div>
          <p className="text-lg font-bold text-emerald-700">{formatRSD(incomeTotal)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-600" /> Planirani rashodi
          </div>
          <p className="text-lg font-bold text-red-600">{formatRSD(expenseTotal)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Scale className="h-3.5 w-3.5" /> Planirana dobit
          </div>
          <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatRSD(netProfit)}</p>
        </Card>
      </div>

      {/* Budget table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sticky left-0 bg-background min-w-[160px]">Konto</TableHead>
                  {MONTH_KEYS.map((m: string, idx: number) => (
                    <TableHead key={m} className="text-[10px] min-w-[90px] text-center">{t(`common.month_${idx + 1}`)}</TableHead>
                  ))}
                  <TableHead className="text-[10px] min-w-[90px] text-center font-bold">Ukupno</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground text-sm">
                      Nema prihodnih/rashodnih konta. Prvo kreirajte kontni plan.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {budgets.map((item: BudgetItem) => {
                      const rowTotal = MONTH_KEYS.reduce((s: number, m: string) => s + (item[m] || 0), 0)
                      const acc = accounts.find((a) => a.code === item.accountCode)
                      const isIncome = acc?.type === 'prihodka'
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs sticky left-0 bg-background">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className={`text-[8px] px-1 py-0 ${isIncome ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {isIncome ? 'P' : 'R'}
                              </Badge>
                              <div>
                                <div className="font-medium">{tc(item.accountName)}</div>
                                <div className="text-[9px] text-muted-foreground font-mono">{item.accountCode}</div>
                              </div>
                            </div>
                          </TableCell>
                          {MONTH_KEYS.map((m: string) => (
                            <TableCell key={m} className="text-xs text-center p-1">
                              <Input type="number" className="h-7 text-xs text-center w-[80px] mx-auto" value={item[m] || ''} onChange={(e) => updateBudget(item.id, m, Number(e.target.value) || 0)} />
                            </TableCell>
                          ))}
                          <TableCell className="text-xs text-center font-bold p-1">{formatRSD(rowTotal)}</TableCell>
                          <TableCell className="p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => removeRow(item.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="bg-muted/50 font-bold border-t-2">
                      <TableCell className="text-xs sticky left-0 bg-muted/50">Ukupno</TableCell>
                      {MONTH_KEYS.map((m: string) => (
                        <TableCell key={m} className="text-xs text-center">{formatRSD(totals[m])}</TableCell>
                      ))}
                      <TableCell className="text-xs text-center">{formatRSD(yearlyTotal)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}
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
  const { tc, translateTexts } = useContentTranslation()
  const [accounts, setAccounts] = useState<TrialBalanceAccount[]>([])
  const [summary, setSummary] = useState<{ totalDebit: number; totalCredit: number; difference: number; isBalanced: boolean; accountCount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    const fetchTrialBalance = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/accounts/trial-balance?${params.toString()}`)
      const data = await res.json()
      setAccounts(data.accounts || [])
      setSummary(data.summary || null)
      setLoading(false)
    }
    fetchTrialBalance()
  }, [dateFrom, dateTo, typeFilter])

  useEffect(() => {
    if (accounts.length > 0) {
      translateTexts(accounts.map((a) => a.name).filter(Boolean))
    }
  }, [accounts, translateTexts])

  // Group by account type
  const grouped = accounts.reduce<Record<string, TrialBalanceAccount[]>>((acc, item) => {
    const type = item.type || 'nepoznato'
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {})

  const typeTotals = Object.entries(grouped).reduce<Record<string, { debit: number; credit: number; saldo: number }>>((acc, [type, accs]) => {
    acc[type] = accs.reduce((s, a) => ({
      debit: s.debit + a.totalDebit,
      credit: s.credit + a.totalCredit,
      saldo: s.saldo + a.saldo,
    }), { debit: 0, credit: 0, saldo: 0 })
    return acc
  }, {})

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2"><Scale className="h-4 w-4" />Bruto Bilans (Trial Balance)</h3>
          <p className="text-[10px] text-muted-foreground">Pregled stanja svih konta — saldo duguje/potražuje</p>
        </div>
        {summary && (
          <Badge variant={summary.isBalanced ? 'default' : 'destructive'} className="text-xs">
            {summary.isBalanced ? '✓ Bilans u ravnoteži' : '✗ Nije u ravnoteži!'}
          </Badge>
        )}
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Ukupno duguje</div>
            <p className="text-base font-bold text-emerald-700">{formatRSD(summary.totalDebit)}</p>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Ukupno potražuje</div>
            <p className="text-base font-bold text-red-600">{formatRSD(summary.totalCredit)}</p>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Saldo</div>
            <p className={`text-base font-bold ${summary.difference >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatRSD(Math.abs(summary.difference))}
            </p>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Konta sa stavkama</div>
            <p className="text-base font-bold">{summary.accountCount} / {accounts.length + (accounts.length - summary.accountCount)}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input type="date" className="w-[160px] h-9" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Od" />
        <Input type="date" className="w-[160px] h-9" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Do" />
        <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Svi tipovi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi tipovi</SelectItem>
            {ACCOUNT_TYPES.map((at) => (
              <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trial balance table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] w-[80px]">Konto</TableHead>
                  <TableHead className="text-[10px]">Naziv</TableHead>
                  <TableHead className="text-[10px] w-[80px]">Tip</TableHead>
                  <TableHead className="text-[10px] w-[50px] text-center">St.</TableHead>
                  <TableHead className="text-[10px] text-right w-[120px]">Duguje</TableHead>
                  <TableHead className="text-[10px] text-right w-[120px]">Potražuje</TableHead>
                  <TableHead className="text-[10px] text-right w-[120px]">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(grouped).map(([type, accs]) => {
                  const typeBadge = getAccountTypeBadge(type)
                  const tt = typeTotals[type]
                  return (
                    <Fragment key={type}>
                      {/* Type header */}
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={4}>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeBadge.color}`}>
                            {typeBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold text-emerald-700">{formatRSD(tt.debit)}</TableCell>
                        <TableCell className="text-xs text-right font-semibold text-red-600">{formatRSD(tt.credit)}</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{formatRSD(tt.saldo)}</TableCell>
                      </TableRow>
                      {accs.map((acc) => {
                        const hasData = acc.totalDebit > 0 || acc.totalCredit > 0
                        return (
                          <TableRow key={acc.id} className={hasData ? '' : 'opacity-50'}>
                            <TableCell className="text-xs font-mono">{acc.code}</TableCell>
                            <TableCell className="text-xs">{tc(acc.name)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[9px] px-1.5 ${typeBadge.color}`}>{typeBadge.label}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-center">{acc.entryCount}</TableCell>
                            <TableCell className="text-xs text-right text-emerald-700 font-medium">{acc.totalDebit > 0 ? formatRSD(acc.totalDebit) : '-'}</TableCell>
                            <TableCell className="text-xs text-right text-red-600 font-medium">{acc.totalCredit > 0 ? formatRSD(acc.totalCredit) : '-'}</TableCell>
                            <TableCell className={`text-xs text-right font-bold ${acc.saldo > 0 ? 'text-emerald-700' : acc.saldo < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {acc.saldo !== 0 ? formatRSD(acc.saldo) : '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </Fragment>
                  )
                })}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema podataka. Kreirajte kontni plan i knjižite stavke.
                    </TableCell>
                  </TableRow>
                )}
                {/* Grand total */}
                {summary && (
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell colSpan={4} className="text-xs text-right">UKUPNO:</TableCell>
                    <TableCell className="text-xs text-right text-emerald-700">{formatRSD(summary.totalDebit)}</TableCell>
                    <TableCell className="text-xs text-right text-red-600">{formatRSD(summary.totalCredit)}</TableCell>
                    <TableCell className={`text-xs text-right ${summary.isBalanced ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatRSD(Math.abs(summary.difference))}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


