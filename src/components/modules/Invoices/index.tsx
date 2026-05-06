'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowLeft,
  Printer,
  FileText,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  BarChart3,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  BookOpen,
  TrendingUp,
  DollarSign,
  FilePlus,
  CalendarClock,
  Receipt,
} from 'lucide-react'
import { toast } from 'sonner'
import { RecurringInvoices } from './RecurringInvoices'
import { RateOtplateTab, FiskalizacijaTab } from './InvoicesEnhanced'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { ReportDownloadButton } from '@/components/modules/ReportDownloadButton/components'
import { generateInvoicePDF, downloadPDF, type InvoiceData } from '@/lib/reports/pdf-generator'

// ==================== INTERFACES ====================

interface Partner {
  id: string
  name: string
}

interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  total: number
}

interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  sefStatus: string | null
  sefSentAt: string | null
  sefUuid: string | null
  partner: { id: string; name: string } | null
  items: InvoiceItem[]
}

interface Product {
  id: string
  name: string
  sellingPrice: number
}

interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
}

// Full invoice data for printing
interface FullInvoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  partner: {
    id: string
    name: string
    pib: string
    maticniBr: string | null
    address: string | null
    city: string | null
    zipCode: string | null
    phone: string | null
    email: string | null
    account: string | null
    bank: string | null
  } | null
  items: InvoiceItem[]
}

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

// ==================== SEF STATUS HELPERS ====================



// ==================== MAIN COMPONENT ====================

import { getSefStatusLabel, getSefStatusColor, InvoiceDashboard, FaktureTab, EFaktureTab, numberToSerbian, getDinarWord, getMillionWord, getParaWord } from './components'

export function Fakture() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('invoices.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('invoices.subtitle') || 'Управљање излазним и улазним фатурама'}
        </p>
      </div>

      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pregled</span></TabsTrigger>
          <TabsTrigger value="fakture" className="gap-1.5"><FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('efakture.tabInvoices')}</span></TabsTrigger>
          <TabsTrigger value="recurring" className="gap-1.5"><Clock className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('recurring.tabLabel')}</span></TabsTrigger>
          <TabsTrigger value="efakture" className="gap-1.5"><Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('efakture.tab')}</span></TabsTrigger>
          <TabsTrigger value="rate" className="gap-1.5"><CalendarClock className="h-3.5 w-3.5" /><span className="hidden sm:inline">Rate</span></TabsTrigger>
          <TabsTrigger value="fiskalizacija" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /><span className="hidden sm:inline">Fiskalizacija</span></TabsTrigger>
        </TabsList>

        <TabsContent value="pregled"><InvoiceDashboard /></TabsContent>
        <TabsContent value="fakture">
          <FaktureTab />
        </TabsContent>
        <TabsContent value="recurring">
          <RecurringInvoices />
        </TabsContent>
        <TabsContent value="efakture">
          <EFaktureTab />
        </TabsContent>
        <TabsContent value="rate"><RateOtplateTab /></TabsContent>
        <TabsContent value="fiskalizacija"><FiskalizacijaTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== INVOICE DASHBOARD ====================


// ==================== FAKTURE TAB (ORIGINAL) ====================


// ==================== EFAKTURE TAB ====================


// ==================== NUMBER TO SERBIAN WORDS ====================




