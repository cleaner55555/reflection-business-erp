import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const f of ['patientName','dateOfBirth','doctor','date','status','medications','diagnosis','notes']) {
      if (body[f] !== undefined) {
        if (f === 'medications' && typeof body[f] !== 'string') data[f] = JSON.stringify(body[f])
        else data[f] = body[f]
      }
    }
    return NextResponse.json(await db.prescription.update({ where: { id }, data }))
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; await db.prescription.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
