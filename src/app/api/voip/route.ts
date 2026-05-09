import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || '' // calls, extensions

  if (type === 'extensions') {
    const where: any = { companyId }
    if (search) where.OR = [
      { name: { contains: search } },
      { number: { contains: search } },
      { department: { contains: search } },
    ]
    const items = await db.voipExtension.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ items })
  }

  // Default: call logs
  const where: any = { companyId }
  if (search) where.OR = [
    { caller: { contains: search } },
    { callee: { contains: search } },
    { extension: { contains: search } },
  ]
  const status = searchParams.get('status') || ''
  const direction = searchParams.get('direction') || ''
  if (status) where.status = status
  if (direction) where.direction = direction

  const items = await db.voipCallLog.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await db.voipCallLog.create({ data })
  return NextResponse.json(item, { status: 201 })
}
