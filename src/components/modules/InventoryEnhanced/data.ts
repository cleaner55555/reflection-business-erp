export const load = async () => {
      const [lRes, pRes, locRes] = await Promise.all([fetch('/api/lots'), fetch('/api/products'), fetch('/api/warehouse-locations')])
      if (cancelled) return
      setLots(await lRes.json())
      setProducts(await pRes.json())
      setLocations(await locRes.json())
      setLoading(false)
    }

export const handleSubmit = async () => {
    if (editId) {
      await fetch(`/api/lots/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/lots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companyId: 'default' }) })
    }
    setShowForm(false); setEditId(null)
    setForm({ productId: '', lotNumber: '', quantity: 0, expiryDate: '', locationId: '', purchasePrice: 0, supplier: '', notes: '' })
    const res = await fetch('/api/lots'); setLots(await res.json())
    toast.success(editId ? 'Lot ažuriran' : 'Lot kreiran')
  }

export const handleEdit = (lot: LotData) => {
    setForm({
      productId: lot.product?.sku || '', lotNumber: lot.lotNumber, quantity: lot.quantity,
      expiryDate: lot.expiryDate?.split('T')[0] || '', locationId: lot.locationId || '',
      purchasePrice: lot.purchasePrice, supplier: lot.supplier || '', notes: lot.notes || ''
    })
    setEditId(lot.id); setShowForm(true)
  }

export const handleDelete = async (id: string) => {
    await fetch(`/api/lots/${id}`, { method: 'DELETE' })
    setLots(prev => prev.filter(l => l.id !== id))
    toast.success('Lot obrisan')
  }

export const isExpiringSoon = (d: string | null) => d && new Date(d) < new Date(Date.now() + 30 * 86400000);

export const isExpired = (d: string | null) => d && new Date(d) < new Date();

export const load = async () => {
      const [cRes, lRes] = await Promise.all([fetch('/api/inventory-counts'), fetch('/api/warehouse-locations')])
      if (cancelled) return
      setCounts(await cRes.json())
      setLocations(await lRes.json())
      setLoading(false)
    }

export const handleCreate = async () => {
    const res = await fetch('/api/inventory-counts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, companyId: 'default', status: 'nacrt' })
    })
    const newCount = await res.json()
    setCounts(prev => [newCount, ...prev])
    setShowForm(false); setForm({ name: '', locationId: '', notes: '' })
    toast.success('Inventura kreirana')
  }

export const handleFinalize = async (id: string) => {
    await fetch(`/api/inventory-counts/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'zavrsena', endDate: new Date().toISOString() })
    })
    setCounts(prev => prev.map(c => c.id === id ? { ...c, status: 'zavrsena' } : c))
    toast.success('Inventura završena - razlike primenjene na stanje')
  }

export const statusBadge = (s: string) => {
    switch (s) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'u_toku': return <Badge className="bg-blue-100 text-blue-700">U toku</Badge>
      case 'zavrsena': return <Badge className="bg-emerald-100 text-emerald-700">Završena</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

export const totalDiff = (count.items || []).reduce((sum, i) => sum + (i.countedQty - i.systemQty), 0);

export const load = async () => {
      const [pRes, lRes, mRes] = await Promise.all([fetch('/api/products'), fetch('/api/warehouse-locations'), fetch('/api/stock')])
      if (cancelled) return
      setProducts(await pRes.json())
      setLocations(await lRes.json())
      setMovements((await mRes.json()).filter((m: StockMovement) => m.type === 'transfer'))
      setLoading(false)
    }

export const handleTransfer = async () => {
    if (!form.productId || !form.fromLocationId || !form.toLocationId || form.quantity <= 0) {
      toast.error('Popunite sva polja'); return
    }
    setTransferring(true)
    const res = await fetch('/api/stock/transfer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, companyId: 'default' })
    })
    if (res.ok) {
      toast.success('Transfer uspešno izvršen')
      setForm({ productId: '', fromLocationId: '', toLocationId: '', quantity: 0, notes: '' })
      const mRes = await fetch('/api/stock')
      setMovements((await mRes.json()).filter((m: StockMovement) => m.type === 'transfer'))
    } else {
      toast.error('Greška pri transferu')
    }
    setTransferring(false)
  }

export const topLevelLocations = locations.filter(l => !l.parentId && l.isActive);

export const prod = products.find(p => p.id === m.productId);
