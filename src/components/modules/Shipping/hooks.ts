import { useState, useEffect, useCallback, useMemo } from 'react'

export function useShipping() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  // Overview state
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  // Orders state
  const [orders, setOrders] = useState<ShippingOrder[]>([])
  const [ordersSearch, setOrdersSearch] = useState('')
  const [ordersFilter, setOrdersFilter] = useState('all')

  // Carriers state
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([])

  // Dialogs
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [carrierDialogOpen, setCarrierDialogOpen] = useState(false)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ShippingOrder | null>(null)

  // Tracking events
  const [trackingEvents, setTrackingEvents] = useState<ShippingEvent[]>([])

  // Loading
  const [loading, setLoading] = useState(false)

  // Form defaults
  const emptyOrder = {
    carrierId: '', partnerId: '', weight: 0.5, volume: 0, packageCount: 1,
    declaredValue: 0, shippingCost: 0, codAmount: 0, insurance: false,
    senderName: '', senderAddress: '', senderCity: '', senderZip: '', senderPhone: '',
    recipientName: '', recipientAddress: '', recipientCity: '', recipientZip: '', recipientPhone: '', recipientEmail: '',
    notes: '',
  }

  const emptyCarrier = {
    name: '', code: '', type: 'domestic', website: '', apiUrl: '',
    contactPhone: '', contactEmail: '', defaultWeight: 0.5, defaultPrice: 0,
    deliveryEstimate: '1-3', notes: '', isActive: true,
  }

  const [orderForm, setOrderForm] = useState(emptyOrder)
  const [carrierForm, setCarrierForm] = useState(emptyCarrier)
  const [partners, setPartners] = useState<Array<{ id: string; name: string }>>([])

  // ============ DATA LOADING ============

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/shipping/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) setDashboard(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadOrders = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (ordersFilter !== 'all') params.set('status', ordersFilter)
      if (ordersSearch) params.set('search', ordersSearch)
      const res = await fetch(`/api/shipping/orders?${params}`)
      if (res.ok) setOrders(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, ordersFilter, ordersSearch])

  const loadCarriers = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/shipping/carriers?companyId=${activeCompanyId}`)
      if (res.ok) setCarriers(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadPartners = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/partners?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setPartners(data.map((p: Record<string, unknown>) => ({ id: p.id as string, name: p.name as string })))
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => {
    if (!activeCompanyId) return
    const load = async () => {
      await Promise.all([loadDashboard(), loadCarriers(), loadPartners()])
    }
    load()
  }, [activeCompanyId, loadDashboard, loadCarriers, loadPartners])

  useEffect(() => {
    if (activeTab === 'orders' && activeCompanyId) {
      const doLoad = async () => { await loadOrders() }
      doLoad()
    }
  }, [activeTab, loadOrders, activeCompanyId])

  // ============ ACTIONS ============

  const handleCreateOrder = async () => {
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

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/shipping/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Obrisati pošiljku?')) return
    try {
      const res = await fetch(`/api/shipping/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

  const handleCreateCarrier = async () => {
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

  const handleDeleteCarrier = async (id: string) => {
    if (!confirm('Obrisati kurira?')) return
    try {
      const res = await fetch(`/api/shipping/carriers?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadCarriers()
    } catch { /* silent */ }
  }

  const handleAddTrackingEvent = async (status: string, description: string, location: string) => {
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

  const loadEvents = async (orderId: string) => {
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

  const openTracking = async (order: ShippingOrder) => {
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

  // ============ RENDER ============

  return {
    activeTab,
    carrierDialogOpen,
    carriers,
    cfg,
    handleCreateCarrier,
    handleCreateOrder,
    key,
    loadOrders,
    loading,
    orderDialogOpen,
    orders,
    ordersFilter,
    ordersSearch,
    partners,
    selectedOrder,
    setActiveTab,
    setCarrierDialogOpen,
    setOrderDialogOpen,
    setOrdersFilter,
    setTrackingDialogOpen,
    trackingDialogOpen,
  }
}
