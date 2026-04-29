import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, format, options } = body

    if (!type || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: type, format' },
        { status: 400 }
      )
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
      default:
        return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 })
    }
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

// ==================== INVOICE REPORT ====================

async function handleInvoiceReport(options: Record<string, unknown>, format: string) {
  const invoiceId = options.invoiceId as string
  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
  }

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      partner: true,
      items: { include: { product: true } },
    },
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
    include: {
      _count: {
        select: { invoices: true },
      },
    },
  })

  // Calculate total invoiced per partner
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
    include: {
      partner: {
        select: { name: true },
      },
    },
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

  // Build date filter
  const dateFilter: Record<string, Date | undefined> = {}
  if (dateFrom) dateFilter.gte = new Date(dateFrom)
  if (dateTo) dateFilter.lte = new Date(dateTo)

  // Get all transactions in period
  const transactions = await db.transaction.findMany({
    where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : undefined,
    orderBy: { date: 'asc' },
  })

  const totalRevenue = transactions
    .filter((t) => t.type === 'prihod')
    .reduce((s, t) => s + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'rashod')
    .reduce((s, t) => s + t.amount, 0)

  const netProfit = totalRevenue - totalExpenses

  // Monthly breakdown
  const monthlyMap = new Map<string, { revenue: number; expenses: number }>()
  transactions.forEach((t) => {
    const monthKey = t.date.toISOString().substring(0, 7) // YYYY-MM
    const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0 }
    if (t.type === 'prihod') existing.revenue += t.amount
    else existing.expenses += t.amount
    monthlyMap.set(monthKey, existing)
  })

  const monthlyBreakdown = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, val]) => ({
      month,
      revenue: val.revenue,
      expenses: val.expenses,
      profit: val.revenue - val.expenses,
    }))

  // Expense by category
  const expenseMap = new Map<string, number>()
  transactions.filter((t) => t.type === 'rashod').forEach((t) => {
    expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount)
  })

  const totalExpAmt = transactions.filter((t) => t.type === 'rashod').reduce((s, t) => s + t.amount, 0)
  const expenseByCategory = Array.from(expenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpAmt > 0 ? (amount / totalExpAmt) * 100 : 0,
    }))

  // Top partners by revenue
  const invoiceRevenue = await db.invoice.groupBy({
    by: ['partnerId'],
    where: {
      status: { in: ['poslata', 'placena'] },
      ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
    },
    _sum: { totalAmount: true },
    _count: true,
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 10,
  })

  const topPartners = []
  for (const ir of invoiceRevenue) {
    const partner = await db.partner.findUnique({
      where: { id: ir.partnerId },
      select: { name: true },
    })
    if (partner) {
      topPartners.push({
        name: partner.name,
        amount: ir._sum.totalAmount || 0,
        invoiceCount: ir._count,
      })
    }
  }

  const data: Record<string, unknown> = {
    totalRevenue,
    totalExpenses,
    netProfit,
    monthlyBreakdown,
    expenseByCategory,
    topPartners,
  }

  if (dateFrom) data.dateFrom = dateFrom
  if (dateTo) data.dateTo = dateTo

  return NextResponse.json({ data, format })
}
