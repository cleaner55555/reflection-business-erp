import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { employeeId, month, year, baseSalary, bonuses, deductions, netSalary, status, payDate, notes } = body
  try {
    const payroll = await db.payroll.update({
      where: { id },
      data: {
        ...(employeeId && { employeeId }),
        ...(month && { month: Number(month) }),
        ...(year && { year: Number(year) }),
        baseSalary: Number(baseSalary) || 0,
        bonuses: Number(bonuses) || 0,
        deductions: Number(deductions) || 0,
        netSalary: Number(netSalary) || 0,
        ...(status && { status }),
        payDate: payDate ? new Date(payDate) : null,
        ...(notes !== undefined && { notes }),
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    })
    return NextResponse.json(payroll)
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.payroll.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
