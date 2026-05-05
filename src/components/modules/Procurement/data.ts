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

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/purchase-orders?${params.toString()}`);

export const data = await res.json();

export const texts = orders.flatMap((po) => [
        po.partner?.name, po.notes, ...po.items.map((i) => i.productName)
      ].filter(Boolean) as string[]);

export const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', productName: '', quantity: 1, unitPrice: 0 }])
  }

export const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

export const updateLineItem = (index: number, field: keyof OrderLineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.purchasePrice
      }
    }
    setLineItems(updated)
  }

export const handleNew = () => {
    setEditingOrder(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
    setViewMode('form')
  }

export const handleEdit = (po: PurchaseOrder) => {
    setEditingOrder(po)
    setLineItems(po.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })))
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingOrder(null)
    setPrintOrder(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
  }

export const handlePrint = async (po: PurchaseOrder) => {
    setPrintLoading(true)
    setViewMode('print')
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`)
      if (!res.ok) { toast.error(t('procurement.loadError')); return }
      const data: FullPurchaseOrder = await res.json()
      setPrintOrder(data)
    } catch {
      toast.error(t('procurement.loadError'))
    } finally {
      setPrintLoading(false)
    }
  }

export const doPrint = () => {
    window.print()
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('procurement.confirmDelete'))) return
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('procurement.deleteSuccess'))
      fetchOrders()
    } catch { toast.error(t('common.error')) }
  }

export const grandTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = String(Math.floor(Math.random() * 900) + 100)

    const body = {
      partnerId: fd.get('partnerId') as string,
      number: editingOrder ? editingOrder.number : `PO-${year}-${month}-${count}`,
      status: fd.get('status') as string || 'nacrt',
      notes: fd.get('notes') as string,
      items: lineItems.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    }

    try {
      const url = editingOrder ? `/api/purchase-orders/${editingOrder.id}` : '/api/purchase-orders'
      const res = await fetch(url, {
        method: editingOrder ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(editingOrder ? t('procurement.updateSuccess') : t('procurement.createSuccess'))
      setViewMode('list')
      setEditingOrder(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
      fetchOrders()
    } catch {
      toast.error(editingOrder ? t('procurement.updateError') : t('procurement.createError'))
    } finally {
      setSubmitting(false)
    }
  }

export const units = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']

export const teens = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']

export const tens = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset']

export const hundreds = ['', 'sto', 'dvesto', 'tristo', 'četristo', 'petsto', 'šestosto', 'sedamsto', 'osamsto', 'devetsto']

export const h = Math.floor(n / 100);

export const remainder = n % 100;

export const t = Math.floor(remainder / 10);

export const u = remainder % 10;

export const intPart = Math.floor(Math.abs(amount));

export const decPart = Math.round((Math.abs(amount) - intPart) * 100);

export const millions = Math.floor(intPart / 1000000);

export const thousands = Math.floor((intPart % 1000000) / 1000);

export const remaining = intPart % 1000;

export const lastTwo = n % 100;

export const lastOne = n % 10;

export const lastTwo = n % 100;

export const lastOne = n % 10;

export const lastTwo = n % 100;

export const lastOne = n % 10;

export function numberToSerbian(amount: number): string {
  if (amount === 0) return 'nula dinara'

  const units = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
  const teens = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
  const tens = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset']
  const hundreds = ['', 'sto', 'dvesto', 'tristo', 'četristo', 'petsto', 'šestosto', 'sedamsto', 'osamsto', 'devetsto']

  function convertChunk(n: number): string {
    if (n === 0) return ''
    let result = ''
    const h = Math.floor(n / 100)
    const remainder = n % 100
    const t = Math.floor(remainder / 10)
    const u = remainder % 10

    if (h > 0) result += hundreds[h]
    if (remainder === 0) return result

    if (remainder < 10) {
      result += (result ? ' ' : '') + units[u]
    } else if (remainder < 20) {
      result += (result ? ' ' : '') + teens[remainder - 10]
    } else {
      result += (result ? ' ' : '') + tens[t]
      if (u > 0) result += (result ? ' ' : '') + units[u]
    }
    return result
  }

  const intPart = Math.floor(Math.abs(amount))
  const decPart = Math.round((Math.abs(amount) - intPart) * 100)

  if (intPart === 0 && decPart > 0) {
    return `${decPart} ${getParaWord(decPart)}`
  }

  let result = ''
  // Handle millions
  const millions = Math.floor(intPart / 1000000)
  if (millions > 0) {
    if (millions === 1) result += 'jedan milion'
    else {
      result += convertChunk(millions) + ' ' + getMillionWord(millions)
    }
  }

  // Handle thousands
  const thousands = Math.floor((intPart % 1000000) / 1000)
  if (thousands > 0) {
    if (result) result += ' '
    if (thousands === 1) result += 'jedna hiljada'
    else if (thousands < 5) result += convertChunk(thousands) + ' hiljade'
    else result += convertChunk(thousands) + ' hiljada'
  }

  // Handle remaining
  const remaining = intPart % 1000
  if (remaining > 0) {
    if (result) result += ' '
    result += convertChunk(remaining) + ' ' + getDinarWord(remaining)
  } else if (intPart > 0 && millions > 0 && thousands === 0) {
    // millions only, already handled
  }

  if (intPart === 0 && decPart > 0) {
    result = ''
  }

  if (decPart > 0) {
    if (result) result += ' i '
    result += `${decPart} ${getParaWord(decPart)}`
  }

  return result
}

export function getDinarWord(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'dinara'
  if (lastOne >= 2 && lastOne <= 4) return 'dinara'
  if (lastOne === 1) return 'dinar'
  return 'dinara'
}

export function getMillionWord(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'miliona'
  if (lastOne >= 2 && lastOne <= 4) return 'miliona'
  return 'miliona'
}

export function getParaWord(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'para'
  if (lastOne >= 2 && lastOne <= 4) return 'pare'
  if (lastOne === 1) return 'para'
  return 'para'
}
