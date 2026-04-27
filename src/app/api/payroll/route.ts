import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId') || ''
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (month) where.month = Number(month)
  if (year) where.year = Number(year)

  const payrolls = await db.payroll.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
  return NextResponse.json(payrolls)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { employeeId, month, year, baseSalary, bonuses, deductions, netSalary, status, payDate, notes } = body
  if (!employeeId || !month || !year) return NextResponse.json({ error: 'Zaposleni, mesec i godina obavezni' }, { status: 400 })

  const payroll = await db.payroll.create({
    data: { employeeId, month: Number(month), year: Number(year), baseSalary: Number(baseSalary) || 0, bonuses: Number(bonuses) || 0, deductions: Number(deductions) || 0, netSalary: Number(netSalary) || 0, status: status || 'nacrt', payDate: payDate ? new Date(payDate) : null, notes },
  })
  return NextResponse.json(payroll, { status: 201 })
}
