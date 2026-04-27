import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const projects = await db.project.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { tasks: { orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, status, startDate, endDate, budget, priority, assignedTo } = body
  if (!name) return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 })

  const project = await db.project.create({
    data: { name, description, status: status || 'aktivan', startDate: startDate ? new Date(startDate) : new Date(), endDate: endDate ? new Date(endDate) : null, budget: Number(budget) || 0, priority: priority || 'srednji', assignedTo },
  })
  return NextResponse.json(project, { status: 201 })
}
