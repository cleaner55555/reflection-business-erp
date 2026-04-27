import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({ where: { id }, include: { tasks: { orderBy: { createdAt: 'asc' } } } })
  if (!project) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try { const p = await db.project.update({ where: { id }, data: body }); return NextResponse.json(p) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try { await db.project.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}
