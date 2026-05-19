import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { withMonitoring } from '@/lib/monitoring/profiler'

export const GET = withMonitoring('GET /api/employees', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const department = searchParams.get('department') || ''

  const where: Record<string, unknown> = {}
  if (search) where.OR = [{ firstName: { contains: search } }, { lastName: { contains: search } }, { position: { contains: search } }]
  if (department) where.department = department

  const employees = await db.employee.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      partner: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, lastName: true, position: true } },
      subordinates: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(employees)
})

export const POST = withMonitoring('POST /api/employees', async (req: NextRequest) => {
  const body = await req.json()
  const { firstName, lastName, email, phone, position, department, baseSalary, bankAccount, partnerId, isActive, managerId, contractType, contractEndDate, benefits } = body
  if (!firstName || !lastName) return NextResponse.json({ error: 'Ime i prezime obavezni' }, { status: 400 })

  const employee = await db.employee.create({
    data: {
      firstName, lastName, email, phone, position, department,
      baseSalary: Number(baseSalary) || 0, bankAccount, partnerId,
      isActive: isActive !== false,
      managerId: managerId || null,
      contractType: contractType || 'odredjeno',
      contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
      benefits: benefits || null,
    },
  })
  return NextResponse.json(employee, { status: 201 })
})
