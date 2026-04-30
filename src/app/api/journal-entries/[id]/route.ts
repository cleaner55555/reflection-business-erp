import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const entry = await db.journalEntry.findUnique({
      where: { id },
      include: { account: { select: { code: true, name: true } } },
    })
    if (!entry) return NextResponse.json({ error: 'Stavka nije pronađena' }, { status: 404 })
    return NextResponse.json({ ...entry, accountCode: entry.account?.code || '' })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // If accountCode is provided, look up the account
    const data: Record<string, unknown> = { ...body }
    if (body.accountCode) {
      const account = await db.account.findFirst({ where: { code: body.accountCode } })
      if (account) {
        data.accountId = account.id
      }
      delete data.accountCode
    }

    const entry = await db.journalEntry.update({ where: { id }, data })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.journalEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
