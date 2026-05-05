export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const statusColor = (status: string) => {
  switch (status) {
    case 'active': case 'isporučena': case 'završena': case 'objavljen': case 'rešeno': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'pending': case 'nacrt': case 'otvoren': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'potvrđena': case 'u_pripremi': case 'poslata': case 'u_toku': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'suspended': case 'stornirana': case 'skriven': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    case 'rejected': case 'odbijeno': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Na čekanju', active: 'Aktivan', suspended: 'Suspendovan', rejected: 'Odbijen',
    nacrt: 'Nacrt', potvrđena: 'Potvrđena', u_pripremi: 'U pripremi', poslata: 'Poslata',
    u_isporuci: 'U isporuci', isporučena: 'Isporučena', završena: 'Završena', stornirana: 'Stornirana',
    otvoren: 'Otvoren', u_toku: 'U toku', rešeno: 'Rešeno', odbijeno: 'Odbijeno',
    objavljen: 'Objavljen', na_cekanju: 'Na čekanju', skriven: 'Skriven',
  }
  return map[status] || status
}

export const disputeTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    quality: 'Kvalitet', delivery: 'Isporuka', wrong_item: 'Pogrešna stavka',
    damaged: 'Oštećeno', not_received: 'Nije primljeno', other: 'Ostalo',
  }
  return map[type] || type
}

export const priorityLabel = (p: string) => {
  const map: Record<string, string> = { nizak: 'Nizak', srednji: 'Srednji', visok: 'Visok', hitan: 'Hitan' }
  return map[p] || p
}

export const Stars = ({ rating, size = 'sm' }: { rating: number; size?: string }) => {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sz} ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyVendor = { partnerId: '', description: '', deliveryTime: '', minOrderAmount: 0, commissionRate: 5, categories: '', paymentTerms: 'odmah', shippingFree: false }

export const emptyOrder = { vendorId: '', retailerName: '', retailerEmail: '', retailerPhone: '', retailerAddress: '', retailerCity: '', notes: '' }

export const emptyReview = { vendorId: '', authorName: '', rating: 5, title: '', comment: '' }

export const emptyDispute = { vendorId: '', orderId: '', type: 'other', description: '', priority: 'srednji' }

export const emptyProduct = { name: '', vendorId: '', sku: '', category: '', description: '', price: 0, compareAtPrice: 0, costPrice: 0, unit: 'kom', stock: 0, minOrderQty: 1, weight: 0, imageUrl: '', isFeatured: false }

export const emptyCoupon = { code: '', description: '', discountType: 'procenat', discountValue: 10, minOrderAmount: 0, maxUses: 100, validFrom: '', validTo: '', vendorId: '', category: '' }

export const res = await fetch(`/api/marketplace/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/marketplace/vendors?${params}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/marketplace/orders?${params}`);

export const res = await fetch(`/api/marketplace/reviews?companyId=${activeCompanyId}`);

export const res = await fetch(`/api/marketplace/disputes?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/marketplace/products?${params}`);

export const data = await res.json();

export const res = await fetch(`/api/marketplace/coupons?companyId=${activeCompanyId}`);

export const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

export const handleCreateVendor = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/marketplace/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...vendorForm, categories: vendorForm.categories.split(',').map(c => c.trim()).filter(Boolean) }),
      })
      if (res.ok) { setVendorDialogOpen(false); setVendorForm(emptyVendor); loadVendors(); loadDashboard(); showToast('Veleprodaja kreirana') }
    } catch { showToast('Greška pri kreiranju') }
  }

export const handleVendorAction = async (id: string, status: string) => {
    try {
      await fetch(`/api/marketplace/vendors/${id}?companyId=${activeCompanyId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      })
      loadVendors(); loadDashboard(); showToast(`Status promenjen: ${statusLabel(status)}`)
    } catch { showToast('Greška') }
  }

export const handleDeleteVendor = async (id: string) => {
    if (!confirm('Obrisati veleprodaju?')) return
    try { await fetch(`/api/marketplace/vendors/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' }); loadVendors(); loadDashboard(); showToast('Veleprodaja obrisana') }
    catch { showToast('Greška') }
  }

export const addOrderItem = () => setOrderItems([...orderItems, { productId: '', productName: '', sku: '', quantity: 1, unitPrice: 0 }]);

export const removeOrderItem = (idx: number) => setOrderItems(orderItems.filter((_, i) => i !== idx));

export const updateOrderItem = (idx: number, field: string, value: any) => {
    const updated = [...orderItems]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'quantity' || field === 'unitPrice') updated[idx].total = updated[idx].quantity * updated[idx].unitPrice
    setOrderItems(updated)
  }

export const handleCreateOrder = async () => {
    if (!activeCompanyId || !orderForm.vendorId || orderItems.length === 0) { showToast('Popunite sva polja'); return }
    try {
      const res = await fetch('/api/marketplace/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...orderForm, items: orderItems }),
      })
      if (res.ok) { setOrderDialogOpen(false); setOrderForm(emptyOrder); setOrderItems([]); loadOrders(); loadDashboard(); showToast('Narudžba kreirana') }
    } catch { showToast('Greška') }
  }

export const handleOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/marketplace/orders/${id}?companyId=${activeCompanyId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      })
      loadOrders(); loadDashboard(); showToast(`Status: ${statusLabel(status)}`)
    } catch { showToast('Greška') }
  }

export const handleCreateReview = async () => {
    if (!activeCompanyId || !reviewForm.vendorId || !reviewForm.authorName) { showToast('Popunite polja'); return }
    try {
      const res = await fetch('/api/marketplace/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...reviewForm }),
      })
      if (res.ok) { setReviewDialogOpen(false); setReviewForm(emptyReview); loadReviews(); showToast('Recenzija dodata') }
    } catch { showToast('Greška') }
  }

export const handleCreateDispute = async () => {
    if (!activeCompanyId || !disputeForm.vendorId || !disputeForm.orderId) { showToast('Popunite polja'); return }
    try {
      const res = await fetch('/api/marketplace/disputes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...disputeForm }),
      })
      if (res.ok) { setDisputeDialogOpen(false); setDisputeForm(emptyDispute); loadDisputes(); showToast('Spor kreiran') }
    } catch { showToast('Greška') }
  }

export const handleResolveDispute = async (id: string, resolution: string) => {
    try {
      await fetch(`/api/marketplace/disputes/${id}?companyId=${activeCompanyId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rešeno', resolution }),
      })
      loadDisputes(); showToast('Spor rešen')
    } catch { showToast('Greška') }
  }

export const handleCreateProduct = async () => {
    if (!activeCompanyId || !productForm.name || !productForm.vendorId) { showToast('Popunite naziv i veleprodaju'); return }
    try {
      const res = await fetch('/api/marketplace/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-company-id': activeCompanyId },
        body: JSON.stringify(productForm),
      })
      if (res.ok) { setProductDialogOpen(false); setProductForm(emptyProduct); loadProducts(); showToast('Proizvod dodat') }
    } catch { showToast('Greška') }
  }

export const handleToggleProductFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/marketplace/products/${id}?companyId=${activeCompanyId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeatured: !isFeatured }),
      })
      loadProducts(); showToast(!isFeatured ? 'Istaknuto' : 'Uklonjeno iz istaknutih')
    } catch { showToast('Greška') }
  }

export const handleDeleteProduct = async (id: string) => {
    if (!confirm('Obrisati proizvod?')) return
    try { await fetch(`/api/marketplace/products/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' }); loadProducts(); showToast('Proizvod obrisan') }
    catch { showToast('Greška') }
  }

export const handleCreateCoupon = async () => {
    if (!activeCompanyId || !couponForm.code) { showToast('Unesite kupon kod'); return }
    try {
      const res = await fetch('/api/marketplace/coupons', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-company-id': activeCompanyId },
        body: JSON.stringify(couponForm),
      })
      if (res.ok) { setCouponDialogOpen(false); setCouponForm(emptyCoupon); loadCoupons(); showToast('Kupon kreiran') }
    } catch { showToast('Greška') }
  }

export const Kpi = ({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );

export const RatingDistribution = ({ reviews }: { reviews: any[] }) => {
    const dist = [0, 0, 0, 0, 0]
    reviews.forEach((r: any) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
    const max = Math.max(...dist, 1)
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-xs w-6 text-right">{star}</span>
            <div className="flex-1 bg-muted rounded-full h-2.5">
              <div className="bg-yellow-400 h-2.5 rounded-full transition-all" style={{ width: `${Math.round((dist[star - 1] / max) * 100)}%` }} />
            </div>
            <span className="text-xs font-mono w-6">{dist[star - 1]}</span>
          </div>
        ))}
      </div>
    )
  }

export const max = Math.max(...Object.entries(dashData.orders).filter(([k]) => k !== 'total').map(([, v]) => v as number), 1);

export const pct = Math.round(((val as number) / max) * 100);

export const max = Math.max(...Object.values(dashData.revenueByMonth) as number[], 1);

export const input = document.getElementById(`resolution-${d.id}`) as HTMLInputElement;

export const expiresSoon = c.validTo && new Date(c.validTo) < new Date(Date.now() + 3 * 86400000);

export const estimatedComm = v.totalSales * (v.commissionRate || 5) / 100;

export const maxComm = Math.max(...dashData.topVendors.map((v2: any) => v2.totalSales * (v2.commissionRate || 5) / 100), 1);

export const barPct = v.totalSales > 0 ? Math.min((estimatedComm / maxComm) * 100, 100) : 0;

export const max = Math.max(...Object.entries(dashData.orders).filter(([k]) => k !== 'total').map(([, v]) => v as number), 1);

export const pct = Math.round(((val as number) / max) * 100);

export const colors: Record<string, string> = {
                        nacrt: 'bg-yellow-500', potvrđena: 'bg-blue-500', poslata: 'bg-indigo-500',
                        isporučena: 'bg-green-500', stornirana: 'bg-red-500', u_isporuci: 'bg-cyan-500',
                        završena: 'bg-emerald-600',
                      }

export const max = Math.max(...Object.values(dashData.revenueByMonth) as number[], 1);

export const items = JSON.parse(selectedItem.items);
