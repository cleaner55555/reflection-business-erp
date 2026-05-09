 
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
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ShoppingBag, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, Package, Truck,
  DollarSign, Star, Users, TrendingUp, ShoppingCart,
  AlertCircle, Edit, Tag, Settings, Percent, Calendar,
  ArrowRight, ChevronRight, LayoutGrid, List, Copy,
  Gift, Zap, FileText, CreditCard, Globe, Mail, Bell,
  MousePointerClick, ArrowUpRight, ArrowDownRight, Minus,
  Filter, MoreVertical
} from 'lucide-react'

// ============ INTERFACES ============

interface StoreProduct {
  id: string
  name: string
  sku: string
  category?: string
  description?: string
  price: number
  comparePrice?: number
  costPrice?: number
  stock: number
  weight?: number
  dimensions?: string
  seoTitle?: string
  seoDescription?: string
  image?: string
  rating: number
  reviews: number
  status: 'active' | 'draft' | 'out_of_stock' | 'archived'
  featured?: boolean
  createdAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface StoreOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  status: 'nacrt' | 'potvrđena' | 'u_pripremi' | 'poslata' | 'u_isporuci' | 'isporučena' | 'završena' | 'otkazana'
  paymentMethod: 'kartica' | 'pouzece' | 'virman' | 'paypal'
  paymentStatus: 'čekanje' | 'plaćeno' | 'delimično' | 'otkazano'
  shippingMethod?: string
  trackingNumber?: string
  couponCode?: string
  notes?: string
  timeline: { status: string; date: string; note?: string }[]
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  description?: string
  image?: string
  productCount: number
  sortOrder: number
  isActive: boolean
  children?: Category[]
}

interface Coupon {
  id: string
  code: string
  type: 'procenat' | 'fiksni_iznos' | 'besplatna_dostava'
  value: number
  minOrder?: number
  maxDiscount?: number
  validFrom: string
  validTo: string
  maxUses?: number
  usedCount: number
  isActive: boolean
  appliesTo?: string
  createdAt: string
}

interface StoreSettings {
  storeName: string
  storeUrl: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  currency: string
  language: string
  taxRate: number
  freeShippingThreshold: number
  enableReviews: boolean
  enableWishlist: boolean
  enableRegistration: boolean
  enableGuestCheckout: boolean
  lowStockAlert: number
  outOfStockBehavior: string
  paymentMethods: { id: string; name: string; enabled: boolean; icon: string }[]
  shippingOptions: { id: string; name: string; price: number; estimatedDays: string; enabled: boolean }[]
  notifications: {
    newOrder: boolean
    lowStock: boolean
    orderStatusChange: boolean
    newReview: boolean
    dailyReport: boolean
    weeklyReport: boolean
  }
}

// ============ CONFIG ============

const productStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  out_of_stock: { label: 'Nema na stanju', color: 'bg-red-100 text-red-700' },
  archived: { label: 'Arhiviran', color: 'bg-gray-200 text-gray-500' },
}

const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  nacrt: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: FileText },
  'potvrđena': { label: 'Potvrđena', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  u_pripremi: { label: 'U pripremi', color: 'bg-amber-100 text-amber-700', icon: Package },
  poslata: { label: 'Poslata', color: 'bg-purple-100 text-purple-700', icon: Truck },
  u_isporuci: { label: 'U isporuci', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  isporučena: { label: 'Isporučena', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  završena: { label: 'Završena', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  otkazana: { label: 'Otkazana', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  čekanje: { label: 'Čeka plaćanje', color: 'bg-amber-100 text-amber-700' },
  plaćeno: { label: 'Plaćeno', color: 'bg-green-100 text-green-700' },
  delimično: { label: 'Delimično', color: 'bg-orange-100 text-orange-700' },
  otkazano: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

const paymentMethodLabels: Record<string, string> = {
  kartica: 'Kartica',
  pouzece: 'Pouzećem',
  virman: 'Virman',
  paypal: 'PayPal',
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

const orderStatusFlow = ['nacrt', 'potvrđena', 'u_pripremi', 'poslata', 'u_isporuci', 'isporučena', 'završena'] as const

// ============ MOCK DATA ============

const mockProducts: StoreProduct[] = [
  { id: '1', name: 'Bežične slušalice Sony WH-1000XM5', sku: 'SNY-WH1000XM5', category: 'Audio', description: 'Premium bežične slušalice sa aktivnom kontrolom buke', price: 54999, comparePrice: 62999, costPrice: 32000, stock: 45, weight: 0.25, dimensions: '22 x 18 x 8 cm', seoTitle: 'Sony WH-1000XM5 slušalice', seoDescription: 'Najbolje bežične slušalice sa ANC', rating: 4.8, reviews: 234, status: 'active', featured: true, createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Pametni sat Apple Watch Series 9', sku: 'APL-WATCH9-45', category: 'Pametni satovi', description: 'Napredni pametni sat sa GPS i zdravstvenim senzorima', price: 79999, comparePrice: 89999, costPrice: 55000, stock: 28, weight: 0.052, dimensions: '45 x 38 x 10.7 mm', seoTitle: 'Apple Watch Series 9', seoDescription: 'Novi pametni sat od Apple', rating: 4.9, reviews: 567, status: 'active', featured: true, createdAt: '2024-02-01T10:00:00Z' },
  { id: '3', name: 'Laptop Dell XPS 15 9530', sku: 'DEL-XPS15-9530', category: 'Laptopovi', description: 'Ultrabook sa Intel Core i7 i OLED ekranom', price: 189999, comparePrice: 219999, costPrice: 145000, stock: 12, weight: 1.86, dimensions: '34.4 x 22.0 x 1.78 cm', seoTitle: 'Dell XPS 15 Laptop', seoDescription: 'Premium ultrabook za profesionalce', rating: 4.7, reviews: 89, status: 'active', featured: true, createdAt: '2024-01-20T10:00:00Z' },
  { id: '4', name: 'Bežični miš Logitech MX Master 3S', sku: 'LOG-MX3S-GRY', category: 'Periferija', description: 'Ergonomski bežični miš za produktivnost', price: 14999, costPrice: 8500, stock: 78, weight: 0.141, dimensions: '12.5 x 8.4 x 5.1 cm', rating: 4.6, reviews: 412, status: 'active', featured: false, createdAt: '2024-03-01T10:00:00Z' },
  { id: '5', name: 'Tastatura Mechanical Keychron Q1', sku: 'KEY-Q1-BLK', category: 'Periferija', description: 'Premium mehanička tastatura sa QMK podrškom', price: 24999, comparePrice: 27999, costPrice: 15000, stock: 34, weight: 1.15, dimensions: '32.5 x 13.5 x 3.1 cm', rating: 4.8, reviews: 156, status: 'active', featured: true, createdAt: '2024-02-15T10:00:00Z' },
  { id: '6', name: 'Monitor LG UltraFine 27" 4K', sku: 'LG-27UN850-W', category: 'Monitori', description: 'IPS 4K monitor sa USB-C konekcijom', price: 69999, costPrice: 42000, stock: 19, weight: 6.3, dimensions: '61.2 x 45.2 x 19.8 cm', rating: 4.5, reviews: 98, status: 'active', featured: false, createdAt: '2024-01-25T10:00:00Z' },
  { id: '7', name: 'Drone DJI Mini 4 Pro', sku: 'DJI-MINI4P', category: 'Dronovi', description: 'Kompaktni drone sa 4K kamerom', price: 119999, costPrice: 80000, stock: 7, weight: 0.249, dimensions: '14.8 x 9.4 x 5.8 cm', rating: 4.9, reviews: 67, status: 'active', featured: true, createdAt: '2024-03-10T10:00:00Z' },
  { id: '8', name: 'Zvučnik JBL Charge 5', sku: 'JBL-CHG5-BLK', category: 'Audio', description: 'Prenosni Bluetooth zvučnik sa IP67 zaštitom', price: 24999, costPrice: 14000, stock: 56, weight: 0.96, dimensions: '22.0 x 9.6 x 9.6 cm', rating: 4.7, reviews: 345, status: 'active', featured: false, createdAt: '2024-02-20T10:00:00Z' },
  { id: '9', name: 'SSD Samsung 990 Pro 2TB', sku: 'SAM-990PRO-2TB', category: 'Komponente', description: 'NVMe M.2 SSD za najbrže performanse', price: 35999, comparePrice: 39999, costPrice: 22000, stock: 3, weight: 0.009, dimensions: '8.0 x 2.4 cm', rating: 4.9, reviews: 211, status: 'active', featured: false, createdAt: '2024-03-05T10:00:00Z' },
  { id: '10', name: 'Web kamera Logitech Brio 4K', sku: 'LOG-BRIO-4K', category: 'Periferija', description: 'Ultra HD web kamera za video pozive', price: 32999, costPrice: 19500, stock: 0, weight: 0.063, dimensions: '10.2 x 2.7 x 2.7 cm', rating: 4.4, reviews: 87, status: 'out_of_stock', featured: false, createdAt: '2024-01-30T10:00:00Z' },
  { id: '11', name: 'Tablet Samsung Galaxy Tab S9', sku: 'SAM-TABS9-128', category: 'Tableti', description: 'Android tablet sa AMOLED ekranom', price: 89999, costPrice: 62000, stock: 15, weight: 0.526, dimensions: '25.6 x 16.5 x 0.6 cm', rating: 4.6, reviews: 134, status: 'draft', featured: false, createdAt: '2024-03-15T10:00:00Z' },
  { id: '12', name: 'Hardver za stolariju Festool', sku: 'FST-OF1010', category: 'Alati', description: 'Profesionalna freza za drvo', price: 74999, costPrice: 52000, stock: 4, weight: 3.4, dimensions: '26.0 x 10.0 x 28.0 cm', rating: 4.8, reviews: 23, status: 'active', featured: false, createdAt: '2024-02-10T10:00:00Z' },
]

const mockOrders: StoreOrder[] = [
  {
    id: 'o1', orderNumber: 'WEB-2024-001', customerName: 'Marko Petrović', customerEmail: 'marko@email.com', customerPhone: '+381631234567', customerAddress: 'Knez Mihailova 24, Beograd',
    items: [{ id: 'i1', productId: '1', productName: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5', quantity: 1, unitPrice: 54999, totalPrice: 54999 }, { id: 'i2', productId: '4', productName: 'Logitech MX Master 3S', sku: 'LOG-MX3S-GRY', quantity: 1, unitPrice: 14999, totalPrice: 14999 }],
    subtotal: 69998, shipping: 0, tax: 0, discount: 5000, total: 64998,
    status: 'isporučena', paymentMethod: 'kartica', paymentStatus: 'plaćeno', shippingMethod: 'Kurir BEX', trackingNumber: 'BEX-2024-78901',
    timeline: [{ status: 'nacrt', date: '2024-03-01T09:15:00Z' }, { status: 'potvrđena', date: '2024-03-01T09:30:00Z' }, { status: 'u_pripremi', date: '2024-03-01T14:00:00Z', note: 'Pakovanje u toku' }, { status: 'poslata', date: '2024-03-02T10:00:00Z', note: 'Predata kuriru BEX' }, { status: 'u_isporuci', date: '2024-03-02T16:00:00Z' }, { status: 'isporučena', date: '2024-03-03T11:30:00Z', note: 'Preuzeto u Beogradu' }],
    createdAt: '2024-03-01T09:15:00Z', updatedAt: '2024-03-03T11:30:00Z',
  },
  {
    id: 'o2', orderNumber: 'WEB-2024-002', customerName: 'Ana Jovanović', customerEmail: 'ana.j@email.com', customerPhone: '+381649876543', customerAddress: 'Bulevar Kralja Aleksandra 73, Niš',
    items: [{ id: 'i3', productId: '2', productName: 'Apple Watch Series 9', sku: 'APL-WATCH9-45', quantity: 1, unitPrice: 79999, totalPrice: 79999 }],
    subtotal: 79999, shipping: 500, tax: 0, discount: 0, total: 80499,
    status: 'u_pripremi', paymentMethod: 'pouzece', paymentStatus: 'čekanje', shippingMethod: 'Pošta',
    timeline: [{ status: 'nacrt', date: '2024-03-15T14:20:00Z' }, { status: 'potvrđena', date: '2024-03-15T14:25:00Z' }, { status: 'u_pripremi', date: '2024-03-16T09:00:00Z' }],
    createdAt: '2024-03-15T14:20:00Z', updatedAt: '2024-03-16T09:00:00Z',
  },
  {
    id: 'o3', orderNumber: 'WEB-2024-003', customerName: 'Nikola Stanković', customerEmail: 'nikola.s@email.com', customerPhone: '+381601112233',
    items: [{ id: 'i4', productId: '7', productName: 'DJI Mini 4 Pro', sku: 'DJI-MINI4P', quantity: 1, unitPrice: 119999, totalPrice: 119999 }, { id: 'i5', productId: '9', productName: 'Samsung 990 Pro 2TB', sku: 'SAM-990PRO-2TB', quantity: 2, unitPrice: 35999, totalPrice: 71998 }],
    subtotal: 191997, shipping: 0, tax: 0, discount: 10000, total: 181997,
    status: 'poslata', paymentMethod: 'virman', paymentStatus: 'plaćeno', shippingMethod: 'Kurir BEX', trackingNumber: 'BEX-2024-81234', couponCode: 'DRAŽ10',
    timeline: [{ status: 'nacrt', date: '2024-03-10T08:00:00Z' }, { status: 'potvrđena', date: '2024-03-10T10:30:00Z' }, { status: 'u_pripremi', date: '2024-03-11T08:00:00Z' }, { status: 'poslata', date: '2024-03-12T15:00:00Z', note: 'Predata BEX ekspres' }],
    createdAt: '2024-03-10T08:00:00Z', updatedAt: '2024-03-12T15:00:00Z',
  },
  {
    id: 'o4', orderNumber: 'WEB-2024-004', customerName: 'Jelena Milić', customerEmail: 'jelena.m@email.com', customerPhone: '+381655554444',
    items: [{ id: 'i6', productId: '5', productName: 'Keychron Q1', sku: 'KEY-Q1-BLK', quantity: 1, unitPrice: 24999, totalPrice: 24999 }],
    subtotal: 24999, shipping: 350, tax: 0, discount: 0, total: 25349,
    status: 'potvrđena', paymentMethod: 'kartica', paymentStatus: 'plaćeno', shippingMethod: 'Kurir AKS',
    timeline: [{ status: 'nacrt', date: '2024-03-18T11:00:00Z' }, { status: 'potvrđena', date: '2024-03-18T11:05:00Z' }],
    createdAt: '2024-03-18T11:00:00Z', updatedAt: '2024-03-18T11:05:00Z',
  },
  {
    id: 'o5', orderNumber: 'WEB-2024-005', customerName: 'Stefan Nikolić', customerEmail: 'stefan.n@email.com', customerPhone: '+381637778888', customerAddress: 'Strahinjića Bana 15, Beograd',
    items: [{ id: 'i7', productId: '3', productName: 'Dell XPS 15 9530', sku: 'DEL-XPS15-9530', quantity: 1, unitPrice: 189999, totalPrice: 189999 }, { id: 'i8', productId: '6', productName: 'LG UltraFine 27" 4K', sku: 'LG-27UN850-W', quantity: 1, unitPrice: 69999, totalPrice: 69999 }],
    subtotal: 259998, shipping: 0, tax: 0, discount: 15000, total: 244998,
    status: 'završena', paymentMethod: 'kartica', paymentStatus: 'plaćeno', shippingMethod: 'Dostava na ruke', notes: 'Kupac zadovoljan, ostavio pozitivan review',
    timeline: [{ status: 'nacrt', date: '2024-02-20T16:00:00Z' }, { status: 'potvrđena', date: '2024-02-20T16:10:00Z' }, { status: 'u_pripremi', date: '2024-02-21T09:00:00Z' }, { status: 'poslata', date: '2024-02-22T10:00:00Z' }, { status: 'u_isporuci', date: '2024-02-23T08:00:00Z' }, { status: 'isporučena', date: '2024-02-23T14:00:00Z' }, { status: 'završena', date: '2024-02-28T10:00:00Z', note: 'Garancija aktivirana' }],
    createdAt: '2024-02-20T16:00:00Z', updatedAt: '2024-02-28T10:00:00Z',
  },
]

const mockCategories: Category[] = [
  { id: 'c1', name: 'Audio', slug: 'audio', description: 'Slušalice, zvučnici i audio oprema', productCount: 2, sortOrder: 1, isActive: true },
  { id: 'c2', name: 'Pametni satovi', slug: 'pametni-satovi', description: 'Smartwatch uređaji', productCount: 1, sortOrder: 2, isActive: true },
  { id: 'c3', name: 'Laptopovi', slug: 'laptopovi', description: 'Prenosni računari', productCount: 1, sortOrder: 3, isActive: true },
  { id: 'c4', name: 'Periferija', slug: 'periferija', description: 'Miševi, tastature, web kamere', productCount: 3, sortOrder: 4, isActive: true },
  { id: 'c5', name: 'Monitori', slug: 'monitori', description: 'Računarski monitori', productCount: 1, sortOrder: 5, isActive: true },
  { id: 'c6', name: 'Dronovi', slug: 'dronovi', description: 'Kamere i dronovi', productCount: 1, sortOrder: 6, isActive: true },
  { id: 'c7', name: 'Komponente', slug: 'komponente', description: 'Grafičke kartice, SSD, RAM', productCount: 1, sortOrder: 7, isActive: true },
  { id: 'c8', name: 'Tableti', slug: 'tableti', description: 'Tablet računari', productCount: 1, sortOrder: 8, isActive: true },
  { id: 'c9', name: 'Alati', slug: 'alati', description: 'Ručni alati i mašine', productCount: 1, sortOrder: 9, isActive: true },
]

const mockCoupons: Coupon[] = [
  { id: 'cp1', code: 'DRAŽ10', type: 'procenat', value: 10, minOrder: 50000, maxDiscount: 15000, validFrom: '2024-01-01', validTo: '2024-06-30', maxUses: 500, usedCount: 87, isActive: true, appliesTo: 'Svi proizvodi', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cp2', code: 'POČETNI20', type: 'fiksni_iznos', value: 2000, minOrder: 10000, validFrom: '2024-01-01', validTo: '2024-12-31', maxUses: 1000, usedCount: 342, isActive: true, appliesTo: 'Novi korisnici', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cp3', code: 'DOSTAVA0', type: 'besplatna_dostava', value: 0, minOrder: 20000, validFrom: '2024-03-01', validTo: '2024-03-31', maxUses: 200, usedCount: 45, isActive: true, appliesTo: 'Svi proizvodi', createdAt: '2024-02-28T00:00:00Z' },
  { id: 'cp4', code: 'VIP15', type: 'procenat', value: 15, minOrder: 100000, maxDiscount: 30000, validFrom: '2024-02-01', validTo: '2024-05-31', maxUses: 50, usedCount: 23, isActive: true, appliesTo: 'VIP korisnici', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'cp5', code: 'LETNJE25', type: 'procenat', value: 25, minOrder: 30000, validFrom: '2024-06-01', validTo: '2024-08-31', maxUses: 300, usedCount: 0, isActive: false, appliesTo: 'Letnja kolekcija', createdAt: '2024-05-01T00:00:00Z' },
]

const defaultSettings: StoreSettings = {
  storeName: 'Moja Prodavnica', storeUrl: 'www.mojaprodavnica.rs', storeDescription: 'Vaša omiljena online prodavnica',
  storeEmail: 'prodaja@mojaprodavnica.rs', storePhone: '+381 11 123 4567', currency: 'RSD', language: 'sr',
  taxRate: 20, freeShippingThreshold: 50000, enableReviews: true, enableWishlist: true, enableRegistration: true, enableGuestCheckout: true,
  lowStockAlert: 5, outOfStockBehavior: 'sakrij',
  paymentMethods: [
    { id: 'pm1', name: 'Platne kartice', enabled: true, icon: 'CreditCard' },
    { id: 'pm2', name: 'Pouzećem', enabled: true, icon: 'Banknote' },
    { id: 'pm3', name: 'Virman', enabled: true, icon: 'FileText' },
    { id: 'pm4', name: 'PayPal', enabled: false, icon: 'Globe' },
  ],
  shippingOptions: [
    { id: 'sh1', name: 'Kurir BEX', price: 450, estimatedDays: '1-2 radna dana', enabled: true },
    { id: 'sh2', name: 'Kurir AKS', price: 400, estimatedDays: '1-3 radna dana', enabled: true },
    { id: 'sh3', name: 'Pošta', price: 250, estimatedDays: '3-5 radna dana', enabled: true },
    { id: 'sh4', name: 'Lično preuzimanje', price: 0, estimatedDays: 'Istog dana', enabled: true },
  ],
  notifications: { newOrder: true, lowStock: true, orderStatusChange: true, newReview: true, dailyReport: false, weeklyReport: true },
}

// ============ REVENUE CHART (Simple Bar Chart) ============

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

// ============ OVERVIEW TAB ============

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

// ============ PRODUCTS TAB ============

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

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Izmeni proizvod' : 'Dodaj proizvod'}</DialogTitle>
            <DialogDescription>{editingProduct ? 'Ažurirajte podatke o proizvodu' : 'Popunite podatke za novi proizvod'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Osnovne informacije</h3>
              <div className="space-y-2">
                <Label>Naziv proizvoda *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="npr. Bežične slušalice Sony WH-1000XM5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="npr. SNY-WH1000XM5" />
                </div>
                <div className="space-y-2">
                  <Label>Kategorija</Label>
                  <Input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="npr. Audio" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Opis</Label>
                <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detaljan opis proizvoda..." rows={3} />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cene</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Prodajna cena (RSD) *</Label>
                  <Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Uporedna cena</Label>
                  <Input type="number" value={form.comparePrice || ''} onChange={(e) => setForm({ ...form, comparePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Nabavna cena</Label>
                  <Input type="number" value={form.costPrice || ''} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              {form.costPrice && form.price > 0 && (
                <p className="text-xs text-muted-foreground">
                  Marža: {((form.price - form.costPrice) / form.price * 100).toFixed(1)}% ({formatCurrency(form.price - form.costPrice)})
                </p>
              )}
            </div>

            <Separator />

            {/* Inventory & Physical */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Zaliha i fizičke karakteristike</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Zaliha *</Label>
                  <Input type="number" value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Težina (kg)</Label>
                  <Input type="number" step="0.001" value={form.weight || ''} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Dimenzije</Label>
                  <Input value={form.dimensions || ''} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="npr. 22 x 18 x 8 cm" />
                </div>
              </div>
            </div>

            <Separator />

            {/* SEO */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4" /> SEO optimizacija</h3>
              <div className="space-y-2">
                <Label>SEO Naslov</Label>
                <Input value={form.seoTitle || ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Naslov za pretraživače (meta title)" />
              </div>
              <div className="space-y-2">
                <Label>SEO Opis</Label>
                <Textarea value={form.seoDescription || ''} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="Meta opis za pretraživače (150-160 karaktera)" rows={2} />
              </div>
            </div>

            <Separator />

            {/* Status & Featured */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StoreProduct['status'] })}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktivan</SelectItem>
                      <SelectItem value="draft">Nacrt</SelectItem>
                      <SelectItem value="out_of_stock">Nema na stanju</SelectItem>
                      <SelectItem value="archived">Arhiviran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Istaknuti proizvod</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={!form.name}>
              {editingProduct ? 'Sačuvaj izmene' : 'Dodaj proizvod'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Brisanje proizvoda</DialogTitle>
            <DialogDescription>Da li ste sigurni da želite da obrišete ovaj proizvod? Ova akcija je nepovratna.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Otkaži</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ ORDERS TAB ============

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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Porudžbina {selectedOrder.orderNumber}
                  <Badge variant="outline" className={orderStatusConfig[selectedOrder.status]?.color}>
                    {orderStatusConfig[selectedOrder.status]?.label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>Kreirana: {formatDate(selectedOrder.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {orderStatusFlow.map((s, i) => {
                    const isActive = selectedOrder.status === s
                    const isPast = orderStatusFlow.indexOf(selectedOrder.status) > i
                    return (
                      <div key={s} className="flex items-center gap-1">
                        <Badge variant={isActive ? 'default' : isPast ? 'secondary' : 'outline'} className="text-xs">
                          {orderStatusConfig[s]?.label}
                        </Badge>
                        {i < orderStatusFlow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  {selectedOrder.status !== 'otkazana' && selectedOrder.status !== 'završena' && orderStatusFlow.includes(selectedOrder.status) && (
                    <Button size="sm" onClick={() => { advanceStatus(selectedOrder.id); const nextIdx = orderStatusFlow.indexOf(selectedOrder.status as typeof orderStatusFlow[number]) + 1; setSelectedOrder({ ...selectedOrder, status: orderStatusFlow[nextIdx] ?? selectedOrder.status }) }}>
                      <ArrowRight className="h-4 w-4 mr-1" /> Napredak status
                    </Button>
                  )}
                  {!['otkazana', 'završena', 'isporučena'].includes(selectedOrder.status) && (
                    <Button size="sm" variant="destructive" onClick={() => { cancelOrder(selectedOrder.id); setSelectedOrder({ ...selectedOrder, status: 'otkazana', paymentStatus: 'otkazano' }) }}>
                      Otkaži narudžbinu
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Podaci o kupcu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-sm">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                      {selectedOrder.customerPhone && <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>}
                      {selectedOrder.customerAddress && <p className="text-muted-foreground">{selectedOrder.customerAddress}</p>}
                    </CardContent>
                  </Card>

                  {/* Payment & Shipping */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2"><Truck className="h-4 w-4" /> Plaćanje i dostava</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Način plaćanja:</span><span className="font-medium">{paymentMethodLabels[selectedOrder.paymentMethod]}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Status plaćanja:</span><Badge variant="outline" className={`text-xs ${paymentStatusConfig[selectedOrder.paymentStatus]?.color}`}>{paymentStatusConfig[selectedOrder.paymentStatus]?.label}</Badge></div>
                      {selectedOrder.shippingMethod && <div className="flex justify-between"><span className="text-muted-foreground">Dostava:</span><span>{selectedOrder.shippingMethod}</span></div>}
                      {selectedOrder.trackingNumber && <div className="flex justify-between"><span className="text-muted-foreground">Broj praćenja:</span><span className="font-mono">{selectedOrder.trackingNumber}</span></div>}
                      {selectedOrder.couponCode && <div className="flex justify-between"><span className="text-muted-foreground">Kupon:</span><Badge variant="outline" className="text-xs">{selectedOrder.couponCode}</Badge></div>}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Stavke narudžbine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proizvod</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Količina</TableHead>
                          <TableHead className="text-right">Jed. cena</TableHead>
                          <TableHead className="text-right">Ukupno</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-sm">{item.productName}</TableCell>
                            <TableCell className="text-sm font-mono text-muted-foreground">{item.sku}</TableCell>
                            <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right text-sm font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Separator className="my-3" />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Podtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                      {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Popust</span><span>-{formatCurrency(selectedOrder.discount)}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">Dostava</span><span>{selectedOrder.shipping === 0 ? 'Besplatna' : formatCurrency(selectedOrder.shipping)}</span></div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold"><span>Ukupno</span><span>{formatCurrency(selectedOrder.total)}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Istorija narudžbine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...selectedOrder.timeline].reverse().map((entry, i) => {
                        const cfg = orderStatusConfig[entry.status]
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                              {i < selectedOrder.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label || entry.status}</Badge>
                                <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                              </div>
                              {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.notes && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Napomene</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ CATEGORIES TAB ============

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

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Izmeni kategoriju' : 'Nova kategorija'}</DialogTitle>
            <DialogDescription>{editingCat ? 'Ažurirajte podatke o kategoriji' : 'Kreirajte novu kategoriju za proizvode'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv kategorije *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="npr. Audio oprema" />
            </div>
            <div className="space-y-2">
              <Label>URL slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="npr. audio-oprema" />
              <p className="text-xs text-muted-foreground">Auto-generisan iz naziva ako se ostavi prazno</p>
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kratak opis kategorije..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editingCat ? 'Sačuvaj' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Brisanje kategorije</DialogTitle>
            <DialogDescription>Da li ste sigurni? Proizvodi u ovoj kategoriji neće biti obrisani.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Otkaži</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ COUPONS TAB ============

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

      {/* Coupon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Izmeni kupon' : 'Novi kupon'}</DialogTitle>
            <DialogDescription>{editingCoupon ? 'Ažurirajte detalje kupona' : 'Kreirajte novi kupon za popust'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kupon kod *</Label>
              <div className="flex gap-2">
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="npr. POPUST20" className="font-mono uppercase" />
                <Button variant="outline" size="icon" onClick={() => setForm({ ...form, code: Math.random().toString(36).substring(2, 8).toUpperCase() })}><Zap className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tip kupona</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Coupon['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procenat">Procenat (%)</SelectItem>
                    <SelectItem value="fiksni_iznos">Fiksni iznos (RSD)</SelectItem>
                    <SelectItem value="besplatna_dostava">Besplatna dostava</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vrednost</Label>
                <Input type="number" value={form.value || ''} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} disabled={form.type === 'besplatna_dostava'} placeholder={form.type === 'procenat' ? '%' : 'RSD'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Min. narudžbina (RSD)</Label>
                <Input type="number" value={form.minOrder || ''} onChange={(e) => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Max. popust (RSD)</Label>
                <Input type="number" value={form.maxDiscount || ''} onChange={(e) => setForm({ ...form, maxDiscount: parseFloat(e.target.value) || 0 })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Važi od</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Važi do</Label>
                <Input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max. korišćenja</Label>
              <Input type="number" value={form.maxUses || ''} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} placeholder="0 = neograničeno" />
            </div>
            <div className="space-y-2">
              <Label>Primenjuje se na</Label>
              <Input value={form.appliesTo || ''} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })} placeholder="npr. Svi proizvodi, Određena kategorija" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={!form.code}>{editingCoupon ? 'Sačuvaj' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ REPORTS TAB ============

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

// ============ SETTINGS TAB ============

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
