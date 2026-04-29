import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  try {
    const where: any = { companyId, isActive: true }
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const vendorId = searchParams.get('vendorId')
    const featured = searchParams.get('featured')

    if (search) where.name = { contains: search }
    if (category && category !== 'all') where.category = category
    if (vendorId) where.vendorId = vendorId
    if (featured === 'true') where.isFeatured = true

    const products = await db.mpProduct.findMany({
      where,
      include: {
        vendor: { select: { id: true, slug: true, rating: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Get unique categories
    const categories = await db.mpProduct.findMany({
      where: { companyId, isActive: true },
      distinct: ['category'],
      select: { category: true },
    })

    return NextResponse.json({
      products,
      categories: categories.map(c => c.category).filter(Boolean).sort(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  try {
    const body = await req.json()
    const { name, vendorId, sku, barcode, category, description, price, compareAtPrice, costPrice, unit, stock, minOrderQty, weight, imageUrl, isFeatured, tags } = body

    if (!name || !vendorId) {
      return NextResponse.json({ error: 'name and vendorId required' }, { status: 400 })
    }

    const product = await db.mpProduct.create({
      data: {
        companyId,
        vendorId,
        name,
        sku,
        barcode,
        category: category || null,
        description,
        price: price || 0,
        compareAtPrice: compareAtPrice || 0,
        costPrice: costPrice || 0,
        unit: unit || 'kom',
        stock: stock || 0,
        minOrderQty: minOrderQty || 1,
        weight: weight || 0,
        imageUrl,
        isFeatured: isFeatured || false,
        tags: tags ? JSON.stringify(tags) : '[]',
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
