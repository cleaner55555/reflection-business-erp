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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, BookOpen, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

interface Transaction {
  id: string
  date: string
  type: string
  category: string
  amount: number
  description: string
  documentRef: string | null
  partnerId: string | null
  createdAt: string
}

interface CashEntry {
  id: string
  date: string
  type: string
  amount: number
  description: string
  partnerName: string | null
  paymentMethod: string
  createdAt: string
}

interface JournalEntry {
  id: string
  date: string
  type: string
  description: string
  documentNumber: string | null
  partnerName: string | null
  debit: number
  credit: number
}

const JOURNAL_TYPE_OPTIONS = [
  { value: 'all', label: 'common.all' },
  { value: 'faktura_izlazna', label: 'invoices.outgoing' },
  { value: 'faktura_ulazna', label: 'invoices.incoming' },
  { value: 'predracun', label: 'invoices.preinvoice' },
  { value: 'transakcija', label: 'finance.transaction' },
  { value: 'kasa', label: 'finance.cashRegister' },
  { value: 'nabavka', label: 'finance.purchase' },
  { value: 'otpremnica', label: 'finance.deliveryNote' },
] as const

export function Finansije() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('finance.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('finance.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="transakcije" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transakcije">{t('finance.transactions')}</TabsTrigger>
          <TabsTrigger value="kasa">{t('finance.cashRegister')}</TabsTrigger>
          <TabsTrigger value="dnevnik">{t('finance.journal')}</TabsTrigger>
        </TabsList>

        <TabsContent value="transakcije">
          <TransakcijeTab />
        </TabsContent>
        <TabsContent value="kasa">
          <KasaTab />
        </TabsContent>
        <TabsContent value="dnevnik">
          <DnevnikTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransakcijeTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    const res = await fetch(`/api/transactions?${params.toString()}`)
    const data = await res.json()
    setTransactions(data)
    setLoading(false)
  }, [search, typeFilter, categoryFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    if (transactions.length === 0) return
    const texts = transactions.map((tx) => tx.description).filter(Boolean) as string[]
    if (texts.length > 0) translateTexts(texts)
  }, [transactions, translateTexts])

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setViewMode('form')
  }

  const handleNew = () => {
    setEditingTransaction(null)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingTransaction(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('finance.transactionDeleted'))
      fetchTransactions()
    } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      type: fd.get('type') as string,
      category: fd.get('category') as string,
      amount: fd.get('amount') as string,
      description: fd.get('description') as string,
      documentRef: fd.get('documentRef') as string,
    }
    try {
      const isEditing = !!editingTransaction
      const url = isEditing ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...body, date: editingTransaction.date } : body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('finance.transactionUpdated') : t('finance.transactionCreated'))
      setViewMode('list')
      setEditingTransaction(null)
      fetchTransactions()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <CardTitle className="text-base font-semibold">{editingTransaction ? t('finance.editTransaction') : t('finance.newTransaction')}</CardTitle>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('finance.transactions')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t('finance.allTransactionsDesc')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}>
              <Plus className="h-4 w-4" /> {t('finance.newTransaction')}
            </Button>
          </div>
        )}

        {/* Filters - only in list mode */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('finance.searchTransactions')}
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder={t('finance.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('finance.allTypes')}</SelectItem>
                <SelectItem value="prihod">{t('common.prihod')}</SelectItem>
                <SelectItem value="rashod">{t('common.rashod')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder={t('finance.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('finance.allCategories')}</SelectItem>
                <SelectItem value="promet">{t('finance.category_revenue')}</SelectItem>
                <SelectItem value="nabavka">{t('finance.purchase')}</SelectItem>
                <SelectItem value="plata">{t('finance.salary')}</SelectItem>
                <SelectItem value="režije">{t('finance.expenses')}</SelectItem>
                <SelectItem value="ostalo">{t('finance.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.type')}</Label>
                <Select name="type" defaultValue={editingTransaction?.type || 'prihod'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prihod">{t('common.prihod')}</SelectItem>
                    <SelectItem value="rashod">{t('common.rashod')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.category')}</Label>
                <Select name="category" defaultValue={editingTransaction?.category || 'promet'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promet">{t('finance.category_revenue')}</SelectItem>
                    <SelectItem value="nabavka">{t('finance.purchase')}</SelectItem>
                    <SelectItem value="plata">{t('finance.salary')}</SelectItem>
                    <SelectItem value="režije">{t('finance.expenses')}</SelectItem>
                    <SelectItem value="ostalo">{t('finance.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('finance.amountRSD')}</Label>
              <Input name="amount" type="number" step="0.01" placeholder="0.00" required defaultValue={editingTransaction?.amount ?? ''} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.description')}</Label>
              <Input name="description" placeholder={t('finance.transactionDescription')} required defaultValue={editingTransaction?.description || ''} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('finance.documentOptional')}</Label>
              <Input name="documentRef" placeholder={t('finance.documentNumber')} defaultValue={editingTransaction?.documentRef || ''} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : editingTransaction ? t('common.saveChanges') : t('finance.createTransaction')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.type')}</TableHead>
                  <TableHead className="text-xs">{t('common.category')}</TableHead>
                  <TableHead className="text-xs">{t('common.description')}</TableHead>
                  <TableHead className="text-xs">{t('finance.document')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                  <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      {t('finance.noTransactions')}
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs">{formatDate(t.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(t.type)}`}>
                          <span className="flex items-center gap-1">
                            {t.type === 'prihod' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                            {getStatusLabel(t.type)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{getStatusLabel(t.category)}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{tc(t.description)}</TableCell>
                      <TableCell className="text-xs">{t.documentRef || '-'}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${t.type === 'prihod' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'prihod' ? '+' : '-'}{formatRSD(t.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(t)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(t.id)}>
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
      </CardContent>
    </Card>
  )
}

function KasaTab() {
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null)
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/cash-register')
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  useEffect(() => {
    if (entries.length === 0) return
    const texts: string[] = []
    entries.forEach((e) => {
      if (e.description) texts.push(e.description)
      if (e.partnerName) texts.push(e.partnerName)
    })
    if (texts.length > 0) translateTexts(texts)
  }, [entries, translateTexts])

  const runningBalance = entries.reduce((acc, entry) => {
    return acc + (entry.type === 'ulaz' ? entry.amount : -entry.amount)
  }, 0)

  const handleEdit = (entry: CashEntry) => {
    setEditingEntry(entry)
    setViewMode('form')
  }

  const handleNew = () => {
    setEditingEntry(null)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingEntry(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const res = await fetch(`/api/cash-register/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('finance.entryDeleted'))
      fetchEntries()
    } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      type: fd.get('type') as string,
      amount: fd.get('amount') as string,
      description: fd.get('description') as string,
      partnerName: fd.get('partnerName') as string,
      paymentMethod: fd.get('paymentMethod') as string,
    }
    try {
      const isEditing = !!editingEntry
      const url = isEditing ? `/api/cash-register/${editingEntry.id}` : '/api/cash-register'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...body, date: editingEntry.date } : body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('finance.entryUpdated') : t('finance.cashEntryCreated'))
      setViewMode('list')
      setEditingEntry(null)
      fetchEntries()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <CardTitle className="text-base font-semibold">{editingEntry ? t('finance.editEntry') : t('finance.newCashEntry')}</CardTitle>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('finance.cashRegister')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t('finance.dailyCashStatements')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg px-4 py-2 text-sm font-bold ${runningBalance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {t('finance.balance')}: {formatRSD(runningBalance)}
                </div>
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> {t('finance.newEntry')}
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('common.type')}</Label>
                  <Select name="type" defaultValue={editingEntry?.type || 'ulaz'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ulaz">{t('finance.income')}</SelectItem>
                      <SelectItem value="izlaz">{t('finance.expense')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('finance.paymentMethod')}</Label>
                  <Select name="paymentMethod" defaultValue={editingEntry?.paymentMethod || 'gotovina'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gotovina">{t('finance.cash')}</SelectItem>
                      <SelectItem value="kartica">{t('finance.card')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('finance.amountRSD')}</Label>
                <Input name="amount" type="number" step="0.01" placeholder="0.00" required defaultValue={editingEntry?.amount ?? ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.description')}</Label>
                <Input name="description" placeholder={t('finance.entryDescription')} required defaultValue={editingEntry?.description || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('finance.partnerOptional')}</Label>
                <Input name="partnerName" placeholder={t('finance.partnerName')} defaultValue={editingEntry?.partnerName || ''} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('common.saving') : editingEntry ? t('common.saveChanges') : t('finance.createEntry')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
              </div>
            </form>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('common.date')}</TableHead>
                    <TableHead className="text-xs">{t('common.type')}</TableHead>
                    <TableHead className="text-xs">{t('common.description')}</TableHead>
                    <TableHead className="text-xs">{t('common.partner')}</TableHead>
                    <TableHead className="text-xs">{t('finance.payment')}</TableHead>
                    <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                    <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                        {t('finance.noEntries')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs">{formatDateTime(entry.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(entry.type)}`}>
                            {getStatusLabel(entry.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{tc(entry.description)}</TableCell>
                        <TableCell className="text-xs">{tc(entry.partnerName || '-')}</TableCell>
                        <TableCell className="text-xs">{getStatusLabel(entry.paymentMethod)}</TableCell>
                        <TableCell className={`text-xs text-right font-medium ${entry.type === 'ulaz' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {entry.type === 'ulaz' ? '+' : '-'}{formatRSD(entry.amount)}
                        </TableCell>
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

function DnevnikTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()

  const fetchJournal = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/journal?${params.toString()}`)
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }, [typeFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fetch data on mount / filter change
    fetchJournal()
  }, [fetchJournal])

  useEffect(() => {
    if (entries.length === 0) return
    const texts: string[] = []
    entries.forEach((e) => {
      if (e.description) texts.push(e.description)
      if (e.partnerName) texts.push(e.partnerName)
    })
    if (texts.length > 0) translateTexts(texts)
  }, [entries, translateTexts])

  const totalDebit = entries.reduce((acc, entry) => acc + (entry.debit || 0), 0)
  const totalCredit = entries.reduce((acc, entry) => acc + (entry.credit || 0), 0)
  const saldo = totalDebit - totalCredit

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('finance.journal')}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{t('finance.journalDesc')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`rounded-lg px-4 py-2 text-sm font-bold ${saldo >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {t('common.balance')}: {formatRSD(Math.abs(saldo))} {saldo < 0 ? `(${t('common.credit')})` : `(${t('common.debit')})`}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder={t('finance.allTypes')} />
            </SelectTrigger>
            <SelectContent>
              {JOURNAL_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.type')}</TableHead>
                  <TableHead className="text-xs">{t('common.description')}</TableHead>
                  <TableHead className="text-xs">{t('finance.document')}</TableHead>
                  <TableHead className="text-xs">{t('common.partner')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.debit')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.credit')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      {t('finance.noItems')}
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs">{formatDate(entry.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(entry.type)}`}>
                            {getStatusLabel(entry.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[250px] truncate">{tc(entry.description)}</TableCell>
                        <TableCell className="text-xs">{entry.documentNumber || '-'}</TableCell>
                        <TableCell className="text-xs">{tc(entry.partnerName || '-')}</TableCell>
                        <TableCell className={`text-xs text-right font-medium ${entry.debit > 0 ? 'text-blue-700' : 'text-muted-foreground'}`}>
                          {entry.debit > 0 ? formatRSD(entry.debit) : '-'}
                        </TableCell>
                        <TableCell className={`text-xs text-right font-medium ${entry.credit > 0 ? 'text-orange-700' : 'text-muted-foreground'}`}>
                          {entry.credit > 0 ? formatRSD(entry.credit) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Running totals row */}
                    <TableRow className="bg-muted/50 font-semibold border-t-2">
                      <TableCell colSpan={5} className="text-xs text-right">
                        {t('common.total')}:
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-blue-700">
                        {totalDebit > 0 ? formatRSD(totalDebit) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-orange-700">
                        {totalCredit > 0 ? formatRSD(totalCredit) : '-'}
                      </TableCell>
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
