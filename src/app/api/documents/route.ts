import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || ''
  const category = searchParams.get('category') || ''

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (category) where.category = category

  const docs = await db.document.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { partner: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, category, type, fileName, fileSize, status, partnerId, expiresAt, notes } = body
  if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 })

  const doc = await db.document.create({
    data: { title, category, type, fileName, fileSize: Number(fileSize) || 0, status: status || 'aktivno', partnerId, expiresAt: expiresAt ? new Date(expiresAt) : null, notes },
  })
  return NextResponse.json(doc, { status: 201 })
}
