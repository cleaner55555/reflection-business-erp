'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Receipt,
  Printer,
  ChevronLeft,
  Clock,
  Package,
  TrendingUp,
  BarChart3,
  X,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Calculator,
} from 'lucide-react'

interface POSProduct {
  id: string
  name: string
  sku: string
  barcode?: string
  sellingPrice: number
  currentStock: number
  category?: string
  unit: string
}

interface CartItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  maxStock: number
}

interface POSShift {
  id: string
  number: number
  cashierName: string
  status: string
  openingBalance: number
  closingBalance?: number
  expectedCash?: number
  difference?: number
  openedAt: string
  closedAt?: string
  orders?: { totalAmount: number; paymentMethod: string; status: string }[]
  _count?: { orders: number }
}

interface POSOrder {
  id: string
  orderNumber: string
  totalAmount: number
  paymentMethod: string
  status: string
  itemsCount: number
  createdAt: string
  shift?: { number: number; cashierName: string }
}

// ============ MAIN COMPONENT ============

export function Maloprodaja() {
  const { activeCompanyId } = useAppStore()
  const [activeTab, setActiveTab] = useState('pos')

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pos">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Kasa
          </TabsTrigger>
          <TabsTrigger value="smene">
            <Clock className="h-4 w-4 mr-1.5" />
            Smene
          </TabsTrigger>
          <TabsTrigger value="izvestaji">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Izveštaji
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <POSTerminal companyId={activeCompanyId} />
        </TabsContent>
        <TabsContent value="smene">
          <ShiftManager companyId={activeCompanyId} />
        </TabsContent>
        <TabsContent value="izvestaji">
          <POSReports companyId={activeCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============ POS TERMINAL ============

function POSTerminal({ companyId }: { companyId: string | null }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<POSProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeShift, setActiveShift] = useState<POSShift | null>(null)
  const [lastOrderNumber, setLastOrderNumber] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('gotovina')
  const [paidAmount, setPaidAmount] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState<POSOrder | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const barcodeBuffer = useRef('')
  const barcodeTimer = useRef<NodeJS.Timeout | null>(null)

  // Load products and active shift
  useEffect(() => {
    if (!companyId) return
    fetch(`/api/products?companyId=${companyId}&limit=500`)
      .then(r => r.json())
      .then((data: POSProduct[]) => setProducts(data.filter((p: POSProduct) => p.isActive)))
      .catch(() => {})

    fetch(`/api/pos/shifts?status=otvorena`, { headers: { 'x-company-id': companyId } })
      .then(r => r.json())
      .then((data: POSShift[]) => setActiveShift(data[0] || null))
      .catch(() => {})
  }, [companyId])

  // Barcode scanner detection (rapid typing)
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)

    if (val.length > 3) {
      barcodeBuffer.current = val
      if (barcodeTimer.current) clearTimeout(barcodeTimer.current)
      barcodeTimer.current = setTimeout(() => {
        // Check if it's a barcode match
        const match = products.find(p => p.barcode === barcodeBuffer.current || p.sku === barcodeBuffer.current)
        if (match) {
          addToCart(match)
          setSearchTerm('')
          barcodeBuffer.current = ''
        }
      }, 100)
    }
  }, [products])

  const categories = [...new Set(products.filter(p => p.category).map(p => p.category!))]
  const filtered = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = !selectedCategory || p.category === selectedCategory
    return matchSearch && matchCategory && p.currentStock > 0
  })

  const addToCart = (product: POSProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discountPct: 0,
        taxRate: 20,
        maxStock: product.currentStock,
      }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i
      const newQty = i.quantity + delta
      if (newQty <= 0) return i
      if (newQty > i.maxStock) return i
      return { ...i, quantity: newQty }
    }))
  }

  const updateDiscount = (productId: string, discount: number) => {
    setCart(prev => prev.map(i =>
      i.productId === productId ? { ...i, discountPct: Math.max(0, Math.min(100, discount)) } : i
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const subtotal = cart.reduce((s, i) => {
    const lineTotal = i.quantity * i.unitPrice * (1 - i.discountPct / 100)
    return s + lineTotal / (1 + i.taxRate / 100)
  }, 0)

  const taxTotal = cart.reduce((s, i) => {
    const lineTotal = i.quantity * i.unitPrice * (1 - i.discountPct / 100)
    return s + lineTotal - lineTotal / (1 + i.taxRate / 100)
  }, 0)

  const total = cart.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discountPct / 100), 0)
  const itemsCount = cart.reduce((s, i) => s + i.quantity, 0)

  const openPayment = () => {
    if (cart.length === 0) return
    setPaidAmount(total.toFixed(2))
    setShowPayment(true)
  }

  const processPayment = async () => {
    if (!activeShift || !companyId) return
    const paid = parseFloat(paidAmount) || 0

    try {
      const res = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-company-id': companyId },
        body: JSON.stringify({
          shiftId: activeShift.id,
          paymentMethod,
          lines: cart.map(i => ({
            productId: i.productId,
            productName: i.productName,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discountPct: i.discountPct,
            taxRate: i.taxRate,
            purchasePrice: 0,
          })),
        }),
      })

      if (res.ok) {
        const order = await res.json()
        setLastOrderNumber(order.orderNumber)
        setReceiptOrder(order)
        setCart([])
        setShowPayment(false)
        setShowReceipt(true)
      }
    } catch { /* handle error */ }
  }

  const change = Math.max(0, (parseFloat(paidAmount) || 0) - total)

  // No shift open - show prompt
  if (!activeShift) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Nema otvorene smene</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Otvorite novu smenu da biste započeli prodaju
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT: Products */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Pretraži proizvod, barkod ili šifru..."
            value={searchTerm}
            onChange={handleSearchInput}
            className="pl-10 h-12 text-base"
            autoFocus
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Sve kategorije
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
          {filtered.map(product => {
            const inCart = cart.find(i => i.productId === product.id)
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="relative p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
              >
                {inCart && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {inCart.quantity}
                  </Badge>
                )}
                <div className="text-sm font-medium truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{product.sku}</div>
                <div className="text-base font-bold mt-1.5">
                  {product.sellingPrice.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Zaliha: {product.currentStock} {product.unit}
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nema proizvoda za prikaz</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <Card className="flex flex-col h-fit lg:sticky lg:top-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Račun
            <Badge variant="outline" className="ml-auto">{itemsCount} stavki</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Shift info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <LogIn className="h-3 w-3" />
            Smena #{activeShift.number} • {activeShift.cashierName}
          </div>

          <Separator />

          {/* Cart items */}
          <div className="max-h-[40vh] overflow-y-auto space-y-2">
            {cart.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Korpa je prazna</p>
              </div>
            )}
            {cart.map(item => (
              <div key={item.productId} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.unitPrice.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
                    {item.discountPct > 0 && ` • -${item.discountPct}%`}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="h-6 w-6 rounded bg-background border flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="h-6 w-6 rounded bg-background border flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.discountPct || ''}
                      onChange={e => updateDiscount(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-14 h-6 text-[10px] ml-auto"
                      placeholder="%"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold">
                    {(item.quantity * item.unitPrice * (1 - item.discountPct / 100)).toLocaleString('sr-RS', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Osnovica</span>
              <span>{subtotal.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">PDV (20%)</span>
              <span>{taxTotal.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>UKUPNO</span>
              <span>{total.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCart([])}
              disabled={cart.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Obriši
            </Button>
            <Button
              className="flex-[2]"
              size="lg"
              onClick={openPayment}
              disabled={cart.length === 0}
            >
              <Receipt className="h-4 w-4 mr-1.5" />
              Naplati
            </Button>
          </div>

          {lastOrderNumber && (
            <div className="text-center text-xs text-muted-foreground">
              Poslednji račun: <span className="font-mono font-medium">{lastOrderNumber}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Naplata</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {total.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
              </div>
              <div className="text-sm text-muted-foreground mt-1">{itemsCount} stavki</div>
            </div>

            {/* Payment method selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gotovina', icon: Banknote, label: 'Gotovina' },
                { id: 'kartica', icon: CreditCard, label: 'Kartica' },
                { id: 'transakcioni_racun', icon: Receipt, label: 'Transakcija' },
              ].map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    paymentMethod === pm.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <pm.icon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{pm.label}</span>
                </button>
              ))}
            </div>

            {/* Amount input for cash */}
            {paymentMethod === 'gotovina' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Unesite iznos:</label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  className="text-lg text-center font-mono"
                  autoFocus
                />
                {/* Quick amount buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {[total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000].map((amt, i) => (
                    <button
                      key={i}
                      onClick={() => setPaidAmount(amt.toFixed(2))}
                      className="py-1.5 text-xs rounded bg-muted hover:bg-muted/80"
                    >
                      {Math.round(amt).toLocaleString('sr-RS')}
                    </button>
                  ))}
                </div>
                {change > 0 && (
                  <div className="text-center p-2 rounded bg-green-100 dark:bg-green-900/20">
                    <span className="text-sm text-muted-foreground">Kusur: </span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      {change.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Nazad
            </Button>
            <Button size="lg" onClick={processPayment}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Potvrdi plaćanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Račun uspešno</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto w-fit">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-mono font-bold">{receiptOrder?.orderNumber}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {receiptOrder?.totalAmount?.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-1" /> Štampaj
              </Button>
              <Button size="sm" onClick={() => setShowReceipt(false)}>
                Novi račun
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ SHIFT MANAGER ============

function ShiftManager({ companyId }: { companyId: string | null }) {
  const [shifts, setShifts] = useState<POSShift[]>([])
  const [showOpen, setShowOpen] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [selectedShift, setSelectedShift] = useState<POSShift | null>(null)
  const [openBalance, setOpenBalance] = useState('')
  const [closeBalance, setCloseBalance] = useState('')
  const [closeNote, setCloseNote] = useState('')

  const loadShifts = () => {
    if (!companyId) return
    fetch('/api/pos/shifts', { headers: { 'x-company-id': companyId } })
      .then(r => r.json())
      .then(setShifts)
      .catch(() => {})
  }

  useEffect(() => { loadShifts() }, [companyId])

  const openShift = async () => {
    if (!companyId) return
    try {
      await fetch('/api/pos/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-company-id': companyId },
        body: JSON.stringify({
          cashierName: 'Kasier',
          openingBalance: parseFloat(openBalance) || 0,
        }),
      })
      setShowOpen(false)
      setOpenBalance('')
      loadShifts()
    } catch { /* handle error */ }
  }

  const closeShift = async () => {
    if (!companyId || !selectedShift) return
    try {
      await fetch(`/api/pos/shifts/${selectedShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-company-id': companyId },
        body: JSON.stringify({
          closingBalance: parseFloat(closeBalance) || 0,
          note: closeNote,
        }),
      })
      setShowClose(false)
      setCloseBalance('')
      setCloseNote('')
      setSelectedShift(null)
      loadShifts()
    } catch { /* handle error */ }
  }

  const formatDt = (d: string) => new Date(d).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const activeShift = shifts.find(s => s.status === 'otvorena')

  return (
    <div className="space-y-4">
      {/* Active shift banner */}
      {activeShift && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <CardContent className="flex items-center gap-4 py-3">
            <div className="p-2 rounded-full bg-green-200 dark:bg-green-800">
              <Clock className="h-5 w-5 text-green-700 dark:text-green-300" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-800 dark:text-green-200">
                Smena #{activeShift.number} - Otvorena
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {activeShift.cashierName} • {formatDt(activeShift.openedAt)} • {activeShift._count?.orders || 0} računa
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
              onClick={() => { setSelectedShift(activeShift); setShowClose(true) }}
            >
              <LogOut className="h-4 w-4 mr-1" /> Zatvori smenu
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Open shift button */}
      {!activeShift && (
        <Button onClick={() => setShowOpen(true)} className="w-full" size="lg">
          <LogIn className="h-4 w-4 mr-2" /> Otvori novu smenu
        </Button>
      )}

      {/* Shifts list */}
      <div className="space-y-2">
        {shifts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nema smena</p>
          </div>
        )}
        {shifts.map(shift => {
          const totalSales = shift.orders?.filter(o => o.status === 'placen').reduce((s, o) => s + o.totalAmount, 0) || 0
          return (
            <Card key={shift.id}>
              <CardContent className="flex items-center gap-4 py-3">
                <div className={`p-2 rounded-full ${shift.status === 'otvorena' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                  <Clock className={`h-5 w-5 ${shift.status === 'otvorena' ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    Smena #{shift.number}
                    <Badge variant={shift.status === 'otvorena' ? 'default' : 'secondary'}>
                      {shift.status === 'otvorena' ? 'Aktivna' : 'Zatvorena'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {shift.cashierName} • {formatDt(shift.openedAt)}
                    {shift.closedAt && ` → ${formatDt(shift.closedAt)}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{totalSales.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD</div>
                  <div className="text-xs text-muted-foreground">{shift._count?.orders || 0} računa</div>
                  {shift.status === 'zatvorena' && shift.difference !== null && (
                    <div className={`text-xs mt-0.5 ${Math.abs(shift.difference) > 1 ? 'text-red-500' : 'text-green-600'}`}>
                      Razlika: {shift.difference?.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Open shift dialog */}
      <Dialog open={showOpen} onOpenChange={setShowOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Otvori novu smenu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Početni saldo (RSD)</label>
              <Input
                type="number"
                value={openBalance}
                onChange={e => setOpenBalance(e.target.value)}
                placeholder="0.00"
                className="mt-1.5"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpen(false)}>Otkaži</Button>
            <Button onClick={openShift}>
              <LogIn className="h-4 w-4 mr-1.5" /> Otvori smenu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close shift dialog */}
      <Dialog open={showClose} onOpenChange={setShowClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Zatvori smenu #{selectedShift?.number}</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Početni saldo:</div>
                <div className="font-medium text-right">{selectedShift.openingBalance.toLocaleString('sr-RS')} RSD</div>
                <div className="text-muted-foreground">Ukupno računa:</div>
                <div className="font-medium text-right">{selectedShift._count?.orders || 0}</div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium">Stanje u kasi (RSD)</label>
                <Input
                  type="number"
                  value={closeBalance}
                  onChange={e => setCloseBalance(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Napomena</label>
                <Input
                  value={closeNote}
                  onChange={e => setCloseNote(e.target.value)}
                  placeholder="Opcionalno"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClose(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={closeShift}>
              <LogOut className="h-4 w-4 mr-1.5" /> Zatvori smenu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ POS REPORTS ============

function POSReports({ companyId }: { companyId: string | null }) {
  const [dashboard, setDashboard] = useState<{
    activeShift: POSShift | null
    today: { total: number; count: number; avgTicket: number; byPayment: Record<string, number> }
    topProducts: { id: string; name: string; qty: number; total: number }[]
    recentOrders: POSOrder[]
  } | null>(null)

  useEffect(() => {
    if (!companyId) return
    fetch('/api/pos/dashboard', { headers: { 'x-company-id': companyId } })
      .then(r => r.json())
      .then(setDashboard)
      .catch(() => {})
  }, [companyId])

  if (!dashboard) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 animate-pulse opacity-30" />
        <p className="text-sm">Učitavanje...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Današnji promet</div>
            <div className="text-xl font-bold mt-1">
              {dashboard.today.total.toLocaleString('sr-RS', { minimumFractionDigits: 0 })} RSD
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Broj računa</div>
            <div className="text-xl font-bold mt-1">{dashboard.today.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Prosečan račun</div>
            <div className="text-xl font-bold mt-1">
              {dashboard.today.avgTicket.toLocaleString('sr-RS', { minimumFractionDigits: 0 })} RSD
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Aktivna smena</div>
            <div className="text-xl font-bold mt-1">
              {dashboard.activeShift ? `#${dashboard.activeShift.number}` : 'Nema'}
            </div>
            {dashboard.activeShift && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {dashboard.activeShift._count?.orders || 0} računa
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Po načinu plaćanja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(dashboard.today.byPayment).map(([method, amount]) => {
              const pct = dashboard.today.total > 0 ? (amount / dashboard.today.total) * 100 : 0
              const labels: Record<string, string> = { gotovina: 'Gotovina', kartica: 'Kartica', transakcioni_racun: 'Transakcija' }
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{labels[method] || method}</span>
                    <span className="font-medium">{amount.toLocaleString('sr-RS', { minimumFractionDigits: 0 })} RSD</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Top proizvodi danas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.topProducts.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">Nema prodaje danas</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dashboard.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-muted-foreground">{p.qty}x</span>
                  <span className="font-medium w-24 text-right">
                    {p.total.toLocaleString('sr-RS', { minimumFractionDigits: 0 })} RSD
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Poslednji računi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {dashboard.recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 text-sm py-1">
                <span className="font-mono text-xs text-muted-foreground w-28 truncate">{order.orderNumber}</span>
                <Badge variant={order.status === 'placen' ? 'default' : 'secondary'} className="text-[10px]">
                  {order.status === 'placen' ? 'Plaćen' : order.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{order.itemsCount} stavki</span>
                <span className="ml-auto font-medium">
                  {order.totalAmount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
                </span>
              </div>
            ))}
            {dashboard.recentOrders.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">Nema računa</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
