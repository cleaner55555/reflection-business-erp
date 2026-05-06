'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CashRegister as CashIcon,
  ShoppingCart,
  Package,
  Power,
  PowerOff,
  Plus,
  Minus,
  Trash2,
  Search,
  Printer,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  ScanBarcode,
} from 'lucide-react'

import type {
  PosProduct,
  CartItem,
  CashTransaction,
  Receipt,
  ProductCategory,
  PaymentMethod,
  PdvRate,
  TransactionType,
  TransactionFormData,
  ProductFormData,
  TransactionFilters,
  DailyStats,
  ShiftPaymentBreakdown,
} from './types'

import {
  INITIAL_PRODUCTS,
  PDV_RATES,
  PAYMENT_METHODS,
  PRODUCT_CATEGORIES,
  UNITS,
  TRANSACTION_TYPES,
  formatRsd,
  formatDateSr,
  formatDateTimeSr,
  calcPdv,
  generateReceiptNumber,
  buildReceiptLines,
  calculateDailyStats,
  emptyPayments,
  todayStr,
  getPaymentLabel,
  getCategoryLabel,
  getTypeLabel,
} from './data'

import { StatsCards, ReceiptPreview, EmptyState, ShiftSummaryCard } from './components'

// ================================================================
// MAIN EXPORTED COMPONENT
// ================================================================

import { BlagajnaContent } from './components'

export function Blagajna() {
  // ---- Data State ----
  const [products, setProducts] = useState<PosProduct[]>(INITIAL_PRODUCTS)
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [loading, setLoading] = useState(true)

  // ---- Cart State (Kasa tab) ----
  const [cart, setCart] = useState<CartItem[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gotovina')
  const [paidAmount, setPaidAmount] = useState('')

  // ---- Shift State ----
  const [shiftOpen, setShiftOpen] = useState(false)
  const [shiftOpenedAt, setShiftOpenedAt] = useState('')
  const [shiftCashier] = useState('Марко Петровић')
  const [openingCash, setOpeningCash] = useState('50000')
  const [shiftPayments, setShiftPayments] = useState<ShiftPaymentBreakdown>(emptyPayments())
  const [shiftSales, setShiftSales] = useState(0)
  const [shiftTxCount, setShiftTxCount] = useState(0)

  // ---- Receipt State ----
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // ---- Transaction Tab State ----
  const [txFilters, setTxFilters] = useState<TransactionFilters>({
    search: '',
    type: '',
    paymentMethod: '',
    dateFrom: todayStr(),
    dateTo: todayStr(),
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewTxDialog, setViewTxDialog] = useState<CashTransaction | null>(null)

  // ---- Products Tab State ----
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState<ProductCategory | ''>('')
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<PosProduct | null>(null)
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    barcode: '',
    price: '',
    pdvRate: 20,
    category: 'ostalo',
    stock: '0',
    unit: 'kom',
  })

  // ---- Shift Close Dialog State ----
  const [closeShiftDialog, setCloseShiftDialog] = useState(false)
  const [countedCash, setCountedCash] = useState('')
  const [countedCard, setCountedCard] = useState('')
  const [shiftNotes, setShiftNotes] = useState('')

  // ---- Transaction Dialog State ----
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<CashTransaction | null>(null)
  const [txForm, setTxForm] = useState<TransactionFormData>({
    type: 'izlaz',
    amount: '',
    description: '',
    partnerName: '',
    paymentMethod: 'gotovina',
    date: todayStr(),
  })

  // ---- Expanded cart view ----
  const [cartExpanded, setCartExpanded] = useState(true)

  // ================================================================
  // LOAD TRANSACTIONS FROM API
  // ================================================================
  return (
    <BlagajnaContent
      products={products}
      setProducts={setProducts}
      transactions={transactions}
      setTransactions={setTransactions}
      loading={loading}
      setLoading={setLoading}
      cart={cart}
      setCart={setCart}
      barcodeInput={barcodeInput}
      setBarcodeInput={setBarcodeInput}
      paying={paying}
      setPaying={setPaying}
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      paidAmount={paidAmount}
      setPaidAmount={setPaidAmount}
      shiftOpen={shiftOpen}
      setShiftOpen={setShiftOpen}
      shiftOpenedAt={shiftOpenedAt}
      setShiftOpenedAt={setShiftOpenedAt}
      openingCash={openingCash}
      setOpeningCash={setOpeningCash}
      shiftPayments={shiftPayments}
      setShiftPayments={setShiftPayments}
      shiftSales={shiftSales}
      setShiftSales={setShiftSales}
      shiftTxCount={shiftTxCount}
      setShiftTxCount={setShiftTxCount}
      currentReceipt={currentReceipt}
      setCurrentReceipt={setCurrentReceipt}
      showReceipt={showReceipt}
      setShowReceipt={setShowReceipt}
      txFilters={txFilters}
      setTxFilters={setTxFilters}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      viewTxDialog={viewTxDialog}
      setViewTxDialog={setViewTxDialog}
      productSearch={productSearch}
      setProductSearch={setProductSearch}
      productCategoryFilter={productCategoryFilter}
      setProductCategoryFilter={setProductCategoryFilter}
      productDialogOpen={productDialogOpen}
      setProductDialogOpen={setProductDialogOpen}
      editingProduct={editingProduct}
      setEditingProduct={setEditingProduct}
      productForm={productForm}
      setProductForm={setProductForm}
      closeShiftDialog={closeShiftDialog}
      setCloseShiftDialog={setCloseShiftDialog}
      countedCash={countedCash}
      setCountedCash={setCountedCash}
      countedCard={countedCard}
      setCountedCard={setCountedCard}
      shiftNotes={shiftNotes}
      setShiftNotes={setShiftNotes}
      txDialogOpen={txDialogOpen}
      setTxDialogOpen={setTxDialogOpen}
      editingTx={editingTx}
      setEditingTx={setEditingTx}
      txForm={txForm}
      setTxForm={setTxForm}
      cartExpanded={cartExpanded}
      setCartExpanded={setCartExpanded}
    />
  )
}
