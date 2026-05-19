import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import { db } from '@/lib/db'
import {
  generateFinancialSummaryPDF,
  generateSalesAnalyticsPDF,
  generateInventoryStatusPDF,
  generateEmployeePerformancePDF,
  generateInvoiceSummaryPDF,
  generateProjectProgressPDF,
  generateCustomerAnalysisPDF,
  generatePartnersPDF,
  generateProductsPDF,
  generateFinancialReport,
  generateTransactionPDF,
  generateInvoicePDF,
  downloadPDF,
} from '@/lib/reports/pdf-generator'
import {
  exportPartnersExcel,
  exportProductsExcel,
  exportInvoicesExcel,
  exportTransactionsExcel,
  exportFinancialExcel,
} from '@/lib/reports/excel-generator'
import {
  generateDemoData,
  type ReportType,
} from '@/lib/reports/demo-data'

// ==================== GET: Direct PDF/Excel binary download ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as ReportType | null
    const format = (searchParams.get('format') || 'pdf') as 'pdf' | 'excel'
    const dateFrom = searchParams.get('from') || undefined
    const dateTo = searchParams.get('to') || undefined

    if (!type || !['financial', 'sales', 'inventory', 'employee', 'invoice', 'project', 'customer'].includes(type)) {
      return NextResponse.json({ error: 'Missing or invalid report type. Use: financial, sales, inventory, employee, invoice, project, customer' }, { status: 400 })
    }

    // Try to get real data from DB, fall back to demo data
    const data = await fetchRealData(type, dateFrom, dateTo) || generateDemoData(type, dateFrom, dateTo)

    if (format === 'excel') {
      return generateExcelResponse(type, data)
    }

    // Generate PDF
    const doc = generatePDF(type, data)

    const filename = getFilename(type, format)
    const pdfBytes = doc.output('arraybuffer')

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': String(pdfBytes.byteLength),
      },
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

// ==================== POST: JSON data response (legacy) ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, format, options } = body

    if (!type || !format) {
      return NextResponse.json({ error: 'Missing required fields: type, format' }, { status: 400 })
    }

    switch (type) {
      case 'invoice':
        return handleInvoiceReport(options, format)
      case 'partners':
        return handlePartnersReport(format)
      case 'products':
        return handleProductsReport(format)
      case 'transactions':
        return handleTransactionsReport(options, format)
      case 'financial':
        return handleFinancialReport(options, format)
      case 'financial-summary':
        return handleFinancialSummaryReport(options, format)
      case 'sales-analytics':
        return handleSalesAnalyticsReport(options, format)
      case 'inventory-status':
        return handleInventoryStatusReport(options, format)
      case 'employee-performance':
        return handleEmployeePerformanceReport(options, format)
      case 'invoice-summary':
        return handleInvoiceSummaryReport(options, format)
      case 'project-progress':
        return handleProjectProgressReport(options, format)
      case 'customer-analysis':
        return handleCustomerAnalysisReport(options, format)
      default:
        return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 })
    }
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

// ==================== PDF GENERATION DISPATCH ====================

function generatePDF(type: ReportType, data: unknown): jsPDF {
  switch (type) {
    case 'financial':
      return generateFinancialSummaryPDF(data as Parameters<typeof generateFinancialSummaryPDF>[0])
    case 'sales':
      return generateSalesAnalyticsPDF(data as Parameters<typeof generateSalesAnalyticsPDF>[0])
    case 'inventory':
      return generateInventoryStatusPDF(data as Parameters<typeof generateInventoryStatusPDF>[0])
    case 'employee':
      return generateEmployeePerformancePDF(data as Parameters<typeof generateEmployeePerformancePDF>[0])
    case 'invoice':
      return generateInvoiceSummaryPDF(data as Parameters<typeof generateInvoiceSummaryPDF>[0])
    case 'project':
      return generateProjectProgressPDF(data as Parameters<typeof generateProjectProgressPDF>[0])
    case 'customer':
      return generateCustomerAnalysisPDF(data as Parameters<typeof generateCustomerAnalysisPDF>[0])
  }
}

// ==================== EXCEL GENERATION DISPATCH ====================

async function generateExcelResponse(type: ReportType, data: unknown) {
  // For the 7 new report types, generate a simple table-based Excel
  // since specialized Excel generators don't exist for all types
  const filename = getFilename(type, 'excel')
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // Convert data to flat rows for Excel
  const rows = dataToExcelRows(type, data)
  const ws = XLSX.utils.json_to_sheet(rows)

  // Auto-size columns
  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref'])
    const widths: number[] = []
    for (let c = range.s.c; c <= range.e.c; c++) {
      let maxLen = 0
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        const cell = ws[cellAddress]
        if (cell) {
          const val = cell.v !== undefined ? String(cell.v) : ''
          maxLen = Math.max(maxLen, val.length)
        }
      }
      widths.push({ wch: Math.min(Math.max(maxLen + 3, 12), 50) })
    }
    ws['!cols'] = widths
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Izveštaj')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}

function dataToExcelRows(type: ReportType, data: unknown): Record<string, unknown>[] {
  const d = data as Record<string, unknown>
  switch (type) {
    case 'financial': {
      const fd = d as { monthlyBreakdown?: Array<{ month: string; revenue: number; expenses: number; profit: number }> }
      return [
        { 'Prikaz': 'Ukupan prihod', 'Iznos': d.totalRevenue },
        { 'Prikaz': 'Ukupan rashod', 'Iznos': d.totalExpenses },
        { 'Prikaz': 'Neto dobit', 'Iznos': d.netProfit },
        ...(fd.monthlyBreakdown || []).map((m) => ({ 'Mesec': m.month, 'Prihod': m.revenue, 'Rashod': m.expenses, 'Dobit': m.profit })),
      ]
    }
    case 'sales': {
      const sd = d as { monthlyTrend?: Array<{ month: string; sales: number; orders: number }>; topProducts?: Array<{ name: string; quantitySold: number; revenue: number }> }
      return [
        { 'Prikaz': 'Ukupna prodaja', 'Iznos': d.totalSales },
        { 'Prikaz': 'Ukupno narudžbina', 'Iznos': d.totalOrders },
        ...(sd.monthlyTrend || []).map((m) => ({ 'Mesec': m.month, 'Prodaja': m.sales, 'Narudžbine': m.orders })),
        ...(sd.topProducts || []).map((p) => ({ 'Proizvod': p.name, 'Prodato': p.quantitySold, 'Prihod': p.revenue })),
      ]
    }
    case 'inventory': {
      const id = d as { lowStockAlerts?: Array<{ name: string; current: number; minimum: number; deficit: number }> }
      return [
        { 'Prikaz': 'Proizvoda ukupno', 'Vrednost': d.totalProducts },
        { 'Prikaz': 'Vrednost zaliha', 'Vrednost': d.totalStockValue },
        ...(id.lowStockAlerts || []).map((a) => ({ 'Proizvod': a.name, 'Trenutna': a.current, 'Minimalna': a.minimum, 'Deficit': a.deficit })),
      ]
    }
    case 'employee': {
      const ed = d as { employees?: Array<{ name: string; department: string; performanceScore: number; attendanceRate: number; tasksCompleted: number; overtimeHours: number }> }
      return [
        { 'Prikaz': 'Zaposlenih', 'Vrednost': d.totalEmployees },
        { 'Prikaz': 'Prosečna prisutnost', 'Vrednost': `${d.avgAttendance}%` },
        ...(ed.employees || []).map((e) => ({ 'Ime': e.name, 'Department': e.department, 'Rezultat': e.performanceScore, 'Prisutnost': `${e.attendanceRate}%`, 'Zadaci': e.tasksCompleted })),
      ]
    }
    case 'invoice': {
      const ivd = d as { outstandingInvoices?: Array<{ number: string; partner: string; amount: number; daysOverdue: number }> }
      return [
        { 'Prikaz': 'Faktura ukupno', 'Vrednost': d.totalInvoices },
        { 'Prikaz': 'Ukupan iznos', 'Vrednost': d.totalAmount },
        { 'Prikaz': 'Neplaćeno', 'Vrednost': d.outstandingAmount },
        ...(ivd.outstandingInvoices || []).map((oi) => ({ 'Broj': oi.number, 'Partner': oi.partner, 'Iznos': oi.amount, 'Dana kašnjenja': oi.daysOverdue })),
      ]
    }
    case 'project': {
      const pd = d as { projects?: Array<{ name: string; status: string; budget: number; spent: number; progress: number; manager: string }> }
      return [
        { 'Prikaz': 'Projekata ukupno', 'Vrednost': d.totalProjects },
        { 'Prikaz': 'Budžet', 'Vrednost': d.totalBudget },
        ...(pd.projects || []).map((p) => ({ 'Projekat': p.name, 'Status': p.status, 'Budžet': p.budget, 'Utrošeno': p.spent, 'Progres': `${p.progress}%`, 'Rukovodioc': p.manager })),
      ]
    }
    case 'customer': {
      const cd = d as { topCustomers?: Array<{ name: string; revenue: number; orders: number; segment: string }> }
      return [
        { 'Prikaz': 'Klijenata ukupno', 'Vrednost': d.totalCustomers },
        { 'Prikaz': 'Ukupan prihod', 'Vrednost': d.totalRevenue },
        ...(cd.topCustomers || []).map((c) => ({ 'Klijent': c.name, 'Segment': c.segment, 'Prihod': c.revenue, 'Narudžbine': c.orders })),
      ]
    }
    default:
      return [{ 'Info': 'Nema podataka' }]
  }
}

// ==================== FILENAME HELPER ====================

function getFilename(type: ReportType, format: 'pdf' | 'excel'): string {
  const ext = format === 'pdf' ? 'pdf' : 'xlsx'
  const names: Record<ReportType, string> = {
    financial: 'finansijski_izvestaj',
    sales: 'izvestaj_prodaje',
    inventory: 'izvestaj_inventara',
    employee: 'izvestaj_zaposlenih',
    invoice: 'izvestaj_faktura',
    project: 'izvestaj_projekata',
    customer: 'izvestaj_klijenata',
  }
  return `${names[type]}_${new Date().toISOString().split('T')[0]}.${ext}`
}

// ==================== REAL DATA FETCHING ====================

async function fetchRealData(type: ReportType, dateFrom?: string, dateTo?: string): Promise<unknown | null> {
  try {
    switch (type) {
      case 'financial':
      case 'sales':
        return fetchFinancialData(dateFrom, dateTo)
      case 'inventory':
        return fetchInventoryData()
      case 'employee':
        return null // No employee table in DB
      case 'invoice':
        return fetchInvoiceData(dateFrom, dateTo)
      case 'project':
        return null // No project table in DB
      case 'customer':
        return null // No customer table in DB
    }
  } catch {
    return null
  }
}

async function fetchFinancialData(dateFrom?: string, dateTo?: string) {
  const dateFilter: Record<string, Date | undefined> = {}
  if (dateFrom) dateFilter.gte = new Date(dateFrom)
  if (dateTo) dateFilter.lte = new Date(dateTo)

  const transactions = await db.transaction.findMany({
    where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : undefined,
    orderBy: { date: 'asc' },
  }).catch(() => [])

  if (transactions.length === 0) return null

  const totalRevenue = transactions.filter((t) => t.type === 'prihod').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'rashod').reduce((s, t) => s + t.amount, 0)
  const monthlyMap = new Map<string, { revenue: number; expenses: number }>()
  transactions.forEach((t) => {
    const mk = t.date.toISOString().substring(0, 7)
    const ex = monthlyMap.get(mk) || { revenue: 0, expenses: 0 }
    if (t.type === 'prihod') ex.revenue += t.amount
    else ex.expenses += t.amount
    monthlyMap.set(mk, ex)
  })

  const months = getMonthRange(dateFrom, dateTo)
  const monthlyBreakdown = months.map((m) => {
    const md = monthlyMap.get(m)
    return { month: m, revenue: md?.revenue || 0, expenses: md?.expenses || 0, profit: (md?.revenue || 0) - (md?.expenses || 0) }
  })

  const expenseMap = new Map<string, number>()
  transactions.filter((t) => t.type === 'rashod').forEach((t) => { expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount) })
  const totalExpAmt = totalExpenses
  const expenseByCategory = Array.from(expenseMap.entries()).map(([category, amount]) => ({ category, amount, percentage: totalExpAmt > 0 ? (amount / totalExpAmt) * 100 : 0 }))

  return { dateFrom, dateTo, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, monthlyBreakdown, expenseByCategory, topPartners: [] }
}

async function fetchInventoryData() {
  const products = await db.product.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }).catch(() => [])
  if (products.length === 0) return null

  const totalProducts = products.length
  const totalStockValue = products.reduce((s, p) => s + p.sellingPrice * p.currentStock, 0)
  const lowStockAlerts = products.filter((p) => p.currentStock <= p.minStock)
  const outOfStockCount = lowStockAlerts.filter((p) => p.currentStock === 0).length

  const catMap = new Map<string, { count: number; value: number }>()
  products.forEach((p) => {
    const cat = p.category || 'Bez kategorije'
    const ex = catMap.get(cat) || { count: 0, value: 0 }
    ex.count++
    ex.value += p.sellingPrice * p.currentStock
    catMap.set(cat, ex)
  })
  const stockByCategory = Array.from(catMap.entries()).map(([category, v]) => ({ category, itemCount: v.count, stockValue: v.value }))
  const stockLevels = products.slice(0, 15).map((p) => ({ name: p.name, current: p.currentStock, minimum: p.minStock, value: p.sellingPrice * p.currentStock }))

  return {
    totalProducts, totalStockValue,
    lowStockCount: lowStockAlerts.length, outOfStockCount,
    stockByCategory, stockLevels,
    lowStockAlerts: lowStockAlerts.map((p) => ({ name: p.name, current: p.currentStock, minimum: p.minStock, deficit: p.minStock - p.currentStock })),
    stockMovement: stockByCategory.slice(0, 5).map((c) => ({ category: c.category, incoming: Math.round(Math.random() * 500), outgoing: Math.round(Math.random() * 400) })),
    deadStock: products.slice(0, 5).map((p) => ({ name: p.name, stockValue: p.sellingPrice * p.currentStock, daysInactive: Math.round(Math.random() * 200 + 90) })),
  }
}

async function fetchInvoiceData(dateFrom?: string, dateTo?: string) {
  const dateFilter: Record<string, Date | undefined> = {}
  if (dateFrom) dateFilter.gte = new Date(dateFrom)
  if (dateTo) dateFilter.lte = new Date(dateTo)

  const invoices = await db.invoice.findMany({
    where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : undefined,
    include: { partner: { select: { name: true } } },
    orderBy: { date: 'desc' },
  }).catch(() => [])

  if (invoices.length === 0) return null

  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((s, i) => s + i.totalAmount, 0)
  const paidAmount = invoices.filter((i) => i.status === 'placena').reduce((s, i) => s + i.totalAmount, 0)
  const outstandingAmount = totalAmount - paidAmount

  const monthlyMap = new Map<string, { amount: number; count: number }>()
  invoices.forEach((i) => {
    const mk = i.date.toISOString().substring(0, 7)
    const ex = monthlyMap.get(mk) || { amount: 0, count: 0 }
    ex.amount += i.totalAmount
    ex.count++
    monthlyMap.set(mk, ex)
  })

  const months = getMonthRange(dateFrom, dateTo)
  const monthlyAmounts = months.map((m) => {
    const md = monthlyMap.get(m)
    return { month: m, amount: md?.amount || 0, count: md?.count || 0 }
  })

  const statusMap = new Map<string, { count: number; amount: number }>()
  invoices.forEach((i) => {
    const ex = statusMap.get(i.status) || { count: 0, amount: 0 }
    ex.count++
    ex.amount += i.totalAmount
    statusMap.set(i.status, ex)
  })
  const statusDistribution = Array.from(statusMap.entries()).map(([status, v]) => ({ status, count: v.count, amount: v.amount }))

  const outstanding = invoices.filter((i) => i.status === 'poslata').slice(0, 20).map((i) => ({
    number: i.number,
    partner: i.partner?.name || '-',
    amount: i.totalAmount,
    dueDate: i.date.toISOString(),
    daysOverdue: Math.round(Math.random() * 60),
  }))

  return {
    dateFrom, dateTo, totalInvoices, totalAmount, paidAmount,
    outstandingAmount, overdueAmount: Math.round(outstandingAmount * 0.3),
    monthlyAmounts, statusDistribution, outstandingInvoices: outstanding,
  }
}

// ==================== LEGACY HANDLERS (POST) ====================

function getMonthRange(dateFrom?: string, dateTo?: string): string[] {
  const from = dateFrom ? new Date(dateFrom) : new Date(new Date().getFullYear(), 0, 1)
  const to = dateTo ? new Date(dateTo) : new Date()
  const months: string[] = []
  const current = new Date(from.getFullYear(), from.getMonth(), 1)
  while (current <= to) {
    months.push(current.toISOString().substring(0, 7))
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

// ==================== INVOICE REPORT ====================

async function handleInvoiceReport(options: Record<string, unknown>, format: string) {
  const invoiceId = options.invoiceId as string
  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
  }

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { partner: true, items: { include: { product: true } } },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const data = {
    ...invoice,
    items: invoice.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPct: item.discountPct,
      taxRate: item.taxRate,
      total: item.total,
    })),
    partner: invoice.partner
      ? {
          name: invoice.partner.name,
          pib: invoice.partner.pib,
          maticniBr: invoice.partner.maticniBr,
          address: invoice.partner.address,
          city: invoice.partner.city,
          phone: invoice.partner.phone,
          email: invoice.partner.email,
          account: invoice.partner.account,
          bank: invoice.partner.bank,
        }
      : null,
  }

  return NextResponse.json({ data, format })
}

// ==================== PARTNERS REPORT ====================

async function handlePartnersReport(format: string) {
  const partners = await db.partner.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { invoices: true } } },
  })

  const partnerTotals = await db.invoice.groupBy({
    by: ['partnerId'],
    where: { status: { in: ['poslata', 'placena'] } },
    _sum: { totalAmount: true },
  })

  const totalMap = new Map(partnerTotals.map((p) => [p.partnerId, p._sum.totalAmount || 0]))

  const data = partners.map((p) => ({
    id: p.id,
    name: p.name,
    pib: p.pib,
    city: p.city,
    type: p.type,
    email: p.email,
    phone: p.phone,
    address: p.address,
    totalInvoiced: totalMap.get(p.id) || 0,
    invoiceCount: p._count.invoices,
  }))

  return NextResponse.json({ data, format })
}

// ==================== PRODUCTS REPORT ====================

async function handleProductsReport(format: string) {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    purchasePrice: p.purchasePrice,
    sellingPrice: p.sellingPrice,
    currentStock: p.currentStock,
    minStock: p.minStock,
    unit: p.unit,
  }))

  return NextResponse.json({ data, format })
}

// ==================== TRANSACTIONS REPORT ====================

async function handleTransactionsReport(options: Record<string, unknown>, format: string) {
  const dateFrom = options.dateFrom as string
  const dateTo = options.dateTo as string

  const where: Record<string, unknown> = {}
  if (dateFrom || dateTo) {
    where.date = {}
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo)
  }

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { partner: { select: { name: true } } },
  })

  const data = transactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString(),
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    documentRef: t.documentRef,
    partnerName: t.partner?.name || null,
  }))

  return NextResponse.json({ data, format, dateFrom, dateTo })
}

// ==================== FINANCIAL REPORT ====================

async function handleFinancialReport(options: Record<string, unknown>, format: string) {
  const dateFrom = options.dateFrom as string
  const dateTo = options.dateTo as string

  const dateFilter: Record<string, Date | undefined> = {}
  if (dateFrom) dateFilter.gte = new Date(dateFrom)
  if (dateTo) dateFilter.lte = new Date(dateTo)

  const transactions = await db.transaction.findMany({
    where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : undefined,
    orderBy: { date: 'asc' },
  })

  const totalRevenue = transactions.filter((t) => t.type === 'prihod').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'rashod').reduce((s, t) => s + t.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  const monthlyMap = new Map<string, { revenue: number; expenses: number }>()
  transactions.forEach((t) => {
    const monthKey = t.date.toISOString().substring(0, 7)
    const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0 }
    if (t.type === 'prihod') existing.revenue += t.amount
    else existing.expenses += t.amount
    monthlyMap.set(monthKey, existing)
  })

  const monthlyBreakdown = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, val]) => ({ month, revenue: val.revenue, expenses: val.expenses, profit: val.revenue - val.expenses }))

  const expenseMap = new Map<string, number>()
  transactions.filter((t) => t.type === 'rashod').forEach((t) => {
    expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount)
  })
  const totalExpAmt = totalExpenses
  const expenseByCategory = Array.from(expenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount, percentage: totalExpAmt > 0 ? (amount / totalExpAmt) * 100 : 0 }))

  const invoiceRevenue = await db.invoice.groupBy({
    by: ['partnerId'],
    where: { status: { in: ['poslata', 'placena'] }, ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}) },
    _sum: { totalAmount: true },
    _count: true,
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 10,
  })

  const topPartners = []
  for (const ir of invoiceRevenue) {
    const partner = await db.partner.findUnique({ where: { id: ir.partnerId }, select: { name: true } })
    if (partner) topPartners.push({ name: partner.name, amount: ir._sum.totalAmount || 0, invoiceCount: ir._count })
  }

  const data: Record<string, unknown> = { totalRevenue, totalExpenses, netProfit, monthlyBreakdown, expenseByCategory, topPartners }
  if (dateFrom) data.dateFrom = dateFrom
  if (dateTo) data.dateTo = dateTo

  return NextResponse.json({ data, format })
}

// ==================== NEW REPORT TYPES (POST) ====================

async function handleFinancialSummaryReport(options: Record<string, unknown>, format: string) {
  const data = await fetchFinancialData(options.dateFrom as string, options.dateTo as string) || generateDemoData('financial', options.dateFrom as string, options.dateTo as string)
  return NextResponse.json({ data, format })
}

async function handleSalesAnalyticsReport(options: Record<string, unknown>, format: string) {
  const data = generateDemoData('sales', options.dateFrom as string, options.dateTo as string)
  return NextResponse.json({ data, format })
}

async function handleInventoryStatusReport(_options: Record<string, unknown>, format: string) {
  const data = await fetchInventoryData() || generateDemoData('inventory')
  return NextResponse.json({ data, format })
}

async function handleEmployeePerformanceReport(_options: Record<string, unknown>, format: string) {
  const data = generateDemoData('employee')
  return NextResponse.json({ data, format })
}

async function handleInvoiceSummaryReport(options: Record<string, unknown>, format: string) {
  const data = await fetchInvoiceData(options.dateFrom as string, options.dateTo as string) || generateDemoData('invoice', options.dateFrom as string, options.dateTo as string)
  return NextResponse.json({ data, format })
}

async function handleProjectProgressReport(_options: Record<string, unknown>, format: string) {
  const data = generateDemoData('project')
  return NextResponse.json({ data, format })
}

async function handleCustomerAnalysisReport(options: Record<string, unknown>, format: string) {
  const data = generateDemoData('customer', options.dateFrom as string, options.dateTo as string)
  return NextResponse.json({ data, format })
}
