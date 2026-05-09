'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Switch } from '@/components/ui/switch'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Link2,
  Upload,
  RefreshCw,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  AlertTriangle,
  XCircle,
  Clock,
  CircleDot,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime } from '@/lib/helpers'
import { useTranslation } from '@/lib/i18n'

// ============ TYPES ============

interface BankAccount {
  id: string
  name: string
  bank: string | null
  account: string
  currency: string
  isActive: boolean
  balance: number
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
  _count?: { transactions: number }
}

interface BankTransaction {
  id: string
  bankAccountId: string
  date: string
  amount: number
  description: string
  reference: string | null
  counterpart: string | null
  category: string | null
  isReconciled: boolean
  invoiceId: string | null
  createdAt: string
  bankAccount: { id: string; name: string; account: string }
  invoice?: { id: string; number: string; totalAmount: number; status: string; partner: { name: string } | null } | null
}

interface SuggestedMatch {
  transactionId: string
  invoiceId: string
  confidence: number
  reason: string
  amount: number
  invoiceNumber: string
  partnerName: string
}

interface ReconcileResult {
  autoApplied: SuggestedMatch[]
  suggestedMatches: SuggestedMatch[]
  unmatched: string[]
  total: number
  autoMatched: number
  manualNeeded: number
}

interface Invoice {
  id: string
  number: string
  totalAmount: number
  status: string
  partner: { name: string } | null
}

// ============ MAIN COMPONENT ============

export function BankSync() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('bankSync.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('bankSync.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">{t('bankSync.tabAccounts')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('bankSync.tabTransactions')}</TabsTrigger>
          <TabsTrigger value="reconciliation">{t('bankSync.tabReconciliation')}</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountsTab />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
        <TabsContent value="reconciliation">
          <ReconciliationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============ ACCOUNTS TAB ============

function AccountsTab() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation()

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bank-accounts')
      const data = await res.json()
      setAccounts(data)
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleOpenNew = () => {
    setEditingAccount(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/bank-accounts/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('common.deleteSuccess'))
      fetchAccounts()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setDeleteId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      bank: fd.get('bank') as string,
      account: fd.get('account') as string,
      currency: fd.get('currency') as string,
      isActive: fd.get('isActive') !== 'false',
    }

    try {
      const isEditing = !!editingAccount
      const url = isEditing ? `/api/bank-accounts/${editingAccount.id}` : '/api/bank-accounts'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('common.saveSuccess'))
      setDialogOpen(false)
      setEditingAccount(null)
      fetchAccounts()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setSubmitting(false)
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0)

  return (
    <>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.totalAccounts')}</p>
                    <p className="text-xl font-bold">{accounts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.activeAccounts')}</p>
                    <p className="text-xl font-bold">{accounts.filter((a) => a.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Landmark className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.totalBalance')}</p>
                    <p className="text-xl font-bold">{formatRSD(totalBalance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Account cards */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('bankSync.bankAccounts')}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{t('bankSync.manageAccounts')}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={handleOpenNew}>
                <Plus className="h-4 w-4" /> {t('bankSync.addAccount')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-lg" />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <Landmark className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{t('bankSync.noAccounts')}</p>
                <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={handleOpenNew}>
                  <Plus className="h-4 w-4" /> {t('bankSync.addAccount')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {accounts.map((account) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <Card className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${account.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${account.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                                <Landmark className={`h-4 w-4 ${account.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold">{account.name}</h3>
                                {account.bank && <p className="text-xs text-muted-foreground">{account.bank}</p>}
                              </div>
                            </div>
                            <Badge variant={account.isActive ? 'default' : 'secondary'} className="text-xs">
                              {account.isActive ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('bankSync.accountNumber')}</span>
                              <span className="font-mono">{account.account}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('bankSync.currency')}</span>
                              <span className="font-medium">{account.currency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('bankSync.balance')}</span>
                              <span className={`font-bold ${account.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatRSD(account.balance)}
                              </span>
                            </div>
                            {account.lastSyncAt && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('bankSync.lastSync')}</span>
                                <span>{formatDateTime(account.lastSyncAt)}</span>
                              </div>
                            )}
                            {account._count && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('bankSync.transactions')}</span>
                                <span>{account._count.transactions}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 pt-2 border-t">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1" onClick={() => handleOpenEdit(account)}>
                              <Pencil className="h-3 w-3" /> {t('common.edit')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-red-500 hover:text-red-700"
                              onClick={() => setDeleteId(account.id)}
                            >
                              <Trash2 className="h-3 w-3" /> {t('common.delete')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? t('bankSync.editAccount') : t('bankSync.addAccount')}
            </DialogTitle>
            <DialogDescription>
              {editingAccount ? t('bankSync.editAccountDesc') : t('bankSync.addAccountDesc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs">{t('bankSync.accountName')} *</Label>
                <Input
                  name="name"
                  placeholder={t('bankSync.accountNamePlaceholder')}
                  required
                  defaultValue={editingAccount?.name || ''}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('bankSync.bankName')}</Label>
                  <Input
                    name="bank"
                    placeholder={t('bankSync.bankNamePlaceholder')}
                    defaultValue={editingAccount?.bank || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('bankSync.currency')}</Label>
                  <Select name="currency" defaultValue={editingAccount?.currency || 'RSD'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RSD">RSD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('bankSync.accountNumber')} *</Label>
                <Input
                  name="account"
                  placeholder="265-0000000000000-00"
                  required
                  defaultValue={editingAccount?.account || ''}
                />
              </div>
              {editingAccount && (
                <div className="flex items-center gap-3">
                  <Switch name="isActive" defaultChecked={editingAccount.isActive} />
                  <Label className="text-xs">{t('common.active')}</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('bankSync.deleteAccountTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('bankSync.deleteAccountDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ============ TRANSACTIONS TAB ============

function TransactionsTab() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [search, setSearch] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importAccountId, setImportAccountId] = useState('')
  const [importPreview, setImportPreview] = useState<string | null>(null)
  const [matchDialogOpen, setMatchDialogOpen] = useState(false)
  const [matchTransaction, setMatchTransaction] = useState<BankTransaction | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [matching, setMatching] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/bank-accounts')
      const data = await res.json()
      setAccounts(data)
    } catch { /* silent */ }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (accountFilter) params.set('bankAccountId', accountFilter)
      if (statusFilter) params.set('reconciled', statusFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (search) params.set('search', search)
      const res = await fetch(`/api/bank-transactions?${params.toString()}`)
      const data = await res.json()
      setTransactions(data)
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }, [accountFilter, statusFilter, dateFrom, dateTo, search, t])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setImportPreview(evt.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!importAccountId || !importPreview) return
    setImporting(true)
    try {
      const res = await fetch('/api/bank-transactions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId: importAccountId,
          csvContent: importPreview,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || t('bankSync.importError'))
        return
      }
      toast.success(
        t('bankSync.importSuccess', { imported: result.imported, failed: result.failed })
      )
      setImportDialogOpen(false)
      setImportPreview(null)
      setImportAccountId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchAccounts()
      fetchTransactions()
    } catch {
      toast.error(t('bankSync.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleOpenMatch = async (transaction: BankTransaction) => {
    setMatchTransaction(transaction)
    setSelectedInvoiceId('')
    setMatchDialogOpen(true)

    try {
      const res = await fetch('/api/invoices?status=poslata,nacrt&type=izlazna')
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch {
      setInvoices([])
    }
  }

  const handleMatch = async () => {
    if (!matchTransaction || !selectedInvoiceId) return
    setMatching(true)
    try {
      const res = await fetch(`/api/bank-transactions/${matchTransaction.id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('bankSync.matchSuccess'))
      setMatchDialogOpen(false)
      fetchTransactions()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setMatching(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      toast.error(t('bankSync.csvOnly'))
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      setImportPreview(evt.target?.result as string)
      setImportDialogOpen(true)
    }
    reader.readAsText(file)
  }

  const clearFilters = () => {
    setAccountFilter('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  const totalIn = transactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0)
  const totalOut = transactions.filter((tx) => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)
  const reconciled = transactions.filter((tx) => tx.isReconciled).length

  return (
    <>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.totalInflow')}</p>
                    <p className="text-sm font-bold text-emerald-600">{formatRSD(totalIn)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                    <ArrowDownLeft className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.totalOutflow')}</p>
                    <p className="text-sm font-bold text-red-600">{formatRSD(totalOut)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.reconciled')}</p>
                    <p className="text-sm font-bold">{reconciled}/{transactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bankSync.pending')}</p>
                    <p className="text-sm font-bold">{transactions.length - reconciled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('bankSync.transactions')}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{t('bankSync.transactionsDesc')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setImportDialogOpen(true)
                    setImportPreview(null)
                  }}
                >
                  <Upload className="h-4 w-4" /> {t('bankSync.importCSV')}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div
              className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('bankSync.searchTransactions')}
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={accountFilter || 'all'} onValueChange={(v) => setAccountFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder={t('bankSync.allAccounts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('bankSync.allAccounts')}</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder={t('bankSync.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="true">{t('bankSync.reconciled')}</SelectItem>
                  <SelectItem value="false">{t('bankSync.pending')}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  className="w-[140px] h-9 text-xs"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder={t('common.from')}
                />
                <Input
                  type="date"
                  className="w-[140px] h-9 text-xs"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder={t('common.to')}
                />
              </div>
              {(accountFilter || statusFilter || dateFrom || dateTo || search) && (
                <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={clearFilters}>
                  {t('common.clear')}
                </Button>
              )}
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
                      <TableHead className="text-xs">{t('common.description')}</TableHead>
                      <TableHead className="text-xs">{t('bankSync.counterpart')}</TableHead>
                      <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                      <TableHead className="text-xs">{t('bankSync.account')}</TableHead>
                      <TableHead className="text-xs">{t('common.status')}</TableHead>
                      <TableHead className="text-xs">{t('bankSync.invoice')}</TableHead>
                      <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                          {t('bankSync.noTransactions')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(tx.date)}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" title={tx.description}>
                            {tx.description}
                          </TableCell>
                          <TableCell className="text-xs max-w-[120px] truncate">
                            {tx.counterpart || '-'}
                          </TableCell>
                          <TableCell className={`text-xs text-right font-medium whitespace-nowrap ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            <span className="flex items-center gap-1 justify-end">
                              {tx.amount > 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownLeft className="h-3 w-3" />
                              )}
                              {formatRSD(Math.abs(tx.amount))}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs max-w-[100px] truncate">
                            {tx.bankAccount?.name}
                          </TableCell>
                          <TableCell>
                            {tx.isReconciled ? (
                              <Badge variant="default" className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle className="h-3 w-3" /> {t('bankSync.reconciled')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <CircleDot className="h-3 w-3" /> {t('bankSync.pending')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {tx.invoice ? (
                              <Badge variant="outline" className="text-xs gap-1">
                                <FileText className="h-3 w-3" />
                                {tx.invoice.number}
                              </Badge>
                            ) : tx.isReconciled ? (
                              <span className="text-muted-foreground">-</span>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {!tx.isReconciled && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleOpenMatch(tx)}
                                title={t('bankSync.manualMatch')}
                              >
                                <Link2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
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

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open)
        if (!open) { setImportPreview(null); setImportAccountId('') }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> {t('bankSync.importCSV')}
            </DialogTitle>
            <DialogDescription>{t('bankSync.importCSVDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">{t('bankSync.selectAccount')} *</Label>
              <Select value={importAccountId} onValueChange={setImportAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('bankSync.selectAccountPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.isActive).map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} - {acc.account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t('bankSync.csvFile')}</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  importPreview ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (evt) => setImportPreview(evt.target?.result as string)
                  reader.readAsText(file)
                }}
              >
                <Upload className={`h-8 w-8 mx-auto mb-2 ${importPreview ? 'text-primary' : 'text-muted-foreground/40'}`} />
                <p className="text-xs text-muted-foreground">
                  {importPreview
                    ? t('bankSync.fileSelected')
                    : t('bankSync.dragDropCSV')}
                </p>
                {importPreview && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    {importPreview.split('\n').length - 1} {t('bankSync.rowsDetected')}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {importPreview && (
              <div className="max-h-40 overflow-y-auto rounded-md border bg-muted/30 p-2">
                <pre className="text-xs font-mono whitespace-pre">
                  {importPreview.split('\n').slice(0, 10).join('\n')}
                  {importPreview.split('\n').length > 10 && '\n...'}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportDialogOpen(false); setImportPreview(null); setImportAccountId('') }}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !importAccountId || !importPreview}
            >
              {importing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  {t('bankSync.importing')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('bankSync.startImport')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Match Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" /> {t('bankSync.manualMatch')}
            </DialogTitle>
            <DialogDescription>{t('bankSync.manualMatchDesc')}</DialogDescription>
          </DialogHeader>
          {matchTransaction && (
            <div className="space-y-4 py-2">
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{t('common.date')}:</span>
                      <p className="font-medium">{formatDate(matchTransaction.date)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('common.amount')}:</span>
                      <p className={`font-bold ${matchTransaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatRSD(matchTransaction.amount)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">{t('common.description')}:</span>
                      <p className="font-medium">{matchTransaction.description}</p>
                    </div>
                    {matchTransaction.counterpart && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">{t('bankSync.counterpart')}:</span>
                        <p className="font-medium">{matchTransaction.counterpart}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label className="text-xs">{t('bankSync.selectInvoice')}</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('invoices.invoiceNumber')}</TableHead>
                        <TableHead className="text-xs">{t('invoices.partner')}</TableHead>
                        <TableHead className="text-xs text-right">{t('invoices.totalAmount')}</TableHead>
                        <TableHead className="text-xs w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-xs text-muted-foreground">
                            {t('bankSync.noUnpaidInvoices')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices.map((inv) => (
                          <TableRow
                            key={inv.id}
                            className={`cursor-pointer ${selectedInvoiceId === inv.id ? 'bg-primary/5' : ''}`}
                            onClick={() => setSelectedInvoiceId(inv.id)}
                          >
                            <TableCell className="text-xs font-mono">{inv.number}</TableCell>
                            <TableCell className="text-xs">{inv.partner?.name || '-'}</TableCell>
                            <TableCell className="text-xs text-right font-medium">
                              {formatRSD(inv.totalAmount)}
                            </TableCell>
                            <TableCell>
                              <div
                                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                  selectedInvoiceId === inv.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/30'
                                }`}
                              >
                                {selectedInvoiceId === inv.id && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleMatch}
              disabled={matching || !selectedInvoiceId}
            >
              {matching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  {t('bankSync.matching')}
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  {t('bankSync.matchInvoice')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============ RECONCILIATION TAB ============

function ReconciliationTab() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [reconciling, setReconciling] = useState(false)
  const [reconcileResult, setReconcileResult] = useState<ReconcileResult | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const { t } = useTranslation()

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/bank-accounts')
      const data = await res.json()
      setAccounts(data)
    } catch { /* silent */ }
  }, [])

  const fetchStats = useCallback(async () => {
    if (!selectedAccountId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/bank-transactions?bankAccountId=${selectedAccountId}`)
      const data = await res.json()
      setTransactions(data)
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }, [selectedAccountId, t])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleAutoReconcile = async () => {
    if (!selectedAccountId) {
      toast.error(t('bankSync.selectAccountFirst'))
      return
    }
    setReconciling(true)
    try {
      const res = await fetch('/api/bank-transactions/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccountId: selectedAccountId }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || t('common.errorOccurred'))
        return
      }
      setReconcileResult(result)
      toast.success(
        t('bankSync.reconcileResult', {
          auto: result.autoMatched,
          manual: result.manualNeeded,
          unmatched: result.unmatched?.length || 0,
        })
      )
      fetchStats()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setReconciling(false)
    }
  }

  const handleApprove = async (match: SuggestedMatch) => {
    setApproving(match.transactionId)
    try {
      const res = await fetch(`/api/bank-transactions/${match.transactionId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: match.invoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('bankSync.matchSuccess'))
      setReconcileResult((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          suggestedMatches: prev.suggestedMatches.filter((m) => m.transactionId !== match.transactionId),
        }
      })
      fetchStats()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setApproving(null)
    }
  }

  const totalTransactions = transactions.length
  const autoMatched = transactions.filter((tx) => tx.isReconciled && tx.invoiceId).length
  const needsReview = reconcileResult?.suggestedMatches.length || 0
  const unmatched = transactions.filter((tx) => !tx.isReconciled).length

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('bankSync.totalImported')}</p>
                  <p className="text-xl font-bold">{totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('bankSync.autoMatched')}</p>
                  <p className="text-xl font-bold text-emerald-600">{autoMatched}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('bankSync.needsReview')}</p>
                  <p className="text-xl font-bold text-amber-600">{needsReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('bankSync.unmatched')}</p>
                  <p className="text-xl font-bold text-red-600">{unmatched}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reconciliation Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('bankSync.autoReconcile')}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{t('bankSync.autoReconcileDesc')}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedAccountId} onValueChange={(v) => {
                setSelectedAccountId(v)
                setReconcileResult(null)
              }}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder={t('bankSync.selectAccountPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.isActive).map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAutoReconcile}
                disabled={reconciling || !selectedAccountId}
                className="gap-2"
              >
                {reconciling ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t('bankSync.reconciling')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {t('bankSync.startReconcile')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Reconcile Result */}
          {reconcileResult && (
            <div className="space-y-4">
              {/* Auto Applied */}
              {reconcileResult.autoApplied.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    {t('bankSync.autoApplied')} ({reconcileResult.autoApplied.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('invoices.invoiceNumber')}</TableHead>
                          <TableHead className="text-xs">{t('bankSync.counterpart')}</TableHead>
                          <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                          <TableHead className="text-xs">{t('bankSync.confidence')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconcileResult.autoApplied.map((match, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-mono">{match.invoiceNumber}</TableCell>
                            <TableCell className="text-xs">{match.partnerName}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{formatRSD(match.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                                {match.confidence}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Suggested Matches */}
              {reconcileResult.suggestedMatches.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    {t('bankSync.suggestedMatches')} ({reconcileResult.suggestedMatches.length})
                  </h3>
                  <div className="max-h-80 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('invoices.invoiceNumber')}</TableHead>
                          <TableHead className="text-xs">{t('bankSync.counterpart')}</TableHead>
                          <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                          <TableHead className="text-xs">{t('bankSync.confidence')}</TableHead>
                          <TableHead className="text-xs">{t('bankSync.reason')}</TableHead>
                          <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconcileResult.suggestedMatches.map((match, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-mono">{match.invoiceNumber}</TableCell>
                            <TableCell className="text-xs">{match.partnerName}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{formatRSD(match.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                                {match.confidence}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                              {match.reason}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleApprove(match)}
                                disabled={approving === match.transactionId}
                              >
                                {approving === match.transactionId ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                {t('bankSync.approve')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* No results */}
              {reconcileResult.autoApplied.length === 0 &&
               reconcileResult.suggestedMatches.length === 0 &&
               (reconcileResult.unmatched?.length || 0) === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">{t('bankSync.noMatchesFound')}</p>
                </div>
              )}
            </div>
          )}

          {!reconcileResult && !reconciling && (
            <div className="text-center py-8">
              <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t('bankSync.reconcileHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
