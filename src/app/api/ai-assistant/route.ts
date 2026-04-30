import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// ============ TYPES ============

interface AIAction {
  type: 'query' | 'create' | 'update' | 'navigate' | 'chart' | 'general'
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
  action?: AIAction
  data?: {
    columns?: Array<{ key: string; label: string }>
    rows?: Array<Record<string, unknown>>
    chartData?: Array<Record<string, unknown>>
    chartType?: 'bar' | 'line' | 'pie' | 'area'
    chartConfig?: Record<string, { label: string; color: string }>
    summaryValue?: string | number
    summaryLabel?: string
    module?: string
    actionLabel?: string
    actionType?: 'navigate' | 'created' | 'updated'
  }
}

// ============ SYSTEM PROMPT ============

const SYSTEM_PROMPT = `Ti si AI asistent za Reflection Business ERP sistem na srpskom jeziku. Tvoja uloga je da RAZUMEEŠ korisnikovu nameru i IZVRŠIŠ odgovarajuću akciju.

DOSTUPNI PODACI I AKCIJE:

1. **FAKTURE (Invoice)**: number, date, dueDate, status (nacrt/poslata/placena/otkazana), type (izlazna/ulazna/predracun), totalAmount, taxAmount, partnerId→Partner.name
   - Query: po datumu, statusu, partneru, iznosu
   - Create: nova faktura (zahteva partnerName)
   - Update: promena statusa (npr. placena)

2. **PARTNERI (Partner)**: name, pib, maticniBr, address, city, type (kupac/dobavljac/partner), email, phone
   - Query: po imenu, tipu, PIB-u
   - Create: novi partner (zahteva name, pib)

3. **PROIZVODI (Product)**: name, sku, category, unit, purchasePrice, sellingPrice, minStock, currentStock, isActive
   - Query: po kategoriji, zalihama (niska zaliha), ceni
   - "Koje robe fale?" → proizvodi gde currentStock <= minStock

4. **TRANSAKCIJE (Transaction)**: date, type (prihod/rashod), category (promet/nabavka/plata/režije/ostalo), amount, description
   - Query: prihodi/rashodi po periodu, kategoriji

5. **KASA (CashRegister)**: date, type (ulaz/izlaz), amount, description, partnerName, paymentMethod
   - "Koliko gotovine imam?" → suma ulaza - suma izlaza

6. **ZALIHE (StockMovement)**: productId, date, type (prijem/izdavanje/inventura/korekcija), quantity

7. **CRM KONTAKTI (Contact)**: firstName, lastName, email, phone, position, company, tags

8. **PROJEKTI (Project)**: name, status, budget, spent, priority, assignedTo

9. **ZAPOSLENI (Employee)**: firstName, lastName, position, department, baseSalary, isActive

ODGOVARAJ U SLEDEĆEM FORMATU (JSON u code block):

\`\`\`json
{
  "reply": "Ljudski čitljiv odgovor na srpskom",
  "action": {
    "type": "query|create|update|navigate|chart|general",
    "entity": "invoices|partners|products|transactions|cashregister|stock|contacts|projects|employees",
    "filters": {},
    "sort": "totalAmount",
    "limit": 10,
    "module": "fakture"
  },
  "data": {
    "columns": [{"key": "name", "label": "Naziv"}],
    "rows": [],
    "chartData": [],
    "chartType": "bar|line|pie|area",
    "summaryValue": "123,456 RSD",
    "summaryLabel": "Ukupan prihod"
  }
}
\`\`\`

PRAVILA:
- AKO korisnik traži PODATKE → type: "query" ili "chart" sa filters
- AKO korisnik traži KREIRANJE → type: "create" sa data
- AKO korisnik traži NAVIGACIJU → type: "navigate" sa module
- AKO korisnik traži AŽURIRANJE → type: "update" sa entity, filters, data
- Za uporedbe i analitiku → type: "chart" sa chartData
- AKO je generalno pitanje → type: "general" bez data
- "Neplaćene fakture" → status: "poslata"
- "Niska zaliha" → currentStock <= minStock
- "Top partneri" → sort po ukupnom iznosu faktura
- "Stanje gotovine" → cashregister ulaz - izlaz
- Uvek odgovaraj na srpskom
- Budi konkretan i koristan
- Za upite koje vraćaju tabele, uvek definiši columns i rows

Današnji datum: ${new Date().toISOString().split('T')[0]}`

// ============ HELPER: Parse LLM response ============

function parseAIResponse(content: string): AIResponse {
  const defaultResponse: AIResponse = {
    reply: content,
  }

  try {
    // Try to extract JSON from code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim())
      return {
        reply: parsed.reply || content,
        action: parsed.action,
        data: parsed.data,
      }
    }

    // Try to parse the entire content as JSON
    const parsed = JSON.parse(content.trim())
    return {
      reply: parsed.reply || content,
      action: parsed.action,
      data: parsed.data,
    }
  } catch {
    return defaultResponse
  }
}

// ============ HELPER: Execute DB query ============

async function executeQuery(
  entity: string,
  filters: Record<string, unknown>,
  sort?: string,
  limit?: number
): Promise<{ columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>> }> {
  const lim = limit || 20

  switch (entity) {
    case 'invoices': {
      const where: Prisma.InvoiceWhereInput = {}

      if (filters.status) where.status = filters.status as string
      if (filters.type) where.type = filters.type as string
      if (filters.partnerName) {
        where.partner = { name: { contains: filters.partnerName as string, mode: 'insensitive' } }
      }
      if (filters.number) {
        where.number = { contains: filters.number as string, mode: 'insensitive' }
      }
      if (filters.dateFrom || filters.dateTo) {
        where.date = {}
        if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom as string)
        if (filters.dateTo) where.date.lte = new Date(filters.dateTo as string)
      }
      if (filters.dueDateBefore) {
        where.dueDate = { lt: new Date(filters.dueDateBefore as string) }
      }

      const orderBy: Prisma.InvoiceOrderByWithRelationInput = sort === 'totalAmount'
        ? { totalAmount: 'desc' }
        : { date: 'desc' }

      const records = await db.invoice.findMany({
        where,
        orderBy,
        take: lim,
        include: { partner: { select: { name: true } } },
      })

      return {
        columns: [
          { key: 'number', label: 'Broj' },
          { key: 'partnerName', label: 'Partner' },
          { key: 'date', label: 'Datum' },
          { key: 'totalAmount', label: 'Iznos' },
          { key: 'status', label: 'Status' },
        ],
        rows: records.map((r) => ({
          number: r.number,
          partnerName: r.partner.name,
          date: r.date.toLocaleDateString('sr-RS'),
          totalAmount: r.totalAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          status: r.status,
        })),
      }
    }

    case 'partners': {
      const where: Prisma.PartnerWhereInput = {}
      if (filters.name) where.name = { contains: filters.name as string, mode: 'insensitive' }
      if (filters.type) where.type = filters.type as string
      if (filters.pib) where.pib = filters.pib as string
      if (filters.city) where.city = { contains: filters.city as string, mode: 'insensitive' }

      // Top partners by invoice total
      if (sort === 'totalInvoiced' || sort === 'totalAmount') {
        const partnersWithTotals = await db.invoice.groupBy({
          by: ['partnerId'],
          where: { status: { not: 'otkazana' } },
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: lim,
        })

        const partnerIds = partnersWithTotals.map((p) => p.partnerId)
        const partners = await db.partner.findMany({
          where: { id: { in: partnerIds } },
        })

        const partnerMap = new Map(partners.map((p) => [p.id, p.name]))

        return {
          columns: [
            { key: 'name', label: 'Partner' },
            { key: 'totalInvoiced', label: 'Ukupno fakturisano' },
          ],
          rows: partnersWithTotals.map((p) => ({
            name: partnerMap.get(p.partnerId) || 'Nepoznato',
            totalInvoiced: (p._sum.totalAmount || 0).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          })),
        }
      }

      const records = await db.partner.findMany({
        where,
        orderBy: { name: 'asc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'name', label: 'Naziv' },
          { key: 'pib', label: 'PIB' },
          { key: 'city', label: 'Grad' },
          { key: 'type', label: 'Tip' },
        ],
        rows: records.map((r) => ({
          name: r.name,
          pib: r.pib,
          city: r.city || '-',
          type: r.type,
        })),
      }
    }

    case 'products': {
      const where: Prisma.ProductWhereInput = { isActive: true }

      if (filters.lowStock === true) {
        where.currentStock = { lte: Prisma.raw('Product.minStock') as unknown as number }
        // Fallback: fetch all and filter
        const allProducts = await db.product.findMany({
          where: { isActive: true },
          take: 200,
        })
        const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStock)

        return {
          columns: [
            { key: 'name', label: 'Naziv proizvoda' },
            { key: 'sku', label: 'Šifra' },
            { key: 'currentStock', label: 'Trenutno stanje' },
            { key: 'minStock', label: 'Min. zaliha' },
            { key: 'unit', label: 'Jed. mere' },
          ],
          rows: lowStockProducts.map((p) => ({
            name: p.name,
            sku: p.sku,
            currentStock: p.currentStock,
            minStock: p.minStock,
            unit: p.unit,
          })),
        }
      }

      if (filters.category) where.category = { contains: filters.category as string, mode: 'insensitive' }

      const records = await db.product.findMany({
        where,
        orderBy: sort === 'currentStock' ? { currentStock: 'asc' } : { name: 'asc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'name', label: 'Naziv' },
          { key: 'sku', label: 'Šifra' },
          { key: 'currentStock', label: 'Zaliha' },
          { key: 'sellingPrice', label: 'Prodajna cena' },
          { key: 'unit', label: 'Jed. mere' },
        ],
        rows: records.map((r) => ({
          name: r.name,
          sku: r.sku,
          currentStock: `${r.currentStock} ${r.unit}`,
          sellingPrice: r.sellingPrice.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          unit: r.unit,
        })),
      }
    }

    case 'transactions': {
      const where: Prisma.TransactionWhereInput = {}
      if (filters.type) where.type = filters.type as string
      if (filters.category) where.category = filters.category as string
      if (filters.dateFrom || filters.dateTo) {
        where.date = {}
        if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom as string)
        if (filters.dateTo) where.date.lte = new Date(filters.dateTo as string)
      }

      const records = await db.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'date', label: 'Datum' },
          { key: 'type', label: 'Tip' },
          { key: 'category', label: 'Kategorija' },
          { key: 'amount', label: 'Iznos' },
          { key: 'description', label: 'Opis' },
        ],
        rows: records.map((r) => ({
          date: r.date.toLocaleDateString('sr-RS'),
          type: r.type === 'prihod' ? '🟢 Prihod' : '🔴 Rashod',
          category: r.category,
          amount: r.amount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          description: r.description,
        })),
      }
    }

    case 'cashregister': {
      const totalIn = await db.cashRegister.aggregate({
        where: { type: 'ulaz' },
        _sum: { amount: true },
      })
      const totalOut = await db.cashRegister.aggregate({
        where: { type: 'izlaz' },
        _sum: { amount: true },
      })
      const balance = (totalIn._sum.amount || 0) - (totalOut._sum.amount || 0)

      const recent = await db.cashRegister.findMany({
        orderBy: { date: 'desc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'date', label: 'Datum' },
          { key: 'type', label: 'Tip' },
          { key: 'amount', label: 'Iznos' },
          { key: 'description', label: 'Opis' },
          { key: 'paymentMethod', label: 'Način plaćanja' },
        ],
        rows: recent.map((r) => ({
          date: r.date.toLocaleDateString('sr-RS'),
          type: r.type === 'ulaz' ? '🟢 Ulaz' : '🔴 Izlaz',
          amount: r.amount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          description: r.description,
          paymentMethod: r.paymentMethod,
        })),
        summary: {
          balance: balance.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          totalIn: (totalIn._sum.amount || 0).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          totalOut: (totalOut._sum.amount || 0).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
        },
      }
    }

    case 'contacts': {
      const where: Prisma.ContactWhereInput = {}
      if (filters.name) {
        where.OR = [
          { firstName: { contains: filters.name as string, mode: 'insensitive' } },
          { lastName: { contains: filters.name as string, mode: 'insensitive' } },
        ]
      }
      if (filters.company) where.company = { contains: filters.company as string, mode: 'insensitive' }

      const records = await db.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'name', label: 'Ime i prezime' },
          { key: 'company', label: 'Kompanija' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Telefon' },
          { key: 'position', label: 'Pozicija' },
        ],
        rows: records.map((r) => ({
          name: `${r.firstName} ${r.lastName}`,
          company: r.company || '-',
          email: r.email || '-',
          phone: r.phone || '-',
          position: r.position || '-',
        })),
      }
    }

    case 'projects': {
      const where: Prisma.ProjectWhereInput = {}
      if (filters.status) where.status = filters.status as string

      const records = await db.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'name', label: 'Naziv projekta' },
          { key: 'status', label: 'Status' },
          { key: 'budget', label: 'Budžet' },
          { key: 'spent', label: 'Potrošeno' },
          { key: 'priority', label: 'Prioritet' },
        ],
        rows: records.map((r) => ({
          name: r.name,
          status: r.status,
          budget: r.budget.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          spent: r.spent.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          priority: r.priority,
        })),
      }
    }

    case 'employees': {
      const where: Prisma.EmployeeWhereInput = {}
      if (filters.department) where.department = { contains: filters.department as string, mode: 'insensitive' }
      if (filters.isActive === true) where.isActive = true

      const records = await db.employee.findMany({
        where,
        orderBy: { lastName: 'asc' },
        take: lim,
      })

      return {
        columns: [
          { key: 'name', label: 'Ime i prezime' },
          { key: 'position', label: 'Pozicija' },
          { key: 'department', label: 'Odeljenje' },
          { key: 'baseSalary', label: 'Osnovica' },
          { key: 'isActive', label: 'Status' },
        ],
        rows: records.map((r) => ({
          name: `${r.firstName} ${r.lastName}`,
          position: r.position || '-',
          department: r.department || '-',
          baseSalary: r.baseSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          isActive: r.isActive ? 'Aktivan' : 'Neaktivan',
        })),
      }
    }

    default:
      return { columns: [], rows: [] }
  }
}

// ============ HELPER: Execute analytics query ============

async function executeAnalytics(
  action: AIAction
): Promise<{
  chartData?: Array<Record<string, unknown>>
  chartType: string
  chartConfig: Record<string, { label: string; color: string }>
  summaryValue?: string
  summaryLabel?: string
} | null> {
  const filters = action.filters || {}

  // Revenue vs Expenses comparison
  if (action.entity === 'transactions' && filters.comparison === 'prihod_rashod') {
    const dateFrom = filters.dateFrom
      ? new Date(filters.dateFrom as string)
      : new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
    const dateTo = filters.dateTo
      ? new Date(filters.dateTo as string)
      : new Date()

    const transactions = await db.transaction.findMany({
      where: { date: { gte: dateFrom, lte: dateTo } },
      select: { date: true, type: true, amount: true, category: true },
    })

    // Group by month
    const monthlyData: Record<string, { prihod: number; rashod: number }> = {}
    for (const t of transactions) {
      const monthKey = t.date.toLocaleDateString('sr-RS', { year: 'numeric', month: 'short' })
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { prihod: 0, rashod: 0 }
      if (t.type === 'prihod') monthlyData[monthKey].prihod += t.amount
      else monthlyData[monthKey].rashod += t.amount
    }

    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      prihod: data.prihod,
      rashod: data.rashod,
    }))

    const totalPrihod = chartData.reduce((s, d) => s + d.prihod, 0)
    const totalRashod = chartData.reduce((s, d) => s + d.rashod, 0)

    return {
      chartData,
      chartType: 'bar',
      chartConfig: {
        prihod: { label: 'Prihod', color: 'hsl(142, 76%, 36%)' },
        rashod: { label: 'Rashod', color: 'hsl(0, 84%, 60%)' },
      },
      summaryValue: (totalPrihod - totalRashod).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
      summaryLabel: 'Neto rezultat',
    }
  }

  // Revenue by category
  if (action.entity === 'transactions' && filters.groupBy === 'category') {
    const dateFrom = filters.dateFrom
      ? new Date(filters.dateFrom as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const dateTo = filters.dateTo
      ? new Date(filters.dateTo as string)
      : new Date()

    const transactions = await db.transaction.findMany({
      where: {
        date: { gte: dateFrom, lte: dateTo },
        type: filters.type as string | undefined,
      },
      select: { category: true, type: true, amount: true },
    })

    const categoryData: Record<string, number> = {}
    for (const t of transactions) {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount
    }

    const chartData = Object.entries(categoryData)
      .map(([category, amount]) => ({ category, iznos: amount }))
      .sort((a, b) => b.iznos - a.iznos)
      .slice(0, 8)

    const colors = [
      'hsl(142, 76%, 36%)',
      'hsl(221, 83%, 53%)',
      'hsl(47, 96%, 53%)',
      'hsl(0, 84%, 60%)',
      'hsl(262, 83%, 58%)',
      'hsl(199, 89%, 48%)',
      'hsl(326, 100%, 74%)',
      'hsl(24, 95%, 53%)',
    ]

    return {
      chartData,
      chartType: 'pie',
      chartConfig: Object.fromEntries(
        chartData.map((d, i) => [d.category, { label: d.category, color: colors[i % colors.length] }])
      ),
    }
  }

  return null
}

// ============ HELPER: Execute create action ============

async function executeCreate(
  entity: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string; module?: string; recordId?: string }> {
  switch (entity) {
    case 'partner': {
      if (!data.name) return { success: false, message: 'Naziv partnera je obavezan.' }
      if (!data.pib) return { success: false, message: 'PIB partnera je obavezan.' }

      const existing = await db.partner.findUnique({ where: { pib: data.pib as string } })
      if (existing) return { success: false, message: `Partner sa PIB-om ${data.pib} već postoji.` }

      const partner = await db.partner.create({
        data: {
          name: data.name as string,
          pib: data.pib as string,
          maticniBr: (data.maticniBr as string) || null,
          address: (data.address as string) || null,
          city: (data.city as string) || null,
          email: (data.email as string) || null,
          phone: (data.phone as string) || null,
          type: (data.type as string) || 'kupac',
        },
      })

      return {
        success: true,
        message: `Partner "${partner.name}" (PIB: ${partner.pib}) je uspešno kreiran.`,
        module: 'partneri',
        recordId: partner.id,
      }
    }

    case 'invoice': {
      // For invoice creation, we navigate to the invoice module with pre-fill data
      return {
        success: true,
        message: `Usmeravam vas na kreiranje nove fakture${data.partnerName ? ` za ${data.partnerName}` : ''}.`,
        module: 'fakture',
      }
    }

    default:
      return { success: false, message: `Kreiranje za "${entity}" nije podržano.` }
  }
}

// ============ HELPER: Execute update action ============

async function executeUpdate(
  entity: string,
  filters: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string; module?: string }> {
  switch (entity) {
    case 'invoice': {
      const where: Prisma.InvoiceWhereInput = {}
      if (filters.number) where.number = { contains: filters.number as string, mode: 'insensitive' }

      if (!filters.number && !filters.id) {
        return { success: false, message: 'Morate navesti broj fakture za ažuriranje.' }
      }

      if (filters.id) where.id = filters.id as string

      const updateData: Prisma.InvoiceUpdateInput = {}
      if (data.status) updateData.status = data.status as string

      try {
        const invoice = await db.invoice.updateMany({
          where,
          data: updateData,
        })

        if (invoice.count === 0) {
          return { success: false, message: `Faktura nije pronađena.` }
        }

        return {
          success: true,
          message: `Faktura je uspešno ažurirana${data.status ? ` — status promenjen na "${data.status}".` : '.'}`,
          module: 'fakture',
        }
      } catch {
        return { success: false, message: 'Greška pri ažuriranju fakture.' }
      }
    }

    default:
      return { success: false, message: `Ažuriranje za "${entity}" nije podržano.` }
  }
}

// ============ HELPER: Calculate revenue summary ============

async function getRevenueSummary(
  dateFrom?: Date,
  dateTo?: Date
): Promise<{ summaryValue: string; summaryLabel: string }> {
  const from = dateFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const to = dateTo || new Date()

  const invoices = await db.invoice.findMany({
    where: {
      type: 'izlazna',
      status: { in: ['poslata', 'placena'] },
      date: { gte: from, lte: to },
    },
    select: { totalAmount: true },
  })

  const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  return {
    summaryValue: total.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
    summaryLabel: `Prihod (${from.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })})`,
  }
}

// ============ HELPER: Get module from entity ============

function getModuleFromEntity(entity: string): string {
  const map: Record<string, string> = {
    invoices: 'fakture',
    partners: 'partneri',
    products: 'magacin',
    transactions: 'finansije',
    cashregister: 'finansije',
    stock: 'magacin',
    contacts: 'crm',
    projects: 'projekti',
    employees: 'zaposleni',
  }
  return map[entity] || 'dashboard'
}

// ============ MAIN HANDLER ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build conversation messages
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    if (context && typeof context === 'string') {
      messages.push({ role: 'system', content: `Kontekst korisnika: ${context}` })
    }

    messages.push({ role: 'user', content: message })

    // Call LLM
    const response = await ZAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    })

    const rawReply = response.choices?.[0]?.message?.content || ''
    if (!rawReply) {
      return NextResponse.json({
        reply: 'Izvinjavam se, došlo je do greške pri generisanju odgovora.',
      })
    }

    // Parse the AI response for structured actions
    const parsed = parseAIResponse(rawReply)
    const action = parsed.action

    // If no action detected, return general reply
    if (!action || action.type === 'general') {
      return NextResponse.json({
        reply: parsed.reply,
        actionType: 'general',
      })
    }

    // Execute the action
    let responseData: AIResponse['data'] = parsed.data || {}
    let actionModule = action.module

    switch (action.type) {
      case 'query': {
        if (action.entity && action.entity === 'cashregister') {
          const result = await executeQuery('cashregister', action.filters || {}, action.sort, action.limit)
          const cashResult = result as { columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>>; summary?: Record<string, string> }

          responseData.columns = result.columns
          responseData.rows = result.rows
          if (cashResult.summary) {
            responseData.summaryValue = cashResult.summary.balance
            responseData.summaryLabel = 'Stanje blagajne'
          }
          actionModule = actionModule || 'finansije'
        } else if (action.entity) {
          const result = await executeQuery(
            action.entity,
            action.filters || {},
            action.sort,
            action.limit
          )
          responseData.columns = result.columns
          responseData.rows = result.rows
          actionModule = actionModule || getModuleFromEntity(action.entity)
        }
        break
      }

      case 'chart': {
        const analyticsResult = await executeAnalytics(action)
        if (analyticsResult) {
          responseData.chartData = analyticsResult.chartData
          responseData.chartType = analyticsResult.chartType as 'bar' | 'line' | 'pie' | 'area'
          responseData.chartConfig = analyticsResult.chartConfig
          responseData.summaryValue = analyticsResult.summaryValue
          responseData.summaryLabel = analyticsResult.summaryLabel
        }
        actionModule = actionModule || 'izvestaji'
        break
      }

      case 'create': {
        if (action.entity && action.data) {
          const result = await executeCreate(action.entity, action.data)
          responseData.actionLabel = result.message
          responseData.actionType = result.success ? 'created' : undefined
          responseData.module = result.module
          actionModule = result.module
        }
        break
      }

      case 'update': {
        if (action.entity && (action.filters || action.data)) {
          const result = await executeUpdate(
            action.entity,
            action.filters || {},
            action.data || {}
          )
          responseData.actionLabel = result.message
          responseData.actionType = result.success ? 'updated' : undefined
          responseData.module = result.module
          actionModule = result.module
        }
        break
      }

      case 'navigate': {
        responseData.module = action.module
        actionModule = action.module
        break
      }
    }

    // If query returned rows, enhance the reply
    if (responseData.rows && responseData.rows.length > 0) {
      const count = responseData.rows.length
      const entityLabel = {
        invoices: 'faktura',
        partners: 'partnera',
        products: 'proizvoda',
        transactions: 'transakcija',
        cashregister: 'kasa transakcija',
        contacts: 'kontakata',
        projects: 'projekata',
        employees: 'zaposlenih',
      }[action.entity || ''] || 'zapisa'

      if (action.type === 'query' && !parsed.data?.columns) {
        parsed.reply = `${parsed.reply}\n\nPronašao sam ${count} ${entityLabel}. Pogledajte rezultate u tabeli ispod.`
      }
    }

    return NextResponse.json({
      reply: parsed.reply,
      actionType: action.type,
      module: actionModule,
      data: responseData,
    })
  } catch (error) {
    console.error('Error calling AI assistant:', error)
    return NextResponse.json({
      reply: 'Izvinjavam se, došlo je do greške pri obradi vašeg zahteva. Molimo pokušajte ponovo.',
      actionType: 'error',
    })
  }
}
