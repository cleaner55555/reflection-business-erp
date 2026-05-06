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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Store, ShoppingCart, Users, Package, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, AlertCircle, Clock, ArrowRight, BarChart3, TrendingUp,
  DollarSign, Star, Globe2, Boxes, UserCheck, Shield, FileText, Check,
  AlertTriangle, MessageSquare, Ban, Truck, ChevronRight, Zap, Award,
  LayoutGrid, ListFilter, BadgeCheck, Tag, Percent, Gift, ChevronDown, X,
  PackageSearch, Receipt, PieChart, ArrowUpRight, CircleDot
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

const Stars = ({ rating, size = 'sm' }: { rating: number; size?: string }) => {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sz} ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}

// ============ MAIN COMPONENT ============

import { MarketplaceContent } from './components'

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

  // Catalog (NEW)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [prodSearch, setProdSearch] = useState('')
  const [prodCategory, setProdCategory] = useState('all')
  const [prodVendor, setProdVendor] = useState('all')
  const [prodFeatured, setProdFeatured] = useState(false)

  // Coupons (NEW)
  const [coupons, setCoupons] = useState<any[]>([])

  // Dialogs
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false)
  const [vendorDetailOpen, setVendorDetailOpen] = useState(false)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [couponDialogOpen, setCouponDialogOpen] = useState(false)
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
  const emptyProduct = { name: '', vendorId: '', sku: '', category: '', description: '', price: 0, compareAtPrice: 0, costPrice: 0, unit: 'kom', stock: 0, minOrderQty: 1, weight: 0, imageUrl: '', isFeatured: false }
  const [productForm, setProductForm] = useState(emptyProduct)
  const emptyCoupon = { code: '', description: '', discountType: 'procenat', discountValue: 10, minOrderAmount: 0, maxUses: 100, validFrom: '', validTo: '', vendorId: '', category: '' }
  const [couponForm, setCouponForm] = useState(emptyCoupon)

  // Toast
  const [toast, setToast] = useState('')

  // ============ DATA LOADING ============

  return (
    <MarketplaceContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      loading={loading}
      setLoading={setLoading}
      dashData={dashData}
      setDashData={setDashData}
      vendors={vendors}
      setVendors={setVendors}
      vendorSearch={vendorSearch}
      setVendorSearch={setVendorSearch}
      vendorFilter={vendorFilter}
      setVendorFilter={setVendorFilter}
      orders={orders}
      setOrders={setOrders}
      orderSearch={orderSearch}
      setOrderSearch={setOrderSearch}
      orderFilter={orderFilter}
      setOrderFilter={setOrderFilter}
      reviews={reviews}
      setReviews={setReviews}
      disputes={disputes}
      setDisputes={setDisputes}
      products={products}
      setProducts={setProducts}
      categories={categories}
      setCategories={setCategories}
      prodSearch={prodSearch}
      setProdSearch={setProdSearch}
      prodCategory={prodCategory}
      setProdCategory={setProdCategory}
      prodVendor={prodVendor}
      setProdVendor={setProdVendor}
      prodFeatured={prodFeatured}
      setProdFeatured={setProdFeatured}
      coupons={coupons}
      setCoupons={setCoupons}
      vendorDialogOpen={vendorDialogOpen}
      setVendorDialogOpen={setVendorDialogOpen}
      orderDialogOpen={orderDialogOpen}
      setOrderDialogOpen={setOrderDialogOpen}
      reviewDialogOpen={reviewDialogOpen}
      setReviewDialogOpen={setReviewDialogOpen}
      disputeDialogOpen={disputeDialogOpen}
      setDisputeDialogOpen={setDisputeDialogOpen}
      vendorDetailOpen={vendorDetailOpen}
      setVendorDetailOpen={setVendorDetailOpen}
      orderDetailOpen={orderDetailOpen}
      setOrderDetailOpen={setOrderDetailOpen}
      productDialogOpen={productDialogOpen}
      setProductDialogOpen={setProductDialogOpen}
      couponDialogOpen={couponDialogOpen}
      setCouponDialogOpen={setCouponDialogOpen}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      vendorForm={vendorForm}
      setVendorForm={setVendorForm}
      orderForm={orderForm}
      setOrderForm={setOrderForm}
      orderItems={orderItems}
      setOrderItems={setOrderItems}
      reviewForm={reviewForm}
      setReviewForm={setReviewForm}
      disputeForm={disputeForm}
      setDisputeForm={setDisputeForm}
      productForm={productForm}
      setProductForm={setProductForm}
      couponForm={couponForm}
      setCouponForm={setCouponForm}
      toast={toast}
      setToast={setToast}
      emptyVendor={emptyVendor}
      emptyOrder={emptyOrder}
      emptyReview={emptyReview}
      emptyDispute={emptyDispute}
      emptyProduct={emptyProduct}
      emptyCoupon={emptyCoupon}
    />
  )
}
