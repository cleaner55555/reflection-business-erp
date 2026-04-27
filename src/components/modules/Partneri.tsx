'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Users, Pencil, Trash2, Eye, Building2, Phone, Mail, MapPin, Landmark, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusLabel, getStatusColor } from '@/lib/helpers'

interface Partner {
  id: string
  name: string
  pib: string
  maticniBr: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  type: string
  account: string | null
  bank: string | null
  notes: string | null
  _count: { invoices: number; purchaseOrders: number }
}

interface AnalyticsSummary {
  totalInvoiceAmount: number
  paidInvoiceAmount: number
  unpaidInvoiceAmount: number
  totalPurchaseAmount: number
  invoiceCount: number
  purchaseOrderCount: number
}

interface RecentInvoice {
  id: string
  number: string
  date: string
  totalAmount: number
  status: string
}

interface RecentPurchaseOrder {
  id: string
  number: string
  date: string
  totalAmount: number
  status: string
}

interface PartnerAnalytics {
  partner: {
    id: string
    name: string
    pib: string
    type: string
    city: string
    address: string
    phone: string
    email: string
    account: string
    bank: string
  }
  summary: AnalyticsSummary
  recentInvoices: RecentInvoice[]
  recentPurchaseOrders: RecentPurchaseOrder[]
  transactions: unknown[]
}

export function Partneri() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Analytics state
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [analyticsPartner, setAnalyticsPartner] = useState<Partner | null>(null)
  const [analyticsData, setAnalyticsData] = useState<PartnerAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/partners?${params.toString()}`)
    const data = await res.json()
    setPartners(data)
    setLoading(false)
  }, [search, typeFilter])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog partnera?')) return
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri brisanju')
        return
      }
      toast.success('Partner uspešno obrisan')
      fetchPartners()
    } catch {
      toast.error('Greška pri brisanju partnera')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      pib: fd.get('pib') as string,
      maticniBr: fd.get('maticniBr') as string,
      address: fd.get('address') as string,
      city: fd.get('city') as string,
      zipCode: fd.get('zipCode') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      type: fd.get('type') as string,
      account: fd.get('account') as string,
      bank: fd.get('bank') as string,
      notes: fd.get('notes') as string,
    }
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
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(isEditing ? 'Partner uspešno ažuriran' : 'Partner uspešno kreiran')
      setDialogOpen(false)
      setEditingPartner(null)
      fetchPartners()
    } catch {
      toast.error('Greška')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenAnalytics = async (partner: Partner) => {
    setAnalyticsPartner(partner)
    setAnalyticsOpen(true)
    setAnalyticsLoading(true)
    setAnalyticsData(null)
    try {
      const res = await fetch(`/api/partners/${partner.id}/analytics`)
      if (!res.ok) {
        toast.error('Greška pri učitavanju analitike')
        return
      }
      const data = await res.json()
      setAnalyticsData(data)
    } catch {
      toast.error('Greška pri učitavanju analitike')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const typeColors: Record<string, string> = {
    kupac: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dobavljac: 'bg-blue-50 text-blue-700 border-blue-200',
    partner: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Partneri</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{partners.length} partnera</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingPartner(null)
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Novi Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPartner ? 'Izmeni Partnera' : 'Novi Partner'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Naziv *</Label>
                    <Input name="name" placeholder="Naziv firme" required defaultValue={editingPartner?.name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">PIB *</Label>
                    <Input name="pib" placeholder="123456789" required defaultValue={editingPartner?.pib || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Matični broj</Label>
                    <Input name="maticniBr" placeholder="12345678" defaultValue={editingPartner?.maticniBr || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Tip</Label>
                    <Select name="type" defaultValue={editingPartner?.type || 'kupac'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kupac">Kupac</SelectItem>
                        <SelectItem value="dobavljac">Dobavljač</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Grad</Label>
                    <Input name="city" placeholder="Beograd" defaultValue={editingPartner?.city || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Adresa</Label>
                  <Input name="address" placeholder="Ulica i broj" defaultValue={editingPartner?.address || ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Telefon</Label>
                    <Input name="phone" placeholder="+381 11 123 4567" defaultValue={editingPartner?.phone || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input name="email" type="email" placeholder="info@firma.rs" defaultValue={editingPartner?.email || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tekući račun</Label>
                    <Input name="account" placeholder="265-00000000-00" defaultValue={editingPartner?.account || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Banka</Label>
                    <Input name="bank" placeholder="Naziv banke" defaultValue={editingPartner?.bank || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Napomene</Label>
                  <Input name="notes" placeholder="Napomene" defaultValue={editingPartner?.notes || ''} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : editingPartner ? 'Sačuvaj Izmene' : 'Kreiraj Partnera'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži partnere..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Svi tipovi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              <SelectItem value="kupac">Kupac</SelectItem>
              <SelectItem value="dobavljac">Dobavljač</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Naziv</TableHead>
                  <TableHead className="text-xs">PIB</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs">Grad</TableHead>
                  <TableHead className="text-xs">Telefon</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs text-center">Fakture</TableHead>
                  <TableHead className="text-xs text-center">Narudžbine</TableHead>
                  <TableHead className="text-xs text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                      Nema partnera za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-medium">{p.name}</TableCell>
                      <TableCell className="text-xs font-mono">{p.pib}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeColors[p.type] || ''}`}>
                          {getStatusLabel(p.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.city || '-'}</TableCell>
                      <TableCell className="text-xs">{p.phone || '-'}</TableCell>
                      <TableCell className="text-xs">{p.email || '-'}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {p._count.invoices}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {p._count.purchaseOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenAnalytics(p)} title="Analitička kartica">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
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

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={(open) => {
        setAnalyticsOpen(open)
        if (!open) {
          setAnalyticsPartner(null)
          setAnalyticsData(null)
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {analyticsLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
              <Skeleton className="h-48 w-full mt-4" />
            </div>
          ) : analyticsData ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <DialogTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      {analyticsData.partner.name}
                    </DialogTitle>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-mono text-muted-foreground">PIB: {analyticsData.partner.pib}</span>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeColors[analyticsData.partner.type] || ''}`}>
                        {getStatusLabel(analyticsData.partner.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Contact info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground py-1">
                {analyticsData.partner.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {analyticsData.partner.city ? `${analyticsData.partner.address}, ${analyticsData.partner.city}` : analyticsData.partner.address}
                  </span>
                )}
                {analyticsData.partner.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {analyticsData.partner.phone}
                  </span>
                )}
                {analyticsData.partner.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {analyticsData.partner.email}
                  </span>
                )}
                {analyticsData.partner.account && (
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    {analyticsData.partner.account}
                  </span>
                )}
                {analyticsData.partner.bank && (
                  <span className="flex items-center gap-1.5">
                    <Landmark className="h-3.5 w-3.5" />
                    {analyticsData.partner.bank}
                  </span>
                )}
              </div>

              <Separator />

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground font-medium">Ukupno fakture</p>
                  <p className="text-lg font-semibold mt-1">{formatRSD(analyticsData.summary.totalInvoiceAmount)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{analyticsData.summary.invoiceCount} faktura</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground font-medium">Plaćene fakture</p>
                  <p className="text-lg font-semibold mt-1 text-emerald-600">{formatRSD(analyticsData.summary.paidInvoiceAmount)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{analyticsData.summary.invoiceCount > 0 ? `${Math.round((analyticsData.summary.paidInvoiceAmount / analyticsData.summary.totalInvoiceAmount) * 100)}%` : '0%'} od ukupnog</p>
                </Card>
                <Card className="p-4 border-red-200 bg-red-50/50">
                  <p className="text-xs text-red-600 font-medium">Neplaćene fakture</p>
                  <p className="text-lg font-semibold mt-1 text-red-600">{formatRSD(analyticsData.summary.unpaidInvoiceAmount)}</p>
                  <p className="text-[10px] text-red-500 mt-0.5">{analyticsData.summary.invoiceCount > 0 ? `${Math.round((analyticsData.summary.unpaidInvoiceAmount / analyticsData.summary.totalInvoiceAmount) * 100)}%` : '0%'} od ukupnog</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground font-medium">Ukupna nabavka</p>
                  <p className="text-lg font-semibold mt-1">{formatRSD(analyticsData.summary.totalPurchaseAmount)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{analyticsData.summary.purchaseOrderCount} narudžbina</p>
                </Card>
              </div>

              <Separator />

              {/* Recent Invoices */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Poslednje fakture</h3>
                {analyticsData.recentInvoices.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nema faktura za prikaz</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Broj</TableHead>
                          <TableHead className="text-xs">Datum</TableHead>
                          <TableHead className="text-xs text-right">Iznos</TableHead>
                          <TableHead className="text-xs text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.recentInvoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="text-xs font-mono">{inv.number}</TableCell>
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
              </div>

              <Separator />

              {/* Recent Purchase Orders */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Poslednje narudžbine</h3>
                {analyticsData.recentPurchaseOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nema narudžbina za prikaz</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Broj</TableHead>
                          <TableHead className="text-xs">Datum</TableHead>
                          <TableHead className="text-xs text-right">Iznos</TableHead>
                          <TableHead className="text-xs text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.recentPurchaseOrders.map((po) => (
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
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
