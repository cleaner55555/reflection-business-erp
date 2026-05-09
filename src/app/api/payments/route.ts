import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const companyId = searchParams.get('companyId') || 'default'

    const where: Record<string, unknown> = { companyId }
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { client: { contains: search } },
        { reference: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (category) where.category = category

    const data = await db.payment.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/payments:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'
    const payment = await db.payment.create({
      data: {
        companyId, invoiceNo: body.invoiceNo || '', client: body.client || '',
        amount: body.amount || 0, currency: body.currency || 'RSD',
        date: body.date || new Date().toISOString().split('T')[0],
        dueDate: body.dueDate || '', paidDate: body.paidDate || '',
        method: body.method || 'bank_transfer', status: body.status || 'pending',
        reference: body.reference || '', category: body.category || 'invoice',
        notes: body.notes || '',
      },
    })
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('POST /api/payments:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
