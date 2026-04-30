import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const data: any = {}
  if (body.resolution !== undefined) data.resolution = body.resolution
  if (body.priority !== undefined) data.priority = body.priority
  if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo

  if (body.status === 'rešeno') {
    data.status = 'rešeno'
    data.resolvedAt = new Date()
  } else if (body.status === 'odbijeno') {
    data.status = 'odbijeno'
  } else if (body.status === 'u_toku') {
    data.status = 'u_toku'
  }

  try {
    const dispute = await db.mpDispute.update({ where: { id }, data })
    return NextResponse.json(dispute)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
