import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const accounts = await db.account.findMany({ where: { isActive: true }, include: { _count: { select: { entries: true } } }, orderBy: { code: 'asc' } })
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, type, description, parentCode } = body
    if (!code || !name) return NextResponse.json({ error: 'code i name su obavezni' }, { status: 400 })

    const account = await db.account.create({ data: { code, name, type: type || 'aktivna', description, parentCode } })
    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
