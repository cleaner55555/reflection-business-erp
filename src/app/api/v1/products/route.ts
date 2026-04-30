import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'

// GET /api/v1/products - Public API for products
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
    const category = searchParams.get('category') || ''

    const where: Record<string, unknown> = { companyId: auth.companyId, isActive: true }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ]
    }
    if (category) {
      where.category = category
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(limit, 100),
        orderBy: { updatedAt: 'desc' },
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('API v1 products error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/v1/products - Create product
export async function POST(req: Request) {
  try {
    const auth = await authenticateApiKey(req)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await req.json()
    const { name, sku, barcode, category, unit, purchasePrice, sellingPrice, minStock, description } = body

    if (!name || !sku) {
      return NextResponse.json({ error: 'Naziv i ŠIFRA su obavezni' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        companyId: auth.companyId,
        name,
        sku,
        barcode: barcode || null,
        category: category || null,
        unit: unit || 'kom',
        purchasePrice: purchasePrice || 0,
        sellingPrice: sellingPrice || 0,
        minStock: minStock || 0,
        description: description || null,
        isActive: true,
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('API v1 create product error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
