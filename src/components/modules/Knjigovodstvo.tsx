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
} from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knjigovodstvo</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Glavna knjiga, kontni plan i knjiženje naloga
        </p>
      </div>

      <Tabs defaultValue="glavna-knjiga" className="space-y-4">
        <TabsList>
          <TabsTrigger value="glavna-knjiga" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Glavna knjiga</span>
          </TabsTrigger>
          <TabsTrigger value="kontni-plan" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kontni plan</span>
          </TabsTrigger>
          <TabsTrigger value="nalog" className="gap-1.5">
            <FilePenLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nalog za knjiženje</span>
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
      </Tabs>
    </div>
  )
}

// ─── Tab 1: Glavna Knjiga ────────────────────────────────────────────────────

function GlavnaKnjigaTab() {
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
    fetchEntries()
  }, [fetchEntries])

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
    if (!confirm('Da li ste sigurni da želite da obrišete ovu stavku?')) return
    try {
      const res = await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri brisanju')
        return
      }
      toast.success('Stavka uspešno obrisana')
      fetchEntries()
    } catch {
      toast.error('Greška pri brisanju stavke')
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
      toast.error('Konto i opis su obavezni')
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
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(isEditing ? 'Stavka ažurirana' : 'Stavka kreirana')
      setViewMode('list')
      setEditingEntry(null)
      fetchEntries()
    } catch {
      toast.error('Greška pri čuvanju')
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
                {editingEntry ? 'Izmeni stavku' : 'Nova stavka knjiženja'}
              </CardTitle>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Glavna knjiga
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dnevnik knjiženja — sve knjigovodstvene stavke
                </p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}>
                <Plus className="h-4 w-4" /> Nova stavka
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži po opisu ili dokumentu..."
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
                  <SelectValue placeholder="Svi konti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi konti</SelectItem>
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
                <Label className="text-xs">Datum</Label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={editingEntry ? editingEntry.date.split('T')[0] : today}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Konto</Label>
                <Select
                  name="accountCode"
                  defaultValue={editingEntry?.accountCode || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberi konto" />
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
                <Label className="text-xs">Duguje (RSD)</Label>
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
                <Label className="text-xs">Potražuje (RSD)</Label>
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
              <Label className="text-xs">Opis</Label>
              <Input
                name="description"
                placeholder="Opis stavke"
                required
                defaultValue={editingEntry?.description || ''}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Dokument (opciono)</Label>
              <Input
                name="documentRef"
                placeholder="Broj dokumenta"
                defaultValue={editingEntry?.documentRef || ''}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>Otkaži</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting
                  ? 'Čuvanje...'
                  : editingEntry
                    ? 'Sačuvaj izmene'
                    : 'Kreiraj stavku'}
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
                  <TableHead className="text-xs w-[100px]">Datum</TableHead>
                  <TableHead className="text-xs w-[90px]">Konto</TableHead>
                  <TableHead className="text-xs">Naziv konta</TableHead>
                  <TableHead className="text-xs text-right w-[130px]">Duguje</TableHead>
                  <TableHead className="text-xs text-right w-[130px]">Potražuje</TableHead>
                  <TableHead className="text-xs">Opis</TableHead>
                  <TableHead className="text-xs w-[100px]">Dokument</TableHead>
                  <TableHead className="text-xs w-[80px]">Akcije</TableHead>
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
                          {entry.account?.name || entry.accountCode}
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
                          {entry.description}
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
                        Ukupno:
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
        toast.error(err.error || 'Greška pri brisanju')
        return
      }
      toast.success(`Konto ${deleteTarget.code} uspešno obrisan`)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchAccounts()
    } catch {
      toast.error('Greška pri brisanju')
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
      toast.error('Šifra i naziv konta su obavezni')
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
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(
        isEditing
          ? `Konto ${body.code} ažuriran`
          : `Konto ${body.code} kreiran`
      )
      setViewMode('list')
      setEditingAccount(null)
      fetchAccounts()
    } catch {
      toast.error('Greška pri čuvanju')
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
                    Kontni plan
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pregled i upravljanje svim kontima
                  </p>
                </div>
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> Novi konto
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraži konta..."
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
                    <SelectValue placeholder="Svi tipovi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
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
            <form
              onSubmit={handleSubmit}
              key={editingAccount?.id || 'new'}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Šifra konta</Label>
                  <Input
                    name="code"
                    placeholder="npr. 020, 110, 200"
                    required
                    defaultValue={editingAccount?.code || ''}
                    disabled={!!editingAccount}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tip konta</Label>
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
                <Label className="text-xs">Naziv konta</Label>
                <Input
                  name="name"
                  placeholder="Naziv konta"
                  required
                  defaultValue={editingAccount?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nadređeni konto (opciono)</Label>
                <Input
                  name="parentCode"
                  placeholder="Šifra nadređenog konta"
                  defaultValue={editingAccount?.parentCode || ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Opis (opciono)</Label>
                <Input
                  name="description"
                  placeholder="Opis konta"
                  defaultValue={editingAccount?.description || ''}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>Otkaži</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting
                    ? 'Čuvanje...'
                    : editingAccount
                      ? 'Sačuvaj izmene'
                      : 'Kreiraj konto'}
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
                    <TableHead className="text-xs w-[90px]">Šifra</TableHead>
                    <TableHead className="text-xs">Naziv</TableHead>
                    <TableHead className="text-xs w-[100px]">Tip</TableHead>
                    <TableHead className="text-xs">Opis</TableHead>
                    <TableHead className="text-xs w-[60px] text-center">
                      Stavke
                    </TableHead>
                    <TableHead className="text-xs w-[80px]">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground text-sm"
                      >
                        Nema konta za prikaz
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
                            {acc.name}
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
                            {acc.description || '-'}
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
              Potvrda brisanja
            </AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete konto{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.code} — {deleteTarget?.name}
              </span>
              ?<br />
              Ova akcija ne može se poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Obriši konto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Tab 3: Nalog za Knjiženje ───────────────────────────────────────────────

function NalogTab() {
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

  // Row management
  const addRow = () => {
    setRows([
      ...rows,
      { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
    ])
  }

  const removeRow = (tempId: string) => {
    if (rows.length <= 2) {
      toast.error('Minimalno 2 reda su potrebna za dvostruko knjiženje')
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
          `Ukupno duguje i potražuje moraju biti jednaki. Razlika: ${formatRSD(difference)}`
        )
      } else if (hasEmptyAccount) {
        toast.error('Svi redovi moraju imati izabran konto')
      } else if (hasNoValues) {
        toast.error('Morate uneti iznose')
      } else if (!description.trim()) {
        toast.error('Opis naloga je obavezan')
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
          toast.error(err.error || 'Greška pri knjiženju')
          setSubmitting(false)
          return
        }
      }

      toast.success(
        `Nalog uspešno proknjižen — ${entries.length} stavki`
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
      toast.error('Greška pri knjiženju naloga')
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
            Nalog za knjiženje
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kreirajte dvostruko knjiženje — ukupno duguje mora biti jednako potražuje
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Datum naloga</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                Opis naloga <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Opis naloga za knjiženje"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Broj dokumenta (opciono)</Label>
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
                Stavke naloga
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={addRow}
              >
                <Plus className="h-3.5 w-3.5" />
                Dodaj red
              </Button>
            </div>

            {/* Table header for mobile-friendly list */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_40px] gap-2 px-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Konto
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                Duguje (RSD)
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                Potražuje (RSD)
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
                                ? 'Duguje strana...'
                                : idx === 1
                                  ? 'Potražuje strana...'
                                  : 'Izaberi konto...'
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
                        Duguje (RSD)
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
                        Potražuje (RSD)
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
                      Ukupno duguje
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
                      Unesite iznose
                    </Badge>
                  ) : isBalanced ? (
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Saldo je u balansu
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Razlika: {formatRSD(difference)}
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
                  Knjiženje...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Knjiži nalog
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
              Poslednje knjižene stavke
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pregled nedavno proknjiženih stavki
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
                    <TableHead className="text-xs w-[100px]">Datum</TableHead>
                    <TableHead className="text-xs w-[90px]">Konto</TableHead>
                    <TableHead className="text-xs">Naziv konta</TableHead>
                    <TableHead className="text-xs text-right w-[130px]">
                      Duguje
                    </TableHead>
                    <TableHead className="text-xs text-right w-[130px]">
                      Potražuje
                    </TableHead>
                    <TableHead className="text-xs">Opis</TableHead>
                    <TableHead className="text-xs w-[100px]">Dokument</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground text-sm"
                      >
                        Nema knjiženih stavki
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
                          {entry.account?.name || entry.accountCode}
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
                          {entry.description}
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
