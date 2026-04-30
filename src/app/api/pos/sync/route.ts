import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pos/sync - get retail sync configuration
export async function GET(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const products = await db.product.findMany({
    where: { companyId, isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      purchasePrice: true,
      sellingPrice: true,
      currentStock: true,
      unit: true,
    },
    orderBy: { category: 'asc' },
  })

  const syncData = products.map(p => {
    const marginPct = p.purchasePrice > 0
      ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100
      : 0
    const markupPct = p.sellingPrice > 0
      ? ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100
      : 0
    return {
      ...p,
      marginPct: Math.round(marginPct * 100) / 100,
      markupPct: Math.round(markupPct * 100) / 100,
    }
  })

  const categoryMap = new Map<string, { count: number; totalWholesale: number; totalRetail: number; avgMargin: number }>()
  for (const p of syncData) {
    const cat = p.category || 'Bez kategorije'
    const existing = categoryMap.get(cat)
    if (existing) {
      existing.count++
      existing.totalWholesale += p.purchasePrice
      existing.totalRetail += p.sellingPrice
      existing.avgMargin = ((existing.avgMargin * (existing.count - 1)) + p.marginPct) / existing.count
    } else {
      categoryMap.set(cat, { count: 1, totalWholesale: p.purchasePrice, totalRetail: p.sellingPrice, avgMargin: p.marginPct })
    }
  }

  const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    ...data,
    avgMargin: Math.round(data.avgMargin * 100) / 100,
  }))

  const totalProducts = products.length
  const totalValueWholesale = products.reduce((s, p) => s + p.purchasePrice * p.currentStock, 0)
  const totalValueRetail = products.reduce((s, p) => s + p.sellingPrice * p.currentStock, 0)
  const totalMarginValue = totalValueRetail - totalValueWholesale
  const avgMargin = totalProducts > 0
    ? products.reduce((s, p) => s + ((p.sellingPrice - p.purchasePrice) / Math.max(p.purchasePrice, 0.01)) * 100, 0) / totalProducts
    : 0

  return NextResponse.json({
    products: syncData,
    categories,
    stats: {
      totalProducts,
      totalValueWholesale,
      totalValueRetail,
      totalMarginValue,
      avgMargin: Math.round(avgMargin * 100) / 100,
    },
  })
}

// POST /api/pos/sync - apply margin changes
export async function POST(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const body = await req.json()
  const { type, marginPct, markupPct, category, roundTo } = body

  const where: Record<string, unknown> = { companyId, isActive: true }
  if (category) where.category = category

  const products = await db.product.findMany({ where })

  let updated = 0
  for (const p of products) {
    let newPrice: number
    if (type === 'margin') {
      newPrice = p.purchasePrice * (1 + (marginPct || 0) / 100)
    } else {
      newPrice = p.purchasePrice / (1 - (markupPct || 0) / 100)
    }

    if (roundTo) {
      newPrice = Math.ceil(newPrice / roundTo) * roundTo
    }

    newPrice = Math.round(newPrice * 100) / 100
    if (newPrice <= 0) continue

    await db.product.update({
      where: { id: p.id },
      data: { sellingPrice: newPrice },
    })
    updated++
  }

  return NextResponse.json({ updated, type, category: category || 'Sve' })
}
