import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('companyId') || ''
  const items = await db.seoPage.findMany({ where: { companyId }, orderBy: { position: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await db.seoPage.create({ data })
  return NextResponse.json(item, { status: 201 })
}
