export const TABLE_STATUS_BADGE: Record<string, string> = {
  slobodan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  zauzet: 'bg-red-50 text-red-700 border-red-200',
  rezervisan: 'bg-amber-50 text-amber-700 border-amber-200',
}

export const TABLE_STATUS_LABEL: Record<string, string> = {
  slobodan: 'Slobodan',
  zauzet: 'Zauzet',
  rezervisan: 'Rezervisan',
}

export const TABLE_STATUS_DOT: Record<string, string> = {
  slobodan: 'bg-emerald-500',
  zauzet: 'bg-red-500',
  rezervisan: 'bg-amber-500',
}

export const ORDER_STATUS_BADGE: Record<string, string> = {
  u_toku: 'bg-blue-50 text-blue-700 border-blue-200',
  spremno: 'bg-amber-50 text-amber-700 border-amber-200',
  'usluženo': 'bg-teal-50 text-teal-700 border-teal-200',
  plaćeno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  otkazano: 'bg-red-50 text-red-700 border-red-200',
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  u_toku: 'U toku',
  spremno: 'Spremno',
  'usluženo': 'Usluženo',
  plaćeno: 'Plaćeno',
  otkazano: 'Otkazano',
}

export const ORDER_TYPE_LABEL: Record<string, string> = {
  restoran: 'Restoran',
  porudzbina: 'Porudžbina',
  dostava: 'Dostava',
}

export const ORDER_TYPE_BADGE: Record<string, string> = {
  restoran: 'bg-slate-100 text-slate-700 border-slate-200',
  porudzbina: 'bg-violet-50 text-violet-700 border-violet-200',
  dostava: 'bg-orange-50 text-orange-700 border-orange-200',
}

export const ITEM_STATUS_LABEL: Record<string, string> = {
  'naručeno': 'Naručeno',
  u_pripremi: 'U pripremi',
  spremno: 'Spremno',
  'usluženo': 'Usluženo',
}

export const ITEM_STATUS_BADGE: Record<string, string> = {
  'naručeno': 'bg-blue-50 text-blue-600 border-blue-200',
  u_pripremi: 'bg-amber-50 text-amber-600 border-amber-200',
  spremno: 'bg-teal-50 text-teal-600 border-teal-200',
  'usluženo': 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

export const ORDER_STATUS_FLOW = ['u_toku', 'spremno', 'usluženo', 'plaćeno']

export const LOCATION_LABELS: Record<string, string> = {
  sprat: 'Sprat',
  terasa: 'Terasa',
  basta: 'Bašta',
  bar: 'Bar',
  sala: 'Sala',
}

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/resto-categories?activeOnly=false');

export const data = await res.json();

export const res = await fetch('/api/resto-menu-items');

export const data = await res.json();

export const res = await fetch('/api/resto-tables');

export const data = await res.json();

export const res = await fetch('/api/resto-orders');

export const data = await res.json();

export const texts: string[] = []

export const todayOrders = orders;

export const todayRevenue = todayOrders.filter(o => o.status === 'plaćeno').reduce((s, o) => s + o.totalAmount, 0);

export const activeOrders = todayOrders.filter(o => ['u_toku', 'spremno', 'usluženo'].includes(o.status));

export const avgOrderValue = todayOrders.length > 0 ? todayOrders.reduce((s, o) => s + o.totalAmount, 0) / todayOrders.length : 0;

export const filteredOrders = orderFilter === 'all' ? todayOrders : todayOrders.filter(o => o.status === orderFilter);

export const groupedMenu = categories.map(cat => ({
    ...cat,
    items: menuItems.filter(mi => mi.categoryId === cat.id),
  }));

export const availableMenuItems = menuSearch;

export const orderTotal = orderItems.reduce((s, item) => s + item.quantity * item.unitPrice, 0);

export const handleTableSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      number: Number(fd.get('number')),
      name: (fd.get('name') as string) || null,
      capacity: Number(fd.get('capacity')) || 4,
      status: fd.get('status') as string || 'slobodan',
      location: (fd.get('location') as string) || null,
    }
    try {
      const url = editingTable ? `/api/resto-tables/${editingTable.id}` : '/api/resto-tables'
      const res = await fetch(url, {
        method: editingTable ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || t('common.error'))
      }
      toast.success(editingTable ? t('cafeRestaurant.tableUpdated') : t('cafeRestaurant.tableCreated'))
      setStoloviViewMode('list')
      setEditingTable(null)
      fetchTables()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleDeleteTable = async (id: string) => {
    if (!confirm(t('cafeRestaurant.confirmDeleteTable'))) return
    try {
      const res = await fetch(`/api/resto-tables/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('cafeRestaurant.tableDeleted'))
      fetchTables()
    } catch {
      toast.error(t('cafeRestaurant.deleteTableError'))
    }
  }

export const openEditTable = (table: RestoTable) => {
    setEditingTable(table)
    setStoloviViewMode('form')
  }

export const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      sortOrder: Number(fd.get('sortOrder')) || 0,
      isActive: true,
    }
    try {
      const url = editingCategory ? `/api/resto-categories/${editingCategory.id}` : '/api/resto-categories'
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editingCategory ? t('cafeRestaurant.categoryUpdated') : t('cafeRestaurant.categoryCreated'))
      setMeniViewMode('list')
      setEditingCategory(null)
      fetchCategories()
    } catch {
      toast.error(t('cafeRestaurant.saveCategoryError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleDeleteCategory = async (id: string) => {
    if (!confirm(t('cafeRestaurant.confirmDeleteCategory'))) return
    try {
      const res = await fetch(`/api/resto-categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('cafeRestaurant.categoryDeleted'))
      fetchCategories()
      fetchMenuItems()
    } catch {
      toast.error(t('cafeRestaurant.deleteCategoryError'))
    }
  }

export const openEditCategory = (cat: RestoCategory) => {
    setEditingCategory(cat)
    setMeniViewMode('category-form')
  }

export const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

export const handleMenuItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      categoryId: fd.get('categoryId') as string,
      name: fd.get('name') as string,
      description: (fd.get('description') as string) || null,
      price: Number(fd.get('price')),
      cost: Number(fd.get('cost')) || 0,
      isAvailable: true,
      sortOrder: Number(fd.get('sortOrder')) || 0,
    }
    try {
      const url = editingMenuItem ? `/api/resto-menu-items/${editingMenuItem.id}` : '/api/resto-menu-items'
      const res = await fetch(url, {
        method: editingMenuItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editingMenuItem ? t('cafeRestaurant.menuItemUpdated') : t('cafeRestaurant.menuItemCreated'))
      setMeniViewMode('list')
      setEditingMenuItem(null)
      setMenuItemCategoryId('')
      fetchMenuItems()
    } catch {
      toast.error(t('cafeRestaurant.saveMenuItemError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleToggleAvailability = async (item: RestoMenuItem) => {
    try {
      const res = await fetch(`/api/resto-menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      })
      if (!res.ok) throw new Error()
      toast.success(item.isAvailable ? t('cafeRestaurant.menuItemDeactivated') : t('cafeRestaurant.menuItemActivated'))
      fetchMenuItems()
    } catch {
      toast.error(t('cafeRestaurant.updateMenuItemError'))
    }
  }

export const handleDeleteMenuItem = async (id: string) => {
    if (!confirm(t('cafeRestaurant.confirmDeleteMenuItem'))) return
    try {
      const res = await fetch(`/api/resto-menu-items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('cafeRestaurant.menuItemDeleted'))
      fetchMenuItems()
    } catch {
      toast.error(t('cafeRestaurant.deleteMenuItemError'))
    }
  }

export const openEditMenuItem = (item: RestoMenuItem) => {
    setEditingMenuItem(item)
    setMenuItemCategoryId(item.categoryId)
    setMeniViewMode('menu-item-form')
  }

export const openNewMenuItem = (categoryId?: string) => {
    setEditingMenuItem(null)
    setMenuItemCategoryId(categoryId || '')
    setMeniViewMode('menu-item-form')
  }

export const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      toast.error(t('cafeRestaurant.addAtLeastOneItem'))
      return
    }
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      tableId: (fd.get('tableId') as string) || null,
      type: fd.get('type') as string || 'restoran',
      waiter: (fd.get('waiter') as string) || null,
      notes: (fd.get('notes') as string) || null,
      status: 'u_toku',
      items: orderItems.map(item => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }
    try {
      const res = await fetch('/api/resto-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || t('common.error'))
      }
      toast.success(t('cafeRestaurant.orderCreated'))
      setNarudzbineViewMode('list')
      setOrderItems([])
      setMenuSearch('')
      fetchOrders()
      fetchTables()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('cafeRestaurant.createOrderError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleUpdateOrderStatus = async (order: RestoOrder, newStatus: string) => {
    try {
      const res = await fetch(`/api/resto-orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status: ${ORDER_STATUS_LABEL[newStatus] || newStatus}`)
      fetchOrders()
    } catch {
      toast.error(t('cafeRestaurant.updateStatusError'))
    }
  }

export const handleDeleteOrder = async (id: string) => {
    if (!confirm(t('cafeRestaurant.confirmDeleteOrder'))) return
    try {
      const res = await fetch(`/api/resto-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('cafeRestaurant.orderDeleted'))
      if (expandedOrder === id) setExpandedOrder(null)
      fetchOrders()
    } catch {
      toast.error(t('cafeRestaurant.deleteOrderError'))
    }
  }

export const getNextStatus = (currentStatus: string) => {
    const idx = ORDER_STATUS_FLOW.indexOf(currentStatus)
    if (idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1) {
      return ORDER_STATUS_FLOW[idx + 1]
    }
    return null
  }

export const addOrderItem = (item: RestoMenuItem) => {
    const existing = orderItems.find(oi => oi.menuItemId === item.id)
    if (existing) {
      setOrderItems(prev => prev.map(oi =>
        oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
      ))
    } else {
      setOrderItems(prev => [...prev, {
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: 1,
        unitPrice: item.price,
      }])
    }
  }

export const removeOrderItem = (menuItemId: string) => {
    setOrderItems(prev => prev.filter(oi => oi.menuItemId !== menuItemId))
  }

export const updateOrderItemQty = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      removeOrderItem(menuItemId)
      return
    }
    setOrderItems(prev => prev.map(oi =>
      oi.menuItemId === menuItemId ? { ...oi, quantity: qty } : oi
    ))
  }

export const openNewOrder = () => {
    setOrderItems([])
    setMenuSearch('')
    setNarudzbineViewMode('form')
  }

export const handleCancelOrder = () => {
    setNarudzbineViewMode('list')
    setOrderItems([])
    setMenuSearch('')
  }

export const isExpanded = expandedOrder === order.id;

export const nextStatus = getNextStatus(order.status);

export const isExpanded = expandedCategories.has(cat.id);
