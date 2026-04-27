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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusLabel, getStatusColor } from '@/lib/helpers'

interface Partner {
  id: string
  name: string
}

interface POItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

interface PurchaseOrder {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  totalAmount: number
  notes: string | null
  partner: { id: string; name: string } | null
  items: POItem[]
}

interface Product {
  id: string
  name: string
  purchasePrice: number
}

interface OrderLineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export function Nabavka() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [lineItems, setLineItems] = useState<OrderLineItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0 },
  ])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/purchase-orders?${params.toString()}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    fetchOrders()
    fetch('/api/partners?type=dobavljac').then((r) => r.json()).then(setPartners)
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [fetchOrders])

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', productName: '', quantity: 1, unitPrice: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof OrderLineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.purchasePrice
      }
    }
    setLineItems(updated)
  }

  const handleEdit = (po: PurchaseOrder) => {
    setEditingOrder(po)
    setLineItems(po.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })))
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu narudžbenicu?')) return
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Narudžbenica uspešno obrisana')
      fetchOrders()
    } catch { toast.error('Greška') }
  }

  const grandTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = String(Math.floor(Math.random() * 900) + 100)

    const body = {
      partnerId: fd.get('partnerId') as string,
      number: editingOrder ? editingOrder.number : `PO-${year}-${month}-${count}`,
      status: fd.get('status') as string || 'nacrt',
      notes: fd.get('notes') as string,
      items: lineItems.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    }

    try {
      const url = editingOrder ? `/api/purchase-orders/${editingOrder.id}` : '/api/purchase-orders'
      const res = await fetch(url, {
        method: editingOrder ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(editingOrder ? 'Narudžbenica uspešno ažurirana' : 'Narudžbenica uspešno kreirana')
      setDialogOpen(false)
      setEditingOrder(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
      fetchOrders()
    } catch {
      toast.error(editingOrder ? 'Greška pri ažuriranju narudžbenice' : 'Greška pri kreiranju narudžbenice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Nabavka</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Upravljanje narudžbenicama</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingOrder(null); setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]) } setDialogOpen(open) }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova Narudžbenica
              </Button>
            </DialogTrigger>
            <DialogContent key={editingOrder?.id || 'new'} className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOrder ? 'Izmeni Narudžbenicu' : 'Nova Narudžbenica'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Dobavljač *</Label>
                    <Select name="partnerId" required defaultValue={editingOrder?.partnerId || ''}>
                      <SelectTrigger><SelectValue placeholder="Izaberite dobavljača" /></SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <Select name="status" defaultValue={editingOrder?.status || 'nacrt'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nacrt">Načrt</SelectItem>
                        <SelectItem value="poslata">Poslata</SelectItem>
                        <SelectItem value="primljena">Primljena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold">Stavke narudžbenice</Label>
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
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
                      <div className="col-span-3">
                        {idx === 0 && <Label className="text-[10px] text-muted-foreground">Količina</Label>}
                        <Input
                          type="number"
                          className="h-9 text-xs"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-3">
                        {idx === 0 && <Label className="text-[10px] text-muted-foreground">Jed. cena</Label>}
                        <Input
                          type="number"
                          className="h-9 text-xs"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
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
                  <Input name="notes" placeholder="Napomene" />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : editingOrder ? 'Sačuvaj Izmene' : 'Kreiraj Narudžbenicu'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži narudžbenice..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Svi statusi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="nacrt">Načrt</SelectItem>
              <SelectItem value="poslata">Poslata</SelectItem>
              <SelectItem value="primljena">Primljena</SelectItem>
              <SelectItem value="otkazana">Otkazana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Broj</TableHead>
                  <TableHead className="text-xs">Dobavljač</TableHead>
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Stavki</TableHead>
                  <TableHead className="text-xs text-right">Iznos</TableHead>
                  <TableHead className="text-xs text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema narudžbenica za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="text-xs font-medium">{po.number}</TableCell>
                      <TableCell className="text-xs">{po.partner?.name || '-'}</TableCell>
                      <TableCell className="text-xs">{formatDate(po.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(po.status)}`}>
                          {getStatusLabel(po.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{po.items.length}</TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {formatRSD(po.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(po)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(po.id)}>
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
