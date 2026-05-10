'use client'

import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
'use client'

import { useState } from 'react'

import { AlertCircle, ArrowRight, ArrowUpRight, BarChart3, Bell, CheckCircle2, ChevronRight, Clock, Copy, CreditCard, DollarSign, Edit, Filter, Gift, Globe, LayoutGrid, List, Mail, MousePointerClick, Package, Plus, Search, Settings, ShoppingBag, ShoppingCart, Star, Tag, Trash2, TrendingUp, Truck, Users, Zap } from 'lucide-react'
import type { StoreProduct, OrderItem, StoreOrder, Category, Coupon, StoreSettings } from './types'

function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground font-medium">{(d.value / 1000).toFixed(0)}k</span>
            <div
              className="w-full bg-primary/80 hover:bg-primary transition-colors rounded-t"
              style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-xs text-muted-foreground truncate">{d.label}</div>
        ))}
      </div>
    </div>
  )
}

function OverviewTab({ products, orders, categories }: { products: StoreProduct[]; orders: StoreOrder[]; categories: Category[] }) {
  const totalProducts = products.length
  const activeOrders = orders.filter((o) => !['završena', 'otkazana'].includes(o.status)).length
  const totalRevenue = orders.filter((o) => o.paymentStatus === 'plaćeno').reduce((s, o) => s + o.total, 0)
  const conversionRate = 3.8
  const totalCustomers = [...new Set(orders.map((o) => o.customerEmail))].length
  const avgOrderValue = orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5)
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const revenueData = [
    { label: 'Jan', value: 1250000 },
    { label: 'Feb', value: 1480000 },
    { label: 'Mar', value: 1820000 },
    { label: 'Apr', value: 1350000 },
    { label: 'Maj', value: 1690000 },
    { label: 'Jun', value: 2100000 },
    { label: 'Jul', value: 1890000 },
    { label: 'Avg', value: 2250000 },
    { label: 'Sep', value: 1950000 },
    { label: 'Okt', value: 2400000 },
    { label: 'Nov', value: 2850000 },
    { label: 'Dec', value: 3100000 },
  ]

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Ukupno proizvoda</span>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> {Math.round(totalProducts * 0.12)} aktivnih</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Aktivne porudžbine</span>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{activeOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">od {orders.length} ukupno</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Ukupan prihod</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{(totalRevenue / 1000).toFixed(0)}k RSD</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> +12.5% od prošlog meseca</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Konverzija</span>
            <MousePointerClick className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCustomers} kupaca</p>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Prosečna narudžbina</div>
          <p className="text-lg font-bold">{formatCurrency(avgOrderValue)}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Istaknuti proizvodi</div>
          <p className="text-lg font-bold text-amber-600">{products.filter((p) => p.featured).length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Kategorije</div>
          <p className="text-lg font-bold">{categories.length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Prosečna ocena</div>
          <p className="text-lg font-bold">⭐ {(products.reduce((s, p) => s + p.rating, 0) / Math.max(products.length, 1)).toFixed(1)}</p>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <span className="font-medium">{lowStockProducts.length} proizvoda</span> ima nisku zalihu (≤ 5 kom): {lowStockProducts.map((p) => p.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Prihod po mesecima (2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Status porudžbina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const cfg = orderStatusConfig[status]
                  const pct = orders.length > 0 ? (count / orders.length) * 100 : 0
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label || status}</Badge>
                        </div>
                        <span className="font-medium">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Top proizvodi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  <div className="h-9 w-9 rounded bg-muted flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} • ⭐ {p.rating} ({p.reviews} rec.)</p>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Poslednje porudžbine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrders.map((o) => {
                const cfg = orderStatusConfig[o.status]
                return (
                  <div key={o.id} className="flex items-center gap-3 py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.orderNumber} • {o.items.length} artikala</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${cfg?.color}`}>{cfg?.label}</Badge>
                    <span className="text-sm font-bold shrink-0">{formatCurrency(o.total)}</span>
                  </div>
                )
              })}
              {recentOrders.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">Nema porudžbina</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProductsTab({ products, setProducts, categories }: { products: StoreProduct[]; setProducts: React.Dispatch<React.SetStateAction<StoreProduct[]>>; categories: string[] }) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const emptyForm = (): StoreProduct => ({
    id: '', name: '', sku: '', category: '', description: '', price: 0, comparePrice: 0, costPrice: 0,
    stock: 0, weight: 0, dimensions: '', seoTitle: '', seoDescription: '', rating: 0, reviews: 0,
    status: 'draft', featured: false, createdAt: new Date().toISOString(),
  })

  const [form, setForm] = useState<StoreProduct>(emptyForm())

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.category !== catFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  const openEdit = (p: StoreProduct) => {
    setEditingProduct(p)
    setForm({ ...p })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setDialogOpen(false)
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...form } : p))
    } else {
      const newProduct = { ...form, id: `p-${Date.now()}`, createdAt: new Date().toISOString(), rating: 0, reviews: 0 }
      setProducts((prev) => [...prev, newProduct])
    }
  }

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteConfirm(null)
  }

  const toggleFeatured = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, featured: !p.featured } : p))
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži po nazivu ili SKU..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{categories.map((c) => (<SelectItem key={c} value={c!}>{c}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            <SelectItem value="active">Aktivan</SelectItem>
            <SelectItem value="draft">Nacrt</SelectItem>
            <SelectItem value="out_of_stock">Nema na stanju</SelectItem>
            <SelectItem value="archived">Arhiviran</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Dodaj proizvod</Button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Prikazano {filtered.length} od {products.length} proizvoda</span>
        <span>Istaknuti: {products.filter((p) => p.featured).length}</span>
      </div>

      {/* Grid View */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">Nema proizvoda za prikaz</p>
          <p className="text-xs text-muted-foreground mt-1">Pokušajte da promenite filtere ili dodajte novi proizvod</p>
          <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Dodaj prvi proizvod</Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const cfg = productStatusConfig[p.status]
            return (
              <Card key={p.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="p-0 pb-0 relative">
                  <div className="h-32 bg-muted rounded-t-lg flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  {p.featured && <div className="absolute top-2 left-2"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /></div>}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3 w-3" /></Button>
                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => toggleFeatured(p.id)}><Star className="h-3 w-3" /></Button>
                  </div>
                  <Badge variant="outline" className={`absolute bottom-2 right-2 text-xs ${cfg?.color}`}>{cfg?.label}</Badge>
                </CardHeader>
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-sm font-medium truncate" title={p.name}>{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category || 'Bez kategorije'} • {p.sku}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold">{formatCurrency(p.price)}</span>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="text-xs text-muted-foreground line-through ml-1">{formatCurrency(p.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Zaliha: <Badge variant={p.stock <= 5 ? 'destructive' : 'outline'} className="text-xs px-1">{p.stock}</Badge></span>
                    <span>⭐ {p.rating} ({p.reviews})</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Proizvod</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead className="text-right">Cena</TableHead>
                <TableHead className="text-right">Zaliha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const cfg = productStatusConfig[p.status]
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        <div>
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">⭐ {p.rating} ({p.reviews} recenzija)</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{p.sku}</TableCell>
                    <TableCell className="text-sm">{p.category || '-'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(p.price)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.stock <= 5 ? 'destructive' : 'outline'} className="text-xs">{p.stock}</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteConfirm(p.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      )}
    </div>
  )
}

function OrdersTab({ orders, setOrders }: { orders: StoreOrder[]; setOrders: React.Dispatch<React.SetStateAction<StoreOrder[]>> }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null)

  const filtered = orders.filter((o) => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  })

  const advanceStatus = (orderId: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o
      const currentIndex = orderStatusFlow.indexOf(o.status as typeof orderStatusFlow[number])
      if (currentIndex < 0 || currentIndex >= orderStatusFlow.length - 1) return o
      const newStatus = orderStatusFlow[currentIndex + 1]
      return {
        ...o,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        timeline: [...o.timeline, { status: newStatus, date: new Date().toISOString() }],
      }
    }))
  }

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o
      return {
        ...o,
        status: 'otkazana' as const,
        paymentStatus: 'otkazano' as const,
        updatedAt: new Date().toISOString(),
        timeline: [...o.timeline, { status: 'otkazana', date: new Date().toISOString(), note: 'Porudžbina otkazana' }],
      }
    }))
  }

  const formatDate = (d: string) => new Date(d).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži po broju narudžbine ili kupcu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(orderStatusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">Nema porudžbina</p>
          <p className="text-xs text-muted-foreground mt-1">Porudžbine kupaca će se pojaviti ovde</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const cfg = orderStatusConfig[o.status]
            const payCfg = paymentStatusConfig[o.paymentStatus]
            return (
              <Card key={o.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedOrder(o)}>
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold">{o.orderNumber}</span>
                      <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label}</Badge>
                      <Badge variant="outline" className={`text-xs ${payCfg?.color}`}>{payCfg?.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{o.customerName} • {o.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} • {o.items.length} artikla • {paymentMethodLabels[o.paymentMethod]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{formatCurrency(o.total)}</p>
                    {o.trackingNumber && <p className="text-xs text-muted-foreground font-mono">{o.trackingNumber}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      )}
    </div>
  )
}

function CategoriesTab({ categories, setCategories }: { categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>> }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const emptyCat = (): Category => ({
    id: '', name: '', slug: '', description: '', productCount: 0, sortOrder: categories.length + 1, isActive: true,
  })

  const [form, setForm] = useState<Category>(emptyCat())

  const openCreate = () => { setEditingCat(null); setForm(emptyCat()); setDialogOpen(true) }
  const openEdit = (c: Category) => { setEditingCat(c); setForm({ ...c }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.name) return
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setDialogOpen(false)
    if (editingCat) {
      setCategories((prev) => prev.map((c) => c.id === editingCat.id ? { ...form, slug } : c))
    } else {
      setCategories((prev) => [...prev, { ...form, id: `c-${Date.now()}`, slug }])
    }
  }

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setDeleteConfirm(null)
  }

  const toggleActive = (id: string) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    setCategories((prev) => {
      const arr = [...prev]
      const tmp = arr[index]
      arr[index] = arr[index - 1]
      arr[index - 1] = tmp
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }))
    })
  }

  const moveDown = (index: number) => {
    if (index >= categories.length - 1) return
    setCategories((prev) => {
      const arr = [...prev]
      const tmp = arr[index]
      arr[index] = arr[index + 1]
      arr[index + 1] = tmp
      return arr.map((c, i) => ({ ...c, sortOrder: i + 1 }))
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} kategorija</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nova kategorija</Button>
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">Nema kategorija</p>
          <p className="text-xs text-muted-foreground mt-1">Kreirajte kategorije za organizaciju proizvoda</p>
          <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj kategoriju</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat, index) => (
            <Card key={cat.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveUp(index)} disabled={index === 0}><ChevronRight className="h-3 w-3 rotate-[-90deg]" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveDown(index)} disabled={index === categories.length - 1}><ChevronRight className="h-3 w-3 rotate-90" /></Button>
                </div>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cat.name}</span>
                    {!cat.isActive && <Badge variant="secondary" className="text-xs">Neaktivna</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">/{cat.slug} • {cat.productCount} proizvoda</p>
                  {cat.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={cat.isActive} onCheckedChange={() => toggleActive(cat.id)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteConfirm(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      )}
    </div>
  )
}

function CouponsTab({ coupons, setCoupons }: { coupons: Coupon[]; setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>> }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const emptyCoupon = (): Coupon => ({
    id: '', code: '', type: 'procenat', value: 0, minOrder: 0, maxDiscount: 0,
    validFrom: new Date().toISOString().split('T')[0], validTo: new Date().toISOString().split('T')[0],
    maxUses: 100, usedCount: 0, isActive: true, appliesTo: 'Svi proizvodi', createdAt: new Date().toISOString(),
  })

  const [form, setForm] = useState<Coupon>(emptyCoupon())

  const openCreate = () => { setEditingCoupon(null); setForm(emptyCoupon()); setDialogOpen(true) }
  const openEdit = (c: Coupon) => { setEditingCoupon(c); setForm({ ...c }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.code) return
    setDialogOpen(false)
    if (editingCoupon) {
      setCoupons((prev) => prev.map((c) => c.id === editingCoupon.id ? { ...form } : c))
    } else {
      setCoupons((prev) => [...prev, { ...form, id: `cp-${Date.now()}` }])
    }
  }

  const toggleActive = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const typeLabels: Record<string, string> = {
    procenat: 'Procenat',
    fiksni_iznos: 'Fiksni iznos',
    besplatna_dostava: 'Besplatna dostava',
  }

  const isExpired = (coupon: Coupon) => new Date(coupon.validTo) < new Date()
  const isScheduled = (coupon: Coupon) => new Date(coupon.validFrom) > new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{coupons.length} kupona • {coupons.filter((c) => c.isActive).length} aktivnih</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Novi kupon</Button>
      </div>

      {coupons.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">Nema kupona</p>
          <p className="text-xs text-muted-foreground mt-1">Kreirajte kupone za popuste i promocije</p>
          <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj kupon</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon)
            const scheduled = isScheduled(coupon)
            const usagePct = coupon.maxUses > 0 ? (coupon.usedCount / coupon.maxUses) * 100 : 0
            return (
              <Card key={coupon.id} className={`relative overflow-hidden ${!coupon.isActive && 'opacity-60'}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 ${coupon.isActive ? 'bg-primary' : 'bg-gray-300'}`} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold tracking-wider">{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} className="text-muted-foreground hover:text-foreground">
                          {copiedCode === coupon.code ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{typeLabels[coupon.type]}</Badge>
                        {expired && <Badge variant="destructive" className="text-xs">Istekao</Badge>}
                        {scheduled && <Badge variant="secondary" className="text-xs">Zakazan</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={coupon.isActive} onCheckedChange={() => toggleActive(coupon.id)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(coupon)}><Edit className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>

                  <div className="text-2xl font-bold">
                    {coupon.type === 'besplatna_dostava' ? (
                      <span className="text-green-600 flex items-center gap-1"><Truck className="h-5 w-5" /> Besplatna dostava</span>
                    ) : coupon.type === 'procenat' ? (
                      <span className="text-primary">{coupon.value}%<span className="text-sm text-muted-foreground font-normal ml-1">popust</span></span>
                    ) : (
                      <span className="text-primary">{formatCurrency(coupon.value)}<span className="text-sm text-muted-foreground font-normal ml-1">popust</span></span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {coupon.minOrder > 0 && <div>Min. narudžbina: <span className="font-medium text-foreground">{formatCurrency(coupon.minOrder)}</span></div>}
                    {coupon.maxDiscount > 0 && <div>Max. popust: <span className="font-medium text-foreground">{formatCurrency(coupon.maxDiscount)}</span></div>}
                    <div>Važi od: {coupon.validFrom}</div>
                    <div>Važi do: {coupon.validTo}</div>
                    <div>Primenjuje se na: <span className="font-medium text-foreground">{coupon.appliesTo}</span></div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Korišćenje: {coupon.usedCount} / {coupon.maxUses || '∞'}</span>
                      <span>{usagePct.toFixed(0)}%</span>
                    </div>
                    <Progress value={usagePct} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

    </div>
  )
}

function ReportsTab({ products, orders }: { products: StoreProduct[]; orders: StoreOrder[] }) {
  const [period, setPeriod] = useState('30d')

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'plaćeno').reduce((s, o) => s + o.total, 0)
  const totalOrders = orders.length
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const completedOrders = orders.filter((o) => o.status === 'završena' || o.status === 'isporučena').length
  const canceledOrders = orders.filter((o) => o.status === 'otkazana').length
  const returnedRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0

  const topSellingProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8)
  const categoryRevenue = [...new Set(products.map((p) => p.category).filter(Boolean))].map((cat) => {
    const catProducts = products.filter((p) => p.category === cat)
    const revenue = catProducts.reduce((s, p) => s + p.price * Math.floor(Math.random() * 20), 0)
    return { category: cat, revenue, products: catProducts.length }
  }).sort((a, b) => b.revenue - a.revenue)

  const totalCustomers = [...new Set(orders.map((o) => o.customerEmail))].length
  const returningCustomers = 2

  const salesByPeriod = [
    { label: 'Pon', value: 85000 }, { label: 'Uto', value: 120000 }, { label: 'Sre', value: 95000 },
    { label: 'Čet', value: 140000 }, { label: 'Pet', value: 175000 }, { label: 'Sub', value: 210000 }, { label: 'Ned', value: 130000 },
  ]

  const conversionFunnel = [
    { stage: 'Posete sajtu', value: 12450, color: 'bg-blue-500' },
    { stage: 'Pregled proizvoda', value: 8230, color: 'bg-indigo-500' },
    { stage: 'Dodato u korpu', value: 3420, color: 'bg-purple-500' },
    { stage: 'Započeta narudžbina', value: 1850, color: 'bg-amber-500' },
    { stage: 'Završena kupovina', value: 620, color: 'bg-green-500' },
  ]

  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const avgStock = products.length > 0 ? products.reduce((s, p) => s + p.stock, 0) / products.length : 0

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        {['7d', '30d', '90d', '1y'].map((p) => (
          <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
            {p === '7d' ? '7 dana' : p === '30d' ? '30 dana' : p === '90d' ? '90 dana' : '1 godina'}
          </Button>
        ))}
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Ukupan prihod</div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> +18.3%</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Ukupno narudžbina</div>
          <p className="text-2xl font-bold">{totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">{completedOrders} završenih</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Prosečna narudžbina</div>
          <p className="text-2xl font-bold">{formatCurrency(avgOrder)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> +5.2%</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Stopa povrata</div>
          <p className="text-2xl font-bold">{returnedRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{canceledOrders} otkazano</p>
        </Card>
      </div>

      {/* Customer KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Kupaca ukupno</div>
          <p className="text-xl font-bold">{totalCustomers}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Povratni kupci</div>
          <p className="text-xl font-bold">{returningCustomers}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCustomers > 0 ? ((returningCustomers / totalCustomers) * 100).toFixed(0) : 0}% od ukupnih</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Vrednost zaliha</div>
          <p className="text-xl font-bold">{formatCurrency(inventoryValue)}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Prosečna zaliha</div>
          <p className="text-xl font-bold">{avgStock.toFixed(0)} kom/proizvod</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Week */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Prodaja po danima (ovaj nedelji)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={salesByPeriod} />
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" /> Konverziono levak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionFunnel.map((step, i) => {
                const widthPct = (step.value / conversionFunnel[0].value) * 100
                const convRate = i > 0 ? ((step.value / conversionFunnel[i - 1].value) * 100).toFixed(1) : '100'
                return (
                  <div key={step.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{step.stage}</span>
                      <span className="text-muted-foreground">{step.value.toLocaleString('sr-RS')} ({convRate}%)</span>
                    </div>
                    <div className="h-6 rounded bg-muted overflow-hidden">
                      <div className={`h-full rounded ${step.color} transition-all flex items-center justify-end pr-2`} style={{ width: `${widthPct}%` }}>
                        <span className="text-xs text-white font-medium">{widthPct.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top proizvodi po prodaji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSellingProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(p.price)}</p>
                    <p className="text-xs text-muted-foreground">Zaliha: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> Prihod po kategoriji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryRevenue.slice(0, 6).map((cr) => {
                const maxRev = categoryRevenue[0]?.revenue || 1
                const pct = (cr.revenue / maxRev) * 100
                return (
                  <div key={cr.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cr.category}</span>
                      <span className="font-medium">{formatCurrency(cr.revenue)}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsTab({ settings, setSettings }: { settings: StoreSettings; setSettings: React.Dispatch<React.SetStateAction<StoreSettings>> }) {
  const update = (key: keyof StoreSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updatePaymentMethod = (id: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) => pm.id === id ? { ...pm, enabled } : pm),
    }))
  }

  const updateShippingOption = (id: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      shippingOptions: prev.shippingOptions.map((so) => so.id === id ? { ...so, enabled } : so),
    }))
  }

  const updateNotification = (key: keyof StoreSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-5 w-5" /> Podaci o prodavnici</CardTitle>
          <CardDescription>Osnovne informacije o vašoj online prodavnici</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Naziv prodavnice</Label>
              <Input value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL adresa</Label>
              <Input value={settings.storeUrl} onChange={(e) => update('storeUrl', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Opis prodavnice</Label>
            <Textarea value={settings.storeDescription} onChange={(e) => update('storeDescription', e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</Label>
              <Input type="email" value={settings.storeEmail} onChange={(e) => update('storeEmail', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Telefon</Label>
              <Input value={settings.storePhone} onChange={(e) => update('storePhone', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional & Tax */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-5 w-5" /> Regionalna podešavanja i porezi</CardTitle>
          <CardDescription>Valuta, jezik i poreske stope</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valuta</Label>
              <Select value={settings.currency} onValueChange={(v) => update('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RSD">RSD (Dinar)</SelectItem>
                  <SelectItem value="EUR">EUR (Evro)</SelectItem>
                  <SelectItem value="USD">USD (Dolar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jezik</Label>
              <Select value={settings.language} onValueChange={(v) => update('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sr">Srpski</SelectItem>
                  <SelectItem value="en">Engleski</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Poreska stopa (%)</Label>
              <Input type="number" value={settings.taxRate} onChange={(e) => update('taxRate', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Besplatna dostava iznad (RSD)</Label>
            <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">Dostava će biti besplatna za narudžbine iznad ovog iznosa</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-5 w-5" /> Načini plaćanja</CardTitle>
          <CardDescription>Odaberite koje metode plaćanja su dostupne</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{pm.name}</span>
                </div>
                <Switch checked={pm.enabled} onCheckedChange={(v) => updatePaymentMethod(pm.id, v)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Truck className="h-5 w-5" /> Opcije dostave</CardTitle>
          <CardDescription>Konfigurišite dostavne metode i cene</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.shippingOptions.map((so) => (
              <div key={so.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium">{so.name}</div>
                  <div className="text-xs text-muted-foreground">{so.estimatedDays} • {so.price === 0 ? 'Besplatno' : formatCurrency(so.price)}</div>
                </div>
                <Switch checked={so.enabled} onCheckedChange={(v) => updateShippingOption(so.id, v)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Store Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Settings className="h-5 w-5" /> Funkcionalnosti prodavnice</CardTitle>
          <CardDescription>Uključite ili isključite funkcionalnosti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-medium">Recenzije proizvoda</span><p className="text-xs text-muted-foreground">Dozvoli kupcima da ostavljaju recenzije</p></div>
              <Switch checked={settings.enableReviews} onCheckedChange={(v) => update('enableReviews', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-medium">Lista želja</span><p className="text-xs text-muted-foreground">Dozvoli kupcima da čuvaju proizvode</p></div>
              <Switch checked={settings.enableWishlist} onCheckedChange={(v) => update('enableWishlist', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-medium">Registracija korisnika</span><p className="text-xs text-muted-foreground">Dozvoli kreiranje naloga</p></div>
              <Switch checked={settings.enableRegistration} onCheckedChange={(v) => update('enableRegistration', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-medium">Neregistrovana kupovina</span><p className="text-xs text-muted-foreground">Dozvoli kupovinu bez naloga</p></div>
              <Switch checked={settings.enableGuestCheckout} onCheckedChange={(v) => update('enableGuestCheckout', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Ponašanje pri nema na stanju</span>
                <p className="text-xs text-muted-foreground">Šta uraditi kada proizvod nije na stanju</p>
              </div>
              <Select value={settings.outOfStockBehavior} onValueChange={(v) => update('outOfStockBehavior', v)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sakrij">Sakrij proizvod</SelectItem>
                  <SelectItem value="prikazi">Prikaži sa oznakom</SelectItem>
                  <SelectItem value="dovuci">Dozvoli naručivanje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Alarm niske zalihe</span>
                <p className="text-xs text-muted-foreground">Prikaži upozorenje kada zaliha padne ispod</p>
              </div>
              <Input type="number" className="w-20" value={settings.lowStockAlert} onChange={(e) => update('lowStockAlert', parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5" /> Obaveštenja</CardTitle>
          <CardDescription>Konfigurišite email obaveštenja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Nova narudžbina</span>
              <Switch checked={settings.notifications.newOrder} onCheckedChange={(v) => updateNotification('newOrder', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Niska zaliha</span>
              <Switch checked={settings.notifications.lowStock} onCheckedChange={(v) => updateNotification('lowStock', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Promena statusa narudžbine</span>
              <Switch checked={settings.notifications.orderStatusChange} onCheckedChange={(v) => updateNotification('orderStatusChange', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Nova recenzija</span>
              <Switch checked={settings.notifications.newReview} onCheckedChange={(v) => updateNotification('newReview', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Dnevni izveštaj</span>
              <Switch checked={settings.notifications.dailyReport} onCheckedChange={(v) => updateNotification('dailyReport', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Nedeljni izveštaj</span>
              <Switch checked={settings.notifications.weeklyReport} onCheckedChange={(v) => updateNotification('weeklyReport', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          Sačuvaj podešavanja
        </Button>
      </div>
    </div>
  )
}
