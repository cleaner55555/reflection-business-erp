import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { AI_AGENTS, getAgentById, buildOrchestratorPrompt } from '@/components/modules/AITeam/agents'
import type { AgentId } from '@/components/modules/AITeam/types'

// ============ TYPES ============

interface AIAction {
  type: 'query' | 'create' | 'update' | 'navigate' | 'chart' | 'general' | 'dashboard'
  entity?: string
  filters?: Record<string, unknown>
  sort?: string
  limit?: number
  data?: Record<string, unknown>
  module?: string
  chartType?: string
}

interface AIResponse {
  reply: string
  actionType?: string
  module?: string
  data?: {
    columns?: Array<{ key: string; label: string }>
    rows?: Array<Record<string, unknown>>
    chartData?: Array<Record<string, unknown>>
    chartType?: 'bar' | 'line' | 'pie' | 'area'
    chartConfig?: Record<string, { label: string; color: string }>
    summaryValue?: string | number
    summaryLabel?: string
    kpis?: Array<{ label: string; value: string; trend?: string }>
    module?: string
    actionLabel?: string
    actionType?: 'navigate' | 'created' | 'updated'
  }
}

// ============ HELPER: Parse LLM response ============

function parseAIResponse(content: string): AIResponse {
  const defaultResponse: AIResponse = { reply: content }
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim())
      return {
        reply: parsed.reply || content,
        actionType: parsed.action?.type,
        module: parsed.action?.module,
        data: parsed.data,
      }
    }
    const parsed = JSON.parse(content.trim())
    return {
      reply: parsed.reply || content,
      actionType: parsed.action?.type,
      module: parsed.action?.module,
      data: parsed.data,
    }
  } catch {
    return defaultResponse
  }
}

// ============ HELPER: Dashboard Overview ============

async function getDashboardOverview(): Promise<{
  kpis: Array<{ label: string; value: string; trend?: string }>
  summaryValue?: string
  summaryLabel?: string
}> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [invoiceStats, unpaidInvoices, partnerCount, projectStats, cashStats, employeeCount, dealStats, vehicleCount] = await Promise.all([
    db.invoice.aggregate({
      where: { type: 'izlazna', status: { in: ['poslata', 'placena'] }, date: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    db.invoice.aggregate({
      where: { status: 'poslata' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    db.partner.count({ where: { isActive: true } }),
    db.project.findMany({ where: { status: 'aktivan' }, take: 100, select: { budget: true, spent: true } }),
    Promise.all([
      db.cashRegister.aggregate({ where: { type: 'ulaz' }, _sum: { amount: true } }),
      db.cashRegister.aggregate({ where: { type: 'izlaz' }, _sum: { amount: true } }),
    ]),
    db.employee.count({ where: { isActive: true } }),
    db.deal.aggregate({
      where: { stage: { notIn: ['won', 'lost'] } },
      _sum: { expectedRevenue: true },
      _count: true,
    }),
    db.vehicle.count({ where: { status: 'aktivno' } }),
  ])

  const revenue = invoiceStats._sum.totalAmount || 0
  const unpaid = unpaidInvoices._sum.totalAmount || 0
  const unpaidCount = unpaidInvoices._count
  const [cashIn, cashOut] = cashStats
  const cashBalance = (cashIn._sum.amount || 0) - (cashOut._sum.amount || 0)
  const pipelineValue = dealStats._sum.expectedRevenue || 0
  const pipelineCount = dealStats._count

  return {
    kpis: [
      { label: 'Prihod ovog meseca', value: revenue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) },
      { label: 'Neplaćene fakture', value: `${unpaid.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 })} (${unpaidCount})`, trend: 'warning' },
      { label: 'Stanje blagajne', value: cashBalance.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) },
      { label: 'Aktivni partneri', value: String(partnerCount) },
      { label: 'CRM Pipeline', value: `${pipelineValue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 })} (${pipelineCount})` },
      { label: 'Zaposleni', value: String(employeeCount) },
      { label: 'Aktivna vozila', value: String(vehicleCount) },
      { label: 'Aktivni projekti', value: String(projectStats.length) },
    ],
    summaryValue: revenue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
    summaryLabel: `Prihod za ${monthStart.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })}`,
  }
}

// ============ HELPER: Execute DB query ============

async function executeQuery(
  entity: string,
  filters: Record<string, unknown>,
  sort?: string,
  limit?: number,
): Promise<{ columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>> }> {
  const lim = limit || 15

  switch (entity) {
    case 'invoices': {
      const where: Prisma.InvoiceWhereInput = {}
      if (filters.status) where.status = filters.status as string
      if (filters.type) where.type = filters.type as string
      if (filters.partnerName) where.partner = { name: { contains: filters.partnerName as string, mode: 'insensitive' } }
      if (filters.number) where.number = { contains: filters.number as string, mode: 'insensitive' }
      if (filters.dateFrom) where.date = { ...((where.date as object) || {}), gte: new Date(filters.dateFrom as string) }
      if (filters.dateTo) where.date = { ...((where.date as object) || {}), lte: new Date(filters.dateTo as string) }
      const orderBy: Prisma.InvoiceOrderByWithRelationInput = sort === 'totalAmount' ? { totalAmount: 'desc' } : { date: 'desc' }
      const records = await db.invoice.findMany({ where, orderBy, take: lim, include: { partner: { select: { name: true } } } })
      return {
        columns: [{ key: 'number', label: 'Broj' }, { key: 'partnerName', label: 'Partner' }, { key: 'date', label: 'Datum' }, { key: 'totalAmount', label: 'Iznos' }, { key: 'status', label: 'Status' }],
        rows: records.map((r) => ({ number: r.number, partnerName: r.partner.name, date: r.date.toLocaleDateString('sr-RS'), totalAmount: r.totalAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), status: r.status })),
      }
    }
    case 'partners': {
      const where: Prisma.PartnerWhereInput = {}
      if (filters.name) where.name = { contains: filters.name as string, mode: 'insensitive' }
      if (filters.type) where.type = filters.type as string
      if (sort === 'totalInvoiced' || sort === 'totalAmount') {
        const partnersWithTotals = await db.invoice.groupBy({ by: ['partnerId'], where: { status: { not: 'otkazana' } }, _sum: { totalAmount: true }, orderBy: { _sum: { totalAmount: 'desc' } }, take: lim })
        const partnerIds = partnersWithTotals.map(p => p.partnerId)
        const partners = await db.partner.findMany({ where: { id: { in: partnerIds } } })
        const pMap = new Map(partners.map(p => [p.id, p.name]))
        return { columns: [{ key: 'name', label: 'Partner' }, { key: 'totalInvoiced', label: 'Ukupno fakturisano' }], rows: partnersWithTotals.map(p => ({ name: pMap.get(p.partnerId) || '?', totalInvoiced: (p._sum.totalAmount || 0).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) })) }
      }
      const records = await db.partner.findMany({ where, orderBy: { name: 'asc' }, take: lim })
      return { columns: [{ key: 'name', label: 'Naziv' }, { key: 'pib', label: 'PIB' }, { key: 'city', label: 'Grad' }, { key: 'type', label: 'Tip' }], rows: records.map(r => ({ name: r.name, pib: r.pib || '-', city: r.city || '-', type: r.type })) }
    }
    case 'products': {
      const where: Prisma.ProductWhereInput = { isActive: true }
      if (filters.lowStock === true) {
        const all = await db.product.findMany({ where: { isActive: true }, take: 200 })
        const low = all.filter(p => p.currentStock <= p.minStock)
        return { columns: [{ key: 'name', label: 'Naziv' }, { key: 'sku', label: 'Šifra' }, { key: 'currentStock', label: 'Trenutno' }, { key: 'minStock', label: 'Minimum' }], rows: low.map(p => ({ name: p.name, sku: p.sku, currentStock: p.currentStock, minStock: p.minStock })) }
      }
      if (filters.category) where.category = { contains: filters.category as string, mode: 'insensitive' }
      const records = await db.product.findMany({ where, orderBy: sort === 'currentStock' ? { currentStock: 'asc' } : { name: 'asc' }, take: lim })
      return { columns: [{ key: 'name', label: 'Naziv' }, { key: 'sku', label: 'Šifra' }, { key: 'currentStock', label: 'Zaliha' }, { key: 'sellingPrice', label: 'Prodajna cena' }], rows: records.map(r => ({ name: r.name, sku: r.sku, currentStock: `${r.currentStock} ${r.unit}`, sellingPrice: r.sellingPrice.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) })) }
    }
    case 'transactions': {
      const where: Prisma.TransactionWhereInput = {}
      if (filters.type) where.type = filters.type as string
      if (filters.category) where.category = filters.category as string
      const records = await db.transaction.findMany({ where, orderBy: { date: 'desc' }, take: lim })
      return { columns: [{ key: 'date', label: 'Datum' }, { key: 'type', label: 'Tip' }, { key: 'category', label: 'Kategorija' }, { key: 'amount', label: 'Iznos' }, { key: 'description', label: 'Opis' }], rows: records.map(r => ({ date: r.date.toLocaleDateString('sr-RS'), type: r.type === 'prihod' ? '🟢 Prihod' : '🔴 Rashod', category: r.category, amount: r.amount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), description: r.description })) }
    }
    case 'cashregister': {
      const [totalIn, totalOut] = await Promise.all([db.cashRegister.aggregate({ where: { type: 'ulaz' }, _sum: { amount: true } }), db.cashRegister.aggregate({ where: { type: 'izlaz' }, _sum: { amount: true } })])
      const recent = await db.cashRegister.findMany({ orderBy: { date: 'desc' }, take: lim })
      const balance = (totalIn._sum.amount || 0) - (totalOut._sum.amount || 0)
      return { columns: [{ key: 'date', label: 'Datum' }, { key: 'type', label: 'Tip' }, { key: 'amount', label: 'Iznos' }, { key: 'description', label: 'Opis' }], rows: [{ date: 'Stanje', type: '💡', amount: balance.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), description: 'Trenutno stanje blagajne' }, ...recent.map(r => ({ date: r.date.toLocaleDateString('sr-RS'), type: r.type === 'ulaz' ? '🟢 Ulaz' : '🔴 Izlaz', amount: r.amount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), description: r.description }))] }
    }
    case 'contacts': {
      const where: Prisma.ContactWhereInput = {}
      if (filters.name) where.OR = [{ firstName: { contains: filters.name as string, mode: 'insensitive' } }, { lastName: { contains: filters.name as string, mode: 'insensitive' } }]
      if (filters.isLead === true) where.isLead = true
      if (filters.isClient === true) where.isClient = true
      const records = await db.contact.findMany({ where, orderBy: { createdAt: 'desc' }, take: lim })
      return { columns: [{ key: 'name', label: 'Ime' }, { key: 'company', label: 'Kompanija' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Telefon' }], rows: records.map(r => ({ name: `${r.firstName} ${r.lastName}`, company: r.company || '-', email: r.email || '-', phone: r.phone || '-' })) }
    }
    case 'deals': {
      const where: Prisma.DealWhereInput = {}
      if (filters.stage) where.stage = filters.stage as string
      if (filters.stageNot) where.stage = { not: filters.stageNot as string }
      if (filters.lostReason) where.lostReason = { not: null }
      const records = await db.deal.findMany({ where, orderBy: { expectedRevenue: 'desc' }, take: lim })
      return { columns: [{ key: 'title', label: 'Prilika' }, { key: 'stage', label: 'Faza' }, { key: 'value', label: 'Vrednost' }, { key: 'probability', label: 'Verovatnoća' }], rows: records.map(r => ({ title: r.title, stage: r.stage, value: r.expectedRevenue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), probability: `${r.probability}%` })) }
    }
    case 'projects': {
      const where: Prisma.ProjectWhereInput = {}
      if (filters.status) where.status = filters.status as string
      const records = await db.project.findMany({ where, orderBy: { createdAt: 'desc' }, take: lim })
      return { columns: [{ key: 'name', label: 'Naziv' }, { key: 'status', label: 'Status' }, { key: 'budget', label: 'Budžet' }, { key: 'progress', label: 'Progres' }], rows: records.map(r => ({ name: r.name, status: r.status, budget: r.budget.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), progress: `${r.progress}%` })) }
    }
    case 'employees': {
      const where: Prisma.EmployeeWhereInput = {}
      if (filters.department) where.department = { contains: filters.department as string, mode: 'insensitive' }
      if (filters.isActive === true) where.isActive = true
      const records = await db.employee.findMany({ where, orderBy: { lastName: 'asc' }, take: lim })
      return { columns: [{ key: 'name', label: 'Ime' }, { key: 'position', label: 'Pozicija' }, { key: 'department', label: 'Odeljenje' }, { key: 'baseSalary', label: 'Osnovica' }], rows: records.map(r => ({ name: `${r.firstName} ${r.lastName}`, position: r.position || '-', department: r.department || '-', baseSalary: r.baseSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) })) }
    }
    case 'vehicles': {
      const where: Prisma.VehicleWhereInput = {}
      if (filters.status) where.status = filters.status as string
      const records = await db.vehicle.findMany({ where, orderBy: { registration: 'asc' }, take: lim })
      return { columns: [{ key: 'registration', label: 'Reg. broj' }, { key: 'make', label: 'Marka' }, { key: 'model', label: 'Model' }, { key: 'status', label: 'Status' }], rows: records.map(r => ({ registration: r.registration, make: r.make, model: r.model, status: r.status })) }
    }
    case 'payrolls': {
      const now = new Date()
      const records = await db.payroll.findMany({ where: { year: now.getFullYear(), month: now.getMonth() + 1 }, take: lim, include: { employee: { select: { firstName: true, lastName: true } } } })
      return { columns: [{ key: 'name', label: 'Zaposleni' }, { key: 'baseSalary', label: 'Osnovica' }, { key: 'bonuses', label: 'Bonusi' }, { key: 'netSalary', label: 'Neto' }], rows: records.map(r => ({ name: `${r.employee.firstName} ${r.employee.lastName}`, baseSalary: r.baseSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), bonuses: r.bonuses.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), netSalary: r.netSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) })) }
    }
    case 'purchaseorders': {
      const where: Prisma.PurchaseOrderWhereInput = {}
      if (filters.status) where.status = filters.status as string
      const records = await db.purchaseOrder.findMany({ where, orderBy: { date: 'desc' }, take: lim, include: { partner: { select: { name: true } } } })
      return { columns: [{ key: 'number', label: 'Broj' }, { key: 'partnerName', label: 'Dobavljač' }, { key: 'date', label: 'Datum' }, { key: 'totalAmount', label: 'Iznos' }, { key: 'status', label: 'Status' }], rows: records.map(r => ({ number: r.number, partnerName: r.partner.name, date: r.date.toLocaleDateString('sr-RS'), totalAmount: r.totalAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), status: r.status })) }
    }
    case 'helpdesktickets': {
      const where: Prisma.HelpdeskTicketWhereInput = {}
      if (filters.status) where.status = filters.status as string
      const records = await db.helpdeskTicket.findMany({ where, orderBy: { createdAt: 'desc' }, take: lim })
      return { columns: [{ key: 'subject', label: 'Tema' }, { key: 'status', label: 'Status' }, { key: 'priority', label: 'Prioritet' }], rows: records.map(r => ({ subject: r.subject || r.description?.substring(0, 50) || '-', status: r.status, priority: r.priority })) }
    }
    case 'recurringinvoices': {
      const records = await db.recurringInvoice.findMany({ orderBy: { nextDate: 'asc' }, take: lim, include: { partner: { select: { name: true } } } })
      return { columns: [{ key: 'name', label: 'Naziv' }, { key: 'partnerName', label: 'Partner' }, { key: 'frequency', label: 'Učestalost' }, { key: 'nextDate', label: 'Sledeći' }], rows: records.map(r => ({ name: r.name, partnerName: r.partner.name, frequency: r.frequency, nextDate: r.nextDate.toLocaleDateString('sr-RS') })) }
    }
    default:
      return { columns: [], rows: [] }
  }
}

// ============ HELPER: Execute analytics ============

async function executeAnalytics(
  entity: string,
  filters: Record<string, unknown>,
): Promise<{
  chartData?: Array<Record<string, unknown>>
  chartType: string
  chartConfig: Record<string, { label: string; color: string }>
  summaryValue?: string
  summaryLabel?: string
} | null> {
  const colors = ['hsl(142, 76%, 36%)', 'hsl(47, 96%, 53%)', 'hsl(199, 89%, 48%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(24, 95%, 53%)', 'hsl(326, 100%, 74%)', 'hsl(221, 83%, 53%)']

  if (entity === 'transactions' && filters.comparison === 'prihod_rashod') {
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom as string) : new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
    const dateTo = filters.dateTo ? new Date(filters.dateTo as string) : new Date()
    const transactions = await db.transaction.findMany({ where: { date: { gte: dateFrom, lte: dateTo } }, select: { date: true, type: true, amount: true } })
    const monthlyData: Record<string, { prihod: number; rashod: number }> = {}
    for (const t of transactions) {
      const mk = t.date.toLocaleDateString('sr-RS', { year: 'numeric', month: 'short' })
      if (!monthlyData[mk]) monthlyData[mk] = { prihod: 0, rashod: 0 }
      if (t.type === 'prihod') monthlyData[mk].prihod += t.amount
      else monthlyData[mk].rashod += t.amount
    }
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({ month, prihod: data.prihod, rashod: data.rashod }))
    const tp = chartData.reduce((s, d) => s + d.prihod, 0)
    const tr = chartData.reduce((s, d) => s + d.rashod, 0)
    return { chartData, chartType: 'bar', chartConfig: { prihod: { label: 'Prihod', color: colors[0] }, rashod: { label: 'Rashod', color: colors[3] } }, summaryValue: (tp - tr).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), summaryLabel: 'Neto rezultat' }
  }

  if (entity === 'transactions' && filters.groupBy === 'category') {
    const transactions = await db.transaction.findMany({ where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, select: { category: true, amount: true } })
    const catData: Record<string, number> = {}
    for (const t of transactions) catData[t.category] = (catData[t.category] || 0) + t.amount
    const chartData = Object.entries(catData).map(([category, amount]) => ({ category, iznos: amount })).sort((a, b) => b.iznos - a.iznos).slice(0, 8)
    return { chartData, chartType: 'pie', chartConfig: Object.fromEntries(chartData.map((d, i) => [d.category, { label: d.category, color: colors[i % colors.length] }])) }
  }

  if (entity === 'deals' && filters.groupBy === 'stage') {
    const deals = await db.deal.findMany({ where: { stage: { notIn: ['won', 'lost'] } }, select: { stage: true, expectedRevenue: true } })
    const stageData: Record<string, { count: number; value: number }> = {}
    for (const d of deals) {
      if (!stageData[d.stage]) stageData[d.stage] = { count: 0, value: 0 }
      stageData[d.stage].count++
      stageData[d.stage].value += d.expectedRevenue
    }
    const chartData = Object.entries(stageData).map(([stage, data]) => ({ stage, vrednost: data.value, broj: data.count }))
    return { chartData, chartType: 'bar', chartConfig: { vrednost: { label: 'Vrednost (RSD)', color: colors[2] }, broj: { label: 'Broj prilika', color: colors[1] } } }
  }

  if (entity === 'invoices' && filters.groupBy === 'status') {
    const invoices = await db.invoice.findMany({ select: { status: true, totalAmount: true } })
    const statusData: Record<string, { count: number; total: number }> = {}
    for (const inv of invoices) {
      if (!statusData[inv.status]) statusData[inv.status] = { count: 0, total: 0 }
      statusData[inv.status].count++
      statusData[inv.status].total += inv.totalAmount
    }
    const chartData = Object.entries(statusData).map(([status, data]) => ({ status, iznos: data.total, broj: data.count }))
    return { chartData, chartType: 'pie', chartConfig: Object.fromEntries(chartData.map((d, i) => [d.status, { label: d.status, color: colors[i % colors.length] }])) }
  }

  return null
}

// ============ HELPER: Execute create ============

async function executeCreate(
  entity: string,
  data: Record<string, unknown>,
): Promise<{ success: boolean; message: string; module?: string }> {
  switch (entity) {
    case 'partner': {
      if (!data.name) return { success: false, message: 'Naziv partnera je obavezan.' }
      if (data.pib) {
        const existing = await db.partner.findFirst({ where: { pib: data.pib as string } })
        if (existing) return { success: false, message: `Partner sa PIB-om ${data.pib} već postoji.` }
      }
      const partner = await db.partner.create({
        data: { name: data.name as string, pib: (data.pib as string) || null, maticniBr: (data.maticniBr as string) || null, address: (data.address as string) || null, city: (data.city as string) || null, email: (data.email as string) || null, phone: (data.phone as string) || null, type: (data.type as string) || 'kupac' },
      })
      return { success: true, message: `Partner "${partner.name}" kreiran.`, module: 'partneri' }
    }
    case 'contact': {
      if (!data.firstName) return { success: false, message: 'Ime kontakta je obavezno.' }
      const contact = await db.contact.create({
        data: { firstName: data.firstName as string, lastName: (data.lastName as string) || '', email: (data.email as string) || null, phone: (data.phone as string) || null, position: (data.position as string) || null, company: (data.company as string) || null },
      })
      return { success: true, message: `Kontakt "${contact.firstName} ${contact.lastName}" kreiran.`, module: 'crm' }
    }
    case 'project': {
      if (!data.name) return { success: false, message: 'Naziv projekta je obavezan.' }
      const project = await db.project.create({
        data: { name: data.name as string, description: (data.description as string) || null, status: 'aktivan', budget: (data.budget as number) || 0, priority: (data.priority as string) || 'srednji' },
      })
      return { success: true, message: `Projekat "${project.name}" kreiran.`, module: 'projekti' }
    }
    default:
      return { success: false, message: `Kreiranje za "${entity}" nije podržano.` }
  }
}

// ============ HELPER: Execute update ============

async function executeUpdate(
  entity: string,
  filters: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<{ success: boolean; message: string }> {
  switch (entity) {
    case 'invoice': {
      const where: Prisma.InvoiceWhereInput = {}
      if (filters.number) where.number = { contains: filters.number as string, mode: 'insensitive' }
      if (filters.id) where.id = filters.id as string
      if (!filters.number && !filters.id) return { success: false, message: 'Morate navesti broj ili ID fakture.' }
      const updateData: Prisma.InvoiceUpdateInput = {}
      if (data.status) updateData.status = data.status as string
      const result = await db.invoice.updateMany({ where, data: updateData })
      if (result.count === 0) return { success: false, message: 'Faktura nije pronađena.' }
      return { success: true, message: `Faktura ažurirana: status = ${data.status}` }
    }
    default:
      return { success: false, message: `Ažuriranje za "${entity}" nije podržano.` }
  }
}

// ============ MAIN POST HANDLER ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, agentId, context, history } = body as {
      message: string
      agentId: AgentId
      context?: string
      history?: Array<{ role: string; content: string }>
    }

    if (!message || !agentId) {
      return NextResponse.json({ error: 'Message and agentId are required' }, { status: 400 })
    }

    // Get agent and system prompt
    const agent = getAgentById(agentId)
    const systemPrompt = agentId === 'orchestrator'
      ? buildOrchestratorPrompt()
      : agent?.systemPrompt || buildOrchestratorPrompt()

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt + (context ? `\n\nKONTEKST: ${context}` : '') },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // Call LLM
    const zai = new ZAI()
    const completion = await zai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages as Array<{ role: string; content: string }>,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const llmContent = completion.choices?.[0]?.message?.content || ''
    const parsed = parseAIResponse(llmContent)
    const action = parsed.actionType || 'general'

    // Execute action if present in parsed reply
    let actionData = parsed.data
    let actionType = parsed.actionType
    let targetModule = parsed.module

    // Try to extract action from JSON if available in the raw content
    try {
      const jsonMatch = llmContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        const actionObj = JSON.parse(jsonMatch[1].trim())
        if (actionObj.action) {
          const a = actionObj.action
          actionData = actionObj.data

          if (a.type === 'dashboard') {
            const dashboard = await getDashboardOverview()
            actionData = { ...actionData, kpis: dashboard.kpis, summaryValue: dashboard.summaryValue, summaryLabel: dashboard.summaryLabel }
          } else if (a.type === 'query' && a.entity) {
            const result = await executeQuery(a.entity, a.filters || {}, a.sort, a.limit)
            actionData = { ...actionData, columns: result.columns, rows: result.rows }
          } else if (a.type === 'chart' && a.entity) {
            const result = await executeAnalytics(a.entity, a.filters || {})
            if (result) {
              actionData = { ...actionData, chartData: result.chartData, chartType: result.chartType as 'bar' | 'line' | 'pie' | 'area', chartConfig: result.chartConfig, summaryValue: result.summaryValue, summaryLabel: result.summaryLabel }
            }
          } else if (a.type === 'create' && a.entity) {
            const result = await executeCreate(a.entity, a.data || {})
            actionData = { ...actionData, actionLabel: result.message, actionType: 'created' as const, module: result.module }
            actionType = 'created'
            targetModule = result.module
          } else if (a.type === 'update' && a.entity) {
            const result = await executeUpdate(a.entity, a.filters || {}, a.data || {})
            actionData = { ...actionData, actionLabel: result.message, actionType: 'updated' as const }
            actionType = 'updated'
          } else if (a.type === 'navigate' && a.module) {
            targetModule = a.module
            actionType = 'navigate'
          }
        }
      }
    } catch {
      // Non-JSON response — just use the text reply
    }

    return NextResponse.json({
      reply: parsed.reply,
      actionType,
      module: targetModule,
      data: actionData,
      agentId,
      agentName: agent?.name,
    })
  } catch (error) {
    console.error('AI Team error:', error)
    return NextResponse.json(
      { reply: 'Izvinjavam se, došlo je do greške. Pokušajte ponovo.', error: String(error) },
      { status: 500 },
    )
  }
}
