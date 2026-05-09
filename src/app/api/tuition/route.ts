import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const companyId = searchParams.get('companyId') || 'default'
    const where: Record<string, unknown> = { companyId }
    if (search) where.OR = [{ studentName: { contains: search } }, { program: { contains: search } }]
    if (status) where.status = status
    const data = await db.tuition.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'
    const item = await db.tuition.create({
      data: {
        companyId, studentName: body.studentName || '', program: body.program || '',
        studyLevel: body.studyLevel || 'bachelor', academicYear: body.academicYear || '',
        semester: body.semester || 'zimski', amount: body.amount || 0, paid: body.paid || 0,
        currency: body.currency || 'RSD', status: body.status || 'pending',
        dueDate: body.dueDate || '', paidDate: body.paidDate || '',
        paymentMethod: body.paymentMethod || '', discount: body.discount || 0, notes: body.notes || '',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
