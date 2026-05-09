import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const companyId = searchParams.get('companyId') || 'default'
    const where: Record<string, unknown> = { companyId }
    if (search) where.OR = [{ patientName: { contains: search } }, { doctor: { contains: search } }, { diagnosis: { contains: search } }]
    if (status) where.status = status
    const data = await db.prescription.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'
    const item = await db.prescription.create({
      data: {
        companyId, patientName: body.patientName || '', dateOfBirth: body.dateOfBirth || '',
        doctor: body.doctor || '', date: body.date || new Date().toISOString().split('T')[0],
        status: body.status || 'active',
        medications: typeof body.medications === 'string' ? body.medications : JSON.stringify(body.medications || []),
        diagnosis: body.diagnosis || '', notes: body.notes || '',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
