'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {

  UtensilsCrossed, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  ShoppingBag, Receipt, Clock, DollarSign, Users, CheckCircle, XCircle,
  Search, ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

// ==================== TYPES ====================

interface RestoCategory {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  items?: RestoMenuItem[]
}

interface RestoMenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  cost: number
  image?: string
  isAvailable: boolean
  sortOrder: number
  category?: { id: string; name: string }
}

interface RestoTable {
  id: string
  number: number
  name?: string
  capacity: number
  status: string
  location?: string
  activeOrderCount?: number
}

interface RestoOrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
  status: string
}

interface RestoOrder {
  id: string
  orderNumber: number
  tableId?: string
  status: string
  type: string
  totalAmount: number
  discountPct: number
  waiter?: string
  notes?: string
  createdAt: string
  updatedAt: string
  table?: { id: string; number: number; name?: string; location?: string }
  items?: RestoOrderItem[]
}

// ==================== CONSTANTS ====================

const TABLE_STATUS_BADGE: Record<string, string> = {
  slobodan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  zauzet: 'bg-red-50 text-red-700 border-red-200',
  rezervisan: 'bg-amber-50 text-amber-700 border-amber-200',
}

const TABLE_STATUS_LABEL: Record<string, string> = {
  slobodan: 'Slobodan',
  zauzet: 'Zauzet',
  rezervisan: 'Rezervisan',
}

const TABLE_STATUS_DOT: Record<string, string> = {
  slobodan: 'bg-emerald-500',
  zauzet: 'bg-red-500',
  rezervisan: 'bg-amber-500',
}

const ORDER_STATUS_BADGE: Record<string, string> = {
  u_toku: 'bg-blue-50 text-blue-700 border-blue-200',
  spremno: 'bg-amber-50 text-amber-700 border-amber-200',
  'usluženo': 'bg-teal-50 text-teal-700 border-teal-200',
  plaćeno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  otkazano: 'bg-red-50 text-red-700 border-red-200',
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  u_toku: 'U toku',
  spremno: 'Spremno',
  'usluženo': 'Usluženo',
  plaćeno: 'Plaćeno',
  otkazano: 'Otkazano',
}

const ORDER_TYPE_LABEL: Record<string, string> = {
  restoran: 'Restoran',
  porudzbina: 'Porudžbina',
  dostava: 'Dostava',
}

const ORDER_TYPE_BADGE: Record<string, string> = {
  restoran: 'bg-slate-100 text-slate-700 border-slate-200',
  porudzbina: 'bg-violet-50 text-violet-700 border-violet-200',
  dostava: 'bg-orange-50 text-orange-700 border-orange-200',
}

const ITEM_STATUS_LABEL: Record<string, string> = {
  'naručeno': 'Naručeno',
  u_pripremi: 'U pripremi',
  spremno: 'Spremno',
  'usluženo': 'Usluženo',
}

const ITEM_STATUS_BADGE: Record<string, string> = {
  'naručeno': 'bg-blue-50 text-blue-600 border-blue-200',
  u_pripremi: 'bg-amber-50 text-amber-600 border-amber-200',
  spremno: 'bg-teal-50 text-teal-600 border-teal-200',
  'usluženo': 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

const ORDER_STATUS_FLOW = ['u_toku', 'spremno', 'usluženo', 'plaćeno']

const LOCATION_LABELS: Record<string, string> = {
  sprat: 'Sprat',
  terasa: 'Terasa',
  basta: 'Bašta',
  bar: 'Bar',
  sala: 'Sala',
}

// ==================== COMPONENT ====================

export function KafeRestoranContent() {
// Data states
const [categories, setCategories] = useState<RestoCategory[]>([])
const [menuItems, setMenuItems] = useState<RestoMenuItem[]>([])
const [tables, setTables] = useState<RestoTable[]>([])
const [orders, setOrders] = useState<RestoOrder[]>([])
const [loading, setLoading] = useState(true)
const [submitting, setSubmitting] = useState(false)

// UI states
const [activeTab, setActiveTab] = useState('stolovi')
const [orderFilter, setOrderFilter] = useState('all')

// View modes
const [stoloviViewMode, setStoloviViewMode] = useState<'list' | 'form'>('list')
const [narudzbineViewMode, setNarudzbineViewMode] = useState<'list' | 'form'>('list')
const [meniViewMode, setMeniViewMode] = useState<'list' | 'category-form' | 'menu-item-form'>('list')

// Editing states - Tables
const [editingTable, setEditingTable] = useState<RestoTable | null>(null)

// Editing states - Categories
const [editingCategory, setEditingCategory] = useState<RestoCategory | null>(null)

// Editing states - Menu items
const [editingMenuItem, setEditingMenuItem] = useState<RestoMenuItem | null>(null)
const [menuItemCategoryId, setMenuItemCategoryId] = useState<string>('')

// Editing states - Orders
const [orderItems, setOrderItems] = useState<{ menuItemId: string; menuItemName: string; quantity: number; unitPrice: number }[]>([])
const [menuSearch, setMenuSearch] = useState('')

// Menu category expand state
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

// Order detail expand state
const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

const { t } = useTranslation()
const { tc, translateTexts } = useContentTranslation()

// ==================== DATA FETCHING ====================

const fetchCategories = useCallback(async () => {
  try {
    const res = await fetch('/api/resto-categories?activeOnly=false')
    if (!res.ok) throw new Error()
    const data = await res.json()
    setCategories(data)
  } catch {
    toast.error(t('cafeRestaurant.loadCategoriesError'))
  }
}, [])

const fetchMenuItems = useCallback(async () => {
  try {
    const res = await fetch('/api/resto-menu-items')
    if (!res.ok) throw new Error()
    const data = await res.json()
    setMenuItems(data)
  } catch {
    toast.error(t('cafeRestaurant.loadMenuError'))
  }
}, [])

const fetchTables = useCallback(async () => {
  try {
    const res = await fetch('/api/resto-tables')
    if (!res.ok) throw new Error()
    const data = await res.json()
    setTables(data)
  } catch {
    toast.error(t('cafeRestaurant.loadTablesError'))
  }
}, [])

const fetchOrders = useCallback(async () => {
  try {
    const res = await fetch('/api/resto-orders')
    if (!res.ok) throw new Error()
    const data = await res.json()
    setOrders(data)
  } catch {
    toast.error(t('cafeRestaurant.loadOrdersError'))
  }
}, [])

const fetchAll = useCallback(async () => {
  setLoading(true)
  await Promise.all([fetchCategories(), fetchMenuItems(), fetchTables(), fetchOrders()])
  setLoading(false)
}, [fetchCategories, fetchMenuItems, fetchTables, fetchOrders])

useEffect(() => { fetchAll() }, [fetchAll])

// Batch-translate content when data loads
useEffect(() => {
  if (categories.length > 0 || menuItems.length > 0 || tables.length > 0 || orders.length > 0) {
    const texts: string[] = []
    categories.forEach(c => { if (c.name) texts.push(c.name) })
    menuItems.forEach(mi => { if (mi.name) texts.push(mi.name); if (mi.description) texts.push(mi.description) })
    tables.forEach(tb => { if (tb.name) texts.push(tb.name) })
    orders.forEach(o => { if (o.waiter) texts.push(o.waiter); if (o.notes) texts.push(o.notes) })
    if (texts.length > 0) translateTexts(texts)
  }
}, [categories, menuItems, tables, orders, translateTexts])

// ==================== COMPUTED VALUES ====================

const todayOrders = orders
const todayRevenue = todayOrders.filter(o => o.status === 'plaćeno').reduce((s, o) => s + o.totalAmount, 0)
const activeOrders = todayOrders.filter(o => ['u_toku', 'spremno', 'usluženo'].includes(o.status))
const avgOrderValue = todayOrders.length > 0 ? todayOrders.reduce((s, o) => s + o.totalAmount, 0) / todayOrders.length : 0

const filteredOrders = orderFilter === 'all' ? todayOrders : todayOrders.filter(o => o.status === orderFilter)

const groupedMenu = categories.map(cat => ({
  ...cat,
  items: menuItems.filter(mi => mi.categoryId === cat.id),
}))

const availableMenuItems = menuSearch
  ? menuItems.filter(mi => mi.isAvailable && mi.name.toLowerCase().includes(menuSearch.toLowerCase()))
  : menuItems.filter(mi => mi.isAvailable)

const orderTotal = orderItems.reduce((s, item) => s + item.quantity * item.unitPrice, 0)

// ==================== TABLE HANDLERS ====================

const handleTableSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setSubmitting(true)
  const fd = new FormData(e.currentTarget)
  const body = {
    number: Number(fd.get('number')),
    name: (fd.get('name') as string) || null,
    capacity: Number(fd.get('capacity')) || 4,
    status: fd.get('status') as string || 'slobodan',
    location: (fd.get('location') as string) || null,
  }
  try {
    const url = editingTable ? `/api/resto-tables/${editingTable.id}` : '/api/resto-tables'
    const res = await fetch(url, {
      method: editingTable ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || t('common.error'))
    }
    toast.success(editingTable ? t('cafeRestaurant.tableUpdated') : t('cafeRestaurant.tableCreated'))
    setStoloviViewMode('list')
    setEditingTable(null)
    fetchTables()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : t('common.saveError'))
  } finally {
    setSubmitting(false)
  }
}

const handleDeleteTable = async (id: string) => {
  if (!confirm(t('cafeRestaurant.confirmDeleteTable'))) return
  try {
    const res = await fetch(`/api/resto-tables/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    toast.success(t('cafeRestaurant.tableDeleted'))
    fetchTables()
  } catch {
    toast.error(t('cafeRestaurant.deleteTableError'))
  }
}

const openEditTable = (table: RestoTable) => {
  setEditingTable(table)
  setStoloviViewMode('form')
}

// ==================== CATEGORY HANDLERS ====================

const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setSubmitting(true)
  const fd = new FormData(e.currentTarget)
  const body = {
    name: fd.get('name') as string,
    sortOrder: Number(fd.get('sortOrder')) || 0,
    isActive: true,
  }
  try {
    const url = editingCategory ? `/api/resto-categories/${editingCategory.id}` : '/api/resto-categories'
    const res = await fetch(url, {
      method: editingCategory ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error()
    toast.success(editingCategory ? t('cafeRestaurant.categoryUpdated') : t('cafeRestaurant.categoryCreated'))
    setMeniViewMode('list')
    setEditingCategory(null)
    fetchCategories()
  } catch {
    toast.error(t('cafeRestaurant.saveCategoryError'))
  } finally {
    setSubmitting(false)
  }
}

const handleDeleteCategory = async (id: string) => {
  if (!confirm(t('cafeRestaurant.confirmDeleteCategory'))) return
  try {
    const res = await fetch(`/api/resto-categories/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    toast.success(t('cafeRestaurant.categoryDeleted'))
    fetchCategories()
    fetchMenuItems()
  } catch {
    toast.error(t('cafeRestaurant.deleteCategoryError'))
  }
}

const openEditCategory = (cat: RestoCategory) => {
  setEditingCategory(cat)
  setMeniViewMode('category-form')
}

const toggleCategoryExpand = (catId: string) => {
  setExpandedCategories(prev => {
    const next = new Set(prev)
    if (next.has(catId)) next.delete(catId)
    else next.add(catId)
    return next
  })
}

// ==================== MENU ITEM HANDLERS ====================

const handleMenuItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setSubmitting(true)
  const fd = new FormData(e.currentTarget)
  const body = {
    categoryId: fd.get('categoryId') as string,
    name: fd.get('name') as string,
    description: (fd.get('description') as string) || null,
    price: Number(fd.get('price')),
    cost: Number(fd.get('cost')) || 0,
    isAvailable: true,
    sortOrder: Number(fd.get('sortOrder')) || 0,
  }
  try {
    const url = editingMenuItem ? `/api/resto-menu-items/${editingMenuItem.id}` : '/api/resto-menu-items'
    const res = await fetch(url, {
      method: editingMenuItem ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error()
    toast.success(editingMenuItem ? t('cafeRestaurant.menuItemUpdated') : t('cafeRestaurant.menuItemCreated'))
    setMeniViewMode('list')
    setEditingMenuItem(null)
    setMenuItemCategoryId('')
    fetchMenuItems()
  } catch {
    toast.error(t('cafeRestaurant.saveMenuItemError'))
  } finally {
    setSubmitting(false)
  }
}

const handleToggleAvailability = async (item: RestoMenuItem) => {
  try {
    const res = await fetch(`/api/resto-menu-items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    })
    if (!res.ok) throw new Error()
    toast.success(item.isAvailable ? t('cafeRestaurant.menuItemDeactivated') : t('cafeRestaurant.menuItemActivated'))
    fetchMenuItems()
  } catch {
    toast.error(t('cafeRestaurant.updateMenuItemError'))
  }
}

const handleDeleteMenuItem = async (id: string) => {
  if (!confirm(t('cafeRestaurant.confirmDeleteMenuItem'))) return
  try {
    const res = await fetch(`/api/resto-menu-items/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    toast.success(t('cafeRestaurant.menuItemDeleted'))
    fetchMenuItems()
  } catch {
    toast.error(t('cafeRestaurant.deleteMenuItemError'))
  }
}

const openEditMenuItem = (item: RestoMenuItem) => {
  setEditingMenuItem(item)
  setMenuItemCategoryId(item.categoryId)
  setMeniViewMode('menu-item-form')
}

const openNewMenuItem = (categoryId?: string) => {
  setEditingMenuItem(null)
  setMenuItemCategoryId(categoryId || '')
  setMeniViewMode('menu-item-form')
}

// ==================== ORDER HANDLERS ====================

const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (orderItems.length === 0) {
    toast.error(t('cafeRestaurant.addAtLeastOneItem'))
    return
  }
  setSubmitting(true)
  const fd = new FormData(e.currentTarget)
  const body = {
    tableId: (fd.get('tableId') as string) || null,
    type: fd.get('type') as string || 'restoran',
    waiter: (fd.get('waiter') as string) || null,
    notes: (fd.get('notes') as string) || null,
    status: 'u_toku',
    items: orderItems.map(item => ({
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  }
  try {
    const res = await fetch('/api/resto-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || t('common.error'))
    }
    toast.success(t('cafeRestaurant.orderCreated'))
    setNarudzbineViewMode('list')
    setOrderItems([])
    setMenuSearch('')
    fetchOrders()
    fetchTables()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : t('cafeRestaurant.createOrderError'))
  } finally {
    setSubmitting(false)
  }
}

const handleUpdateOrderStatus = async (order: RestoOrder, newStatus: string) => {
  try {
    const res = await fetch(`/api/resto-orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) throw new Error()
    toast.success(`Status: ${ORDER_STATUS_LABEL[newStatus] || newStatus}`)
    fetchOrders()
  } catch {
    toast.error(t('cafeRestaurant.updateStatusError'))
  }
}

const handleDeleteOrder = async (id: string) => {
  if (!confirm(t('cafeRestaurant.confirmDeleteOrder'))) return
  try {
    const res = await fetch(`/api/resto-orders/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    toast.success(t('cafeRestaurant.orderDeleted'))
    if (expandedOrder === id) setExpandedOrder(null)
    fetchOrders()
  } catch {
    toast.error(t('cafeRestaurant.deleteOrderError'))
  }
}

const getNextStatus = (currentStatus: string) => {
  const idx = ORDER_STATUS_FLOW.indexOf(currentStatus)
  if (idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1) {
    return ORDER_STATUS_FLOW[idx + 1]
  }
  return null
}

const addOrderItem = (item: RestoMenuItem) => {
  const existing = orderItems.find(oi => oi.menuItemId === item.id)
  if (existing) {
    setOrderItems(prev => prev.map(oi =>
      oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
    ))
  } else {
    setOrderItems(prev => [...prev, {
      menuItemId: item.id,
      menuItemName: item.name,
      quantity: 1,
      unitPrice: item.price,
    }])
  }
}

const removeOrderItem = (menuItemId: string) => {
  setOrderItems(prev => prev.filter(oi => oi.menuItemId !== menuItemId))
}

const updateOrderItemQty = (menuItemId: string, qty: number) => {
  if (qty <= 0) {
    removeOrderItem(menuItemId)
    return
  }
  setOrderItems(prev => prev.map(oi =>
    oi.menuItemId === menuItemId ? { ...oi, quantity: qty } : oi
  ))
}

const openNewOrder = () => {
  setOrderItems([])
  setMenuSearch('')
  setNarudzbineViewMode('form')
}

const handleCancelOrder = () => {
  setNarudzbineViewMode('list')
  setOrderItems([])
  setMenuSearch('')
}

// ==================== RENDER ====================

return (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <UtensilsCrossed className="h-6 w-6" />
        {t('cafeRestaurant.title')}
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        {t('cafeRestaurant.subtitle')}
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Receipt className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('cafeRestaurant.todayOrders')}</p>
            <p className="text-lg font-bold">{todayOrders.length}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('cafeRestaurant.totalRevenue')}</p>
            <p className="text-lg font-bold">{formatRSD(todayRevenue)}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('cafeRestaurant.activeOrders')}</p>
            <p className="text-lg font-bold">{activeOrders.length}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-4.5 w-4.5 text-violet-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('cafeRestaurant.avgOrder')}</p>
            <p className="text-lg font-bold">{formatRSD(avgOrderValue)}</p>
          </div>
        </div>
      </Card>
    </div>

    {/* Tabs */}
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="stolovi">{t('cafeRestaurant.tables')}</TabsTrigger>
        <TabsTrigger value="narudzbine">
          {t('cafeRestaurant.orders')}
          {activeOrders.length > 0 && (
            <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1.5 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
              {activeOrders.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="meni">{t('cafeRestaurant.menu')}</TabsTrigger>
      </TabsList>

      {/* ============ STOLOVI TAB ============ */}
      <TabsContent value="stolovi" className="mt-4">
        <Card>
          <CardHeader>
            {stoloviViewMode === 'form' ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => { setStoloviViewMode('list'); setEditingTable(null) }}><ArrowLeft className="h-4 w-4" /></Button>
                <div><CardTitle>{editingTable ? t('common.edit') : t('cafeRestaurant.new')} {t('cafeRestaurant.table').toLowerCase()}</CardTitle></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{t('cafeRestaurant.tables')}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{tables.length} {t('cafeRestaurant.tables').toLowerCase()}</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => { setEditingTable(null); setStoloviViewMode('form') }}>
                  <Plus className="h-4 w-4" />
                  {t('cafeRestaurant.addTable')}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {stoloviViewMode === 'form' ? (
              <form onSubmit={handleTableSubmit} key={editingTable?.id || 'new'} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.tableNumber')} *</Label>
                    <Input name="number" type="number" min={1} defaultValue={editingTable?.number || ''} required placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.name')}</Label>
                    <Input name="name" defaultValue={editingTable?.name || ''} placeholder="npr. Terasa 1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Kapacitet</Label>
                    <Input name="capacity" type="number" min={1} defaultValue={editingTable?.capacity || 4} placeholder="4" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Lokacija</Label>
                    <Select name="location" defaultValue={editingTable?.location || ''}>
                      <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sprat">Sprat</SelectItem>
                        <SelectItem value="terasa">Terasa</SelectItem>
                        <SelectItem value="basta">Bašta</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="sala">Sala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select name="status" defaultValue={editingTable?.status || 'slobodan'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slobodan">Slobodan</SelectItem>
                      <SelectItem value="zauzet">Zauzet</SelectItem>
                      <SelectItem value="rezervisan">Rezervisan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setStoloviViewMode('list'); setEditingTable(null) }} className="flex-1">{t('common.cancel')}</Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-5 w-2/3 mb-3" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </Card>
                    ))}
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">{t('cafeRestaurant.noTables')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tables.map((table) => (
                      <Card
                        key={table.id}
                        className={`p-4 transition-all hover:shadow-md cursor-pointer group border-2 ${
                          table.status === 'zauzet'
                            ? 'border-red-200 bg-red-50/30'
                            : table.status === 'rezervisan'
                              ? 'border-amber-200 bg-amber-50/30'
                              : 'border-transparent hover:border-emerald-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${TABLE_STATUS_DOT[table.status] || 'bg-gray-300'}`} />
                            <span className="text-xs font-medium text-muted-foreground">#{table.number}</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditTable(table)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteTable(table.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 truncate">{table.name ? tc(table.name) : `Sto ${table.number}`}</h3>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{table.capacity} {t('cafeRestaurant.seats')}</span>
                          </div>
                          {table.location && (
                            <div className="text-xs text-muted-foreground">{LOCATION_LABELS[table.location] || table.location}</div>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${TABLE_STATUS_BADGE[table.status] || ''}`}>
                          {TABLE_STATUS_LABEL[table.status] || table.status}
                        </Badge>
                        {(table.activeOrderCount || 0) > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-[10px] text-muted-foreground">{(table.activeOrderCount || 0)} {t('cafeRestaurant.activeOrders').toLowerCase()}</p>
                          </div>
                        )}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5" onClick={() => openNewOrder()}>
                            <Plus className="h-3 w-3" />
                            {t('cafeRestaurant.newOrder')}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ============ NARUDŽBINE TAB ============ */}
      <TabsContent value="narudzbine" className="mt-4">
        <Card>
          <CardHeader>
            {narudzbineViewMode === 'form' ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleCancelOrder}><ArrowLeft className="h-4 w-4" /></Button>
                <div><CardTitle>{t('cafeRestaurant.newOrder')}</CardTitle></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Narudžbine</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{filteredOrders.length} {t('cafeRestaurant.orders').toLowerCase()}</p>
                </div>
                <Button size="sm" className="gap-2" onClick={openNewOrder}>
                  <Plus className="h-4 w-4" />
                  {t('cafeRestaurant.newOrder')}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {narudzbineViewMode === 'form' ? (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.table')}</Label>
                    <Select name="tableId" defaultValue="">
                      <SelectTrigger><SelectValue placeholder={t('cafeRestaurant.noTable')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('cafeRestaurant.noTable')}</SelectItem>
                        {tables.filter(t => t.status === 'slobodan').map(t => (
                          <SelectItem key={t.id} value={t.id}>#{t.number} {t.name ? `- ${t.name}` : ''}</SelectItem>
                        ))}
                        {tables.filter(t => t.status !== 'slobodan').map(t => (
                          <SelectItem key={t.id} value={t.id}>#{t.number} {t.name ? `- ${t.name}` : ''} (zauzet)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.type')}</Label>
                    <Select name="type" defaultValue="restoran">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restoran">Restoran</SelectItem>
                        <SelectItem value="porudzbina">Porudžbina</SelectItem>
                        <SelectItem value="dostava">Dostava</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.waiter')}</Label>
                    <Input name="waiter" placeholder={t('cafeRestaurant.waiterNamePlaceholder')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{t('cafeRestaurant.addItems')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder={t('cafeRestaurant.searchMenu')} value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} />
                  </div>
                  {menuSearch && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border">
                      {availableMenuItems.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-3 text-center">{t('common.noData')}</p>
                      ) : (
                        availableMenuItems.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent/50 transition-colors text-left border-b last:border-0"
                            onClick={() => addOrderItem(item)}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium truncate block">{item.name}</span>
                              {item.category && <span className="text-[10px] text-muted-foreground">{item.category.name}</span>}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">{formatRSD(item.price)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {orderItems.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.orderItems')}</Label>
                    <div className="rounded-lg border divide-y max-h-48 overflow-y-auto">
                      {orderItems.map(oi => (
                        <div key={oi.menuItemId} className="flex items-center justify-between px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{oi.menuItemName}</p>
                            <p className="text-[10px] text-muted-foreground">{formatRSD(oi.unitPrice)} x {oi.quantity} = {formatRSD(oi.unitPrice * oi.quantity)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateOrderItemQty(oi.menuItemId, oi.quantity - 1)}>-</Button>
                            <span className="w-6 text-center text-xs font-medium">{oi.quantity}</span>
                            <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateOrderItemQty(oi.menuItemId, oi.quantity + 1)}>+</Button>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 ml-1" onClick={() => removeOrderItem(oi.menuItemId)}><XCircle className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <p className="text-sm font-bold">{t('common.total')}: {formatRSD(orderTotal)}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">{t('cafeRestaurant.notes')}</Label>
                  <Textarea name="notes" placeholder="Dodatne napomene..." rows={2} />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancelOrder} className="flex-1">{t('common.cancel')}</Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? t('cafeRestaurant.creating') : t('cafeRestaurant.createOrder', { count: orderItems.length })}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['all', 'u_toku', 'spremno', 'usluženo', 'plaćeno', 'otkazano'].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={orderFilter === status ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setOrderFilter(status)}
                    >
                      {status === 'all' ? t('common.all') : ORDER_STATUS_LABEL[status] || status}
                    </Button>
                  ))}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-5 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">{t('cafeRestaurant.noOrders')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrder === order.id
                      const nextStatus = getNextStatus(order.status)
                      return (
                        <div key={order.id}>
                          <Card className={`p-4 transition-all hover:shadow-md cursor-pointer ${isExpanded ? 'rounded-b-none' : ''}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{t('cafeRestaurant.order')} #{order.orderNumber}</span>
                                  <Badge variant="outline" className={`text-[10px] ${ORDER_STATUS_BADGE[order.status] || ''}`}>
                                    {ORDER_STATUS_LABEL[order.status] || order.status}
                                  </Badge>
                                  <Badge variant="outline" className={`text-[10px] ${ORDER_TYPE_BADGE[order.type] || ''}`}>
                                    {ORDER_TYPE_LABEL[order.type] || order.type}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                  {order.table && (
                                    <span className="flex items-center gap-1">
                                      <UtensilsCrossed className="h-3 w-3" />
                                      Sto #{order.table.number}{order.table.name ? ` - ${order.table.name}` : ''}
                                    </span>
                                  )}
                                  {order.waiter && (
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{order.waiter}</span>
                                  )}
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(order.createdAt)}</span>
                                  <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" />{order.items?.length || 0} {t('cafeRestaurant.items').toLowerCase()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="font-bold text-sm">{formatRSD(order.totalAmount)}</p>
                                  {order.discountPct > 0 && <p className="text-[10px] text-amber-600">{t('cafeRestaurant.discount')}: -{order.discountPct}%</p>}
                                </div>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  {nextStatus && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleUpdateOrderStatus(order, nextStatus)}>
                                      <CheckCircle className="h-3 w-3" />{ORDER_STATUS_LABEL[nextStatus]}
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteOrder(order.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                              </div>
                            </div>
                          </Card>

                          {isExpanded && order.items && (
                            <Card className="rounded-t-none border-t-0 p-4">
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('cafeRestaurant.orderItems')}</h4>
                                {order.items.length === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2">{t('cafeRestaurant.noItems')}</p>
                                ) : (
                                  <div className="divide-y rounded-lg border">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-accent/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{item.menuItemName}</span>
                                            <Badge variant="outline" className={`text-[10px] ${ITEM_STATUS_BADGE[item.status] || ''}`}>
                                              {ITEM_STATUS_LABEL[item.status] || item.status}
                                            </Badge>
                                          </div>
                                          {item.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{item.notes}</p>}
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                          <p className="text-sm font-medium">{formatRSD(item.total)}</p>
                                          <p className="text-[10px] text-muted-foreground">{formatRSD(item.unitPrice)} x {item.quantity}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {order.notes && (
                                  <div className="mt-2 p-2 rounded-md bg-muted/50">
                                    <p className="text-[10px] text-muted-foreground font-medium">{t('cafeRestaurant.notes')}:</p>
                                    <p className="text-xs text-muted-foreground">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ============ MENI TAB ============ */}
      <TabsContent value="meni" className="mt-4">
        <Card>
          <CardHeader>
            {meniViewMode === 'category-form' ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => { setMeniViewMode('list'); setEditingCategory(null) }}><ArrowLeft className="h-4 w-4" /></Button>
                <div><CardTitle>{editingCategory ? t('common.edit') : t('cafeRestaurant.new')} {t('cafeRestaurant.category').toLowerCase()}</CardTitle></div>
              </div>
            ) : meniViewMode === 'menu-item-form' ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => { setMeniViewMode('list'); setEditingMenuItem(null); setMenuItemCategoryId('') }}><ArrowLeft className="h-4 w-4" /></Button>
                <div><CardTitle>{editingMenuItem ? t('common.edit') : t('cafeRestaurant.new')} {t('cafeRestaurant.menuItem').toLowerCase()}</CardTitle></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Meni</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{categories.length} kategorija, {menuItems.length} stavki</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => { setEditingCategory(null); setMeniViewMode('category-form') }}>
                  <Plus className="h-4 w-4" />
                  {t('cafeRestaurant.addCategory')}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {meniViewMode === 'category-form' ? (
              <form onSubmit={handleCategorySubmit} key={editingCategory?.id || 'new'} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Naziv kategorije *</Label>
                  <Input name="name" defaultValue={editingCategory?.name || ''} required placeholder="npr. Predjela" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('cafeRestaurant.sortOrder')}</Label>
                  <Input name="sortOrder" type="number" min={0} defaultValue={editingCategory?.sortOrder ?? 0} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setMeniViewMode('list'); setEditingCategory(null) }} className="flex-1">{t('common.cancel')}</Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </form>
            ) : meniViewMode === 'menu-item-form' ? (
              <form onSubmit={handleMenuItemSubmit} key={editingMenuItem?.id || 'new'} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Naziv *</Label>
                    <Input name="name" defaultValue={editingMenuItem?.name || ''} required placeholder="npr. Cappuccino" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.category')} *</Label>
                    <Select name="categoryId" defaultValue={editingMenuItem?.categoryId || menuItemCategoryId}>
                      <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.isActive).map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.sortOrder')}</Label>
                    <Input name="sortOrder" type="number" min={0} defaultValue={editingMenuItem?.sortOrder ?? 0} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Opis</Label>
                  <Textarea name="description" defaultValue={editingMenuItem?.description || ''} placeholder="Opis stavke..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.sellingPrice')} *</Label>
                    <Input name="price" type="number" step="0.01" min={0} defaultValue={editingMenuItem?.price || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('cafeRestaurant.costPriceLabel')}</Label>
                    <Input name="cost" type="number" step="0.01" min={0} defaultValue={editingMenuItem?.cost || 0} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setMeniViewMode('list'); setEditingMenuItem(null); setMenuItemCategoryId('') }} className="flex-1">{t('common.cancel')}</Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-5 w-1/3 mb-3" />
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    ))}
                  </div>
                ) : groupedMenu.length === 0 ? (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">{t('cafeRestaurant.noCategories')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedMenu.map((cat) => {
                      const isExpanded = expandedCategories.has(cat.id)
                      return (
                        <Card key={cat.id}>
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors rounded-lg"
                            onClick={() => toggleCategoryExpand(cat.id)}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                              <div>
                                <h3 className="font-semibold text-sm">{cat.name}</h3>
                                <p className="text-xs text-muted-foreground">{cat.items?.length || 0} stavki</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Badge variant="outline" className={`text-[10px] ${cat.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {cat.isActive ? t('cafeRestaurant.active') : t('cafeRestaurant.inactive')}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCategory(cat)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteCategory(cat.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {isExpanded && cat.items && cat.items.length > 0 && (
                            <div className="px-4 pb-4">
                              <div className="divide-y rounded-lg border">
                                {cat.items.map((item) => (
                                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-3 hover:bg-accent/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{item.name}</span>
                                        {!item.isAvailable && (
                                          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">{t('cafeRestaurant.unavailable')}</Badge>
                                        )}
                                      </div>
                                      {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                                      {item.cost > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{t('cafeRestaurant.costPrice')}: {formatRSD(item.cost)}</p>}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{formatRSD(item.price)}</span>
                                        <Switch checked={item.isAvailable} onCheckedChange={() => handleToggleAvailability(item)} className="scale-75" />
                                      </div>
                                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMenuItem(item)}>
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteMenuItem(item.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button size="sm" variant="outline" className="mt-3 gap-1.5 h-7 text-xs" onClick={() => openNewMenuItem(cat.id)}>
                                <Plus className="h-3 w-3" />
                                {t('cafeRestaurant.addMenuItemTo', { name: cat.name })}
                              </Button>
                            </div>
                          )}

                          {isExpanded && (!cat.items || cat.items.length === 0) && (
                            <div className="px-4 pb-4">
                              <p className="text-xs text-muted-foreground py-2 text-center">{t('cafeRestaurant.noItemsInCategory')}</p>
                              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => openNewMenuItem(cat.id)}>
                                <Plus className="h-3 w-3" />
                                {t('cafeRestaurant.addMenuItem')}
                              </Button>
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
)
}