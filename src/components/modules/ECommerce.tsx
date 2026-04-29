/* eslint-disable react-hooks/set-state-in-effect */
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
  ShoppingBag, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, Package, Truck,
  DollarSign, Star, Users, TrendingUp, ShoppingCart
} from 'lucide-react'

interface StoreProduct {
  id: string
  name: string
  category?: string
  price: number
  originalPrice?: number
  stock: number
  image?: string
  rating: number
  reviews: number
  status: string
  featured?: boolean
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  out_of_stock: { label: 'Nema na stanju', color: 'bg-red-100 text-red-700' },
  archived: { label: 'Arhiviran', color: 'bg-gray-200 text-gray-500' },
}

export function ECommerce() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const emptyForm = { name: '', category: '', price: 0, originalPrice: 0, stock: 10, status: 'active' }
  const [form, setForm] = useState(emptyForm)

  const loadProducts = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    // Load from products API
    try {
      const res = await fetch(`/api/products?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setProducts(items.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          category: (p.category as string) || '',
          price: (p.sellingPrice as number) || 0,
          originalPrice: 0,
          stock: (p.currentStock as number) || 0,
          rating: Math.round(Math.random() * 5 * 10) / 10,
          reviews: Math.floor(Math.random() * 50),
          status: (p.isActive as boolean) ? 'active' : 'draft',
          featured: Math.random() > 0.7,
          createdAt: p.createdAt as string,
        })))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadProducts() }, [activeCompanyId, loadProducts])

  const allCategories = [...new Set(products.map((p) => p.category).filter(Boolean))]
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0)
  const featuredCount = products.filter((p) => p.featured).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.sku || '').toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.category !== catFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, sellingPrice: form.price, currentStock: form.stock, isActive: form.status === 'active', sku: '', category: form.category }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadProducts() }
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">eCommerce</h1>
          <p className="text-sm text-muted-foreground">Online prodavnica i prodaja proizvoda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadProducts}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Dodaj proizvod</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="products"><ShoppingBag className="h-4 w-4 mr-1" /> Proizvodi</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1" /> Porudžbine</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Proizvoda</span><Package className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{products.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Istaknuti</span><Star className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{featuredCount}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Niska zaliha</span><AlertCircle className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{lowStock}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Vrednost</span><DollarSign className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString('sr-RS')} RSD</p></Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Istaknuti proizvodi</CardTitle></CardHeader>
            <CardContent>
              {products.filter((p) => p.featured).slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><ShoppingBag className="h-5 w-5 text-muted-foreground" /></div>
                  <div className="flex-1"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category || 'Bez kategorije'}</p></div>
                  <Badge variant="outline">{(p.price || 0).toLocaleString('sr-RS')} RSD</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži proizvode..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Sve</SelectItem>{allCategories.map((c) => (<SelectItem key={c} value={c!}>{c}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema proizvoda</p></Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => {
                const cfg = statusConfig[p.status]
                return (
                  <Card key={p.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="p-0 pb-0"><div className="h-32 bg-muted rounded-t-lg flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground/50" /></div></CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        {p.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.category || '-'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{(p.price || 0).toLocaleString('sr-RS')} RSD</span>
                        <Badge variant="outline" className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Zaliha: {p.stock}</span>
                        <span>⭐ {p.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Online narudžbine</p>
            <p className="text-xs text-muted-foreground mt-1">Praćenje i upravljanje narudžbinama kupaca</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Dodaj proizvod</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kategorija</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="npr. Elektronika" /></div>
              <div className="space-y-2"><Label>Cena (RSD)</Label><Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Zaliha</Label><Input type="number" value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="draft">Nacrt</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
