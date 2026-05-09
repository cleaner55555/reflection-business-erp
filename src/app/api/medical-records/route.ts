import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const companyId = searchParams.get('companyId') || 'default'
    const where: Record<string, unknown> = { companyId }
    if (search) where.OR = [{ patientName: { contains: search } }, { doctor: { contains: search } }, { diagnosis: { contains: search } }]
    if (department) where.department = department
    const data = await db.medicalRecord.findMany({ where, orderBy: { visitDate: 'desc' } })
    return NextResponse.json(data)
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'
    const item = await db.medicalRecord.create({
      data: {
        companyId, patientName: body.patientName || '', dateOfBirth: body.dateOfBirth || '',
        gender: body.gender || '', phone: body.phone || '', bloodType: body.bloodType || '',
        allergies: typeof body.allergies === 'string' ? body.allergies : JSON.stringify(body.allergies || []),
        diagnosis: body.diagnosis || '', treatment: body.treatment || '',
        medications: typeof body.medications === 'string' ? body.medications : JSON.stringify(body.medications || []),
        visitDate: body.visitDate || new Date().toISOString().split('T')[0],
        doctor: body.doctor || '', department: body.department || '', notes: body.notes || '',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
