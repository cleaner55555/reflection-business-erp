import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
    ]
  }
  if (type) where.type = type

  const locations = await db.warehouseLocation.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      parent: { select: { id: true, name: true, code: true } },
      _count: { select: { children: true, stockMovements: true } }
    },
    orderBy: [{ code: 'asc' }],
  })
  return NextResponse.json(locations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, code, type, parentId } = body
  if (!name || !code) return NextResponse.json({ error: 'Naziv i šifra su obavezni' }, { status: 400 })

  try {
    const location = await db.warehouseLocation.create({
      data: { name, code, type: type || 'polica', parentId: parentId || null }
    })
    return NextResponse.json(location, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Greška'
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Šifra lokacije već postoji' }, { status: 409 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
