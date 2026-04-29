'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
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
import {
  Store, ShoppingCart, Users, Package, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, AlertCircle, Clock, ArrowRight, BarChart3, TrendingUp,
  DollarSign, Star, Globe2, Boxes, UserCheck, Shield, FileText, Check,
  AlertTriangle, MessageSquare, Ban, Truck, ChevronRight, Zap, Award,
  LayoutGrid, ListFilter, BadgeCheck
} from 'lucide-react'

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

// ============ HELPERS ============

const statusColor = (status: string) => {
  switch (status) {
    case 'active': case 'isporučena': case 'završena': case 'objavljen': case 'rešeno': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'pending': case 'nacrt': case 'otvoren': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'potvrđena': case 'u_pripremi': case 'poslata': case 'u_toku': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'suspended': case 'stornirana': case 'skriven': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    case 'rejected': case 'odbijeno': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Na čekanju', active: 'Aktivan', suspended: 'Suspendovan', rejected: 'Odbijen',
    nacrt: 'Nacrt', potvrđena: 'Potvrđena', u_pripremi: 'U pripremi', poslata: 'Poslata',
    u_isporuci: 'U isporuci', isporučena: 'Isporučena', završena: 'Završena', stornirana: 'Stornirana',
    otvoren: 'Otvoren', u_toku: 'U toku', rešeno: 'Rešeno', odbijeno: 'Odbijeno',
    objavljen: 'Objavljen', na_cekanju: 'Na čekanju', skriven: 'Skriven',
  }
  return map[status] || status
}

const disputeTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    quality: 'Kvalitet', delivery: 'Isporuka', wrong_item: 'Pogrešna stavka',
    damaged: 'Oštećeno', not_received: 'Nije primljeno', other: 'Ostalo',
  }
  return map[type] || type
}

const priorityLabel = (p: string) => {
  const map: Record<string, string> = { nizak: 'Nizak', srednji: 'Srednji', visok: 'Visok', hitan: 'Hitan' }
  return map[p] || p
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
)

// ============ MAIN COMPONENT ============

export function Marketplace() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Dashboard
  const [dashData, setDashData] = useState<any>(null)

  // Vendors
  const [vendors, setVendors] = useState<any[]>([])
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState('all')

  // Orders
  const [orders, setOrders] = useState<any[]>([])
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')

  // Reviews
  const [reviews, setReviews] = useState<any[]>([])

  // Disputes
  const [disputes, setDisputes] = useState<any[]>([])

  // Dialogs
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Forms
  const emptyVendor = { partnerId: '', description: '', deliveryTime: '', minOrderAmount: 0, commissionRate: 5, categories: '', paymentTerms: 'odmah', shippingFree: false }
  const [vendorForm, setVendorForm] = useState(emptyVendor)
  const emptyOrder = { vendorId: '', retailerName: '', retailerEmail: '', retailerPhone: '', retailerAddress: '', retailerCity: '', notes: '' }
  const [orderForm, setOrderForm] = useState(emptyOrder)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const emptyReview = { vendorId: '', authorName: '', rating: 5, title: '', comment: '' }
  const [reviewForm, setReviewForm] = useState(emptyReview)
  const emptyDispute = { vendorId: '', orderId: '', type: 'other', description: '', priority: 'srednji' }
  const [disputeForm, setDisputeForm] = useState(emptyDispute)

  // Toast
  const [toast, setToast] = useState('')

  // ============ DATA LOADING ============

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

  useEffect(() => { loadDashboard() }, [loadDashboard])
  useEffect(() => { if (activeTab === 'vendors') loadVendors() }, [activeTab, loadVendors])
  useEffect(() => { if (activeTab === 'orders') loadOrders() }, [activeTab, loadOrders])
  useEffect(() => { if (activeTab === 'reviews') loadReviews() }, [activeTab, loadReviews])
  useEffect(() => { if (activeTab === 'disputes') loadDisputes() }, [activeTab, loadDisputes])
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadVendors(); loadDashboard(); showToast(`Status promenjen: ${statusLabel(status)}`)
    } catch { showToast('Greška') }
  }

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Obrisati veleprodaju?')) return
    try {
      await fetch(`/api/marketplace/vendors/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' })
      loadVendors(); loadDashboard(); showToast('Veleprodaja obrisana')
    } catch { showToast('Greška') }
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...orderForm, items: orderItems }),
      })
      if (res.ok) { setOrderDialogOpen(false); setOrderForm(emptyOrder); setOrderItems([]); loadOrders(); loadDashboard(); showToast('Narudžba kreirana') }
    } catch { showToast('Greška') }
  }

  const handleOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/marketplace/orders/${id}?companyId=${activeCompanyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadOrders(); loadDashboard(); showToast(`Status: ${statusLabel(status)}`)
    } catch { showToast('Greška') }
  }

  const handleCreateReview = async () => {
    if (!activeCompanyId || !reviewForm.vendorId || !reviewForm.authorName) { showToast('Popunite polja'); return }
    try {
      const res = await fetch('/api/marketplace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...reviewForm }),
      })
      if (res.ok) { setReviewDialogOpen(false); setReviewForm(emptyReview); loadReviews(); showToast('Recenzija dodata') }
    } catch { showToast('Greška') }
  }

  const handleCreateDispute = async () => {
    if (!activeCompanyId || !disputeForm.vendorId || !disputeForm.orderId) { showToast('Popunite polja'); return }
    try {
      const res = await fetch('/api/marketplace/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...disputeForm }),
      })
      if (res.ok) { setDisputeDialogOpen(false); setDisputeForm(emptyDispute); loadDisputes(); showToast('Spor kreiran') }
    } catch { showToast('Greška') }
  }

  const handleResolveDispute = async (id: string, resolution: string) => {
    try {
      await fetch(`/api/marketplace/disputes/${id}?companyId=${activeCompanyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rešeno', resolution }),
      })
      loadDisputes(); showToast('Spor rešen')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Platforma za povezivanje veleprodaja i maloprodaja</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadVendors(); loadOrders(); loadDisputes(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setVendorDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Veleprodaja
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOrderDialogOpen(true)}>
            <ShoppingCart className="h-4 w-4 mr-1" /> Nova Narudžba
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
          <TabsTrigger value="vendors"><Store className="h-4 w-4 mr-1 hidden sm:inline" /> Veleprodaje</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1 hidden sm:inline" /> Narudžbe</TabsTrigger>
          <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-1 hidden sm:inline" /> Recenzije</TabsTrigger>
          <TabsTrigger value="disputes"><AlertTriangle className="h-4 w-4 mr-1 hidden sm:inline" /> Sporovi</TabsTrigger>
          <TabsTrigger value="settings"><Shield className="h-4 w-4 mr-1 hidden sm:inline" /> Admin</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-6">
          {!dashData ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Kpi label="Aktivne veleprodaje" value={dashData.vendors.active} icon={Store} sub={`${dashData.vendors.pending} na čekanju`} color="text-green-500" />
                <Kpi label="Ukupno narudžbi" value={dashData.orders.total} icon={ShoppingCart} sub={`${dashData.orders.poslata || 0} u isporuci`} color="text-blue-500" />
                <Kpi label="Ukupna prodaja" value={formatCurrency(dashData.revenue.total)} icon={DollarSign} sub={`Komisija: ${formatCurrency(dashData.revenue.commission)}`} color="text-emerald-500" />
                <Kpi label="Prosečna ocena" value={dashData.reviews.avgRating || 'N/A'} icon={Award} sub={`${dashData.reviews.total} recenzija`} color="text-yellow-500" />
              </div>

              {/* Second row KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Kpi label="Prosečna narudžba" value={formatCurrency(dashData.revenue.avgOrder)} icon={TrendingUp} />
                <Kpi label="Otvoreni sporovi" value={dashData.disputes.open} icon={AlertTriangle} color="text-red-500" />
                <Kpi label="Stornirano" value={dashData.orders.stornirana || 0} icon={Ban} color="text-gray-500" />
                <Kpi label="Isporučeno" value={dashData.orders.isporučena || 0} icon={CheckCircle2} color="text-green-500" />
              </div>

              {/* Two columns: Top Vendors + Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Vendors */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Top 5 Veleprodaja po prodaji</CardTitle></CardHeader>
                  <CardContent>
                    {dashData.topVendors.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p>
                    ) : (
                      <div className="space-y-3">
                        {dashData.topVendors.map((v: any, i: number) => (
                          <div key={v.id} className="flex items-center justify-between">
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

                {/* Status Breakdown */}
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

              {/* Recent Orders */}
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
                            <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-2 pr-4 font-mono text-xs">{o.number}</td>
                              <td className="py-2 pr-4">{o.retailerName}</td>
                              <td className="py-2 pr-4 font-medium">{formatCurrency(o.totalAmount)}</td>
                              <td className="py-2"><Badge variant="outline" className={`text-[10px] ${statusColor(o.status)}`}>{statusLabel(o.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue by Month */}
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
                <Card key={v.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{v.slug}</CardTitle>
                        <Badge variant="outline" className={`mt-1 text-[10px] ${statusColor(v.status)}`}>{statusLabel(v.status)}
                      </div>
                      {v.shippingFree && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600">Besplatna dostava}
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
                    <div className="flex gap-2">
                      {v.status === 'pending' && <Button size="sm" className="flex-1" onClick={() => handleVendorAction(v.id, 'active')}><Check className="h-3.5 w-3.5 mr-1" /> Odobri</Button>}
                      {v.status === 'active' && <Button size="sm" variant="outline" className="flex-1" onClick={() => handleVendorAction(v.id, 'suspended')}><Ban className="h-3.5 w-3.5 mr-1" /> Suspenduj</Button>}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteVendor(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                      <tr key={o.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{o.number}</td>
                        <td className="p-3">{o.retailerName}</td>
                        <td className="p-3 text-xs">{o.vendorName}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(o.totalAmount)}</td>
                        <td className="p-3 text-right text-xs text-muted-foreground">{formatCurrency(o.commissionAmount)}</td>
                        <td className="p-3"><Badge variant="outline" className={`text-[10px] ${statusColor(o.status)}`}>{statusLabel(o.status)}</td>
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{reviews.length} recenzija</p>
            <Button size="sm" onClick={() => setReviewDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova recenzija</Button>
          </div>
          {reviews.length === 0 ? (
            <Card className="p-8 text-center"><Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema recenzija</p></Card>
          ) : (
            <div className="space-y-3">
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
                        <Badge variant="outline" className={`text-[10px] ${statusColor(d.status)}`}>{statusLabel(d.status)}
                        <Badge variant="outline" className="text-[10px]">{disputeTypeLabel(d.type)}
                        <Badge variant="outline" className="text-[10px]">{priorityLabel(d.priority)}
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

        {/* ===== ADMIN / PODEŠAVANJA ===== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Komisija</CardTitle><CardDescription>Globalna stopa provizije za marketplace</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Default provizija (%)</Label>
                    <Input type="number" min="0" max="50" defaultValue={5} disabled />
                    <p className="text-xs text-muted-foreground">Može se override-ovati po vendoru</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimalna provizija (RSD)</Label>
                    <Input type="number" min="0" defaultValue={0} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-odobravanje</Label>
                    <Switch defaultChecked={false} disabled />
                    <p className="text-xs text-muted-foreground">Automatski odobri nove veleprodaje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Status narudžbe - Workflow</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {['nacrt', 'potvrđena', 'u_pripremi', 'poslata', 'u_isporuci', 'isporučena', 'završena', 'stornirana'].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${statusColor(s)}`}>{statusLabel(s)}
                    {i < arr.length - 2 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    {i === arr.length - 2 && <span className="text-muted-foreground mx-1">|</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Marketplace informacije</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Centralizovani katalog</p><p className="text-xs text-muted-foreground">Svi proizvodi svih veleprodaja na jednom mestu</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Komisioni model</p><p className="text-xs text-muted-foreground">Automatski obračun provizije po narudžbi</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Rejting sistem</p><p className="text-xs text-muted-foreground">Maloprodaje ocenjuju veleprodaje (1-5 zvezdica)</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Resolucija sporova</p><p className="text-xs text-muted-foreground">Integrated dispute resolution sa status workflow</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Status praćenje narudžbi</p><p className="text-xs text-muted-foreground">8 statusa sa validacijom tranzicija</p></div></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== NEW VENDOR DIALOG ===== */}
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nova Veleprodaja</DialogTitle><DialogDescription>Registrujte novog dobavljača na marketplace</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Partner ID</Label><Input value={vendorForm.partnerId} onChange={(e) => setVendorForm({ ...vendorForm, partnerId: e.target.value })} placeholder="ID partnera iz modula Partneri" /></div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={vendorForm.description} onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })} rows={3} placeholder="Opis veleprodaje..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Vreme isporuke</Label><Input value={vendorForm.deliveryTime} onChange={(e) => setVendorForm({ ...vendorForm, deliveryTime: e.target.value })} placeholder="npr. 2-5 radnih dana" /></div>
              <div className="space-y-2"><Label>Min. narudžba (RSD)</Label><Input type="number" value={vendorForm.minOrderAmount} onChange={(e) => setVendorForm({ ...vendorForm, minOrderAmount: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Provizija (%)</Label><Input type="number" min="0" max="50" value={vendorForm.commissionRate} onChange={(e) => setVendorForm({ ...vendorForm, commissionRate: parseFloat(e.target.value) || 5 })} /></div>
              <div className="space-y-2"><Label>Uslovi plaćanja</Label>
                <Select value={vendorForm.paymentTerms} onValueChange={(v) => setVendorForm({ ...vendorForm, paymentTerms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odmah">Odmah</SelectItem><SelectItem value="15">15 dana</SelectItem><SelectItem value="30">30 dana</SelectItem><SelectItem value="60">60 dana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Kategorije (zarezane zarezom)</Label><Input value={vendorForm.categories} onChange={(e) => setVendorForm({ ...vendorForm, categories: e.target.value })} placeholder="npr. elektronika, IT, telefonija" /></div>
            <div className="flex items-center gap-2"><Switch checked={vendorForm.shippingFree} onCheckedChange={(c) => setVendorForm({ ...vendorForm, shippingFree: c })} /><Label>Besplatna dostava</Label></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreateVendor}>Kreiraj</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== NEW ORDER DIALOG ===== */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Nova Narudžba</DialogTitle><DialogDescription>Kreirajte novu marketplace narudžbu</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Veleprodaja (Vendor ID)</Label><Input value={orderForm.vendorId} onChange={(e) => setOrderForm({ ...orderForm, vendorId: e.target.value })} placeholder="ID veleprodaje" /></div>
              <div className="space-y-2"><Label>Maloprodaja (naziv)</Label><Input value={orderForm.retailerName} onChange={(e) => setOrderForm({ ...orderForm, retailerName: e.target.value })} placeholder="Naziv maloprodaje" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={orderForm.retailerEmail} onChange={(e) => setOrderForm({ ...orderForm, retailerEmail: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input value={orderForm.retailerPhone} onChange={(e) => setOrderForm({ ...orderForm, retailerPhone: e.target.value })} /></div>
              <div className="space-y-2 col-span-2"><Label>Adresa</Label><Input value={orderForm.retailerAddress} onChange={(e) => setOrderForm({ ...orderForm, retailerAddress: e.target.value })} /></div>
              <div className="space-y-2"><Label>Grad</Label><Input value={orderForm.retailerCity} onChange={(e) => setOrderForm({ ...orderForm, retailerCity: e.target.value })} /></div>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3"><Label className="text-sm font-medium">Stavke narudžbe</Label><Button size="sm" variant="outline" onClick={addOrderItem}><Plus className="h-3.5 w-3.5 mr-1" /> Dodaj stavku</Button></div>
              {orderItems.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nema stavki</p>}
              <div className="space-y-2">
                {orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 items-end">
                    <div className="space-y-1"><Label className="text-[10px]">Naziv</Label><Input className="h-8 text-xs" value={item.productName} onChange={(e) => updateOrderItem(idx, 'productName', e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Šifra</Label><Input className="h-8 text-xs" value={item.sku} onChange={(e) => updateOrderItem(idx, 'sku', e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Količina</Label><Input type="number" className="h-8 text-xs" value={item.quantity} onChange={(e) => updateOrderItem(idx, 'quantity', parseFloat(e.target.value) || 0)} /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Cena</Label><Input type="number" className="h-8 text-xs" value={item.unitPrice} onChange={(e) => updateOrderItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Ukupno</Label><p className="text-xs font-medium py-1.5">{formatCurrency(item.total || 0)}</p></div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeOrderItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
              {orderItems.length > 0 && (
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                  <span className="text-sm font-medium">Ukupno ({orderItems.length} stavki):</span>
                  <span className="text-lg font-bold">{formatCurrency(orderItems.reduce((s, i) => s + (i.total || 0), 0))}</span>
                </div>
              )}
            </div>
            <div className="space-y-2"><Label>Napomene</Label><Textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows={2} /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreateOrder} disabled={!orderForm.vendorId || orderItems.length === 0}>Kreiraj narudžbu</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== NEW REVIEW DIALOG ===== */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nova recenzija</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Vendor ID</Label><Input value={reviewForm.vendorId} onChange={(e) => setReviewForm({ ...reviewForm, vendorId: e.target.value })} /></div>
            <div className="space-y-2"><Label>Autor</Label><Input value={reviewForm.authorName} onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Ocena</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })} className="p-1 rounded hover:bg-muted">
                    <Star className={`h-6 w-6 ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>Naslov</Label><Input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Komentar</Label><Textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={3} /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreateReview}>Pošalji recenziju</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== NEW DISPUTE DIALOG ===== */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Novi spor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Vendor ID</Label><Input value={disputeForm.vendorId} onChange={(e) => setDisputeForm({ ...disputeForm, vendorId: e.target.value })} /></div>
            <div className="space-y-2"><Label>Order ID</Label><Input value={disputeForm.orderId} onChange={(e) => setDisputeForm({ ...disputeForm, orderId: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tip</Label>
              <Select value={disputeForm.type} onValueChange={(v) => setDisputeForm({ ...disputeForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Kvalitet</SelectItem><SelectItem value="delivery">Isporuka</SelectItem><SelectItem value="wrong_item">Pogrešna stavka</SelectItem>
                  <SelectItem value="damaged">Oštećeno</SelectItem><SelectItem value="not_received">Nije primljeno</SelectItem><SelectItem value="other">Ostalo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={disputeForm.description} onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })} rows={3} /></div>
            <div className="space-y-2"><Label>Prioritet</Label>
              <Select value={disputeForm.priority} onValueChange={(v) => setDisputeForm({ ...disputeForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nizak">Nizak</SelectItem><SelectItem value="srednji">Srednji</SelectItem><SelectItem value="visok">Visok</SelectItem><SelectItem value="hitan">Hitan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreateDispute}>Kreiraj spor</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
