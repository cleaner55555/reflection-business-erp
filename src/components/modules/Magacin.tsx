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
import { Plus, Search, AlertTriangle, Pencil, Trash2, Package, FileText, Tag, ArrowLeft, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { ReportDownloadButton } from './ReportDownloadButton'

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

// ==================== COMPANY INFO ====================

const COMPANY = {
  name: 'Reflection Business',
  address: 'Bulevar Mihajla Pupina 10a',
  city: 'Beograd, 11070',
  pib: '123456789',
  maticniBr: '21012345',
  account: '265-12345678-12',
  bank: 'Banca Intesa Beograd',
  phone: '+381 11 123 4567',
  email: 'office@reflectionbusiness.rs',
}

// ==================== MAIN COMPONENT ====================

export function Magacin() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('warehouse.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('warehouse.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="artikli" className="space-y-4">
        <TabsList>
          <TabsTrigger value="artikli" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.products')}</span>
          </TabsTrigger>
          <TabsTrigger value="kretanja" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.movements')}</span>
          </TabsTrigger>
          <TabsTrigger value="otpremnice" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.deliveryNotes')}</span>
          </TabsTrigger>
          <TabsTrigger value="cenovnici" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.priceLists')}</span>
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
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
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

  // Batch-translate product content fields when data loads
  useEffect(() => {
    if (products.length > 0) {
      const texts = products.flatMap((p) => [p.name, p.sku, p.category].filter(Boolean) as string[])
      translateTexts(texts)
    }
  }, [products, translateTexts])

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
    if (!confirm(t('warehouse.confirmDeleteProduct'))) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('warehouse.productDeleted'))
      fetchProducts()
    } catch { toast.error(t('common.error')) }
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
        toast.error(err.error || t('common.saveError'))
        return
      }
      toast.success(isEditing ? t('warehouse.productUpdated') : t('warehouse.productCreated'))
      setViewMode('list')
      setEditingProduct(null)
      fetchProducts()
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
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {editingProduct ? t('warehouse.editProduct') : t('warehouse.newProduct')}
              </CardTitle>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('warehouse.products')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{products.length} {t('warehouse.productsCount')}</p>
              </div>
              <div className="flex items-center gap-2">
                <ReportDownloadButton type="products" />
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> {t('warehouse.newProduct')}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('warehouse.searchProducts')}
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder={t('warehouse.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('warehouse.allCategories')}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c || ''}>{tc(c || '')}</SelectItem>
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
                <Label className="text-xs">{t('common.name')} *</Label>
                <Input name="name" placeholder={t('warehouse.productNamePlaceholder')} defaultValue={editingProduct?.name || ''} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.skuLabel')} *</Label>
                <Input name="sku" placeholder="SKU-001" defaultValue={editingProduct?.sku || ''} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.barcode')}</Label>
                <Input name="barcode" placeholder="8600000000000" defaultValue={editingProduct?.barcode || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.category')}</Label>
                <Input name="category" defaultValue={editingProduct?.category || ''} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.unitOfMeasure')}</Label>
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
                <Label className="text-xs">{t('warehouse.purchasePriceLabel')} *</Label>
                <Input name="purchasePrice" type="number" step="0.01" placeholder="0.00" defaultValue={String(editingProduct?.purchasePrice || '')} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.sellingPriceLabel')} *</Label>
                <Input name="sellingPrice" type="number" step="0.01" placeholder="0.00" defaultValue={String(editingProduct?.sellingPrice || '')} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.minStock')}</Label>
                <Input name="minStock" type="number" placeholder="0" defaultValue={String(editingProduct?.minStock || '')} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.currentStock')}</Label>
                <Input name="currentStock" type="number" placeholder="0" defaultValue={String(editingProduct?.currentStock || '')} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : editingProduct ? t('common.saveChanges') : t('warehouse.createProduct')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
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
                  <TableHead className="text-xs">{t('warehouse.sku')}</TableHead>
                  <TableHead className="text-xs">{t('common.name')}</TableHead>
                  <TableHead className="text-xs">{t('common.category')}</TableHead>
                  <TableHead className="text-xs text-right">{t('warehouse.purchasePriceShort')}</TableHead>
                  <TableHead className="text-xs text-right">{t('warehouse.sellingPriceShort')}</TableHead>
                  <TableHead className="text-xs text-center">{t('warehouse.stock')}</TableHead>
                  <TableHead className="text-xs text-center">{t('warehouse.min')}</TableHead>
                  <TableHead className="text-xs text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                      {t('warehouse.noProducts')}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-mono">{tc(p.sku)}</TableCell>
                      <TableCell className="text-xs font-medium">{tc(p.name)}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {p.category ? tc(p.category) : '-'}
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
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
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

  // Batch-translate movement content fields when data loads
  useEffect(() => {
    if (movements.length > 0) {
      const texts = movements.flatMap((m) => [
        m.product?.name, m.product?.sku, m.documentRef, m.notes
      ].filter(Boolean) as string[])
      translateTexts(texts)
    }
  }, [movements, translateTexts])

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
        toast.error(err.error || t('common.saveError'))
        return
      }
      toast.success(t('warehouse.movementCreated'))
      setViewMode('list')
      fetchMovements()
    } catch {
      toast.error(t('common.saveError'))
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
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('warehouse.movementDeleted'))
      setDeleteId(null)
      fetchMovements()
    } catch {
      toast.error(t('common.deleteError'))
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
              <CardTitle className="text-base font-semibold">{t('warehouse.newMovement')}</CardTitle>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('warehouse.movements')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t('warehouse.movementsSubtitle')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}>
              <Plus className="h-4 w-4" /> {t('warehouse.newMovement')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.productLabel')} *</Label>
                <Select name="productId" required>
                  <SelectTrigger><SelectValue placeholder={t('warehouse.selectProduct')} /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.type')} *</Label>
                <Select name="type" defaultValue="prijem">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prijem">{t('common.prijem')}</SelectItem>
                    <SelectItem value="izdavanje">{t('common.izdavanje')}</SelectItem>
                    <SelectItem value="inventura">{t('common.inventura')}</SelectItem>
                    <SelectItem value="korekcija">{t('common.korekcija')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.quantity')} *</Label>
              <Input name="quantity" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('warehouse.document')}</Label>
              <Input name="documentRef" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.notes')}</Label>
              <Input name="notes" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : t('warehouse.createMovement')}
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
                  <TableHead className="text-xs">{t('warehouse.productLabel')}</TableHead>
                  <TableHead className="text-xs">{t('common.type')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.quantity')}</TableHead>
                  <TableHead className="text-xs">{t('warehouse.document')}</TableHead>
                  <TableHead className="text-xs">{t('common.notes')}</TableHead>
                  <TableHead className="text-xs text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      {t('warehouse.noMovements')}
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">{formatDateTime(m.date)}</TableCell>
                      <TableCell className="text-xs">
                        <div>
                          <span className="font-medium">{tc(m.product?.name || '')}</span>
                          <span className="text-muted-foreground ml-1 text-[10px]">({tc(m.product?.sku || '')})</span>
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
                      <TableCell className="text-xs">{m.documentRef ? tc(m.documentRef) : '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.notes ? tc(m.notes) : '-'}</TableCell>
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
            <AlertDialogTitle>{t('common.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('warehouse.confirmDeleteMovement')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// ==================== OTPREMNICE TAB ====================

function OtpremniceTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'print'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<DeliveryNote | null>(null)
  const [printNote, setPrintNote] = useState<DeliveryNote | null>(null)
  const [printLoading, setPrintLoading] = useState(false)
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

  // Batch-translate delivery note content fields when data loads
  useEffect(() => {
    if (deliveryNotes.length > 0) {
      const texts = deliveryNotes.flatMap((dn) => [
        dn.partner?.name, dn.notes, ...dn.items.map((i) => i.productName)
      ].filter(Boolean) as string[])
      translateTexts(texts)
    }
  }, [deliveryNotes, translateTexts])

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
    setPrintNote(null)
  }

  const handlePrint = async (note: DeliveryNote) => {
    setPrintLoading(true)
    setViewMode('print')
    try {
      const res = await fetch(`/api/delivery-notes/${note.id}`)
      if (!res.ok) { toast.error(t('warehouse.loadError')); return }
      const data: DeliveryNote = await res.json()
      setPrintNote(data)
    } catch {
      toast.error(t('warehouse.loadError'))
    } finally {
      setPrintLoading(false)
    }
  }

  const doPrint = () => {
    window.print()
  }

  const handleSubmit = async () => {
    if (!formPartnerId) {
      toast.error(t('warehouse.selectPartnerRequired'))
      return
    }
    if (lineItems.length === 0 || lineItems.some((li) => !li.productId)) {
      toast.error(t('warehouse.addItemRequired'))
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
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('warehouse.deliveryNoteUpdated') : t('warehouse.deliveryNoteCreated'))
      setViewMode('list')
      setEditing(null)
      fetchDeliveryNotes()
    } catch {
      toast.error(t('common.saveError'))
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
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('warehouse.deliveryNoteDeleted'))
      setDeleteId(null)
      fetchDeliveryNotes()
    } catch {
      toast.error(t('common.deleteError'))
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
                {editing ? t('warehouse.editDeliveryNote') : t('warehouse.newDeliveryNote')}
              </CardTitle>
            </div>
          </div>
        ) : viewMode === 'print' ? (
          <div className="flex items-center gap-3 no-print">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {t('warehouse.previewDeliveryNote')} {printNote?.number || ''}
              </CardTitle>
            </div>
            <div className="ml-auto">
              <Button size="sm" className="gap-2" onClick={doPrint}>
                <Printer className="h-4 w-4" /> {t('common.print')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('warehouse.deliveryNotes')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{deliveryNotes.length} {t('warehouse.deliveryNotesCount')}</p>
              </div>
              <Button size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> {t('warehouse.newDeliveryNote')}
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('warehouse.searchDeliveryNotes')}
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder={t('warehouse.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('warehouse.allStatuses')}</SelectItem>
                  <SelectItem value="nacrt">{t('common.draft')}</SelectItem>
                  <SelectItem value="pripremljena">{t('common.pripremljena')}</SelectItem>
                  <SelectItem value="otpremljena">{t('common.otpremljena')}</SelectItem>
                  <SelectItem value="stornirana">{t('common.stornirana')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'print' && (
          printLoading ? (
            <div className="flex items-center justify-center py-12">
              <Skeleton className="h-[600px] w-full max-w-4xl" />
            </div>
          ) : printNote ? (
            <div className="invoice-print-area bg-white rounded-lg border p-6 max-w-4xl mx-auto text-sm">
              {/* Company Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">{COMPANY.name}</h1>
                  <p className="text-xs text-gray-500 mt-1">{COMPANY.address}</p>
                  <p className="text-xs text-gray-500">{COMPANY.city}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-[10px] text-gray-500">PIB: {COMPANY.pib}</span>
                    <span className="text-[10px] text-gray-500">MB: {COMPANY.maticniBr}</span>
                    <span className="text-[10px] text-gray-500">{COMPANY.account}</span>
                    <span className="text-[10px] text-gray-500">{COMPANY.bank}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold uppercase tracking-wide">{t('warehouse.deliveryNote')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('common.number')}: <span className="font-mono font-medium text-gray-800">{printNote.number}</span></p>
                  <p className="text-xs text-gray-500">{t('common.date')}: {formatDate(printNote.date)}</p>
                  <p className="text-xs text-gray-500">{t('warehouse.city')}: Beograd</p>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('warehouse.recipient')}</p>
                <p className="text-sm font-semibold">{printNote.partner?.name ? tc(printNote.partner.name) : '-'}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {printNote.partner?.pib && (
                    <span className="text-[10px] text-gray-500">PIB: {printNote.partner.pib}</span>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-center w-10">R.br</th>
                    <th className="border border-gray-300 px-2 py-2">{t('common.name')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-16">{t('common.quantity')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">{t('common.price')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {printNote.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{tc(item.productName)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right">{formatRSD(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-medium">{formatRSD(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end mb-6">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-sm py-2 px-2 bg-gray-100 rounded font-bold border">
                    <span>{t('common.total')}:</span>
                    <span>{formatRSD(printNote.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {printNote.notes && (
                <div className="mb-4 text-xs">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('common.notes')}</p>
                  <p className="text-gray-600">{tc(printNote.notes)}</p>
                </div>
              )}

              {/* Invoice Number Reference */}
              {printNote.invoiceNumber && (
                <div className="mb-6 text-xs">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('warehouse.invoiceRef')}</p>
                  <p className="text-gray-600">{t('warehouse.invoice')} br: {printNote.invoiceNumber}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="print-footer grid grid-cols-2 gap-16 mt-10 pt-6 border-t">
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">{t('warehouse.issuerSignature')}</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">{t('warehouse.receiverSignature')}</p>
                </div>
              </div>
            </div>
          ) : null
        )}

        {viewMode === 'form' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.partner')} *</Label>
                <Select value={formPartnerId} onValueChange={setFormPartnerId}>
                  <SelectTrigger><SelectValue placeholder={t('warehouse.selectPartner')} /></SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (PIB: {p.pib})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.status')}</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">{t('common.draft')}</SelectItem>
                    <SelectItem value="pripremljena">{t('common.pripremljena')}</SelectItem>
                    <SelectItem value="otpremljena">{t('common.otpremljena')}</SelectItem>
                    <SelectItem value="stornirana">{t('common.stornirana')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.invoiceNumber')}</Label>
                <Input value={formInvoiceNumber} onChange={(e) => setFormInvoiceNumber(e.target.value)} placeholder="Fak-001" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.notes')}</Label>
                <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t('warehouse.items')}</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1" onClick={addLineItem}>
                  <Plus className="h-3 w-3" /> {t('warehouse.addItem')}
                </Button>
              </div>
              {lineItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">{t('warehouse.noItems')}</p>
              )}
              <div className="space-y-2">
                {lineItems.map((li, idx) => (
                  <div key={li.tempId} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t('warehouse.productLabel')}</Label>
                      <Select value={li.productId} onValueChange={(v) => updateLineItem(li.tempId, 'productId', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t('common.quantity')}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs"
                        value={li.quantity}
                        onChange={(e) => updateLineItem(li.tempId, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t('common.price')}</Label>
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
                {submitting ? t('common.saving') : editing ? t('common.saveChanges') : t('warehouse.createDeliveryNote')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}

        {viewMode !== 'form' && viewMode !== 'print' && (
          loading ? (
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
                  <TableHead className="text-xs">{t('common.number')}</TableHead>
                  <TableHead className="text-xs">{t('common.partner')}</TableHead>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs">{t('warehouse.invoice')}</TableHead>
                  <TableHead className="text-xs">{t('common.notes')}</TableHead>
                  <TableHead className="text-xs text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      {t('warehouse.noDeliveryNotes')}
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryNotes.map((dn) => (
                    <TableRow key={dn.id}>
                      <TableCell className="text-xs font-mono font-medium">{dn.number}</TableCell>
                      <TableCell className="text-xs font-medium">{dn.partner?.name ? tc(dn.partner.name) : '-'}</TableCell>
                      <TableCell className="text-xs">{formatDate(dn.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(dn.status)}`}>
                          {getStatusLabel(dn.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{dn.invoiceNumber || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{dn.notes ? tc(dn.notes) : '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(dn)} title={t('common.print')}>
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
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
        ))}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('warehouse.confirmDeleteDeliveryNote')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// ==================== CENOVNICI TAB ====================

function CenovniciTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
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

  // Batch-translate price list content fields when data loads
  useEffect(() => {
    if (priceLists.length > 0) {
      const texts = priceLists.flatMap((pl) => [pl.name, pl.description].filter(Boolean) as string[])
      translateTexts(texts)
    }
  }, [priceLists, translateTexts])

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
      toast.error(t('warehouse.priceListNameRequired'))
      return
    }
    if (lineItems.length === 0 || lineItems.some((li) => !li.productId)) {
      toast.error(t('warehouse.addItemRequired'))
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
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('warehouse.priceListUpdated') : t('warehouse.priceListCreated'))
      setViewMode('list')
      setEditing(null)
      fetchPriceLists()
    } catch {
      toast.error(t('common.saveError'))
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
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('warehouse.priceListDeleted'))
      setDeleteId(null)
      fetchPriceLists()
    } catch {
      toast.error(t('common.deleteError'))
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
                {editing ? t('warehouse.editPriceList') : t('warehouse.newPriceList')}
              </CardTitle>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('warehouse.priceLists')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{priceLists.length} {t('warehouse.priceListsCount')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t('warehouse.newPriceList')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.name')} *</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.description')}</Label>
                <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.validFrom')}</Label>
                <Input type="date" value={formValidFrom} onChange={(e) => setFormValidFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('warehouse.validTo')}</Label>
                <Input type="date" value={formValidTo} onChange={(e) => setFormValidTo(e.target.value)} />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t('warehouse.priceListItems')}</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1" onClick={addLineItem}>
                  <Plus className="h-3 w-3" /> {t('warehouse.addItem')}
                </Button>
              </div>
              {lineItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">{t('warehouse.noItems')}</p>
              )}
              <div className="space-y-2">
                {lineItems.map((li) => (
                  <div key={li.tempId} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t('warehouse.productLabel')}</Label>
                      <Select value={li.productId} onValueChange={(v) => updateLineItem(li.tempId, 'productId', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t('common.price')}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs"
                        value={li.price}
                        onChange={(e) => updateLineItem(li.tempId, 'price', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t('warehouse.discountPct')}</Label>
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
                {submitting ? t('common.saving') : editing ? t('common.saveChanges') : t('warehouse.createPriceList')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
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
                  <TableHead className="text-xs">{t('common.name')}</TableHead>
                  <TableHead className="text-xs">{t('common.description')}</TableHead>
                  <TableHead className="text-xs text-center">{t('warehouse.itemsCount')}</TableHead>
                  <TableHead className="text-xs">{t('warehouse.validFrom')}</TableHead>
                  <TableHead className="text-xs">{t('warehouse.validTo')}</TableHead>
                  <TableHead className="text-xs text-center">{t('common.status')}</TableHead>
                  <TableHead className="text-xs text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      {t('warehouse.noPriceLists')}
                    </TableCell>
                  </TableRow>
                ) : (
                  priceLists.map((pl) => (
                    <TableRow key={pl.id}>
                      <TableCell className="text-xs font-medium">{tc(pl.name)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{pl.description ? tc(pl.description) : '-'}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {pl._count?.items ?? pl.items?.length ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{pl.validFrom ? formatDate(pl.validFrom) : '-'}</TableCell>
                      <TableCell className="text-xs">{pl.validTo ? formatDate(pl.validTo) : '-'}</TableCell>
                      <TableCell className="text-center">
                        {pl.isActive ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0">{t('common.active')}</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] px-2 py-0">{t('common.inactive')}</Badge>
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
            <AlertDialogTitle>{t('common.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('warehouse.confirmDeletePriceList')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
