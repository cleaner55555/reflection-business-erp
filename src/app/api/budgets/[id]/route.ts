import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Recalculate total annual
    if (body.january !== undefined || body.february !== undefined || body.march !== undefined ||
        body.april !== undefined || body.may !== undefined || body.june !== undefined ||
        body.july !== undefined || body.august !== undefined || body.september !== undefined ||
        body.october !== undefined || body.november !== undefined || body.december !== undefined) {
      // Fetch existing budget first
      const existing = await db.budget.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ error: 'Budžet nije pronađen' }, { status: 404 })

      const totalAnnual = (Number(body.january ?? existing.january)) +
        (Number(body.february ?? existing.february)) +
        (Number(body.march ?? existing.march)) +
        (Number(body.april ?? existing.april)) +
        (Number(body.may ?? existing.may)) +
        (Number(body.june ?? existing.june)) +
        (Number(body.july ?? existing.july)) +
        (Number(body.august ?? existing.august)) +
        (Number(body.september ?? existing.september)) +
        (Number(body.october ?? existing.october)) +
        (Number(body.november ?? existing.november)) +
        (Number(body.december ?? existing.december))

      body.totalAnnual = totalAnnual
    }

    const budget = await db.budget.update({ where: { id }, data: body })
    return NextResponse.json(budget)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.budget.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
