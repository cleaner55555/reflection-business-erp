import { NextRequest, NextResponse } from 'next/server'

// In-memory store (simulates DB – in production this would be Prisma)
let timeEntries = [
  { id: 'te-1', employeeId: 'emp-1', clientId: 'cl-1', projectId: 'pr-1', date: '2024-11-04', hours: 8, rate: 5500, description: 'Кодирање модула миграције – корисници', billingStatus: 'unbilled', invoiceId: null },
  { id: 'te-2', employeeId: 'emp-2', clientId: 'cl-1', projectId: 'pr-1', date: '2024-11-04', hours: 6, rate: 5500, description: 'Тестирање модула миграције', billingStatus: 'unbilled', invoiceId: null },
  { id: 'te-3', employeeId: 'emp-1', clientId: 'cl-2', projectId: 'pr-2', date: '2024-11-05', hours: 4, rate: 6000, description: 'API дизајн за мобилну апликацију', billingStatus: 'unbilled', invoiceId: null },
  { id: 'te-4', employeeId: 'emp-3', clientId: 'cl-4', projectId: 'pr-4', date: '2024-11-05', hours: 7, rate: 7000, description: 'Безбедносни преглед инфраструктуре', billingStatus: 'unbilled', invoiceId: null },
  { id: 'te-5', employeeId: 'emp-4', clientId: 'cl-1', projectId: 'pr-5', date: '2024-11-06', hours: 5, rate: 5200, description: 'Дизајн CRM корисничког интерфејса', billingStatus: 'unbilled', invoiceId: null },
  { id: 'te-6', employeeId: 'emp-1', clientId: 'cl-1', projectId: 'pr-1', date: '2024-10-28', hours: 8, rate: 5500, description: 'Рефакторисање базе података', billingStatus: 'billed', invoiceId: null },
  { id: 'te-7', employeeId: 'emp-2', clientId: 'cl-2', projectId: 'pr-2', date: '2024-10-29', hours: 7, rate: 6000, description: 'Фронтенд компоненте – наруџбине', billingStatus: 'invoiced', invoiceId: 'inv-1' },
  { id: 'te-8', employeeId: 'emp-3', clientId: 'cl-3', projectId: 'pr-3', date: '2024-10-25', hours: 3, rate: 4500, description: 'Финални pregled портала', billingStatus: 'paid', invoiceId: 'inv-2' },
  { id: 'te-9', employeeId: 'emp-4', clientId: 'cl-3', projectId: 'pr-3', date: '2024-10-22', hours: 6, rate: 4500, description: 'Респонсивни дизајн – footer секција', billingStatus: 'paid', invoiceId: 'inv-2' },
  { id: 'te-10', employeeId: 'emp-1', clientId: 'cl-4', projectId: 'pr-4', date: '2024-10-30', hours: 8, rate: 7000, description: 'Пентестинг – SQL инјекције', billingStatus: 'invoiced', invoiceId: 'inv-3' },
  { id: 'te-11', employeeId: 'emp-2', clientId: 'cl-2', projectId: 'pr-2', date: '2024-11-06', hours: 8, rate: 6000, description: 'Push нотификације – имплементација', billingStatus: 'unbilled', invoiceId: null },
  { id: 'te-12', employeeId: 'emp-3', clientId: 'cl-1', projectId: 'pr-5', date: '2024-11-07', hours: 4, rate: 5200, description: 'Састанак са клијентом – CRM захтеви', billingStatus: 'unbilled', invoiceId: null },
]

let invoices = [
  { id: 'inv-1', invoiceNumber: 'Fakt-2024-001', clientId: 'cl-2', projectId: 'pr-2', issueDate: '2024-11-01', dueDate: '2024-12-01', paymentTerms: 'net30', items: [{ id: 'ii-1', timeEntryId: 'te-7', description: 'Фронтенд компоненте – наруџбине', hours: 7, rate: 6000, total: 42000 }], subtotal: 42000, pdvRate: 20, pdvAmount: 8400, total: 50400, status: 'sent', notes: 'Молимо уплатити на жиро рачун у року од 30 дана.' },
  { id: 'inv-2', invoiceNumber: 'Fakt-2024-002', clientId: 'cl-3', projectId: 'pr-3', issueDate: '2024-10-28', dueDate: '2024-11-27', paymentTerms: 'net30', items: [{ id: 'ii-2', timeEntryId: 'te-8', description: 'Финални pregled портала', hours: 3, rate: 4500, total: 13500 }, { id: 'ii-3', timeEntryId: 'te-9', description: 'Респонсивни дизајн – footer', hours: 6, rate: 4500, total: 27000 }], subtotal: 40500, pdvRate: 20, pdvAmount: 8100, total: 48600, status: 'paid', notes: '' },
  { id: 'inv-3', invoiceNumber: 'Fakt-2024-003', clientId: 'cl-4', projectId: 'pr-4', issueDate: '2024-11-03', dueDate: '2024-11-18', paymentTerms: 'net15', items: [{ id: 'ii-4', timeEntryId: 'te-10', description: 'Пентестинг – SQL инјекције', hours: 8, rate: 7000, total: 56000 }], subtotal: 56000, pdvRate: 20, pdvAmount: 11200, total: 67200, status: 'overdue', notes: '' },
]

let settings = {
  defaultHourlyRate: 5000,
  pdvRate: 20,
  paymentTerms: 'net30' as string,
  invoicePrefix: 'Fakt',
  nextInvoiceNumber: 4,
  roundTo: '0.5' as string,
  workDayHours: 8,
}

// ---------- GET ----------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section') || 'entries'

  if (section === 'entries') {
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')

    let filtered = [...timeEntries]
    if (clientId) filtered = filtered.filter((e) => e.clientId === clientId)
    if (projectId) filtered = filtered.filter((e) => e.projectId === projectId)
    if (status) filtered = filtered.filter((e) => e.billingStatus === status)
    if (employeeId) filtered = filtered.filter((e) => e.employeeId === employeeId)

    return NextResponse.json({ success: true, data: filtered })
  }

  if (section === 'invoices') {
    const status = searchParams.get('status')
    let filtered = [...invoices]
    if (status) filtered = filtered.filter((i) => i.status === status)
    return NextResponse.json({ success: true, data: filtered })
  }

  if (section === 'settings') {
    return NextResponse.json({ success: true, data: settings })
  }

  if (section === 'stats') {
    const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0)
    const unbilledEntries = timeEntries.filter((e) => e.billingStatus === 'unbilled')
    const unbilledHours = unbilledEntries.reduce((s, e) => s + e.hours, 0)
    const unbilledValue = unbilledEntries.reduce((s, e) => s + e.hours * e.rate, 0)
    const invoicedTotal = invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0)
    const paidTotal = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)
    const overdueTotal = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalEntries: timeEntries.length,
        totalHours,
        unbilledCount: unbilledEntries.length,
        unbilledHours,
        unbilledValue,
        invoicedTotal,
        paidTotal,
        overdueTotal,
        invoiceCount: invoices.length,
      },
    })
  }

  return NextResponse.json({ success: true, data: { entries: timeEntries, invoices, settings } })
}

// ---------- POST ----------

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  // Create time entry
  if (action === 'create-entry') {
    const entry = {
      id: `te-${Date.now()}`,
      employeeId: body.employeeId,
      clientId: body.clientId,
      projectId: body.projectId,
      date: body.date,
      hours: body.hours,
      rate: body.rate,
      description: body.description || '',
      billingStatus: 'unbilled' as string,
      invoiceId: null,
    }
    timeEntries = [entry, ...timeEntries]
    return NextResponse.json({ success: true, data: entry })
  }

  // Generate invoice from unbilled entries
  if (action === 'generate-invoice') {
    const { entryIds, clientId, issueDate, paymentTerms, notes } = body
    const selectedEntries = timeEntries.filter((e) => entryIds.includes(e.id))

    if (selectedEntries.length === 0) {
      return NextResponse.json({ success: false, error: 'Нема изабраних ставки' }, { status: 400 })
    }

    const items = selectedEntries.map((e, idx) => ({
      id: `ii-${Date.now()}-${idx}`,
      timeEntryId: e.id,
      description: e.description,
      hours: e.hours,
      rate: e.rate,
      total: e.hours * e.rate,
    }))

    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const pdvAmount = Math.round((subtotal * settings.pdvRate) / 100)
    const total = subtotal + pdvAmount

    const daysMap: Record<string, number> = { net15: 15, net30: 30, net45: 45, net60: 60, on_receipt: 0 }
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + (daysMap[paymentTerms] || 30))

    const invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `${settings.invoicePrefix}-${new Date().getFullYear()}-${String(settings.nextInvoiceNumber).padStart(3, '0')}`,
      clientId,
      projectId: selectedEntries[0].projectId || null,
      issueDate,
      dueDate: dueDate.toISOString().split('T')[0],
      paymentTerms,
      items,
      subtotal,
      pdvRate: settings.pdvRate,
      pdvAmount,
      total,
      status: 'draft',
      notes: notes || '',
    }

    invoices = [invoice, ...invoices]

    // Update time entries billing status
    timeEntries = timeEntries.map((e) =>
      entryIds.includes(e.id) ? { ...e, billingStatus: 'invoiced', invoiceId: invoice.id } : e
    )

    settings = { ...settings, nextInvoiceNumber: settings.nextInvoiceNumber + 1 }

    return NextResponse.json({ success: true, data: invoice })
  }

  // Update settings
  if (action === 'update-settings') {
    settings = { ...settings, ...body.settings }
    return NextResponse.json({ success: true, data: settings })
  }

  return NextResponse.json({ success: false, error: 'Непозната акција' }, { status: 400 })
}

// ---------- PATCH ----------

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  // Update a time entry
  if (action === 'update-entry') {
    const { id, ...updates } = body
    timeEntries = timeEntries.map((e) => (e.id === id ? { ...e, ...updates } : e))
    const updated = timeEntries.find((e) => e.id === id)
    return NextResponse.json({ success: true, data: updated })
  }

  // Bill time entries (mark as billed)
  if (action === 'bill-entries') {
    const { entryIds } = body
    timeEntries = timeEntries.map((e) =>
      entryIds.includes(e.id) ? { ...e, billingStatus: 'billed' } : e
    )
    return NextResponse.json({ success: true, data: { billed: entryIds.length } })
  }

  // Unbill time entries (revert to unbilled)
  if (action === 'unbill-entries') {
    const { entryIds } = body
    timeEntries = timeEntries.map((e) =>
      entryIds.includes(e.id) && e.billingStatus !== 'invoiced'
        ? { ...e, billingStatus: 'unbilled', invoiceId: null }
        : e
    )
    return NextResponse.json({ success: true, data: { unbilled: entryIds.length } })
  }

  // Update invoice status
  if (action === 'update-invoice-status') {
    const { invoiceId, status } = body
    invoices = invoices.map((i) => (i.id === invoiceId ? { ...i, status } : i))
    const updated = invoices.find((i) => i.id === invoiceId)
    return NextResponse.json({ success: true, data: updated })
  }

  return NextResponse.json({ success: false, error: 'Непозната акција' }, { status: 400 })
}

// ---------- DELETE ----------

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID је обавезан' }, { status: 400 })
  }

  if (type === 'entry') {
    timeEntries = timeEntries.filter((e) => e.id !== id)
    return NextResponse.json({ success: true })
  }

  if (type === 'invoice') {
    const invoice = invoices.find((i) => i.id === id)
    if (invoice) {
      // Revert time entries to unbilled
      timeEntries = timeEntries.map((e) =>
        e.invoiceId === id ? { ...e, billingStatus: 'unbilled', invoiceId: null } : e
      )
    }
    invoices = invoices.filter((i) => i.id !== id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: 'Непознат тип' }, { status: 400 })
}
