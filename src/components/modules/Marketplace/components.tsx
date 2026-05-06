'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import {

interface MarketplaceContentProps {
  activeTab: any
  setActiveTab: React.Dispatch<React.SetStateAction<any>>
  loading: any
  setLoading: React.Dispatch<React.SetStateAction<any>>
  dashData: any
  setDashData: React.Dispatch<React.SetStateAction<any>>
  vendors: any[]
  setVendors: React.Dispatch<React.SetStateAction<any[]>>
  vendorSearch: any
  setVendorSearch: React.Dispatch<React.SetStateAction<any>>
  vendorFilter: any
  setVendorFilter: React.Dispatch<React.SetStateAction<any>>
  orders: any[]
  setOrders: React.Dispatch<React.SetStateAction<any[]>>
  orderSearch: any
  setOrderSearch: React.Dispatch<React.SetStateAction<any>>
  orderFilter: any
  setOrderFilter: React.Dispatch<React.SetStateAction<any>>
  reviews: any[]
  setReviews: React.Dispatch<React.SetStateAction<any[]>>
  disputes: any[]
  setDisputes: React.Dispatch<React.SetStateAction<any[]>>
  products: any[]
  setProducts: React.Dispatch<React.SetStateAction<any[]>>
  categories: string[]
  setCategories: React.Dispatch<React.SetStateAction<string[]>>
  prodSearch: any
  setProdSearch: React.Dispatch<React.SetStateAction<any>>
  prodCategory: any
  setProdCategory: React.Dispatch<React.SetStateAction<any>>
  prodVendor: any
  setProdVendor: React.Dispatch<React.SetStateAction<any>>
  prodFeatured: any
  setProdFeatured: React.Dispatch<React.SetStateAction<any>>
  coupons: any[]
  setCoupons: React.Dispatch<React.SetStateAction<any[]>>
  vendorDialogOpen: any
  setVendorDialogOpen: React.Dispatch<React.SetStateAction<any>>
  orderDialogOpen: any
  setOrderDialogOpen: React.Dispatch<React.SetStateAction<any>>
  reviewDialogOpen: any
  setReviewDialogOpen: React.Dispatch<React.SetStateAction<any>>
  disputeDialogOpen: any
  setDisputeDialogOpen: React.Dispatch<React.SetStateAction<any>>
  vendorDetailOpen: any
  setVendorDetailOpen: React.Dispatch<React.SetStateAction<any>>
  orderDetailOpen: any
  setOrderDetailOpen: React.Dispatch<React.SetStateAction<any>>
  productDialogOpen: any
  setProductDialogOpen: React.Dispatch<React.SetStateAction<any>>
  couponDialogOpen: any
  setCouponDialogOpen: React.Dispatch<React.SetStateAction<any>>
  selectedItem: any
  setSelectedItem: React.Dispatch<React.SetStateAction<any>>
  vendorForm: any
  setVendorForm: React.Dispatch<React.SetStateAction<any>>
  orderForm: any
  setOrderForm: React.Dispatch<React.SetStateAction<any>>
  orderItems: any[]
  setOrderItems: React.Dispatch<React.SetStateAction<any[]>>
  reviewForm: any
  setReviewForm: React.Dispatch<React.SetStateAction<any>>
  disputeForm: any
  setDisputeForm: React.Dispatch<React.SetStateAction<any>>
  productForm: any
  setProductForm: React.Dispatch<React.SetStateAction<any>>
  couponForm: any
  setCouponForm: React.Dispatch<React.SetStateAction<any>>
  toast: any
  setToast: React.Dispatch<React.SetStateAction<any>>
  emptyVendor: any
  emptyOrder: any
  emptyReview: any
  emptyDispute: any
  emptyProduct: any
  emptyCoupon: any
}

export function MarketplaceContent({
  activeTab, setActiveTab, loading, setLoading, dashData, setDashData, vendors, setVendors, vendorSearch, setVendorSearch, vendorFilter, setVendorFilter, orders, setOrders, orderSearch, setOrderSearch, orderFilter, setOrderFilter, reviews, setReviews, disputes, setDisputes, products, setProducts, categories, setCategories, prodSearch, setProdSearch, prodCategory, setProdCategory, prodVendor, setProdVendor, prodFeatured, setProdFeatured, coupons, setCoupons, vendorDialogOpen, setVendorDialogOpen, orderDialogOpen, setOrderDialogOpen, reviewDialogOpen, setReviewDialogOpen, disputeDialogOpen, setDisputeDialogOpen, vendorDetailOpen, setVendorDetailOpen, orderDetailOpen, setOrderDetailOpen, productDialogOpen, setProductDialogOpen, couponDialogOpen, setCouponDialogOpen, selectedItem, setSelectedItem, vendorForm, setVendorForm, orderForm, setOrderForm, orderItems, setOrderItems, reviewForm, setReviewForm, disputeForm, setDisputeForm, productForm, setProductForm, couponForm, setCouponForm, toast, setToast, emptyVendor, emptyOrder, emptyReview, emptyDispute, emptyProduct, emptyCoupon
}: MarketplaceContentProps) {
const loadDashboard = useCallback(async () => {
  if (!activeCompanyId) return
  try {
    const res = await fetch(`/api/marketplace/dashboard?companyId=${activeCompanyId}`)
    if (res.ok) setDashData(await res.json())
  } catch { /* silent */ }
}, [activeCompanyId])

const loadVendors = useCallback(async () => {
  if (!activeCompanyId) return
  setLoading(true)
  try {
    const params = new URLSearchParams({ companyId: activeCompanyId })
    if (vendorSearch) params.set('search', vendorSearch)
    if (vendorFilter !== 'all') params.set('status', vendorFilter)
    const res = await fetch(`/api/marketplace/vendors?${params}`)
    if (res.ok) setVendors(await res.json())
  } catch { /* silent */ }
  setLoading(false)
}, [activeCompanyId, vendorSearch, vendorFilter])

const loadOrders = useCallback(async () => {
  if (!activeCompanyId) return
  setLoading(true)
  try {
    const params = new URLSearchParams({ companyId: activeCompanyId })
    if (orderSearch) params.set('search', orderSearch)
    if (orderFilter !== 'all') params.set('status', orderFilter)
    const res = await fetch(`/api/marketplace/orders?${params}`)
    if (res.ok) setOrders(await res.json())
  } catch { /* silent */ }
  setLoading(false)
}, [activeCompanyId, orderSearch, orderFilter])

const loadReviews = useCallback(async () => {
  if (!activeCompanyId) return
  try {
    const res = await fetch(`/api/marketplace/reviews?companyId=${activeCompanyId}`)
    if (res.ok) setReviews(await res.json())
  } catch { /* silent */ }
}, [activeCompanyId])

const loadDisputes = useCallback(async () => {
  if (!activeCompanyId) return
  try {
    const res = await fetch(`/api/marketplace/disputes?companyId=${activeCompanyId}`)
    if (res.ok) setDisputes(await res.json())
  } catch { /* silent */ }
}, [activeCompanyId])

// NEW: Load products
const loadProducts = useCallback(async () => {
  if (!activeCompanyId) return
  setLoading(true)
  try {
    const params = new URLSearchParams({ companyId: activeCompanyId })
    if (prodSearch) params.set('search', prodSearch)
    if (prodCategory !== 'all') params.set('category', prodCategory)
    if (prodVendor !== 'all') params.set('vendorId', prodVendor)
    if (prodFeatured) params.set('featured', 'true')
    const res = await fetch(`/api/marketplace/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products || [])
      setCategories(data.categories || [])
    }
  } catch { /* silent */ }
  setLoading(false)
}, [activeCompanyId, prodSearch, prodCategory, prodVendor, prodFeatured])

// NEW: Load coupons
const loadCoupons = useCallback(async () => {
  if (!activeCompanyId) return
  try {
    const res = await fetch(`/api/marketplace/coupons?companyId=${activeCompanyId}`)
    if (res.ok) setCoupons(await res.json())
  } catch { /* silent */ }
}, [activeCompanyId])

useEffect(() => { loadDashboard() }, [loadDashboard])
useEffect(() => { if (activeTab === 'vendors') loadVendors() }, [activeTab, loadVendors])
useEffect(() => { if (activeTab === 'orders') loadOrders() }, [activeTab, loadOrders])
useEffect(() => { if (activeTab === 'reviews') loadReviews() }, [activeTab, loadReviews])
useEffect(() => { if (activeTab === 'disputes') loadDisputes() }, [activeTab, loadDisputes])
useEffect(() => { if (activeTab === 'catalog') loadProducts() }, [activeTab, loadProducts])
useEffect(() => { if (activeTab === 'coupons') loadCoupons() }, [activeTab, loadCoupons])
useEffect(() => { if (activeTab === 'overview') { loadDashboard(); loadOrders(); loadDisputes() } }, [activeTab, loadDashboard, loadOrders, loadDisputes])

// ============ ACTIONS ============

const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

const handleCreateVendor = async () => {
  if (!activeCompanyId) return
  try {
    const res = await fetch('/api/marketplace/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: activeCompanyId, ...vendorForm, categories: vendorForm.categories.split(',').map(c => c.trim()).filter(Boolean) }),
    })
    if (res.ok) { setVendorDialogOpen(false); setVendorForm(emptyVendor); loadVendors(); loadDashboard(); showToast('Veleprodaja kreirana') }
  } catch { showToast('Greška pri kreiranju') }
}

const handleVendorAction = async (id: string, status: string) => {
  try {
    await fetch(`/api/marketplace/vendors/${id}?companyId=${activeCompanyId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    loadVendors(); loadDashboard(); showToast(`Status promenjen: ${statusLabel(status)}`)
  } catch { showToast('Greška') }
}

const handleDeleteVendor = async (id: string) => {
  if (!confirm('Obrisati veleprodaju?')) return
  try { await fetch(`/api/marketplace/vendors/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' }); loadVendors(); loadDashboard(); showToast('Veleprodaja obrisana') }
  catch { showToast('Greška') }
}

const addOrderItem = () => setOrderItems([...orderItems, { productId: '', productName: '', sku: '', quantity: 1, unitPrice: 0 }])
const removeOrderItem = (idx: number) => setOrderItems(orderItems.filter((_, i) => i !== idx))
const updateOrderItem = (idx: number, field: string, value: any) => {
  const updated = [...orderItems]
  updated[idx] = { ...updated[idx], [field]: value }
  if (field === 'quantity' || field === 'unitPrice') updated[idx].total = updated[idx].quantity * updated[idx].unitPrice
  setOrderItems(updated)
}

const handleCreateOrder = async () => {
  if (!activeCompanyId || !orderForm.vendorId || orderItems.length === 0) { showToast('Popunite sva polja'); return }
  try {
    const res = await fetch('/api/marketplace/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: activeCompanyId, ...orderForm, items: orderItems }),
    })
    if (res.ok) { setOrderDialogOpen(false); setOrderForm(emptyOrder); setOrderItems([]); loadOrders(); loadDashboard(); showToast('Narudžba kreirana') }
  } catch { showToast('Greška') }
}

const handleOrderStatus = async (id: string, status: string) => {
  try {
    await fetch(`/api/marketplace/orders/${id}?companyId=${activeCompanyId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    loadOrders(); loadDashboard(); showToast(`Status: ${statusLabel(status)}`)
  } catch { showToast('Greška') }
}

const handleCreateReview = async () => {
  if (!activeCompanyId || !reviewForm.vendorId || !reviewForm.authorName) { showToast('Popunite polja'); return }
  try {
    const res = await fetch('/api/marketplace/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: activeCompanyId, ...reviewForm }),
    })
    if (res.ok) { setReviewDialogOpen(false); setReviewForm(emptyReview); loadReviews(); showToast('Recenzija dodata') }
  } catch { showToast('Greška') }
}

const handleCreateDispute = async () => {
  if (!activeCompanyId || !disputeForm.vendorId || !disputeForm.orderId) { showToast('Popunite polja'); return }
  try {
    const res = await fetch('/api/marketplace/disputes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: activeCompanyId, ...disputeForm }),
    })
    if (res.ok) { setDisputeDialogOpen(false); setDisputeForm(emptyDispute); loadDisputes(); showToast('Spor kreiran') }
  } catch { showToast('Greška') }
}

const handleResolveDispute = async (id: string, resolution: string) => {
  try {
    await fetch(`/api/marketplace/disputes/${id}?companyId=${activeCompanyId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rešeno', resolution }),
    })
    loadDisputes(); showToast('Spor rešen')
  } catch { showToast('Greška') }
}

// NEW: Product actions
const handleCreateProduct = async () => {
  if (!activeCompanyId || !productForm.name || !productForm.vendorId) { showToast('Popunite naziv i veleprodaju'); return }
  try {
    const res = await fetch('/api/marketplace/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-company-id': activeCompanyId },
      body: JSON.stringify(productForm),
    })
    if (res.ok) { setProductDialogOpen(false); setProductForm(emptyProduct); loadProducts(); showToast('Proizvod dodat') }
  } catch { showToast('Greška') }
}

const handleToggleProductFeatured = async (id: string, isFeatured: boolean) => {
  try {
    await fetch(`/api/marketplace/products/${id}?companyId=${activeCompanyId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeatured: !isFeatured }),
    })
    loadProducts(); showToast(!isFeatured ? 'Istaknuto' : 'Uklonjeno iz istaknutih')
  } catch { showToast('Greška') }
}

const handleDeleteProduct = async (id: string) => {
  if (!confirm('Obrisati proizvod?')) return
  try { await fetch(`/api/marketplace/products/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' }); loadProducts(); showToast('Proizvod obrisan') }
  catch { showToast('Greška') }
}

// NEW: Coupon actions
const handleCreateCoupon = async () => {
  if (!activeCompanyId || !couponForm.code) { showToast('Unesite kupon kod'); return }
  try {
    const res = await fetch('/api/marketplace/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-company-id': activeCompanyId },
      body: JSON.stringify(couponForm),
    })
    if (res.ok) { setCouponDialogOpen(false); setCouponForm(emptyCoupon); loadCoupons(); showToast('Kupon kreiran') }
  } catch { showToast('Greška') }
}

// ============ KPI CARD ============

const Kpi = ({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
)

// ============ RATING DISTRIBUTION ============

const RatingDistribution = ({ reviews }: { reviews: any[] }) => {
  reviews.forEach((r: any) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
  const max = Math.max(...dist, 1)
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => (
        <div key={star} className="flex items-center gap-3">
          <span className="text-xs w-6 text-right">{star}</span>
          <div className="flex-1 bg-muted rounded-full h-2.5">
            <div className="bg-yellow-400 h-2.5 rounded-full transition-all" style={{ width: `${Math.round((dist[star - 1] / max) * 100)}%` }} />
          </div>
          <span className="text-xs font-mono w-6">{dist[star - 1]}</span>
        </div>
      ))}
    </div>
  )
}

// ============ RENDER ============

return (
  <div className="space-y-6">
    {/* Toast */}
    {toast && (
      <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toast}</AlertDescription></Alert>
      </div>
    )}

    {/* Header */}
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-sm text-muted-foreground">Platforma za povezivanje veleprodaja i maloprodaja</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadVendors(); loadOrders(); loadDisputes(); loadProducts(); loadCoupons(); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Osveži
        </Button>
        <Button size="sm" onClick={() => setVendorDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Veleprodaja
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOrderDialogOpen(true)}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Narudžba
        </Button>
        <Button size="sm" variant="outline" onClick={() => setProductDialogOpen(true)}>
          <Package className="h-4 w-4 mr-1" /> Proizvod
        </Button>
      </div>
    </div>

    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
        <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
        <TabsTrigger value="catalog"><PackageSearch className="h-4 w-4 mr-1 hidden sm:inline" /> Katalog</TabsTrigger>
        <TabsTrigger value="vendors"><Store className="h-4 w-4 mr-1 hidden sm:inline" /> Veleprodaje</TabsTrigger>
        <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1 hidden sm:inline" /> Narudžbe</TabsTrigger>
        <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-1 hidden sm:inline" /> Recenzije</TabsTrigger>
        <TabsTrigger value="disputes"><AlertTriangle className="h-4 w-4 mr-1 hidden sm:inline" /> Sporovi</TabsTrigger>
        <TabsTrigger value="coupons"><Gift className="h-4 w-4 mr-1 hidden sm:inline" /> Kuponi</TabsTrigger>
        <TabsTrigger value="reports"><PieChart className="h-4 w-4 mr-1 hidden sm:inline" /> Izveštaji</TabsTrigger>
      </TabsList>

      {/* ===== PREGLED ===== */}
      <TabsContent value="overview" className="space-y-6">
        {!dashData ? (
          <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Kpi label="Aktivne veleprodaje" value={dashData.vendors.active} icon={Store} sub={`${dashData.vendors.pending} na čekanju`} color="text-green-500" />
              <Kpi label="Ukupno narudžbi" value={dashData.orders.total} icon={ShoppingCart} sub={`${dashData.orders.poslata || 0} u isporuci`} color="text-blue-500" />
              <Kpi label="Ukupna prodaja" value={formatCurrency(dashData.revenue.total)} icon={DollarSign} sub={`Komisija: ${formatCurrency(dashData.revenue.commission)}`} color="text-emerald-500" />
              <Kpi label="Prosečna ocena" value={dashData.reviews.avgRating || 'N/A'} icon={Award} sub={`${dashData.reviews.total} recenzija`} color="text-yellow-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Kpi label="Prosečna narudžba" value={formatCurrency(dashData.revenue.avgOrder)} icon={TrendingUp} />
              <Kpi label="Otvoreni sporovi" value={dashData.disputes.open} icon={AlertTriangle} color="text-red-500" />
              <Kpi label="Stornirano" value={dashData.orders.stornirana || 0} icon={Ban} color="text-gray-500" />
              <Kpi label="Isporučeno" value={dashData.orders.isporučena || 0} icon={CheckCircle2} color="text-green-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Top 5 Veleprodaja po prodaji</CardTitle></CardHeader>
                <CardContent>
                  {dashData.topVendors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p>
                  ) : (
                    <div className="space-y-3">
                      {dashData.topVendors.map((v: any, i: number) => (
                        <div key={v.id} className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => { setSelectedItem(v); setVendorDetailOpen(true) }}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium">{v.name}</p>
                              <p className="text-xs text-muted-foreground">{v.totalOrders} narudžbi · {v.rating > 0 ? <><Star className="h-3 w-3 inline fill-yellow-400 text-yellow-400" /> {v.rating}</> : 'Nema ocena'}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">{formatCurrency(v.totalSales)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Narudžbe po statusu</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashData.orders).filter(([k]) => k !== 'total').map(([key, val]) => {
                      const max = Math.max(...Object.entries(dashData.orders).filter(([k]) => k !== 'total').map(([, v]) => v as number), 1)
                      const pct = Math.round(((val as number) / max) * 100)
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs w-24 text-muted-foreground">{statusLabel(key as string)}</span>
                          <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                          <span className="text-xs font-mono w-6 text-right">{val as number}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Nedavne narudžbe</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>Prikaži sve <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {dashData.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nema narudžbi</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4">Broj</th><th className="pb-2 pr-4">Maloprodaja</th><th className="pb-2 pr-4">Iznos</th><th className="pb-2">Status</th>
                      </tr></thead>
                      <tbody>
                        {dashData.recentOrders.map((o: any) => (
                          <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedItem(o); setOrderDetailOpen(true) }}>
                            <td className="py-2 pr-4 font-mono text-xs">{o.number}</td>
                            <td className="py-2 pr-4">{o.retailerName}</td>
                            <td className="py-2 pr-4 font-medium">{formatCurrency(o.totalAmount)}</td>
                            <td className="py-2"><Badge variant="outline" className={`text-[10px] ${statusColor(o.status)}`}>{statusLabel(o.status)}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {Object.keys(dashData.revenueByMonth || {}).length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Prihodi po mesecima</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(dashData.revenueByMonth).sort().slice(-6).map(([month, val]) => {
                      const max = Math.max(...Object.values(dashData.revenueByMonth) as number[], 1)
                      return (
                        <div key={month} className="flex items-center gap-3">
                          <span className="text-xs w-16 text-muted-foreground">{month}</span>
                          <div className="flex-1 bg-muted rounded-full h-4"><div className="bg-emerald-500 h-4 rounded-full transition-all" style={{ width: `${Math.round(((val as number) / max) * 100)}%` }} /></div>
                          <span className="text-xs font-mono w-28 text-right">{formatCurrency(val as number)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>

      {/* ===== KATALOG (NEW) ===== */}
      <TabsContent value="catalog" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži proizvode..." className="pl-9" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
          </div>
          <Select value={prodCategory} onValueChange={setProdCategory}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve kategorije</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={prodVendor} onValueChange={setProdVendor}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Veleprodaja" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve veleprodaje</SelectItem>
              {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.slug}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={prodFeatured ? 'default' : 'outline'} size="sm" onClick={() => setProdFeatured(!prodFeatured)}>
            <Zap className="h-4 w-4 mr-1" /> {prodFeatured ? 'Istaknuti' : 'Istaknuti'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <PackageSearch className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Nema proizvoda u katalogu</p>
            <Button className="mt-3" onClick={() => setProductDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Dodaj proizvod</Button>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{products.length} proizvoda{prodFeatured ? ' (samo istaknuti)' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <Card key={p.id} className="relative group">
                  {p.isFeatured && <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[9px]"><Zap className="h-2.5 w-2.5 mr-0.5" /> ISTAKNUTO</Badge>}
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {p.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">{p.vendor?.slug}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description || 'Nema opisa'}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {p.compareAtPrice > p.price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">{formatCurrency(p.price)}</span>
                            <span className="text-xs text-muted-foreground line-through">{formatCurrency(p.compareAtPrice)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold">{formatCurrency(p.price)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {p.avgRating > 0 && <><Stars rating={Math.round(p.avgRating)} size="xs" /><span className="text-[10px] text-muted-foreground">({p.reviewCount})</span></>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                      <span><Package className="h-3 w-3 inline mr-0.5" />Zaliha: {p.stock} kom</span>
                      {p.category && <Badge variant="secondary" className="text-[10px] ml-2">{p.category}</Badge>}
                    </div>
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggleProductFeatured(p.id, p.isFeatured)}>
                        <Zap className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </TabsContent>

      {/* ===== VELEPRODAJE ===== */}
      <TabsContent value="vendors" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži veleprodaje..." className="pl-9" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
          </div>
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve</SelectItem>
              <SelectItem value="pending">Na čekanju</SelectItem>
              <SelectItem value="active">Aktivne</SelectItem>
              <SelectItem value="suspended">Suspendovane</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : vendors.length === 0 ? (
          <Card className="p-8 text-center">
            <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Nema veleprodaja</p>
            <Button className="mt-3" onClick={() => setVendorDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Dodaj prvu veleprodaju</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v: any) => (
              <Card key={v.id} className="relative cursor-pointer" onClick={() => { setSelectedItem(v); setVendorDetailOpen(true) }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{v.slug}</CardTitle>
                      <Badge variant="outline" className={`mt-1 text-[10px] ${statusColor(v.status)}`}>{statusLabel(v.status)}</Badge>
                    </div>
                    {v.shippingFree && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600"><Truck className="h-3 w-3 inline mr-0.5" /> Besplatna dostava</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {v.description && <p className="text-xs text-muted-foreground line-clamp-2">{v.description}</p>}
                  {v.deliveryTime && <p className="text-xs"><Truck className="h-3 w-3 inline mr-1" />Dostava: {v.deliveryTime}</p>}
                  {v.avgRating > 0 && <div className="flex items-center gap-1"><Stars rating={Math.round(v.avgRating)} /><span className="text-xs text-muted-foreground">({v.reviewCount})</span></div>}
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Komisija:</span> <span className="font-medium">{v.commissionRate}%</span></div>
                    <div><span className="text-muted-foreground">Min. narudžba:</span> <span className="font-medium">{formatCurrency(v.minOrderAmount)}</span></div>
                    <div><span className="text-muted-foreground">Narudžbe:</span> <span className="font-medium">{v.orderCount}</span></div>
                    <div><span className="text-muted-foreground">Prodaja:</span> <span className="font-medium">{formatCurrency(v.totalSales)}</span></div>
                  </div>
                  <Separator />
                  <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    {v.status === 'pending' && <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleVendorAction(v.id, 'active') }}><Check className="h-3.5 w-3.5 mr-1" /> Odobri</Button>}
                    {v.status === 'active' && <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); handleVendorAction(v.id, 'suspended') }}><Ban className="h-3.5 w-3.5 mr-1" /> Suspenduj</Button>}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteVendor(v.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ===== NARUDŽBE ===== */}
      <TabsContent value="orders" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži narudžbe..." className="pl-9" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
          </div>
          <Select value={orderFilter} onValueChange={setOrderFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve</SelectItem>
              <SelectItem value="nacrt">Nacrt</SelectItem>
              <SelectItem value="potvrđena">Potvrđene</SelectItem>
              <SelectItem value="poslata">Poslate</SelectItem>
              <SelectItem value="isporučena">Isporučene</SelectItem>
              <SelectItem value="stornirana">Stornirane</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Nema narudžbi</p>
            <Button className="mt-3" variant="outline" onClick={() => setOrderDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj narudžbu</Button>
          </Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Broj</th><th className="p-3">Maloprodaja</th><th className="p-3">Veleprodaja</th>
                    <th className="p-3 text-right">Iznos</th><th className="p-3 text-right">Komisija</th><th className="p-3">Status</th><th className="p-3">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedItem(o); setOrderDetailOpen(true) }}>
                      <td className="p-3 font-mono text-xs">{o.number}</td>
                      <td className="p-3">{o.retailerName}</td>
                      <td className="p-3 text-xs">{o.vendorName}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(o.totalAmount)}</td>
                      <td className="p-3 text-right text-xs text-muted-foreground">{formatCurrency(o.commissionAmount)}</td>
                      <td className="p-3"><Badge variant="outline" className={`text-[10px] ${statusColor(o.status)}`}>{statusLabel(o.status)}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('sr-RS')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </TabsContent>

      {/* ===== RECENZIJE ===== */}
      <TabsContent value="reviews" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno recenzija</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold">{reviews.length}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold">{reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
                    <Stars rating={reviews.length > 0 ? Math.round(reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) : 0} />
                  </div>
                </div>
                <RatingDistribution reviews={reviews} />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{reviews.length} recenzija</p>
              <Button size="sm" onClick={() => setReviewDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova recenzija</Button>
            </div>
            <ScrollArea className="h-[400px]">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center"><Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema recenzija</p></Card>
              ) : (
                <div className="space-y-3 pr-4">
                  {reviews.map((r: any) => (
                    <Card key={r.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{(r.authorName || '?')[0].toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-medium">{r.authorName}</p>
                            <Stars rating={r.rating} />
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('sr-RS')}</span>
                      </div>
                      {r.title && <p className="text-sm font-medium mb-1">{r.title}</p>}
                      {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                      {r.productName && <p className="text-xs text-muted-foreground mt-1">Proizvod: {r.productName}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </TabsContent>

      {/* ===== SPOROVI ===== */}
      <TabsContent value="disputes" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{disputes.length} sporova</p>
          <Button size="sm" variant="outline" onClick={() => setDisputeDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi spor</Button>
        </div>
        {disputes.length === 0 ? (
          <Card className="p-8 text-center"><AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema otvorenih sporova</p></Card>
        ) : (
          <div className="space-y-3">
            {disputes.map((d: any) => (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] ${statusColor(d.status)}`}>{statusLabel(d.status)}</Badge>
                      <Badge variant="outline" className="text-[10px]">{disputeTypeLabel(d.type)}</Badge>
                      <Badge variant="outline" className="text-[10px]">{priorityLabel(d.priority)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Narudžba: {d.orderNumber} · Maloprodaja: {d.orderRetailer}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(d.createdAt).toLocaleDateString('sr-RS')}</span>
                </div>
                {d.description && <p className="text-sm mb-2">{d.description}</p>}
                {d.resolution && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">Rešenje: {d.resolution}</p>}
                {d.status === 'otvoren' && (
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Rešenje..." className="flex-1 h-8 text-xs" id={`resolution-${d.id}`} />
                    <Button size="sm" onClick={() => {
                      const input = document.getElementById(`resolution-${d.id}`) as HTMLInputElement
                      if (input?.value) handleResolveDispute(d.id, input.value)
                    }}>Reši</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ===== KUPONI (NEW) ===== */}
      <TabsContent value="coupons" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{coupons.length} aktivnih kupona</p>
          <Button size="sm" onClick={() => setCouponDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi kupon</Button>
        </div>
        {coupons.length === 0 ? (
          <Card className="p-8 text-center">
            <Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Nema aktivnih kupona</p>
          </Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Kod</th><th className="p-3">Opis</th><th className="p-3">Tip</th>
                    <th className="p-3">Vrednost</th><th className="p-3">Korišćeno</th><th className="p-3">Važi do</th><th className="p-3">Veleprodaja</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c: any) => {
                    const expiresSoon = c.validTo && new Date(c.validTo) < new Date(Date.now() + 3 * 86400000)
                    return (
                      <tr key={c.id} className={`border-t hover:bg-muted/30 ${expiresSoon ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                        <td className="p-3"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{c.code}</code></td>
                        <td className="p-3 text-xs">{c.description || '-'}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{c.discountType === 'procenat' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}</Badge></td>
                        <td className="p-3 text-xs">{c.minOrderAmount > 0 ? `min. ${formatCurrency(c.minOrderAmount)}` : '-'}</td>
                        <td className="p-3 text-xs">{c.usedCount}{c.maxUses > 0 ? `/${c.maxUses}` : ''}</td>
                        <td className="p-3 text-xs">{c.validTo ? new Date(c.validTo).toLocaleDateString('sr-RS') : 'Bez roka'}</td>
                        <td className="p-3 text-xs">{c.vendor?.slug || 'Globalno'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </TabsContent>

      {/* ===== IZVEŠTAJI (NEW) ===== */}
      <TabsContent value="reports" className="space-y-6">
        {!dashData ? (
          <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <CardTitle className="text-xs text-muted-foreground mb-2">Ukupna zarada</CardTitle>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(dashData.revenue.total)}</p>
                <p className="text-xs text-muted-foreground">Komisija: {formatCurrency(dashData.revenue.commission)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-xs text-muted-foreground mb-2">Neto zarada (naknada komisije)</CardTitle>
                <p className="text-2xl font-bold">{formatCurrency(dashData.revenue.total - dashData.revenue.commission)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-xs text-muted-foreground mb-2">Prosečna narudžba</CardTitle>
                <p className="text-2xl font-bold">{formatCurrency(dashData.revenue.avgOrder)}</p>
              </Card>
              <Card className="p-4">
                <CardTitle className="text-xs text-muted-foreground mb-2">Konverzija narudžbi</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={dashData.orders.total > 0 ? Math.round(((dashData.orders.isporučena || 0) / dashData.orders.total) * 100) : 0} className="h-2" />
                  <span className="text-sm font-medium">{dashData.orders.total > 0 ? Math.round(((dashData.orders.isporučena || 0) / dashData.orders.total) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{dashData.orders.isporučena || 0} od {dashData.orders.total} isporučeno</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Komisija po veleprodajama</CardTitle></CardHeader>
                <CardContent>
                  {dashData.topVendors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p>
                  ) : (
                    <div className="space-y-4">
                      {dashData.topVendors.map((v: any, i: number) => {
                        const estimatedComm = v.totalSales * (v.commissionRate || 5) / 100
                        const maxComm = Math.max(...dashData.topVendors.map((v2: any) => v2.totalSales * (v2.commissionRate || 5) / 100), 1)
                        const barPct = v.totalSales > 0 ? Math.min((estimatedComm / maxComm) * 100, 100) : 0
                        return (
                          <div key={v.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                                <span className="text-sm font-medium">{v.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(estimatedComm)}</p>
                                <p className="text-[10px] text-muted-foreground">od {formatCurrency(v.totalSales)}</p>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${barPct}%` }} /></div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Status narudžbi</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(dashData.orders).filter(([k]) => k !== 'total').map(([key, val]) => {
                    const max = Math.max(...Object.entries(dashData.orders).filter(([k]) => k !== 'total').map(([, v]) => v as number), 1)
                    const pct = Math.round(((val as number) / max) * 100)
                    const colors: Record<string, string> = {
                      nacrt: 'bg-yellow-500', potvrđena: 'bg-blue-500', poslata: 'bg-indigo-500',
                      isporučena: 'bg-green-500', stornirana: 'bg-red-500', u_isporuci: 'bg-cyan-500',
                      završena: 'bg-emerald-600',
                    }
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs w-24 text-muted-foreground">{statusLabel(key as string)}</span>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className={`h-3 rounded-full transition-all ${colors[key as string] || 'bg-primary'}`} style={{ width: `${pct}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{val as number}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {Object.keys(dashData.revenueByMonth || {}).length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečni trend prihoda</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(dashData.revenueByMonth).sort().slice(-6).map(([month, val]) => {
                      const max = Math.max(...Object.values(dashData.revenueByMonth) as number[], 1)
                      return (
                        <div key={month} className="flex items-center gap-3">
                          <span className="text-xs w-16 text-muted-foreground">{month}</span>
                          <div className="flex-1 bg-muted rounded-full h-4"><div className="bg-emerald-500 h-4 rounded-full transition-all" style={{ width: `${Math.round(((val as number) / max) * 100)}%` }} /></div>
                          <span className="text-xs font-mono w-28 text-right">{formatCurrency(val as number)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>

    {/* ===== NEW VENDOR DIALOG ===== */}
    <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nova Veleprodaja</DialogTitle><DialogDescription>Registrujte novog dobavljača na marketplace</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Partner ID</Label><Input value={vendorForm.partnerId} onChange={(e) => setVendorForm({ ...vendorForm, partnerId: e.target.value })} placeholder="ID partnera iz modula Partneri" /></div>
          <div className="space-y-2"><Label>Opis</Label><Textarea value={vendorForm.description} onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Vreme isporuke</Label><Input value={vendorForm.deliveryTime} onChange={(e) => setVendorForm({ ...vendorForm, deliveryTime: e.target.value })} placeholder="npr. 2-3 dana" /></div>
            <div className="space-y-2"><Label>Min. narudžba (RSD)</Label><Input type="number" value={vendorForm.minOrderAmount} onChange={(e) => setVendorForm({ ...vendorForm, minOrderAmount: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Komisija (%)</Label><Input type="number" value={vendorForm.commissionRate} onChange={(e) => setVendorForm({ ...vendorForm, commissionRate: parseFloat(e.target.value) || 0 })} min={0} max={50} /></div>
            <div className="space-y-2"><Label>Kategorije (zarez.)</Label><Input value={vendorForm.categories} onChange={(e) => setVendorForm({ ...vendorForm, categories: e.target.value })} placeholder="Npr. hrana, piće, alkohol" /></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="space-y-2"><Label>Način plaćanje</Label>
              <Select value={vendorForm.paymentTerms} onValueChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="odmah">Odmah</SelectItem>
                  <SelectItem value="7dana">7 dana</SelectItem>
                  <SelectItem value="15dana">15 dana</SelectItem>
                  <SelectItem value="30dana">30 dana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={vendorForm.shippingFree} onCheckedChange={(checked) => setVendorForm({ ...vendorForm, shippingFree: checked })} />
              <Label className="text-sm">Besplatna dostava</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVendorDialogOpen(false); setVendorForm(emptyVendor) }}>Otkaži</Button>
            <Button onClick={handleCreateVendor}>Kreiraj</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* ===== NEW ORDER DIALOG ===== */}
    <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Nova Narudžba</DialogTitle><DialogDescription>Kreirajte novu narudžbu na marketplace</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Veleprodaja *</Label>
            <Select value={orderForm.vendorId} onValueChange={(e) => setOrderForm({ ...orderForm, vendorId: e.target.value })}>
              <SelectTrigger><SelectValue placeholder="Izaberite veleprodaju" /></SelectTrigger>
              <SelectContent>
                {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.slug}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ime maloprodaje *</Label><Input value={orderForm.retailerName} onChange={(e) => setOrderForm({ ...orderForm, retailerName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={orderForm.retailerEmail} onChange={(e) => setOrderForm({ ...orderForm, retailerEmail: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Telefon</Label><Input value={orderForm.retailerPhone} onChange={(e) => setOrderForm({ ...orderForm, retailerPhone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Grad</Label><Input value={orderForm.retailerCity} onChange={(e) => setOrderForm({ ...orderForm, retailerCity: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Adresa</Label><Input value={orderForm.retailerAddress} onChange={(e) => setOrderForm({ ...orderForm, retailerAddress: e.target.value })} /></div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Stavke narudžbe</Label>
            <Button size="sm" variant="outline" onClick={addOrderItem}><Plus className="h-4 w-4 mr-1" /> Dodaj stavku</Button>
          </div>
          {orderItems.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end p-2 rounded-lg border bg-muted/30">
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <Input placeholder="Naziv proizvoda" value={item.productName} onChange={(e) => updateOrderItem(idx, 'productName', e.target.value)} className="text-xs" />
                    <Input placeholder="SKU" value={item.sku} onChange={(e) => updateOrderItem(idx, 'sku', e.target.value)} className="text-xs" />
                    <Input type="number" placeholder="Kol" value={item.quantity} onChange={(e) => updateOrderItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="text-xs" min="1" />
                    <Input type="number" placeholder="Cena" value={item.unitPrice} onChange={(e) => updateOrderItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="text-xs" />
                  </div>
                  <span className="text-xs font-medium w-20 text-right">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeOrderItem(idx)}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Ukupno: {formatCurrency(orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span>
              </div>
            </div>
          )}
          <div className="space-y-2"><Label>Napomene</Label><Textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows={2} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOrderDialogOpen(false); setOrderForm(emptyOrder); setOrderItems([]) }}>Otkaži</Button>
            <Button onClick={handleCreateOrder} disabled={!orderForm.vendorId || orderItems.length === 0}>Kreiraj narudžbu</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* ===== NEW PRODUCT DIALOG ===== */}
    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Novi Proizvod</DialogTitle><DialogDescription>Dodajte proizvod u katalog marketplace</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Naziv *</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Veleprodaja *</Label>
              <Select value={productForm.vendorId} onValueChange={(e) => setProductForm({ ...productForm, vendorId: e.target.value })}>
                <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                <SelectContent>{vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.slug}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>SKU</Label><Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Kategorija</Label>
            <Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="npr. Elektronika" />
          </div>
          <div className="space-y-2"><Label>Opis</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Cena (RSD)</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Poređenja za</Label><Input type="number" value={productForm.compareAtPrice} onChange={(e) => setProductForm({ ...productForm, compareAtPrice: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Nabavna cena</Label><Input type="number" value={productForm.costPrice} onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Zaliha</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Min. količina</Label><Input type="number" value={productForm.minOrderQty} onChange={(e) => setProductForm({ ...productForm, minOrderQty: parseInt(e.target.value) || 1 })} /></div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={productForm.isFeatured} onCheckedChange={(checked) => setProductForm({ ...productForm, isFeatured: checked })} />
            <Label className="text-sm">Istaknuti proizvod</Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setProductDialogOpen(false); setProductForm(emptyProduct) }}>Otkaži</Button>
            <Button onClick={handleCreateProduct}>Dodaj proizvod</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* ===== NEW COUPON DIALOG ===== */}
    <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Novi Kupon</DialogTitle><DialogDescription>Kreirajte promo kod za popust na marketplace</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Kupon kod *</Label><Input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="POPUST20" /></div>
            <div className="space-y-2"><Label>Tip popusta</Label>
              <Select value={couponForm.discountType} onValueChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="procenat">Procenat (%)</SelectItem>
                  <SelectItem value="fiksno">Fiksni iznos (RSD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Vrednost popusta</Label><Input type="number" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Min. narudžba (RSD)</Label><Input type="number" value={couponForm.minOrderAmount} onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <div className="space-y-2"><Label>Max korišćaja</Label><Input type="number" value={couponForm.maxUses} onChange={(e) => setCouponForm({ ...couponForm, maxUses: parseInt(e.target.value) || 0 })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Važi od</Label><Input type="date" value={couponForm.validFrom} onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })} /></div>
            <div className="space-y-2"><Label>Važi do</Label><Input type="date" value={couponForm.validTo} onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Veleprodaja</Label>
              <Select value={couponForm.vendorId} onValueChange={(e) => setCouponForm({ ...couponForm, vendorId: e.target.value })}>
                <SelectTrigger><SelectValue placeholder="Globalni" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Globalni (sve veleprodaje)</SelectItem>
                  {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.slug}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Kategorija</Label>
              <Input value={couponForm.category} onChange={(e) => setCouponForm({ ...couponForm, category: e.target.value })} placeholder="Sve kategorije" />
            </div>
          </div>
          <div className="space-y-2"><Label>Opis</Label><Textarea value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} rows={2} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCouponDialogOpen(false); setCouponForm(emptyCoupon) }}>Otkaži</Button>
            <Button onClick={handleCreateCoupon}>Kreiraj kupon</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* ===== VENDOR DETAIL DIALOG (NEW) ===== */}
    <Dialog open={vendorDetailOpen} onOpenChange={setVendorDetailOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {selectedItem && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{selectedItem.slug?.[0]?.toUpperCase()}</div>
                <div>
                  <DialogTitle>{selectedItem.slug}</DialogTitle>
                  <DialogDescription>Status: <Badge variant="outline" className={`ml-2 text-[10px] ${statusColor(selectedItem.status)}`}>{statusLabel(selectedItem.status)}</Badge></DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Ukupno narudžbi</p><p className="text-lg font-bold">{selectedItem.orderCount}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Ukupna prodaja</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedItem.totalSales)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Prosečna ocena</p><p className="text-lg font-bold">{selectedItem.rating > 0 ? selectedItem.rating.toFixed(1) : 'N/A'}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Recenzija</p><p className="text-lg font-bold">{selectedItem.reviewCount}</p></div>
              </div>

              {selectedItem.description && (
                <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{selectedItem.description}</p></CardContent></Card>
              )}

              {/* Categories */}
              {selectedItem.categories && JSON.parse(selectedItem.categories).length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Kategorije</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {JSON.parse(selectedItem.categories).map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Detalji</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Komisija:</span><span className="font-medium">{selectedItem.commissionRate}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Min. narudžba:</span><span className="font-medium">{formatCurrency(selectedItem.minOrderAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Uslovi plaćanje:</span><span className="font-medium capitalize">{selectedItem.paymentTerms}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Besplatna dostava:</span><span className="font-medium">{selectedItem.shippingFree ? 'Da' : 'Ne'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vreme isporuke:</span><span className="font-medium">{selectedItem.deliveryTime || '-'}</span></div>
                  {selectedItem.approvedAt && <div className="flex justify-between"><span className="text-muted-foreground">Odobrena:</span><span className="font-medium">{new Date(selectedItem.approvedAt).toLocaleDateString('sr-RS')}</span></div>}
                </CardContent>
              </Card>
            </div>
            </>
          )}
      </DialogContent>
    </Dialog>

    {/* ===== ORDER DETAIL DIALOG (NEW) ===== */}
    <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {selectedItem && (
          <>
            <DialogHeader>
              <DialogTitle>Narudžba #{selectedItem.number}</DialogTitle>
              <DialogDescription>Status: <Badge variant="outline" className={`ml-2 text-[10px] ${statusColor(selectedItem.status)}`}>{statusLabel(selectedItem.status)}</Badge></DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Order Info */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Informacije</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Datum kreiranja:</span><span>{new Date(selectedItem.createdAt).toLocaleDateString('sr-RS')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Maloprodaja:</span><span className="font-medium">{selectedItem.retailerName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telefon:</span><span>{selectedItem.retailerPhone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedItem.retailerEmail || '-'}</span></div>
                  {selectedItem.retailerCity && <div className="flex justify-between"><span className="text-muted-foreground">Grad:</span><span>{selectedItem.retailerCity}</span></div>}
                  {selectedItem.retailerAddress && <div className="flex justify-between"><span className="text-muted-foreground">Adresa:</span><span className="max-w-[200px] text-right">{selectedItem.retailerAddress}</span></div>}
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Stavke narudžbe</CardTitle></CardHeader>
                <CardContent>
                  {selectedItem.items ? (
                    (() => {
                      try {
                        const items = JSON.parse(selectedItem.items)
                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                                <th className="p-2">Proizvod</th><th className="p-2 text-right">Količina</th><th className="p-2 text-right">Cena</th><th className="p-2 text-right">Ukupno</th>
                              </tr></thead>
                              <tbody>
                                {items.map((item: any, i: number) => (
                                  <tr key={i} className="border-t"><td className="p-2">{item.productName || item.name}</td><td className="p-2 text-right">{item.quantity}</td><td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="p-2 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>
                                ))}
                                <tr className="border-t bg-muted/50 font-medium"><td className="p-2" colSpan={4}>UKUPNO</td><td className="p-2 text-right">{formatCurrency(items.reduce((s: number, item: any) => s + item.quantity * item.unitPrice, 0))}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        )
                      } catch {
                        return <p className="text-sm text-muted-foreground">Nema stavki</p>
                      }
                    })()
                  ) : <p className="text-sm text-muted-foreground">Nema stavki</p>}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Finansijski pregled</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Iznos bez PDV-a:</span><span className="font-medium">{formatCurrency(selectedItem.totalAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Komisija:</span><span className="font-medium text-emerald-600">{formatCurrency(selectedItem.commissionAmount)}</span><span className="text-xs text-muted-foreground">({selectedItem.commissionRate}%)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Veleprodaja:</span><span>{selectedItem.vendorName}</span></div>
                  {selectedItem.internalNotes && (
                    <div className="mt-2 p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground"><span className="font-medium">Interna napomena:</span> {selectedItem.internalNotes}</p></div>
                  )}
                </CardContent>
              </Card>

              {/* Tracking */}
              {(selectedItem.trackingNumber || selectedItem.estimatedDelivery) && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Praćenje</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedItem.trackingNumber && <div className="flex justify-between"><span className="text-muted-foreground">Broj paketa:</span><span className="font-medium font-mono">{selectedItem.trackingNumber}</span></div>}
                    {selectedItem.carrierName && <div className="flex justify-between"><span className="text-muted-foreground">Kurier:</span><span>{selectedItem.carrierName}</span></div>}
                    {selectedItem.estimatedDelivery && <div className="flex justify-between"><span className="text-muted-foreground">Očekivana isporuka:</span><span>{new Date(selectedItem.estimatedDelivery).toLocaleDateString('sr-RS')}</span></div>}
                    {selectedItem.deliveredAt && <div className="flex justify-between"><span className="text-muted-foreground">Isporučena:</span><span className="text-green-600">{new Date(selectedItem.deliveredAt).toLocaleDateString('sr-RS')}</span></div>}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Akcije</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {selectedItem.status === 'nacrt' && <><Button size="sm" variant="outline" onClick={() => handleOrderStatus(selectedItem.id, 'potvrđena')} className="border-blue-500 text-blue-600 hover:bg-blue-50">Potvrdi</Button></>}
                  {selectedItem.status === 'potvrđena' && <Button size="sm" variant="outline" onClick={() => handleOrderStatus(selectedItem.id, 'u_pripremi')} className="border-blue-500 text-blue-600 hover:bg-blue-50">U pripremi</Button>}
                  {selectedItem.status === 'u_pripremi' && <Button size="sm" variant="outline" onClick={() => handleOrderStatus(selectedItem.id, 'poslata')} className="border-blue-500 text-blue-600 hover:bg-blue-50">Pošalji</Button>}
                  {selectedItem.status === 'poslata' && <Button size="sm" variant="outline" onClick={() => handleOrderStatus(selectedItem.id, 'u_isporuci')} className="border-blue-500 text-blue-600 hover:bg-blue-50">U isporuci</Button>}
                  {selectedItem.status === 'u_isporuci' && <Button size="sm" variant="outline" onClick={() => handleOrderStatus(selectedItem.id, 'isporučena')} className="border-green-500 text-green-600 hover:bg-green-50">Isporuči</Button>}
                  {selectedItem.status === 'isporučena' && <Button size="sm" variant="outline" onClick={() => handleOrderStatus(selectedItem.id, 'završena')} className="border-green-500 text-green-600 hover:bg-green-50">Završi</Button>}
                  {(selectedItem.status === 'nacrt' || selectedItem.status === 'potvrđena' || selectedItem.status === 'u_pripremi') && (
                    <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleOrderStatus(selectedItem.id, 'stornirana')}>Storniraj</Button>
                  )}
                </CardContent>
              </Card>
            </div>
            </>
          )}
      </DialogContent>
    </Dialog>

    {/* ===== REVIEW DIALOG ===== */}
    <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nova Recenzija</DialogTitle><DialogDescription>Ocenite veleprodaju</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Veleprodaja *</Label>
            <Select value={reviewForm.vendorId} onValueChange={(e) => setReviewForm({ ...reviewForm, vendorId: e.target.value })}>
              <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
              <SelectContent>{vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.slug}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Vaše ime *</Label><Input value={reviewForm.authorName} onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })} /></div>
          <div className="space-y-2"><Label>Ocena (1-5)</Label>
            <div className="flex items-center gap-1">
              {[5, 4, 3, 2, 1].map(star => (
                <button key={star} type="button" className={`p-0.5 focus:outline-none ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                  <Star className={`h-5 w-5 fill-current`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Naslov</Label><Input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Naslov recenzije" /></div>
          <div className="space-y-2"><Label>Komentar</Label><Textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={3} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewDialogOpen(false); setReviewForm(emptyReview) }}>Otkaži</Button>
            <Button onClick={handleCreateReview}>Pošalji recenziju</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* ===== DISPUTE DIALOG ===== */}
    <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Novi Spor</DialogTitle><DialogDescription>Prijavite spor na marketplace</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Narudžba *</Label>
            <Select value={disputeForm.orderId} onValueChange={(e) => setDisputeForm({ ...disputeForm, orderId: e.target.value })}>
              <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
              <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>{o.number} - {o.retailerName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Tip spora</Label>
              <Select value={disputeForm.type} onValueChange={(e) => setDisputeForm({ ...disputeForm, type: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Kvalitet</SelectItem>
                  <SelectItem value="delivery">Isporuka</SelectItem>
                  <SelectItem value="wrong_item">Pogrešna stavka</SelectItem>
                  <SelectItem value="damaged">Oštećeno</SelectItem>
                  <SelectItem value="not_received">Nije primljeno</SelectItem>
                  <SelectItem value="other">Ostalo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Prioritet</Label>
              <Select value={disputeForm.priority} onValueChange={(e) => setDisputeForm({ ...disputeForm, priority: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nizak">Nizak</SelectItem>
                  <SelectItem value="srednji">Srednji</SelectItem>
                  <SelectItem value="visok">Visok</SelectItem>
                  <SelectItem value="hitan">Hitan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Opis spora</Label><Textarea value={disputeForm.description} onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })} rows={3} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisputeDialogOpen(false); setDisputeForm(emptyDispute) }}>Otkaži</Button>
            <Button onClick={handleCreateDispute}>Prijavi spor</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
)
}
