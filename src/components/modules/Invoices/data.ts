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

export const labels: Record<string, string> = {
    not_sent: 'Nije poslata',
    sent: 'Poslata',
    accepted: 'Prihvaćena',
    rejected: 'Odbijena',
  }

export const colors: Record<string, string> = {
    not_sent: 'bg-slate-100 text-slate-600 border-slate-200',
    sent: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }

export const { t } = useTranslation();

export const res = await fetch('/api/invoices');

export const now = new Date();

export const thisMonth = invoices.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    });

export const overdue = invoices.filter(i => new Date(i.dueDate) < now && i.status === 'poslata');

export const byType = {
      izlazna: invoices.filter(i => i.type === 'izlazna'),
      ulazna: invoices.filter(i => i.type === 'ulazna'),
      predracun: invoices.filter(i => i.type === 'predracun'),
    }

export const byStatus = {
      nacrt: invoices.filter(i => i.status === 'nacrt').length,
      poslata: invoices.filter(i => i.status === 'poslata').length,
      placena: invoices.filter(i => i.status === 'placena').length,
      otkazana: invoices.filter(i => i.status === 'otkazana').length,
    }

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/invoices?${params.toString()}`);

export const data = await res.json();

export const texts: string[] = []

export const handleNew = () => {
    setEditingInvoice(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
    setViewMode('form')
  }

export const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv)
    setLineItems(inv.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountPct: i.discountPct,
      taxRate: i.taxRate,
    })))
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingInvoice(null)
    setPrintInvoice(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
  }

export const handlePrint = async (inv: Invoice) => {
    setPrintLoading(true)
    setViewMode('print')
    try {
      const res = await fetch(`/api/invoices/${inv.id}`)
      if (!res.ok) { toast.error(t('invoices.loadError')); return }
      const data: FullInvoice = await res.json()
      setPrintInvoice(data)
    } catch {
      toast.error(t('invoices.loadError'))
    } finally {
      setPrintLoading(false)
    }
  }

export const doPrint = () => {
    window.print()
  }

export const handleDownloadPDF = async (inv: Invoice) => {
    setPdfDownloading(inv.id)
    try {
      const res = await fetch(`/api/invoices/${inv.id}`)
      if (!res.ok) { toast.error(t('common.errorOccurred')); return }
      const data: FullInvoice = await res.json()

      const invoicePdfData: InvoiceData = {
        id: data.id,
        number: data.number,
        date: data.date,
        dueDate: data.dueDate,
        type: data.type,
        status: data.status,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount,
        discountPct: data.discountPct,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        partner: data.partner ? {
          name: data.partner.name,
          pib: data.partner.pib,
          maticniBr: data.partner.maticniBr,
          address: data.partner.address,
          city: data.partner.city,
          phone: data.partner.phone,
          email: data.partner.email,
          account: data.partner.account,
          bank: data.partner.bank,
        } : null,
        items: data.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          taxRate: item.taxRate,
          total: item.total,
        })),
      }

      const doc = generateInvoicePDF(invoicePdfData)
      downloadPDF(doc, `faktura_${data.number}.pdf`)
      toast.success(t('reports.downloadReady'))
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setPdfDownloading(null)
    }
  }

export const handleConvertToInvoice = async (inv: Invoice) => {
    if (!confirm(`Konvertovati predračun ${inv.number} u fakturu?`)) return
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const count = String(Math.floor(Math.random() * 9000) + 1000)
      const res = await fetch(`/api/invoices/${inv.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'izlazna', number: `F-${year}-${month}-${count}` }) })
      if (!res.ok) { toast.error('Greška pri konverziji'); return }
      toast.success('Predračun konvertovan u fakturu')
      fetchInvoices()
    } catch { toast.error('Greška') }
  }

export const handlePostToAccounting = async (inv: Invoice) => {
    try {
      const res = await fetch('/api/invoices/post-to-journal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoiceId: inv.id })
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri knjiženju')
        return
      }
      const data = await res.json()
      toast.success(data.message || 'Faktura knjižena u dnevnik')
      fetchInvoices()
    } catch { toast.error('Greška pri knjiženju') }
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('invoices.confirmDelete'))) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('invoices.deleteSuccess'))
      fetchInvoices()
    } catch { toast.error(t('common.error')) }
  }

export const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
  }

export const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

export const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.sellingPrice
      }
    }

    setLineItems(updated)
  }

export const calcTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * (item.discountPct / 100)
    return subtotal - discount + (subtotal - discount) * (item.taxRate / 100)
  }

export const grandTotal = lineItems.reduce((sum, item) => sum + calcTotal(item), 0);

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)

    const isEditing = !!editingInvoice
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = String(Math.floor(Math.random() * 9000) + 1000)

    const invoiceType = fd.get('type') as string || 'izlazna'

    const body = {
      partnerId: fd.get('partnerId') as string,
      number: isEditing ? editingInvoice.number : `F-${year}-${month}-${count}`,
      date: isEditing ? editingInvoice.date : new Date().toISOString(),
      type: invoiceType,
      status: fd.get('status') as string || 'nacrt',
      dueDate: fd.get('dueDate') as string,
      paymentMethod: fd.get('paymentMethod') as string || 'racun',
      notes: fd.get('notes') as string,
      items: lineItems.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        discountPct: String(item.discountPct),
        taxRate: String(item.taxRate),
      })),
    }

    try {
      const url = isEditing ? `/api/invoices/${editingInvoice.id}` : '/api/invoices'
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
      toast.success(isEditing ? t('invoices.updatedSuccess') : t('invoices.createdSuccess'))
      setViewMode('list')
      setEditingInvoice(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
      fetchInvoices()
    } catch {
      toast.error(t('invoices.createError'))
    } finally {
      setSubmitting(false)
    }
  }

export const calcItemBase = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * ((item.discountPct || 0) / 100)
    return subtotal - discount
  }

export const calcItemTax = (item: InvoiceItem) => {
    return calcItemBase(item) * ((item.taxRate || 20) / 100)
  }

export const calcItemTotal = (item: InvoiceItem) => {
    return calcItemBase(item) + calcItemTax(item)
  }

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/invoices?${params.toString()}`);

export const data = await res.json();

export const stats = {
    total: invoices.length,
    notSent: invoices.filter((i) => i.sefStatus === 'not_sent' || !i.sefStatus).length,
    sent: invoices.filter((i) => i.sefStatus === 'sent').length,
    accepted: invoices.filter((i) => i.sefStatus === 'accepted').length,
    rejected: invoices.filter((i) => i.sefStatus === 'rejected').length,
  }

export const handleGenerateXml = async (invoiceId: string) => {
    setGeneratingId(invoiceId)
    try {
      const res = await fetch('/api/efakture/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('efakture.generateError'))
        return
      }
      const data = await res.json()
      setXmlCache((prev) => ({ ...prev, [invoiceId]: { xml: data.xml, filename: data.filename } }))
      toast.success(t('efakture.generateSuccess'))
      fetchInvoices()
    } catch {
      toast.error(t('efakture.generateError'))
    } finally {
      setGeneratingId(null)
    }
  }

export const handleDownloadXml = async (invoiceId: string) => {
    // Generate if not cached
    if (!xmlCache[invoiceId]) {
      await handleGenerateXml(invoiceId)
      // Wait for state update
      setTimeout(() => downloadXml(invoiceId), 500)
      return
    }
    downloadXml(invoiceId)
  }

export const downloadXml = (invoiceId: string) => {
    const cached = xmlCache[invoiceId]
    if (!cached) return

    const blob = new Blob([cached.xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = cached.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(t('efakture.downloadSuccess'))
  }

export const handleUpdateStatus = async (invoiceId: string, status: string) => {
    setUpdatingId(invoiceId)
    try {
      const res = await fetch('/api/efakture/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, status }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(t('efakture.statusUpdateSuccess'))
      fetchInvoices()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setUpdatingId(null)
    }
  }

export const filteredInvoices = sefStatusFilter;

export const sefStatus = inv.sefStatus || 'not_sent';

export const isGenerating = generatingId === inv.id;

export const isUpdating = updatingId === inv.id;

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

export function getSefStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    not_sent: 'Nije poslata',
    sent: 'Poslata',
    accepted: 'Prihvaćena',
    rejected: 'Odbijena',
  }
  return labels[status || 'not_sent'] || status || 'Nije poslata'
}

export function getSefStatusColor(status: string | null): string {
  const colors: Record<string, string> = {
    not_sent: 'bg-slate-100 text-slate-600 border-slate-200',
    sent: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }
  return colors[status || 'not_sent'] || 'bg-slate-100 text-slate-600 border-slate-200'
}

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
