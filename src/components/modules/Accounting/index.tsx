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
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BarChart3,
  Eye,
  Calculator,
  PieChart,
  Lock,
  Unlock,
  Users,
  Filter,
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
  voucherNumber?: string | null
  fiscalYear?: number | null
  reconciled?: boolean
  partner?: { id: string; name: string } | null
  account: { code: string; name: string }
}

interface JournalRow {
  tempId: string
  accountCode: string
  debit: number
  credit: number
}

interface BudgetItem {
  id: string
  accountCode: string
  name: string
  year: number
  january: number; february: number; march: number; april: number
  may: number; june: number; july: number; august: number
  september: number; october: number; november: number; december: number
  totalAnnual: number
  notes?: string | null
  isActive: boolean
}

interface DashboardData {
  fiscalYear: number
  totalAssets: number
  totalLiabilities: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  totalEquity: number
  totalEntries: number
  totalAccounts: number
  totalBudget: number
  budgetCount: number
  recentEntries: JournalEntry[]
}

interface AccountStatement {
  account: { code: string; name: string; type: string }
  openingBalance: number
  closingBalance: number
  totalDebit: number
  totalCredit: number
  entryCount: number
  entries: Array<JournalEntry & { runningBalance: number }>
}

const ACCOUNT_TYPES = [
  { value: 'aktivna', label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pasivna', label: 'Pasivna', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prihodka', label: 'Prihodna', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'rashodna', label: 'Rashodna', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'kontna', label: 'Kontna', color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'] as const

function getAccountTypeBadge(type: string) {
  const found = ACCOUNT_TYPES.find((t) => t.value === type)
  return found || { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200' }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Accounting() {
  const { t } = useTranslation()
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('accounting.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('accounting.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Fiskalna godina:</Label>
          <Select value={String(fiscalYear)} onValueChange={(v) => setFiscalYear(parseInt(v))}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2025, 2024, 2023, 2026].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pregled</span>
          </TabsTrigger>
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
          <TabsTrigger value="pdv" className="gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDV Prijava</span>
          </TabsTrigger>
          <TabsTrigger value="analitika" className="gap-1.5">
            <PieChart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analitika</span>
          </TabsTrigger>
          <TabsTrigger value="god-zatvaranje" className="gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">God. Zatvaranje</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pregled">
          <DashboardTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="glavna-knjiga">
          <GlavnaKnjigaTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="kontni-plan">
          <KontniPlanTab />
        </TabsContent>
        <TabsContent value="nalog">
          <NalogTab />
        </TabsContent>
        <TabsContent value="budzeti">
          <BudzetiTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="bruto-bilans">
          <BrutoBilansTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="pdv">
          <PdvTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="analitika">
          <AnalitikaTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="god-zatvaranje">
          <GodZatvaranjeTab fiscalYear={fiscalYear} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────

function DashboardTab({ fiscalYear }: { fiscalYear: number }) {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/accounting/dashboard?year=${fiscalYear}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [fiscalYear])

  useEffect(() => {
    const load = async () => { await fetchDashboard() }
    load()
  }, [fetchDashboard])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  const kpis = [
    { label: 'Ukupna imovina', value: data.totalAssets, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: null },
    { label: 'Obaveze', value: data.totalLiabilities, icon: ArrowDownRight, color: 'text-blue-600', bg: 'bg-blue-50', trend: null },
    { label: 'Prihodi', value: data.totalRevenue, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', trend: null },
    { label: 'Rashodi', value: data.totalExpenses, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50', trend: null },
    { label: 'Dobit / Gubitak', value: data.profit, icon: BarChart3, color: data.profit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: data.profit >= 0 ? 'bg-emerald-50' : 'bg-red-50', trend: data.profit >= 0 ? 'up' : 'down' },
    { label: 'Kapital', value: data.totalEquity, icon: Landmark, color: 'text-violet-600', bg: 'bg-violet-50', trend: null },
    { label: 'Stavki knjiženja', value: null, icon: Receipt, color: 'text-slate-600', bg: 'bg-slate-50', count: data.totalEntries },
    { label: 'Budžet', value: data.totalBudget, icon: PiggyBank, color: 'text-amber-600', bg: 'bg-amber-50', trend: null },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  {kpi.count !== undefined ? (
                    <p className="text-xl font-bold">{kpi.count}</p>
                  ) : (
                    <p className="text-xl font-bold">{formatRSD(kpi.value || 0)}</p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              {kpi.trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend === 'up' ? 'Dobit' : 'Gubitak'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Poslednje knjiženje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Nema stavki za prikaz</div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[90px]">Datum</TableHead>
                    <TableHead className="text-xs w-[100px]">Nalog</TableHead>
                    <TableHead className="text-xs w-[70px]">Konto</TableHead>
                    <TableHead className="text-xs text-right w-[110px]">Duguje</TableHead>
                    <TableHead className="text-xs text-right w-[110px]">Potražuje</TableHead>
                    <TableHead className="text-xs">Opis</TableHead>
                    <TableHead className="text-xs w-[80px]">Dokument</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                      <TableCell className="text-xs font-mono">{entry.voucherNumber || '-'}</TableCell>
                      <TableCell className="text-xs font-mono">{entry.accountCode}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-700 whitespace-nowrap">{entry.debit > 0 ? formatRSD(entry.debit) : '-'}</TableCell>
                      <TableCell className="text-xs text-right text-red-600 whitespace-nowrap">{entry.credit > 0 ? formatRSD(entry.credit) : '-'}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell className="text-xs">{entry.documentRef || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab: Glavna Knjiga (General Ledger) ──────────────────────────────────────

function GlavnaKnjigaTab({ fiscalYear }: { fiscalYear: number }) {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'statement'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [statement, setStatement] = useState<AccountStatement | null>(null)
  const [statementCode, setStatementCode] = useState('')

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
    if (fiscalYear) params.set('fiscalYear', String(fiscalYear))
    const res = await fetch(`/api/journal-entries?${params.toString()}`)
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }, [search, accountFilter, dateFrom, dateTo, fiscalYear])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])
  useEffect(() => { fetchEntries() }, [fetchEntries])

  useEffect(() => {
    if (entries.length > 0) translateTexts(entries.flatMap(e => [e.description].filter(Boolean)))
  }, [entries, translateTexts])

  const totalDebit = entries.reduce((acc, e) => acc + (e.debit || 0), 0)
  const totalCredit = entries.reduce((acc, e) => acc + (e.credit || 0), 0)

  const handleNew = () => { setEditingEntry(null); setViewMode('form') }
  const handleEdit = (entry: JournalEntry) => { setEditingEntry(entry); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditingEntry(null); setStatement(null) }

  const handleViewStatement = async (code: string) => {
    setStatementCode(code)
    setViewMode('statement')
    const from = `${fiscalYear}-01-01`
    const to = `${fiscalYear}-12-31`
    const res = await fetch(`/api/accounts/statement?accountCode=${code}&from=${from}&to=${to}`)
    const data = await res.json()
    setStatement(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('accounting.confirmDeleteEntry'))) return
    try {
      const res = await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.deleteError')); return }
      toast.success(t('accounting.entryDeleted'))
      fetchEntries()
    } catch { toast.error(t('common.deleteError')) }
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
      fiscalYear,
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
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(isEditing ? t('accounting.entryUpdated') : t('accounting.entryCreated'))
      setViewMode('list'); setEditingEntry(null); fetchEntries()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base font-semibold">
              {editingEntry ? t('common.edit') : t('accounting.newEntry')}
            </CardTitle>
          </div>
        ) : viewMode === 'statement' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <CardTitle className="text-base font-semibold">
                Konto kartica: {statementCode}
              </CardTitle>
              {statement && (
                <p className="text-xs text-muted-foreground">{statement.account.name} — {statement.account.type}</p>
              )}
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('accounting.searchPlaceholder')} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={accountFilter || 'all'} onValueChange={(v) => setAccountFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder={t('accounting.allAccounts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('accounting.allAccounts')}</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.code} value={acc.code}>{acc.code} — {acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" className="w-[140px] h-9" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input type="date" className="w-[140px] h-9" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
                <Input name="date" type="date" required defaultValue={editingEntry ? editingEntry.date.split('T')[0] : today} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.account')}</Label>
                <Select name="accountCode" defaultValue={editingEntry?.accountCode || ''}>
                  <SelectTrigger><SelectValue placeholder={t('accounting.selectAccount')} /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.code} value={acc.code}>{acc.code} — {acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.debit')} (RSD)</Label>
                <Input name="debit" type="number" step="0.01" min="0" placeholder="0.00" defaultValue={editingEntry?.debit || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('accounting.credit')} (RSD)</Label>
                <Input name="credit" type="number" step="0.01" min="0" placeholder="0.00" defaultValue={editingEntry?.credit || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.description')}</Label>
              <Input name="description" placeholder={t('accounting.entryDescription')} required defaultValue={editingEntry?.description || ''} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('accounting.document')} ({t('common.optional').toLowerCase()})</Label>
              <Input name="documentRef" placeholder={t('accounting.documentNumber')} defaultValue={editingEntry?.documentRef || ''} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t('common.saving') : editingEntry ? t('common.saveChanges') : t('accounting.createEntry')}
              </Button>
            </div>
          </form>
        ) : viewMode === 'statement' && statement ? (
          <div className="space-y-4">
            {/* Statement summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Početno stanje</p>
                <p className="text-sm font-bold">{formatRSD(statement.openingBalance)}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-[10px] text-emerald-700 uppercase font-medium">Ukupno duguje</p>
                <p className="text-sm font-bold text-emerald-700">{formatRSD(statement.totalDebit)}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-[10px] text-red-600 uppercase font-medium">Ukupno potražuje</p>
                <p className="text-sm font-bold text-red-600">{formatRSD(statement.totalCredit)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-[10px] text-blue-700 uppercase font-medium">Završno stanje</p>
                <p className={`text-sm font-bold ${statement.closingBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatRSD(statement.closingBalance)}
                </p>
              </div>
            </div>
            {/* Statement entries */}
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[90px]">Datum</TableHead>
                    <TableHead className="text-xs w-[100px]">Nalog</TableHead>
                    <TableHead className="text-xs text-right w-[110px]">Duguje</TableHead>
                    <TableHead className="text-xs text-right w-[110px]">Potražuje</TableHead>
                    <TableHead className="text-xs">Opis</TableHead>
                    <TableHead className="text-xs text-right w-[120px]">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">Nema stavki</TableCell>
                    </TableRow>
                  ) : (
                    statement.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-xs font-mono">{entry.voucherNumber || '-'}</TableCell>
                        <TableCell className="text-xs text-right text-emerald-700 whitespace-nowrap">{entry.debit > 0 ? formatRSD(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-xs text-right text-red-600 whitespace-nowrap">{entry.credit > 0 ? formatRSD(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{entry.description}</TableCell>
                        <TableCell className={`text-xs text-right font-semibold whitespace-nowrap ${entry.runningBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {formatRSD(entry.runningBalance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[90px]">{t('common.date')}</TableHead>
                  <TableHead className="text-xs w-[100px]">Nalog</TableHead>
                  <TableHead className="text-xs w-[80px]">{t('accounting.account')}</TableHead>
                  <TableHead className="text-xs text-right w-[120px]">{t('accounting.debit')}</TableHead>
                  <TableHead className="text-xs text-right w-[120px]">{t('accounting.credit')}</TableHead>
                  <TableHead className="text-xs">{t('common.description')}</TableHead>
                  <TableHead className="text-xs w-[100px]">{t('accounting.document')}</TableHead>
                  <TableHead className="text-xs w-[100px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema stavki za prikaz</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-xs font-mono">{entry.voucherNumber || '-'}</TableCell>
                        <TableCell className="text-xs font-mono font-medium cursor-pointer hover:text-primary" onClick={() => handleViewStatement(entry.accountCode)}>
                          {entry.accountCode}
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium text-emerald-700 whitespace-nowrap">{entry.debit > 0 ? formatRSD(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-xs text-right font-medium text-red-600 whitespace-nowrap">{entry.credit > 0 ? formatRSD(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{tc(entry.description)}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{entry.documentRef || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewStatement(entry.accountCode)} title="Konto kartica">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
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
                      <TableCell className="text-xs text-right font-bold text-emerald-700 whitespace-nowrap">{totalDebit > 0 ? formatRSD(totalDebit) : '-'}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-red-600 whitespace-nowrap">{totalCredit > 0 ? formatRSD(totalCredit) : '-'}</TableCell>
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

// ─── Tab: Kontni Plan ──────────────────────────────────────────────────────────

function KontniPlanTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'statement'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const [importing, setImporting] = useState(false)
  const [statement, setStatement] = useState<AccountStatement | null>(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])
  useEffect(() => {
    if (accounts.length > 0) translateTexts(accounts.flatMap(a => [a.name, a.description].filter(Boolean)))
  }, [accounts, translateTexts])

  const filtered = accounts.filter((acc) => {
    const matchSearch = !search || acc.code.toLowerCase().includes(search.toLowerCase()) || acc.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || acc.type === typeFilter
    return matchSearch && matchType
  })

  const grouped = filtered.reduce<Record<string, Account[]>>((acc, item) => {
    const type = item.type || 'nepoznato'
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {})

  const handleNew = () => { setEditingAccount(null); setViewMode('form') }
  const handleEdit = (acc: Account) => { setEditingAccount(acc); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditingAccount(null); setStatement(null) }
  const handleDeleteClick = (acc: Account) => { setDeleteTarget(acc); setDeleteDialogOpen(true) }

  const handleViewStatement = async (code: string) => {
    setViewMode('statement')
    const year = new Date().getFullYear()
    const res = await fetch(`/api/accounts/statement?accountCode=${code}&from=${year}-01-01&to=${year}-12-31`)
    const data = await res.json()
    setStatement(data)
  }

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
              <CardTitle className="text-base font-semibold">{editingAccount ? 'Izmeni konto' : 'Novi konto'}</CardTitle>
            </div>
          ) : viewMode === 'statement' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <CardTitle className="text-base font-semibold">Konto kartica: {statement?.account.code}</CardTitle>
                {statement && <p className="text-xs text-muted-foreground">{statement.account.name}</p>}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Landmark className="h-4 w-4" /> {t('accounting.chartOfAccounts')}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('accounting.chartOfAccountsSubtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={handleImportSerbian} disabled={importing}>
                    {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {importing ? 'Uvoz...' : 'Uvezi srpski plan'}
                  </Button>
                  <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> Novi konto</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Pretraži konta..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    {ACCOUNT_TYPES.map((at) => (<SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs h-9 px-3 flex items-center">Ukupno: {filtered.length} konta</Badge>
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
                    <SelectContent>{ACCOUNT_TYPES.map((at) => (<SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>))}</SelectContent>
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
          ) : viewMode === 'statement' && statement ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Početno stanje</p>
                  <p className="text-sm font-bold">{formatRSD(statement.openingBalance)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-[10px] text-emerald-700 uppercase font-medium">Ukupno duguje</p>
                  <p className="text-sm font-bold text-emerald-700">{formatRSD(statement.totalDebit)}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-[10px] text-red-600 uppercase font-medium">Ukupno potražuje</p>
                  <p className="text-sm font-bold text-red-600">{formatRSD(statement.totalCredit)}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-[10px] text-blue-700 uppercase font-medium">Završno stanje</p>
                  <p className={`text-sm font-bold ${statement.closingBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatRSD(statement.closingBalance)}</p>
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-[90px]">Datum</TableHead>
                      <TableHead className="text-xs w-[100px]">Nalog</TableHead>
                      <TableHead className="text-xs text-right w-[110px]">Duguje</TableHead>
                      <TableHead className="text-xs text-right w-[110px]">Potražuje</TableHead>
                      <TableHead className="text-xs">Opis</TableHead>
                      <TableHead className="text-xs text-right w-[120px]">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.entries.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">Nema stavki</TableCell></TableRow>
                    ) : (
                      statement.entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                          <TableCell className="text-xs font-mono">{entry.voucherNumber || '-'}</TableCell>
                          <TableCell className="text-xs text-right text-emerald-700 whitespace-nowrap">{entry.debit > 0 ? formatRSD(entry.debit) : '-'}</TableCell>
                          <TableCell className="text-xs text-right text-red-600 whitespace-nowrap">{entry.credit > 0 ? formatRSD(entry.credit) : '-'}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{entry.description}</TableCell>
                          <TableCell className={`text-xs text-right font-semibold whitespace-nowrap ${entry.runningBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatRSD(entry.runningBalance)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
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
                          <TableHead className="text-xs w-[120px]">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accs.map((acc) => (
                          <TableRow key={acc.id}>
                            <TableCell className="text-xs font-mono font-medium">{acc.code}</TableCell>
                            <TableCell className="text-xs font-medium">
                              {tc(acc.name)}
                              {acc.parentCode && <span className="text-muted-foreground ml-1.5">→ {acc.parentCode}</span>}
                            </TableCell>
                            <TableCell className="text-xs text-center">
                              <Badge variant="secondary" className="text-[10px] px-2 py-0">{acc._count?.entries || 0}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewStatement(acc.code)} title="Konto kartica"><Eye className="h-3.5 w-3.5" /></Button>
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
                  Nema konta za prikaz. Kliknite &quot;Uvezi srpski plan&quot; da započnete.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="h-5 w-5" /> {t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Obrisati konto <span className="font-semibold text-foreground">{deleteTarget?.code} — {tc(deleteTarget?.name)}</span>?<br />{t('common.cannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">Obriši</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Tab: Nalog za Knjiženje ───────────────────────────────────────────────────

function NalogTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [accounts, setAccounts] = useState<Account[]>([])
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
  const [lastVoucher, setLastVoucher] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data)
  }, [])

  const fetchPartners = useCallback(async () => {
    const res = await fetch('/api/partners')
    const data = await res.json()
    setPartners((data || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
  }, [])

  const fetchRecentEntries = useCallback(async () => {
    setLoadingRecent(true)
    const res = await fetch('/api/journal-entries?_limit=50')
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
    if (recentEntries.length > 0) translateTexts(recentEntries.flatMap(e => [e.description, e.account?.name].filter(Boolean)))
  }, [recentEntries, translateTexts])

  const addRow = () => setRows([...rows, { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 }])
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
      const entries = rows.filter((r) => r.debit > 0 || r.credit > 0).map((r) => ({
        accountCode: r.accountCode, debit: r.debit, credit: r.credit, description,
        documentRef: documentRef || null, partnerId: partnerId || null,
        date: new Date(date).toISOString(),
      }))

      const res = await fetch('/api/journal-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.saveError')); setSubmitting(false); return }

      const result = await res.json()
      toast.success(`Nalog ${result.voucherNumber} knjižen — ${entries.length} stavki`)
      setLastVoucher(result.voucherNumber)

      setDescription(''); setDocumentRef(''); setPartnerId(''); setDate(today)
      setRows([
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
      ])
      fetchRecentEntries()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FilePenLine className="h-4 w-4" /> Nalog za knjiženje
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Kreirajte višestruke stavke knjiženja sa automatskom proverom ravnoteže</p>
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
                  <SelectValue placeholder="Izaberite partnera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Bez partnera —</SelectItem>
                  {partners.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entry rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Stavke nalogu</Label>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={addRow}>
                <Plus className="h-3 w-3" /> Dodaj stavku
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs w-[200px]">Konto</TableHead>
                    <TableHead className="text-xs w-[130px] text-right">Duguje (RSD)</TableHead>
                    <TableHead className="text-xs w-[130px] text-right">Potražuje (RSD)</TableHead>
                    <TableHead className="text-xs w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={row.tempId}>
                      <TableCell className="py-1">
                        <Select value={row.accountCode || ''} onValueChange={(v) => updateRow(row.tempId, 'accountCode', v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Izaberi konto" /></SelectTrigger>
                          <SelectContent>
                            {accounts.map((acc) => (<SelectItem key={acc.code} value={acc.code}>{acc.code} — {acc.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Input type="number" step="0.01" min="0" className="h-8 text-xs text-right" placeholder="0.00"
                          value={row.debit || ''} onChange={(e) => updateRow(row.tempId, 'debit', Number(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell className="py-1">
                        <Input type="number" step="0.01" min="0" className="h-8 text-xs text-right" placeholder="0.00"
                          value={row.credit || ''} onChange={(e) => updateRow(row.tempId, 'credit', Number(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell className="py-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600"
                          onClick={() => removeRow(row.tempId)} disabled={rows.length <= 2}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Balance indicator */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">Ukupno duguje: <span className="font-bold text-emerald-700">{formatRSD(totalDebit)}</span></span>
                <span className="text-muted-foreground">Ukupno potražuje: <span className="font-bold text-red-600">{formatRSD(totalCredit)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3" /> U ravnoteži
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertCircle className="h-3 w-3" /> Razlika: {formatRSD(difference)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={!canSubmit || submitting}>
              {submitting ? 'Knjiženje...' : 'Knjiži nalog'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent journal entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Poslednji nalozi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[90px]">Datum</TableHead>
                    <TableHead className="text-xs w-[100px]">Nalog</TableHead>
                    <TableHead className="text-xs w-[70px]">Konto</TableHead>
                    <TableHead className="text-xs text-right w-[110px]">Duguje</TableHead>
                    <TableHead className="text-xs text-right w-[110px]">Potražuje</TableHead>
                    <TableHead className="text-xs">Opis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">Nema naloza</TableCell></TableRow>
                  ) : (
                    recentEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-xs font-mono">{entry.voucherNumber || '-'}</TableCell>
                        <TableCell className="text-xs font-mono">{entry.accountCode}</TableCell>
                        <TableCell className="text-xs text-right text-emerald-700">{entry.debit > 0 ? formatRSD(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-xs text-right text-red-600">{entry.credit > 0 ? formatRSD(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{tc(entry.description)}</TableCell>
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

// ─── Tab: Budžeti ──────────────────────────────────────────────────────────────

function BudzetiTab({ fiscalYear }: { fiscalYear: number }) {
  const { t } = useTranslation()
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/budgets?year=${fiscalYear}`)
    const data = await res.json()
    setBudgets(data)
    setLoading(false)
  }, [fiscalYear])

  const fetchAccounts = useCallback(async () => {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data)
  }, [])

  useEffect(() => { fetchBudgets(); fetchAccounts() }, [fetchBudgets, fetchAccounts])

  const handleNew = () => { setEditingBudget(null); setViewMode('form') }
  const handleEdit = (b: BudgetItem) => { setEditingBudget(b); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditingBudget(null) }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati budžet?')) return
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Budžet obrisan'); fetchBudgets() }
      else { const err = await res.json(); toast.error(err.error || 'Greška') }
    } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      accountCode: fd.get('accountCode') as string,
      year: fiscalYear,
      name: (fd.get('name') as string) || undefined,
      january: Number(fd.get('january')) || 0,
      february: Number(fd.get('february')) || 0,
      march: Number(fd.get('march')) || 0,
      april: Number(fd.get('april')) || 0,
      may: Number(fd.get('may')) || 0,
      june: Number(fd.get('june')) || 0,
      july: Number(fd.get('july')) || 0,
      august: Number(fd.get('august')) || 0,
      september: Number(fd.get('september')) || 0,
      october: Number(fd.get('october')) || 0,
      november: Number(fd.get('november')) || 0,
      december: Number(fd.get('december')) || 0,
      notes: (fd.get('notes') as string) || undefined,
    }

    if (!body.accountCode) { toast.error('Konto je obavezan'); setSubmitting(false); return }

    try {
      if (editingBudget) {
        const res = await fetch(`/api/budgets/${editingBudget.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (res.ok) toast.success('Budžet ažuriran')
        else { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      } else {
        const res = await fetch('/api/budgets', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (res.ok) toast.success('Budžet kreiran')
        else { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      }
      setViewMode('list'); setEditingBudget(null); fetchBudgets()
    } catch { toast.error('Greška pri čuvanju') } finally { setSubmitting(false) }
  }

  const totalAnnual = budgets.reduce((s, b) => s + (b.totalAnnual || 0), 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base font-semibold">{editingBudget ? 'Izmeni budžet' : 'Novi budžet'}</CardTitle>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PiggyBank className="h-4 w-4" /> Budžeti za {fiscalYear}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {budgets.length} budžeta — Ukupno: {formatRSD(totalAnnual)}
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> Novi budžet</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} key={editingBudget?.id || 'new'} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Konto *</Label>
                <Select name="accountCode" defaultValue={editingBudget?.accountCode || ''}>
                  <SelectTrigger><SelectValue placeholder="Izaberite konto" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (<SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Naziv (opciono)</Label>
                <Input name="name" placeholder="npr. Budžet za nabavku" defaultValue={editingBudget?.name || ''} />
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {MONTH_KEYS.map((month, idx) => (
                <div key={month} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{MONTH_LABELS[idx]}</Label>
                  <Input name={month} type="number" step="0.01" min="0" className="h-8 text-xs text-right"
                    defaultValue={editingBudget ? (editingBudget as Record<string, unknown>)[month] || '' : ''} />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Napomene (opciono)</Label>
              <Input name="notes" placeholder="Napomene" defaultValue={editingBudget?.notes || ''} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? t('common.saving') : 'Sačuvaj'}</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nema budžeta za {fiscalYear}. godinu</div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[80px]">Konto</TableHead>
                  <TableHead className="text-xs">Naziv</TableHead>
                  {MONTH_LABELS.map(m => (
                    <TableHead key={m} className="text-xs text-right w-[80px]">{m}</TableHead>
                  ))}
                  <TableHead className="text-xs text-right w-[100px]">Ukupno</TableHead>
                  <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs font-mono font-medium">{b.accountCode}</TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">{b.name}</TableCell>
                    {MONTH_KEYS.map(month => {
                      const val = (b as Record<string, unknown>)[month] as number || 0
                      return (
                        <TableCell key={month} className={`text-xs text-right whitespace-nowrap ${val > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {val > 0 ? formatRSD(val) : '-'}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-xs text-right font-bold whitespace-nowrap">{formatRSD(b.totalAnnual)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold border-t-2">
                  <TableCell colSpan={2} className="text-xs font-bold">{t('common.total')}:</TableCell>
                  {MONTH_KEYS.map(month => {
                    const monthTotal = budgets.reduce((s, b) => s + ((b as Record<string, unknown>)[month] as number || 0), 0)
                    return (
                      <TableCell key={month} className="text-xs text-right font-bold">{monthTotal > 0 ? formatRSD(monthTotal) : '-'}</TableCell>
                    )
                  })}
                  <TableCell className="text-xs text-right font-bold">{formatRSD(totalAnnual)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Tab: Bruto Bilans (Trial Balance) ────────────────────────────────────────

function BrutoBilansTab({ fiscalYear }: { fiscalYear: number }) {
  const { t } = useTranslation()
  const [data, setData] = useState<{ accounts: Array<{ code: string; name: string; type: string; entryCount: number; totalDebit: number; totalCredit: number; saldo: number }>; summary: { totalDebit: number; totalCredit: number; difference: number; isBalanced: boolean; accountCount: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const from = `${fiscalYear}-01-01`
      const to = `${fiscalYear}-12-31`
      const params = new URLSearchParams({ from, to })
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/accounts/trial-balance?${params.toString()}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    fetchData()
  }, [fiscalYear, typeFilter])

  if (loading || !data) {
    return <Card><CardContent className="p-6"><div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4" /> Bruto Bilans — {fiscalYear}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Pregled svih konta sa saldom</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                {ACCOUNT_TYPES.map((at) => (<SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Badge className={`text-xs ${data.summary.isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {data.summary.isBalanced ? '✓ Bilans u ravnoteži' : `✗ Razlika: ${formatRSD(Math.abs(data.summary.difference))}`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Ukupno duguje</p>
            <p className="text-sm font-bold text-emerald-700">{formatRSD(data.summary.totalDebit)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Ukupno potražuje</p>
            <p className="text-sm font-bold text-red-600">{formatRSD(data.summary.totalCredit)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Razlika</p>
            <p className={`text-sm font-bold ${Math.abs(data.summary.difference) < 0.01 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatRSD(Math.abs(data.summary.difference))}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Konta</p>
            <p className="text-sm font-bold">{data.summary.accountCount}</p>
          </div>
        </div>
        <div className="max-h-[450px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[80px]">Konto</TableHead>
                <TableHead className="text-xs">Naziv</TableHead>
                <TableHead className="text-xs w-[70px] text-center">Tip</TableHead>
                <TableHead className="text-xs w-[60px] text-center">Stav.</TableHead>
                <TableHead className="text-xs text-right w-[120px]">Duguje</TableHead>
                <TableHead className="text-xs text-right w-[120px]">Potražuje</TableHead>
                <TableHead className="text-xs text-right w-[120px]">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.accounts.map((acc) => {
                const typeBadge = getAccountTypeBadge(acc.type)
                return (
                  <TableRow key={acc.code}>
                    <TableCell className="text-xs font-mono font-medium">{acc.code}</TableCell>
                    <TableCell className="text-xs">{acc.name}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${typeBadge.color}`}>{typeBadge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">{acc.entryCount}</TableCell>
                    <TableCell className="text-xs text-right text-emerald-700 whitespace-nowrap">{acc.totalDebit > 0 ? formatRSD(acc.totalDebit) : '-'}</TableCell>
                    <TableCell className="text-xs text-right text-red-600 whitespace-nowrap">{acc.totalCredit > 0 ? formatRSD(acc.totalCredit) : '-'}</TableCell>
                    <TableCell className={`text-xs text-right font-semibold whitespace-nowrap ${acc.saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatRSD(acc.saldo)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tab: PDV Prijava ──────────────────────────────────────────────────────────

function PdvTab({ fiscalYear }: { fiscalYear: number }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(0) // 0 = full year

  const fetchPdv = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('year', String(fiscalYear))
      if (month > 0) params.set('month', String(month))
      const res = await fetch(`/api/accounting/pdv?${params.toString()}`)
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [fiscalYear, month])

  useEffect(() => { void fetchPdv() }, [fetchPdv])

  if (loading || !data) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  }

  const period = (data.period as { label: string })?.label || ''
  const output = data.output as { pdv20: number; pdv10: number; pdv0: number; total: number; osnovica: number }
  const input = data.input as { pdv20: number; pdv10: number; pdv0: number; total: number; osnovica: number }
  const settlement = data.settlement as { zaUplatu: number; naPovrat: number; saldo: number }
  const monthlyBreakdown = data.monthlyBreakdown as Array<{ month: number; label: string; output: number; input: number; saldo: number }> | null
  const partners = data.partners as Array<{ name: string; pdvOutput: number; pdvInput: number; count: number }> || []
  const accountSums = data.accountSums as Array<{ code: string; name: string; debit: number; credit: number }> || []

  const saldoPositive = settlement.saldo >= 0

  return (
    <div className="space-y-4">
      {/* Period selector + summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Celokupna godina {fiscalYear}</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {new Date(fiscalYear, i).toLocaleDateString('sr-Latn', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant={saldoPositive ? 'default' : 'destructive'} className="text-sm px-3 py-1">
          {saldoPositive ? 'PDV za uplatu' : 'PDV na povrat'}: {formatRSD(Math.abs(settlement.saldo))}
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-emerald-600 uppercase font-medium">PDV na promet (izlazni)</p>
            <p className="text-lg font-bold text-emerald-700">{formatRSD(output.total)}</p>
            <p className="text-[10px] text-emerald-600 mt-1">Osnovica: {formatRSD(output.osnovica)}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-blue-600 uppercase font-medium">PDV na nabavku (ulazni)</p>
            <p className="text-lg font-bold text-blue-700">{formatRSD(input.total)}</p>
            <p className="text-[10px] text-blue-600 mt-1">Osnovica: {formatRSD(input.osnovica)}</p>
          </CardContent>
        </Card>
        <Card className={saldoPositive ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-3">
            <p className={`text-[10px ${saldoPositive ? 'text-amber-600' : 'text-red-600'} uppercase font-medium`}>
              {saldoPositive ? 'PDV za uplatu' : 'PDV na povrat'}
            </p>
            <p className={`text-lg font-bold ${saldoPositive ? 'text-amber-700' : 'text-red-600'}`}>
              {formatRSD(Math.abs(settlement.saldo))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-violet-600 uppercase font-medium">Broj partnera</p>
            <p className="text-lg font-bold text-violet-700">{partners.length}</p>
            <p className="text-[10px] text-violet-600 mt-1">Sa PDV stavkama</p>
          </CardContent>
        </Card>
      </div>

      {/* Rate breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            PDV po stopama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-700">Izlazni PDV (po stopama):</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>20% stopa:</span><span className="font-medium">{formatRSD(output.pdv20)}</span></div>
                <div className="flex justify-between"><span>10% stopa:</span><span className="font-medium">{formatRSD(output.pdv10)}</span></div>
                <div className="flex justify-between"><span>Oslobođeno:</span><span className="font-medium">{formatRSD(output.pdv0)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Ukupno:</span><span>{formatRSD(output.total)}</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-600">Ulazni PDV (po stopama):</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>20% stopa:</span><span className="font-medium">{formatRSD(input.pdv20)}</span></div>
                <div className="flex justify-between"><span>10% stopa:</span><span className="font-medium">{formatRSD(input.pdv10)}</span></div>
                <div className="flex justify-between"><span>Ostalo:</span><span className="font-medium">{formatRSD(input.pdv0)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Ukupno:</span><span>{formatRSD(input.total)}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly breakdown (only for full year) */}
      {monthlyBreakdown && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Mesečni pregled {fiscalYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Mesec</TableHead>
                    <TableHead className="text-xs text-right">Izlazni</TableHead>
                    <TableHead className="text-xs text-right">Ulazni</TableHead>
                    <TableHead className="text-xs text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyBreakdown.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="text-xs font-medium">{m.label}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-700">{m.output > 0 ? formatRSD(m.output) : '-'}</TableCell>
                      <TableCell className="text-xs text-right text-blue-600">{m.input > 0 ? formatRSD(m.input) : '-'}</TableCell>
                      <TableCell className={`text-xs text-right font-semibold ${m.saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {m.saldo > 0 ? `+${formatRSD(m.saldo)}` : formatRSD(m.saldo)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold border-t-2">
                    <TableCell className="text-xs font-bold">Ukupno:</TableCell>
                    <TableCell className="text-xs text-right font-bold text-emerald-700">{formatRSD(monthlyBreakdown.reduce((s, m) => s + m.output, 0))}</TableCell>
                    <TableCell className="text-xs text-right font-bold text-blue-600">{formatRSD(monthlyBreakdown.reduce((s, m) => s + m.input, 0))}</TableCell>
                    <TableCell className="text-xs text-right font-bold">{formatRSD(monthlyBreakdown.reduce((s, m) => s + m.saldo, 0))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account detail */}
      {accountSums.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">PDV konta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[200px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Konto</TableHead>
                    <TableHead className="text-xs">Naziv</TableHead>
                    <TableHead className="text-xs text-right">Duguje</TableHead>
                    <TableHead className="text-xs text-right">Potražuje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountSums.map((a) => (
                    <TableRow key={a.code}>
                      <TableCell className="text-xs font-mono">{a.code}</TableCell>
                      <TableCell className="text-xs">{a.name}</TableCell>
                      <TableCell className="text-xs text-right">{a.debit > 0 ? formatRSD(a.debit) : '-'}</TableCell>
                      <TableCell className="text-xs text-right">{a.credit > 0 ? formatRSD(a.credit) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partneri sa PDV stavkama
              <Badge variant="secondary" className="text-xs">{partners.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[250px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Partner</TableHead>
                    <TableHead className="text-xs text-right">Izlazni PDV</TableHead>
                    <TableHead className="text-xs text-right">Ulazni PDV</TableHead>
                    <TableHead className="text-xs text-right">Stavki</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="text-xs font-medium">{p.name}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-700">{p.pdvOutput > 0 ? formatRSD(p.pdvOutput) : '-'}</TableCell>
                      <TableCell className="text-xs text-right text-blue-600">{p.pdvInput > 0 ? formatRSD(p.pdvInput) : '-'}</TableCell>
                      <TableCell className="text-xs text-right">{p.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Tab: Analitika ────────────────────────────────────────────────────────────

function AnalitikaTab({ fiscalYear }: { fiscalYear: number }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [dimension, setDimension] = useState<string>('partner')

  const fetchAnalitika = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/accounting/analitika?year=${fiscalYear}&dimension=${dimension}`)
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [fiscalYear, dimension])

  useEffect(() => { void fetchAnalitika() }, [fetchAnalitika])

  if (loading || !data) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  }

  const groups = (data.groups as Array<{ key: string; name: string; type: string; debit: number; credit: number; saldo: number; count: number; byAccountType: Record<string, number>; monthly: Record<string, number> }>) || []
  const partnerSummary = (data.partnerSummary as Array<{ id: string; name: string; type: string; total: number }>) || []
  const monthLabels = (data.monthLabels as string[]) || []

  return (
    <div className="space-y-4">
      {/* Dimension selector */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Grupiši po:</span>
        <div className="flex gap-2">
          {[
            { value: 'partner', label: 'Partneru' },
            { value: 'account', label: 'Kontu' },
            { value: 'type', label: 'Tipu konta' },
          ].map((d) => (
            <Button key={d.value} size="sm" variant={dimension === d.value ? 'default' : 'outline'} onClick={() => setDimension(d.value)}>
              {d.label}
            </Button>
          ))}
        </div>
        <Badge variant="outline" className="text-xs">{groups.length} grupa</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Ukupno duguje</p>
            <p className="text-lg font-bold">{formatRSD(data.totalDebit as number || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Ukupno potražuje</p>
            <p className="text-lg font-bold">{formatRSD(data.totalCredit as number || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Saldo</p>
            <p className={`text-lg font-bold ${(data.totalSaldo as number || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatRSD(data.totalSaldo as number || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Stavki ukupno</p>
            <p className="text-lg font-bold">{data.groupCount as number}</p>
          </CardContent>
        </Card>
      </div>

      {/* Groups table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Analitički pregled</CardTitle>
          <p className="text-xs text-muted-foreground">{dimension === 'partner' ? 'Po partnerima' : dimension === 'account' ? 'Po kontima' : 'Po tipu'}</p>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[200px]">Naziv</TableHead>
                  <TableHead className="text-xs text-right">Duguje</TableHead>
                  <TableHead className="text-xs text-right">Potražuje</TableHead>
                  <TableHead className="text-xs text-right">Saldo</TableHead>
                  <TableHead className="text-xs text-center">Stavki</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.slice(0, 50).map((g) => (
                  <TableRow key={g.key}>
                    <TableCell className="text-xs font-medium max-w-[200px] truncate">{g.name}</TableCell>
                    <TableCell className="text-xs text-right">{g.debit > 0 ? formatRSD(g.debit) : '-'}</TableCell>
                    <TableCell className="text-xs text-right">{g.credit > 0 ? formatRSD(g.credit) : '-'}</TableCell>
                    <TableCell className={`text-xs text-right font-semibold ${g.saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatRSD(g.saldo)}
                    </TableCell>
                    <TableCell className="text-xs text-center">{g.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Partner summary (only in non-partner dimension) */}
      {dimension !== 'partner' && partnerSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top partneri po prometu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {partnerSummary.slice(0, 10).map((p) => {
                const maxVal = partnerSummary[0]?.total || 1
                const pct = (p.total / maxVal) * 100
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.type}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max(pct, 1)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-right whitespace-nowrap">{formatRSD(p.total)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Tab: Godišnje Zatvaranje ────────────────────────────────────────────────

function GodZatvaranjeTab({ fiscalYear }: { fiscalYear: number }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/accounting/year-close?year=${fiscalYear}`)
    setData(await res.json())
    setLoading(false)
  }, [fiscalYear])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  if (loading || !data) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  }

  const isClosed = data.isClosed as boolean
  const profit = data.profit as number || 0
  const totalRevenue = data.totalRevenue as number || 0
  const totalExpenses = data.totalExpenses as number || 0
  const revenueAccounts = (data.revenueAccounts as Array<{ code: string; name: string; amount: number }>) || []
  const expenseAccounts = (data.expenseAccounts as Array<{ code: string; name: string; amount: number }>) || []

  const handleCloseYear = async () => {
    if (!confirm(`Da li ste sigurni da želite da zatvorite godinu ${fiscalYear}? Ovo će kreirati knjižne stavke za zatvaranje prihodnih i rashodnih konta i preneti dobit/gubitak na konto Godišnji rezultat.`)) return
    setClosing(true)
    try {
      const res = await fetch('/api/accounting/year-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: fiscalYear }),
      })
      const result = await res.json()
      if (res.ok) {
        toast.success(result.message || `Godišnje zatvaranje ${fiscalYear} uspešno`)
        fetchStatus()
      } else {
        toast.error(result.error || 'Greška pri zatvaranju')
      }
    } catch {
      toast.error('Greška pri zatvaranju')
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card className={isClosed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isClosed ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-semibold">
                Godišnje zatvaranje {fiscalYear}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isClosed
                  ? `Godina je zatvorena. Nalog zatvaranja: ${data.closingVoucher || '-'}`
                  : 'Godina još nije zatvorena. Kliknite dugme za automatsko zatvaranje prihodnih i rashodnih konta.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Ukupni prihodi</p>
            <p className="text-lg font-bold text-teal-600">{formatRSD(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Ukupni rashodi</p>
            <p className="text-lg font-bold text-orange-600">{formatRSD(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className={profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-3">
            <p className={`text-[10px uppercase font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profit >= 0 ? 'Dobit' : 'Gubitak'}
            </p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatRSD(profit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Marža</p>
            <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {totalRevenue > 0 ? `${((profit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {!isClosed && (
        <div className="space-y-4">
          {/* Revenue accounts */}
          {revenueAccounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-teal-700">Prihodni konti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Konto</TableHead>
                        <TableHead className="text-xs">Naziv</TableHead>
                        <TableHead className="text-xs text-right">Iznos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueAccounts.map((a) => (
                        <TableRow key={a.code}>
                          <TableCell className="text-xs font-mono">{a.code}</TableCell>
                          <TableCell className="text-xs">{a.name}</TableCell>
                          <TableCell className="text-xs text-right font-medium text-teal-700">{formatRSD(a.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expense accounts */}
          {expenseAccounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-orange-700">Rashodni konti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Konto</TableHead>
                        <TableHead className="text-xs">Naziv</TableHead>
                        <TableHead className="text-xs text-right">Iznos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseAccounts.map((a) => (
                        <TableRow key={a.code}>
                          <TableCell className="text-xs font-mono">{a.code}</TableCell>
                          <TableCell className="text-xs">{a.name}</TableCell>
                          <TableCell className="text-xs text-right font-medium text-orange-700">{formatRSD(a.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close button */}
          <div className="flex justify-end">
            <Button variant="destructive" className="gap-2" onClick={handleCloseYear} disabled={closing}>
              {closing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {closing ? 'Zatvaranje...' : `Zatvori godinu ${fiscalYear}`}
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogHeader>
              <AlertDialogTitle>Potvrda zatvaranje</AlertDialogTitle>
              <AlertDialogDescription>
                Da li ste sigurni? Ovo će:
                <br />• Zatvorati sve prihodne konte (postaviti nula saldo)
                <br />• Zatvoriti sve rashodne konte (postaviti nula saldo)
                <br />• Preneti dobit/gubitak na konto 130 (Godišnji rezultat)
                <br />• Kreirati nalog zatvaranja
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
