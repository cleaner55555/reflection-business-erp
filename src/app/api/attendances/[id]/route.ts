import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { employeeId, date, hoursWorked, type, notes } = body
  try {
    const att = await db.attendance.update({
      where: { id },
      data: {
        ...(employeeId && { employeeId }),
        ...(date && { date: new Date(date) }),
        hoursWorked: Number(hoursWorked) || 8,
        ...(type && { type }),
        ...(notes !== undefined && { notes }),
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    })
    return NextResponse.json(att)
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.attendance.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
