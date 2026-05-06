'use client'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
import {
import {
import {
import type {
import {
import { StatsCards, ReceiptPreview, EmptyState, ShiftSummaryCard } from './components'

interface BlagajnaContentProps {
  products: PosProduct[]
  setProducts: React.Dispatch<React.SetStateAction<PosProduct[]>>
  transactions: CashTransaction[]
  setTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>
  loading: any
  setLoading: React.Dispatch<React.SetStateAction<any>>
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  barcodeInput: any
  setBarcodeInput: React.Dispatch<React.SetStateAction<any>>
  paying: any
  setPaying: React.Dispatch<React.SetStateAction<any>>
  paymentMethod: PaymentMethod
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>
  paidAmount: any
  setPaidAmount: React.Dispatch<React.SetStateAction<any>>
  shiftOpen: any
  setShiftOpen: React.Dispatch<React.SetStateAction<any>>
  shiftOpenedAt: any
  setShiftOpenedAt: React.Dispatch<React.SetStateAction<any>>
  openingCash: any
  setOpeningCash: React.Dispatch<React.SetStateAction<any>>
  shiftPayments: ShiftPaymentBreakdown
  setShiftPayments: React.Dispatch<React.SetStateAction<ShiftPaymentBreakdown>>
  shiftSales: any
  setShiftSales: React.Dispatch<React.SetStateAction<any>>
  shiftTxCount: any
  setShiftTxCount: React.Dispatch<React.SetStateAction<any>>
  currentReceipt: Receipt | null
  setCurrentReceipt: React.Dispatch<React.SetStateAction<Receipt | null>>
  showReceipt: any
  setShowReceipt: React.Dispatch<React.SetStateAction<any>>
  txFilters: TransactionFilters
  setTxFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>
  showFilters: any
  setShowFilters: React.Dispatch<React.SetStateAction<any>>
  viewTxDialog: CashTransaction | null
  setViewTxDialog: React.Dispatch<React.SetStateAction<CashTransaction | null>>
  productSearch: any
  setProductSearch: React.Dispatch<React.SetStateAction<any>>
  productCategoryFilter: ProductCategory | ''
  setProductCategoryFilter: React.Dispatch<React.SetStateAction<ProductCategory | ''>>
  productDialogOpen: any
  setProductDialogOpen: React.Dispatch<React.SetStateAction<any>>
  editingProduct: PosProduct | null
  setEditingProduct: React.Dispatch<React.SetStateAction<PosProduct | null>>
  productForm: ProductFormData
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormData>>
  closeShiftDialog: any
  setCloseShiftDialog: React.Dispatch<React.SetStateAction<any>>
  countedCash: any
  setCountedCash: React.Dispatch<React.SetStateAction<any>>
  countedCard: any
  setCountedCard: React.Dispatch<React.SetStateAction<any>>
  shiftNotes: any
  setShiftNotes: React.Dispatch<React.SetStateAction<any>>
  txDialogOpen: any
  setTxDialogOpen: React.Dispatch<React.SetStateAction<any>>
  editingTx: CashTransaction | null
  setEditingTx: React.Dispatch<React.SetStateAction<CashTransaction | null>>
  txForm: TransactionFormData
  setTxForm: React.Dispatch<React.SetStateAction<TransactionFormData>>
  cartExpanded: any
  setCartExpanded: React.Dispatch<React.SetStateAction<any>>
}

export function BlagajnaContent({
  products, setProducts, transactions, setTransactions, loading, setLoading, cart, setCart, barcodeInput, setBarcodeInput, paying, setPaying, paymentMethod, setPaymentMethod, paidAmount, setPaidAmount, shiftOpen, setShiftOpen, shiftOpenedAt, setShiftOpenedAt, openingCash, setOpeningCash, shiftPayments, setShiftPayments, shiftSales, setShiftSales, shiftTxCount, setShiftTxCount, currentReceipt, setCurrentReceipt, showReceipt, setShowReceipt, txFilters, setTxFilters, showFilters, setShowFilters, viewTxDialog, setViewTxDialog, productSearch, setProductSearch, productCategoryFilter, setProductCategoryFilter, productDialogOpen, setProductDialogOpen, editingProduct, setEditingProduct, productForm, setProductForm, closeShiftDialog, setCloseShiftDialog, countedCash, setCountedCash, countedCard, setCountedCard, shiftNotes, setShiftNotes, txDialogOpen, setTxDialogOpen, editingTx, setEditingTx, txForm, setTxForm, cartExpanded, setCartExpanded
}: BlagajnaContentProps) {
const loadTransactions = useCallback(async () => {
  try {
    setLoading(true)
    const params = new URLSearchParams()
    if (txFilters.dateFrom) params.set('dateFrom', txFilters.dateFrom)
    if (txFilters.dateTo) params.set('dateTo', txFilters.dateTo)
    if (txFilters.type) params.set('type', txFilters.type)

    const res = await fetch(`/api/cash-register?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setTransactions(Array.isArray(data) ? data : [])
    }
  } catch (err) {
    console.error('Failed to load transactions:', err)
  } finally {
    setLoading(false)
  }
}, [txFilters.dateFrom, txFilters.dateTo, txFilters.type])

useEffect(() => {
  loadTransactions()
}, [loadTransactions])

// ================================================================
// DAILY STATS CALCULATION
// ================================================================
const dailyStats: DailyStats = useMemo(() => {
  const today = todayStr()
  const todayTx = transactions.filter(
    (t) => t.date && t.date.startsWith(today)
  )
  return calculateDailyStats(todayTx)
}, [transactions])

// ================================================================
// CART OPERATIONS
// ================================================================
const addToCart = useCallback(
  (product: PosProduct) => {
    if (product.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  },
  []
)

const updateCartQty = useCallback(
  (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          if (newQty > item.product.stock) return item
          return { ...item, quantity: newQty }
        })
        .filter(Boolean) as CartItem[]
    )
  },
  []
)

const removeFromCart = useCallback((productId: string) => {
  setCart((prev) => prev.filter((item) => item.product.id !== productId))
}, [])

const clearCart = useCallback(() => {
  setCart([])
  setPaidAmount('')
  setPaymentMethod('gotovina')
  setPaying(false)
}, [])

// ---- Barcode lookup ----
const handleBarcodeScan = useCallback(() => {
  if (!barcodeInput.trim()) return
  const found = products.find(
    (p) =>
      p.barcode === barcodeInput.trim() ||
      p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
  )
  if (found) {
    addToCart(found)
    setBarcodeInput('')
  }
}, [barcodeInput, products, addToCart])

// ---- Cart totals ----
const cartSubtotal = useMemo(
  () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [cart]
)
const cartPdvTotal = useMemo(() => {
  return cart.reduce((sum, item) => {
    const gross = item.product.price * item.quantity
    const { tax } = calcPdv(gross, item.product.pdvRate)
    return sum + tax
  }, 0)
}, [cart])
const cartTotal = cartSubtotal

const changeAmount = useMemo(() => {
  const paid = parseFloat(paidAmount) || 0
  return Math.max(0, paid - cartTotal)
}, [paidAmount, cartTotal])

// ================================================================
// CHECKOUT / PAYMENT
// ================================================================
const handleCheckout = useCallback(async () => {
  if (cart.length === 0) return
  const paid = parseFloat(paidAmount) || cartTotal
  if (paid < cartTotal) return

  const receiptLines = buildReceiptLines(cart)
  const receipt: Receipt = {
    id: `rcp-${Date.now()}`,
    number: generateReceiptNumber(),
    date: new Date().toISOString(),
    cashier: shiftCashier,
    paymentMethod,
    lines: receiptLines,
    subtotal: Math.round((cartTotal - cartPdvTotal) * 100) / 100,
    totalPdv: Math.round(cartPdvTotal * 100) / 100,
    total: Math.round(cartTotal * 100) / 100,
    paid: Math.round(paid * 100) / 100,
    change: Math.round((paid - cartTotal) * 100) / 100,
  }

  // Save transaction via API
  try {
    await fetch('/api/cash-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'izlaz',
        amount: cartTotal,
        description: `Рачун ${receipt.number} - ${cart.length} артикала`,
        paymentMethod,
        date: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error('Failed to save transaction:', err)
  }

  // Update shift state
  setShiftPayments((prev) => ({
    ...prev,
    [paymentMethod]: prev[paymentMethod] + cartTotal,
  }))
  setShiftSales((prev) => prev + cartTotal)
  setShiftTxCount((prev) => prev + 1)

  // Update product stock
  setProducts((prev) =>
    prev.map((p) => {
      const cartItem = cart.find((ci) => ci.product.id === p.id)
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) }
      }
      return p
    })
  )

  // Show receipt
  setCurrentReceipt(receipt)
  setShowReceipt(true)

  // Reset cart
  clearCart()
  loadTransactions()
}, [
  cart,
  cartTotal,
  cartPdvTotal,
  paymentMethod,
  paidAmount,
  shiftCashier,
  clearCart,
  loadTransactions,
])

// ================================================================
// SHIFT OPERATIONS
// ================================================================
const handleOpenShift = useCallback(() => {
  const oc = parseFloat(openingCash) || 0
  setShiftOpen(true)
  setShiftOpenedAt(new Date().toISOString())
  setShiftPayments({ ...emptyPayments(), gotovina: oc })
  setShiftSales(0)
  setShiftTxCount(0)
}, [openingCash])

const handleCloseShift = useCallback(async () => {
  const cc = parseFloat(countedCash) || 0
  const expectedCash = shiftPayments.gotovina
  const diff = Math.round((cc - expectedCash) * 100) / 100

  // Save closing record via API
  try {
    await fetch('/api/cash-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ulaz',
        amount: shiftSales,
        description: `Затварање смее - ${shiftTxCount} рачуна | Диференца: ${formatRsd(diff)}${shiftNotes ? ' | ' + shiftNotes : ''}`,
        paymentMethod: 'gotovina',
        date: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error('Failed to save shift close:', err)
  }

  setShiftOpen(false)
  setCloseShiftDialog(false)
  setCountedCash('')
  setCountedCard('')
  setShiftNotes('')
  loadTransactions()
}, [shiftSales, shiftTxCount, shiftPayments, countedCash, shiftNotes, loadTransactions])

// ================================================================
// TRANSACTION CRUD
// ================================================================
const handleSaveTransaction = useCallback(async () => {
  if (!txForm.amount || parseFloat(txForm.amount) <= 0 || !txForm.description) return

  try {
    if (editingTx) {
      await fetch(`/api/cash-register/${editingTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txForm),
      })
    } else {
      await fetch('/api/cash-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...txForm,
          amount: parseFloat(txForm.amount),
        }),
      })
    }
    setTxDialogOpen(false)
    setEditingTx(null)
    setTxForm({
      type: 'izlaz',
      amount: '',
      description: '',
      partnerName: '',
      paymentMethod: 'gotovina',
      date: todayStr(),
    })
    loadTransactions()
  } catch (err) {
    console.error('Failed to save transaction:', err)
  }
}, [txForm, editingTx, loadTransactions])

const handleDeleteTransaction = useCallback(
  async (id: string) => {
    try {
      await fetch(`/api/cash-register/${id}`, { method: 'DELETE' })
      loadTransactions()
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  },
  [loadTransactions]
)

const openEditTx = useCallback((tx: CashTransaction) => {
  setEditingTx(tx)
  setTxForm({
    type: tx.type,
    amount: String(tx.amount),
    description: tx.description,
    partnerName: tx.partnerName || '',
    paymentMethod: tx.paymentMethod as PaymentMethod,
    date: tx.date ? tx.date.split('T')[0] : todayStr(),
  })
  setTxDialogOpen(true)
}, [])

// ================================================================
// PRODUCT CRUD
// ================================================================
const handleSaveProduct = useCallback(() => {
  if (!productForm.name || !productForm.price) return
  if (editingProduct) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: productForm.name,
              barcode: productForm.barcode,
              price: parseFloat(productForm.price) || 0,
              pdvRate: productForm.pdvRate,
              category: productForm.category,
              stock: parseInt(productForm.stock) || 0,
              unit: productForm.unit,
            }
          : p
      )
    )
  } else {
    const newProduct: PosProduct = {
      id: `p-${Date.now()}`,
      name: productForm.name,
      barcode: productForm.barcode,
      price: parseFloat(productForm.price) || 0,
      pdvRate: productForm.pdvRate,
      category: productForm.category,
      stock: parseInt(productForm.stock) || 0,
      unit: productForm.unit,
      isActive: true,
    }
    setProducts((prev) => [newProduct, ...prev])
  }
  setProductDialogOpen(false)
  setEditingProduct(null)
  setProductForm({
    name: '',
    barcode: '',
    price: '',
    pdvRate: 20,
    category: 'ostalo',
    stock: '0',
    unit: 'kom',
  })
}, [productForm, editingProduct])

const openEditProduct = useCallback((product: PosProduct) => {
  setEditingProduct(product)
  setProductForm({
    name: product.name,
    barcode: product.barcode,
    price: String(product.price),
    pdvRate: product.pdvRate,
    category: product.category,
    stock: String(product.stock),
    unit: product.unit,
  })
  setProductDialogOpen(true)
}, [])

const handleDeleteProduct = useCallback((productId: string) => {
  setProducts((prev) => prev.filter((p) => p.id !== productId))
}, [])

// ================================================================
// FILTERED DATA
// ================================================================
const filteredTransactions = useMemo(() => {
  let result = [...transactions]

  if (txFilters.search) {
    const q = txFilters.search.toLowerCase()
    result = result.filter(
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        t.partnerName?.toLowerCase().includes(q)
    )
  }
  if (txFilters.paymentMethod) {
    result = result.filter((t) => t.paymentMethod === txFilters.paymentMethod)
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}, [transactions, txFilters])

const filteredProducts = useMemo(() => {
  let result = products.filter((p) => p.isActive)
  if (productSearch) {
    const q = productSearch.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
    )
  }
  if (productCategoryFilter) {
    result = result.filter((p) => p.category === productCategoryFilter)
  }
  return result
}, [products, productSearch, productCategoryFilter])

// ================================================================
// PAYMENT METHOD ICON HELPER
// ================================================================
const PaymentIcon = ({ method }: { method: string }) => {
  switch (method) {
    case 'gotovina':
      return <Banknote className="h-3.5 w-3.5" />
    case 'kartica':
      return <CreditCard className="h-3.5 w-3.5" />
    case 'tanjava':
      return <Smartphone className="h-3.5 w-3.5" />
    case 'virman':
      return <Building2 className="h-3.5 w-3.5" />
    default:
      return <CashIcon className="h-3.5 w-3.5" />
  }
}

// ================================================================
// RENDER: MAIN LAYOUT
// ================================================================
return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CashIcon className="h-6 w-6" />
          Каса / Благајна
        </h1>
        <p className="text-sm text-muted-foreground">
          POS систем са ПДВ обрачуном за РСД валуту
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!shiftOpen ? (
          <Button onClick={handleOpenShift} className="gap-2">
            <Power className="h-4 w-4" />
            Отвори смееу
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setCloseShiftDialog(true)}
            className="gap-2"
          >
            <PowerOff className="h-4 w-4" />
            Затвори смееу
          </Button>
        )}
      </div>
    </div>

    {/* Stats Cards */}
    <StatsCards stats={dailyStats} />

    {/* Shift Summary (when open) */}
    {shiftOpen && (
      <ShiftSummaryCard
        isOpen={shiftOpen}
        cashier={shiftCashier}
        openedAt={shiftOpenedAt}
        totalSales={shiftSales}
        transactionCount={shiftTxCount}
        payments={shiftPayments}
      />
    )}

    {/* Tabs */}
    <Tabs defaultValue="kasa" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="kasa" className="gap-1.5 text-xs sm:text-sm">
          <ShoppingCart className="h-3.5 w-3.5 hidden sm:inline" />
          Каса
        </TabsTrigger>
        <TabsTrigger value="transakcije" className="gap-1.5 text-xs sm:text-sm">
          <Receipt className="h-3.5 w-3.5 hidden sm:inline" />
          Трансакције
        </TabsTrigger>
        <TabsTrigger value="artikli" className="gap-1.5 text-xs sm:text-sm">
          <Package className="h-3.5 w-3.5 hidden sm:inline" />
          Артикли
        </TabsTrigger>
        <TabsTrigger value="zatvaranje" className="gap-1.5 text-xs sm:text-sm">
          <Calculator className="h-3.5 w-3.5 hidden sm:inline" />
          Затварање
        </TabsTrigger>
      </TabsList>

      {/* ==================== TAB: KASA (POS) ==================== */}
      <TabsContent value="kasa">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Product Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Barcode Scanner */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ScanBarcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Скенирај баркод или унеси назив..."
                      className="pl-9"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBarcodeScan()
                      }}
                      disabled={!shiftOpen}
                    />
                  </div>
                  <Button
                    onClick={handleBarcodeScan}
                    variant="outline"
                    disabled={!shiftOpen || !barcodeInput.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Grid */}
            {!shiftOpen ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Power className="h-12 w-12" />}
                    title="Смеа је затворена"
                    description="Да бисте започели продају, прво отворите смееу дугметом изнад."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`relative rounded-lg border p-3 text-left transition-all hover:shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      cart.find((c) => c.product.id === product.id)
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    {product.stock <= 3 && product.stock > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1.5 -right-1.5 text-[9px] px-1 py-0"
                      >
                        {product.stock}
                      </Badge>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Нема на залихи
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-medium leading-tight line-clamp-2 mb-1">
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatRsd(product.price)}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1">
                        {product.pdvRate}%
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {getCategoryLabel(product.category)} · {product.stock} {product.unit}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Panel */}
          <div className="space-y-3">
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Корпа
                    {cart.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {cart.reduce((s, c) => s + c.quantity, 0)}
                      </Badge>
                    )}
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart} className="h-7 text-xs text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Поништи
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Корпа је празна
                  </div>
                ) : (
                  <>
                    <ScrollArea className={`max-h-[${cartExpanded ? '60' : '36'}vh]`}>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-start gap-2 rounded-md border p-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {item.product.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatRsd(item.product.price)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateCartQty(item.product.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-xs font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateCartQty(item.product.id, 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs font-semibold w-20 text-right shrink-0">
                              {formatRsd(item.product.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator className="my-3" />

                    {/* Totals */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>ПДВ:</span>
                        <span>{formatRsd(cartPdvTotal)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Укупно:</span>
                        <span className="text-emerald-600">{formatRsd(cartTotal)}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Payment Section */}
                    {paying ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {PAYMENT_METHODS.map((pm) => (
                            <button
                              key={pm.value}
                              onClick={() => setPaymentMethod(pm.value)}
                              className={`flex items-center gap-2 rounded-md border p-2 text-xs transition-colors cursor-pointer ${
                                paymentMethod === pm.value
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <PaymentIcon method={pm.value} />
                              {pm.label}
                            </button>
                          ))}
                        </div>

                        <div className="grid gap-2">
                          <Label className="text-xs">Унешени износ:</Label>
                          <Input
                            type="number"
                            placeholder={String(cartTotal)}
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                          />
                        </div>

                        {parseFloat(paidAmount) >= cartTotal && (
                          <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-950 rounded-md p-2">
                            <span>Кусур:</span>
                            <span className="font-bold text-emerald-600">
                              {formatRsd(changeAmount)}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setPaying(false)}
                          >
                            Назад
                          </Button>
                          <Button
                            className="flex-1 gap-1"
                            onClick={handleCheckout}
                            disabled={parseFloat(paidAmount) < cartTotal}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Потврди
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        onClick={() => {
                          setPaying(true)
                          setPaidAmount('')
                        }}
                      >
                        <Banknote className="h-5 w-5" />
                        Наплати {formatRsd(cartTotal)}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* ==================== TAB: TRANSAKCIJE ==================== */}
      <TabsContent value="transakcije">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base">Трансакције</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[180px] sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Претрага..."
                    className="pl-8 h-9"
                    value={txFilters.search}
                    onChange={(e) =>
                      setTxFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Филтери
                  {showFilters ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTx(null)
                    setTxForm({
                      type: 'izlaz',
                      amount: '',
                      description: '',
                      partnerName: '',
                      paymentMethod: 'gotovina',
                      date: todayStr(),
                    })
                    setTxDialogOpen(true)
                  }}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                      Нова трансакција
                </Button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                <div className="space-y-1">
                  <Label className="text-xs">Тип</Label>
                  <Select
                    value={txFilters.type}
                    onValueChange={(val) =>
                      setTxFilters((prev) => ({ ...prev, type: val as TransactionType | '' }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Сви" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Сви</SelectItem>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Плаћање</Label>
                  <Select
                    value={txFilters.paymentMethod}
                    onValueChange={(val) =>
                      setTxFilters((prev) => ({ ...prev, paymentMethod: val as PaymentMethod | '' }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Сва" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Сва</SelectItem>
                      {PAYMENT_METHODS.map((pm) => (
                        <SelectItem key={pm.value} value={pm.value}>
                          {pm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Од датума</Label>
                  <Input
                    type="date"
                    className="h-9"
                    value={txFilters.dateFrom}
                    onChange={(e) =>
                      setTxFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">До датума</Label>
                  <Input
                    type="date"
                    className="h-9"
                    value={txFilters.dateTo}
                    onChange={(e) =>
                      setTxFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <EmptyState
                icon={<Receipt className="h-12 w-12" />}
                title="Нема трансакција"
                description="За изабрани период не постоје трансакције. Промените филтере или додајте нову трансакцију."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Датум</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Опис</TableHead>
                      <TableHead className="hidden sm:table-cell">Плаћање</TableHead>
                      <TableHead className="hidden md:table-cell">Партнер</TableHead>
                      <TableHead className="text-right">Износ</TableHead>
                      <TableHead className="text-right">Акције</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
                      const txType = TRANSACTION_TYPES.find(
                        (t) => t.value === tx.type
                      )
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDateTimeSr(tx.date)}
                          </TableCell>
                          <TableCell>
                            <Badge className={txType?.color || ''}>
                              {txType?.label || tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs">
                            {tx.description}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1.5 text-xs">
                              <PaymentIcon method={tx.paymentMethod} />
                              {getPaymentLabel(tx.paymentMethod as PaymentMethod)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs">
                            {tx.partnerName || '—'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs">
                            <span
                              className={
                                tx.type === 'ulaz'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {tx.type === 'ulaz' ? '+' : '-'}
                              {formatRsd(tx.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setViewTxDialog(tx)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditTx(tx)}
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteTransaction(tx.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================== TAB: ARTIKLI ==================== */}
      <TabsContent value="artikli">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base">Артикли ({products.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-[150px] sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Претрага артикала..."
                    className="pl-8 h-9"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={productCategoryFilter}
                  onValueChange={(val) =>
                    setProductCategoryFilter(val as ProductCategory | '')
                  }
                >
                  <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue placeholder="Категорија" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Све</SelectItem>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingProduct(null)
                    setProductForm({
                      name: '',
                      barcode: '',
                      price: '',
                      pdvRate: 20,
                      category: 'ostalo',
                      stock: '0',
                      unit: 'kom',
                    })
                    setProductDialogOpen(true)
                  }}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Додај артикал
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title="Нема артикала"
                description="Нема артикала који одговарају филтерима."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Назив</TableHead>
                      <TableHead className="hidden sm:table-cell">Баркод</TableHead>
                      <TableHead className="hidden md:table-cell">Категорија</TableHead>
                      <TableHead className="text-right">Цена</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">ПДВ</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Залиха</TableHead>
                      <TableHead className="text-right">Акције</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium text-xs">
                          {product.name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs font-mono">
                          {product.barcode || '—'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(product.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs">
                          {formatRsd(product.price)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <Badge variant="secondary" className="text-xs">
                            {product.pdvRate}%
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`hidden sm:table-cell text-right text-xs font-medium ${
                            product.stock <= 5
                              ? 'text-red-600'
                              : product.stock <= 15
                              ? 'text-amber-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock} {product.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditProduct(product)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================== TAB: ZATVARANJE ==================== */}
      <TabsContent value="zatvaranje">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Shift Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Power className="h-4 w-4" />
                Статус смее
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shiftOpen ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      ● Отворена
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      од {formatDateTimeSr(shiftOpenedAt)}
                    </span>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Касир</p>
                      <p className="font-medium">{shiftCashier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Број рачуна</p>
                      <p className="font-medium">{shiftTxCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Укупна продаја</p>
                      <p className="font-bold text-emerald-600">
                        {formatRsd(shiftSales)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Просек по рачуну</p>
                      <p className="font-medium">
                        {formatRsd(
                          shiftTxCount > 0
                            ? Math.round((shiftSales / shiftTxCount) * 100) / 100
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Плаћања по методу
                    </p>
                    {PAYMENT_METHODS.map((pm) => (
                      <div key={pm.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <PaymentIcon method={pm.value} />
                          {pm.label}
                        </div>
                        <span className="font-medium text-xs">
                          {formatRsd(shiftPayments[pm.value])}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => setCloseShiftDialog(true)}
                  >
                    <PowerOff className="h-4 w-4" />
                    Затвори смееу
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                      ● Затворена
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Касир</Label>
                      <Input value={shiftCashier} disabled className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Почетна готовина (RSD)</Label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={openingCash}
                        onChange={(e) => setOpeningCash(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button className="w-full gap-2" onClick={handleOpenShift}>
                    <Power className="h-4 w-4" />
                    Отвори смееу
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Дневни преглед
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatRsd(dailyStats.dnevniPrihod)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Дневни приhod</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{dailyStats.brojRacuna}</p>
                    <p className="text-xs text-muted-foreground mt-1">Број рачуна</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {formatRsd(dailyStats.prosek)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Просек</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {formatRsd(dailyStats.povrat)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Поврати</p>
                  </div>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium uppercase tracking-wider text-foreground mb-2">
                    ПДВ обрачун
                  </p>
                  <div className="flex justify-between">
                    <span>Ставке са ПДВ 10%:</span>
                    <span className="font-medium">{formatRsd(dailyStats.pdv10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ставке са ПДВ 20%:</span>
                    <span className="font-medium">{formatRsd(dailyStats.pdv20)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Укупан ПДВ:</span>
                    <span>{formatRsd(dailyStats.pdv10 + dailyStats.pdv20)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    {/* ==================== DIALOG: NEW/EDIT TRANSACTION ==================== */}
    <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTx ? 'Уреди трансакцију' : 'Нова трансакција'}
          </DialogTitle>
          <DialogDescription>
            {editingTx
              ? 'Измените податке о трансакцији'
              : 'Унесите податке за нову трансакцију'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Тип</Label>
              <Select
                value={txForm.type}
                onValueChange={(val) =>
                  setTxForm((prev) => ({ ...prev, type: val as TransactionType }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Плаћање</Label>
              <Select
                value={txForm.paymentMethod}
                onValueChange={(val) =>
                  setTxForm((prev) => ({ ...prev, paymentMethod: val as PaymentMethod }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Износ (RSD)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={txForm.amount}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, amount: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Опис</Label>
            <Input
              placeholder="Опис трансакције..."
              value={txForm.description}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Партнер (име)</Label>
            <Input
              placeholder="Име партнера..."
              value={txForm.partnerName}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, partnerName: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Датум</Label>
            <Input
              type="date"
              value={txForm.date}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTxDialogOpen(false)}>
            Откажи
          </Button>
          <Button onClick={handleSaveTransaction} disabled={!txForm.amount || !txForm.description}>
            Сачувај
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ==================== DIALOG: NEW/EDIT PRODUCT ==================== */}
    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Уреди артикал' : 'Нови артикал'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? 'Измените податке о артиклу'
              : 'Унесите податке за нови артикал'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs">Назив артикла *</Label>
            <Input
              placeholder="Унесите назив..."
              value={productForm.name}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Баркод</Label>
              <Input
                placeholder="8606101000"
                value={productForm.barcode}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, barcode: e.target.value }))
                }
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Категорија</Label>
              <Select
                value={productForm.category}
                onValueChange={(val) =>
                  setProductForm((prev) => ({
                    ...prev,
                    category: val as ProductCategory,
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Цена (RSD) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ПДВ стопа</Label>
              <Select
                value={String(productForm.pdvRate)}
                onValueChange={(val) =>
                  setProductForm((prev) => ({
                    ...prev,
                    pdvRate: parseInt(val) as PdvRate,
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PDV_RATES.map((r) => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Јединица</Label>
              <Select
                value={productForm.unit}
                onValueChange={(val) =>
                  setProductForm((prev) => ({ ...prev, unit: val }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Залиха</Label>
            <Input
              type="number"
              placeholder="0"
              value={productForm.stock}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, stock: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
            Откажи
          </Button>
          <Button
            onClick={handleSaveProduct}
            disabled={!productForm.name || !productForm.price}
          >
            Сачувај
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ==================== DIALOG: VIEW TRANSACTION DETAIL ==================== */}
    <Dialog open={!!viewTxDialog} onOpenChange={() => setViewTxDialog(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Детаљи трансакције</DialogTitle>
        </DialogHeader>
        {viewTxDialog && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Датум</p>
                <p className="font-medium">{formatDateTimeSr(viewTxDialog.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Тип</p>
                <Badge
                  className={
                    TRANSACTION_TYPES.find((t) => t.value === viewTxDialog.type)
                      ?.color || ''
                  }
                >
                  {getTypeLabel(viewTxDialog.type as TransactionType)}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Износ</p>
                <p
                  className={`font-bold text-lg ${
                    viewTxDialog.type === 'ulaz'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatRsd(viewTxDialog.amount)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Плаћање</p>
                <div className="flex items-center gap-1.5">
                  <PaymentIcon method={viewTxDialog.paymentMethod} />
                  {getPaymentLabel(viewTxDialog.paymentMethod as PaymentMethod)}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Опис</p>
                <p className="font-medium">{viewTxDialog.description}</p>
              </div>
              {viewTxDialog.partnerName && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Партнер</p>
                  <p className="font-medium">{viewTxDialog.partnerName}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewTxDialog(null)}>
            Затвори
          </Button>
          {viewTxDialog && (
            <Button variant="outline" onClick={() => {
              openEditTx(viewTxDialog)
              setViewTxDialog(null)
            }}>
              <Printer className="h-4 w-4 mr-1" />
              Уреди
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ==================== DIALOG: CLOSE SHIFT ==================== */}
    <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Затварање смее
          </DialogTitle>
          <DialogDescription>
            Пребројте готовину пре затварања смее. Упоредите са очекиваним износом.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Expected amounts */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
            <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
              Очекивани износи
            </p>
            <div className="flex justify-between">
              <span>Готовина:</span>
              <span className="font-bold">{formatRsd(shiftPayments.gotovina)}</span>
            </div>
            <div className="flex justify-between">
              <span>Картична плаћања:</span>
              <span className="font-bold">{formatRsd(shiftPayments.kartica)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Укупна продаја:</span>
              <span className="font-bold text-emerald-600">
                {formatRsd(shiftSales)}
              </span>
            </div>
          </div>

          {/* Actual count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Бројана готовина (RSD)</Label>
              <Input
                type="number"
                placeholder={String(shiftPayments.gotovina)}
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Бројана картица (RSD)</Label>
              <Input
                type="number"
                placeholder={String(shiftPayments.kartica)}
                value={countedCard}
                onChange={(e) => setCountedCard(e.target.value)}
              />
            </div>
          </div>

          {/* Difference calculation */}
          {countedCash && (
            <div className={`rounded-lg border p-3 ${
              Math.abs(parseFloat(countedCash) - shiftPayments.gotovina) < 0.01
                ? 'bg-green-50 dark:bg-green-950 border-green-200'
                : 'bg-amber-50 dark:bg-amber-950 border-amber-200'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span>Диференца (готовина):</span>
                <span className={`font-bold ${
                  Math.abs(parseFloat(countedCash) - shiftPayments.gotovina) < 0.01
                    ? 'text-green-600'
                    : 'text-amber-600'
                }`}>
                  {formatRsd(
                    Math.round(
                      (parseFloat(countedCash) - shiftPayments.gotovina) * 100
                    ) / 100
                  )}
                </span>
              </div>
              {Math.abs(parseFloat(countedCash) - shiftPayments.gotovina) < 0.01 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Износи се поклапају
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Напомене</Label>
            <Input
              placeholder="Опционалне напомене..."
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCloseShiftDialog(false)}>
            Откажи
          </Button>
          <Button variant="destructive" onClick={handleCloseShift}>
            <PowerOff className="h-4 w-4 mr-1" />
            Потврди затварање
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ==================== RECEIPT PREVIEW ==================== */}
    <ReceiptPreview
      receipt={currentReceipt}
      open={showReceipt}
      onClose={() => setShowReceipt(false)}
    />
  </div>
)
}


'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  Receipt,
  BarChart3,
  RotateCcw,
  CircleDollarSign,
} from 'lucide-react'
import type { DailyStats, Receipt as ReceiptType } from './types'
import { formatRsd, formatDateTimeSr, COMPANY_INFO } from './data'

// ================================================================
// STATS CARDS ROW
// ================================================================

interface StatsCardsProps {
  stats: DailyStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Дневни приhod',
      value: formatRsd(stats.dnevniPrihod),
      description: 'укупна продаја данас',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    {
      title: 'Број рачуна',
      value: String(stats.brojRacuna),
      description: 'издато данас',
      icon: Receipt,
      color: 'text-blue-600',
    },
    {
      title: 'Просек по рачуну',
      value: formatRsd(stats.prosek),
      description: 'просечна вредност',
      icon: BarChart3,
      color: 'text-amber-600',
    },
    {
      title: 'Поврат / Сторно',
      value: formatRsd(stats.povrat),
      description: 'укупно поврата',
      icon: RotateCcw,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ================================================================
// RECEIPT PREVIEW (Modal/Print)
// ================================================================

interface ReceiptPreviewProps {
  receipt: ReceiptType | null
  open: boolean
  onClose: () => void
}

export function ReceiptPreview({ receipt, open, onClose }: ReceiptPreviewProps) {
  if (!receipt || !open) return null

  const pdvLines = receipt.lines.reduce<Record<number, { base: number; tax: number }>>(
    (acc, line) => {
      if (!acc[line.pdvRate]) acc[line.pdvRate] = { base: 0, tax: 0 }
      acc[line.pdvRate].base += line.baseAmount
      acc[line.pdvRate].tax += line.pdvAmount
      return acc
    },
    {}
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white text-black w-full max-w-sm mx-auto rounded-lg shadow-xl font-mono text-xs"
        id="receipt-print"
      >
        {/* Header */}
        <div className="text-center pt-6 pb-2 px-4">
          <p className="font-bold text-sm">{COMPANY_INFO.name}</p>
          <p>{COMPANY_INFO.address}</p>
          <p>ПИБ: {COMPANY_INFO.pib} | МБ: {COMPANY_INFO.maticniBr}</p>
          <p>ЖР: {COMPANY_INFO.account}</p>
          <p className="text-[10px] text-gray-500">{COMPANY_INFO.bank}</p>
        </div>

        <Separator className="mx-4" />

        {/* Receipt meta */}
        <div className="px-4 py-2 space-y-0.5">
          <div className="flex justify-between">
            <span>Рачун бр:</span>
            <span className="font-bold">{receipt.number}</span>
          </div>
          <div className="flex justify-between">
            <span>Датум:</span>
            <span>{formatDateTimeSr(receipt.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Касир:</span>
            <span>{receipt.cashier}</span>
          </div>
          <div className="flex justify-between">
            <span>Плаћање:</span>
            <span className="uppercase">{receipt.paymentMethod}</span>
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Items */}
        <div className="px-4 py-2">
          <div className="grid grid-cols-12 gap-1 font-bold text-[10px] border-b border-dashed border-gray-300 pb-1 mb-1">
            <span className="col-span-6">Артикал</span>
            <span className="col-span-2 text-right">Кол.</span>
            <span className="col-span-2 text-right">Цена</span>
            <span className="col-span-2 text-right">Износ</span>
          </div>
          {receipt.lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-gray-200">
              <span className="col-span-6 truncate" title={line.productName}>
                {line.productName}
              </span>
              <span className="col-span-2 text-right">{line.quantity}</span>
              <span className="col-span-2 text-right">{line.unitPrice.toFixed(2)}</span>
              <span className="col-span-2 text-right">{line.totalAmount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <Separator className="mx-4" />

        {/* PDV breakdown */}
        <div className="px-4 py-2">
          <p className="font-bold mb-1 text-[10px]">ПДВ обрачун:</p>
          {Object.entries(pdvLines).map(([rate, vals]) => (
            <div key={rate} className="flex justify-between text-[10px]">
              <span>ПДВ {rate}%</span>
              <span>
                {vals.base.toFixed(2)} + {vals.tax.toFixed(2)} ={' '}
                {(vals.base + vals.tax).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="mx-4" />

        {/* Totals */}
        <div className="px-4 py-2 space-y-1">
          <div className="flex justify-between">
            <span>Укупно:</span>
            <span className="font-bold">{formatRsd(receipt.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Плаћено:</span>
            <span>{formatRsd(receipt.paid)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1">
            <span>Кусур:</span>
            <span>{formatRsd(receipt.change)}</span>
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Footer */}
        <div className="text-center px-4 py-4 space-y-1">
          <p className="text-[10px] text-gray-500">
            Фискални рачун је издат електронски
          </p>
          <p className="text-[10px] text-gray-500">
            Хвала на куповини!
          </p>
          <p className="text-[9px] text-gray-400 mt-2">
            =================================
          </p>
        </div>

        {/* Close button */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded border border-gray-300 text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Затвори
          </button>
          <button
            onClick={() => {
              window.print()
            }}
            className="flex-1 py-2 rounded bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Штампај
          </button>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// EMPTY STATE COMPONENT
// ================================================================

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {action}
    </div>
  )
}

// ================================================================
// SHIFT SUMMARY CARD
// ================================================================

interface ShiftSummaryCardProps {
  isOpen: boolean
  cashier: string
  openedAt: string
  totalSales: number
  transactionCount: number
  payments: {
    gotovina: number
    kartica: number
    tanjava: number
    virman: number
  }
}

export function ShiftSummaryCard({
  isOpen,
  cashier,
  openedAt,
  totalSales,
  transactionCount,
  payments,
}: ShiftSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Статус смее</CardTitle>
          <Badge
            className={
              isOpen
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
            }
          >
            {isOpen ? '● Отворена' : '● Затворена'}
          </Badge>
        </div>
        <CardDescription>
          Касир: {cashier} | Отворена: {formatDateTimeSr(openedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Готовина</p>
              <p className="font-semibold">{formatRsd(payments.gotovina)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Кирица</p>
              <p className="font-semibold">{formatRsd(payments.kartica)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Танрава</p>
              <p className="font-semibold">{formatRsd(payments.tanjava)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Вирман</p>
              <p className="font-semibold">{formatRsd(payments.virman)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Рачуна</p>
              <p className="font-semibold">{transactionCount}</p>
            </div>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Укупна продаја:</span>
          <span className="text-lg font-bold text-emerald-600">
            {formatRsd(totalSales)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
