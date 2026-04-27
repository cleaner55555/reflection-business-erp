'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Search, AlertTriangle, Pencil, Trash2, Package, FileText, Tag, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'

// ==================== INTERFACES ====================

interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  category: string | null
  unit: string
  purchasePrice: number
  sellingPrice: number
  minStock: number
  currentStock: number
  isActive: boolean
}

interface StockMovement {
  id: string
  productId: string
  date: string
  type: string
  quantity: number
  documentRef: string | null
  notes: string | null
  product: { id: string; name: string; sku: string; currentStock: number }
}

interface Partner {
  id: string
  name: string
  pib: string
  type: string
}

interface DeliveryNoteItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface DeliveryNote {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  invoiceNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  partner: { id: string; name: string; pib: string }
  items: DeliveryNoteItem[]
}

interface PriceListItem {
  id: string
  productId: string
  price: number
  discountPct: number
  product?: { id: string; name: string; sku: string; unit: string }
}

interface PriceList {
  id: string
  name: string
  description: string | null
  validFrom: string | null
  validTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { items: number }
  items: PriceListItem[]
}

// ==================== LINE ITEM HELPERS ====================

interface LineItem {
  tempId: string
  productId: string
  productName: string
  quantity: string
  unitPrice: string
}

interface PriceLineItem {
  tempId: string
  productId: string
  price: string
  discountPct: string
}

let tempIdCounter = 0
function nextTempId() {
  return `temp_${++tempIdCounter}_${Date.now()}`
}

// ==================== MAIN COMPONENT ====================

export function Magacin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Magacin</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upravljanje artiklima, zalihama, otpremnicama i cenovnicima
        </p>
      </div>

      <Tabs defaultValue="artikli" className="space-y-4">
        <TabsList>
          <TabsTrigger value="artikli" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Artikli</span>
          </TabsTrigger>
          <TabsTrigger value="kretanja" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kretanja Zaliha</span>
          </TabsTrigger>
          <TabsTrigger value="otpremnice" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Otpremnice</span>
          </TabsTrigger>
          <TabsTrigger value="cenovnici" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cenovnici</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artikli">
          <ArtikliTab />
        </TabsContent>
        <TabsContent value="kretanja">
          <KretanjaTab />
        </TabsContent>
        <TabsContent value="otpremnice">
          <OtpremniceTab />
        </TabsContent>
        <TabsContent value="cenovnici">
          <CenovniciTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== ARTIKLI TAB ====================

function ArtikliTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryFilter) params.set('category', categoryFilter)
    const res = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }, [search, categoryFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const handleNew = () => {
    setEditingProduct(null)
    setViewMode('form')
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingProduct(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj artikal?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Artikal uspešno obrisan')
      fetchProducts()
    } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      sku: fd.get('sku') as string,
      barcode: fd.get('barcode') as string,
      category: fd.get('category') as string,
      unit: fd.get('unit') as string,
      purchasePrice: fd.get('purchasePrice') as string,
      sellingPrice: fd.get('sellingPrice') as string,
      minStock: fd.get('minStock') as string,
      currentStock: fd.get('currentStock') as string,
    }
    try {
      const isEditing = !!editingProduct
      const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products'
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
      toast.success(isEditing ? 'Artikal uspešno ažuriran' : 'Artikal uspešno kreiran')
      setViewMode('list')
      setEditingProduct(null)
      fetchProducts()
    } catch {
      toast.error('Greška pri kreiranju artikla')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {editingProduct ? 'Izmeni Artikal' : 'Novi Artikal'}
              </CardTitle>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Artikli</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{products.length} artikala</p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}>
                <Plus className="h-4 w-4" /> Novi Artikal
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži artikle..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Sve kategorije" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve kategorije</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c || ''}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Naziv *</Label>
                <Input name="name" placeholder="Naziv artikla" defaultValue={editingProduct?.name || ''} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Šifra (SKU) *</Label>
                <Input name="sku" placeholder="SKU-001" defaultValue={editingProduct?.sku || ''} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Barkod</Label>
                <Input name="barcode" placeholder="8600000000000" defaultValue={editingProduct?.barcode || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Kategorija</Label>
                <Input name="category" placeholder="Kategorija" defaultValue={editingProduct?.category || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Jedinica mere</Label>
                <Select name="unit" defaultValue={editingProduct?.unit || 'kom'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kom">kom</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="pak">pak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Nabavna cena *</Label>
                <Input name="purchasePrice" type="number" step="0.01" placeholder="0.00" defaultValue={String(editingProduct?.purchasePrice || '')} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prodajna cena *</Label>
                <Input name="sellingPrice" type="number" step="0.01" placeholder="0.00" defaultValue={String(editingProduct?.sellingPrice || '')} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Minimalna zaliha</Label>
                <Input name="minStock" type="number" placeholder="0" defaultValue={String(editingProduct?.minStock || '')} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Trenutna zaliha</Label>
                <Input name="currentStock" type="number" placeholder="0" defaultValue={String(editingProduct?.currentStock || '')} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Čuvanje...' : editingProduct ? 'Sačuvaj Izmene' : 'Kreiraj Artikal'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </form>
        ) : loading ? (
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
                  <TableHead className="text-xs">Šifra</TableHead>
                  <TableHead className="text-xs">Naziv</TableHead>
                  <TableHead className="text-xs">Kategorija</TableHead>
                  <TableHead className="text-xs text-right">Nabavna</TableHead>
                  <TableHead className="text-xs text-right">Prodajna</TableHead>
                  <TableHead className="text-xs text-center">Zaliha</TableHead>
                  <TableHead className="text-xs text-center">Min</TableHead>
                  <TableHead className="text-xs text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                      Nema artikala za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-mono">{p.sku}</TableCell>
                      <TableCell className="text-xs font-medium">{p.name}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {p.category || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">{formatRSD(p.purchasePrice)}</TableCell>
                      <TableCell className="text-xs text-right">{formatRSD(p.sellingPrice)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.currentStock <= p.minStock && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${p.currentStock <= 0 ? 'text-red-600' : p.currentStock <= p.minStock ? 'text-amber-600' : ''}`}>
                            {p.currentStock} {p.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-center text-muted-foreground">{p.minStock}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(p.id)}>
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

// ==================== KRETANJA ZALIHA TAB ====================

function KretanjaTab() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMovements = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/stock')
    const data = await res.json()
    setMovements(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMovements()
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [fetchMovements])

  const handleNew = () => {
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      productId: fd.get('productId') as string,
      type: fd.get('type') as string,
      quantity: fd.get('quantity') as string,
      documentRef: fd.get('documentRef') as string,
      notes: fd.get('notes') as string,
    }
    try {
      const res = await fetch('/api/stock/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success('Kretanje zaliha uspešno kreirano')
      setViewMode('list')
      fetchMovements()
    } catch {
      toast.error('Greška pri kreiranju kretanja')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/stock/movement/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri brisanju')
        return
      }
      toast.success('Kretanje zaliha uspešno obrisano')
      setDeleteId(null)
      fetchMovements()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">Novo Kretanje Zaliha</CardTitle>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Kretanja Zaliha</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Istorija prijema i izdavanja robe</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}>
              <Plus className="h-4 w-4" /> Novo Kretanje
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Artikal *</Label>
                <Select name="productId" required>
                  <SelectTrigger><SelectValue placeholder="Izaberite artikal" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tip *</Label>
                <Select name="type" defaultValue="prijem">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prijem">Priem</SelectItem>
                    <SelectItem value="izdavanje">Izdavanje</SelectItem>
                    <SelectItem value="inventura">Inventura</SelectItem>
                    <SelectItem value="korekcija">Korekcija</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Količina *</Label>
              <Input name="quantity" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Dokument</Label>
              <Input name="documentRef" placeholder="Broj dokumenta" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Napomene</Label>
              <Input name="notes" placeholder="Napomene" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Čuvanje...' : 'Kreiraj Kretanje'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
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
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Artikal</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs text-right">Količina</TableHead>
                  <TableHead className="text-xs">Dokument</TableHead>
                  <TableHead className="text-xs">Napomene</TableHead>
                  <TableHead className="text-xs text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema kretanja za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">{formatDateTime(m.date)}</TableCell>
                      <TableCell className="text-xs">
                        <div>
                          <span className="font-medium">{m.product?.name}</span>
                          <span className="text-muted-foreground ml-1 text-[10px]">({m.product?.sku})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(m.type)}`}>
                          {getStatusLabel(m.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-xs text-right font-medium ${m.type === 'prijem' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.type === 'prijem' ? '+' : '-'}{m.quantity}
                      </TableCell>
                      <TableCell className="text-xs">{m.documentRef || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.notes || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete ovo kretanje zaliha? Zaliha artikla će biti automatski korigovana.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// ==================== OTPREMNICE TAB ====================

function OtpremniceTab() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<DeliveryNote | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [formStatus, setFormStatus] = useState('nacrt')
  const [formPartnerId, setFormPartnerId] = useState('')
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const fetchDeliveryNotes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/delivery-notes?${params.toString()}`)
    const data = await res.json()
    setDeliveryNotes(data)
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    fetchDeliveryNotes()
    fetch('/api/products').then((r) => r.json()).then(setProducts)
    fetch('/api/partners').then((r) => r.json()).then(setPartners)
  }, [fetchDeliveryNotes])

  const addLineItem = () => {
    setLineItems([...lineItems, { tempId: nextTempId(), productId: '', productName: '', quantity: '1', unitPrice: '0' }])
  }

  const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter((li) => li.tempId !== tempId))
  }

  const updateLineItem = (tempId: string, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map((li) => {
      if (li.tempId !== tempId) return li
      const updated = { ...li, [field]: value }
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value)
        if (prod) {
          updated.productName = prod.name
          if (!updated.unitPrice || updated.unitPrice === '0') {
            updated.unitPrice = String(prod.sellingPrice)
          }
        }
      }
      return updated
    }))
  }

  const openCreate = () => {
    setEditing(null)
    setLineItems([{ tempId: nextTempId(), productId: '', productName: '', quantity: '1', unitPrice: '0' }])
    setFormStatus('nacrt')
    setFormPartnerId('')
    setFormInvoiceNumber('')
    setFormNotes('')
    setViewMode('form')
  }

  const openEdit = (note: DeliveryNote) => {
    setEditing(note)
    setFormStatus(note.status)
    setFormPartnerId(note.partnerId)
    setFormInvoiceNumber(note.invoiceNumber || '')
    setFormNotes(note.notes || '')
    setLineItems(note.items.map((item) => ({
      tempId: nextTempId(),
      productId: item.productId,
      productName: item.productName,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })))
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleSubmit = async () => {
    if (!formPartnerId) {
      toast.error('Izaberite partnera')
      return
    }
    if (lineItems.length === 0 || lineItems.some((li) => !li.productId)) {
      toast.error('Dodajte barem jednu stavku sa izabranim proizvodom')
      return
    }
    setSubmitting(true)
    const body = {
      partnerId: formPartnerId,
      status: formStatus,
      invoiceNumber: formInvoiceNumber || undefined,
      notes: formNotes || undefined,
      items: lineItems.map((li) => ({
        productId: li.productId,
        productName: li.productName,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
      })),
    }
    try {
      const isEditing = !!editing
      const url = isEditing ? `/api/delivery-notes/${editing.id}` : '/api/delivery-notes'
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
      toast.success(isEditing ? 'Otpremnica uspešno ažurirana' : 'Otpremnica uspešno kreirana')
      setViewMode('list')
      setEditing(null)
      fetchDeliveryNotes()
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/delivery-notes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri brisanju')
        return
      }
      toast.success('Otpremnica uspešno obrisana')
      setDeleteId(null)
      fetchDeliveryNotes()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {editing ? 'Izmeni Otpremnicu' : 'Nova Otpremnica'}
              </CardTitle>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Otpremnice</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{deliveryNotes.length} otpremnica</p>
              </div>
              <Button size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nova Otpremnica
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži otpremnice..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="nacrt">Načrt</SelectItem>
                  <SelectItem value="pripremljena">Pripremljena</SelectItem>
                  <SelectItem value="otpremljena">Otpremljena</SelectItem>
                  <SelectItem value="stornirana">Stornirana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Partner *</Label>
                <Select value={formPartnerId} onValueChange={setFormPartnerId}>
                  <SelectTrigger><SelectValue placeholder="Izaberite partnera" /></SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (PIB: {p.pib})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">Načrt</SelectItem>
                    <SelectItem value="pripremljena">Pripremljena</SelectItem>
                    <SelectItem value="otpremljena">Otpremljena</SelectItem>
                    <SelectItem value="stornirana">Stornirana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Faktura br.</Label>
                <Input value={formInvoiceNumber} onChange={(e) => setFormInvoiceNumber(e.target.value)} placeholder="Fak-001" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Napomene</Label>
                <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Napomene" />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Stavke</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1" onClick={addLineItem}>
                  <Plus className="h-3 w-3" /> Dodaj stavku
                </Button>
              </div>
              {lineItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nema stavki. Kliknite &quot;Dodaj stavku&quot;.</p>
              )}
              <div className="space-y-2">
                {lineItems.map((li, idx) => (
                  <div key={li.tempId} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Proizvod</Label>
                      <Select value={li.productId} onValueChange={(v) => updateLineItem(li.tempId, 'productId', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Izaberite" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Količina</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs"
                        value={li.quantity}
                        onChange={(e) => updateLineItem(li.tempId, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Cena</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs"
                        value={li.unitPrice}
                        onChange={(e) => updateLineItem(li.tempId, 'unitPrice', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => removeLineItem(li.tempId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Čuvanje...' : editing ? 'Sačuvaj Izmene' : 'Kreiraj Otpremnicu'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </div>
        ) : loading ? (
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
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Faktura</TableHead>
                  <TableHead className="text-xs">Napomene</TableHead>
                  <TableHead className="text-xs text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema otpremnica za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryNotes.map((dn) => (
                    <TableRow key={dn.id}>
                      <TableCell className="text-xs font-mono font-medium">{dn.number}</TableCell>
                      <TableCell className="text-xs font-medium">{dn.partner?.name}</TableCell>
                      <TableCell className="text-xs">{formatDate(dn.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(dn.status)}`}>
                          {getStatusLabel(dn.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{dn.invoiceNumber || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{dn.notes || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(dn)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteId(dn.id)}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete ovu otpremnicu? Sve stavke će biti obrisane.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// ==================== CENOVNICI TAB ====================

function CenovniciTab() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<PriceList | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formValidFrom, setFormValidFrom] = useState('')
  const [formValidTo, setFormValidTo] = useState('')
  const [lineItems, setLineItems] = useState<PriceLineItem[]>([])

  const fetchPriceLists = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/price-lists')
    const data = await res.json()
    setPriceLists(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPriceLists()
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [fetchPriceLists])

  const addLineItem = () => {
    setLineItems([...lineItems, { tempId: nextTempId(), productId: '', price: '0', discountPct: '0' }])
  }

  const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter((li) => li.tempId !== tempId))
  }

  const updateLineItem = (tempId: string, field: keyof PriceLineItem, value: string) => {
    setLineItems(lineItems.map((li) => {
      if (li.tempId !== tempId) return li
      const updated = { ...li, [field]: value }
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value)
        if (prod && (!updated.price || updated.price === '0')) {
          updated.price = String(prod.sellingPrice)
        }
      }
      return updated
    }))
  }

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDescription('')
    setFormValidFrom('')
    setFormValidTo('')
    setLineItems([{ tempId: nextTempId(), productId: '', price: '0', discountPct: '0' }])
    setViewMode('form')
  }

  const openEdit = (pl: PriceList) => {
    setEditing(pl)
    setFormName(pl.name)
    setFormDescription(pl.description || '')
    setFormValidFrom(pl.validFrom ? pl.validFrom.split('T')[0] : '')
    setFormValidTo(pl.validTo ? pl.validTo.split('T')[0] : '')
    setLineItems(pl.items.map((item) => ({
      tempId: nextTempId(),
      productId: item.productId,
      price: String(item.price),
      discountPct: String(item.discountPct),
    })))
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleSubmit = async () => {
    if (!formName) {
      toast.error('Unesite naziv cenovnika')
      return
    }
    if (lineItems.length === 0 || lineItems.some((li) => !li.productId)) {
      toast.error('Dodajte barem jednu stavku sa izabranim proizvodom')
      return
    }
    setSubmitting(true)
    const body = {
      name: formName,
      description: formDescription || undefined,
      validFrom: formValidFrom || undefined,
      validTo: formValidTo || undefined,
      isActive: true,
      items: lineItems.map((li) => ({
        productId: li.productId,
        price: li.price,
        discountPct: li.discountPct || '0',
      })),
    }
    try {
      const isEditing = !!editing
      const url = isEditing ? `/api/price-lists/${editing.id}` : '/api/price-lists'
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
      toast.success(isEditing ? 'Cenovnik uspešno ažuriran' : 'Cenovnik uspešno kreiran')
      setViewMode('list')
      setEditing(null)
      fetchPriceLists()
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/price-lists/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri brisanju')
        return
      }
      toast.success('Cenovnik uspešno obrisan')
      setDeleteId(null)
      fetchPriceLists()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {editing ? 'Izmeni Cenovnik' : 'Novi Cenovnik'}
              </CardTitle>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Cenovnici</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{priceLists.length} cenovnika</p>
            </div>
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Novi Cenovnik
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Naziv *</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Naziv cenovnika" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Opis</Label>
                <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Opis cenovnika" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Važi od</Label>
                <Input type="date" value={formValidFrom} onChange={(e) => setFormValidFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Važi do</Label>
                <Input type="date" value={formValidTo} onChange={(e) => setFormValidTo(e.target.value)} />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Stavke cenovnika</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1" onClick={addLineItem}>
                  <Plus className="h-3 w-3" /> Dodaj stavku
                </Button>
              </div>
              {lineItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nema stavki. Kliknite &quot;Dodaj stavku&quot;.</p>
              )}
              <div className="space-y-2">
                {lineItems.map((li) => (
                  <div key={li.tempId} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Proizvod</Label>
                      <Select value={li.productId} onValueChange={(v) => updateLineItem(li.tempId, 'productId', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Izaberite" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Cena</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs"
                        value={li.price}
                        onChange={(e) => updateLineItem(li.tempId, 'price', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Popust %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="h-8 text-xs"
                        value={li.discountPct}
                        onChange={(e) => updateLineItem(li.tempId, 'discountPct', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => removeLineItem(li.tempId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Čuvanje...' : editing ? 'Sačuvaj Izmene' : 'Kreiraj Cenovnik'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </div>
        ) : loading ? (
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
                  <TableHead className="text-xs">Naziv</TableHead>
                  <TableHead className="text-xs">Opis</TableHead>
                  <TableHead className="text-xs text-center">Stavki</TableHead>
                  <TableHead className="text-xs">Važi od</TableHead>
                  <TableHead className="text-xs">Važi do</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema cenovnika za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  priceLists.map((pl) => (
                    <TableRow key={pl.id}>
                      <TableCell className="text-xs font-medium">{pl.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{pl.description || '-'}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {pl._count?.items ?? pl.items?.length ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{pl.validFrom ? formatDate(pl.validFrom) : '-'}</TableCell>
                      <TableCell className="text-xs">{pl.validTo ? formatDate(pl.validTo) : '-'}</TableCell>
                      <TableCell className="text-center">
                        {pl.isActive ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0">Aktivan</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] px-2 py-0">Neaktivan</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(pl)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteId(pl.id)}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete ovaj cenovnik? Sve stavke će biti obrisane.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
