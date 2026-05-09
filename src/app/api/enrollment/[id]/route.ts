import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const f of ['applicantName','jmbg','email','phone','program','studyLevel','status','applicationDate','entranceExamScore','highSchoolGPA','previousSchool','city','documentsComplete','interviewDate','notes']) {
      if (body[f] !== undefined) data[f] = body[f]
    }
    if (typeof data.documentsComplete === 'string') data.documentsComplete = data.documentsComplete === 'true'
    const updated = await db.enrollment.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; await db.enrollment.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
