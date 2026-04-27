import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const employee = await db.employee.findUnique({ where: { id }, include: { partner: true, payrolls: { orderBy: [{ year: 'desc' }, { month: 'desc' }] }, attendances: { orderBy: { date: 'desc' }, take: 30 } } })
  if (!employee) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
  return NextResponse.json(employee)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try { const e = await db.employee.update({ where: { id }, data: body }); return NextResponse.json(e) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try { await db.employee.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}
