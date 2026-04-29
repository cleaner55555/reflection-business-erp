'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Store, ShoppingCart, Users, Package, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, AlertCircle, Clock, ArrowRight, BarChart3, TrendingUp,
  DollarSign, Star, Globe2, Boxes, UserCheck, Shield, FileText
} from 'lucide-react'

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

// Marketplace uses existing Partner (type=dobavljac for wholesalers) + Product + PriceList models

export function Marketplace() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Overview data
  const [stats, setStats] = useState({ vendors: 0, products: 0, orders: 0, revenue: 0 })

  // Vendors (Partners with type=dobavljac)
  const [vendors, setVendors] = useState<Array<Record<string, any>>>([])
  const [vendorSearch, setVendorSearch] = useState('')

  // Products in marketplace
  const [products, setProducts] = useState<Array<Record<string, any>>>([])
  const [productSearch, setProductSearch] = useState('')
  const [productFilter, setProductFilter] = useState('all')

  // Commission settings
  const [commissionRate, setCommissionRate] = useState(5)
  const [minCommission, setMinCommission] = useState(0)

  // Orders
  const [orders, setOrders] = useState<Array<Record<string, any>>>([])

  // Dialogs
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Record<string, any> | null>(null)

  // Form defaults
  const emptyProduct = {
    name: '', sku: '', barcode: '', category: '', unit: 'kom',
    purchasePrice: 0, sellingPrice: 0, minStock: 0, maxStock: 0,
    description: '', costMethod: 'prosek', trackLots: false,
    expiryDays: 0, weight: 0, volume: 0, isActive: true,
  }
  const [productForm, setProductForm] = useState(emptyProduct)

  // ============ DATA LOADING ============

  const loadStats = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const [partnersRes, productsRes] = await Promise.all([
        fetch(`/api/partners?companyId=${activeCompanyId}&limit=500`),
        fetch(`/api/products?companyId=${activeCompanyId}&limit=500`),
      ])
      if (partnersRes.ok && productsRes.ok) {
        const pData = await partnersRes.json()
        const prodData = await productsRes.json()
        const vCount = (pData.items || pData || []).filter((p: any) => p.type === 'dobavljac').length
        setStats({
          vendors: vCount,
          products: prodData.items?.length || prodData.length || 0,
          orders: 0,
          revenue: 0,
        })
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadVendors = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/partners?companyId=${activeCompanyId}&limit=100&search=${vendorSearch}`)
      if (res.ok) {
        const data = await res.json()
        setVendors((data.items || data || []).filter((p: any) => p.type === 'dobavljac' || p.type === 'partner'))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, vendorSearch])

  const loadProducts = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (productSearch) params.set('search', productSearch)
      const res = await fetch(`/api/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        const all = data.items || data || []
        setProducts(productFilter === 'active' ? all.filter((p: any) => p.isActive) :
          productFilter === 'inactive' ? all.filter((p: any) => !p.isActive) : all)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, productSearch, productFilter])

  const loadOrders = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/invoices?companyId=${activeCompanyId}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.items || data || [])
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    if (activeTab === 'vendors') loadVendors()
  }, [activeTab, loadVendors])

  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'overview') loadProducts()
  }, [activeTab, loadProducts])

  useEffect(() => {
    if (activeTab === 'overview') loadOrders()
  }, [activeTab, loadOrders])

  // ============ ACTIONS ============

  const handleCreateProduct = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...productForm }),
      })
      if (res.ok) {
        setProductDialogOpen(false)
        setProductForm(emptyProduct)
        loadProducts()
        loadStats()
      }
    } catch { /* silent */ }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Obrisati proizvod iz marketplace-a?')) return
    try {
      const res = await fetch(`/api/products/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' })
      if (res.ok) loadProducts()
    } catch { /* silent */ }
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Platforma za povezivanje veleprodaja i maloprodaja</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadStats(); loadVendors(); loadProducts(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setProductDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi proizvod
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
          <TabsTrigger value="vendors"><Store className="h-4 w-4 mr-1 hidden sm:inline" /> Veleprodaje</TabsTrigger>
          <TabsTrigger value="products"><Boxes className="h-4 w-4 mr-1 hidden sm:inline" /> Katalog</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1 hidden sm:inline" /> Narudžbe</TabsTrigger>
          <TabsTrigger value="settings"><Shield className="h-4 w-4 mr-1 hidden sm:inline" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Veleprodaja</span>
                <Store className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{stats.vendors}</p>
              <p className="text-xs text-muted-foreground">aktivnih dobavljača</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Proizvodi</span>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{stats.products}</p>
              <p className="text-xs text-muted-foreground">u katalogu</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Narudžbe</span>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">ukupno</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Komisija</span>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{commissionRate}%</p>
              <p className="text-xs text-muted-foreground">stopa provizije</p>
            </Card>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Kako radi Marketplace</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">1. Veleprodaje</h4>
                  <p className="text-xs text-muted-foreground">Registrujte dobavljače i postavite cenovnike</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">2. Katalog</h4>
                  <p className="text-xs text-muted-foreground">Centralizovani katalog svih proizvoda</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">3. Narudžbe</h4>
                  <p className="text-xs text-muted-foreground">Maloprodaje naručuju od dobavljača</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">4. Komisija</h4>
                  <p className="text-xs text-muted-foreground">Automatska obračun provizije</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent orders */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne fakture (narudžbe)</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nema narudžbi</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4">Broj</th>
                        <th className="pb-2 pr-4">Partner</th>
                        <th className="pb-2 pr-4">Iznos</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((o: any) => (
                        <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 pr-4 font-mono text-xs">{o.number}</td>
                          <td className="py-2 pr-4">{o.partner?.name || '-'}</td>
                          <td className="py-2 pr-4">{formatCurrency(o.totalAmount)}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline" className={`text-[10px] ${
                              o.status === 'placena' ? 'bg-green-100 text-green-700' :
                              o.status === 'poslata' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{o.status}</Badge>
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString('sr-RS')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== VELEPRODAJE TAB ===== */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži dobavljače..." className="pl-9" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : vendors.length === 0 ? (
            <Card className="p-8 text-center">
              <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema dobavljača u marketplace-u</p>
              <p className="text-xs text-muted-foreground mt-1">Dodajte partnere sa tipom &quot;dobavljac&quot; u modulu Partneri</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v: any) => (
                <Card key={v.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{v.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {v.type === 'dobavljac' ? 'Veleprodaja' : 'Partner'}
                        </Badge>
                      </div>
                      {v.isActive && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {v.city && <p className="text-xs text-muted-foreground">{v.city}{v.address ? `, ${v.address}` : ''}</p>}
                    {v.phone && <p className="text-xs">{v.phone}</p>}
                    {v.email && <p className="text-xs text-muted-foreground">{v.email}</p>}
                    {v.creditLimit > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Kreditni limit</span>
                        <span className="font-medium">{formatCurrency(v.creditLimit)}</span>
                      </div>
                    )}
                    <Separator />
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedVendor(v)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Pregled profil
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== KATALOG TAB ===== */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži proizvode (naziv, šifra, barkod)..." className="pl-9" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi proizvodi</SelectItem>
                <SelectItem value="active">Aktivni</SelectItem>
                <SelectItem value="inactive">Neaktivni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : products.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema proizvoda u katalogu</p>
              <Button variant="outline" className="mt-3" onClick={() => setProductDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Dodaj prvi proizvod
              </Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="p-3">Šifra</th>
                      <th className="p-3">Naziv</th>
                      <th className="p-3">Kategorija</th>
                      <th className="p-3 text-right">Nabavna</th>
                      <th className="p-3 text-right">Prodajna</th>
                      <th className="p-3 text-right">Zaliha</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 50).map((p: any) => (
                      <tr key={p.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{p.sku}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-xs">{p.category || '-'}</td>
                        <td className="p-3 text-right text-xs">{formatCurrency(p.purchasePrice)}</td>
                        <td className="p-3 text-right text-xs font-medium">{formatCurrency(p.sellingPrice)}</td>
                        <td className="p-3 text-right text-xs">{p.currentStock}</td>
                        <td className="p-3">
                          {p.isActive ? (
                            <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700">Aktivan</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">Neaktivan</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===== NARUDŽBE TAB ===== */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Marketplace narudžbe</p>
            <p className="text-xs text-muted-foreground mt-1">Kreirajte narudžbenicu iz modula Nabavka ili fakture iz modula Fakture</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" variant="outline" onClick={() => window.location.href = '#'}>
                <FileText className="h-4 w-4 mr-1" /> Kreiraj narudžbu
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ===== PODEŠAVANJA TAB ===== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Komisija</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stopa komisije (%)</Label>
                  <Input type="number" min="0" max="100" step="0.5" value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground">Procenat od prodajne vrednosti koji ide marketplace-u</p>
                </div>
                <div className="space-y-2">
                  <Label>Minimalna komisija (RSD)</Label>
                  <Input type="number" min="0" step="100" value={minCommission}
                    onChange={(e) => setMinCommission(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground">Minimalni iznos po transakciji</p>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Primer:</strong> Proizvod se prodaje za 10.000 RSD. Sa komisijom od {commissionRate}%,
                  marketplace zarađuje <strong>{formatCurrency(10000 * commissionRate / 100)}</strong> po komadu.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Marketplace pravila</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Automatska sinhronizacija cena</p>
                  <p className="text-xs text-muted-foreground">Promene veleprodajnih cena se automatski reflektuju na maloprodajne</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Marža automatski primenjena</p>
                  <p className="text-xs text-muted-foreground">Postavite procentualnu maržu u modulu Maloprodaja → Sync</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">StOCK sinhronizacija</p>
                  <p className="text-xs text-muted-foreground">Zalihe se ažuriraju u realnom vremenu nakon svake narudžbe</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Višestruki cenovnici</p>
                  <p className="text-xs text-muted-foreground">Svaki partner može imati poseban cenovnik (modul Cenovnici)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== NEW PRODUCT DIALOG ===== */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novi proizvod</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Naziv</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Šifra (SKU)</Label>
                <Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} /></div>
              <div className="space-y-2"><Label>Barkod</Label>
                <Input value={productForm.barcode} onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kategorija</Label>
                <Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Nabavna cena (RSD)</Label>
                <Input type="number" value={productForm.purchasePrice} onChange={(e) => setProductForm({ ...productForm, purchasePrice: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Prodajna cena (RSD)</Label>
                <Input type="number" value={productForm.sellingPrice} onChange={(e) => setProductForm({ ...productForm, sellingPrice: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Jedinica mere</Label>
                <Select value={productForm.unit} onValueChange={(v) => setProductForm({ ...productForm, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kom">Komad</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="l">Litar</SelectItem>
                    <SelectItem value="m">Metar</SelectItem>
                    <SelectItem value="pak">Pakovanje</SelectItem>
                  </SelectContent>
                </Select></div>
              <div className="space-y-2"><Label>Min. zaliha</Label>
                <Input type="number" value={productForm.minStock} onChange={(e) => setProductForm({ ...productForm, minStock: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Opis</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreateProduct}>Dodaj proizvod</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VENDOR DETAIL DIALOG ===== */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji dobavljača</DialogTitle></DialogHeader>
          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Naziv:</span></div>
                <div className="font-medium">{selectedVendor.name}</div>
                <div><span className="text-muted-foreground">PIB:</span></div>
                <div>{selectedVendor.pib || '-'}</div>
                <div><span className="text-muted-foreground">Grad:</span></div>
                <div>{selectedVendor.city || '-'}</div>
                <div><span className="text-muted-foreground">Telefon:</span></div>
                <div>{selectedVendor.phone || '-'}</div>
                <div><span className="text-muted-foreground">Email:</span></div>
                <div>{selectedVendor.email || '-'}</div>
                <div><span className="text-muted-foreground">Kreditni limit:</span></div>
                <div>{selectedVendor.creditLimit > 0 ? formatCurrency(selectedVendor.creditLimit) : '-'}</div>
                <div><span className="text-muted-foreground">Termin plaćanja:</span></div>
                <div>{selectedVendor.paymentTerms > 0 ? `${selectedVendor.paymentTerms} dana` : 'Odmah'}</div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setSelectedVendor(null)}>Zatvori</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper icon (Percent not in lucide, using alternative)
function Percent({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" /><circle cx="12" cy="12" r="2" /><path d="M9 9h1" /><path d="M15 15h1" />
    </svg>
  )
}
