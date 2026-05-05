export const { activeCompanyId } = useAppStore();

export const existing = prev.find(i => i.productId === product.id);

export const val = e.target.value;

export const match = products.find(p => p.barcode === barcodeBuffer.current || p.sku === barcodeBuffer.current);

export const categories = [...new Set(products.filter(p => p.category).map(p => p.category!))]

export const filtered = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = !selectedCategory || p.category === selectedCategory
    return matchSearch && matchCategory && p.currentStock > 0
  });

export const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i
      const newQty = i.quantity + delta
      if (newQty <= 0) return i
      if (newQty > i.maxStock) return i
      return { ...i, quantity: newQty }
    }))
  }

export const updateDiscount = (productId: string, discount: number) => {
    setCart(prev => prev.map(i =>
      i.productId === productId ? { ...i, discountPct: Math.max(0, Math.min(100, discount)) } : i
    ))
  }

export const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

export const subtotal = cart.reduce((s, i) => {
    const lineTotal = i.quantity * i.unitPrice * (1 - i.discountPct / 100)
    return s + lineTotal / (1 + i.taxRate / 100)
  }, 0);

export const taxTotal = cart.reduce((s, i) => {
    const lineTotal = i.quantity * i.unitPrice * (1 - i.discountPct / 100)
    return s + lineTotal - lineTotal / (1 + i.taxRate / 100)
  }, 0);

export const total = cart.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discountPct / 100), 0);

export const itemsCount = cart.reduce((s, i) => s + i.quantity, 0);

export const openPayment = () => {
    if (cart.length === 0) return
    setPaidAmount(total.toFixed(2))
    setShowPayment(true)
  }

export const processPayment = async () => {
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

export const change = Math.max(0, (parseFloat(paidAmount) || 0) - total);

export const inCart = cart.find(i => i.productId === product.id);

export const loadShifts = () => {
    if (!companyId) return
    fetch('/api/pos/shifts', { headers: { 'x-company-id': companyId } })
      .then(r => r.json())
      .then(setShifts)
      .catch(() => {})
  }

export const openShift = async () => {
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

export const closeShift = async () => {
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

export const formatDt = (d: string) => new Date(d).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const activeShift = shifts.find(s => s.status === 'otvorena');

export const totalSales = shift.orders?.filter(o => o.status === 'placen').reduce((s, o) => s + o.totalAmount, 0) || 0;

export const pct = dashboard.today.total > 0 ? (amount / dashboard.today.total) * 100 : 0;

export const labels: Record<string, string> = { gotovina: 'Gotovina', kartica: 'Kartica', transakcioni_racun: 'Transakcija' }

export const loadSync = () => {
    if (!companyId) return
    fetch('/api/pos/sync', { headers: { 'x-company-id': companyId } })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }

export const applySync = async () => {
    if (!companyId || !syncValue) return
    setApplying(true)
    setResult(null)
    try {
      const res = await fetch('/api/pos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-company-id': companyId },
        body: JSON.stringify({
          type: syncType,
          marginPct: syncType === 'margin' ? parseFloat(syncValue) : 0,
          markupPct: syncType === 'markup' ? parseFloat(syncValue) : 0,
          category: syncCategory,
          roundTo: parseFloat(roundTo) || 0,
        }),
      })
      if (res.ok) {
        const r = await res.json()
        setResult(`Ažurirano ${r.updated} proizvoda (${r.type === 'margin' ? 'marža' : 'zaračunata'}) - ${r.category}`)
        loadSync()
      }
    } catch { /* error */ }
    setApplying(false)
  }

export const filtered = data.products.filter(p => {
    const matchSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.sku.toLowerCase().includes(searchFilter.toLowerCase())
    const matchCat = !syncCategory || p.category === syncCategory
    return matchSearch && matchCat
  });
