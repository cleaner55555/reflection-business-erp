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

}
}