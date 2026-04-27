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
import { Plus, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
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
        </TabsList>

        <TabsContent value="transakcije">
          <TransakcijeTab />
        </TabsContent>
        <TabsContent value="kasa">
          <KasaTab />
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
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success('Transakcija uspešno kreirana')
      setDialogOpen(false)
      fetchTransactions()
    } catch {
      toast.error('Greška pri kreiranju transakcije')
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova Transakcija
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Transakcija</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tip</Label>
                    <Select name="type" defaultValue="prihod">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prihod">Prihod</SelectItem>
                        <SelectItem value="rashod">Rashod</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Kategorija</Label>
                    <Select name="category" defaultValue="promet">
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
                  <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Opis</Label>
                  <Input name="description" placeholder="Opis transakcije" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Dokument (opciono)</Label>
                  <Input name="documentRef" placeholder="Broj dokumenta" />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Kreiraj Transakciju'}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
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
      const res = await fetch('/api/cash-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success('Kasa unos uspešno kreiran')
      setDialogOpen(false)
      fetchEntries()
    } catch {
      toast.error('Greška pri kreiranju unosa')
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Novi Unos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Novi Unos u Kasu</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Tip</Label>
                        <Select name="type" defaultValue="ulaz">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ulaz">Ulaz</SelectItem>
                            <SelectItem value="izlaz">Izlaz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Način plaćanja</Label>
                        <Select name="paymentMethod" defaultValue="gotovina">
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
                      <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Opis</Label>
                      <Input name="description" placeholder="Opis unosa" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Partner (opciono)</Label>
                      <Input name="partnerName" placeholder="Ime partnera" />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Čuvanje...' : 'Kreiraj Unos'}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
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
