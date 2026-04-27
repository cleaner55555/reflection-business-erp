import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountCode = searchParams.get('accountCode')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}
    if (accountCode) where.accountCode = accountCode
    if (from || to) {
      where.date = {} as Record<string, unknown>
      if (from) (where.date as Record<string, unknown>).gte = new Date(from)
      if (to) (where.date as Record<string, unknown>).lte = new Date(to)
    }

    const entries = await db.journalEntry.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: { account: { select: { code: true, name: true } } },
      orderBy: { date: 'desc' },
      take: 200,
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountCode, debit, credit, description, documentRef, date } = body
    if (!accountCode || !description) return NextResponse.json({ error: 'accountCode i description su obavezni' }, { status: 400 })

    const entry = await db.journalEntry.create({
      data: { accountCode, debit: Number(debit) || 0, credit: Number(credit) || 0, description, documentRef, date: date ? new Date(date) : new Date() }
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
