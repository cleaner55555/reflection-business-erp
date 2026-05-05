export const COMPANY = {
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

export const { t } = useTranslation();

export const load = async () => {
      const [pRes, mRes, lRes] = await Promise.all([fetch('/api/products'), fetch('/api/stock'), fetch('/api/warehouse-locations')])
      if (cancelled) return
      setProducts(await pRes.json())
      setMovements(await mRes.json())
      setLocations(await lRes.json())
      setLoading(false)
    }

export const totalProducts = products.length;

export const totalStock = products.reduce((s, p) => s + p.currentStock, 0);

export const totalValue = products.reduce((s, p) => s + (p.currentStock * p.purchasePrice), 0);

export const retailValue = products.reduce((s, p) => s + (p.currentStock * p.sellingPrice), 0);

export const lowStock = products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);

export const outOfStock = products.filter(p => p.currentStock <= 0);

export const recentMovements = movements.filter(m => (Date.now() - new Date(m.date).getTime()) < 7 * 24 * 60 * 60 * 1000);

export const last7DaysIn = recentMovements.filter(m => m.type === 'prijem').reduce((s, m) => s + m.quantity, 0);

export const last7DaysOut = recentMovements.filter(m => m.type === 'izdavanje').reduce((s, m) => s + m.quantity, 0);

export const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

export const catProducts = products.filter(p => p.category === cat);

export const catValue = catProducts.reduce((s, p) => s + (p.currentStock * p.purchasePrice), 0);

export const load = async () => {
      setLoading(true)
      const res = await fetch('/api/warehouse-locations')
      if (cancelled) return
      setLocations(await res.json())
      setLoading(false)
    }

export const locTypes = [
    { value: 'magacin', label: 'Magacin', color: 'bg-slate-100 text-slate-700' },
    { value: 'zona', label: 'Zona', color: 'bg-blue-100 text-blue-700' },
    { value: 'regal', label: 'Regal', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'polica', label: 'Polica', color: 'bg-amber-100 text-amber-700' },
    { value: 'bin', label: 'Bin', color: 'bg-violet-100 text-violet-700' },
  ]

export const handleNew = () => { setEditing(null); setFormType('polica'); setFormParentId(''); setViewMode('form') }

export const handleEdit = (loc: WarehouseLocation) => { setEditing(loc); setFormType(loc.type); setFormParentId(loc.parentId || ''); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditing(null) }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name') as string, code: fd.get('code') as string, type: formType, parentId: formParentId || null }
    try {
      const url = editing ? `/api/warehouse-locations/${editing.id}` : '/api/warehouse-locations'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error); return }
      toast.success(editing ? 'Lokacija ažurirana' : 'Lokacija kreirana')
      setViewMode('list'); setEditing(null)
      const newRes = await fetch('/api/warehouse-locations'); setLocations(await newRes.json())
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati lokaciju?')) return
    try { await fetch(`/api/warehouse-locations/${id}`, { method: 'DELETE' }); toast.success('Obrisano'); const res = await fetch('/api/warehouse-locations'); setLocations(await res.json()) } catch { toast.error('Greška') }
  }

export const typeInfo = locTypes.find(lt => lt.value === loc.type) || locTypes[3]

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/products?${params.toString()}`);

export const data = await res.json();

export const texts = products.flatMap((p) => [p.name, p.sku, p.category].filter(Boolean) as string[]);

export const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

export const handleNew = () => {
    setEditingProduct(null)
    setViewMode('form')
  }

export const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingProduct(null)
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('warehouse.confirmDeleteProduct'))) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('warehouse.productDeleted'))
      fetchProducts()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      sku: fd.get('sku') as string,
      barcode: fd.get('barcode') as string,
      category: fd.get('category') as string,
      unit: fd.get('unit') as string,
      purchasePrice: fd.get('purchasePrice') as string,
      sellingPrice: fd.get('sellingPrice') as string,
      minStock: fd.get('minStock') as string,
      currentStock: fd.get('currentStock') as string,
    }
    try {
      const isEditing = !!editingProduct
      const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.saveError'))
        return
      }
      toast.success(isEditing ? t('warehouse.productUpdated') : t('warehouse.productCreated'))
      setViewMode('list')
      setEditingProduct(null)
      fetchProducts()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/stock');

export const data = await res.json();

export const texts = movements.flatMap((m) => [
        m.product?.name, m.product?.sku, m.documentRef, m.notes
      ].filter(Boolean) as string[]);

export const handleNew = () => {
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      productId: fd.get('productId') as string,
      type: fd.get('type') as string,
      quantity: fd.get('quantity') as string,
      documentRef: fd.get('documentRef') as string,
      notes: fd.get('notes') as string,
    }
    try {
      const res = await fetch('/api/stock/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.saveError'))
        return
      }
      toast.success(t('warehouse.movementCreated'))
      setViewMode('list')
      fetchMovements()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/stock/movement/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('warehouse.movementDeleted'))
      setDeleteId(null)
      fetchMovements()
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/delivery-notes?${params.toString()}`);

export const data = await res.json();

export const texts = deliveryNotes.flatMap((dn) => [
        dn.partner?.name, dn.notes, ...dn.items.map((i) => i.productName)
      ].filter(Boolean) as string[]);

export const addLineItem = () => {
    setLineItems([...lineItems, { tempId: nextTempId(), productId: '', productName: '', quantity: '1', unitPrice: '0' }])
  }

export const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter((li) => li.tempId !== tempId))
  }

export const updateLineItem = (tempId: string, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map((li) => {
      if (li.tempId !== tempId) return li
      const updated = { ...li, [field]: value }
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value)
        if (prod) {
          updated.productName = prod.name
          if (!updated.unitPrice || updated.unitPrice === '0') {
            updated.unitPrice = String(prod.sellingPrice)
          }
        }
      }
      return updated
    }))
  }

export const openCreate = () => {
    setEditing(null)
    setLineItems([{ tempId: nextTempId(), productId: '', productName: '', quantity: '1', unitPrice: '0' }])
    setFormStatus('nacrt')
    setFormPartnerId('')
    setFormInvoiceNumber('')
    setFormNotes('')
    setViewMode('form')
  }

export const openEdit = (note: DeliveryNote) => {
    setEditing(note)
    setFormStatus(note.status)
    setFormPartnerId(note.partnerId)
    setFormInvoiceNumber(note.invoiceNumber || '')
    setFormNotes(note.notes || '')
    setLineItems(note.items.map((item) => ({
      tempId: nextTempId(),
      productId: item.productId,
      productName: item.productName,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })))
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
    setPrintNote(null)
  }

export const handlePrint = async (note: DeliveryNote) => {
    setPrintLoading(true)
    setViewMode('print')
    try {
      const res = await fetch(`/api/delivery-notes/${note.id}`)
      if (!res.ok) { toast.error(t('warehouse.loadError')); return }
      const data: DeliveryNote = await res.json()
      setPrintNote(data)
    } catch {
      toast.error(t('warehouse.loadError'))
    } finally {
      setPrintLoading(false)
    }
  }

export const doPrint = () => {
    window.print()
  }

export const handleSubmit = async () => {
    if (!formPartnerId) {
      toast.error(t('warehouse.selectPartnerRequired'))
      return
    }
    if (lineItems.length === 0 || lineItems.some((li) => !li.productId)) {
      toast.error(t('warehouse.addItemRequired'))
      return
    }
    setSubmitting(true)
    const body = {
      partnerId: formPartnerId,
      status: formStatus,
      invoiceNumber: formInvoiceNumber || undefined,
      notes: formNotes || undefined,
      items: lineItems.map((li) => ({
        productId: li.productId,
        productName: li.productName,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
      })),
    }
    try {
      const isEditing = !!editing
      const url = isEditing ? `/api/delivery-notes/${editing.id}` : '/api/delivery-notes'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('warehouse.deliveryNoteUpdated') : t('warehouse.deliveryNoteCreated'))
      setViewMode('list')
      setEditing(null)
      fetchDeliveryNotes()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/delivery-notes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('warehouse.deliveryNoteDeleted'))
      setDeleteId(null)
      fetchDeliveryNotes()
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/price-lists');

export const data = await res.json();

export const texts = priceLists.flatMap((pl) => [pl.name, pl.description].filter(Boolean) as string[]);

export const addLineItem = () => {
    setLineItems([...lineItems, { tempId: nextTempId(), productId: '', price: '0', discountPct: '0' }])
  }

export const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter((li) => li.tempId !== tempId))
  }

export const updateLineItem = (tempId: string, field: keyof PriceLineItem, value: string) => {
    setLineItems(lineItems.map((li) => {
      if (li.tempId !== tempId) return li
      const updated = { ...li, [field]: value }
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value)
        if (prod && (!updated.price || updated.price === '0')) {
          updated.price = String(prod.sellingPrice)
        }
      }
      return updated
    }))
  }

export const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDescription('')
    setFormValidFrom('')
    setFormValidTo('')
    setLineItems([{ tempId: nextTempId(), productId: '', price: '0', discountPct: '0' }])
    setViewMode('form')
  }

export const openEdit = (pl: PriceList) => {
    setEditing(pl)
    setFormName(pl.name)
    setFormDescription(pl.description || '')
    setFormValidFrom(pl.validFrom ? pl.validFrom.split('T')[0] : '')
    setFormValidTo(pl.validTo ? pl.validTo.split('T')[0] : '')
    setLineItems(pl.items.map((item) => ({
      tempId: nextTempId(),
      productId: item.productId,
      price: String(item.price),
      discountPct: String(item.discountPct),
    })))
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

export const handleSubmit = async () => {
    if (!formName) {
      toast.error(t('warehouse.priceListNameRequired'))
      return
    }
    if (lineItems.length === 0 || lineItems.some((li) => !li.productId)) {
      toast.error(t('warehouse.addItemRequired'))
      return
    }
    setSubmitting(true)
    const body = {
      name: formName,
      description: formDescription || undefined,
      validFrom: formValidFrom || undefined,
      validTo: formValidTo || undefined,
      isActive: true,
      items: lineItems.map((li) => ({
        productId: li.productId,
        price: li.price,
        discountPct: li.discountPct || '0',
      })),
    }
    try {
      const isEditing = !!editing
      const url = isEditing ? `/api/price-lists/${editing.id}` : '/api/price-lists'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('warehouse.priceListUpdated') : t('warehouse.priceListCreated'))
      setViewMode('list')
      setEditing(null)
      fetchPriceLists()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/price-lists/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('warehouse.priceListDeleted'))
      setDeleteId(null)
      fetchPriceLists()
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

export function nextTempId() {
  return `temp_${++tempIdCounter}_${Date.now()}`
}
