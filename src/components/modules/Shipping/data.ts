export const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  nacrt: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: FileText },
  cekanje_preuzimanja: { label: 'Čeka preuzimanje', color: 'bg-amber-100 text-amber-700', icon: Clock },
  preuzeto: { label: 'Preuzeto', color: 'bg-blue-100 text-blue-700', icon: Package },
  u_tranzitu: { label: 'U tranzitu', color: 'bg-sky-100 text-sky-700', icon: Truck },
  isporuceno: { label: 'Isporučeno', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  vraceno: { label: 'Vraćeno', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  otkazano: { label: 'Otkazano', color: 'bg-orange-100 text-orange-700', icon: X },
}

export const carrierTypeLabels: Record<string, string> = {
  domestic: 'Domaći',
  regional: 'Regionalni',
  international: 'Međunarodni',
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyOrder = {
    carrierId: '', partnerId: '', weight: 0.5, volume: 0, packageCount: 1,
    declaredValue: 0, shippingCost: 0, codAmount: 0, insurance: false,
    senderName: '', senderAddress: '', senderCity: '', senderZip: '', senderPhone: '',
    recipientName: '', recipientAddress: '', recipientCity: '', recipientZip: '', recipientPhone: '', recipientEmail: '',
    notes: '',
  }

export const emptyCarrier = {
    name: '', code: '', type: 'domestic', website: '', apiUrl: '',
    contactPhone: '', contactEmail: '', defaultWeight: 0.5, defaultPrice: 0,
    deliveryEstimate: '1-3', notes: '', isActive: true,
  }

export const res = await fetch(`/api/shipping/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/shipping/orders?${params}`);

export const res = await fetch(`/api/shipping/carriers?companyId=${activeCompanyId}`);

export const res = await fetch(`/api/partners?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const load = async () => {
      await Promise.all([loadDashboard(), loadCarriers(), loadPartners()])
    }

export const doLoad = async () => { await loadOrders() }

export const handleCreateOrder = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/shipping/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...orderForm }),
      })
      if (res.ok) {
        setOrderDialogOpen(false)
        setOrderForm(emptyOrder)
        loadOrders()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

export const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/shipping/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

export const handleDeleteOrder = async (id: string) => {
    if (!confirm('Obrisati pošiljku?')) return
    try {
      const res = await fetch(`/api/shipping/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

export const handleCreateCarrier = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/shipping/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...carrierForm }),
      })
      if (res.ok) {
        setCarrierDialogOpen(false)
        setCarrierForm(emptyCarrier)
        loadCarriers()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

export const handleDeleteCarrier = async (id: string) => {
    if (!confirm('Obrisati kurira?')) return
    try {
      const res = await fetch(`/api/shipping/carriers?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadCarriers()
    } catch { /* silent */ }
  }

export const handleAddTrackingEvent = async (status: string, description: string, location: string) => {
    if (!selectedOrder || !activeCompanyId) return
    try {
      const res = await fetch('/api/shipping/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          companyId: activeCompanyId,
          addEvent: { status, description, location },
        }),
      })
      if (res.ok) {
        loadEvents(selectedOrder.id)
        loadOrders()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

export const loadEvents = async (orderId: string) => {
    try {
      const res = await fetch(`/api/shipping/orders?companyId=${activeCompanyId}`)
      if (res.ok) {
        const all = await res.json()
        const found = all.find((o: ShippingOrder) => o.id === orderId)
        if (found) {
          setSelectedOrder(found)
          // For now events are stored via the orders API addEvent
        }
      }
    } catch { /* silent */ }
  }

export const openTracking = async (order: ShippingOrder) => {
    setSelectedOrder(order)
    setTrackingDialogOpen(true)
    // Reload the order with latest status
    if (activeCompanyId) {
      try {
        const res = await fetch(`/api/shipping/orders?companyId=${activeCompanyId}`)
        if (res.ok) {
          const all = await res.json()
          const fresh = all.find((o: ShippingOrder) => o.id === order.id)
          if (fresh) setSelectedOrder(fresh)
        }
      } catch { /* silent */ }
    }
  }

export const cfg = statusConfig[s.status]

export const cfg = statusConfig[o.status]

export const cfg = statusConfig[o.status]

export const cfg = statusConfig[o.status]
