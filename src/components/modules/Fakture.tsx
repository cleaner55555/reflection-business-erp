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
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusLabel, getStatusColor } from '@/lib/helpers'

interface Partner {
  id: string
  name: string
}

interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  total: number
}

interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  partner: { id: string; name: string } | null
  items: InvoiceItem[]
}

interface Product {
  id: string
  name: string
  sellingPrice: number
}

interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
}

export function Fakture() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  // Form state
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 },
  ])

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/invoices?${params.toString()}`)
    const data = await res.json()
    setInvoices(data)
    setLoading(false)
  }, [search, statusFilter, typeFilter])

  useEffect(() => {
    fetchInvoices()
    fetch('/api/partners').then((r) => r.json()).then(setPartners)
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [fetchInvoices])

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv)
    setLineItems(inv.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountPct: i.discountPct,
      taxRate: i.taxRate,
    })))
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu fakturu?')) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Faktura uspešno obrisana')
      fetchInvoices()
    } catch { toast.error('Greška') }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.sellingPrice
      }
    }

    setLineItems(updated)
  }

  const calcTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * (item.discountPct / 100)
    return subtotal - discount + (subtotal - discount) * (item.taxRate / 100)
  }

  const grandTotal = lineItems.reduce((sum, item) => sum + calcTotal(item), 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)

    const isEditing = !!editingInvoice
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = String(Math.floor(Math.random() * 9000) + 1000)

    const invoiceType = fd.get('type') as string || 'izlazna'

    const body = {
      partnerId: fd.get('partnerId') as string,
      number: isEditing ? editingInvoice.number : `F-${year}-${month}-${count}`,
      date: isEditing ? editingInvoice.date : new Date().toISOString(),
      type: invoiceType,
      status: fd.get('status') as string || 'nacrt',
      dueDate: fd.get('dueDate') as string,
      paymentMethod: fd.get('paymentMethod') as string || 'racun',
      notes: fd.get('notes') as string,
      items: lineItems.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        discountPct: String(item.discountPct),
        taxRate: String(item.taxRate),
      })),
    }

    try {
      const url = isEditing ? `/api/invoices/${editingInvoice.id}` : '/api/invoices'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success(isEditing ? 'Faktura uspešno ažurirana' : 'Faktura uspešno kreirana')
      setDialogOpen(false)
      setEditingInvoice(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
      fetchInvoices()
    } catch {
      toast.error('Greška pri kreiranju fakture')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Fakture</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Upravljanje fakturama</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingInvoice(null); setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }]) } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova Faktura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingInvoice ? 'Izmeni Fakturu' : 'Nova Faktura'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} key={editingInvoice?.id || 'new'} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tip fakture *</Label>
                    <Select name="type" defaultValue={editingInvoice?.type || 'izlazna'}>
                      <SelectTrigger><SelectValue placeholder="Izaberite tip" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="predracun">Predračun</SelectItem>
                        <SelectItem value="izlazna">Izlazna</SelectItem>
                        <SelectItem value="ulazna">Ulazna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <Select name="status" defaultValue={editingInvoice?.status || 'nacrt'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nacrt">Načrt</SelectItem>
                        <SelectItem value="poslata">Poslata</SelectItem>
                        <SelectItem value="placena">Plaćena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Partner *</Label>
                    <Select name="partnerId" defaultValue={editingInvoice?.partnerId || ''} required>
                      <SelectTrigger><SelectValue placeholder="Izaberite partnera" /></SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Rok plaćanja *</Label>
                    <Input name="dueDate" type="date" required defaultValue={editingInvoice?.dueDate?.split('T')[0] || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Način plaćanja</Label>
                    <Select name="paymentMethod" defaultValue={editingInvoice?.paymentMethod || 'racun'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="racun">Račun</SelectItem>
                        <SelectItem value="gotovina">Gotovina</SelectItem>
                        <SelectItem value="kartica">Kartica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold">Stavke fakture</Label>
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        {idx === 0 && <Label className="text-[10px] text-muted-foreground">Proizvod</Label>}
                        <Select
                          value={item.productId}
                          onValueChange={(v) => updateLineItem(idx, 'productId', v)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Izaberite" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <Label className="text-[10px] text-muted-foreground">Količina</Label>}
                        <Input
                          type="number"
                          className="h-9 text-xs"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <Label className="text-[10px] text-muted-foreground">Cena</Label>}
                        <Input
                          type="number"
                          className="h-9 text-xs"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <Label className="text-[10px] text-muted-foreground">Popust %</Label>}
                        <Input
                          type="number"
                          className="h-9 text-xs"
                          value={item.discountPct}
                          onChange={(e) => updateLineItem(idx, 'discountPct', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => removeLineItem(idx)}
                          disabled={lineItems.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="w-full gap-1">
                    <Plus className="h-3 w-3" /> Dodaj stavku
                  </Button>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-right">
                  <span className="text-sm font-medium">Ukupno: </span>
                  <span className="text-lg font-bold text-primary">{formatRSD(grandTotal)}</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Napomene (opciono)</Label>
                  <Input name="notes" placeholder="Napomene na fakturi" defaultValue={editingInvoice?.notes || ''} />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : editingInvoice ? 'Sačuvaj Izmene' : 'Kreiraj Fakturu'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži fakture..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Svi tipovi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve</SelectItem>
              <SelectItem value="predracun">Predračun</SelectItem>
              <SelectItem value="izlazna">Izlazna</SelectItem>
              <SelectItem value="ulazna">Ulazna</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Svi statusi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="nacrt">Načrt</SelectItem>
              <SelectItem value="poslata">Poslata</SelectItem>
              <SelectItem value="placena">Plaćena</SelectItem>
              <SelectItem value="otkazana">Otkazana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Broj</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Rok plaćanja</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Iznos</TableHead>
                  <TableHead className="text-xs text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                      Nema faktura za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-xs font-medium">{inv.number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(inv.type || 'izlazna')}`}>
                          {getStatusLabel(inv.type || 'izlazna')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{inv.partner?.name || '-'}</TableCell>
                      <TableCell className="text-xs">{formatDate(inv.date)}</TableCell>
                      <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(inv.status)}`}>
                          {getStatusLabel(inv.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {formatRSD(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(inv)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(inv.id)}>
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
