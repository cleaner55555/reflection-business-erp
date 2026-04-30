import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''

  const where: Record<string, unknown> = {}
  if (search) where.OR = [{ name: { contains: search } }, { serialNumber: { contains: search } }]
  if (category) where.category = category
  if (status) where.status = status

  const assets = await db.asset.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, category, serialNumber, purchaseDate, purchasePrice, currentValue, usefulLife, location, status, notes } = body
  if (!name) return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 })

  const asset = await db.asset.create({
    data: { name, category, serialNumber, purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(), purchasePrice: Number(purchasePrice) || 0, currentValue: Number(currentValue) || Number(purchasePrice) || 0, usefulLife: Number(usefulLife) || 60, location, status: status || 'aktivno', notes },
  })
  return NextResponse.json(asset, { status: 201 })
}
