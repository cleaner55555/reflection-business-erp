'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, AlertTriangle, Pencil, Trash2, Package, FileText, Tag, ArrowLeft, Printer, BarChart3, MapPin, Warehouse as WarehouseIcon, TrendingDown, TrendingUp, ArrowRightLeft, Hash, ClipboardCheck, ArrowLeftRight, ScanBarcode, Layers, ArrowDownToLine } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { ReportDownloadButton } from './ReportDownloadButton'
import { LotoviTab, InventuraTab, TransferiTab } from './InventoryEnhanced'
import { BarkodiTab, ZoneMapTab, PickingTab, PrijemTab } from './WmsEnhanced'

// ==================== INTERFACES ====================

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

interface Partner {
  id: string
  name: string
  pib: string
  type: string
}

interface DeliveryNoteItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface DeliveryNote {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  invoiceNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  partner: { id: string; name: string; pib: string }
  items: DeliveryNoteItem[]
}

interface PriceListItem {
  id: string
  productId: string
  price: number
  discountPct: number
  product?: { id: string; name: string; sku: string; unit: string }
}

interface PriceList {
  id: string
  name: string
  description: string | null
  validFrom: string | null
  validTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { items: number }
  items: PriceListItem[]
}

// ==================== LINE ITEM HELPERS ====================

interface LineItem {
  tempId: string
  productId: string
  productName: string
  quantity: string
  unitPrice: string
}

interface PriceLineItem {
  tempId: string
  productId: string
  price: string
  discountPct: string
}

let tempIdCounter = 0

// ==================== COMPANY INFO ====================

const COMPANY = {
  name: 'Reflection Business',
  address: 'Bulevar Mihajla Pupina 10a',
  city: 'Beograd, 11070',
  pib: '123456789',
  maticniBr: '21012345',
  account: '265-12345678-12',
  bank: 'Banca Intesa Beograd',
  phone: '+381 11 123 4567',
  email: 'office@reflectionbusiness.rs',
}

// ==================== MAIN COMPONENT ====================

import { nextTempId, StockOverview, LokacijeTab, ArtikliTab, KretanjaTab, OtpremniceTab, CenovniciTab } from './components'

export function Magacin() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('warehouse.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('warehouse.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pregled</span>
          </TabsTrigger>
          <TabsTrigger value="artikli" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.products')}</span>
          </TabsTrigger>
          <TabsTrigger value="kretanja" className="gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.movements')}</span>
          </TabsTrigger>
          <TabsTrigger value="lokacije" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lokacije</span>
          </TabsTrigger>
          <TabsTrigger value="otpremnice" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.deliveryNotes')}</span>
          </TabsTrigger>
          <TabsTrigger value="cenovnici" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('warehouse.priceLists')}</span>
          </TabsTrigger>
          <TabsTrigger value="lotovi" className="gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lotovi</span>
          </TabsTrigger>
          <TabsTrigger value="inventura" className="gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Inventura</span>
          </TabsTrigger>
          <TabsTrigger value="transferi" className="gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Transferi</span>
          </TabsTrigger>
          <TabsTrigger value="barkodi" className="gap-1.5">
            <ScanBarcode className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Barkodi</span>
          </TabsTrigger>
          <TabsTrigger value="zone" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Zone</span>
          </TabsTrigger>
          <TabsTrigger value="picking" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Picking</span>
          </TabsTrigger>
          <TabsTrigger value="prijem" className="gap-1.5">
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prijem</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pregled"><StockOverview /></TabsContent>
        <TabsContent value="artikli">
          <ArtikliTab />
        </TabsContent>
        <TabsContent value="kretanja">
          <KretanjaTab />
        </TabsContent>
        <TabsContent value="lokacije"><LokacijeTab /></TabsContent>
        <TabsContent value="otpremnice">
          <OtpremniceTab />
        </TabsContent>
        <TabsContent value="cenovnici">
          <CenovniciTab />
        </TabsContent>
        <TabsContent value="lotovi"><LotoviTab /></TabsContent>
        <TabsContent value="inventura"><InventuraTab /></TabsContent>
        <TabsContent value="transferi"><TransferiTab /></TabsContent>
        <TabsContent value="barkodi"><BarkodiTab /></TabsContent>
        <TabsContent value="zone"><ZoneMapTab /></TabsContent>
        <TabsContent value="picking"><PickingTab /></TabsContent>
        <TabsContent value="prijem"><PrijemTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== STOCK OVERVIEW DASHBOARD ====================

interface WarehouseLocation {
  id: string; name: string; code: string; type: string; parentId: string | null; isActive: boolean
  parent?: { id: string; name: string; code: string } | null
  _count?: { children: number; stockMovements: number }
}


// ==================== LOKACIJE TAB ====================


// ==================== ARTIKLI TAB ====================


// ==================== KRETANJA ZALIHA TAB ====================


// ==================== OTPREMNICE TAB ====================


// ==================== CENOVNICI TAB ====================

