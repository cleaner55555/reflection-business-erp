
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, ShoppingBag, ShoppingCart, Tag, Gift, TrendingUp, Settings } from 'lucide-react'

import type { StoreProduct, StoreOrder, Category, Coupon, StoreSettings } from './types'
import {
  mockProducts, mockOrders, mockCategories, mockCoupons, defaultSettings,
} from './data'
import { RevenueChart, OverviewTab, ProductsTab, OrdersTab, CategoriesTab, CouponsTab, ReportsTab, SettingsTab } from './components'

// ============ MAIN COMPONENT ============

export function ECommerce() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/products?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        if (items.length > 0) {
          setProducts(items.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            sku: (p.sku as string) || '',
            category: (p.category as string) || '',
            description: (p.description as string) || '',
            price: (p.sellingPrice as number) || 0,
            comparePrice: 0,
            costPrice: (p.purchasePrice as number) || 0,
            stock: (p.currentStock as number) || 0,
            weight: 0,
            dimensions: '',
            seoTitle: '',
            seoDescription: '',
            image: (p.image as string) || '',
            rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
            reviews: Math.floor(Math.random() * 200),
            status: (p.isActive as boolean) ? ((p.currentStock as number) > 0 ? 'active' : 'out_of_stock') : 'draft',
            featured: Math.random() > 0.65,
            createdAt: p.createdAt as string,
          })))
        } else {
          setProducts(mockProducts)
        }
      } else {
        setProducts(mockProducts)
      }
    } catch {
      setProducts(mockProducts)
    }
    setOrders(mockOrders)
    setCategories(mockCategories)
    setCoupons(mockCoupons)
    setSettings(defaultSettings)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [activeCompanyId, loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const allCats = [...new Set(products.map((p) => p.category).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">e-Trgovina</h1>
          <p className="text-sm text-muted-foreground">Online prodavnica, narudžbine i analitika</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
          <TabsTrigger value="products"><ShoppingBag className="h-4 w-4 mr-1 hidden sm:inline" /> Proizvodi</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1 hidden sm:inline" /> Porudžbine</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-1 hidden sm:inline" /> Kategorije</TabsTrigger>
          <TabsTrigger value="coupons"><Gift className="h-4 w-4 mr-1 hidden sm:inline" /> Kuponi</TabsTrigger>
          <TabsTrigger value="reports"><TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" /> Izveštaji</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1 hidden sm:inline" /> Podešavanja</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab products={products} orders={orders} categories={categories} /></TabsContent>
        <TabsContent value="products"><ProductsTab products={products} setProducts={setProducts} categories={allCats} /></TabsContent>
        <TabsContent value="orders"><OrdersTab orders={orders} setOrders={setOrders} /></TabsContent>
        <TabsContent value="categories"><CategoriesTab categories={categories} setCategories={setCategories} /></TabsContent>
        <TabsContent value="coupons"><CouponsTab coupons={coupons} setCoupons={setCoupons} /></TabsContent>
        <TabsContent value="reports"><ReportsTab products={products} orders={orders} /></TabsContent>
        <TabsContent value="settings"><SettingsTab settings={settings} setSettings={setSettings} /></TabsContent>
      </Tabs>
    </div>
  )
}
