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
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'

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

export function Magacin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Magacin</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upravljanje artiklima, zalihama i kretanjem robe
        </p>
      </div>

      <Tabs defaultValue="artikli" className="space-y-4">
        <TabsList>
          <TabsTrigger value="artikli">Artikli</TabsTrigger>
          <TabsTrigger value="kretanja">Kretanja Zaliha</TabsTrigger>
        </TabsList>

        <TabsContent value="artikli">
          <ArtikliTab />
        </TabsContent>
        <TabsContent value="kretanja">
          <KretanjaTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ArtikliTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success('Artikal uspešno kreiran')
      setDialogOpen(false)
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Artikli</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{products.length} artikala</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Novi Artikal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novi Artikal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Naziv *</Label>
                    <Input name="name" placeholder="Naziv artikla" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Šifra (SKU) *</Label>
                    <Input name="sku" placeholder="SKU-001" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Barkod</Label>
                    <Input name="barcode" placeholder="8600000000000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Kategorija</Label>
                    <Input name="category" placeholder="Kategorija" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Jedinica mere</Label>
                    <Select name="unit" defaultValue="kom">
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
                    <Input name="purchasePrice" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Prodajna cena *</Label>
                    <Input name="sellingPrice" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Minimalna zaliha</Label>
                    <Input name="minStock" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Trenutna zaliha</Label>
                    <Input name="currentStock" type="number" placeholder="0" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Kreiraj Artikal'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="text-xs">Šifra</TableHead>
                  <TableHead className="text-xs">Naziv</TableHead>
                  <TableHead className="text-xs">Kategorija</TableHead>
                  <TableHead className="text-xs text-right">Nabavna</TableHead>
                  <TableHead className="text-xs text-right">Prodajna</TableHead>
                  <TableHead className="text-xs text-center">Zaliha</TableHead>
                  <TableHead className="text-xs text-center">Min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
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

function KretanjaTab() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      setDialogOpen(false)
      fetchMovements()
    } catch {
      toast.error('Greška pri kreiranju kretanja')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Kretanja Zaliha</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Istorija prijema i izdavanja robe</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Novo Kretanje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Kretanje Zaliha</DialogTitle>
              </DialogHeader>
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Kreiraj Kretanje'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="text-xs">Artikal</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs text-right">Količina</TableHead>
                  <TableHead className="text-xs">Dokument</TableHead>
                  <TableHead className="text-xs">Napomene</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
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
