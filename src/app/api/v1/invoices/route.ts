import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'

// GET /api/v1/invoices - Public API for invoices
export async function GET(req: Request) {
  try {
    const auth = await authenticateApiKey(req)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const where: Record<string, unknown> = { companyId: auth.companyId }
    if (status) where.status = status
    if (type) where.type = type
    if (from || to) {
      const dateFilter: Record<string, unknown> = {}
      if (from) dateFilter.gte = new Date(from)
      if (to) dateFilter.lte = new Date(to)
      where.date = dateFilter
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(limit, 100),
        include: {
          partner: { select: { id: true, name: true, pib: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.invoice.count({ where }),
    ])

    return NextResponse.json({
      data: invoices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('API v1 invoices error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/v1/invoices - Create invoice
export async function POST(req: Request) {
  try {
    const auth = await authenticateApiKey(req)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await req.json()
    const { number, partnerId, date, dueDate, items, notes, paymentMethod, discountPct } = body

    if (!number || !partnerId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Broj, partner i stavke su obavezni' }, { status: 400 })
    }

    const totalAmount = items.reduce((sum: number, item: { quantity: number; unitPrice: number; discountPct?: number; taxRate?: number }) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPct || 0) / 100)
      const taxAmount = lineTotal * ((item.taxRate || 20) / 100)
      return sum + lineTotal + taxAmount
    }, 0)

    const taxAmount = items.reduce((sum: number, item: { quantity: number; unitPrice: number; discountPct?: number; taxRate?: number }) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPct || 0) / 100)
      return sum + lineTotal * ((item.taxRate || 20) / 100)
    }, 0)

    const invoice = await db.invoice.create({
      data: {
        companyId: auth.companyId,
        number,
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        partnerId,
        status: 'nacrt',
        type: body.type || 'izlazna',
        totalAmount,
        taxAmount,
        discountPct: discountPct || 0,
        notes: notes || null,
        paymentMethod: paymentMethod || 'racun',
        items: {
          create: items.map((item: { productId: string; productName: string; quantity: number; unitPrice: number; discountPct?: number; taxRate?: number }) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPct: item.discountPct || 0,
            taxRate: item.taxRate || 20,
            total: item.quantity * item.unitPrice * (1 - (item.discountPct || 0) / 100) * (1 + ((item.taxRate || 20) / 100)),
          })),
        },
      },
      include: { items: true, partner: true },
    })

    return NextResponse.json({ data: invoice }, { status: 201 })
  } catch (error) {
    console.error('API v1 create invoice error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
