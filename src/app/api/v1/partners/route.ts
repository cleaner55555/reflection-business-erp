import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'

// GET /api/v1/partners - Public API for partners
export async function GET(req: Request) {
  try {
    const auth = await authenticateApiKey(req)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = { companyId: auth.companyId }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { pib: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (type) {
      where.type = type
    }

    const [partners, total] = await Promise.all([
      db.partner.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(limit, 100),
        orderBy: { updatedAt: 'desc' },
      }),
      db.partner.count({ where }),
    ])

    return NextResponse.json({
      data: partners,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('API v1 partners error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/v1/partners - Create partner
export async function POST(req: Request) {
  try {
    const auth = await authenticateApiKey(req)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await req.json()
    const { name, pib, maticniBr, address, city, zipCode, phone, email, type } = body

    if (!name) {
      return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 })
    }

    const partner = await db.partner.create({
      data: {
        companyId: auth.companyId,
        name,
        pib: pib || null,
        maticniBr: maticniBr || null,
        address: address || null,
        city: city || null,
        zipCode: zipCode || null,
        phone: phone || null,
        email: email || null,
        type: type || 'kupac',
      },
    })

    return NextResponse.json({ data: partner }, { status: 201 })
  } catch (error) {
    console.error('API v1 create partner error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
