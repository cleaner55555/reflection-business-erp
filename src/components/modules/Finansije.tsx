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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'

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
  { value: 'all', label: 'Sve' },
  { value: 'faktura_izlazna', label: 'Faktura izlazna' },
  { value: 'faktura_ulazna', label: 'Faktura ulazna' },
  { value: 'predracun', label: 'Predračun' },
  { value: 'transakcija', label: 'Transakcija' },
  { value: 'kasa', label: 'Kasa' },
  { value: 'nabavka', label: 'Nabavka' },
  { value: 'otpremnica', label: 'Otpremnica' },
] as const

export function Finansije() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finansije</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upravljanje transakcijama, blagajnom i keš operacijama
        </p>
      </div>

      <Tabs defaultValue="transakcije" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transakcije">Transakcije</TabsTrigger>
          <TabsTrigger value="kasa">Kasa</TabsTrigger>
          <TabsTrigger value="dnevnik">Dnevnik</TabsTrigger>
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni?')) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Transakcija obrisana')
      fetchTransactions()
    } catch { toast.error('Greška') }
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
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(isEditing ? 'Transakcija uspešno ažurirana' : 'Transakcija uspešno kreirana')
      setDialogOpen(false)
      setEditingTransaction(null)
      fetchTransactions()
    } catch {
      toast.error('Greška pri čuvanju transakcije')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Transakcije</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Sve finansijske transakcije</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTransaction(null) }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova Transakcija
              </Button>
            </DialogTrigger>
            <DialogContent key={editingTransaction?.id || 'new'} className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Izmeni Transakciju' : 'Nova Transakcija'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tip</Label>
                    <Select name="type" defaultValue={editingTransaction?.type || 'prihod'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prihod">Prihod</SelectItem>
                        <SelectItem value="rashod">Rashod</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Kategorija</Label>
                    <Select name="category" defaultValue={editingTransaction?.category || 'promet'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promet">Promet</SelectItem>
                        <SelectItem value="nabavka">Nabavka</SelectItem>
                        <SelectItem value="plata">Plata</SelectItem>
                        <SelectItem value="režije">Režije</SelectItem>
                        <SelectItem value="ostalo">Ostalo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Iznos (RSD)</Label>
                  <Input name="amount" type="number" step="0.01" placeholder="0.00" required defaultValue={editingTransaction?.amount ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Opis</Label>
                  <Input name="description" placeholder="Opis transakcije" required defaultValue={editingTransaction?.description || ''} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Dokument (opciono)</Label>
                  <Input name="documentRef" placeholder="Broj dokumenta" defaultValue={editingTransaction?.documentRef || ''} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : editingTransaction ? 'Sačuvaj Izmene' : 'Kreiraj Transakciju'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži transakcije..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Svi tipovi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              <SelectItem value="prihod">Prihod</SelectItem>
              <SelectItem value="rashod">Rashod</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Sve kategorije" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve kategorije</SelectItem>
              <SelectItem value="promet">Promet</SelectItem>
              <SelectItem value="nabavka">Nabavka</SelectItem>
              <SelectItem value="plata">Plata</SelectItem>
              <SelectItem value="režije">Režije</SelectItem>
              <SelectItem value="ostalo">Ostalo</SelectItem>
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
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs">Kategorija</TableHead>
                  <TableHead className="text-xs">Opis</TableHead>
                  <TableHead className="text-xs">Dokument</TableHead>
                  <TableHead className="text-xs text-right">Iznos</TableHead>
                  <TableHead className="text-xs w-[80px]">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema transakcija za prikaz
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
                      <TableCell className="text-xs max-w-[200px] truncate">{t.description}</TableCell>
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null)

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

  const runningBalance = entries.reduce((acc, entry) => {
    return acc + (entry.type === 'ulaz' ? entry.amount : -entry.amount)
  }, 0)

  const handleEdit = (entry: CashEntry) => {
    setEditingEntry(entry)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni?')) return
    try {
      const res = await fetch(`/api/cash-register/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Unos uspešno obrisan')
      fetchEntries()
    } catch { toast.error('Greška') }
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
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(isEditing ? 'Unos uspešno ažuriran' : 'Kasa unos uspešno kreiran')
      setDialogOpen(false)
      setEditingEntry(null)
      fetchEntries()
    } catch {
      toast.error('Greška pri čuvanju unosa')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Blagajna</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Dnevni keš izvodi</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg px-4 py-2 text-sm font-bold ${runningBalance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                Stanje: {formatRSD(runningBalance)}
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingEntry(null) }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Novi Unos
                  </Button>
                </DialogTrigger>
                <DialogContent key={editingEntry?.id || 'new'} className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? 'Izmeni Unos' : 'Novi Unos u Kasu'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Tip</Label>
                        <Select name="type" defaultValue={editingEntry?.type || 'ulaz'}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ulaz">Ulaz</SelectItem>
                            <SelectItem value="izlaz">Izlaz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Način plaćanja</Label>
                        <Select name="paymentMethod" defaultValue={editingEntry?.paymentMethod || 'gotovina'}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gotovina">Gotovina</SelectItem>
                            <SelectItem value="kartica">Kartica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Iznos (RSD)</Label>
                      <Input name="amount" type="number" step="0.01" placeholder="0.00" required defaultValue={editingEntry?.amount ?? ''} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Opis</Label>
                      <Input name="description" placeholder="Opis unosa" required defaultValue={editingEntry?.description || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Partner (opciono)</Label>
                      <Input name="partnerName" placeholder="Ime partnera" defaultValue={editingEntry?.partnerName || ''} />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Čuvanje...' : editingEntry ? 'Sačuvaj Izmene' : 'Kreiraj Unos'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                    <TableHead className="text-xs">Datum</TableHead>
                    <TableHead className="text-xs">Tip</TableHead>
                    <TableHead className="text-xs">Opis</TableHead>
                    <TableHead className="text-xs">Partner</TableHead>
                    <TableHead className="text-xs">Plaćanje</TableHead>
                    <TableHead className="text-xs text-right">Iznos</TableHead>
                    <TableHead className="text-xs w-[80px]">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                        Nema unosa za prikaz
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
                        <TableCell className="text-xs max-w-[200px] truncate">{entry.description}</TableCell>
                        <TableCell className="text-xs">{entry.partnerName || '-'}</TableCell>
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
              Finansijski Dnevnik
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Ujedinjeni hronološki pregled svih finansijskih događaja</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`rounded-lg px-4 py-2 text-sm font-bold ${saldo >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              Saldo: {formatRSD(Math.abs(saldo))} {saldo < 0 ? '(Potražuje)' : '(Duguje)'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Sve vrste" />
            </SelectTrigger>
            <SelectContent>
              {JOURNAL_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
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
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs">Opis</TableHead>
                  <TableHead className="text-xs">Dokument</TableHead>
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs text-right">Duguje</TableHead>
                  <TableHead className="text-xs text-right">Potražuje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema stavki za prikaz
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
                        <TableCell className="text-xs max-w-[250px] truncate">{entry.description}</TableCell>
                        <TableCell className="text-xs">{entry.documentNumber || '-'}</TableCell>
                        <TableCell className="text-xs">{entry.partnerName || '-'}</TableCell>
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
                        Ukupno:
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
