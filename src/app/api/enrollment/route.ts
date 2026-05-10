import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const level = searchParams.get('level') || ''
    const companyId = searchParams.get('companyId') || 'default'
    const where: Record<string, unknown> = { companyId }
    if (search) where.OR = [{ applicantName: { contains: search } }, { program: { contains: search } }, { city: { contains: search } }]
    if (status) where.status = status
    if (level) where.studyLevel = level
    const data = await db.enrollment.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'
    const item = await db.enrollment.create({
      data: {
        companyId, applicantName: body.applicantName || '', jmbg: body.jmbg || '', email: body.email || '',
        phone: body.phone || '', program: body.program || '', studyLevel: body.studyLevel || 'bachelor',
        status: body.status || 'pending', applicationDate: body.applicationDate || new Date().toISOString().split('T')[0],
        entranceExamScore: body.entranceExamScore || 0, highSchoolGPA: body.highSchoolGPA || 0,
        previousSchool: body.previousSchool || '', city: body.city || '',
        documentsComplete: body.documentsComplete || false, interviewDate: body.interviewDate || '',
        notes: body.notes || '',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
