import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

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
  action?: AIAction
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

// ============ ALL MODULES MAP ============

const ALL_MODULES_MAP: Record<string, string> = {
  'dashboard': 'Dashboard',
  'finansije': 'Finansije',
  'fakture': 'Fakture',
  'ponude': 'Ponude',
  'magacin': 'Magacin',
  'partneri': 'Partneri',
  'nabavka': 'Nabavka',
  'crm': 'CRM',
  'kalendar': 'Kalendar',
  'zaposleni': 'Zaposleni',
  'projekti': 'Projekti',
  'sredstva': 'Osnovna sredstva',
  'dokumenta': 'Dokumenta',
  'knjigovodstvo': 'Knjigovodstvo',
  'protokol': 'Protokol',
  'edukacija': 'Edukacija',
  'vozni-park': 'Vozni park',
  'kafe-restoran': 'Kafe/Restoran',
  'email-marketing': 'Email marketing',
  'rent-a-car': 'Rent-a-car',
  'izvestaji': 'Izveštaji',
  'integracije': 'Integracije',
  'bank-sync': 'Banka',
  'pos': 'POS Maloprodaja',
  'shipping': 'Shipping',
  'marketplace': 'Marketplace',
  'pretplate': 'Pretplate',
  'troskovi': 'Troškovi',
  'potpisi': 'Potpisi',
  'proizvodnja': 'Proizvodnja',
  'kvalitet': 'Kvalitet',
  'odrzavanje': 'Održavanje',
  'regrutacija': 'Regrutacija',
  'odsustva': 'Odsustva',
  'preporuke': 'Preporuke',
  'podrska': 'Podrška',
  'terenski-servis': 'Terenski servis',
  'zakazivanja': 'Zakazivanja',
  'planer': 'Planer',
  'drustvene-mreze': 'Društvene mreže',
  'sms-marketing': 'SMS marketing',
  'dogadjaji': 'Događaji',
  'mkt-automatizacija': 'MKT automatizacija',
  'ankete': 'Ankete',
  'chet': 'Čet',
  'baza-znanja': 'Baza znanja',
  'website': 'Website',
  'blog': 'Blog',
  'voip': 'VoIP',
  'iot': 'IoT',
  'forum': 'Forum',
  'plm': 'PLM',
  'ecommerce': 'E-commerce',
  'spreadsheet': 'Spreadsheet',
  'beleske': 'Beleške',
  'odobrenja': 'Odobrenja',
  'vestine': 'Veštine',
  'ugovori': 'Ugovori',
  'gamifikacija': 'Gamifikacija',
  'reklamacije': 'Reklamacije',
  'servis': 'Servis centar',
  'uskladenost': 'Usklađenost',
  'program-lojalnosti': 'Lojalnost',
  'podesavanja': 'Podešavanja',
  'zakoni': 'Zakoni',
  'notifications': 'Obaveštenja',
  'blagajna': 'Blagajna',
  'cenovnici': 'Cenovnici',
  'vozila': 'Vozila',
  'kamioni': 'Kamioni',
  'posetioci': 'Posetioci',
  'backup': 'Backup',
  'automatizacija': 'Automatizacija',
}

// ============ SYSTEM PROMPT ============

function buildSystemPrompt(): string {
  const today = new Date().toISOString().split('T')[0]
  const monthName = new Date().toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })

  return `Ti si REFLECTION AI — pametni ERP asistent za Reflection Business sistem na srpskom jeziku. 
Tvoja uloga je da KONTROLIŠEŠ kompletnu aplikaciju — možeš da tražiš podatke, kreiraš zapise, ažuriraš ih, generašeš izveštaje, i navigiraš kroz module.

## DOSTUPNI PODACI I AKCIJE:

### FINANSIJE
1. **FAKTURE (invoices)**: number, date, dueDate, status (nacrt/poslata/placena/otkazana), type (izlazna/ulazna/predracun/avansna), totalAmount, taxAmount, partnerId→Partner.name, currency, paymentMethod
   - Query: po datumu, statusu, partneru, iznosu, valuti
   - Create: nova faktura (zahteva partnerName)
   - Update: promena statusa
   - "Neplaćene fakture" → status: "poslata"

2. **PARTNERI (partners)**: name, pib, maticniBr, address, city, type (kupac/dobavljac/partner), email, phone, creditLimit, paymentTerms, tags, kycStatus
   - Query: po imenu, tipu, PIB-u, gradu
   - Create: novi partner (zahteva name)
   - "Top partneri" → sort po ukupnom iznosu faktura

3. **PROIZVODI (products)**: name, sku, category, unit, purchasePrice, sellingPrice, minStock, currentStock, barcode, weight
   - "Koje robe fale?" → lowStock: true
   - Query: po kategoriji, ceni, zalihama

4. **TRANSAKCIJE (transactions)**: date, type (prihod/rashod), category (promet/nabavka/plata/režije/ostalo), amount, description
   - Query: prihodi/rashodi po periodu, kategoriji

5. **KASA (cashregister)**: date, type (ulaz/izlaz), amount, description, partnerName, paymentMethod
   - "Koliko gotovine imam?" → cashregister

6. **NABAVKA (purchaseorders)**: number, date, partnerId, status (nacrt/poslata/primljena/otkazana), totalAmount
   - Query: po statusu, partneru, datumu

7. **BUDŽETI (budgets)**: accountCode, year, month values (january-december), totalAnnual
   - Query: po godini, accountCode-u

### CRM
8. **KONTAKTI (contacts)**: firstName, lastName, email, phone, position, company, tags, isClient, isLead
9. **PRILIKE (deals)**: title, value, stage (lead/kvalifikacija/predlog/pregovaranje/won/lost), probability, score, source, expectedRevenue, closeDate
   - "Pipeline" → deals grouped by stage
   - "Koje prilike gubimo?" → deals where lostReason exists or stage = lost
   - "Vrednost pipeline-a" → sum of expectedRevenue for active deals

10. **CRM AKTIVNOSTI (crmactivities)**: type (poziv/sastanak/email/task/napomena), title, dueDate, completed, priority

### MAGACIN
11. **ZALIHE (stock)**: productId, date, type (prijem/izdavanje/inventura/korekcija/transfer), quantity
12. **SKLADIŠNE LOKACIJE (warehouselocations)**: name, code, type, zone, capacity
13. **INVENTURA (inventorycounts)**: name, status (nacrt/u_toku/zavrsena)
14. **CENOVNICI (pricelists)**: name, validFrom, validTo, items

### HR & KADROVI
15. **ZAPOSLENI (employees)**: firstName, lastName, position, department, baseSalary, contractType, hireDate, isActive
16. **PLATE (payrolls)**: month, year, baseSalary, bonuses, deductions, netSalary, status
    - "Plate ovog meseca" → current month payroll
17. **PRISUSTVO (attendances)**: date, clockIn, clockOut, hoursWorked, type (rad/bolovanje/godisnji)
18. **ODSUSTVA (leaverequests)**: type, startDate, endDate, status
19. **OCENE (evaluations)**: period, year, rating (1-5), strengths, weaknesses

### PROJEKTI
20. **PROJEKTI (projects)**: name, status (aktivan/zavrsen/pauziran/otkazan), budget, spent, priority, progress
    - "Projekti u problemu" → projects where spent > budget * 0.8
21. **ZADACI (projecttasks)**: title, status (todo/u_toku/zavrseno/blokirano), priority, dueDate, estimatedHours, loggedHours
22. **TIMESHEET (timesheets)**: date, hours, description

### VOZNI PARK
23. **VOZILA (vehicles)**: registration, make, model, year, fuelType, mileage, status (aktivno/na_servisu/u_garazi)
24. **SERVISI VOZILA (vehicleservices)**: date, type (servis/promjena_ulja/gume/tehnicki/registracija), cost, nextDue
25. **TROŠKOVI VOZILA (vehicleexpenses)**: date, type (gorivo/putarina/parking/servis), amount

### OSTALO
26. **OSNOVNA SREDSTVA (assets)**: name, category, serialNumber, purchaseDate, purchasePrice, currentValue, depreciation, status
27. **NALOZI KNJIGOVODSTVA (accounts)**: code, name, type (aktivna/pasivna/prihodka/rashodna)
28. **KNJIŽNI ZAPISI (journalentries)**: date, debit, credit, description, partnerId, voucherNumber
29. **KALENDAR (events)**: title, startTime, endTime, type, allDay
30. **PODRŠKA (helpdesktickets)**: subject, description, status, priority, createdAt
31. **NARUDŽBENICE (posorders)**: number, type (dostava/pickup), status, total
32. **POŠILJKE (shippingorders)**: number, carrierId, status, partnerId
33. **PROIZVODNJA (manufacturingorders)**: number, status, productId, quantity
34. **OTPREMNICE (deliverynotes)**: number, partnerId, status
35. **PONAVLJAJUĆE FAKTURE (recurringinvoices)**: name, frequency, nextDate, isActive

## DASHBOARD OVERVIEW
AKO korisnik traži "pregled", "dashboard", "kako stojimo", "status" → type: "dashboard"
Sistem automatski vraća KPI kartice: ukupan prihod, neplaćene fakture, broj partnera, aktuelni projekti, stanje blagajne.

## MODULI — NAVIGACIJA
Možeš navigirati korisnika na bilo koji modul. Dostupni moduli (koristi module ID):
${Object.entries(ALL_MODULES_MAP).map(([k, v]) => `- ${k} → ${v}`).join('\n')}

AKO korisnik kaže "Otvori fakture" ili "Idi na CRM" → type: "navigate", module: "fakture" ili "crm"

## FORMAT ODGOVORA (JSON u code block):

\`\`\`json
{
  "reply": "Ljudski čitljiv odgovor na srpskom",
  "action": {
    "type": "query|create|update|navigate|chart|dashboard|general",
    "entity": "invoices|partners|products|transactions|cashregister|contacts|deals|projects|employees|vehicles|assets|...",
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
    "chartConfig": {},
    "summaryValue": "123,456 RSD",
    "summaryLabel": "Ukupan prihod"
  }
}
\`\`\`

## PRAVILA:
- UVEK odgovaraj na srpskom jeziku
- AKO korisnik traži PODATKE → type: "query" sa filters
- AKO korisnik traži KREIRANJE → type: "create" sa data  
- AKO korisnik traži NAVIGACIJU → type: "navigate" sa module
- AKO korisnik traži AŽURIRANJE → type: "update" sa entity, filters, data
- AKO korisnik traži PREGLED → type: "dashboard"
- Za analitiku i grafike → type: "chart"
- Za generalna pitanja → type: "general"
- Budi konkretan, koristan i stručan
- Nudi akcione predloge kada je moguće
- Za tabelarne podatke UVEK definiši columns i rows
- Razumej kontekst — ako korisnik pita "stanje" u modulu fakture, misli na fakture
- Formatiši iznose u RSD sa lokalnim formatiranjem

Današnji datum: ${today}
Trenutni mesec: ${monthName}`
}

// ============ HELPER: Parse LLM response ============

function parseAIResponse(content: string): AIResponse {
  const defaultResponse: AIResponse = { reply: content }

  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim())
      return { reply: parsed.reply || content, action: parsed.action, data: parsed.data }
    }
    const parsed = JSON.parse(content.trim())
    return { reply: parsed.reply || content, action: parsed.action, data: parsed.data }
  } catch {
    return defaultResponse
  }
}

// ============ HELPER: Get company from header ============

function getCompanyId(request: NextRequest): string | null {
  return request.headers.get('x-company-id') || null
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
    // Total revenue this month
    db.invoice.aggregate({
      where: { type: 'izlazna', status: { in: ['poslata', 'placena'] }, date: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    // Unpaid invoices
    db.invoice.aggregate({
      where: { status: 'poslata' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    // Partner count
    db.partner.count({ where: { isActive: true } }),
    // Active projects
    db.project.findMany({ where: { status: 'aktivan' }, take: 100, select: { budget: true, spent: true } }),
    // Cash balance
    Promise.all([
      db.cashRegister.aggregate({ where: { type: 'ulaz' }, _sum: { amount: true } }),
      db.cashRegister.aggregate({ where: { type: 'izlaz' }, _sum: { amount: true } }),
    ]),
    // Employee count
    db.employee.count({ where: { isActive: true } }),
    // Deal pipeline
    db.deal.aggregate({
      where: { stage: { notIn: ['won', 'lost'] } },
      _sum: { expectedRevenue: true },
      _count: true,
    }),
    // Vehicle count
    db.vehicle.count({ where: { status: 'aktivno' } }),
  ])

  const revenue = invoiceStats._sum.totalAmount || 0
  const unpaid = unpaidInvoices._sum.totalAmount || 0
  const unpaidCount = unpaidInvoices._count
  const [cashIn, cashOut] = cashStats
  const cashBalance = (cashIn._sum.amount || 0) - (cashOut._sum.amount || 0)
  const projectBudget = projectStats.reduce((s, p) => s + p.budget, 0)
  const projectSpent = projectStats.reduce((s, p) => s + p.spent, 0)
  const pipelineValue = dealStats._sum.expectedRevenue || 0
  const pipelineCount = dealStats._count

  return {
    kpis: [
      { label: 'Prihod ovog meseca', value: revenue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) },
      { label: 'Neplaćene fakture', value: `${unpaid.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 })} (${unpaidCount})`, trend: 'warning' },
      { label: 'Stanje blagajne', value: cashBalance.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) },
      { label: 'Aktivni partneri', value: String(partnerCount) },
      { label: 'Aktivni projekti', value: `${projectStats.length} (${(projectSpent / projectBudget * 100 || 0).toFixed(0)}% iskorišćeno)` },
      { label: 'CRM Pipeline', value: `${pipelineValue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 })} (${pipelineCount} prilika)` },
      { label: 'Zaposleni', value: String(employeeCount) },
      { label: 'Aktivna vozila', value: String(vehicleCount) },
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
  limit?: number
): Promise<{ columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>>; summary?: Record<string, string> }> {
  const lim = limit || 20

  switch (entity) {
    case 'invoices': {
      const where: Prisma.InvoiceWhereInput = {}
      if (filters.status) where.status = filters.status as string
      if (filters.type) where.type = filters.type as string
      if (filters.partnerName) where.partner = { name: { contains: filters.partnerName as string, mode: 'insensitive' } }
      if (filters.number) where.number = { contains: filters.number as string, mode: 'insensitive' }
      if (filters.dateFrom || filters.dateTo) {
        where.date = {}
        if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom as string)
        if (filters.dateTo) where.date.lte = new Date(filters.dateTo as string)
      }
      if (filters.dueDateBefore) where.dueDate = { lt: new Date(filters.dueDateBefore as string) }

      const orderBy: Prisma.InvoiceOrderByWithRelationInput = sort === 'totalAmount' ? { totalAmount: 'desc' } : { date: 'desc' }
      const records = await db.invoice.findMany({ where, orderBy, take: lim, include: { partner: { select: { name: true } } } })

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
      if (filters.kycStatus) where.kycStatus = filters.kycStatus as string

      if (sort === 'totalInvoiced' || sort === 'totalAmount') {
        const partnersWithTotals = await db.invoice.groupBy({
          by: ['partnerId'],
          where: { status: { not: 'otkazana' } },
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: lim,
        })
        const partnerIds = partnersWithTotals.map((p) => p.partnerId)
        const partners = await db.partner.findMany({ where: { id: { in: partnerIds } } })
        const partnerMap = new Map(partners.map((p) => [p.id, p.name]))
        return {
          columns: [{ key: 'name', label: 'Partner' }, { key: 'totalInvoiced', label: 'Ukupno fakturisano' }],
          rows: partnersWithTotals.map((p) => ({
            name: partnerMap.get(p.partnerId) || 'Nepoznato',
            totalInvoiced: (p._sum.totalAmount || 0).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }),
          })),
        }
      }

      const records = await db.partner.findMany({ where, orderBy: { name: 'asc' }, take: lim })
      return {
        columns: [{ key: 'name', label: 'Naziv' }, { key: 'pib', label: 'PIB' }, { key: 'city', label: 'Grad' }, { key: 'type', label: 'Tip' }],
        rows: records.map((r) => ({ name: r.name, pib: r.pib || '-', city: r.city || '-', type: r.type })),
      }
    }

    case 'products': {
      const where: Prisma.ProductWhereInput = { isActive: true }

      if (filters.lowStock === true) {
        const allProducts = await db.product.findMany({ where: { isActive: true }, take: 200 })
        const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStock)
        return {
          columns: [{ key: 'name', label: 'Naziv' }, { key: 'sku', label: 'Šifra' }, { key: 'currentStock', label: 'Trenutno' }, { key: 'minStock', label: 'Minimum' }, { key: 'unit', label: 'Jed. mere' }],
          rows: lowStockProducts.map((p) => ({ name: p.name, sku: p.sku, currentStock: p.currentStock, minStock: p.minStock, unit: p.unit })),
        }
      }

      if (filters.category) where.category = { contains: filters.category as string, mode: 'insensitive' }
      const records = await db.product.findMany({
        where,
        orderBy: sort === 'currentStock' ? { currentStock: 'asc' } : sort === 'sellingPrice' ? { sellingPrice: 'desc' } : { name: 'asc' },
        take: lim,
      })
      return {
        columns: [{ key: 'name', label: 'Naziv' }, { key: 'sku', label: 'Šifra' }, { key: 'currentStock', label: 'Zaliha' }, { key: 'sellingPrice', label: 'Prodajna cena' }, { key: 'unit', label: 'Jed. mere' }],
        rows: records.map((r) => ({ name: r.name, sku: r.sku, currentStock: `${r.currentStock} ${r.unit}`, sellingPrice: r.sellingPrice.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), unit: r.unit })),
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
      const records = await db.transaction.findMany({ where, orderBy: { date: 'desc' }, take: lim })
      return {
        columns: [{ key: 'date', label: 'Datum' }, { key: 'type', label: 'Tip' }, { key: 'category', label: 'Kategorija' }, { key: 'amount', label: 'Iznos' }, { key: 'description', label: 'Opis' }],
        rows: records.map((r) => ({ date: r.date.toLocaleDateString('sr-RS'), type: r.type === 'prihod' ? '🟢 Prihod' : '🔴 Rashod', category: r.category, amount: r.amount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), description: r.description })),
      }
    }

    case 'cashregister': {
      const [totalIn, totalOut] = await Promise.all([
        db.cashRegister.aggregate({ where: { type: 'ulaz' }, _sum: { amount: true } }),
        db.cashRegister.aggregate({ where: { type: 'izlaz' }, _sum: { amount: true } }),
      ])
      const balance = (totalIn._sum.amount || 0) - (totalOut._sum.amount || 0)
      const recent = await db.cashRegister.findMany({ orderBy: { date: 'desc' }, take: lim })
      return {
        columns: [{ key: 'date', label: 'Datum' }, { key: 'type', label: 'Tip' }, { key: 'amount', label: 'Iznos' }, { key: 'description', label: 'Opis' }, { key: 'paymentMethod', label: 'Način plaćanja' }],
        rows: recent.map((r) => ({ date: r.date.toLocaleDateString('sr-RS'), type: r.type === 'ulaz' ? '🟢 Ulaz' : '🔴 Izlaz', amount: r.amount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), description: r.description, paymentMethod: r.paymentMethod })),
        summary: { balance: balance.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) },
      }
    }

    case 'contacts': {
      const where: Prisma.ContactWhereInput = {}
      if (filters.name) where.OR = [{ firstName: { contains: filters.name as string, mode: 'insensitive' } }, { lastName: { contains: filters.name as string, mode: 'insensitive' } }]
      if (filters.company) where.company = { contains: filters.company as string, mode: 'insensitive' }
      if (filters.isLead === true) where.isLead = true
      if (filters.isClient === true) where.isClient = true
      const records = await db.contact.findMany({ where, orderBy: { createdAt: 'desc' }, take: lim })
      return {
        columns: [{ key: 'name', label: 'Ime i prezime' }, { key: 'company', label: 'Kompanija' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Telefon' }, { key: 'position', label: 'Pozicija' }],
        rows: records.map((r) => ({ name: `${r.firstName} ${r.lastName}`, company: r.company || '-', email: r.email || '-', phone: r.phone || '-', position: r.position || '-' })),
      }
    }

    case 'deals': {
      const where: Prisma.DealWhereInput = {}
      if (filters.stage) where.stage = filters.stage as string
      if (filters.stageNot) where.stage = { not: filters.stageNot as string }
      if (filters.source) where.source = filters.source as string
      if (filters.lostReason) where.lostReason = { not: null }
      const records = await db.deal.findMany({ where, orderBy: { expectedRevenue: 'desc' }, take: lim })
      return {
        columns: [{ key: 'title', label: 'Prilika' }, { key: 'stage', label: 'Faza' }, { key: 'value', label: 'Vrednost' }, { key: 'probability', label: 'Verovatnoća' }, { key: 'closeDate', label: 'Zatvaranje' }],
        rows: records.map((r) => ({ title: r.title, stage: r.stage, value: r.expectedRevenue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), probability: `${r.probability}%`, closeDate: r.closeDate?.toLocaleDateString('sr-RS') || '-' })),
      }
    }

    case 'projects': {
      const where: Prisma.ProjectWhereInput = {}
      if (filters.status) where.status = filters.status as string
      if (filters.overBudget === true) where.spent = { gt: Prisma.raw('0.8 * budget') as unknown as number }
      const records = await db.project.findMany({ where, orderBy: { createdAt: 'desc' }, take: lim })
      return {
        columns: [{ key: 'name', label: 'Naziv' }, { key: 'status', label: 'Status' }, { key: 'budget', label: 'Budžet' }, { key: 'spent', label: 'Potrošeno' }, { key: 'progress', label: 'Progres' }],
        rows: records.map((r) => ({ name: r.name, status: r.status, budget: r.budget.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), spent: r.spent.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), progress: `${r.progress}%` })),
      }
    }

    case 'employees': {
      const where: Prisma.EmployeeWhereInput = {}
      if (filters.department) where.department = { contains: filters.department as string, mode: 'insensitive' }
      if (filters.isActive === true) where.isActive = true
      const records = await db.employee.findMany({ where, orderBy: { lastName: 'asc' }, take: lim })
      return {
        columns: [{ key: 'name', label: 'Ime i prezime' }, { key: 'position', label: 'Pozicija' }, { key: 'department', label: 'Odeljenje' }, { key: 'baseSalary', label: 'Osnovica' }, { key: 'isActive', label: 'Status' }],
        rows: records.map((r) => ({ name: `${r.firstName} ${r.lastName}`, position: r.position || '-', department: r.department || '-', baseSalary: r.baseSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), isActive: r.isActive ? 'Aktivan' : 'Neaktivan' })),
      }
    }

    case 'vehicles': {
      const where: Prisma.VehicleWhereInput = {}
      if (filters.status) where.status = filters.status as string
      if (filters.fuelType) where.fuelType = filters.fuelType as string
      const records = await db.vehicle.findMany({ where, orderBy: { registration: 'asc' }, take: lim })
      return {
        columns: [{ key: 'registration', label: 'Reg. broj' }, { key: 'make', label: 'Marka' }, { key: 'model', label: 'Model' }, { key: 'mileage', label: 'Kilometraža' }, { key: 'status', label: 'Status' }],
        rows: records.map((r) => ({ registration: r.registration, make: r.make, model: r.model, mileage: `${r.mileage.toLocaleString('sr-RS')} km`, status: r.status })),
      }
    }

    case 'assets': {
      const where: Prisma.AssetWhereInput = {}
      if (filters.status) where.status = filters.status as string
      if (filters.category) where.category = { contains: filters.category as string, mode: 'insensitive' }
      const records = await db.asset.findMany({ where, orderBy: { name: 'asc' }, take: lim })
      return {
        columns: [{ key: 'name', label: 'Naziv' }, { key: 'category', label: 'Kategorija' }, { key: 'purchasePrice', label: 'Nabavna cena' }, { key: 'currentValue', label: 'Trenutna vrednost' }, { key: 'status', label: 'Status' }],
        rows: records.map((r) => ({ name: r.name, category: r.category || '-', purchasePrice: r.purchasePrice.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), currentValue: r.currentValue.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), status: r.status })),
      }
    }

    case 'purchaseorders': {
      const where: Prisma.PurchaseOrderWhereInput = {}
      if (filters.status) where.status = filters.status as string
      const records = await db.purchaseOrder.findMany({ where, orderBy: { date: 'desc' }, take: lim, include: { partner: { select: { name: true } } } })
      return {
        columns: [{ key: 'number', label: 'Broj' }, { key: 'partnerName', label: 'Dobavljač' }, { key: 'date', label: 'Datum' }, { key: 'totalAmount', label: 'Iznos' }, { key: 'status', label: 'Status' }],
        rows: records.map((r) => ({ number: r.number, partnerName: r.partner.name, date: r.date.toLocaleDateString('sr-RS'), totalAmount: r.totalAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), status: r.status })),
      }
    }

    case 'payrolls': {
      const now = new Date()
      const records = await db.payroll.findMany({ where: { year: now.getFullYear(), month: now.getMonth() + 1 }, take: lim, include: { employee: { select: { firstName: true, lastName: true } } } })
      return {
        columns: [{ key: 'name', label: 'Zaposleni' }, { key: 'baseSalary', label: 'Osnovica' }, { key: 'bonuses', label: 'Bonusi' }, { key: 'deductions', label: 'Odbici' }, { key: 'netSalary', label: 'Neto' }],
        rows: records.map((r) => ({ name: `${r.employee.firstName} ${r.employee.lastName}`, baseSalary: r.baseSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), bonuses: r.bonuses.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), deductions: r.deductions.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), netSalary: r.netSalary.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }) })),
      }
    }

    case 'helpdesktickets': {
      const where: Prisma.HelpdeskTicketWhereInput = {}
      if (filters.status) where.status = filters.status as string
      if (filters.priority) where.priority = filters.priority as string
      const records = await db.helpdeskTicket.findMany({ where, orderBy: { createdAt: 'desc' }, take: lim })
      return {
        columns: [{ key: 'subject', label: 'Tema' }, { key: 'status', label: 'Status' }, { key: 'priority', label: 'Prioritet' }, { key: 'createdAt', label: 'Kreiran' }],
        rows: records.map((r) => ({ subject: r.subject || r.description?.substring(0, 50) || '-', status: r.status, priority: r.priority, createdAt: r.createdAt.toLocaleDateString('sr-RS') })),
      }
    }

    case 'vehicleservices': {
      const where: Prisma.VehicleServiceWhereInput = {}
      if (filters.vehicleId) where.vehicleId = filters.vehicleId as string
      if (filters.type) where.type = filters.type as string
      const records = await db.vehicleService.findMany({ where, orderBy: { date: 'desc' }, take: lim, include: { vehicle: { select: { registration: true, make: true, model: true } } } })
      return {
        columns: [{ key: 'vehicle', label: 'Vozilo' }, { key: 'type', label: 'Tip' }, { key: 'date', label: 'Datum' }, { key: 'cost', label: 'Trošak' }, { key: 'mileage', label: 'km' }],
        rows: records.map((r) => ({ vehicle: `${r.vehicle.registration} (${r.vehicle.make})`, type: r.type, date: r.date.toLocaleDateString('sr-RS'), cost: r.cost.toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), mileage: r.mileage.toLocaleString('sr-RS') })),
      }
    }

    case 'recurringinvoices': {
      const where: Prisma.RecurringInvoiceWhereInput = {}
      if (filters.isActive !== undefined) where.isActive = filters.isActive as boolean
      const records = await db.recurringInvoice.findMany({ where, orderBy: { nextDate: 'asc' }, take: lim, include: { partner: { select: { name: true } } } })
      return {
        columns: [{ key: 'name', label: 'Naziv' }, { key: 'partnerName', label: 'Partner' }, { key: 'frequency', label: 'Učestalost' }, { key: 'nextDate', label: 'Sledeći datum' }, { key: 'isActive', label: 'Aktivna' }],
        rows: records.map((r) => ({ name: r.name, partnerName: r.partner.name, frequency: r.frequency, nextDate: r.nextDate.toLocaleDateString('sr-RS'), isActive: r.isActive ? '✅ Da' : '❌ Ne' })),
      }
    }

    default:
      return { columns: [], rows: [] }
  }
}

// ============ HELPER: Execute analytics ============

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

  // Revenue vs Expenses
  if (action.entity === 'transactions' && filters.comparison === 'prihod_rashod') {
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
    return { chartData, chartType: 'bar', chartConfig: { prihod: { label: 'Prihod', color: 'hsl(142, 76%, 36%)' }, rashod: { label: 'Rashod', color: 'hsl(0, 84%, 60%)' } }, summaryValue: (tp - tr).toLocaleString('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }), summaryLabel: 'Neto rezultat' }
  }

  // Revenue by category
  if (action.entity === 'transactions' && filters.groupBy === 'category') {
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const dateTo = filters.dateTo ? new Date(filters.dateTo as string) : new Date()
    const transactions = await db.transaction.findMany({ where: { date: { gte: dateFrom, lte: dateTo }, type: filters.type as string | undefined }, select: { category: true, amount: true } })
    const catData: Record<string, number> = {}
    for (const t of transactions) catData[t.category] = (catData[t.category] || 0) + t.amount
    const colors = ['hsl(142, 76%, 36%)', 'hsl(47, 96%, 53%)', 'hsl(199, 89%, 48%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(24, 95%, 53%)', 'hsl(326, 100%, 74%)', 'hsl(221, 83%, 53%)']
    const chartData = Object.entries(catData).map(([category, amount]) => ({ category, iznos: amount })).sort((a, b) => b.iznos - a.iznos).slice(0, 8)
    return { chartData, chartType: 'pie', chartConfig: Object.fromEntries(chartData.map((d, i) => [d.category, { label: d.category, color: colors[i % colors.length] }])) }
  }

  // Deals by stage (pipeline)
  if (action.entity === 'deals' && filters.groupBy === 'stage') {
    const deals = await db.deal.findMany({ where: { stage: { notIn: ['won', 'lost'] } }, select: { stage: true, expectedRevenue: true } })
    const stageData: Record<string, { count: number; value: number }> = {}
    for (const d of deals) {
      if (!stageData[d.stage]) stageData[d.stage] = { count: 0, value: 0 }
      stageData[d.stage].count++
      stageData[d.stage].value += d.expectedRevenue
    }
    const colors = ['hsl(199, 89%, 48%)', 'hsl(47, 96%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(24, 95%, 53%)']
    const chartData = Object.entries(stageData).map(([stage, data]) => ({ stage, vrednost: data.value, broj: data.count }))
    return { chartData, chartType: 'bar', chartConfig: { vrednost: { label: 'Vrednost (RSD)', color: colors[0] }, broj: { label: 'Broj prilika', color: colors[1] } } }
  }

  // Invoice status distribution
  if (action.entity === 'invoices' && filters.groupBy === 'status') {
    const invoices = await db.invoice.findMany({ select: { status: true, totalAmount: true } })
    const statusData: Record<string, { count: number; total: number }> = {}
    for (const inv of invoices) {
      if (!statusData[inv.status]) statusData[inv.status] = { count: 0, total: 0 }
      statusData[inv.status].count++
      statusData[inv.status].total += inv.totalAmount
    }
    const colors = ['hsl(199, 89%, 48%)', 'hsl(47, 96%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)']
    const chartData = Object.entries(statusData).map(([status, data]) => ({ status, iznos: data.total, broj: data.count }))
    return { chartData, chartType: 'pie', chartConfig: Object.fromEntries(chartData.map((d, i) => [d.status, { label: d.status, color: colors[i % colors.length] }])) }
  }

  return null
}

// ============ HELPER: Execute create ============

async function executeCreate(
  entity: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string; module?: string; recordId?: string }> {
  switch (entity) {
    case 'partner': {
      if (!data.name) return { success: false, message: 'Naziv partnera je obavezan.' }
      if (data.pib) {
        const existing = await db.partner.findFirst({ where: { pib: data.pib as string } })
        if (existing) return { success: false, message: `Partner sa PIB-om ${data.pib} već postoji (${existing.name}).` }
      }
      const partner = await db.partner.create({
        data: {
          name: data.name as string,
          pib: (data.pib as string) || null,
          maticniBr: (data.maticniBr as string) || null,
          address: (data.address as string) || null,
          city: (data.city as string) || null,
          email: (data.email as string) || null,
          phone: (data.phone as string) || null,
          type: (data.type as string) || 'kupac',
        },
      })
      return { success: true, message: `Partner "${partner.name}" uspešno kreiran. PIB: ${partner.pib || '/'}`, module: 'partneri', recordId: partner.id }
    }
    case 'invoice': {
      return { success: true, message: `Usmeravam vas na kreiranje nove fakture${data.partnerName ? ` za ${data.partnerName}` : ''}.`, module: 'fakture' }
    }
    case 'contact': {
      if (!data.firstName) return { success: false, message: 'Ime kontakta je obavezno.' }
      const contact = await db.contact.create({
        data: {
          firstName: data.firstName as string,
          lastName: (data.lastName as string) || '',
          email: (data.email as string) || null,
          phone: (data.phone as string) || null,
          position: (data.position as string) || null,
          company: (data.company as string) || null,
        },
      })
      return { success: true, message: `Kontakt "${contact.firstName} ${contact.lastName}" uspešno kreiran.`, module: 'crm', recordId: contact.id }
    }
    case 'project': {
      if (!data.name) return { success: false, message: 'Naziv projekta je obavezan.' }
      const project = await db.project.create({
        data: {
          name: data.name as string,
          description: (data.description as string) || null,
          status: 'aktivan',
          budget: (data.budget as number) || 0,
          priority: (data.priority as string) || 'srednji',
        },
      })
      return { success: true, message: `Projekat "${project.name}" uspešno kreiran.`, module: 'projekti', recordId: project.id }
    }
    default:
      return { success: false, message: `Kreiranje za "${entity}" nije podržano. Pokušajte sa: partner, kontakt, projekat, faktura.` }
  }
}

// ============ HELPER: Execute update ============

async function executeUpdate(
  entity: string,
  filters: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string; module?: string }> {
  switch (entity) {
    case 'invoice': {
      const where: Prisma.InvoiceWhereInput = {}
      if (filters.number) where.number = { contains: filters.number as string, mode: 'insensitive' }
      if (filters.id) where.id = filters.id as string
      if (!filters.number && !filters.id) return { success: false, message: 'Morate navesti broj ili ID fakture.' }
      const updateData: Prisma.InvoiceUpdateInput = {}
      if (data.status) updateData.status = data.status as string
      try {
        const result = await db.invoice.updateMany({ where, data: updateData })
        if (result.count === 0) return { success: false, message: 'Faktura nije pronađena.' }
        return { success: true, message: `Faktura ažurirana${data.status ? ` — status: "${data.status}"` : ''}.`, module: 'fakture' }
      } catch { return { success: false, message: 'Greška pri ažuriranju fakture.' } }
    }
    case 'deal': {
      if (!filters.id) return { success: false, message: 'Morate navesti ID prilike.' }
      const updateData: Prisma.DealUpdateInput = {}
      if (data.stage) updateData.stage = data.stage as string
      if (data.value !== undefined) updateData.value = data.value as number
      try {
        await db.deal.update({ where: { id: filters.id as string }, data: updateData })
        return { success: true, message: `Prilika ažurirana${data.stage ? ` — faza: "${data.stage}"` : ''}.`, module: 'crm' }
      } catch { return { success: false, message: 'Greška pri ažuriranju prilike.' } }
    }
    default:
      return { success: false, message: `Ažuriranje za "${entity}" nije podržano.` }
  }
}

// ============ HELPER: Get module from entity ============

function getModuleFromEntity(entity: string): string {
  const map: Record<string, string> = {
    invoices: 'fakture', partners: 'partneri', products: 'magacin', transactions: 'finansije',
    cashregister: 'finansije', stock: 'magacin', contacts: 'crm', deals: 'crm',
    projects: 'projekti', employees: 'zaposleni', vehicles: 'vozni-park', vehicleservices: 'vozni-park',
    vehicleexpenses: 'vozni-park', assets: 'sredstva', accounts: 'knjigovodstvo',
    journalentries: 'knjigovodstvo', purchaseorders: 'nabavka', payrolls: 'zaposleni',
    helpdesktickets: 'podrska', posorders: 'pos', shippingorders: 'shipping',
    manufacturingorders: 'proizvodnja', deliverynotes: 'magacin',
    recurringinvoices: 'pretplate', pricelists: 'cenovnici', events: 'kalendar',
  }
  return map[entity] || 'dashboard'
}

// ============ MAIN HANDLER ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, history } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build conversation messages with history
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: buildSystemPrompt() },
    ]

    if (context && typeof context === 'string') {
      messages.push({ role: 'system', content: `Kontekst korisnika: ${context}` })
    }

    // Add conversation history (last 8 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-8)
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      }
    }

    messages.push({ role: 'user', content: message })

    // Call LLM
    const response = await ZAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    })

    const rawReply = response.choices?.[0]?.message?.content || ''
    if (!rawReply) {
      return NextResponse.json({ reply: 'Izvinjavam se, došlo je do greške. Pokušajte ponovo.' })
    }

    // Parse the AI response
    const parsed = parseAIResponse(rawReply)
    const action = parsed.action

    if (!action || action.type === 'general') {
      return NextResponse.json({ reply: parsed.reply, actionType: 'general' })
    }

    // Execute the action
    let responseData: AIResponse['data'] = parsed.data || {}
    let actionModule = action.module

    switch (action.type) {
      case 'dashboard': {
        const dashboard = await getDashboardOverview()
        responseData.kpis = dashboard.kpis
        responseData.summaryValue = dashboard.summaryValue
        responseData.summaryLabel = dashboard.summaryLabel
        actionModule = 'dashboard'
        break
      }
      case 'query': {
        if (action.entity) {
          const result = await executeQuery(action.entity, action.filters || {}, action.sort, action.limit)
          responseData.columns = result.columns
          responseData.rows = result.rows
          if (result.summary) {
            responseData.summaryValue = result.summary.balance
            responseData.summaryLabel = 'Stanje blagajne'
          }
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
          const result = await executeUpdate(action.entity, action.filters || {}, action.data || {})
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

    // Enhance reply for table results
    if (responseData.rows && responseData.rows.length > 0 && action.type === 'query' && !parsed.data?.columns) {
      const count = responseData.rows.length
      const entityLabel: Record<string, string> = {
        invoices: 'faktura', partners: 'partnera', products: 'proizvoda', transactions: 'transakcija',
        cashregister: 'kasa transakcija', contacts: 'kontakata', deals: 'prilika', projects: 'projekata',
        employees: 'zaposlenih', vehicles: 'vozila', assets: 'sredstava', purchaseorders: 'narudžbenica',
        payrolls: 'plata', helpdesktickets: 'tiketa', vehicleservices: 'servisa', recurringinvoices: 'faktura',
      }
      const label = entityLabel[action.entity || ''] || 'zapisa'
      parsed.reply = `${parsed.reply}\n\nPronašao sam ${count} ${label}.`
    }

    return NextResponse.json({
      reply: parsed.reply,
      actionType: action.type,
      module: actionModule,
      data: responseData,
    })
  } catch (error) {
    console.error('AI assistant error:', error)
    return NextResponse.json({ reply: 'Izvinjavam se, došlo je do greške. Pokušajte ponovo.', actionType: 'error' })
  }
}
